import React from 'react';
import { Activity, ShieldCheck, ShieldAlert, ShieldX, Clock, Radio } from 'lucide-react';

interface ScanProgressProps {
  isScanning: boolean;
  totalPorts: number;
  completedPorts: number;
  openCount: number;
  closedCount: number;
  filteredCount: number;
  currentPort?: number;
  target: string;
  elapsedSeconds: number;
}

export const ScanProgress: React.FC<ScanProgressProps> = ({
  isScanning,
  totalPorts,
  completedPorts,
  openCount,
  closedCount,
  filteredCount,
  currentPort,
  target,
  elapsedSeconds,
}) => {
  const percent = totalPorts > 0 ? Math.min(100, Math.round((completedPorts / totalPorts) * 100)) : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            {isScanning ? (
              <Radio className="w-4 h-4 animate-spin text-emerald-400" />
            ) : (
              <Activity className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-100">
                {isScanning ? 'Port Probing in Progress...' : 'Scan Idle / Completed'}
              </span>
              {isScanning && currentPort && (
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                  Testing TCP/{currentPort}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Target: <span className="text-slate-200">{target || 'No target specified'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{elapsedSeconds.toFixed(1)}s</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              {openCount} open
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldX className="w-3.5 h-3.5 text-slate-500" />
              {closedCount} closed
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <ShieldAlert className="w-3.5 h-3.5" />
              {filteredCount} filtered
            </span>
          </div>
        </div>
      </div>

      {/* Progress Track */}
      <div>
        <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isScanning
                ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-sm shadow-emerald-500/50'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono mt-1.5">
          <span>
            Scanned {completedPorts} of {totalPorts} ports
          </span>
          <span className="text-emerald-400 font-semibold">{percent}%</span>
        </div>
      </div>
    </div>
  );
};
