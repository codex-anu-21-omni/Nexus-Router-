import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { OverviewModule } from './components/OverviewModule.tsx';
import { ApiKeysModule } from './components/ApiKeysModule.tsx';
import { McpHubsModule } from './components/McpHubsModule.tsx';
import { ApmLogsModule } from './components/ApmLogsModule.tsx';
import { ModelsCatalog } from './components/ModelsCatalog.tsx';
import { PlaygroundDrawer } from './components/PlaygroundDrawer.tsx';
import { IntegrationDocs } from './components/IntegrationDocs.tsx';
import { 
  ModelInfo, 
  ProviderConfig, 
  RouterMetrics, 
  MCPToolDefinition, 
  VirtualApiKey, 
  RequestLog,
  IntentPolicy
} from './types.ts';
import { Terminal, ShieldAlert, Sparkles, Building2 } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [mcpTools, setMcpTools] = useState<MCPToolDefinition[]>([]);
  const [mcpServers, setMcpServers] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<VirtualApiKey[]>([]);
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [policies, setPolicies] = useState<IntentPolicy[]>([]);
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);

  const [metrics, setMetrics] = useState<RouterMetrics>({
    totalRequests: 2841,
    totalTokens: 42840000,
    totalPromptTokens: 29500000,
    totalCompletionTokens: 13340000,
    fallbacksAverted: 184,
    rateLimit429Simulations: 6,
    avgLatencyMs: 142,
    routerOverheadMs: 12,
    freePoolTokensUsed: 42840000,
    freePoolTokensTotal: 100000000,
    totalCostSavedUsd: 842.50,
    recentRequests: 42
  });

  const loadModels = async () => {
    try {
      const res = await fetch('/api/v1/models');
      const data = await res.json();
      if (data.data) setModels(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadProviders = async () => {
    try {
      const res = await fetch('/api/v1/providers');
      const data = await res.json();
      if (data.providers) setProviders(data.providers);
    } catch (e) {
      console.error(e);
    }
  };

  const loadPolicies = async () => {
    try {
      const res = await fetch('/api/v1/policies');
      const data = await res.json();
      if (data.policies) setPolicies(data.policies);
    } catch (e) {
      console.error(e);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch('/api/v1/stats');
      const data = await res.json();
      if (data.metrics) setMetrics(data.metrics);
    } catch (e) {
      console.error(e);
    }
  };

  const loadMcpTools = async () => {
    try {
      const res = await fetch('/api/v1/mcp/tools');
      const data = await res.json();
      if (data.tools) setMcpTools(data.tools);
      if (data.servers) setMcpServers(data.servers);
    } catch (e) {
      console.error(e);
    }
  };

  const loadKeys = async () => {
    try {
      const res = await fetch('/api/v1/keys');
      const data = await res.json();
      if (data.keys) setApiKeys(data.keys);
    } catch (e) {
      console.error(e);
    }
  };

  const loadLogs = async () => {
    try {
      const res = await fetch('/api/v1/logs');
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch (e) {
      console.error(e);
    }
  };

  const refreshAll = () => {
    loadStats();
    loadProviders();
    loadLogs();
    loadKeys();
    loadPolicies();
  };

  useEffect(() => {
    loadModels();
    loadProviders();
    loadPolicies();
    loadStats();
    loadMcpTools();
    loadKeys();
    loadLogs();

    const interval = setInterval(refreshAll, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleTogglePolicy = async (policyId: string) => {
    try {
      await fetch('/api/v1/policies/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policyId })
      });
      loadPolicies();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleSimulatePrimary = async () => {
    const primary = providers.find(p => p.priority === 1) || providers[0];
    if (!primary) return;

    try {
      const res = await fetch('/api/v1/providers/simulate-429', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId: primary.id })
      });
      const data = await res.json();
      setProviders(prev => prev.map(p => {
        if (p.id === primary.id) {
          return {
            ...p,
            simulateRateLimit429: data.simulateRateLimit429,
            health: data.simulateRateLimit429 ? 'rate_limited' : 'healthy'
          };
        }
        return p;
      }));
      loadStats();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#e5e5e5] flex font-sans selection:bg-[#0066ff]/30 selection:text-white">
      {/* 🏛️ Left-Hand Global Navigation Bar (Enterprise Multi-Page Architecture) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        metrics={metrics}
        providers={providers}
        onToggleSimulatePrimary={handleToggleSimulatePrimary}
        onOpenPlayground={() => setIsPlaygroundOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        {/* Top Minimalist Header */}
        <header className="sticky top-0 z-30 bg-[#000000]/90 backdrop-blur-md border-b border-[#1f1f1f] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-[#888888]">
            <span className="text-white font-semibold">❖ NEXUS ROUTER</span>
            <span>/</span>
            <span className="text-[#666666]">Acme-Dev</span>
            <span>/</span>
            <span className="text-[#0066ff] font-medium capitalize">{currentTab}</span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-[#888888] hidden sm:inline">
              ROI Ledger: <strong className="text-emerald-400 font-bold">${metrics.totalCostSavedUsd.toFixed(2)}</strong>
            </span>
            <button
              onClick={() => setIsPlaygroundOpen(true)}
              className="px-2.5 py-1 rounded bg-[#111111] hover:bg-[#1a1a1a] text-[#888888] hover:text-white border border-[#222222] text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Terminal className="w-3 h-3 text-[#0066ff]" />
              <span>Sandbox Console</span>
            </button>
          </div>
        </header>

        {/* Tab Modules */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {currentTab === 'overview' && (
            <OverviewModule
              metrics={metrics}
              policies={policies}
              logs={logs}
              providers={providers}
              onTogglePolicy={handleTogglePolicy}
              onOpenPlayground={() => setIsPlaygroundOpen(true)}
              onRefreshAll={refreshAll}
            />
          )}

          {currentTab === 'keys' && (
            <ApiKeysModule
              keys={apiKeys}
              onRefreshKeys={loadKeys}
            />
          )}

          {currentTab === 'mcp' && (
            <McpHubsModule
              tools={mcpTools}
              servers={mcpServers}
            />
          )}

          {currentTab === 'logs' && (
            <ApmLogsModule
              logs={logs}
              onRefreshLogs={loadLogs}
            />
          )}

          {currentTab === 'models' && (
            <ModelsCatalog
              models={models}
              onSelectModelForPlayground={() => {
                setIsPlaygroundOpen(true);
              }}
            />
          )}

          {currentTab === 'docs' && (
            <IntegrationDocs />
          )}
        </main>
      </div>

      {/* Live Testing Console / Playground Drawer */}
      <PlaygroundDrawer
        isOpen={isPlaygroundOpen}
        onClose={() => setIsPlaygroundOpen(false)}
        models={models}
        providers={providers}
        onRefreshMetrics={refreshAll}
      />
    </div>
  );
}
