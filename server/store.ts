import { BUILTIN_MCP_TOOLS } from './mcp/builtinTools.ts';

export interface ProviderConfig {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  apiKey: string;
  baseUrl?: string;
  simulateRateLimit429: boolean;
  lastLatencyMs?: number;
  health: 'healthy' | 'rate_limited' | 'offline';
  models: string[];
}

export interface TraceSpan {
  id: string;
  name: string;
  category: 'gateway' | 'mcp' | 'provider' | 'failover' | 'client';
  startMs: number;
  durationMs: number;
  status: 'ok' | 'error' | 'intercepted';
  details?: string;
}

export interface RequestLog {
  id: string;
  timestamp: number;
  clientTag: string;
  modelRequested: string;
  providerResolved: string;
  modelResolved: string;
  status: number;
  durationMs: number;
  ttftMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  fallbacksTriggered: string[];
  mcpToolCalls?: Array<{
    name: string;
    args: any;
    result: any;
  }>;
  spans: TraceSpan[];
  costSavedVsOpenAi: number;
}

export interface IntentPolicy {
  id: string;
  name: string;
  intentTag: string;
  description: string;
  primaryLlm: string;
  failoverChain: string[];
  enabled: boolean;
  mcpAccessRequired: boolean;
  maxLatencySlaMs: number;
}

export interface RouterMetrics {
  totalRequests: number;
  totalTokens: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  fallbacksAverted: number;
  rateLimit429Simulations: number;
  avgLatencyMs: number;
  routerOverheadMs: number;
  freePoolTokensUsed: number;
  freePoolTokensTotal: number;
  totalCostSavedUsd: number;
  recentRequests: number;
}

export interface VirtualApiKey {
  id: string;
  name: string;
  key: string;
  memberEmail: string;
  teamRole: 'Staff Engineer' | 'ML Ops Lead' | 'AI Agent Worker' | 'DevOps Specialist';
  createdAt: number;
  lastUsedAt?: number;
  usageTokens: number;
  dailyBudgetTokens: number;
  allowedMcpScopes: string[];
  rateLimitRpm: number;
  status: 'active' | 'budget_exceeded' | 'suspended';
}

export interface MCPServerConfig {
  id: string;
  name: string;
  type: 'builtin' | 'sse' | 'stdio';
  urlOrCommand: string;
  enabled: boolean;
  toolsCount: number;
  status: 'online' | 'standby' | 'error';
  scopeTag: 'read-only' | 'system' | 'sandboxed' | 'network';
}

class Store {
  providers: ProviderConfig[] = [
    {
      id: "google",
      name: "Google Gemini 3.8 Flash (Free Tier)",
      enabled: true,
      priority: 1,
      apiKey: process.env.GEMINI_API_KEY || "",
      simulateRateLimit429: false,
      lastLatencyMs: 140,
      health: 'healthy',
      models: ["google/gemini-3.8-flash", "google/gemini-2.5-flash"]
    },
    {
      id: "groq",
      name: "Groq LPU (Llama 3.3 70B Free)",
      enabled: true,
      priority: 2,
      apiKey: process.env.GROQ_API_KEY || "",
      simulateRateLimit429: false,
      lastLatencyMs: 82,
      health: 'healthy',
      models: ["meta-llama/llama-3.3-70b-instruct:free", "mistralai/mistral-7b-instruct:free"]
    },
    {
      id: "sambanova",
      name: "SambaNova Systems (R1 Free Tier)",
      enabled: true,
      priority: 3,
      apiKey: process.env.SAMBANOVA_API_KEY || "",
      simulateRateLimit429: false,
      lastLatencyMs: 290,
      health: 'healthy',
      models: ["deepseek/deepseek-r1:free"]
    },
    {
      id: "cerebras",
      name: "Cerebras CS-3 (Qwen Coder Free)",
      enabled: true,
      priority: 4,
      apiKey: process.env.CEREBRAS_API_KEY || "",
      simulateRateLimit429: false,
      lastLatencyMs: 115,
      health: 'healthy',
      models: ["qwen/qwen-2.5-coder-32b-instruct:free"]
    },
    {
      id: "ollama",
      name: "Ollama Daemon (Local CPU/GPU Air-Gap)",
      enabled: true,
      priority: 5,
      apiKey: "",
      baseUrl: "http://localhost:11434",
      simulateRateLimit429: false,
      lastLatencyMs: 460,
      health: 'healthy',
      models: ["ollama/llama3.1:local"]
    }
  ];

  intentPolicies: IntentPolicy[] = [
    {
      id: "policy-coding",
      name: "High-Throughput Code Generation",
      intentTag: "⌨️ Heavy Coding",
      description: "Optimized for continuous code completions, diff patching, and automated refactoring with minimal latency.",
      primaryLlm: "qwen/qwen-2.5-coder-32b-instruct:free",
      failoverChain: ["google/gemini-3.8-flash", "deepseek/deepseek-r1:free", "ollama/llama3.1:local"],
      enabled: true,
      mcpAccessRequired: true,
      maxLatencySlaMs: 800
    },
    {
      id: "policy-autocomplete",
      name: "Sub-100ms Inline Completion",
      intentTag: "⚡ Fast Autocomplete",
      description: "Directs sub-line snippet queries to ultra-fast inference processors with sub-100ms TTFT.",
      primaryLlm: "meta-llama/llama-3.3-70b-instruct:free",
      failoverChain: ["cerebras/qwen-coder", "ollama/llama3.1:local"],
      enabled: true,
      mcpAccessRequired: false,
      maxLatencySlaMs: 150
    },
    {
      id: "policy-reasoning",
      name: "Complex Mathematical & Logical Reasoning",
      intentTag: "🧠 Deep Reasoning",
      description: "Allocates multi-step proofs, algorithmic verification, and STEM logic to large-context models.",
      primaryLlm: "deepseek/deepseek-r1:free",
      failoverChain: ["google/gemini-3.8-flash", "meta-llama/llama-3.3-70b-instruct:free"],
      enabled: true,
      mcpAccessRequired: true,
      maxLatencySlaMs: 2500
    },
    {
      id: "policy-private",
      name: "Zero-Data-Retention / PII Air-Gap",
      intentTag: "🔒 Confidential Local",
      description: "Enforces air-gapped processing for sensitive repository files, credentials, and local environment configs.",
      primaryLlm: "ollama/llama3.1:local",
      failoverChain: [],
      enabled: true,
      mcpAccessRequired: true,
      maxLatencySlaMs: 1200
    }
  ];

  apiKeys: VirtualApiKey[] = [
    {
      id: "key-staff-eng",
      name: "Staff Infra Agent (Alex Chen)",
      key: "sk-nexus-dev-alex-89a1",
      memberEmail: "alex.chen@acme-dev.internal",
      teamRole: "Staff Engineer",
      createdAt: Date.now() - 172800000,
      lastUsedAt: Date.now() - 240000,
      usageTokens: 184500,
      dailyBudgetTokens: 500000,
      allowedMcpScopes: ["web_search", "calculator", "system_status", "text_utils"],
      rateLimitRpm: 120,
      status: "active"
    },
    {
      id: "key-cline-worker",
      name: "Cline IDE Autonomous Agent",
      key: "sk-nexus-dev-cline-worker",
      memberEmail: "cline-agent@acme-dev.internal",
      teamRole: "AI Agent Worker",
      createdAt: Date.now() - 86400000,
      lastUsedAt: Date.now() - 45000,
      usageTokens: 412000,
      dailyBudgetTokens: 1000000,
      allowedMcpScopes: ["calculator", "datetime", "system_status", "text_utils"],
      rateLimitRpm: 300,
      status: "active"
    },
    {
      id: "key-mlops-lead",
      name: "MLOps Production Evaluator",
      key: "sk-nexus-dev-mlops-eval",
      memberEmail: "sarah.lin@acme-dev.internal",
      teamRole: "ML Ops Lead",
      createdAt: Date.now() - 259200000,
      lastUsedAt: Date.now() - 1800000,
      usageTokens: 92400,
      dailyBudgetTokens: 250000,
      allowedMcpScopes: ["web_search", "system_status"],
      rateLimitRpm: 60,
      status: "active"
    }
  ];

  mcpServers: MCPServerConfig[] = [
    {
      id: "mcp-builtin",
      name: "Nexus Core MCP Tools Hub",
      type: "builtin",
      urlOrCommand: "internal://nexus-core-mcp",
      enabled: true,
      toolsCount: Object.keys(BUILTIN_MCP_TOOLS).length,
      status: "online",
      scopeTag: "sandboxed"
    },
    {
      id: "mcp-fs-cluster",
      name: "Workspace Filesystem MCP Daemon",
      type: "stdio",
      urlOrCommand: "npx @modelcontextprotocol/server-filesystem /workspace",
      enabled: true,
      toolsCount: 6,
      status: "online",
      scopeTag: "read-only"
    },
    {
      id: "mcp-pg-replica",
      name: "PostgreSQL Read Replica MCP",
      type: "sse",
      urlOrCommand: "http://pg-mcp.internal:8080/sse",
      enabled: true,
      toolsCount: 3,
      status: "standby",
      scopeTag: "network"
    }
  ];

  logs: RequestLog[] = [
    {
      id: "req-trace-live-904",
      timestamp: Date.now() - 32000,
      clientTag: "Cline-Agent-Req_xyz89",
      modelRequested: "openrouter/auto",
      providerResolved: "google",
      modelResolved: "google/gemini-3.8-flash",
      status: 200,
      durationMs: 380,
      ttftMs: 142,
      promptTokens: 1420,
      completionTokens: 384,
      totalTokens: 1804,
      fallbacksTriggered: ["Groq (Llama-3.3-70B): 429 Rate Limit Intercepted"],
      mcpToolCalls: [
        {
          name: "calculator",
          args: { expression: "(42.8 * 1000000) * 0.00002" },
          result: "Calculation Result: 856.0"
        }
      ],
      spans: [
        {
          id: "span-1",
          name: "Router Gateway Received Payload & Verified Auth",
          category: "gateway",
          startMs: 0,
          durationMs: 4,
          status: "ok",
          details: "Validated token for Cline-Agent-Req_xyz89 (RateLimit: 120 RPM, Scope OK)"
        },
        {
          id: "span-2",
          name: 'Evaluated Tool Context via Local MCP Server "fs-cluster"',
          category: "mcp",
          startMs: 4,
          durationMs: 8,
          status: "ok",
          details: "Queried schema registry (5 active functions exported)"
        },
        {
          id: "span-3",
          name: "Forwarding Call to Groq (Llama-3.3-70b-Free)...",
          category: "provider",
          startMs: 12,
          durationMs: 84,
          status: "intercepted",
          details: "HTTP 429 Rate Limit Intercepted. Auto-failover initiated (0 dropped frames)"
        },
        {
          id: "span-4",
          name: "Failover Triggered: Successfully executed via Gemini Flash Free Tier",
          category: "failover",
          startMs: 96,
          durationMs: 270,
          status: "ok",
          details: "Stream returned 384 tokens with full tool invocation payload"
        },
        {
          id: "span-5",
          name: "Synthesized Final Output & Flushed to Client",
          category: "client",
          startMs: 366,
          durationMs: 14,
          status: "ok",
          details: "Delivered 200 OK stream (TTFT: 142ms, Cost: $0.00)"
        }
      ],
      costSavedVsOpenAi: 0.038
    },
    {
      id: "req-trace-live-903",
      timestamp: Date.now() - 110000,
      clientTag: "Cursor-IDE-Worker_a12",
      modelRequested: "qwen/qwen-2.5-coder-32b-instruct:free",
      providerResolved: "cerebras",
      modelResolved: "qwen/qwen-2.5-coder-32b-instruct:free",
      status: 200,
      durationMs: 118,
      ttftMs: 54,
      promptTokens: 820,
      completionTokens: 210,
      totalTokens: 1030,
      fallbacksTriggered: [],
      spans: [
        {
          id: "span-c1",
          name: "Router Gateway Received Payload",
          category: "gateway",
          startMs: 0,
          durationMs: 3,
          status: "ok"
        },
        {
          id: "span-c2",
          name: "Dispatched to Cerebras CS-3 Fast Inference",
          category: "provider",
          startMs: 3,
          durationMs: 105,
          status: "ok",
          details: "Completed in 105ms at 180 tokens/sec"
        },
        {
          id: "span-c3",
          name: "Delivered Response Stream",
          category: "client",
          startMs: 108,
          durationMs: 10,
          status: "ok"
        }
      ],
      costSavedVsOpenAi: 0.024
    }
  ];

  metrics: RouterMetrics = {
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
  };

  addLog(log: RequestLog) {
    this.logs.unshift(log);
    if (this.logs.length > 200) {
      this.logs.pop();
    }

    this.metrics.totalRequests += 1;
    this.metrics.totalTokens += log.totalTokens;
    this.metrics.freePoolTokensUsed += log.totalTokens;
    this.metrics.totalPromptTokens += log.promptTokens;
    this.metrics.totalCompletionTokens += log.completionTokens;
    if (log.fallbacksTriggered.length > 0) {
      this.metrics.fallbacksAverted += log.fallbacksTriggered.length;
    }

    // Compute cost saved vs OpenAI GPT-4o base ($2.50 / 1M prompt, $10.00 / 1M completion)
    const costSavedThisReq = (log.promptTokens / 1000000 * 2.50) + (log.completionTokens / 1000000 * 10.00);
    this.metrics.totalCostSavedUsd = Number((this.metrics.totalCostSavedUsd + costSavedThisReq).toFixed(2));
    log.costSavedVsOpenAi = Number(costSavedThisReq.toFixed(4));

    // Rolling latency
    const count = Math.min(this.logs.length, 20);
    const sum = this.logs.slice(0, count).reduce((acc, curr) => acc + curr.durationMs, 0);
    this.metrics.avgLatencyMs = Math.round(sum / count);
  }

  toggleSimulate429(providerId: string, simulate?: boolean) {
    const prov = this.providers.find(p => p.id === providerId);
    if (prov) {
      prov.simulateRateLimit429 = simulate !== undefined ? simulate : !prov.simulateRateLimit429;
      prov.health = prov.simulateRateLimit429 ? 'rate_limited' : 'healthy';
      if (prov.simulateRateLimit429) {
        this.metrics.rateLimit429Simulations += 1;
      }
      return prov.simulateRateLimit429;
    }
    return false;
  }

  togglePolicy(policyId: string) {
    const policy = this.intentPolicies.find(p => p.id === policyId);
    if (policy) {
      policy.enabled = !policy.enabled;
    }
    return policy;
  }

  toggleKeyScope(keyId: string, scopeName: string) {
    const k = this.apiKeys.find(item => item.id === keyId);
    if (k) {
      if (k.allowedMcpScopes.includes(scopeName)) {
        k.allowedMcpScopes = k.allowedMcpScopes.filter(s => s !== scopeName);
      } else {
        k.allowedMcpScopes.push(scopeName);
      }
      return k;
    }
    return null;
  }

  createApiKey(name: string, memberEmail?: string, role?: any, budget?: number): VirtualApiKey {
    const rand = Math.random().toString(36).substring(2, 9);
    const newKey: VirtualApiKey = {
      id: `key-${Date.now()}`,
      name: name || 'Team API Key',
      key: `sk-nexus-dev-${rand}`,
      memberEmail: memberEmail || 'dev@acme-dev.internal',
      teamRole: role || 'Staff Engineer',
      createdAt: Date.now(),
      usageTokens: 0,
      dailyBudgetTokens: budget || 500000,
      allowedMcpScopes: ["web_search", "calculator", "system_status"],
      rateLimitRpm: 120,
      status: "active"
    };
    this.apiKeys.push(newKey);
    return newKey;
  }

  deleteApiKey(id: string) {
    this.apiKeys = this.apiKeys.filter(k => k.id !== id);
  }
}

export const store = new Store();
