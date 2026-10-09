import React, { useState } from 'react';
import { 
  Puzzle, 
  Terminal, 
  Play, 
  Plus, 
  Code2, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  Server, 
  Cpu, 
  Lock, 
  Layers
} from 'lucide-react';
import { MCPToolDefinition, MCPServerConfig } from '../types.ts';

interface McpHubsModuleProps {
  tools: MCPToolDefinition[];
  servers: MCPServerConfig[];
}

export const McpHubsModule: React.FC<McpHubsModuleProps> = ({ tools, servers }) => {
  const [selectedToolName, setSelectedToolName] = useState<string>('calculator');
  const [testArgs, setTestArgs] = useState<string>('{\n  "expression": "(42.8 * 1000000) * 0.00002"\n}');
  const [isExecuting, setIsExecuting] = useState(false);
  const [toolOutput, setToolOutput] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedTool = tools.find(t => t.name === selectedToolName) || tools[0];

  const handleSelectTool = (name: string) => {
    setSelectedToolName(name);
    setErrorMsg(null);
    setToolOutput(null);

    if (name === 'calculator') {
      setTestArgs('{\n  "expression": "Math.sqrt(144) * 8"\n}');
    } else if (name === 'web_search') {
      setTestArgs('{\n  "query": "OpenTelemetry APM waterfall specification",\n  "num_results": 2\n}');
    } else if (name === 'datetime') {
      setTestArgs('{\n  "timezone": "UTC"\n}');
    } else if (name === 'system_status') {
      setTestArgs('{\n  "include_process_stats": true\n}');
    } else if (name === 'text_utils') {
      setTestArgs('{\n  "operation": "token_estimate",\n  "text": "Enterprise Nexus Router Gateway v2.4"\n}');
    } else {
      setTestArgs('{}');
    }
  };

  const executeTool = async () => {
    setIsExecuting(true);
    setErrorMsg(null);
    setToolOutput(null);

    try {
      let parsed = {};
      try {
        parsed = JSON.parse(testArgs);
      } catch {
        throw new Error('Invalid JSON arguments syntax.');
      }

      const res = await fetch('/api/v1/mcp/tools/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedToolName,
          arguments: parsed
        })
      });

      const data = await res.json();
      if (!res.ok || data.isError) {
        throw new Error(data.error || 'Execution returned an error');
      }

      setToolOutput(data);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f1f1f] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase bg-[#141414] text-[#888888] px-2 py-0.5 rounded border border-[#222222]">
              AGENT FUNCTION EXPOSURE
            </span>
            <span className="text-xs text-[#555555]">Anthropic Model Context Protocol (MCP)</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight font-mono">Model Context Protocol (MCP) Hubs</h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#888888]">Active Clusters:</span>
          <span className="text-white font-semibold">{servers.length || 3}</span>
        </div>
      </div>

      {/* Connected Transport Clusters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {servers.map((srv) => (
          <div key={srv.id} className="p-3.5 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] font-mono text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-[#0066ff]" />
                <span className="font-semibold text-white truncate max-w-[150px]">{srv.name}</span>
              </div>
              <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                srv.status === 'online' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-[#181818] text-[#888888]'
              }`}>
                {srv.status || 'online'}
              </span>
            </div>
            <div className="text-[11px] text-[#666666] truncate">
              {srv.urlOrCommand}
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-[#161616] text-[10px] text-[#555555]">
              <span>Type: <strong className="text-white uppercase">{srv.type}</strong></span>
              <span className="bg-[#141414] px-1.5 py-0.2 rounded text-[#aaaaaa] border border-[#222222]">
                {srv.scopeTag || 'sandboxed'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Tools & Sandbox Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Tools List */}
        <div className="lg:col-span-1 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-3 font-mono space-y-2">
          <div className="text-[10px] font-mono uppercase text-[#666666] px-2 py-1">
            Registered Tool Declarations
          </div>
          <div className="space-y-1.5">
            {tools.map((t) => (
              <button
                key={t.name}
                onClick={() => handleSelectTool(t.name)}
                className={`w-full text-left p-2.5 rounded transition-colors cursor-pointer border ${
                  selectedToolName === t.name
                    ? 'bg-[#141414] border-[#0066ff] text-white shadow-sm'
                    : 'bg-[#000000] border-[#181818] text-[#888888] hover:text-white hover:bg-[#0c0c0c]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-white">{t.name}</span>
                  <span className="text-[9px] bg-[#1a1a1a] text-[#777777] px-1 py-0.2 rounded">
                    builtin
                  </span>
                </div>
                <p className="text-[11px] text-[#666666] line-clamp-1 font-sans">
                  {t.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Sandbox & Schema Inspector */}
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-4 font-mono text-xs space-y-4">
          {selectedTool ? (
            <>
              <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-3">
                <div>
                  <h3 className="font-bold text-sm text-white">{selectedTool.name}</h3>
                  <p className="text-xs text-[#666666] font-sans mt-0.5">{selectedTool.description}</p>
                </div>
                <button
                  onClick={executeTool}
                  disabled={isExecuting}
                  className="px-3.5 py-1.5 rounded bg-[#0066ff] hover:bg-blue-600 disabled:opacity-50 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isExecuting ? 'Running...' : 'Execute Sandbox'}</span>
                </button>
              </div>

              {/* Arguments JSON Input */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase text-[#666666]">Invocation Payload (JSON Args):</span>
                <textarea
                  value={testArgs}
                  onChange={(e) => setTestArgs(e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded bg-[#000000] border border-[#1f1f1f] text-white text-xs font-mono focus:outline-none focus:border-[#0066ff] resize-none"
                />
              </div>

              {/* Execution Result */}
              {(toolOutput || errorMsg) && (
                <div className="space-y-1.5 pt-2 border-t border-[#1a1a1a]">
                  <span className="text-[10px] uppercase text-[#666666] flex items-center gap-1">
                    {errorMsg ? (
                      <AlertCircle className="w-3 h-3 text-rose-400" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    )}
                    <span>Execution Output:</span>
                  </span>

                  {errorMsg ? (
                    <div className="p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
                      {errorMsg}
                    </div>
                  ) : (
                    <pre className="p-3 rounded bg-[#000000] text-emerald-300 border border-emerald-500/20 text-xs overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(toolOutput, null, 2)}
                    </pre>
                  )}
                </div>
              )}

              {/* Schema Inspector */}
              <div className="space-y-1.5 pt-2 border-t border-[#1a1a1a]">
                <span className="text-[10px] uppercase text-[#666666]">Input JSON Schema:</span>
                <pre className="p-3 rounded bg-[#000000] text-[#888888] border border-[#1a1a1a] text-[11px] overflow-x-auto max-h-36">
                  {JSON.stringify(selectedTool.inputSchema, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-[#555555]">
              Select a tool from the left panel.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
