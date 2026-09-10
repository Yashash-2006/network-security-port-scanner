import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  AlertTriangle,
  Terminal,
  ExternalLink,
  Layers,
  Lock,
  Server,
  FileText,
} from 'lucide-react';
import { COMMON_PORT_DATABASE } from '../data/commonPorts';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'concepts' | 'states' | 'ports' | 'ethics' | 'defense'>('concepts');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100">
                Network Security Port Scanner Reference & Guide
              </h2>
              <p className="text-xs text-slate-400">
                Foundations of TCP scanning, port states, security auditing, and ethical guidelines
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 overflow-x-auto text-xs font-medium scrollbar-none">
          {[
            { id: 'concepts', label: '1. How Scanners Work', icon: Layers },
            { id: 'states', label: '2. Port States (Open/Closed/Filtered)', icon: Shield },
            { id: 'ports', label: '3. Common Ports & Risks', icon: Server },
            { id: 'ethics', label: '4. Legal & Ethical Rules', icon: AlertTriangle },
            { id: 'defense', label: '5. Defensive Hardening', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'border-emerald-400 text-emerald-300 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* TAB 1: Concepts */}
          {activeTab === 'concepts' && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Network Port Scanning Mechanics
              </h3>
              <p className="text-xs leading-relaxed text-slate-300">
                In computer networking, an IP address identifies a specific host machine, while a <strong>port number (0–65535)</strong> multiplexes multiple independent applications or network services running on that host.
              </p>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  The TCP 3-Way Handshake Probing Model
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  This scanner executes a <strong>Full TCP Connect Probe</strong> using standard operating system network sockets:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-emerald-400 font-bold block mb-1">1. SYN Packet</span>
                    <span>Scanner sends SYN packet to target IP:port requesting socket connection.</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-cyan-400 font-bold block mb-1">2. Response</span>
                    <span>
                      If open: target replies with <strong>SYN-ACK</strong>.<br />
                      If closed: target replies with <strong>RST</strong>.<br />
                      If filtered: target drops packet.
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-emerald-400 font-bold block mb-1">3. Completion & Teardown</span>
                    <span>
                      Scanner acknowledges with ACK to establish connection, probes for service banner, then cleanly terminates socket with FIN/RST.
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                  Banner Grabbing & Version Probing
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When a port reports <strong className="text-emerald-400">OPEN</strong>, the scanner can optionally transmit a minimal protocol greeting (such as an HTTP <code className="text-emerald-300">HEAD / HTTP/1.0</code> request or waiting for an SSH server string like <code className="text-emerald-300">SSH-2.0-OpenSSH_8.9</code>). The returned banner identifies software vendors and version numbers to assist in vulnerability correlation.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: States */}
          {activeTab === 'states' && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Port Status Classification
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every scanned port is classified into one of three primary network states based on the TCP response packets:
              </p>

              <div className="space-y-3">
                {/* OPEN */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-sm text-emerald-300">OPEN</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>What it means:</strong> An application process is actively bound to this port and accepting connections. A full TCP 3-way handshake was established.
                  </p>
                  <p className="text-xs text-slate-400">
                    <strong>Security Risk:</strong> Open ports represent entry vectors. If the listening application possesses unpatched vulnerabilities, default credentials, or lacks authentication, an adversary can exploit it directly.
                  </p>
                </div>

                {/* CLOSED */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <ShieldX className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-sm text-slate-200">CLOSED</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>What it means:</strong> The target host received the probe and sent back an <strong>RST (Reset)</strong> packet. The host is reachable and active, but no service process is currently listening on this port.
                  </p>
                  <p className="text-xs text-slate-400">
                    <strong>Security Risk:</strong> Minimal direct risk, though it confirms to an attacker that the host IP is online and routing traffic.
                  </p>
                </div>

                {/* FILTERED */}
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/40 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-sm text-amber-300">FILTERED / TIMED OUT</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>What it means:</strong> The probe packet never elicited any response before the timeout deadline (or an ICMP &ldquo;Destination Unreachable&rdquo; was received). A stateful firewall (such as iptables, pfSense, or AWS Security Groups) dropped the packet without sending an RST.
                  </p>
                  <p className="text-xs text-slate-400">
                    <strong>Security Risk:</strong> Filtered is often the ideal defensive posture for administrative or internal-only services, as it gives attackers zero visibility into whether the port is open or closed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Common Ports Directory */}
          {activeTab === 'ports' && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                Standard Port Directory & Exposure Risks
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Standard services and their primary cybersecurity considerations:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    port: 21,
                    service: 'FTP',
                    risk: 'HIGH',
                    desc: 'Cleartext file transfer. Credentials sent in plaintext over the wire.',
                  },
                  {
                    port: 22,
                    service: 'SSH',
                    risk: 'MEDIUM',
                    desc: 'Encrypted management. Secure when configured with public keys, but target of brute-forcing.',
                  },
                  {
                    port: 23,
                    service: 'Telnet',
                    risk: 'CRITICAL',
                    desc: 'Legacy cleartext remote terminal. All keystrokes and passwords can be captured.',
                  },
                  {
                    port: 80,
                    service: 'HTTP',
                    risk: 'MEDIUM',
                    desc: 'Unencrypted web traffic. Susceptible to session hijacking and credential eavesdropping.',
                  },
                  {
                    port: 443,
                    service: 'HTTPS',
                    risk: 'LOW',
                    desc: 'Encrypted web traffic. Recommended default for all public web interfaces.',
                  },
                  {
                    port: 445,
                    service: 'SMB',
                    risk: 'CRITICAL',
                    desc: 'Windows file sharing. Major target for lateral ransomware spread (e.g. EternalBlue).',
                  },
                  {
                    port: 3306,
                    service: 'MySQL',
                    risk: 'CRITICAL',
                    desc: 'Relational database. Exposing directly to WAN invites brute-force and data exfiltration.',
                  },
                  {
                    port: 3389,
                    service: 'RDP',
                    risk: 'CRITICAL',
                    desc: 'Windows Remote Desktop. Vulnerable to credential stuffing and BlueKeep exploits.',
                  },
                  {
                    port: 5432,
                    service: 'PostgreSQL',
                    risk: 'CRITICAL',
                    desc: 'Database port. Should only be accessible from trusted application servers.',
                  },
                  {
                    port: 6379,
                    service: 'Redis',
                    risk: 'CRITICAL',
                    desc: 'In-memory cache. Defaults to no authentication; attackers can execute arbitrary code.',
                  },
                ].map((item) => (
                  <div key={item.port} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-slate-100">
                        Port {item.port} ({item.service})
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          item.risk === 'CRITICAL'
                            ? 'bg-rose-950 text-rose-400 border border-rose-500/30'
                            : item.risk === 'HIGH'
                            ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                            : item.risk === 'MEDIUM'
                            ? 'bg-sky-950 text-sky-400 border border-sky-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.risk}
                      </span>
                    </div>
                    <p className="text-slate-400 leading-relaxed text-[11px]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Ethics & Legal */}
          {activeTab === 'ethics' && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Legal Framework & Ethical Scanning Standards
              </h3>

              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs space-y-2">
                <h4 className="font-bold text-amber-300">Mandatory Authorization Requirement</h4>
                <p className="leading-relaxed text-amber-200/90">
                  Port scanning sends real network traffic to remote servers. Scanning systems without explicit written permission from the owner can be interpreted as unauthorized access attempt under statutes such as the <strong>U.S. Computer Fraud and Abuse Act (CFAA)</strong>, the <strong>UK Computer Misuse Act</strong>, and international cyber legislation.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider">
                  Rules of Engagement for Security Auditing
                </h4>
                <ul className="space-y-2 text-slate-300 list-disc list-inside">
                  <li>
                    <strong>Only scan systems you own</strong> or have received explicit, written permission to test (e.g., within an authorized bug bounty scope).
                  </li>
                  <li>
                    <strong>Use Authorized Test Servers:</strong> The Nmap project provides{' '}
                    <code className="bg-slate-900 px-1 py-0.5 rounded text-emerald-300 font-mono">
                      scanme.nmap.org
                    </code>{' '}
                    explicitly for learning how to use port scanners without causing alarm.
                  </li>
                  <li>
                    <strong>Observe Rate Limits:</strong> Aggressive, high-speed port scanning can degrade service performance, trigger automatic IDS/IPS IP bans, or exhaust connection tables.
                  </li>
                  <li>
                    <strong>Respect Cloud Provider Policies:</strong> Cloud platforms (AWS, GCP, Azure) enforce Acceptable Use Policies regarding scanning between virtual machines.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 5: Defensive Hardening */}
          {activeTab === 'defense' && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                Defensive Port Hardening & Remediation
              </h3>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-emerald-400">1. Principle of Least Privilege & Service Binding</h4>
                  <p className="text-slate-300 leading-relaxed">
                    By default, ensure internal backend databases (Redis, PostgreSQL, MySQL) are bound to the loopback interface (<code className="text-emerald-300 font-mono">127.0.0.1</code>) rather than <code className="text-emerald-300 font-mono">0.0.0.0</code>.
                  </p>
                  <pre className="bg-slate-900 p-2.5 rounded text-[11px] font-mono text-slate-300 overflow-x-auto">
                    # postgresql.conf{"\n"}listen_addresses = &apos;localhost&apos;{"\n\n"}# redis.conf{"\n"}bind 127.0.0.1
                  </pre>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-emerald-400">2. Firewall Configuration (UFW / iptables)</h4>
                  <p className="text-slate-300 leading-relaxed">
                    Enforce default-deny ingress policy on border firewalls:
                  </p>
                  <pre className="bg-slate-900 p-2.5 rounded text-[11px] font-mono text-slate-300 overflow-x-auto">
                    sudo ufw default deny incoming{"\n"}sudo ufw default allow outgoing{"\n"}sudo ufw allow 22/tcp comment &apos;SSH&apos;{"\n"}sudo ufw allow 443/tcp comment &apos;HTTPS&apos;{"\n"}sudo ufw enable
                  </pre>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-emerald-400">3. Intrusion Prevention & Rate Limiting</h4>
                  <p className="text-slate-300 leading-relaxed">
                    Deploy tools like <strong>Fail2ban</strong> or <strong>CrowdSec</strong> to automatically detect port scanning patterns and ban offending IP addresses before exploitation occurs.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-between items-center text-xs">
          <span className="text-slate-500">Network Security Port Scanner v1.0</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
