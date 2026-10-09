import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  Cpu, 
  Wrench,
  Radio,
  Zap,
  Filter
} from 'lucide-react';
import { RequestLog } from '../types.ts';
import { WaterfallTrace } from './WaterfallTrace.tsx';

interface ApmLogsModuleProps {
  logs: RequestLog[];
  onRefreshLogs: () => void;
}

export const ApmLogsModule: React.FC<ApmLogsModuleProps> = ({ logs, onRefreshLogs }) => {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(logs[0]?.id || null);
  const [filterSearch, setFilterSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | '200' | '429'>('all');

  const filteredLogs = logs.filter(l => {
    const q = filterSearch.toLowerCase();
    const matchesSearch = 
      l.clientTag?.toLowerCase().includes(q) ||
      l.modelRequested.toLowerCase().includes(q) ||
      l.providerResolved.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (statusFilter === '200' && l.status !== 200) return false;
    if (statusFilter === '429' && (!l.fallbacksTriggered || l.fallbacksTriggered.length === 0)) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f1f1f] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase bg-[#141414] text-[#888888] px-2 py-0.5 rounded border border-[#222222]">
              DISTRIBUTED APM OBSERVABILITY
            </span>
            <span className="text-xs text-[#555555]">OpenTelemetry Span Traces</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight font-mono">APM Request Logs &amp; Waterfall Tracing</h1>
        </div>

        <button
          onClick={onRefreshLogs}
          className="px-3 py-1.5 rounded bg-[#0f0f0f] hover:bg-[#1a1a1a] text-[#888888] hover:text-white border border-[#222222] text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Refresh Traces</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-[#555555] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client tag (e.g. Cline-Agent, Cursor), model or provider..."
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-[#0a0a0a] border border-[#1f1f1f] rounded text-xs text-white placeholder-[#555555] font-mono focus:outline-none focus:border-[#0066ff]"
          />
        </div>

        <div className="flex items-center gap-1 font-mono text-xs">
          {(['all', '200', '429'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1.5 rounded border uppercase text-[10px] font-bold cursor-pointer transition-colors ${
                statusFilter === s
                  ? 'bg-[#141414] text-white border-[#333333]'
                  : 'bg-[#0a0a0a] text-[#666666] border-[#1a1a1a] hover:text-white'
              }`}
            >
              {s === 'all' ? 'All Traces' : s === '200' ? '200 OK' : '429 Intercepted'}
            </button>
          ))}
        </div>
      </div>

      {/* Waterfall Tracing Stream */}
      <div className="space-y-3 font-mono text-xs">
        {filteredLogs.map((log) => {
          const isExpanded = expandedLogId === log.id;
          const hasFallback = log.fallbacksTriggered && log.fallbacksTriggered.length > 0;

          return (
            <div 
              key={log.id} 
              className={`bg-[#0a0a0a] border rounded-lg transition-colors overflow-hidden ${
                isExpanded ? 'border-[#333333]' : 'border-[#1f1f1f] hover:border-[#2a2a2a]'
              }`}
            >
              {/* Row Header */}
              <div 
                onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                className="p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-[#0f0f0f]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#555555]">
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-white" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </span>

                  <span className="text-[#777777] text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono">{log.clientTag}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      log.status === 200 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}>
                      {log.status === 200 ? '200 OK' : `${log.status} ERR`}
                    </span>
                    {hasFallback && (
                      <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
                        429 Intercepted
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-[#888888]">
                  <span>Model: <strong className="text-white font-normal">{log.modelRequested}</strong></span>
                  <span>Latency: <strong className="text-white font-normal">{log.durationMs}ms</strong></span>
                  <span>Tokens: <strong className="text-white font-normal">{log.totalTokens}</strong></span>
                  <span className="text-emerald-400">+${log.costSavedVsOpenAi.toFixed(3)} ROI</span>
                </div>
              </div>

              {/* Expanded Waterfall View */}
              {isExpanded && (
                <div className="p-4 border-t border-[#1a1a1a] bg-[#000000] space-y-4">
                  {/* Summary Callouts */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-[#0a0a0a] border border-[#1f1f1f]">
                      <span className="text-[#666666] block text-[9px] uppercase">Resolved Provider</span>
                      <span className="text-white font-semibold">{log.providerResolved}</span>
                    </div>
                    <div className="p-2 rounded bg-[#0a0a0a] border border-[#1f1f1f]">
                      <span className="text-[#666666] block text-[9px] uppercase">Time To First Token</span>
                      <span className="text-white font-semibold">{log.ttftMs}ms</span>
                    </div>
                    <div className="p-2 rounded bg-[#0a0a0a] border border-[#1f1f1f]">
                      <span className="text-[#666666] block text-[9px] uppercase">Prompt / Comp Tokens</span>
                      <span className="text-white font-semibold">{log.promptTokens} / {log.completionTokens}</span>
                    </div>
                    <div className="p-2 rounded bg-[#0a0a0a] border border-[#1f1f1f]">
                      <span className="text-[#666666] block text-[9px] uppercase">Failover Intercepts</span>
                      <span className={hasFallback ? "text-amber-400 font-bold" : "text-[#666666]"}>
                        {hasFallback ? `${log.fallbacksTriggered.length} Caught` : '0 (Direct)'}
                      </span>
                    </div>
                  </div>

                  {/* Fallback Intercept Alert banner if applicable */}
                  {hasFallback && (
                    <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                      <div className="font-bold uppercase text-[10px] text-amber-400">
                        Zero-Downtime Failover Trapped:
                      </div>
                      {log.fallbacksTriggered.map((f, i) => (
                        <div key={i}>• {f}</div>
                      ))}
                    </div>
                  )}

                  {/* OpenTelemetry Cascading Waterfall Component */}
                  {log.spans && log.spans.length > 0 ? (
                    <div>
                      <div className="text-[10px] uppercase text-[#666666] mb-1.5">
                        Cascading Execution Waterfall Timeline:
                      </div>
                      <WaterfallTrace 
                        spans={log.spans} 
                        totalDurationMs={log.durationMs} 
                      />
                    </div>
                  ) : (
                    <div className="p-4 text-center text-[#555555] text-xs">
                      No nested span breakdown available for this trace.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="p-12 text-center text-[#555555] bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg">
            No request traces match your search filter.
          </div>
        )}
      </div>
    </div>
  );
};
