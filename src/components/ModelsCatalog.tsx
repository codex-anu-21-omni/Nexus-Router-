import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Layers, 
  Cpu, 
  Sparkles, 
  Copy, 
  Check, 
  ArrowRight, 
  CheckCircle2, 
  SlidersHorizontal,
  Code2,
  Eye,
  BrainCircuit,
  Wrench,
  Zap
} from 'lucide-react';
import { ModelInfo } from '../types.ts';

interface ModelsCatalogProps {
  models: ModelInfo[];
  onSelectModelForPlayground: (modelId: string) => void;
}

export const ModelsCatalog: React.FC<ModelsCatalogProps> = ({
  models,
  onSelectModelForPlayground
}) => {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const tags = [
    { id: 'all', label: 'All Models' },
    { id: 'free', label: 'Free Tiers (:free)' },
    { id: 'tools', label: 'MCP / Tools' },
    { id: 'reasoning', label: 'Reasoning' },
    { id: 'coding', label: 'Coding' },
    { id: 'vision', label: 'Vision' },
  ];

  const providers = ['all', 'google', 'groq', 'sambanova', 'cerebras', 'ollama', 'openrouter'];

  const filteredModels = useMemo(() => {
    return models.filter((m) => {
      const matchesSearch = 
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.id.toLowerCase().includes(search.toLowerCase()) ||
        m.description.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (selectedProvider !== 'all' && m.provider !== selectedProvider) return false;
      if (selectedTag === 'free' && !m.is_free) return false;
      if (selectedTag === 'tools' && !m.capabilities.tools) return false;
      if (selectedTag === 'reasoning' && !m.capabilities.reasoning) return false;
      if (selectedTag === 'coding' && !m.name.toLowerCase().includes('coder') && !m.description.toLowerCase().includes('code')) return false;
      if (selectedTag === 'vision' && !m.capabilities.vision) return false;

      return true;
    });
  }, [models, search, selectedTag, selectedProvider]);

  const copyModelId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatContext = (tokens: number) => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1).replace('.0', '')}M context`;
    if (tokens >= 1000) return `${Math.round(tokens / 1000)}k context`;
    return `${tokens} context`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f1f1f] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase bg-[#0066ff]/10 text-[#0066ff] px-2 py-0.5 rounded border border-[#0066ff]/30 font-bold">
              NEXUS ROUTER MODELS
            </span>
            <span className="text-xs text-[#555555]">Unified OpenAI &amp; Anthropic Namespace</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight font-sans">Nexus Router Models Directory</h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#888888]">Catalog Size:</span>
          <span className="text-white font-semibold">{models.length} Models Ready</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3 font-mono text-xs">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#555555] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by model ID, vendor, or architecture..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-[#0a0a0a] border border-[#1f1f1f] rounded text-white placeholder-[#555555] focus:outline-none focus:border-[#0066ff]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="px-2.5 py-1.5 bg-[#0a0a0a] border border-[#1f1f1f] rounded text-xs text-[#888888] focus:outline-none focus:border-[#0066ff] capitalize"
            >
              {providers.map((p) => (
                <option key={p} value={p}>
                  {p === 'all' ? 'All Providers' : p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tag Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {tags.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTag(t.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer whitespace-nowrap border ${
                selectedTag === t.id
                  ? 'bg-[#141414] text-white border-[#0066ff] font-semibold'
                  : 'bg-[#0a0a0a] text-[#777777] border-[#1a1a1a] hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredModels.map((model) => (
          <div
            key={model.id}
            onClick={() => onSelectModelForPlayground(model.id)}
            className="p-3.5 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[#333333] transition-all cursor-pointer flex flex-col justify-between space-y-3"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-1 font-mono">
                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-[#161616] text-[#aaaaaa] border border-[#222222]">
                      {model.provider}
                    </span>
                    {model.badge && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-[#0066ff]/10 text-[#3b82f6] border border-[#0066ff]/20">
                        {model.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-white text-sm">
                    {model.name}
                  </h3>
                </div>

                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                  FREE
                </span>
              </div>

              {/* Model ID snippet */}
              <div className="flex items-center justify-between bg-[#000000] px-2 py-1 rounded border border-[#1a1a1a] mb-2 font-mono text-[11px]">
                <span className="text-[#888888] truncate mr-2 select-all">
                  {model.id}
                </span>
                <button
                  onClick={(e) => copyModelId(model.id, e)}
                  className="text-[#555555] hover:text-white p-0.5 rounded cursor-pointer"
                  title="Copy ID"
                >
                  {copiedId === model.id ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>

              <p className="text-[11px] text-[#777777] line-clamp-2 mb-2 font-sans">
                {model.description}
              </p>

              {/* Specs */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                <span className="px-1.5 py-0.5 rounded bg-[#121212] text-[#aaaaaa] border border-[#1e1e1e]">
                  {formatContext(model.context_length)}
                </span>
                {model.capabilities.tools && (
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Tools
                  </span>
                )}
                {model.capabilities.reasoning && (
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Reasoning
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="pt-2 border-t border-[#161616] flex items-center justify-between text-[11px] font-mono text-[#666666]">
              <span>Prompt: $0.00 / 1M</span>
              <span className="flex items-center gap-1 text-[#0066ff] hover:underline">
                Test in Console
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
