/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { TargetConfig } from './components/TargetConfig';
import { ScanProgress } from './components/ScanProgress';
import { ScanMetrics } from './components/ScanMetrics';
import { ResultsView } from './components/ResultsView';
import { PortDetailModal } from './components/PortDetailModal';
import { DocumentationModal } from './components/DocumentationModal';
import { PortResult, ScanSummary, TargetDnsInfo } from './types/scanner';
import { getServiceForPort } from './data/commonPorts';
import { AlertCircle, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';

export default function App() {
  // Target & configuration state
  const [target, setTarget] = useState<string>('scanme.nmap.org');
  const [dnsInfo, setDnsInfo] = useState<TargetDnsInfo | null>(null);
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [dnsError, setDnsError] = useState<string | null>(null);

  const [selectedPorts, setSelectedPorts] = useState<number[]>([
    21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 3306, 3389, 5432, 6379, 8080,
  ]);
  const [timeoutMs, setTimeoutMs] = useState<number>(800);
  const [concurrency, setConcurrency] = useState<number>(8);
  const [grabBanner, setGrabBanner] = useState<boolean>(true);

  // Scanning progress state
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [results, setResults] = useState<PortResult[]>([]);
  const [summary, setSummary] = useState<ScanSummary | null>(null);
  const [currentPort, setCurrentPort] = useState<number | undefined>(undefined);
  const [completedPorts, setCompletedPorts] = useState<number>(0);
  const [openCount, setOpenCount] = useState<number>(0);
  const [closedCount, setClosedCount] = useState<number>(0);
  const [filteredCount, setFilteredCount] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [scanError, setScanError] = useState<string | null>(null);

  // Modal & Engine state
  const [selectedPortDetail, setSelectedPortDetail] = useState<PortResult | null>(null);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);
  const [serverOnline, setServerOnline] = useState<boolean>(true);

  // Refs
  const eventSourceRef = useRef<EventSource | null>(null);
  const timerRef = useRef<any>(null);
  const scanStartTimestampRef = useRef<number>(0);

  // Health check on initial load
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then(() => setServerOnline(true))
      .catch(() => setServerOnline(false));
  }, []);

  // Timer while scanning
  useEffect(() => {
    if (isScanning) {
      scanStartTimestampRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedSeconds((Date.now() - scanStartTimestampRef.current) / 1000);
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isScanning]);

  // Clean up EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Handle DNS Resolution
  const handleResolveTarget = async () => {
    if (!target.trim()) return;
    setIsResolving(true);
    setDnsError(null);

    try {
      const res = await fetch('/api/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: target.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setDnsError(data.error || 'Failed to resolve domain');
        setDnsInfo(null);
      } else {
        setDnsInfo(data);
        setDnsError(null);
      }
    } catch (err: any) {
      setDnsError(err.message || 'DNS resolution network request failed');
      setDnsInfo(null);
    } finally {
      setIsResolving(false);
    }
  };

  // Start Real-Time Port Scan
  const handleStartScan = () => {
    if (!target.trim() || selectedPorts.length === 0 || isScanning) return;

    // Reset previous scan state
    setScanError(null);
    setResults([]);
    setSummary(null);
    setCompletedPorts(0);
    setOpenCount(0);
    setClosedCount(0);
    setFilteredCount(0);
    setElapsedSeconds(0);
    setIsScanning(true);

    // Close any previous stream
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const queryParams = new URLSearchParams({
      target: target.trim(),
      ports: selectedPorts.join(','),
      timeout: timeoutMs.toString(),
      concurrency: concurrency.toString(),
      banner: grabBanner ? 'true' : 'false',
    });

    const sseUrl = `/api/scan/stream?${queryParams.toString()}`;
    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    const accumulatedResults: PortResult[] = [];

    es.addEventListener('start', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.ip && (!dnsInfo || dnsInfo.ip !== data.ip)) {
          setDnsInfo({
            host: data.target,
            ip: data.ip,
            resolved: true,
          });
        }
      } catch {
        // ignore
      }
    });

    es.addEventListener('port_result', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        const service = getServiceForPort(data.port);
        const resultItem: PortResult = {
          port: data.port,
          status: data.status,
          latencyMs: data.latencyMs,
          banner: data.banner,
          reason: data.reason,
          service,
          timestamp: Date.now(),
        };

        accumulatedResults.push(resultItem);
        // Keep sorted by port number
        accumulatedResults.sort((a, b) => a.port - b.port);
        setResults([...accumulatedResults]);

        setCurrentPort(data.port);
        setCompletedPorts(data.completedCount);

        // Update counts
        const opens = accumulatedResults.filter((r) => r.status === 'open').length;
        const closeds = accumulatedResults.filter((r) => r.status === 'closed').length;
        const filtereds = accumulatedResults.filter(
          (r) => r.status === 'filtered' || r.status === 'unreachable'
        ).length;
        setOpenCount(opens);
        setClosedCount(closeds);
        setFilteredCount(filtereds);
      } catch (err) {
        console.error('Failed to parse port_result:', err);
      }
    });

    es.addEventListener('complete', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        const avgLat =
          accumulatedResults.length > 0
            ? accumulatedResults.reduce((acc, r) => acc + r.latencyMs, 0) /
              accumulatedResults.length
            : 0;

        setSummary({
          target: data.target,
          ip: data.ip,
          totalScanned: data.totalScanned,
          openCount: data.openCount,
          closedCount: data.closedCount,
          filteredCount: data.filteredCount,
          durationMs: data.durationMs,
          avgLatencyMs: avgLat,
          startedAt: scanStartTimestampRef.current,
          completedAt: Date.now(),
        });
      } catch (err) {
        console.error('Failed to parse complete event:', err);
      } finally {
        es.close();
        setIsScanning(false);
        setCurrentPort(undefined);
      }
    });

    es.addEventListener('scan_error', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        setScanError(data.error || 'Port scan encountered an error');
      } catch {
        setScanError('Scan error received');
      } finally {
        es.close();
        setIsScanning(false);
        setCurrentPort(undefined);
      }
    });

    es.onerror = () => {
      // Fallback: If SSE drops, attempt standard POST scan
      if (accumulatedResults.length === 0) {
        fallbackPostScan();
      } else {
        setIsScanning(false);
        setCurrentPort(undefined);
      }
      es.close();
    };
  };

  // Fallback POST scan in case browser/proxy terminates SSE stream
  const fallbackPostScan = async () => {
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: target.trim(),
          ports: selectedPorts,
          timeout: timeoutMs,
          concurrency,
          banner: grabBanner,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setScanError(data.error || 'Scan failed');
      } else {
        const enhancedResults: PortResult[] = (data.results || []).map((r: any) => ({
          ...r,
          service: getServiceForPort(r.port),
        }));

        setResults(enhancedResults);
        setCompletedPorts(data.totalScanned);
        setOpenCount(data.openCount);
        setClosedCount(data.closedCount);
        setFilteredCount(data.filteredCount);

        const avgLat =
          enhancedResults.length > 0
            ? enhancedResults.reduce((acc, r) => acc + r.latencyMs, 0) / enhancedResults.length
            : 0;

        setSummary({
          target: data.target,
          ip: data.ip,
          totalScanned: data.totalScanned,
          openCount: data.openCount,
          closedCount: data.closedCount,
          filteredCount: data.filteredCount,
          durationMs: data.durationMs,
          avgLatencyMs: avgLat,
          startedAt: scanStartTimestampRef.current,
          completedAt: Date.now(),
        });
      }
    } catch (err: any) {
      setScanError(err.message || 'Network request failed');
    } finally {
      setIsScanning(false);
      setCurrentPort(undefined);
    }
  };

  // Stop / Abort active scan
  const handleStopScan = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setIsScanning(false);
    setCurrentPort(undefined);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Header */}
      <Header
        onOpenDocs={() => setIsDocsOpen(true)}
        serverOnline={serverOnline}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Error Alert if scan or DNS fails */}
        {scanError && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 flex items-start gap-3 text-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-rose-300">Scan Execution Error</h4>
              <p className="text-xs text-rose-200/90 mt-0.5">{scanError}</p>
            </div>
            <button
              onClick={() => setScanError(null)}
              className="text-xs text-rose-400 hover:text-rose-200 cursor-pointer font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 1. Target & Port Range Configuration */}
        <TargetConfig
          target={target}
          onTargetChange={setTarget}
          dnsInfo={dnsInfo}
          onResolveTarget={handleResolveTarget}
          isResolving={isResolving}
          dnsError={dnsError}
          selectedPorts={selectedPorts}
          onSelectedPortsChange={setSelectedPorts}
          timeoutMs={timeoutMs}
          onTimeoutChange={setTimeoutMs}
          concurrency={concurrency}
          onConcurrencyChange={setConcurrency}
          grabBanner={grabBanner}
          onGrabBannerChange={setGrabBanner}
          isScanning={isScanning}
          onStartScan={handleStartScan}
          onStopScan={handleStopScan}
        />

        {/* 2. Real-time Progress (Shown during or after scan) */}
        {(isScanning || results.length > 0) && (
          <ScanProgress
            isScanning={isScanning}
            totalPorts={selectedPorts.length}
            completedPorts={completedPorts}
            openCount={openCount}
            closedCount={closedCount}
            filteredCount={filteredCount}
            currentPort={currentPort}
            target={target}
            elapsedSeconds={elapsedSeconds}
          />
        )}

        {/* 3. Summary Metrics Bar */}
        {(summary || results.length > 0) && (
          <ScanMetrics summary={summary} totalConfigured={selectedPorts.length} />
        )}

        {/* 4. Results View: Filterable Table / Cards */}
        <ResultsView
          results={results}
          summary={summary}
          target={target}
          isScanning={isScanning}
          onSelectPort={(portResult) => setSelectedPortDetail(portResult)}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Network Security Port Scanner</span>
            <span>&bull;</span>
            <span className="text-slate-400">Authorized Educational & Security Auditing Tool</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsDocsOpen(true)}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              Ethics & Legal Scope
            </button>
            <span>&bull;</span>
            <button
              onClick={() => setIsDocsOpen(true)}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              Port Reference
            </button>
          </div>
        </div>
      </footer>

      {/* Deep Inspection Modal for Selected Port */}
      {selectedPortDetail && (
        <PortDetailModal
          result={selectedPortDetail}
          target={target}
          onClose={() => setSelectedPortDetail(null)}
        />
      )}

      {/* Full Documentation & Ethical Guide Modal */}
      <DocumentationModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />
    </div>
  );
}
