import React, { useState } from 'react';
import { 
  KeyRound, 
  Plus, 
  Copy, 
  Check, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert, 
  Sliders, 
  UserCheck, 
  Wrench,
  AlertCircle
} from 'lucide-react';
import { VirtualApiKey } from '../types.ts';

interface ApiKeysModuleProps {
  keys: VirtualApiKey[];
  onRefreshKeys: () => void;
}

export const ApiKeysModule: React.FC<ApiKeysModuleProps> = ({ keys, onRefreshKeys }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'Staff Engineer' | 'AI Agent Worker' | 'ML Ops Lead'>('Staff Engineer');
  const [newBudget, setNewBudget] = useState(500000);

  const allMcpScopes = [
    { id: 'web_search', label: 'web_search', desc: 'Realtime knowledge' },
    { id: 'calculator', label: 'calculator', desc: 'Math evaluation' },
    { id: 'system_status', label: 'system_status', desc: 'Hardware stats' },
    { id: 'datetime', label: 'datetime', desc: 'UTC & timezone' },
    { id: 'text_utils', label: 'text_utils', desc: 'Base64 & strings' }
  ];

  const copyKey = (id: string, keyVal: string) => {
    navigator.clipboard.writeText(keyVal);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleToggleScope = async (keyId: string, scopeName: string) => {
    try {
      await fetch('/api/v1/keys/toggle-scope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId, scopeName })
      });
      onRefreshKeys();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateKey = async () => {
    try {
      await fetch('/api/v1/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName || 'Agent Worker',
          memberEmail: newEmail || 'team@acme-dev.internal',
          teamRole: newRole,
          dailyBudgetTokens: newBudget
        })
      });
      setShowCreateModal(false);
      setNewName('');
      setNewEmail('');
      onRefreshKeys();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      await fetch(`/api/v1/keys/${id}`, { method: 'DELETE' });
      onRefreshKeys();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f1f1f] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase bg-[#141414] text-[#888888] px-2 py-0.5 rounded border border-[#222222]">
              RBAC &amp; RATE-LIMIT SECURITY
            </span>
            <span className="text-xs text-[#555555]">Zero-Trust MCP Scope Isolation</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight font-mono">Granular API Key Multi-Tenancy</h1>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3.5 py-1.5 rounded bg-[#0066ff] hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Provision Member Key</span>
        </button>
      </div>

      {/* Security Info Banner */}
      <div className="p-3.5 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] flex items-center justify-between text-xs text-[#888888] font-mono">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Token Budget Caps prevent single users from hogging the free tier quota. Allowed MCP Scopes restrict filesystem/shell execution.
          </span>
        </div>
        <div className="hidden md:block text-[#666666]">
          {keys.length} Active Credentials
        </div>
      </div>

      {/* Multi-Tenancy Table */}
      <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg overflow-hidden font-mono text-xs">
        <div className="p-3.5 border-b border-[#1f1f1f] flex items-center justify-between bg-[#050505]">
          <div className="flex items-center gap-2">
            <KeyRound className="w-3.5 h-3.5 text-[#0066ff]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              Team Member Keys &amp; Budget Allocations
            </h2>
          </div>
        </div>

        <div className="divide-y divide-[#181818]">
          {keys.map((k) => {
            const usagePercent = Math.min(
              Math.round(((k.usageTokens || 0) / (k.dailyBudgetTokens || 500000)) * 100),
              100
            );

            return (
              <div key={k.id} className="p-4 hover:bg-[#0f0f0f] transition-colors space-y-3">
                {/* Top Row: User & Role info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded bg-[#181818] border border-[#262626] flex items-center justify-center font-bold text-white text-xs">
                      {k.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{k.name}</span>
                        <span className="text-[10px] bg-[#141414] text-[#888888] px-1.5 py-0.2 rounded border border-[#222222]">
                          {k.teamRole}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#666666] font-sans">
                        {k.memberEmail}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[#888888] bg-[#000000] px-2 py-1 rounded border border-[#1f1f1f] select-all">
                      {k.key.substring(0, 15)}••••••••
                    </span>
                    <button
                      onClick={() => copyKey(k.id, k.key)}
                      className="p-1.5 rounded bg-[#181818] hover:bg-[#262626] text-[#888888] hover:text-white border border-[#222222] cursor-pointer"
                      title="Copy Key"
                    >
                      {copiedKeyId === k.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDeleteKey(k.id)}
                      className="p-1.5 rounded bg-[#181818] hover:bg-rose-500/20 text-[#666666] hover:text-rose-400 border border-[#222222] cursor-pointer"
                      title="Revoke Key"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Middle Row: Token Budget Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[#888888]">
                    <span>Daily Token Budget: <strong className="text-white font-normal">{(k.usageTokens || 0).toLocaleString()}</strong> / {(k.dailyBudgetTokens || 500000).toLocaleString()} tokens</span>
                    <span className={usagePercent > 80 ? 'text-amber-400 font-bold' : 'text-[#666666]'}>{usagePercent}% Consumed</span>
                  </div>
                  <div className="w-full bg-[#141414] rounded-full h-1.5 overflow-hidden border border-[#222222]">
                    <div 
                      style={{ width: `${usagePercent}%` }} 
                      className={`h-full rounded-full transition-all ${
                        usagePercent > 85 ? 'bg-amber-500' : 'bg-[#0066ff]'
                      }`}
                    />
                  </div>
                </div>

                {/* Bottom Row: Allowed MCP Scope Toggles as required by prompt */}
                <div className="pt-2 border-t border-[#181818] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#666666]">
                    <Wrench className="w-3 h-3 text-[#0066ff]" />
                    <span>Allowed MCP Scopes:</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {allMcpScopes.map((scope) => {
                      const isAllowed = k.allowedMcpScopes?.includes(scope.id);
                      return (
                        <button
                          key={scope.id}
                          onClick={() => handleToggleScope(k.id, scope.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer border ${
                            isAllowed
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold'
                              : 'bg-[#121212] text-[#555555] border-[#1e1e1e] line-through'
                          }`}
                          title={isAllowed ? `Click to block ${scope.id}` : `Click to permit ${scope.id}`}
                        >
                          {isAllowed ? `✓ ${scope.id}` : `✕ ${scope.id}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Provision Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg max-w-md w-full p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-3">
              <h3 className="font-bold text-white text-sm">Provision Enterprise Credential</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-[#666666] hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-sans">
              <div>
                <label className="text-xs text-[#888888] block mb-1 font-mono">Agent / Member Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. Cline-Worker-02"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#000000] border border-[#1f1f1f] rounded text-xs text-white focus:outline-none focus:border-[#0066ff] font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-[#888888] block mb-1 font-mono">Corporate Email</label>
                <input
                  type="email"
                  placeholder="worker@acme-dev.internal"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#000000] border border-[#1f1f1f] rounded text-xs text-white focus:outline-none focus:border-[#0066ff] font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-[#888888] block mb-1 font-mono">Daily Token Budget Cap</label>
                <input
                  type="number"
                  step="50000"
                  value={newBudget}
                  onChange={(e) => setNewBudget(parseInt(e.target.value) || 100000)}
                  className="w-full px-3 py-2 bg-[#000000] border border-[#1f1f1f] rounded text-xs text-white focus:outline-none focus:border-[#0066ff] font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#1f1f1f] flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 rounded bg-[#181818] text-[#888888] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateKey}
                className="px-3.5 py-1.5 rounded bg-[#0066ff] hover:bg-blue-600 text-white font-semibold cursor-pointer"
              >
                Generate Token
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
