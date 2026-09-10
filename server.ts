import express from "express";
import path from "path";
import net from "net";
import dns from "dns";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to sanitize hostname / IP
function sanitizeTarget(rawTarget: string): string {
  if (!rawTarget) return "";
  let target = rawTarget.trim();
  // Remove protocols if user pasted a URL
  target = target.replace(/^https?:\/\//i, "");
  // Remove paths / query params
  target = target.split("/")[0].split("?")[0].split("#")[0];
  // Remove port if included like scanme.nmap.org:80
  if (target.includes(":") && !target.startsWith("[") && target.split(":").length === 2) {
    target = target.split(":")[0];
  }
  return target;
}

interface PortScanResult {
  port: number;
  status: "open" | "closed" | "filtered" | "unreachable" | "error";
  latencyMs: number;
  banner?: string;
  reason?: string;
}

// Single port probe function
function probePort(
  host: string,
  port: number,
  timeoutMs = 800,
  grabBanner = true
): Promise<PortScanResult> {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new net.Socket();
    let isResolved = false;
    let banner = "";

    const finish = (result: PortScanResult) => {
      if (isResolved) return;
      isResolved = true;
      try {
        socket.removeAllListeners();
        socket.destroy();
      } catch {
        // ignore cleanup error
      }
      resolve(result);
    };

    socket.setTimeout(timeoutMs);

    socket.on("connect", () => {
      const latencyMs = Math.max(1, Date.now() - start);

      if (!grabBanner) {
        finish({ port, status: "open", latencyMs });
        return;
      }

      // Banner grabbing: send probe
      if ([80, 8080, 3000, 5000, 8000, 8443].includes(port)) {
        try {
          const hostHeader = host.includes(':') && !host.startsWith('[') ? `[${host}]` : host;
          socket.write(`HEAD / HTTP/1.1\r\nHost: ${hostHeader}\r\nUser-Agent: PortScanner/1.0\r\nConnection: close\r\n\r\n`);
        } catch {
          // ignore
        }
      } else if (![21, 22, 25, 110, 143].includes(port)) {
        try {
          socket.write("\r\n");
        } catch {
          // ignore
        }
      }

      const bannerTimer = setTimeout(() => {
        finish({
          port,
          status: "open",
          latencyMs,
          banner: banner ? banner.trim().slice(0, 120) : undefined,
        });
      }, 350);

      socket.on("data", (chunk) => {
        banner += chunk.toString("utf8", 0, Math.min(chunk.length, 256));
        clearTimeout(bannerTimer);
        finish({
          port,
          status: "open",
          latencyMs,
          banner: banner.trim().slice(0, 120),
        });
      });
    });

    socket.on("timeout", () => {
      const latencyMs = Date.now() - start;
      finish({
        port,
        status: "filtered",
        latencyMs,
        reason: "Connection timed out (packet dropped or firewall filtered)",
      });
    });

    socket.on("error", (err: any) => {
      const latencyMs = Date.now() - start;
      if (err.code === "ECONNREFUSED") {
        finish({
          port,
          status: "closed",
          latencyMs,
          reason: "Connection refused (RST packet received)",
        });
      } else if (err.code === "EHOSTUNREACH" || err.code === "ENETUNREACH") {
        finish({
          port,
          status: "unreachable",
          latencyMs,
          reason: "Host/Network unreachable",
        });
      } else if (err.code === "ETIMEDOUT") {
        finish({
          port,
          status: "filtered",
          latencyMs,
          reason: "Connection timed out",
        });
      } else {
        finish({
          port,
          status: "closed",
          latencyMs,
          reason: err.code || err.message || "Connection error",
        });
      }
    });

    try {
      socket.connect(port, host);
    } catch (err: any) {
      finish({
        port,
        status: "error",
        latencyMs: 0,
        reason: err.message || "Failed to initialize socket",
      });
    }
  });
}

// API: Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// API: Resolve target DNS
app.post("/api/resolve", async (req, res) => {
  try {
    const rawTarget = req.body.target;
    const target = sanitizeTarget(rawTarget);

    if (!target) {
      return res.status(400).json({ error: "Please provide a valid hostname or IP address" });
    }

    // Check if target is already an IP address
    const isIP = net.isIP(target);
    if (isIP) {
      return res.json({
        host: target,
        ip: target,
        family: isIP === 6 ? "IPv6" : "IPv4",
        resolved: true,
      });
    }

    // Resolve via DNS (prefer IPv4 for broad TCP compatibility)
    try {
      let lookup;
      try {
        lookup = await dns.promises.lookup(target, { family: 4 });
      } catch {
        lookup = await dns.promises.lookup(target);
      }
      return res.json({
        host: target,
        ip: lookup.address,
        family: lookup.family === 6 ? "IPv6" : "IPv4",
        resolved: true,
      });
    } catch (dnsErr: any) {
      return res.status(400).json({
        error: `DNS resolution failed for '${target}': ${dnsErr.code || dnsErr.message || "Unknown error"}`,
        code: dnsErr.code,
      });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// API: SSE Real-time Port Scan Stream
app.get("/api/scan/stream", async (req, res) => {
  const rawTarget = (req.query.target as string) || "";
  const target = sanitizeTarget(rawTarget);
  const rawPorts = (req.query.ports as string) || "";
  const timeoutMs = Math.min(Math.max(parseInt(req.query.timeout as string) || 800, 150), 5000);
  const grabBanner = req.query.banner !== "false";
  const concurrency = Math.min(Math.max(parseInt(req.query.concurrency as string) || 8, 1), 20);

  if (!target) {
    res.status(400).json({ error: "Missing or invalid target" });
    return;
  }

  // Parse ports list
  const portNumbers = rawPorts
    .split(",")
    .map((p) => parseInt(p.trim()))
    .filter((p) => !isNaN(p) && p >= 1 && p <= 65535);

  // Remove duplicates and sort
  const uniquePorts = Array.from(new Set(portNumbers)).sort((a, b) => a - b);

  if (uniquePorts.length === 0) {
    res.status(400).json({ error: "No valid ports specified (1-65535)" });
    return;
  }

  // Cap max ports per scan batch for stability and cloud container compliance
  const MAX_PORTS = 150;
  const portsToScan = uniquePorts.slice(0, MAX_PORTS);

  // Setup SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  let isAborted = false;
  req.on("close", () => {
    isAborted = true;
  });

  const sendEvent = (event: string, data: any) => {
    if (isAborted) return;
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    // 1. Resolve host
    let resolvedIP = target;
    if (!net.isIP(target)) {
      try {
        let lookup;
        try {
          lookup = await dns.promises.lookup(target, { family: 4 });
        } catch {
          lookup = await dns.promises.lookup(target);
        }
        resolvedIP = lookup.address;
      } catch (dnsErr: any) {
        sendEvent("scan_error", {
          error: `DNS resolution failed for '${target}': ${dnsErr.code || dnsErr.message}`,
        });
        res.end();
        return;
      }
    }

    sendEvent("start", {
      target,
      ip: resolvedIP,
      totalPorts: portsToScan.length,
      timeoutMs,
      concurrency,
      startedAt: Date.now(),
    });

    let completedCount = 0;
    let openCount = 0;
    let closedCount = 0;
    let filteredCount = 0;
    const scanStartTime = Date.now();

    // Worker pool for concurrency control
    let currentIndex = 0;

    async function worker() {
      while (currentIndex < portsToScan.length && !isAborted) {
        const port = portsToScan[currentIndex];
        currentIndex++;

        const result = await probePort(resolvedIP, port, timeoutMs, grabBanner);
        if (isAborted) break;

        completedCount++;
        if (result.status === "open") openCount++;
        else if (result.status === "closed") closedCount++;
        else filteredCount++;

        sendEvent("port_result", {
          ...result,
          target,
          ip: resolvedIP,
          completedCount,
          totalPorts: portsToScan.length,
          progress: Math.round((completedCount / portsToScan.length) * 100),
        });
      }
    }

    const workers = Array.from(
      { length: Math.min(concurrency, portsToScan.length) },
      () => worker()
    );
    await Promise.all(workers);

    if (!isAborted) {
      sendEvent("complete", {
        target,
        ip: resolvedIP,
        totalScanned: completedCount,
        openCount,
        closedCount,
        filteredCount,
        durationMs: Date.now() - scanStartTime,
      });
      res.end();
    }
  } catch (err: any) {
    if (!isAborted) {
      sendEvent("scan_error", { error: err.message || "Scan failed unexpectedly" });
      res.end();
    }
  }
});

// API: Batch POST scan fallback
app.post("/api/scan", async (req, res) => {
  try {
    const rawTarget = req.body.target;
    const target = sanitizeTarget(rawTarget);
    const ports = Array.isArray(req.body.ports) ? req.body.ports : [];
    const timeoutMs = Math.min(Math.max(parseInt(req.body.timeout) || 800, 150), 5000);
    const grabBanner = req.body.banner !== false;
    const concurrency = Math.min(Math.max(parseInt(req.body.concurrency) || 8, 1), 20);

    if (!target) {
      return res.status(400).json({ error: "Missing or invalid target" });
    }

    const validPorts = ports
      .map((p: any) => parseInt(p))
      .filter((p: number) => !isNaN(p) && p >= 1 && p <= 65535);

    const uniquePorts = Array.from(new Set(validPorts)).slice(0, 150) as number[];

    if (uniquePorts.length === 0) {
      return res.status(400).json({ error: "No valid ports provided" });
    }

    let resolvedIP = target;
    if (!net.isIP(target)) {
      try {
        let lookup;
        try {
          lookup = await dns.promises.lookup(target, { family: 4 });
        } catch {
          lookup = await dns.promises.lookup(target);
        }
        resolvedIP = lookup.address;
      } catch (dnsErr: any) {
        return res.status(400).json({
          error: `DNS resolution failed for '${target}': ${dnsErr.code || dnsErr.message}`,
        });
      }
    }

    const startTime = Date.now();
    const results: PortScanResult[] = [];
    let currentIndex = 0;

    async function worker() {
      while (currentIndex < uniquePorts.length) {
        const port = uniquePorts[currentIndex++];
        const result = await probePort(resolvedIP, port, timeoutMs, grabBanner);
        results.push(result);
      }
    }

    await Promise.all(
      Array.from({ length: Math.min(concurrency, uniquePorts.length) }, () => worker())
    );

    // Sort results by port number ascending
    results.sort((a, b) => a.port - b.port);

    const openCount = results.filter((r) => r.status === "open").length;
    const closedCount = results.filter((r) => r.status === "closed").length;
    const filteredCount = results.filter((r) => r.status === "filtered" || r.status === "unreachable").length;

    res.json({
      target,
      ip: resolvedIP,
      totalScanned: results.length,
      openCount,
      closedCount,
      filteredCount,
      durationMs: Date.now() - startTime,
      results,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Scan failed" });
  }
});

// Vite middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Port Scanner Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
