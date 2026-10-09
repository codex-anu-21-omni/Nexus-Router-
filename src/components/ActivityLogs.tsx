import React, { useState } from 'react';
import { 
  Activity, 
  Trash2, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Zap, 
  Wrench,
  Search,
  ChevronRight,
  Code2
} from 'lucide-react';
import { RequestLog } from '../types.ts';

interface ActivityLogsProps {
  logs: RequestLog[];
  onRefreshLogs: () => void;
}

export const ActivityLogs: React.FC<ActivityLogsProps> = ({ logs, onRefreshLogs }) => {
  const [selectedLog, setSelectedLog] = useState<RequestLog | null>(null);
  const [filterSearch, setFilterSearch] = useState('');

  const clearLogs = async () => {
    try {
      await fetch('/api/v1/logs/clear', { method: 'POST' });
      onRefreshLogs();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredLogs = logs.filter(l => {
    const q = filterSearch.toLowerCase();
    return (
      l.modelRequested.toLowerCase().includes(q) ||
      l.providerResolved.toLowerCase().includes(q) ||
      (l.fallbacksTriggered && l.fallbacksTriggered.some(f => f.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-md">
              Real-Time Audit &amp; Routing Traces
            </span>
            <span className="text-xs text-gray-400">OpenRouter Observability Protocol</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Gateway Activity Stream</h2>
          <p className="text-sm text-gray-400 mt-1 max-w-2xl">
            Audit every payload entering <code className="text-purple-300">/v1/chat/completions</code>. Inspect Time To First Token (TTFT), token consumption, executed MCP tools, and automatic fallback journeys.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshLogs}
            className="px-3 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-xs text-gray-300 hover:text-white border border-[#30363d] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={clearLogs}
            className="px-3 py-2 rounded-xl bg-[#21262d] hover:bg-rose-500/20 text-xs text-gray-400 hover:text-rose-400 border border-[#30363d] hover:border-rose-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter logs by model, provider or fallback..."
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#161b22] border border-[#30363d] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl bg-[#161b22] border border-[#30363d] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0d1117] border-b border-[#30363d] text-gray-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Model Requested</th>
                <th className="py-3 px-4">Provider Route</th>
                <th className="py-3 px-4">Latency / TTFT</th>
                <th className="py-3 px-4">Tokens</th>
                <th className="py-3 px-4">MCP Tools</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d] font-sans">
              {filteredLogs.map((log) => {
                const hasFallback = log.fallbacksTriggered && log.fallbacksTriggered.length > 0;
                return (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-[#1a202c] transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono text-gray-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>

                    <td className="py-3 px-4">
                      {log.status === 200 ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-mono font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          200 OK
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-400 font-mono font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {log.status}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-white truncate max-w-[180px]">
                      {log.modelRequested}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                          {log.providerResolved}
                        </span>
                        {hasFallback && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold">
                            {log.fallbacksTriggered.length} Fallback
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-gray-300 whitespace-nowrap">
                      {log.durationMs}ms <span className="text-gray-500">({log.ttftMs}ms TTFT)</span>
                    </td>

                    <td className="py-3 px-4 font-mono text-gray-300 whitespace-nowrap">
                      {log.totalTokens} <span className="text-gray-500">({log.promptTokens}+{log.completionTokens})</span>
                    </td>

                    <td className="py-3 px-4">
                      {log.mcpToolCalls && log.mcpToolCalls.length > 0 ? (
                        <span className="flex items-center gap-1 text-blue-400 font-mono text-[11px]">
                          <Wrench className="w-3 h-3" />
                          {log.mcpToolCalls.length} executed
                        </span>
                      ) : (
                        <span className="text-gray-600 font-mono">-</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="text-gray-400 hover:text-white flex items-center justify-end gap-1 font-mono text-[11px]">
                        Inspect <ChevronRight className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredLogs.length === 0 && (
            <div className="p-8 text-center text-gray-500 text-xs">
              No activity logs recorded yet. Send prompts in the Playground or connect Cursor/Cline to see live traffic!
            </div>
          )}
        </div>
      </div>

      {/* Log Detail Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-base">Request Audit Trace Details</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-white text-xs cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d]">
                  <span className="text-gray-500 block text-[10px] uppercase">Request ID</span>
                  <span className="text-white font-mono">{selectedLog.id}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d]">
                  <span className="text-gray-500 block text-[10px] uppercase">Resolved Provider</span>
                  <span className="text-purple-300 font-mono">{selectedLog.providerResolved}</span>
                </div>
              </div>

              {selectedLog.fallbacksTriggered && selectedLog.fallbacksTriggered.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">
                    Failover Events Logged:
                  </span>
                  {selectedLog.fallbacksTriggered.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span>•</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedLog.mcpToolCalls && selectedLog.mcpToolCalls.length > 0 && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-blue-400 block">
                    Executed MCP Tool Invocations:
                  </span>
                  {selectedLog.mcpToolCalls.map((c, i) => (
                    <div key={i} className="p-2 rounded bg-[#0d1117] border border-[#30363d] space-y-1">
                      <div className="font-bold text-white">{c.name}</div>
                      <div className="text-gray-400 text-[11px]">args: {JSON.stringify(c.args)}</div>
                      <div className="text-emerald-300 text-[11px] whitespace-pre-wrap">{c.result}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-1">
                <span className="text-gray-500 text-[10px] uppercase block">Raw Trace Object:</span>
                <pre className="p-3 rounded-xl bg-[#0d1117] text-gray-300 border border-[#30363d] overflow-x-auto max-h-48">
                  {JSON.stringify(selectedLog, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-[#30363d] flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-[#21262d] text-xs text-white hover:bg-[#30363d] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
