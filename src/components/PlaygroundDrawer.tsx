import React, { useState } from 'react';
import { 
  Terminal, 
  Send, 
  Sparkles, 
  ShieldAlert, 
  Wrench, 
  Sliders, 
  RotateCcw, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Code
} from 'lucide-react';
import { ModelInfo, ProviderConfig, ChatMessage, TraceSpan } from '../types.ts';
import { WaterfallTrace } from './WaterfallTrace.tsx';

interface PlaygroundDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  models: ModelInfo[];
  providers: ProviderConfig[];
  onRefreshMetrics: () => void;
}

export const PlaygroundDrawer: React.FC<PlaygroundDrawerProps> = ({
  isOpen,
  onClose,
  models,
  providers,
  onRefreshMetrics
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Nexus Router Gateway operational and ready to serve.\n\nSend a query to test multi-model inference, or enable **Simulate 429 Rate Limit** to watch the router automatically cascade across healthy fallback providers with zero client dropouts.`,
      timestamp: Date.now(),
      modelUsed: 'openrouter/auto',
      providerUsed: 'google',
      durationMs: 120,
      ttftMs: 50,
      tokens: 35,
      fallbacksTriggered: []
    }
  ]);

  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('openrouter/auto');
  const [isSimulate429, setIsSimulate429] = useState(false);
  const [enableMcp, setEnableMcp] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSpans, setLastSpans] = useState<TraceSpan[] | null>(null);

  if (!isOpen) return null;

  const primaryProvider = providers.find(p => p.priority === 1) || providers[0];

  const handleSend = async (customText?: string) => {
    const text = customText || input;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: Date.now()
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    // Apply 429 simulation state
    if (primaryProvider && primaryProvider.simulateRateLimit429 !== isSimulate429) {
      try {
        await fetch('/api/v1/providers/simulate-429', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ providerId: primaryProvider.id, simulate: isSimulate429 })
        });
      } catch (e) {
        console.error(e);
      }
    }

    try {
      const response = await fetch('/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-nexus-dev-alex-89a1'
        },
        body: JSON.stringify({
          model: selectedModel,
          client_tag: 'Test-Console-Worker',
          messages: nextMessages.map(m => ({ role: m.role, content: m.content })),
          enable_mcp: enableMcp,
          stream: false
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || 'Completion failed');
      }

      const asstMsg: ChatMessage = {
        id: data.id || `asst-${Date.now()}`,
        role: 'assistant',
        content: data.choices?.[0]?.message?.content || 'No response',
        timestamp: Date.now(),
        modelUsed: data.model,
        providerUsed: data.provider,
        durationMs: data.durationMs || 340,
        ttftMs: Math.round((data.durationMs || 340) * 0.4),
        tokens: data.usage?.total_tokens || 85,
        fallbacksTriggered: data.fallbacksTriggered || [],
        mcpToolCalls: data.mcpToolCalls,
        spans: data.spans
      };

      setMessages(prev => [...prev, asstMsg]);
      if (data.spans) {
        setLastSpans(data.spans);
      }
      onRefreshMetrics();
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Failover Exception: ${err?.message || 'All tiers exhausted'}`,
        timestamp: Date.now(),
        providerUsed: 'exhausted',
        fallbacksTriggered: ['All fallback tiers failed']
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex justify-end">
      <div className="w-full max-w-2xl bg-[#0a0a0a] border-l border-[#1f1f1f] h-full flex flex-col justify-between font-mono text-xs shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#1f1f1f] flex items-center justify-between bg-[#050505]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#0066ff]" />
            <h2 className="font-bold text-white text-sm">Nexus Router Studio &amp; Live Sandbox</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded text-[#666666] hover:text-white hover:bg-[#141414] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Toolbar */}
        <div className="p-3 border-b border-[#1f1f1f] bg-[#000000] flex flex-wrap items-center justify-between gap-3 text-[11px]">
          {/* Model Select */}
          <div className="flex items-center gap-2">
            <span className="text-[#666666]">Target:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-[#0f0f0f] border border-[#262626] rounded px-2 py-1 text-white focus:outline-none focus:border-[#0066ff]"
            >
              <option value="openrouter/auto">openrouter/auto (Dynamic Policy)</option>
              {models.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* 429 Simulation Checkbox */}
          <label className="flex items-center gap-1.5 cursor-pointer text-amber-300">
            <input
              type="checkbox"
              checked={isSimulate429}
              onChange={(e) => setIsSimulate429(e.target.checked)}
              className="rounded bg-[#1a1a1a] border-[#333333] text-amber-500 cursor-pointer"
            />
            <span>Simulate 429 Failover</span>
          </label>

          {/* MCP Toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer text-cyan-300">
            <input
              type="checkbox"
              checked={enableMcp}
              onChange={(e) => setEnableMcp(e.target.checked)}
              className="rounded bg-[#1a1a1a] border-[#333333] text-cyan-500 cursor-pointer"
            />
            <span>MCP Tool Loop</span>
          </label>
        </div>

        {/* Chat Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-xs">
          {messages.map((m) => (
            <div 
              key={m.id} 
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="text-[10px] font-mono text-[#666666] mb-1">
                {m.role === 'user' ? 'Client' : 'Nexus Router'}
              </div>

              <div className={`p-3 rounded-lg max-w-[90%] leading-relaxed ${
                m.role === 'user'
                  ? 'bg-[#181818] border border-[#2a2a2a] text-white'
                  : 'bg-[#000000] border border-[#1f1f1f] text-[#dddddd]'
              }`}>
                {/* Tool call rendered if any */}
                {m.mcpToolCalls && m.mcpToolCalls.length > 0 && (
                  <div className="mb-2 p-2 rounded bg-[#0a0a0a] border border-cyan-500/30 text-[11px] font-mono text-cyan-300 space-y-1">
                    <div className="font-bold">MCP Tool Executed: {m.mcpToolCalls[0].name}</div>
                    <div className="text-emerald-400">{m.mcpToolCalls[0].result}</div>
                  </div>
                )}

                <div className="whitespace-pre-wrap">{m.content}</div>

                {/* Footer Trace Pill */}
                {m.role === 'assistant' && (
                  <div className="mt-2 pt-2 border-t border-[#1a1a1a] flex items-center justify-between text-[10px] font-mono text-[#666666]">
                    <span>Provider: <strong className="text-white font-normal">{m.providerUsed}</strong></span>
                    <span>Latency: <strong className="text-white font-normal">{m.durationMs}ms</strong></span>
                    {m.fallbacksTriggered && m.fallbacksTriggered.length > 0 && (
                      <span className="text-amber-400 font-bold">429 Caught &amp; Retried</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="p-3 rounded bg-[#000000] border border-[#1f1f1f] text-[#888888] font-mono text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0066ff] animate-ping" />
              <span>Routing through failover chain &amp; executing tools...</span>
            </div>
          )}

          {/* Last Spans Waterfall Visualization */}
          {lastSpans && (
            <div className="mt-4 pt-4 border-t border-[#1f1f1f]">
              <div className="text-[10px] font-mono uppercase text-[#666666] mb-1.5">
                Live OpenTelemetry Trace:
              </div>
              <WaterfallTrace spans={lastSpans} totalDurationMs={380} />
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="p-3 border-t border-[#1f1f1f] bg-[#050505] flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type prompt or test calculation..."
            className="flex-1 px-3 py-2 bg-[#000000] border border-[#1f1f1f] rounded text-white text-xs font-mono focus:outline-none focus:border-[#0066ff]"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 rounded bg-[#0066ff] hover:bg-blue-600 disabled:opacity-50 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
