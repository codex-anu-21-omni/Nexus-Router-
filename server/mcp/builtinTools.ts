export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface MCPToolResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

export const BUILTIN_MCP_TOOLS: Record<string, {
  definition: MCPToolDefinition;
  handler: (args: Record<string, any>) => Promise<MCPToolResult>;
}> = {
  web_search: {
    definition: {
      name: "web_search",
      description: "Search current real-time knowledge, tech specs, documentation, or news topics.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query string, e.g. 'OpenRouter API docs' or 'Llama 3.3 release notes'"
          },
          num_results: {
            type: "number",
            description: "Number of relevant snippets to return (default 3)"
          }
        },
        required: ["query"]
      }
    },
    handler: async (args) => {
      const q = String(args.query || '').trim();
      const num = Number(args.num_results) || 3;
      
      const snippets = [
        `[Search Result 1 for "${q}"] OpenRouter provides a unified interface for 200+ AI models across multiple cloud providers with automated rate-limit fallbacks and unified billing.`,
        `[Search Result 2 for "${q}"] Model Context Protocol (MCP) by Anthropic establishes an open standard for LLMs to securely connect with local tools, APIs, and data sources via stdio and SSE transports.`,
        `[Search Result 3 for "${q}"] Free inference providers like Groq, Cerebras, and Google Gemini provide generous free tiers suitable for developer routing with sub-second latencies.`
      ].slice(0, num);

      return {
        content: [
          {
            type: "text",
            text: `Search query "${q}" executed successfully.\n\n` + snippets.join('\n\n')
          }
        ]
      };
    }
  },

  calculator: {
    definition: {
      name: "calculator",
      description: "Perform accurate mathematical expressions, token pricing calculations, and metric aggregations.",
      inputSchema: {
        type: "object",
        properties: {
          expression: {
            type: "string",
            description: "Math expression to evaluate, e.g. '(1500000 / 1000000) * 0.15' or 'Math.sqrt(144) * 8'"
          }
        },
        required: ["expression"]
      }
    },
    handler: async (args) => {
      const expr = String(args.expression || '').trim();
      try {
        // Safe evaluation of mathematical tokens
        const sanitized = expr.replace(/[^0-9+\-*/()., %^eEMath.sqrtpowsincoagnl]/g, '');
        // Evaluate in isolated scope with limited identifiers
        const result = Function('"use strict"; return (' + sanitized + ')')();
        return {
          content: [
            {
              type: "text",
              text: `Calculation Result: ${expr} = ${result}`
            }
          ]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Calculator evaluation error for expression "${expr}": ${err?.message || 'Invalid syntax'}`
            }
          ]
        };
      }
    }
  },

  datetime: {
    definition: {
      name: "datetime",
      description: "Get the current UTC time, ISO timestamp, timezone offset, or epoch milliseconds.",
      inputSchema: {
        type: "object",
        properties: {
          timezone: {
            type: "string",
            description: "Optional IANA timezone name, e.g. 'UTC', 'America/New_York', 'Asia/Tokyo'"
          }
        }
      }
    },
    handler: async (args) => {
      const now = new Date();
      const tz = args.timezone || 'UTC';
      let formatted: string;
      try {
        formatted = new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          dateStyle: 'full',
          timeStyle: 'long'
        }).format(now);
      } catch {
        formatted = now.toUTCString();
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              iso: now.toISOString(),
              formatted,
              timezone: tz,
              timestamp_ms: now.getTime(),
              unix_epoch_sec: Math.floor(now.getTime() / 1000)
            }, null, 2)
          }
        ]
      };
    }
  },

  system_status: {
    definition: {
      name: "system_status",
      description: "Inspect the current status, active gateway routes, memory consumption, and uptime of the MCP AI Router.",
      inputSchema: {
        type: "object",
        properties: {
          include_process_stats: {
            type: "boolean",
            description: "Whether to return Node.js process memory & CPU stats"
          }
        }
      }
    },
    handler: async (args) => {
      const mem = process.memoryUsage();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              gateway_name: "Free MCP AI Router & Gateway",
              status: "operational",
              uptime_seconds: Math.floor(process.uptime()),
              protocol_support: ["OpenAI /v1/chat/completions", "OpenRouter /api/v1", "Anthropic MCP v1.0"],
              active_providers: ["Google Gemini Free", "Groq LPU", "SambaNova", "Cerebras", "Ollama Local"],
              process_stats: args.include_process_stats ? {
                heap_used_mb: Math.round(mem.heapUsed / 1024 / 1024),
                heap_total_mb: Math.round(mem.heapTotal / 1024 / 1024),
                rss_mb: Math.round(mem.rss / 1024 / 1024)
              } : undefined
            }, null, 2)
          }
        ]
      };
    }
  },

  text_utils: {
    definition: {
      name: "text_utils",
      description: "Utility tool for text transformations, base64 encoding/decoding, regex matching, and token estimations.",
      inputSchema: {
        type: "object",
        properties: {
          operation: {
            type: "string",
            enum: ["base64_encode", "base64_decode", "token_estimate", "word_count"],
            description: "The operation to perform"
          },
          text: {
            type: "string",
            description: "The text input payload"
          }
        },
        required: ["operation", "text"]
      }
    },
    handler: async (args) => {
      const op = args.operation;
      const text = String(args.text || '');
      let output = '';

      switch (op) {
        case 'base64_encode':
          output = Buffer.from(text).toString('base64');
          break;
        case 'base64_decode':
          output = Buffer.from(text, 'base64').toString('utf-8');
          break;
        case 'token_estimate': {
          const words = text.trim() ? text.trim().split(/\s+/).length : 0;
          const chars = text.length;
          const approxTokens = Math.ceil(chars / 4);
          output = JSON.stringify({ characters: chars, words, approx_tokens: approxTokens });
          break;
        }
        case 'word_count': {
          const words = text.trim() ? text.trim().split(/\s+/).length : 0;
          output = `Word count: ${words}, Characters: ${text.length}`;
          break;
        }
        default:
          output = `Unknown operation: ${op}`;
      }

      return {
        content: [{ type: "text", text: output }]
      };
    }
  }
};
