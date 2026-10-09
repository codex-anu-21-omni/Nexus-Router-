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
    image?: string;
    request?: string;
  };
  top_provider: {
    context_length: number;
    max_completion_tokens: number;
    is_moderated: boolean;
  };
  per_request_limits: null | {
    prompt_tokens?: string;
    completion_tokens?: string;
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

export const OPENROUTER_MODELS: ModelInfo[] = [
  {
    id: "openrouter/auto",
    name: "Auto Router (Best Free Provider)",
    created: 1710000000,
    description: "Intelligent auto-router that automatically balances between Gemini, Groq, SambaNova and Ollama with zero-downtime 429 auto-fallback.",
    context_length: 1048576,
    architecture: {
      modality: "text->text",
      tokenizer: "gemini",
      instruct_type: "chat"
    },
    pricing: {
      prompt: "0",
      completion: "0"
    },
    top_provider: {
      context_length: 1048576,
      max_completion_tokens: 8192,
      is_moderated: false
    },
    per_request_limits: null,
    capabilities: {
      tools: true,
      vision: true,
      reasoning: true,
      json: true
    },
    provider: "openrouter",
    is_free: true,
    badge: "Auto Fallback"
  },
  {
    id: "google/gemini-3.8-flash",
    name: "Google: Gemini 3.8 Flash (Free Tier)",
    created: 1735000000,
    description: "Ultra-fast multimodal reasoning model from Google with massive context window, tool calling, and high throughput.",
    context_length: 1048576,
    architecture: {
      modality: "multimodal->text",
      tokenizer: "gemini",
      instruct_type: "gemini"
    },
    pricing: {
      prompt: "0",
      completion: "0"
    },
    top_provider: {
      context_length: 1048576,
      max_completion_tokens: 8192,
      is_moderated: true
    },
    per_request_limits: null,
    capabilities: {
      tools: true,
      vision: true,
      reasoning: true,
      json: true
    },
    provider: "google",
    is_free: true,
    badge: "1M Context"
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    name: "Meta: Llama 3.3 70B Instruct (Free)",
    created: 1734000000,
    description: "Flagship open-weights model by Meta. Industry-leading instruction following, coding, and logical reasoning on fast inference chips.",
    context_length: 131072,
    architecture: {
      modality: "text->text",
      tokenizer: "llama3",
      instruct_type: "llama3"
    },
    pricing: {
      prompt: "0",
      completion: "0"
    },
    top_provider: {
      context_length: 131072,
      max_completion_tokens: 8192,
      is_moderated: false
    },
    per_request_limits: null,
    capabilities: {
      tools: true,
      vision: false,
      reasoning: true,
      json: true
    },
    provider: "groq",
    is_free: true,
    badge: "Free Tier"
  },
  {
    id: "deepseek/deepseek-r1:free",
    name: "DeepSeek: DeepSeek R1 (Free)",
    created: 1737000000,
    description: "Breakthrough open reasoning model featuring deep chain-of-thought verification, math proofs, and rigorous code generation.",
    context_length: 65536,
    architecture: {
      modality: "text->text",
      tokenizer: "deepseek",
      instruct_type: "deepseek"
    },
    pricing: {
      prompt: "0",
      completion: "0"
    },
    top_provider: {
      context_length: 65536,
      max_completion_tokens: 8192,
      is_moderated: false
    },
    per_request_limits: null,
    capabilities: {
      tools: true,
      vision: false,
      reasoning: true,
      json: true
    },
    provider: "sambanova",
    is_free: true,
    badge: "Reasoning"
  },
  {
    id: "qwen/qwen-2.5-coder-32b-instruct:free",
    name: "Qwen: Qwen 2.5 Coder 32B Instruct (Free)",
    created: 1731000000,
    description: "Top-tier specialized coding model fine-tuned for code synthesis, debugging, tool integration, and refactoring.",
    context_length: 131072,
    architecture: {
      modality: "text->text",
      tokenizer: "qwen",
      instruct_type: "chatml"
    },
    pricing: {
      prompt: "0",
      completion: "0"
    },
    top_provider: {
      context_length: 131072,
      max_completion_tokens: 8192,
      is_moderated: false
    },
    per_request_limits: null,
    capabilities: {
      tools: true,
      vision: false,
      reasoning: true,
      json: true
    },
    provider: "cerebras",
    is_free: true,
    badge: "Coding Specialist"
  },
  {
    id: "mistralai/mistral-7b-instruct:free",
    name: "Mistral: Mistral 7B Instruct (Free)",
    created: 1700000000,
    description: "Compact, rapid instruction-following model with fast response times and low latency footprint.",
    context_length: 32768,
    architecture: {
      modality: "text->text",
      tokenizer: "mistral",
      instruct_type: "mistral"
    },
    pricing: {
      prompt: "0",
      completion: "0"
    },
    top_provider: {
      context_length: 32768,
      max_completion_tokens: 4096,
      is_moderated: false
    },
    per_request_limits: null,
    capabilities: {
      tools: true,
      vision: false,
      reasoning: false,
      json: true
    },
    provider: "groq",
    is_free: true,
    badge: "Low Latency"
  },
  {
    id: "anthropic/claude-3.7-sonnet",
    name: "Anthropic: Claude 3.7 Sonnet (Hybrid Reasoning)",
    created: 1740000000,
    description: "Anthropic's latest hybrid reasoning and standard response flagship with state-of-the-art coding, analysis, and computer use.",
    context_length: 200000,
    architecture: {
      modality: "multimodal->text",
      tokenizer: "claude",
      instruct_type: "anthropic"
    },
    pricing: {
      prompt: "0.000003",
      completion: "0.000015"
    },
    top_provider: {
      context_length: 200000,
      max_completion_tokens: 64000,
      is_moderated: true
    },
    per_request_limits: null,
    capabilities: {
      tools: true,
      vision: true,
      reasoning: true,
      json: true
    },
    provider: "openrouter",
    is_free: false,
    badge: "Industry Best"
  },
  {
    id: "openai/gpt-4o",
    name: "OpenAI: GPT-4o (Omni)",
    created: 1715000000,
    description: "OpenAI flagship omni-model combining vision, audio understanding, logic, and rapid completions.",
    context_length: 128000,
    architecture: {
      modality: "multimodal->text",
      tokenizer: "o200k_base",
      instruct_type: "chatml"
    },
    pricing: {
      prompt: "0.0000025",
      completion: "0.00001"
    },
    top_provider: {
      context_length: 128000,
      max_completion_tokens: 16384,
      is_moderated: true
    },
    per_request_limits: null,
    capabilities: {
      tools: true,
      vision: true,
      reasoning: true,
      json: true
    },
    provider: "openrouter",
    is_free: false,
    badge: "Omni"
  },
  {
    id: "meta-llama/llama-3.1-8b-instruct:free",
    name: "Meta: Llama 3.1 8B Instruct (Free)",
    created: 1721000000,
    description: "High-speed 8B instruction tuned model, optimal for agent loop tasks, summarization, and autocomplete.",
    context_length: 131072,
    architecture: {
      modality: "text->text",
      tokenizer: "llama3",
      instruct_type: "llama3"
    },
    pricing: {
      prompt: "0",
      completion: "0"
    },
    top_provider: {
      context_length: 131072,
      max_completion_tokens: 4096,
      is_moderated: false
    },
    per_request_limits: null,
    capabilities: {
      tools: true,
      vision: false,
      reasoning: false,
      json: true
    },
    provider: "cerebras",
    is_free: true,
    badge: "Ultra Fast"
  },
  {
    id: "ollama/llama3.1:local",
    name: "Ollama: Llama 3.1 Local Air-Gapped",
    created: 1725000000,
    description: "Local model running via Ollama daemon. Serves as ultimate air-gapped fallback with zero data retention.",
    context_length: 131072,
    architecture: {
      modality: "text->text",
      tokenizer: "llama3",
      instruct_type: "llama3"
    },
    pricing: {
      prompt: "0",
      completion: "0"
    },
    top_provider: {
      context_length: 131072,
      max_completion_tokens: 4096,
      is_moderated: false
    },
    per_request_limits: null,
    capabilities: {
      tools: true,
      vision: false,
      reasoning: true,
      json: true
    },
    provider: "ollama",
    is_free: true,
    badge: "Localhost"
  }
];
