import React, { useState } from 'react';
import { 
  Cpu, 
  ArrowDown, 
  ArrowUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Radio, 
  ShieldCheck, 
  Zap, 
  RefreshCw, 
  Settings2,
  HardDrive,
  Info
} from 'lucide-react';
import { ProviderConfig } from '../types.ts';

interface RoutingMatrixProps {
  providers: ProviderConfig[];
  onUpdateProviders: (updated: ProviderConfig[]) => void;
  onRefreshMetrics: () => void;
}

export const RoutingMatrix: React.FC<RoutingMatrixProps> = ({
  providers,
  onUpdateProviders,
  onRefreshMetrics
}) => {
  const [pingingId, setPingingId] = useState<string | null>(null);

  const movePriority = (index: number, direction: 'up' | 'down') => {
    const newProviders = [...providers];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newProviders.length) return;

    const temp = newProviders[index];
    newProviders[index] = newProviders[targetIndex];
    newProviders[targetIndex] = temp;

    // Re-assign priorities
    newProviders.forEach((p, idx) => {
      p.priority = idx + 1;
    });

    onUpdateProviders(newProviders);
  };

  const toggleEnable = (providerId: string) => {
    const updated = providers.map(p => {
      if (p.id === providerId) {
        return { ...p, enabled: !p.enabled };
      }
      return p;
    });
    onUpdateProviders(updated);
  };

  const toggleSimulate429 = async (providerId: string) => {
    try {
      const res = await fetch('/api/v1/providers/simulate-429', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId })
      });
      const data = await res.json();
      const updated = providers.map(p => {
        if (p.id === providerId) {
          return {
            ...p,
            simulateRateLimit429: data.simulateRateLimit429,
            health: data.simulateRateLimit429 ? ('rate_limited' as const) : ('healthy' as const)
          };
        }
        return p;
      });
      onUpdateProviders(updated);
      onRefreshMetrics();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePing = async (providerId: string) => {
    setPingingId(providerId);
    try {
      const res = await fetch('/api/v1/providers/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId })
      });
      const data = await res.json();
      const updated = providers.map(p => {
        if (p.id === providerId) {
          return { ...p, lastLatencyMs: data.latencyMs, health: data.health };
        }
        return p;
      });
      onUpdateProviders(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setPingingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-md">
              Load Balancer &amp; Failover Matrix
            </span>
            <span className="text-xs text-gray-400">Zero-Downtime Rate Limit Trapping</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Provider Fallback Pipeline</h2>
          <p className="text-sm text-gray-400 mt-1 max-w-2xl">
            Free tier API endpoints strictly enforce requests per minute. When any provider issues a <code className="text-amber-300">429 Too Many Requests</code>, the router catches it, switches to the next fallback instantly, and returns the response without failing the user.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-center">
            <div className="text-lg font-bold text-white font-mono">{providers.filter(p => p.enabled).length}</div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider">Active In Chain</div>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Flow Chart */}
      <div className="p-5 rounded-2xl bg-[#0d1117] border border-[#30363d] space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Live Execution Fallback Sequence</span>
        </h3>

        <div className="flex flex-col md:flex-row items-center gap-3 overflow-x-auto py-2">
          <div className="px-4 py-3 rounded-xl bg-[#161b22] border border-purple-500/40 text-center min-w-[140px] shrink-0">
            <div className="text-[10px] text-purple-400 font-mono font-bold uppercase">Client</div>
            <div className="text-xs font-semibold text-white mt-0.5">Cursor / Cline</div>
            <div className="text-[10px] text-gray-500">/v1/chat/completions</div>
          </div>

          <div className="text-gray-500 shrink-0 font-mono font-bold text-sm">➔</div>

          {providers.map((p, idx) => (
            <React.Fragment key={p.id}>
              <div className={`px-4 py-3 rounded-xl border text-center min-w-[160px] shrink-0 transition-all ${
                !p.enabled
                  ? 'bg-gray-900/40 border-gray-800 text-gray-600'
                  : p.simulateRateLimit429
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-200 shadow-md shadow-amber-500/5'
                  : 'bg-[#161b22] border-[#30363d] text-white hover:border-purple-500/40'
              }`}>
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className="text-gray-400 font-semibold">Priority #{p.priority}</span>
                  {p.simulateRateLimit429 ? (
                    <span className="text-amber-400 font-bold uppercase">429 Simulated</span>
                  ) : (
                    <span className="text-emerald-400 font-bold">{p.lastLatencyMs || 150}ms</span>
                  )}
                </div>
                <div className="text-xs font-semibold truncate">{p.name}</div>
                <div className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">
                  {p.id === 'ollama' ? 'localhost:11434' : 'Free Cloud'}
                </div>
              </div>

              {idx < providers.length - 1 && (
                <div className="text-gray-500 shrink-0 font-mono text-xs flex flex-col items-center">
                  <span className="text-[9px] text-amber-400/80 uppercase font-sans">if 429</span>
                  <span>➔</span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Provider Priority & Simulation Configuration Table */}
      <div className="rounded-2xl bg-[#161b22] border border-[#30363d] overflow-hidden">
        <div className="p-4 border-b border-[#30363d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-purple-400" />
            <h3 className="font-semibold text-white text-sm">Provider Ordering &amp; Resilience Controls</h3>
          </div>
          <span className="text-xs text-gray-400">Order dictates retry progression</span>
        </div>

        <div className="divide-y divide-[#30363d]">
          {providers.map((p, index) => (
            <div
              key={p.id}
              className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                p.simulateRateLimit429 ? 'bg-amber-500/5' : 'hover:bg-[#1a202c]'
              }`}
            >
              {/* Left Info */}
              <div className="flex items-center gap-3">
                {/* Reorder Buttons */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => movePriority(index, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded bg-[#21262d] text-gray-400 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="Move higher priority"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => movePriority(index, 'down')}
                    disabled={index === providers.length - 1}
                    className="p-1 rounded bg-[#21262d] text-gray-400 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="Move lower priority"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="w-7 h-7 rounded-lg bg-[#21262d] border border-[#30363d] flex items-center justify-center font-mono font-bold text-xs text-gray-300">
                  #{p.priority}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-white text-sm">{p.name}</h4>
                    {p.simulateRateLimit429 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        429 Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                    <span className="font-mono text-gray-500">{p.id}</span>
                    <span>•</span>
                    <span className="text-gray-400">{p.models.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Middle Metrics */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-gray-300 font-mono">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  <span>{p.lastLatencyMs || 180}ms</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    p.simulateRateLimit429 ? 'bg-amber-400' : p.enabled ? 'bg-emerald-400' : 'bg-gray-600'
                  }`} />
                  <span className="text-gray-300 capitalize text-xs">
                    {p.simulateRateLimit429 ? 'Rate Limited (Simulated)' : p.enabled ? 'Healthy' : 'Disabled'}
                  </span>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Ping Button */}
                <button
                  onClick={() => handlePing(p.id)}
                  disabled={pingingId === p.id}
                  className="px-2.5 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-xs text-gray-300 hover:text-white border border-[#30363d] flex items-center gap-1 cursor-pointer transition-colors"
                  title="Ping provider endpoint"
                >
                  <RefreshCw className={`w-3 h-3 ${pingingId === p.id ? 'animate-spin text-purple-400' : ''}`} />
                  <span>Ping</span>
                </button>

                {/* Simulate 429 Toggle */}
                <button
                  onClick={() => toggleSimulate429(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                    p.simulateRateLimit429
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                      : 'bg-[#0d1117] text-gray-400 border-[#30363d] hover:text-white hover:bg-[#21262d]'
                  }`}
                  title="Toggle 429 Rate Limit simulation for failover validation"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{p.simulateRateLimit429 ? 'Disable 429' : 'Simulate 429'}</span>
                </button>

                {/* Enable/Disable Toggle */}
                <button
                  onClick={() => toggleEnable(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                    p.enabled
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30'
                      : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {p.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Architectural Explanations (Phase 3 Roadmap) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>Exponential Backoff</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            The router wraps free endpoint requests with an automatic retry supervisor. If a vendor returns an intermittent network glitch, a rapid sub-second backoff is triggered prior to fallback.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Silent 429 Trapping</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            HTTP 429 responses are intercepted server-side. Rather than sending an error code back to Cursor or Cline, the router immediately reroutes the exact payload to the secondary free cloud provider.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <HardDrive className="w-4 h-4" />
            <span>Localhost Ollama Fallback</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            If all free cloud tiers simultaneously reach their daily/minute limits, the router fails over safely to your local Ollama daemon (<code className="text-gray-300 font-mono">http://localhost:11434</code>).
          </p>
        </div>
      </div>
    </div>
  );
};
