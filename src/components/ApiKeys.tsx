import React, { useState } from 'react';
import { 
  Key, 
  Plus, 
  Copy, 
  Check, 
  Trash2, 
  ShieldCheck, 
  Zap, 
  Calendar, 
  HardDrive,
  ExternalLink
} from 'lucide-react';
import { VirtualApiKey } from '../types.ts';

interface ApiKeysProps {
  keys: VirtualApiKey[];
  onRefreshKeys: () => void;
}

export const ApiKeys: React.FC<ApiKeysProps> = ({ keys, onRefreshKeys }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [createdKeyAlert, setCreatedKeyAlert] = useState<string | null>(null);

  const copyKey = (id: string, keyVal: string) => {
    navigator.clipboard.writeText(keyVal);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleCreateKey = async () => {
    try {
      const res = await fetch('/api/v1/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: keyName || 'My Client Key' })
      });
      const data = await res.json();
      if (data.key) {
        setCreatedKeyAlert(data.key.key);
      }
      setShowCreateModal(false);
      setKeyName('');
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

  const totalTokens = keys.reduce((acc, k) => acc + (k.usageTokens || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-md">
              Virtual Credentials &amp; Auth
            </span>
            <span className="text-xs text-gray-400">OpenAI &amp; OpenRouter Header Compatible</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">API Key Management</h2>
          <p className="text-sm text-gray-400 mt-1 max-w-2xl">
            Create local virtual API keys to plug into Cursor, Cline, Claude Code, or Python scripts. Requests are securely verified and mapped to the free provider aggregator.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Key</span>
        </button>
      </div>

      {/* Created Key Banner if applicable */}
      {createdKeyAlert && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-emerald-300">New Key Generated Successfully!</div>
              <div className="font-mono text-xs text-white select-all mt-0.5">{createdKeyAlert}</div>
            </div>
          </div>
          <button
            onClick={() => copyKey('new', createdKeyAlert)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium cursor-pointer"
          >
            {copiedKeyId === 'new' ? 'Copied!' : 'Copy Key'}
          </button>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d]">
          <div className="text-xs text-gray-400">Active Keys</div>
          <div className="text-xl font-bold text-white font-mono mt-1">{keys.length}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d]">
          <div className="text-xs text-gray-400">Total Key Consumption</div>
          <div className="text-xl font-bold text-purple-400 font-mono mt-1">{totalTokens.toLocaleString()} tokens</div>
        </div>
        <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d]">
          <div className="text-xs text-gray-400">Billed Total</div>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-1">$0.00 (100% Free)</div>
        </div>
      </div>

      {/* Keys Table */}
      <div className="rounded-2xl bg-[#161b22] border border-[#30363d] overflow-hidden">
        <div className="p-4 border-b border-[#30363d] flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <Key className="w-4 h-4 text-purple-400" />
            <span>Configured Router Keys</span>
          </h3>
          <span className="text-xs text-gray-400">Bearer Token Format</span>
        </div>

        <div className="divide-y divide-[#30363d]">
          {keys.map((k) => (
            <div key={k.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#1a202c] transition-colors">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">{k.name}</span>
                  <span className="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-1.5 py-0.2 rounded font-mono">
                    active
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-xs text-gray-400 bg-[#0d1117] px-2 py-0.5 rounded border border-[#30363d]">
                    {k.key.substring(0, 14)}••••••••{k.key.substring(k.key.length - 4)}
                  </span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-400">
                    Created {new Date(k.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right text-xs">
                  <div className="text-gray-300 font-mono">{k.usageTokens || 0} tokens</div>
                  <div className="text-[11px] text-gray-500">Usage</div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => copyKey(k.id, k.key)}
                    className="p-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-gray-300 hover:text-white border border-[#30363d] transition-colors cursor-pointer"
                    title="Copy full API key"
                  >
                    {copiedKeyId === k.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteKey(k.id)}
                    className="p-2 rounded-lg bg-[#21262d] hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 border border-[#30363d] hover:border-rose-500/30 transition-colors cursor-pointer"
                    title="Delete API key"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Generate Virtual OpenRouter Key</h3>
            <p className="text-xs text-gray-400">
              Provide a label for this key to identify which client IDE or local agent is consuming router quota.
            </p>

            <div>
              <label className="text-xs text-gray-300 block mb-1">Key Name / Description</label>
              <input
                type="text"
                placeholder="e.g. Cursor IDE, Cline Extension, Python Agent"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="pt-3 border-t border-[#30363d] flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl bg-[#21262d] text-xs text-gray-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateKey}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white cursor-pointer"
              >
                Generate Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
