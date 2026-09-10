import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Clock,
  Terminal,
  AlertTriangle,
  FileSpreadsheet,
  FileCode,
  LayoutGrid,
  List,
} from 'lucide-react';
import { PortResult, PortStatus, ScanSummary } from '../types/scanner';

interface ResultsViewProps {
  results: PortResult[];
  summary: ScanSummary | null;
  target: string;
  isScanning: boolean;
  onSelectPort: (result: PortResult) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  results,
  summary,
  target,
  isScanning,
  onSelectPort,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed' | 'filtered'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [copied, setCopied] = useState(false);

  // Filtered list
  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const portMatch = item.port.toString().includes(q);
      const nameMatch = item.service?.name.toLowerCase().includes(q);
      const descMatch = item.service?.description.toLowerCase().includes(q);
      const bannerMatch = item.banner?.toLowerCase().includes(q);

      return portMatch || nameMatch || descMatch || bannerMatch;
    });
  }, [results, statusFilter, searchQuery]);

  const openCount = results.filter((r) => r.status === 'open').length;
  const closedCount = results.filter((r) => r.status === 'closed').length;
  const filteredCount = results.filter((r) => r.status === 'filtered' || r.status === 'unreachable').length;

  // Export JSON
  const handleExportJSON = () => {
    const data = {
      target,
      ip: summary?.ip || target,
      timestamp: new Date().toISOString(),
      summary: summary || {
        totalScanned: results.length,
        openCount,
        closedCount,
        filteredCount,
      },
      results,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `port-scan-${target}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Port', 'Protocol', 'Status', 'Service', 'Risk Level', 'Latency (ms)', 'Banner', 'Reason'];
    const rows = results.map((r) => [
      r.port,
      'TCP',
      r.status,
      `"${r.service?.name || ''}"`,
      r.service?.riskLevel || 'unknown',
      r.latencyMs,
      `"${(r.banner || '').replace(/"/g, '""')}"`,
      `"${(r.reason || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `port-scan-${target}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy Summary to Clipboard
  const handleCopySummary = () => {
    const openPortsList = results
      .filter((r) => r.status === 'open')
      .map((r) => `  - Port ${r.port}/TCP: ${r.service?.name || 'Unknown'} (${r.latencyMs}ms)${r.banner ? ` [${r.banner}]` : ''}`)
      .join('\n');

    const text = `=== PORT SCAN REPORT ===
Target: ${target} (${summary?.ip || 'N/A'})
Scanned: ${results.length} ports
Status: ${openCount} Open, ${closedCount} Closed, ${filteredCount} Filtered
Duration: ${summary ? (summary.durationMs / 1000).toFixed(2) + 's' : 'N/A'}

OPEN PORTS:
${openPortsList || '  (None detected)'}
`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
      {/* Action and Filter Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search port number, service, or keyword..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg border transition cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-800 border-slate-600 text-slate-100'
                : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({results.length})
          </button>
          <button
            onClick={() => setStatusFilter('open')}
            className={`px-3 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'open'
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/30'
                : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-emerald-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Open ({openCount})
          </button>
          <button
            onClick={() => setStatusFilter('closed')}
            className={`px-3 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'closed'
                ? 'bg-slate-800 border-slate-600 text-slate-200'
                : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            Closed ({closedCount})
          </button>
          <button
            onClick={() => setStatusFilter('filtered')}
            className={`px-3 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'filtered'
                ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-amber-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Filtered ({filteredCount})
          </button>
        </div>

        {/* View Switcher & Export buttons */}
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('table')}
              title="Table view"
              className={`p-1 rounded cursor-pointer ${
                viewMode === 'table' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              title="Card view"
              className={`p-1 rounded cursor-pointer ${
                viewMode === 'cards' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleCopySummary}
            disabled={results.length === 0}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition cursor-pointer disabled:opacity-40"
            title="Copy report to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleExportCSV}
            disabled={results.length === 0}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition cursor-pointer disabled:opacity-40"
            title="Export CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            disabled={results.length === 0}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition cursor-pointer disabled:opacity-40"
            title="Export JSON"
          >
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">JSON</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {results.length === 0 && !isScanning && (
        <div className="py-16 text-center text-slate-400 space-y-2">
          <Terminal className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-200">No Port Results Yet</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Configure a target host above and select your desired ports, then click &ldquo;Start Port Scan&rdquo; to initiate TCP connection probing.
          </p>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && results.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono">
                <th className="py-3 px-4">Port</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4">Banner / Response</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredResults.map((item) => {
                const service = item.service;
                const isOpen = item.status === 'open';
                const isClosed = item.status === 'closed';
                const isFiltered = item.status === 'filtered';

                return (
                  <tr
                    key={item.port}
                    onClick={() => onSelectPort(item)}
                    className="hover:bg-slate-800/40 transition cursor-pointer group"
                  >
                    {/* Port & Protocol */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100">{item.port}</span>
                        <span className="text-[10px] text-slate-500">TCP</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                          isOpen
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                            : isClosed
                            ? 'bg-slate-800/80 text-slate-400 border border-slate-700'
                            : 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isOpen ? 'bg-emerald-400' : isClosed ? 'bg-slate-400' : 'bg-amber-400'
                          }`}
                        />
                        {item.status}
                      </span>
                    </td>

                    {/* Service Name & Category */}
                    <td className="py-3 px-4 font-sans">
                      <div className="font-medium text-slate-200">
                        {service?.name || `Port ${item.port}`}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {service?.category || 'Standard'}
                      </div>
                    </td>

                    {/* Risk Level Badge */}
                    <td className="py-3 px-4 font-sans">
                      {service?.riskLevel && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
                            service.riskLevel === 'critical'
                              ? 'bg-rose-950/80 text-rose-400 border border-rose-500/40'
                              : service.riskLevel === 'high'
                              ? 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
                              : service.riskLevel === 'medium'
                              ? 'bg-sky-950/80 text-sky-400 border border-sky-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {service.riskLevel === 'critical' || service.riskLevel === 'high' ? (
                            <AlertTriangle className="w-3 h-3" />
                          ) : null}
                          {service.riskLevel}
                        </span>
                      )}
                    </td>

                    {/* Latency */}
                    <td className="py-3 px-4">
                      <span className="text-slate-300 font-mono">{item.latencyMs} ms</span>
                    </td>

                    {/* Banner */}
                    <td className="py-3 px-4 max-w-xs truncate">
                      {item.banner ? (
                        <span className="text-emerald-400 font-mono text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {item.banner}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px] italic">
                          {item.reason || 'No banner'}
                        </span>
                      )}
                    </td>

                    {/* Inspect button */}
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPort(item);
                        }}
                        className="px-2 py-1 rounded bg-slate-800 group-hover:bg-slate-700 text-slate-300 text-[11px] font-sans transition cursor-pointer"
                      >
                        Inspect &rarr;
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Cards View */}
      {viewMode === 'cards' && results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredResults.map((item) => {
            const service = item.service;
            const isOpen = item.status === 'open';

            return (
              <div
                key={item.port}
                onClick={() => onSelectPort(item)}
                className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                  isOpen
                    ? 'bg-slate-950 border-emerald-500/40 hover:border-emerald-400/80 ring-1 ring-emerald-500/20'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-bold text-slate-100">
                        {item.port}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 px-1 rounded bg-slate-900 border border-slate-800">
                        TCP
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full uppercase ${
                        isOpen
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                          : item.status === 'closed'
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-200 mb-1">
                    {service?.name || `Port ${item.port}`}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">
                    {service?.description || 'Standard TCP port service'}
                  </p>
                </div>

                <div className="border-t border-slate-850 pt-2.5 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">{item.latencyMs} ms RTT</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPort(item);
                    }}
                    className="text-emerald-400 hover:text-emerald-300 font-sans cursor-pointer text-xs"
                  >
                    View Details &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No matching search results */}
      {filteredResults.length === 0 && results.length > 0 && (
        <div className="py-8 text-center text-xs text-slate-400">
          No port results matched your current search or status filters.
        </div>
      )}
    </div>
  );
};
