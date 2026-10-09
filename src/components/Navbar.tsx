import React, { useState } from 'react';
import { 
  Sparkles, 
  Terminal, 
  Cpu, 
  Layers, 
  Wrench, 
  Key, 
  Activity, 
  BookOpen, 
  Copy, 
  Check, 
  AlertTriangle,
  Radio
} from 'lucide-react';
import { RouterMetrics, ProviderConfig } from '../types.ts';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  metrics: RouterMetrics;
  providers: ProviderConfig[];
  onToggleSimulatePrimary: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  metrics,
  providers,
  onToggleSimulatePrimary
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);

  const primaryProvider = providers.find(p => p.priority === 1) || providers[0];
  const isPrimaryRateLimited = primaryProvider?.simulateRateLimit429;

  const copyBaseUrl = () => {
    const url = `${window.location.origin}/v1`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const navItems = [
    { id: 'models', label: 'Models', icon: Layers, badge: 'Free' },
    { id: 'playground', label: 'Playground', icon: Terminal },
    { id: 'routing', label: 'Routing & Fallback', icon: Cpu, badge: metrics.fallbacksAverted > 0 ? `${metrics.fallbacksAverted} Averted` : undefined },
    { id: 'mcp', label: 'MCP Tools', icon: Wrench },
    { id: 'keys', label: 'API Keys', icon: Key },
    { id: 'activity', label: 'Activity Logs', icon: Activity },
    { id: 'docs', label: 'Quickstart & IDEs', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0d1117]/90 backdrop-blur-md border-b border-[#30363d] px-4 lg:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base tracking-tight font-mono">OpenRouter Hub</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Free MCP Router
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Gateway Online
                </span>
                <span>•</span>
                <span className="font-mono text-gray-400">{metrics.avgLatencyMs}ms avg</span>
                <span>•</span>
                <span className="text-gray-400">{metrics.totalRequests} reqs</span>
              </div>
            </div>
          </div>

          {/* Mobile Quick Action */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={copyBaseUrl}
              className="p-1.5 rounded-lg bg-[#21262d] text-gray-300 hover:text-white border border-[#30363d]"
              title="Copy Base URL"
            >
              {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#21262d] text-white shadow-sm border border-[#30363d]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#161b22]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-400' : 'text-gray-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    item.badge.includes('Averted') 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Tools & Copy URL */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Quick Fallback Simulation Toggle */}
          <button
            onClick={onToggleSimulatePrimary}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
              isPrimaryRateLimited
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-[#161b22] text-gray-400 border-[#30363d] hover:text-gray-200 hover:bg-[#21262d]'
            }`}
            title="Simulate 429 on Primary to test transparent failover in real-time"
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${isPrimaryRateLimited ? 'text-amber-400 animate-pulse' : 'text-gray-500'}`} />
            <span>{isPrimaryRateLimited ? 'Primary 429 Active (Fallback On)' : 'Simulate 429'}</span>
          </button>

          {/* Copy Base URL Button */}
          <button
            onClick={copyBaseUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-white text-xs font-mono font-medium border border-[#30363d] transition-colors cursor-pointer"
            title="Copy OpenAI / OpenRouter Base URL for Cursor/Cline"
          >
            {copiedUrl ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied /v1</span>
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5 text-purple-400" />
                <span>Base URL: /v1</span>
                <Copy className="w-3 h-3 text-gray-400 ml-0.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
