import React, { useState, useEffect } from 'react';
import {
  Globe,
  Sliders,
  Play,
  Square,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
  Info,
  Server,
  Zap,
} from 'lucide-react';
import { PortSelectionMode, TargetDnsInfo, PortPreset } from '../types/scanner';
import { PORT_PRESETS } from '../data/commonPorts';

interface TargetConfigProps {
  target: string;
  onTargetChange: (target: string) => void;
  dnsInfo: TargetDnsInfo | null;
  onResolveTarget: () => void;
  isResolving: boolean;
  dnsError: string | null;
  selectedPorts: number[];
  onSelectedPortsChange: (ports: number[]) => void;
  timeoutMs: number;
  onTimeoutChange: (timeout: number) => void;
  concurrency: number;
  onConcurrencyChange: (concurrency: number) => void;
  grabBanner: boolean;
  onGrabBannerChange: (grab: boolean) => void;
  isScanning: boolean;
  onStartScan: () => void;
  onStopScan: () => void;
}

export const TargetConfig: React.FC<TargetConfigProps> = ({
  target,
  onTargetChange,
  dnsInfo,
  onResolveTarget,
  isResolving,
  dnsError,
  selectedPorts,
  onSelectedPortsChange,
  timeoutMs,
  onTimeoutChange,
  concurrency,
  onConcurrencyChange,
  grabBanner,
  onGrabBannerChange,
  isScanning,
  onStartScan,
  onStopScan,
}) => {
  const [mode, setMode] = useState<PortSelectionMode>('presets');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('top-15');
  const [rangeStart, setRangeStart] = useState<number>(20);
  const [rangeEnd, setRangeEnd] = useState<number>(85);
  const [customInput, setCustomInput] = useState<string>('21, 22, 80, 443, 3000, 3306, 5432, 6379, 8080');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [inputError, setInputError] = useState<string | null>(null);

  // Quick targets
  const QUICK_TARGETS = [
    { label: 'scanme.nmap.org', host: 'scanme.nmap.org', note: 'Nmap Authorized Test Server' },
    { label: 'localhost', host: 'localhost', note: 'Local Container Services' },
    { label: 'portquiz.net', host: 'portquiz.net', note: 'Public Port Testing Host' },
  ];

  // Update selected ports whenever mode or parameters change
  useEffect(() => {
    setInputError(null);
    if (mode === 'presets') {
      const preset = PORT_PRESETS.find((p) => p.id === selectedPresetId);
      if (preset) {
        onSelectedPortsChange(preset.ports);
      }
    } else if (mode === 'range') {
      const start = Math.max(1, Math.min(rangeStart, 65535));
      const end = Math.max(1, Math.min(rangeEnd, 65535));

      if (start > end) {
        setInputError('Start port cannot be greater than end port');
        onSelectedPortsChange([]);
        return;
      }

      const count = end - start + 1;
      if (count > 150) {
        setInputError(`Selected range (${count} ports) exceeds the safe batch limit of 150 ports`);
        onSelectedPortsChange([]);
        return;
      }

      const ports: number[] = [];
      for (let p = start; p <= end; p++) {
        ports.push(p);
      }
      onSelectedPortsChange(ports);
    } else if (mode === 'custom') {
      const parsed = customInput
        .split(/[,\s]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((s) => parseInt(s, 10));

      const invalid = parsed.filter((p) => isNaN(p) || p < 1 || p > 65535);
      if (invalid.length > 0) {
        setInputError('Invalid port values. Ports must be numbers between 1 and 65535');
        onSelectedPortsChange([]);
        return;
      }

      const unique = Array.from(new Set<number>(parsed)).sort((a: number, b: number) => a - b);
      if (unique.length > 150) {
        setInputError(`Custom list contains ${unique.length} ports (max 150 allowed per scan)`);
        onSelectedPortsChange([]);
        return;
      }

      onSelectedPortsChange(unique);
    }
  }, [mode, selectedPresetId, rangeStart, rangeEnd, customInput]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
      {/* Target Input Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="target-input" className="text-sm font-medium text-slate-200 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Target Host or IP Address</span>
          </label>
          <span className="text-xs text-slate-400">DNS & IPv4/IPv6 supported</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              id="target-input"
              type="text"
              value={target}
              onChange={(e) => onTargetChange(e.target.value)}
              placeholder="e.g. scanme.nmap.org or 127.0.0.1"
              disabled={isScanning}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition font-mono disabled:opacity-50"
            />
          </div>

          <button
            id="resolve-target-btn"
            type="button"
            onClick={onResolveTarget}
            disabled={isScanning || isResolving || !target.trim()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium transition disabled:opacity-40 cursor-pointer whitespace-nowrap"
            title="Perform DNS resolution for target"
          >
            {isResolving ? (
              <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4 text-emerald-400" />
            )}
            <span>Resolve DNS</span>
          </button>
        </div>

        {/* Quick Target Presets */}
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Authorized Test Targets:
          </span>
          {QUICK_TARGETS.map((t) => (
            <button
              key={t.host}
              type="button"
              onClick={() => onTargetChange(t.host)}
              disabled={isScanning}
              className={`px-2.5 py-1 rounded-lg border font-mono text-xs transition cursor-pointer ${
                target === t.host
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
              }`}
              title={t.note}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* DNS status banner */}
        {dnsInfo && dnsInfo.resolved && !dnsError && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Target resolved: <strong className="font-mono text-emerald-200">{dnsInfo.host}</strong> &rarr;{' '}
                <span className="font-mono bg-emerald-900/60 px-1.5 py-0.5 rounded text-emerald-100">
                  {dnsInfo.ip}
                </span>{' '}
                ({dnsInfo.family || 'IPv4'})
              </span>
            </div>
            <span className="text-emerald-400/80 font-mono hidden sm:inline">Ready to probe</span>
          </div>
        )}

        {dnsError && (
          <div className="mt-3 p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-start gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Target Resolution Warning: </span>
              <span>{dnsError}</span>
            </div>
          </div>
        )}
      </div>

      {/* Port Range & Selection Mode */}
      <div className="border-t border-slate-800 pt-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-medium text-slate-200">Port Range Selection</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {selectedPorts.length} port{selectedPorts.length !== 1 ? 's' : ''} queued
          </span>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-950 border border-slate-800 mb-4 text-xs font-medium">
          <button
            type="button"
            onClick={() => setMode('presets')}
            disabled={isScanning}
            className={`py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'presets'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Service Presets</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('range')}
            disabled={isScanning}
            className={`py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'range'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Numeric Range</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('custom')}
            disabled={isScanning}
            className={`py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'custom'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Custom List</span>
          </button>
        </div>

        {/* Mode 1: Presets */}
        {mode === 'presets' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {PORT_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  disabled={isScanning}
                  onClick={() => setSelectedPresetId(preset.id)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-950/20 border-emerald-500/50 text-slate-100 ring-1 ring-emerald-500/40'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-100">{preset.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {preset.ports.length} ports
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
                      {preset.description}
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400/90 truncate">
                    Ports: {preset.ports.slice(0, 6).join(', ')}
                    {preset.ports.length > 6 ? '...' : ''}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Mode 2: Range */}
        {mode === 'range' && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Start Port (1 - 65535)
                </label>
                <input
                  type="number"
                  min="1"
                  max="65535"
                  value={rangeStart}
                  disabled={isScanning}
                  onChange={(e) => setRangeStart(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  End Port (1 - 65535)
                </label>
                <input
                  type="number"
                  min="1"
                  max="65535"
                  value={rangeEnd}
                  disabled={isScanning}
                  onChange={(e) => setRangeEnd(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>
                Span:{' '}
                <strong className="text-slate-200 font-mono">
                  {Math.max(0, rangeEnd - rangeStart + 1)}
                </strong>{' '}
                ports (Safe limit: max 150 ports per scan)
              </span>
              <div className="flex gap-1.5">
                {[
                  { label: '1 - 50', s: 1, e: 50 },
                  { label: '20 - 100', s: 20, e: 100 },
                  { label: '1 - 100', s: 1, e: 100 },
                ].map((quick) => (
                  <button
                    key={quick.label}
                    type="button"
                    disabled={isScanning}
                    onClick={() => {
                      setRangeStart(quick.s);
                      setRangeEnd(quick.e);
                    }}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 transition cursor-pointer"
                  >
                    {quick.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mode 3: Custom List */}
        {mode === 'custom' && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Comma-separated Port Numbers
            </label>
            <input
              type="text"
              value={customInput}
              disabled={isScanning}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. 21, 22, 80, 443, 3000, 8080"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-slate-400">
              Enter specific ports of interest. Duplicate values will automatically be de-duplicated and sorted.
            </p>
          </div>
        )}

        {inputError && (
          <div className="mt-2.5 p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{inputError}</span>
          </div>
        )}
      </div>

      {/* Advanced Settings Accordion */}
      <div className="border-t border-slate-800 pt-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          <span>{showAdvanced ? 'Hide Advanced Socket Parameters' : 'Adjust Socket Timeout & Concurrency'}</span>
          <span className="text-[10px] font-mono text-slate-500">
            ({timeoutMs}ms timeout &bull; {concurrency} parallel sockets &bull; {grabBanner ? 'Banner probe on' : 'Banner off'})
          </span>
        </button>

        {showAdvanced && (
          <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 font-medium">Socket Timeout</span>
                <span className="font-mono text-emerald-400">{timeoutMs} ms</span>
              </div>
              <input
                type="range"
                min="200"
                max="3000"
                step="100"
                value={timeoutMs}
                disabled={isScanning}
                onChange={(e) => onTimeoutChange(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">
                Lower = faster scan; Higher = better on high-latency WAN
              </span>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 font-medium">Parallel Concurrency</span>
                <span className="font-mono text-emerald-400">{concurrency} sockets</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={concurrency}
                disabled={isScanning}
                onChange={(e) => onConcurrencyChange(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">
                Concurrent TCP handshakes simultaneously probed
              </span>
            </div>

            <div>
              <span className="block text-slate-300 font-medium mb-1">Banner Grabbing</span>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={grabBanner}
                  disabled={isScanning}
                  onChange={(e) => onGrabBannerChange(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer w-4 h-4"
                />
                <span className="text-slate-300 text-xs">Probe service version / banners</span>
              </label>
              <span className="text-[10px] text-slate-500 block mt-1">
                Collects HTTP headers, SSH/FTP greetings on open ports
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Primary Action Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
        {!isScanning ? (
          <button
            id="start-scan-btn"
            type="button"
            onClick={onStartScan}
            disabled={!target.trim() || selectedPorts.length === 0 || !!inputError}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:shadow-none cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>
              Start Port Scan ({selectedPorts.length} Port{selectedPorts.length !== 1 ? 's' : ''})
            </span>
          </button>
        ) : (
          <button
            id="stop-scan-btn"
            type="button"
            onClick={onStopScan}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 cursor-pointer animate-pulse"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Abort Active Scan</span>
          </button>
        )}
      </div>
    </div>
  );
};
