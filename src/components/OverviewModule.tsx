import React, { useState } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  Zap, 
  Clock, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Sliders, 
  RefreshCw, 
  ShieldCheck, 
  ChevronRight,
  Terminal,
  Activity,
  Server
} from 'lucide-react';
import { RouterMetrics, IntentPolicy, RequestLog, ProviderConfig } from '../types.ts';
import { WaterfallTrace } from './WaterfallTrace.tsx';

interface OverviewModuleProps {
  metrics: RouterMetrics;
  policies: IntentPolicy[];
  logs: RequestLog[];
  providers: ProviderConfig[];
  onTogglePolicy: (policyId: string) => void;
  onOpenPlayground: () => void;
  onRefreshAll: () => void;
}

export const OverviewModule: React.FC<OverviewModuleProps> = ({
  metrics,
  policies,
  logs,
  providers,
  onTogglePolicy,
  onOpenPlayground,
  onRefreshAll
}) => {
  const [selectedTraceLog, setSelectedTraceLog] = useState<RequestLog | null>(logs[0] || null);

  const freePoolPercent = Math.min(
    Math.round((metrics.freePoolTokensUsed / metrics.freePoolTokensTotal) * 100),
    100
  );

  return (
    <div className="space-y-6">
      {/* Top Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f1f1f] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase bg-[#0066ff]/10 text-[#0066ff] px-2 py-0.5 rounded border border-[#0066ff]/30 font-bold">
              NEXUS ROUTER GATEWAY
            </span>
            <span className="text-xs text-[#666666] font-mono">Unified Endpoint &bull; Zero-Downtime Cascade</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight font-sans">Nexus Router</h1>
          <p className="text-xs text-[#888888] mt-0.5">Unified OpenAI-compatible API with automated multi-provider rate-limit failovers &amp; live telemetry</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshAll}
            className="px-3 py-1.5 rounded bg-[#0f0f0f] hover:bg-[#1a1a1a] text-[#888888] hover:text-white border border-[#222222] text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Sync Stats</span>
          </button>
          <button
            onClick={onOpenPlayground}
            className="px-3 py-1.5 rounded bg-[#0066ff] hover:bg-blue-600 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
          >
            <Terminal className="w-3 h-3" />
            <span>Open Test Sandbox</span>
          </button>
        </div>
      </div>

      {/* 3 Critical KPI Cards from Enterprise Spec */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total Input/Output Tokens */}
        <div className="p-4 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-[#888888] uppercase tracking-wider mb-2">
              <span>Total Input / Output Tokens</span>
              <span className="text-emerald-400 font-bold">Free Pool</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-mono">
                {(metrics.freePoolTokensUsed / 1000000).toFixed(1)}M
              </span>
              <span className="text-xs text-[#666666] font-mono">
                / {(metrics.freePoolTokensTotal / 1000000).toFixed(0)}M allocated
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            <div className="w-full bg-[#141414] rounded-full h-1.5 overflow-hidden border border-[#222222]">
              <div 
                style={{ width: `${freePoolPercent}%` }} 
                className="bg-[#0066ff] h-full rounded-full transition-all duration-500"
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-[#666666]">
              <span>In: {(metrics.totalPromptTokens / 1000000).toFixed(1)}M tokens</span>
              <span>Out: {(metrics.totalCompletionTokens / 1000000).toFixed(1)}M tokens</span>
            </div>
          </div>
        </div>

        {/* Card 2: Routing Latency */}
        <div className="p-4 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-[#888888] uppercase tracking-wider mb-2">
              <span>Avg Router Routing Latency</span>
              <span className="text-blue-400 font-bold">Zero-Overhead</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-mono">
                {metrics.routerOverheadMs}ms
              </span>
              <span className="text-xs text-[#666666] font-mono">
                router overhead ({metrics.avgLatencyMs}ms end-to-end)
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-2 border-t border-[#141414] text-[10px] font-mono text-[#666666]">
            <span>Failovers Averted: <strong className="text-emerald-400 font-normal">{metrics.fallbacksAverted}</strong></span>
            <span>Active Nodes: <strong className="text-white font-normal">{providers.filter(p => p.enabled).length}</strong></span>
          </div>
        </div>

        {/* Card 3: Total Cost Saved (ROI) */}
        <div className="p-4 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-[#888888] uppercase tracking-wider mb-2">
              <span>Total Cost Saved (ROI)</span>
              <span className="text-emerald-400 font-bold">100% Free Tiers</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400 font-mono">
                ${metrics.totalCostSavedUsd.toFixed(2)}
              </span>
              <span className="text-xs text-[#888888] font-mono">
                vs OpenAI Base (GPT-4o)
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-2 border-t border-[#141414] text-[10px] font-mono text-[#666666]">
            <span>Billed Expense: <strong className="text-white font-normal">$0.00</strong></span>
            <span>Equivalent API Calls: <strong className="text-white font-normal">{metrics.totalRequests}</strong></span>
          </div>
        </div>
      </div>

      {/* Live Streaming Distributed Trace Component */}
      <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg overflow-hidden">
        <div className="p-3.5 border-b border-[#1f1f1f] flex items-center justify-between bg-[#050505]">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Live Streaming Distributed Trace
            </h2>
          </div>
          <span className="text-[11px] text-[#666666] font-mono">
            OpenTelemetry APM Span Engine
          </span>
        </div>

        <div className="p-4 space-y-4">
          {/* Recent Live Trace Summary as requested in user brief */}
          {selectedTraceLog && (
            <div className="p-3.5 rounded bg-[#000000] border border-[#222222] font-mono text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[#888888]">
                    [{new Date(selectedTraceLog.timestamp).toLocaleTimeString()}]
                  </span>
                  <span className="font-bold text-white">{selectedTraceLog.clientTag}</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    ● SUCCESS ({selectedTraceLog.status})
                  </span>
                </div>
                <span className="text-[#666666] text-[11px]">{selectedTraceLog.durationMs}ms duration</span>
              </div>

              {/* ASCII / Tree View matching prompt design */}
              <div className="text-[11px] text-[#cccccc] space-y-1 pt-1 leading-relaxed">
                <div className="text-blue-400">
                  ├─ 🛰️ Router Gateway Received Payload (0ms overhead)
                </div>
                <div className="text-cyan-400">
                  ├─ 📂 Evaluated Tool Context via Local MCP Server "nexus-core-mcp" (4ms)
                </div>
                {selectedTraceLog.fallbacksTriggered && selectedTraceLog.fallbacksTriggered.length > 0 ? (
                  <>
                    <div className="text-amber-400 font-semibold">
                      ├─ 🚀 Forwarding Call to Groq (Llama-3.1-70b-Free)... HTTP 429 Rate Limit Intercepted (84ms)
                    </div>
                    <div className="text-emerald-400 font-semibold">
                      └─ 🔄 Failover Triggered: Successfully executed via Gemini Flash Free Tier ({selectedTraceLog.durationMs}ms total)
                    </div>
                  </>
                ) : (
                  <div className="text-emerald-400">
                    └─ 🚀 Successfully dispatched to {selectedTraceLog.providerResolved} ({selectedTraceLog.durationMs}ms total)
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cascading OpenTelemetry Waterfall Component */}
          {selectedTraceLog && selectedTraceLog.spans && selectedTraceLog.spans.length > 0 && (
            <div>
              <div className="text-[11px] font-mono text-[#888888] uppercase mb-1.5">
                Detailed Cascading Span Waterfall:
              </div>
              <WaterfallTrace 
                spans={selectedTraceLog.spans} 
                totalDurationMs={selectedTraceLog.durationMs} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
