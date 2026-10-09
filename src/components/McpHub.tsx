import React, { useState } from 'react';
import { 
  Wrench, 
  Terminal, 
  Play, 
  Plus, 
  Code2, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Layers, 
  Server, 
  Sparkles,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { MCPToolDefinition } from '../types.ts';

interface McpHubProps {
  tools: MCPToolDefinition[];
  onRefreshTools?: () => void;
}

export const McpHub: React.FC<McpHubProps> = ({ tools }) => {
  const [selectedToolName, setSelectedToolName] = useState<string>('calculator');
  const [testArgs, setTestArgs] = useState<string>('{\n  "expression": "(1500000 / 1000000) * 0.15"\n}');
  const [isExecuting, setIsExecuting] = useState(false);
  const [toolOutput, setToolOutput] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [newServerName, setNewServerName] = useState('');
  const [newServerType, setNewServerType] = useState<'stdio' | 'sse'>('stdio');
  const [newServerUri, setNewServerUri] = useState('');
  const [showAddServerModal, setShowAddServerModal] = useState(false);

  const selectedTool = tools.find(t => t.name === selectedToolName) || tools[0];

  const handleSelectTool = (name: string) => {
    setSelectedToolName(name);
    setErrorMsg(null);
    setToolOutput(null);

    // Provide default sample args based on tool
    if (name === 'calculator') {
      setTestArgs('{\n  "expression": "Math.sqrt(144) * 8"\n}');
    } else if (name === 'web_search') {
      setTestArgs('{\n  "query": "Model Context Protocol architecture",\n  "num_results": 2\n}');
    } else if (name === 'datetime') {
      setTestArgs('{\n  "timezone": "UTC"\n}');
    } else if (name === 'system_status') {
      setTestArgs('{\n  "include_process_stats": true\n}');
    } else if (name === 'text_utils') {
      setTestArgs('{\n  "operation": "token_estimate",\n  "text": "Hello world from Free MCP AI Router!"\n}');
    } else {
      setTestArgs('{}');
    }
  };

  const executeToolTest = async () => {
    setIsExecuting(true);
    setErrorMsg(null);
    setToolOutput(null);

    try {
      let parsedArgs = {};
      try {
        parsedArgs = JSON.parse(testArgs);
      } catch {
        throw new Error('Invalid JSON arguments syntax.');
      }

      const res = await fetch('/api/v1/mcp/tools/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedToolName,
          arguments: parsedArgs
        })
      });

      const data = await res.json();
      if (!res.ok || data.isError) {
        throw new Error(data.error || 'Execution returned an error');
      }

      setToolOutput(data);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Tool execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-md">
              Phase 4: Model Context Protocol (MCP) Bridge
            </span>
            <span className="text-xs text-gray-400">Anthropic MCP Protocol Compliant</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Model Context Protocol (MCP) Hub</h2>
          <p className="text-sm text-gray-400 mt-1 max-w-2xl">
            Turns the free AI router into an autonomous agent tool engine. The router dynamically detects tool schemas, prompts the LLM, intercepts tool calls, executes them locally or via network SSE, and feeds results back to the LLM.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-center">
            <div className="text-lg font-bold text-white font-mono">{tools.length}</div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider">MCP Tools Active</div>
          </div>
          <button
            onClick={() => setShowAddServerModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Connect MCP Server</span>
          </button>
        </div>
      </div>

      {/* Tool Calling Execution Loop Diagram */}
      <div className="p-5 rounded-2xl bg-[#0d1117] border border-[#30363d] space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>The Autonomous Function-Calling Loop (The Brains)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1">
            <div className="text-purple-400 font-mono font-bold text-[11px]">Step 1: Tool Injection</div>
            <p className="text-gray-300 text-[11px] leading-relaxed">
              Router collects registered MCP tool definitions and converts them into function declarations passed to the free LLM.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1">
            <div className="text-blue-400 font-mono font-bold text-[11px]">Step 2: Intercept Call</div>
            <p className="text-gray-300 text-[11px] leading-relaxed">
              If the LLM generates a function call (e.g. <code className="text-blue-300">calculator</code>), the router catches it before sending to client.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1">
            <div className="text-emerald-400 font-mono font-bold text-[11px]">Step 3: Local Execution</div>
            <p className="text-gray-300 text-[11px] leading-relaxed">
              Router triggers the local MCP handler (stdio/SSE), runs the code/calculation safely, and captures output.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1">
            <div className="text-pink-400 font-mono font-bold text-[11px]">Step 4: Final Synthesis</div>
            <p className="text-gray-300 text-[11px] leading-relaxed">
              Tool result is injected back as message context to the model, producing the final synthesized answer for the user.
            </p>
          </div>
        </div>
      </div>

      {/* Main MCP Tools Grid & Interactive Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Registered Tools List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-purple-400" />
            <span>Available MCP Tools</span>
          </h3>

          <div className="space-y-2">
            {tools.map((t) => (
              <div
                key={t.name}
                onClick={() => handleSelectTool(t.name)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedToolName === t.name
                    ? 'bg-[#161b22] border-purple-500 shadow-md shadow-purple-500/10'
                    : 'bg-[#161b22]/50 border-[#30363d] hover:bg-[#161b22] hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-sm font-semibold text-white">
                    {t.name}
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-[#21262d] text-gray-400 px-1.5 py-0.5 rounded border border-[#30363d]">
                    mcp-builtin
                  </span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2">
                  {t.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Schema Inspector & Live Execution Sandbox */}
        <div className="lg:col-span-2 bg-[#161b22] border border-[#30363d] rounded-2xl p-5 space-y-5">
          {selectedTool ? (
            <>
              {/* Tool Detail Header */}
              <div className="border-b border-[#30363d] pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white font-mono">{selectedTool.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">{selectedTool.description}</p>
                  </div>
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
                    Ready to execute
                  </span>
                </div>
              </div>

              {/* Input Schema Parameters */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Input JSON Schema (Parameters)</span>
                </h4>
                <pre className="p-3 rounded-xl bg-[#0d1117] text-gray-300 font-mono text-xs border border-[#30363d] overflow-x-auto max-h-40">
                  {JSON.stringify(selectedTool.inputSchema, null, 2)}
                </pre>
              </div>

              {/* Live Sandbox Argument Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-purple-400" />
                    <span>Test Arguments (JSON)</span>
                  </h4>
                  <button
                    onClick={executeToolTest}
                    disabled={isExecuting}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isExecuting ? 'Executing...' : 'Run Tool Test'}</span>
                  </button>
                </div>

                <textarea
                  value={testArgs}
                  onChange={(e) => setTestArgs(e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded-xl bg-[#0d1117] text-white font-mono text-xs border border-[#30363d] focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              {/* Execution Output */}
              {(toolOutput || errorMsg) && (
                <div className="space-y-2 pt-2 border-t border-[#30363d]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    {errorMsg ? (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span>Execution Result</span>
                  </h4>

                  {errorMsg ? (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
                      {errorMsg}
                    </div>
                  ) : (
                    <pre className="p-4 rounded-xl bg-[#0d1117] text-emerald-300 border border-emerald-500/30 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(toolOutput, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Select a tool from the left to inspect its schema.
            </div>
          )}
        </div>
      </div>

      {/* Add External MCP Server Modal */}
      {showAddServerModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-base">Connect External MCP Server</h3>
              </div>
              <button
                onClick={() => setShowAddServerModal(false)}
                className="text-gray-400 hover:text-white text-xs cursor-pointer"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Configure a local stdio MCP server (e.g. filesystem, github, postgres) or a remote SSE network endpoint.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-300 block mb-1">Server Name</label>
                <input
                  type="text"
                  placeholder="e.g. Local Filesystem MCP"
                  value={newServerName}
                  onChange={(e) => setNewServerName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 block mb-1">Transport Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewServerType('stdio')}
                    className={`py-2 rounded-xl text-xs font-medium border cursor-pointer ${
                      newServerType === 'stdio'
                        ? 'bg-purple-600/20 text-purple-300 border-purple-500'
                        : 'bg-[#0d1117] text-gray-400 border-[#30363d]'
                    }`}
                  >
                    stdio (CLI process)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewServerType('sse')}
                    className={`py-2 rounded-xl text-xs font-medium border cursor-pointer ${
                      newServerType === 'sse'
                        ? 'bg-purple-600/20 text-purple-300 border-purple-500'
                        : 'bg-[#0d1117] text-gray-400 border-[#30363d]'
                    }`}
                  >
                    SSE (Network endpoint)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-300 block mb-1">
                  {newServerType === 'stdio' ? 'Command (with args)' : 'Server SSE URL'}
                </label>
                <input
                  type="text"
                  placeholder={
                    newServerType === 'stdio'
                      ? 'npx -y @modelcontextprotocol/server-filesystem /workspace'
                      : 'http://localhost:8000/sse'
                  }
                  value={newServerUri}
                  onChange={(e) => setNewServerUri(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#30363d] flex justify-end gap-2">
              <button
                onClick={() => setShowAddServerModal(false)}
                className="px-4 py-2 rounded-xl bg-[#21262d] text-xs text-gray-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAddServerModal(false);
                  setNewServerName('');
                  setNewServerUri('');
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white cursor-pointer"
              >
                Save &amp; Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
