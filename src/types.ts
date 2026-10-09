export interface ModelInfo {
  id: string;
  name: string;
  created: number;
  description: string;
  context_length: number;
  architecture: {
    modality: string;
    tokenizer: string;
    instruct_type?: string;
  };
  pricing: {
    prompt: string;
    completion: string;
  };
  capabilities: {
    tools: boolean;
    vision: boolean;
    reasoning: boolean;
    json: boolean;
  };
  provider: 'google' | 'groq' | 'cerebras' | 'sambanova' | 'ollama' | 'openrouter';
  is_free: boolean;
  badge?: string;
}

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
  spans?: TraceSpan[];
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

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
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

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
  modelUsed?: string;
  providerUsed?: string;
  durationMs?: number;
  ttftMs?: number;
  tokens?: number;
  fallbacksTriggered?: string[];
  mcpToolCalls?: Array<{
    name: string;
    args: any;
    result: any;
  }>;
  spans?: TraceSpan[];
}
