import React from 'react';
import {
  X,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Terminal,
  AlertTriangle,
  ExternalLink,
  Check,
  Copy,
  Clock,
  Zap,
} from 'lucide-react';
import { PortResult } from '../types/scanner';

interface PortDetailModalProps {
  result: PortResult | null;
  target: string;
  onClose: () => void;
}

export const PortDetailModal: React.FC<PortDetailModalProps> = ({ result, target, onClose }) => {
  const [copiedCmd, setCopiedCmd] = React.useState<string | null>(null);

  if (!result) return null;

  const service = result.service;
  const isSecurityConcern =
    result.status === 'open' && (service?.riskLevel === 'high' || service?.riskLevel === 'critical');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  // Remediation commands based on port
  const ufwBlockCmd = `sudo ufw deny ${result.port}/tcp`;
  const iptablesBlockCmd = `sudo iptables -A INPUT -p tcp --dport ${result.port} -j DROP`;
  const auditCmd = `sudo ss -tulpn | grep :${result.port}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm border ${
                result.status === 'open'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : result.status === 'closed'
                  ? 'bg-slate-800 border-slate-700 text-slate-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
            >
              {result.port}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-100">
                  {service?.name || `Port ${result.port}`} (TCP)
                </h3>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full uppercase tracking-wider ${
                    result.status === 'open'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                      : result.status === 'closed'
                      ? 'bg-slate-800 text-slate-400 border border-slate-700'
                      : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                  }`}
                >
                  {result.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Target: {target}:{result.port} &bull; RTT: {result.latencyMs}ms
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

        {/* Modal Body */}
        <div className="p-5 space-y-5 text-sm">
          {/* Status Explanation Card */}
          <div
            className={`p-4 rounded-xl border ${
              result.status === 'open'
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                : result.status === 'closed'
                ? 'bg-slate-950 border-slate-800 text-slate-300'
                : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2 font-semibold text-xs mb-1">
              {result.status === 'open' ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : result.status === 'closed' ? (
                <ShieldX className="w-4 h-4 text-slate-400" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              )}
              <span>Socket Assessment:</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-300">
              {result.status === 'open' &&
                `A service is actively listening on TCP port ${result.port} and completed the three-way TCP handshake (SYN -> SYN-ACK -> ACK).`}
              {result.status === 'closed' &&
                `Target host sent an RST (Reset) flag back immediately. The host is reachable, but no process is actively listening on port ${result.port}.`}
              {result.status === 'filtered' &&
                `The connection attempt timed out with no response packet received. A network firewall, security group, or packet filter is likely dropping probes silently.`}
              {result.status === 'unreachable' &&
                `Target network or host reported unreachable (ICMP Destination Unreachable received).`}
            </p>
          </div>

          {/* Banner Grab / Raw Response */}
          {result.banner && (
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                Service Banner Grab
              </h4>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                {result.banner}
              </div>
            </div>
          )}

          {/* Security Risk Advisory */}
          {service && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Service Description
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {service.description}
                </p>
              </div>

              {isSecurityConcern && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200">
                  <div className="flex items-center gap-2 font-semibold text-xs mb-1 text-rose-300">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Security Risk Warning: {service.riskLevel.toUpperCase()}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-rose-200/90">
                    {service.securityImplication}
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Hardening & Remediation Guidance
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {service.recommendation}
                </p>
              </div>

              {/* Quick CLI Commands */}
              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  Administrator Commands
                </h4>
                <div className="space-y-2">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div className="truncate text-slate-300">
                      <span className="text-slate-500 select-none"># Identify listening process: </span>
                      <br className="sm:hidden" />
                      <span>{auditCmd}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(auditCmd, 'audit')}
                      className="p-1 text-slate-400 hover:text-slate-200 ml-2 cursor-pointer"
                      title="Copy command"
                    >
                      {copiedCmd === 'audit' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div className="truncate text-slate-300">
                      <span className="text-slate-500 select-none"># Block with UFW: </span>
                      <br className="sm:hidden" />
                      <span>{ufwBlockCmd}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(ufwBlockCmd, 'ufw')}
                      className="p-1 text-slate-400 hover:text-slate-200 ml-2 cursor-pointer"
                      title="Copy command"
                    >
                      {copiedCmd === 'ufw' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
