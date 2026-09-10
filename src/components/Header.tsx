import React from 'react';
import { Shield, BookOpen, Activity, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  onOpenDocs: () => void;
  serverOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenDocs, serverOnline }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-500/10">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-semibold text-slate-100 tracking-tight">
                Network Security Port Scanner
              </h1>
              <span className="px-2 py-0.5 text-xs font-mono font-medium rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                TCP Probe
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Real-time socket connection probing, status classification & security risk auditing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                serverOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="text-slate-400">Engine:</span>
            <span className={serverOnline ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
              {serverOnline ? 'Node.js Socket Active' : 'Connecting...'}
            </span>
          </div>

          <button
            id="open-docs-btn"
            onClick={onOpenDocs}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-medium transition cursor-pointer"
            title="Read security documentation & ethical scanning guidelines"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Docs & Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
};
