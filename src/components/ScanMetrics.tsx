import React from 'react';
import { ShieldCheck, ShieldX, ShieldAlert, Zap, Timer, Server } from 'lucide-react';
import { ScanSummary } from '../types/scanner';

interface ScanMetricsProps {
  summary: ScanSummary | null;
  totalConfigured: number;
}

export const ScanMetrics: React.FC<ScanMetricsProps> = ({ summary, totalConfigured }) => {
  if (!summary && totalConfigured === 0) return null;

  const openCount = summary?.openCount ?? 0;
  const closedCount = summary?.closedCount ?? 0;
  const filteredCount = summary?.filteredCount ?? 0;
  const total = summary?.totalScanned ?? 0;
  const avgLatency = summary?.avgLatencyMs ? Math.round(summary.avgLatencyMs) : 0;
  const duration = summary ? (summary.durationMs / 1000).toFixed(2) : '0.00';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {/* 1. Open Ports */}
      <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
            Open Ports
          </span>
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-emerald-300">{openCount}</span>
          <span className="text-xs text-slate-400">
            {total > 0 ? `${Math.round((openCount / total) * 100)}%` : '0%'}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 truncate">
          Active listening sockets
        </p>
      </div>

      {/* 2. Closed Ports */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">
            Closed Ports
          </span>
          <ShieldX className="w-4 h-4 text-slate-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-slate-200">{closedCount}</span>
          <span className="text-xs text-slate-400">
            {total > 0 ? `${Math.round((closedCount / total) * 100)}%` : '0%'}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 truncate">
          RST connection refused
        </p>
      </div>

      {/* 3. Filtered / Dropped */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">
            Filtered
          </span>
          <ShieldAlert className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-amber-300">{filteredCount}</span>
          <span className="text-xs text-slate-400">
            {total > 0 ? `${Math.round((filteredCount / total) * 100)}%` : '0%'}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 truncate">
          Firewall dropped / timeout
        </p>
      </div>

      {/* 4. Avg Latency */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider">
            Avg Latency
          </span>
          <Zap className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-cyan-200">{avgLatency}</span>
          <span className="text-xs text-slate-400 font-mono">ms</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 truncate">
          TCP RTT response speed
        </p>
      </div>

      {/* 5. Total Scanned & Duration */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">
            Scan Duration
          </span>
          <Timer className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-slate-100">{duration}</span>
          <span className="text-xs text-slate-400 font-mono">sec</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 truncate font-mono">
          {total} ports probed
        </p>
      </div>
    </div>
  );
};
