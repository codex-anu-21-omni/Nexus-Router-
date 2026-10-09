import React, { useState } from 'react';
import { 
  BookOpen, 
  Terminal, 
  Copy, 
  Check, 
  Code, 
  Radio, 
  ExternalLink, 
  Layers, 
  Cpu, 
  Box, 
  FileCode,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const IntegrationDocs: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'cursor' | 'cline' | 'python' | 'curl' | 'docker'>('cursor');

  const copyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const cursorSnippet = `{
  "models": [
    {
      "model": "openrouter/auto",
      "provider": "openai",
      "baseUrl": "${window.location.origin}/v1",
      "apiKey": "sk-or-v1-dev-free-mcp-router-key"
    }
  ]
}`;

  const clineSnippet = `{
  "apiProvider": "openai-compatible",
  "openAiBaseUrl": "${window.location.origin}/v1",
  "openAiApiKey": "sk-or-v1-dev-free-mcp-router-key",
  "openAiModelId": "openrouter/auto"
}`;

  const pythonSnippet = `from openai import OpenAI

client = OpenAI(
    base_url="${window.location.origin}/v1",
    api_key="sk-or-v1-dev-free-mcp-router-key"
)

response = client.chat.completions.create(
    model="openrouter/auto",
    messages=[
        {"role": "system", "content": "You are an AI assistant."},
        {"role": "user", "content": "Calculate 42 * 1337 and describe the result."}
    ],
    temperature=0.7
)

print(response.choices[0].message.content)`;

  const curlSnippet = `curl -X POST ${window.location.origin}/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-or-v1-dev-free-mcp-router-key" \\
  -d '{
    "model": "openrouter/auto",
    "messages": [
      {"role": "user", "content": "Hello from external terminal client!"}
    ]
  }'`;

  const dockerComposeSnippet = `version: '3.8'

services:
  free-mcp-ai-router:
    image: node:20-alpine
    container_name: free-mcp-ai-router
    working_dir: /app
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
      - GROQ_API_KEY=\${GROQ_API_KEY}
    volumes:
      - .:/app
    command: npm run dev
    restart: unless-stopped`;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-md">
              Phase 5: Client Integration &amp; Deployment
            </span>
            <span className="text-xs text-gray-400">OpenAI Drop-In Base URL Compatibility</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Client IDE &amp; Agent Setup</h2>
          <p className="text-sm text-gray-400 mt-1 max-w-2xl">
            Plug this router directly into your favorite AI code editor (Cursor, Cline, Windsurf, Claude Code) or custom Python/TypeScript scripts by pointing the OpenAI Base URL to <code className="text-purple-300 font-mono">/v1</code>.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-left">
          <div className="text-xs text-gray-400 font-mono">OpenAI Base URL:</div>
          <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">{window.location.origin}/v1</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#30363d] pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'cursor', label: 'Cursor IDE', icon: Code },
          { id: 'cline', label: 'Cline / Roo Code', icon: Layers },
          { id: 'python', label: 'Python OpenAI SDK', icon: FileCode },
          { id: 'curl', label: 'cURL / HTTP', icon: Terminal },
          { id: 'docker', label: 'Docker Deployment', icon: Box },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                  : 'bg-[#161b22] text-gray-400 border border-[#30363d] hover:text-gray-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="rounded-2xl bg-[#161b22] border border-[#30363d] p-6 space-y-4">
        {activeTab === 'cursor' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">How to connect Cursor IDE:</h3>
              <ol className="list-decimal list-inside text-xs text-gray-300 space-y-1.5 mt-2">
                <li>Open Cursor Settings (<kbd className="bg-gray-800 px-1 py-0.5 rounded text-[10px]">Ctrl + Shift + J</kbd> or <kbd className="bg-gray-800 px-1 py-0.5 rounded text-[10px]">Cmd + Shift + J</kbd>).</li>
                <li>Navigate to <strong>Models</strong> &gt; <strong>OpenAI API Key</strong>.</li>
                <li>Click <strong>Override OpenAI Base URL</strong> and enter <code className="text-purple-300 bg-[#0d1117] px-1.5 py-0.5 rounded font-mono">{window.location.origin}/v1</code>.</li>
                <li>Enter any dummy key or your router virtual key: <code className="text-gray-300 font-mono">sk-or-v1-dev-free-mcp-router-key</code>.</li>
                <li>Add Model Name: <code className="text-emerald-400 font-mono">openrouter/auto</code> (or any free model from the Models tab).</li>
              </ol>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>Cursor settings.json snippet</span>
                <button
                  onClick={() => copyCode('cursor', cursorSnippet)}
                  className="flex items-center gap-1 text-purple-400 hover:text-purple-300 cursor-pointer"
                >
                  {copiedSection === 'cursor' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'cursor' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-[#0d1117] text-gray-300 font-mono text-xs border border-[#30363d] overflow-x-auto">
                {cursorSnippet}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'cline' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">How to connect Cline / Roo Code:</h3>
              <ol className="list-decimal list-inside text-xs text-gray-300 space-y-1.5 mt-2">
                <li>Click the Cline gear icon in the extension pane.</li>
                <li>Choose <strong>OpenAI Compatible</strong> under API Provider.</li>
                <li>Set Base URL to <code className="text-purple-300 bg-[#0d1117] px-1.5 py-0.5 rounded font-mono">{window.location.origin}/v1</code>.</li>
                <li>Set API Key to <code className="text-gray-300 font-mono">sk-or-v1-dev-free-mcp-router-key</code>.</li>
                <li>Set Model ID to <code className="text-emerald-400 font-mono">openrouter/auto</code>.</li>
              </ol>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>Configuration JSON</span>
                <button
                  onClick={() => copyCode('cline', clineSnippet)}
                  className="flex items-center gap-1 text-purple-400 hover:text-purple-300 cursor-pointer"
                >
                  {copiedSection === 'cline' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'cline' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-[#0d1117] text-gray-300 font-mono text-xs border border-[#30363d] overflow-x-auto">
                {clineSnippet}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'python' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">Python OpenAI SDK Example</h3>
            <p className="text-xs text-gray-400">
              Run standard completions, streaming, and tool calls using the official <code className="text-purple-300">pip install openai</code> client:
            </p>

            <div className="relative">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>main.py</span>
                <button
                  onClick={() => copyCode('python', pythonSnippet)}
                  className="flex items-center gap-1 text-purple-400 hover:text-purple-300 cursor-pointer"
                >
                  {copiedSection === 'python' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'python' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-[#0d1117] text-gray-300 font-mono text-xs border border-[#30363d] overflow-x-auto">
                {pythonSnippet}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'curl' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">cURL Direct Request</h3>
            <p className="text-xs text-gray-400">
              Send an OpenAI-formatted request directly from your bash or zsh terminal:
            </p>

            <div className="relative">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>terminal command</span>
                <button
                  onClick={() => copyCode('curl', curlSnippet)}
                  className="flex items-center gap-1 text-purple-400 hover:text-purple-300 cursor-pointer"
                >
                  {copiedSection === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'curl' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-[#0d1117] text-gray-300 font-mono text-xs border border-[#30363d] overflow-x-auto">
                {curlSnippet}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'docker' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">Docker Compose Deployment</h3>
            <p className="text-xs text-gray-400">
              Deploy the entire Free MCP AI Router on your local server or VPS with a single terminal command: <code className="text-purple-300 font-mono">docker compose up -d</code>.
            </p>

            <div className="relative">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>docker-compose.yml</span>
                <button
                  onClick={() => copyCode('docker', dockerComposeSnippet)}
                  className="flex items-center gap-1 text-purple-400 hover:text-purple-300 cursor-pointer"
                >
                  {copiedSection === 'docker' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'docker' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-[#0d1117] text-gray-300 font-mono text-xs border border-[#30363d] overflow-x-auto">
                {dockerComposeSnippet}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
