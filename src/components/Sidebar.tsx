import React, { useState } from 'react';
import { 
  BarChart3, 
  KeyRound, 
  Puzzle, 
  FileText, 
  Terminal, 
  Layers, 
  ShieldAlert, 
  Copy, 
  Check, 
  Radio, 
  Zap, 
  SlidersHorizontal,
  ChevronDown,
  Building2,
  UserCheck,
  BookOpen
} from 'lucide-react';
import { RouterMetrics, ProviderConfig } from '../types.ts';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  metrics: RouterMetrics;
  providers: ProviderConfig[];
  onToggleSimulatePrimary: () => void;
  onOpenPlayground: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  metrics,
  providers,
  onToggleSimulatePrimary,
  onOpenPlayground
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
    { id: 'overview', label: 'Overview', icon: BarChart3, badge: `$${metrics.totalCostSavedUsd} ROI` },
    { id: 'models', label: 'Model Directory', icon: Layers, badge: 'OpenRouter' },
    { id: 'keys', label: 'API Keys', icon: KeyRound, badge: 'Multi-Tenant' },
    { id: 'mcp', label: 'MCP Hubs', icon: Puzzle, badge: '5 Tools' },
    { id: 'logs', label: 'APM Request Logs', icon: FileText, badge: `${metrics.totalRequests} Traces` },
    { id: 'docs', label: 'SDK & IDE Docs', icon: BookOpen, badge: 'Cursor/Cline' },
  ];

  return (
    <aside className="w-64 bg-[#0a0a0a] border-r border-[#1f1f1f] flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none z-40">
      {/* Top Brand & Workspace Header */}
      <div>
        <div className="p-4 border-b border-[#1f1f1f]">
          <div className="flex items-center gap-3">
            {/* Unique High-Tech Neural Router SVG Logo */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#111116] via-[#161622] to-[#0a0a0f] border border-[#262638] flex items-center justify-center p-1.5 shadow-[0_0_15px_rgba(0,102,255,0.25)] group hover:border-[#0066ff]/60 transition-all duration-300 relative overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0066ff]/15 via-transparent to-[#00f5a0]/15 pointer-events-none" />
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10 drop-shadow-[0_0_6px_rgba(0,245,160,0.6)]">
                <defs>
                  <linearGradient id="routerGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00f5a0" />
                    <stop offset="50%" stopColor="#0066ff" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                  <linearGradient id="routerGradCore" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
                {/* Outer hexagonal routing matrix */}
                <path d="M16 3L27 9.5V22.5L16 29L5 22.5V9.5L16 3Z" stroke="url(#routerGradPrimary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                {/* Convergent gateway vectors */}
                <path d="M16 3V16M27 22.5L16 16M5 22.5L16 16" stroke="url(#routerGradCore)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1.5 2.5" />
                {/* Central router nexus node */}
                <circle cx="16" cy="16" r="3.2" fill="#ffffff" />
                <circle cx="16" cy="16" r="1.6" fill="#0066ff" />
                {/* Peripheral satellite nodes */}
                <circle cx="16" cy="3" r="1.4" fill="#00f5a0" />
                <circle cx="27" cy="22.5" r="1.4" fill="#0066ff" />
                <circle cx="5" cy="22.5" r="1.4" fill="#8b5cf6" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white tracking-tight text-sm font-sans">Nexus Router</span>
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold tracking-wider">ONLINE</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#888888] mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Router: <strong className="text-[#cccccc] font-medium font-mono">auto-fallback</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Navigation Items */}
        <nav className="p-2.5 space-y-1">
          <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#555555]">
            Enterprise Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#141414] text-white border-l-2 border-[#0066ff] shadow-sm'
                    : 'text-[#888888] hover:text-white hover:bg-[#121212]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#0066ff]' : 'text-[#666666]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                    isActive 
                      ? 'bg-[#0066ff]/20 text-[#3b82f6] border border-[#0066ff]/30' 
                      : 'bg-[#181818] text-[#777777]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Action: Open Playground / Testing Sandbox */}
          <div className="pt-2">
            <button
              onClick={onOpenPlayground}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded text-xs font-semibold bg-[#0066ff]/10 hover:bg-[#0066ff]/20 text-[#3b82f6] border border-[#0066ff]/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#0066ff]" />
                <span>Test Console (Sandbox)</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-[#0066ff]/20 px-1 py-0.5 rounded">
                Live
              </span>
            </button>
          </div>
        </nav>
      </div>

      {/* Middle Status & Resiliency Controls */}
      <div className="p-3 border-t border-[#1f1f1f] space-y-2.5 bg-[#050505]">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#555555] flex items-center justify-between">
          <span>Failover Controls</span>
          <span className="text-emerald-400 font-bold">100% Free</span>
        </div>

        {/* 429 Intercept Toggle */}
        <button
          onClick={onToggleSimulatePrimary}
          className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs transition-all border cursor-pointer ${
            isPrimaryRateLimited
              ? 'bg-amber-500/15 border-amber-500/50 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
              : 'bg-[#0e0e12] border-[#22222b] text-[#9090a0] hover:text-white hover:border-[#333344] hover:bg-[#14141a]'
          }`}
          title="Toggle HTTP 429 Rate Limit Intercept on Primary provider to test immediate failover"
        >
          <div className="flex items-center gap-2.5 text-left truncate">
            <div className={`p-1 rounded ${isPrimaryRateLimited ? 'bg-amber-500/20 text-amber-400' : 'bg-[#181822] text-[#707080]'}`}>
              <ShieldAlert className={`w-3.5 h-3.5 shrink-0 ${isPrimaryRateLimited ? 'animate-pulse' : ''}`} />
            </div>
            <div className="truncate">
              <div className="text-[11px] font-semibold leading-tight truncate">
                {isPrimaryRateLimited ? 'Primary 429 Trapped' : 'Simulate 429 Rate Limit'}
              </div>
              <div className="text-[9px] text-[#666677] font-mono mt-0.5">
                {isPrimaryRateLimited ? 'Auto-Failover Active' : 'Test Silent Recovery'}
              </div>
            </div>
          </div>
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 border transition-all ${
            isPrimaryRateLimited 
              ? 'bg-amber-400 border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.6)]' 
              : 'bg-[#22222d] border-[#333340]'
          }`} />
        </button>

        {/* Base URL Copy Pill */}
        <div className="flex items-center justify-between bg-[#0c0c0c] border border-[#1f1f1f] rounded p-1.5 text-[11px] font-mono text-[#888888]">
          <span className="truncate mr-2 select-all text-[#aaaaaa]">/v1/chat/completions</span>
          <button
            onClick={copyBaseUrl}
            className="p-1 hover:text-white transition-colors cursor-pointer text-[#666666]"
            title="Copy Base URL"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Bottom User & System Footer */}
      <div className="p-3 border-t border-[#1f1f1f] bg-[#080808]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#1f1f1f] border border-[#333333] flex items-center justify-center font-mono text-[10px] text-white font-bold">
              AC
            </div>
            <div className="text-left">
              <div className="text-xs font-medium text-white leading-tight">Alex Chen</div>
              <div className="text-[10px] text-[#666666] font-mono">Staff Infra Eng</div>
            </div>
          </div>

          <div className="text-right font-mono text-[10px] text-[#555555]">
            <div className="text-emerald-400 flex items-center gap-1 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>12ms router</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
