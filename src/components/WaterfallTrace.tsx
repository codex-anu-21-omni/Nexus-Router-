import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ChevronRight, 
  ChevronDown, 
  Zap, 
  Server, 
  Radio, 
  Cpu,
  Layers,
  Wrench,
  Terminal
} from 'lucide-react';
import { TraceSpan } from '../types.ts';

interface WaterfallTraceProps {
  spans: TraceSpan[];
  totalDurationMs: number;
}

export const WaterfallTrace: React.FC<WaterfallTraceProps> = ({ spans, totalDurationMs }) => {
  const [expandedSpanId, setExpandedSpanId] = useState<string | null>(null);

  const durationMax = Math.max(totalDurationMs, 100);

  const getCategoryIcon = (category: TraceSpan['category'], status: TraceSpan['status']) => {
    if (status === 'intercepted') return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    if (status === 'error') return <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />;

    switch (category) {
      case 'gateway': return <Radio className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
      case 'mcp': return <Wrench className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
      case 'provider': return <Cpu className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
      case 'failover': return <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'client': return <Server className="w-3.5 h-3.5 text-gray-300 shrink-0" />;
      default: return <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />;
    }
  };

  const getBarColor = (category: TraceSpan['category'], status: TraceSpan['status']) => {
    if (status === 'intercepted') return 'bg-amber-500/80 border-amber-400 shadow-sm shadow-amber-500/20';
    if (status === 'error') return 'bg-rose-500/80 border-rose-400 shadow-sm shadow-rose-500/20';

    switch (category) {
      case 'gateway': return 'bg-[#0066ff] border-blue-400';
      case 'mcp': return 'bg-cyan-500 border-cyan-300';
      case 'provider': return 'bg-[#7c3aed] border-purple-400';
      case 'failover': return 'bg-emerald-500 border-emerald-300';
      case 'client': return 'bg-gray-400 border-gray-300';
      default: return 'bg-blue-500 border-blue-300';
    }
  };

  return (
    <div className="bg-[#000000] border border-[#1f1f1f] rounded-lg p-4 font-mono text-xs select-none">
      {/* Timeline Header */}
      <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-2 mb-3 text-[10px] text-[#888888] uppercase tracking-wider">
        <div className="w-1/2">Execution Span / Operation</div>
        <div className="w-1/2 flex justify-between pl-4 font-mono">
          <span>0ms</span>
          <span>{Math.round(durationMax * 0.25)}ms</span>
          <span>{Math.round(durationMax * 0.5)}ms</span>
          <span>{Math.round(durationMax * 0.75)}ms</span>
          <span>{durationMax}ms</span>
        </div>
      </div>

      {/* Cascading Spans */}
      <div className="space-y-2">
        {spans.map((span, index) => {
          const isExpanded = expandedSpanId === span.id;
          const leftPercent = Math.min(Math.max((span.startMs / durationMax) * 100, 0), 96);
          const widthPercent = Math.max((span.durationMs / durationMax) * 100, 2.5);

          return (
            <div key={span.id} className="group">
              <div 
                onClick={() => setExpandedSpanId(isExpanded ? null : span.id)}
                className={`flex items-center justify-between py-1 px-2 rounded hover:bg-[#0a0a0a] transition-colors cursor-pointer border ${
                  isExpanded ? 'border-[#333333] bg-[#0a0a0a]' : 'border-transparent'
                }`}
              >
                {/* Left: Span Name & Category */}
                <div className="w-1/2 flex items-center gap-2 pr-3 truncate">
                  <span className="text-[#666666] text-[10px] w-4 text-right">{index + 1}</span>
                  {getCategoryIcon(span.category, span.status)}
                  <span className={`truncate text-xs ${
                    span.status === 'intercepted' 
                      ? 'text-amber-300 font-semibold' 
                      : span.status === 'error'
                      ? 'text-rose-400 font-semibold'
                      : 'text-white'
                  }`}>
                    {span.name}
                  </span>
                  <span className="text-[#666666] text-[10px] shrink-0 font-sans">
                    ({span.durationMs}ms)
                  </span>
                </div>

                {/* Right: Waterfall Bar in Relative Timeline */}
                <div className="w-1/2 h-5 bg-[#0a0a0a] rounded border border-[#1a1a1a] relative flex items-center overflow-hidden">
                  {/* Subtle Grid Guidelines */}
                  <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20">
                    <div className="border-r border-[#333333] h-full w-1/4"></div>
                    <div className="border-r border-[#333333] h-full w-1/4"></div>
                    <div className="border-r border-[#333333] h-full w-1/4"></div>
                  </div>

                  {/* Horizontal Bar */}
                  <div
                    style={{
                      marginLeft: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                    className={`h-3 rounded-xs border text-[9px] flex items-center justify-center font-bold text-white transition-all ${getBarColor(span.category, span.status)}`}
                  >
                    {widthPercent > 12 && (
                      <span className="truncate px-1 drop-shadow-sm">{span.durationMs}ms</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Span Details */}
              {isExpanded && (
                <div className="ml-6 mr-2 my-1.5 p-3 rounded bg-[#0a0a0a] border border-[#222222] text-[11px] text-[#aaaaaa] space-y-1.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-[#666666]">
                    <span>Span ID: <code className="text-white">{span.id}</code></span>
                    <span>Start Offset: <code className="text-white">+{span.startMs}ms</code></span>
                    <span>Duration: <code className="text-white">{span.durationMs}ms</code></span>
                    <span>Status: <code className={span.status === 'ok' ? 'text-emerald-400' : 'text-amber-400'}>{span.status.toUpperCase()}</code></span>
                  </div>
                  {span.details && (
                    <div className="pt-1.5 border-t border-[#1f1f1f] text-white/90">
                      <span className="text-[#666666]">Log Event: </span>
                      {span.details}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-2 border-t border-[#1f1f1f] flex items-center justify-between text-[11px] text-[#666666]">
        <span>OpenTelemetry Distributed Trace • Spec v1.26</span>
        <span className="font-semibold text-white">Total Latency: {totalDurationMs}ms</span>
      </div>
    </div>
  );
};
