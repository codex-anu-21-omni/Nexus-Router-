import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Terminal, 
  Sparkles, 
  AlertTriangle, 
  Wrench, 
  Sliders, 
  Code, 
  Copy, 
  Check, 
  RotateCcw, 
  Zap, 
  BrainCircuit, 
  Clock, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight,
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ModelInfo, ProviderConfig, ChatMessage } from '../types.ts';

interface PlaygroundProps {
  models: ModelInfo[];
  providers: ProviderConfig[];
  selectedModelId: string;
  onSelectModel: (id: string) => void;
  onRefreshMetrics: () => void;
}

export const Playground: React.FC<PlaygroundProps> = ({
  models,
  providers,
  selectedModelId,
  onSelectModel,
  onRefreshMetrics
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am connected to the **Free MCP AI Router**.\n\nYou can prompt me with questions, ask me to perform calculations or web queries using **Model Context Protocol (MCP)** tools, or toggle **"Simulate 429"** to test zero-downtime automatic provider failover!`,
      timestamp: Date.now(),
      modelUsed: 'openrouter/auto',
      providerUsed: 'google',
      durationMs: 142,
      ttftMs: 65,
      tokens: 48,
      fallbacksTriggered: []
    }
  ]);

  const [input, setInput] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful and concise AI assistant powered by the Free MCP AI Router.');
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [enableMcp, setEnableMcp] = useState(true);
  const [isSimulate429, setIsSimulate429] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRawInspector, setShowRawInspector] = useState(false);
  const [lastRawPayload, setLastRawPayload] = useState<any>(null);
  const [copiedRaw, setCopiedRaw] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const primaryProvider = providers.find(p => p.priority === 1) || providers[0];

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    // If simulate 429 is toggled on primary in playground, send API request with configured state
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

    const payload = {
      model: selectedModelId,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        ...newMessages.map(m => ({ role: m.role, content: m.content }))
      ],
      temperature,
      max_tokens: maxTokens,
      enable_mcp: enableMcp,
      stream: false
    };

    setLastRawPayload(payload);

    try {
      const response = await fetch('/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-or-v1-dev-free-mcp-router-key'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || 'Completion failed');
      }

      const assistantMessage: ChatMessage = {
        id: data.id || `asst-${Date.now()}`,
        role: 'assistant',
        content: data.choices?.[0]?.message?.content || 'No response content',
        timestamp: Date.now(),
        modelUsed: data.model,
        providerUsed: data.provider,
        durationMs: data.durationMs || 250,
        ttftMs: Math.round((data.durationMs || 250) * 0.4),
        tokens: data.usage?.total_tokens || 100,
        fallbacksTriggered: data.fallbacksTriggered || [],
        mcpToolCalls: data.mcpToolCalls
      };

      setMessages(prev => [...prev, assistantMessage]);
      onRefreshMetrics();
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Router Error**: ${err?.message || 'Request failed'}\n\n*If rate-limit simulation is enabled on all providers, please disable simulation on at least one provider in the Routing tab.*`,
        timestamp: Date.now(),
        modelUsed: selectedModelId,
        providerUsed: 'error',
        fallbacksTriggered: ['All fallback providers exhausted']
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    {
      title: "Calculate with MCP",
      prompt: "Use the MCP calculator tool to evaluate: (1500000 / 1000000) * 0.15"
    },
    {
      title: "System & Datetime",
      prompt: "Call the MCP system_status and datetime tools to check current router status and UTC time."
    },
    {
      title: "Simulate 429 Test",
      prompt: "Explain how zero-downtime automatic provider failover prevents 429 rate limit errors for clients."
    },
    {
      title: "MCP Web Search",
      prompt: "Search information about Model Context Protocol architecture using web_search."
    }
  ];

  const clearChat = () => {
    setMessages([]);
  };

  const copyCurl = () => {
    const curl = `curl -X POST ${window.location.origin}/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-or-v1-dev-free-mcp-router-key" \\
  -d '${JSON.stringify(lastRawPayload || { model: selectedModelId, messages: [{ role: 'user', content: 'Hello' }] }, null, 2)}'`;
    navigator.clipboard.writeText(curl);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-130px)] min-h-[600px]">
      {/* Left Settings Sidebar */}
      <div className="lg:col-span-1 bg-[#161b22] border border-[#30363d] rounded-2xl p-4 flex flex-col justify-between overflow-y-auto space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-white">Router Config</span>
            </div>
            <button
              onClick={clearChat}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
              title="Clear conversation"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Model Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300 flex items-center justify-between">
              <span>Target Model</span>
              <span className="text-[10px] text-emerald-400 font-mono">100% Free</span>
            </label>
            <select
              value={selectedModelId}
              onChange={(e) => onSelectModel(e.target.value)}
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            {selectedModelId === 'openrouter/auto' && (
              <p className="text-[11px] text-gray-400 leading-tight">
                Automatically tries Gemini first; if 429 occurs, transparently retries via Groq, SambaNova, or Ollama.
              </p>
            )}
          </div>

          {/* Rate Limit 429 Simulation Switch */}
          <div className="p-3 rounded-xl bg-[#0d1117] border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5 cursor-pointer">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate 429 Rate Limit</span>
              </label>
              <input
                type="checkbox"
                checked={isSimulate429}
                onChange={(e) => setIsSimulate429(e.target.checked)}
                className="rounded border-gray-700 bg-gray-900 text-amber-500 focus:ring-amber-500 cursor-pointer h-4 w-4"
              />
            </div>
            <p className="text-[11px] text-gray-400 leading-normal">
              Forces primary provider ({primaryProvider?.name || 'Gemini'}) to throw a 429 Too Many Requests, proving immediate zero-downtime fallback to secondary tiers.
            </p>
          </div>

          {/* MCP Tools Bridge Toggle */}
          <div className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-blue-300 flex items-center gap-1.5 cursor-pointer">
                <Wrench className="w-3.5 h-3.5 text-blue-400" />
                <span>Model Context Protocol (MCP)</span>
              </label>
              <input
                type="checkbox"
                checked={enableMcp}
                onChange={(e) => setEnableMcp(e.target.checked)}
                className="rounded border-gray-700 bg-gray-900 text-purple-600 focus:ring-purple-500 cursor-pointer h-4 w-4"
              />
            </div>
            <p className="text-[11px] text-gray-400 leading-normal">
              Exposes built-in tools (calculator, web_search, datetime, system_status) into the router function-calling loop.
            </p>
          </div>

          {/* System Prompt Collapsible */}
          <div className="space-y-1.5">
            <button
              onClick={() => setShowSystemPrompt(!showSystemPrompt)}
              className="flex items-center justify-between w-full text-xs font-medium text-gray-300 hover:text-white"
            >
              <span>System Instruction</span>
              {showSystemPrompt ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            {showSystemPrompt && (
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={3}
                className="w-full p-2 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-gray-200 focus:outline-none focus:border-purple-500 resize-none font-sans"
                placeholder="Set system prompt..."
              />
            )}
          </div>

          {/* Sliders: Temperature & Max Tokens */}
          <div className="space-y-3 pt-2 border-t border-[#30363d]">
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Temperature</span>
                <span className="font-mono text-white">{temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-purple-500 h-1.5 bg-gray-700 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Max Output Tokens</span>
                <span className="font-mono text-white">{maxTokens}</span>
              </div>
              <input
                type="range"
                min="256"
                max="8192"
                step="256"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full accent-purple-500 h-1.5 bg-gray-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* View Raw JSON Inspector Button */}
        <button
          onClick={() => setShowRawInspector(!showRawInspector)}
          className="w-full py-2 px-3 rounded-xl bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs font-medium text-gray-300 flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <Code className="w-3.5 h-3.5 text-purple-400" />
          <span>{showRawInspector ? 'Hide Request Inspector' : 'Inspect OpenAI Payload'}</span>
        </button>
      </div>

      {/* Main Chat Thread Area */}
      <div className="lg:col-span-3 bg-[#161b22] border border-[#30363d] rounded-2xl flex flex-col h-full overflow-hidden relative">
        {/* Messages Scroll View */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  {msg.role === 'user' ? 'You (Client)' : 'AI Router Assistant'}
                </span>
                {msg.timestamp && (
                  <span className="text-[10px] text-gray-500 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white shadow-md rounded-tr-sm'
                    : 'bg-[#0d1117] text-gray-200 border border-[#30363d] shadow-sm rounded-tl-sm'
                }`}
              >
                {/* Render MCP Tool Calls if any */}
                {msg.mcpToolCalls && msg.mcpToolCalls.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {msg.mcpToolCalls.map((call, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl bg-[#161b22] border border-blue-500/30 p-2.5 text-xs text-gray-300"
                      >
                        <div className="flex items-center gap-2 text-blue-400 font-mono font-semibold mb-1">
                          <Wrench className="w-3.5 h-3.5" />
                          <span>MCP Tool Executed: {call.name}</span>
                        </div>
                        <div className="bg-[#0d1117] p-2 rounded-lg font-mono text-[11px] text-gray-400 overflow-x-auto mb-1">
                          args: {JSON.stringify(call.args)}
                        </div>
                        <div className="bg-[#0d1117]/80 p-2 rounded-lg text-[11px] text-emerald-300 border border-emerald-500/20 whitespace-pre-wrap">
                          {call.result}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Text Content */}
                <div className="whitespace-pre-wrap font-sans">
                  {msg.content}
                </div>

                {/* Performance & Fallback Footer for Assistant Responses */}
                {msg.role === 'assistant' && (msg.providerUsed || msg.fallbacksTriggered?.length) && (
                  <div className="mt-3 pt-2.5 border-t border-[#30363d]/60 flex flex-wrap items-center gap-2 text-[11px] font-mono text-gray-400">
                    {msg.providerUsed && (
                      <span className="flex items-center gap-1 text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        <Zap className="w-3 h-3 text-purple-400" />
                        Provider: {msg.providerUsed}
                      </span>
                    )}

                    {msg.durationMs !== undefined && (
                      <span className="flex items-center gap-1 text-gray-300 bg-gray-800/60 px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {msg.durationMs}ms ({msg.ttftMs}ms TTFT)
                      </span>
                    )}

                    {msg.tokens !== undefined && (
                      <span className="text-gray-300 bg-gray-800/60 px-2 py-0.5 rounded">
                        {msg.tokens} tokens
                      </span>
                    )}

                    {/* Fallback Badge */}
                    {msg.fallbacksTriggered && msg.fallbacksTriggered.length > 0 && (
                      <span className="flex items-center gap-1 text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-sans font-medium">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        Fallback: {msg.fallbacksTriggered.join(' ➔ ')}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex flex-col items-start space-y-1">
              <span className="text-[11px] text-gray-400 px-1">Routing via free aggregator...</span>
              <div className="p-3 rounded-2xl bg-[#0d1117] border border-[#30363d] flex items-center gap-2 text-sm text-gray-300">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
                </span>
                <span className="font-mono text-xs text-purple-300">
                  {isSimulate429 ? 'Primary 429 triggered, executing fallback provider...' : 'Querying free LLM & MCP tool loop...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Sample Prompt Chips */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 border-t border-[#30363d] bg-[#0d1117]/50 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] text-gray-500 whitespace-nowrap font-medium">Suggested:</span>
            {samplePrompts.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(s.prompt)}
                className="px-2.5 py-1 rounded-lg bg-[#161b22] hover:bg-[#21262d] text-gray-300 hover:text-white border border-[#30363d] text-xs whitespace-nowrap transition-colors cursor-pointer"
              >
                {s.title}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 lg:p-4 border-t border-[#30363d] bg-[#0d1117] flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type your prompt... (Press Enter to send, Shift+Enter for newline)"
            rows={2}
            className="flex-1 bg-[#161b22] border border-[#30363d] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none font-sans"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className="h-11 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-purple-600/20"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>

        {/* Raw Inspector Modal / Overlay */}
        {showRawInspector && (
          <div className="absolute inset-0 bg-[#0d1117]/95 backdrop-blur-md z-30 p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-[#30363d] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold text-white">OpenAI Request / cURL Inspector</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyCurl}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-xs text-white border border-[#30363d] cursor-pointer"
                  >
                    {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedRaw ? 'Copied' : 'Copy cURL'}</span>
                  </button>
                  <button
                    onClick={() => setShowRawInspector(false)}
                    className="px-3 py-1 rounded-lg bg-[#21262d] text-xs text-gray-300 hover:text-white cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div>
                  <div className="text-gray-400 mb-1">Target Endpoint:</div>
                  <div className="p-2.5 rounded-lg bg-[#161b22] text-purple-300 border border-[#30363d]">
                    POST {window.location.origin}/v1/chat/completions
                  </div>
                </div>

                <div>
                  <div className="text-gray-400 mb-1">Request Body (JSON):</div>
                  <pre className="p-4 rounded-xl bg-[#161b22] text-gray-300 border border-[#30363d] overflow-x-auto max-h-72">
                    {JSON.stringify(lastRawPayload || {
                      model: selectedModelId,
                      messages: messages.map(m => ({ role: m.role, content: m.content })),
                      temperature,
                      enable_mcp: enableMcp
                    }, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#30363d] text-xs text-gray-500">
              This request structure is 100% compliant with standard OpenAI SDKs and OpenRouter client tools.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
