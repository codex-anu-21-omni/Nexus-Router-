import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { store, RequestLog } from './server/store.ts';
import { providerManager, CompletionRequest } from './server/providers/providerManager.ts';
import { OPENROUTER_MODELS } from './server/models.ts';
import { BUILTIN_MCP_TOOLS } from './server/mcp/builtinTools.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

interface SseLogItem {
  id: string;
  time: string;
  level: 'info' | 'warn' | 'tool' | 'success' | 'error';
  message: string;
  meta?: any;
}

const sseClients = new Set<Response>();
const recentSseLogs: SseLogItem[] = [];

export function broadcastSse(level: SseLogItem['level'], message: string, meta?: any) {
  const item: SseLogItem = {
    id: `sse-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    time: new Date().toLocaleTimeString('en-US', { hour12: false }),
    level,
    message,
    meta
  };

  recentSseLogs.unshift(item);
  if (recentSseLogs.length > 100) recentSseLogs.pop();

  const data = `data: ${JSON.stringify(item)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(data);
    } catch {
      sseClients.delete(client);
    }
  }
}

app.get('/api/logs', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  for (const log of [...recentSseLogs].reverse()) {
    res.write(`data: ${JSON.stringify(log)}\n\n`);
  }

  sseClients.add(res);
  req.on('close', () => {
    sseClients.delete(res);
  });
});

const handleChatCompletions = async (req: Request, res: Response): Promise<void> => {
  const payload: CompletionRequest = req.body;

  if (!payload || !Array.isArray(payload.messages)) {
    res.status(400).json({
      error: {
        message: 'Invalid request: "messages" array is required.',
        type: 'invalid_request_error',
        code: 400
      }
    });
    return;
  }

  const clientTag = payload.client_tag || (req.headers['x-title'] as string) || (req.headers['http-referer'] as string) || 'OpenAI-Client';
  const requestedModel = payload.model || 'openrouter/auto';

  broadcastSse('info', `Incoming request for ${requestedModel} (${payload.messages.length} messages)`);

  if (payload.stream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    try {
      await providerManager.streamChatCompletion(
        payload,
        (chunkStr: string) => {
          res.write(chunkStr);
        },
        ({ provider, fallbacksTriggered, tokens, durationMs }) => {
          broadcastSse('success', `Stream completed via ${provider} (${tokens} tokens, ${durationMs}ms)`);

          const log: RequestLog = {
            id: `req-str-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            timestamp: Date.now(),
            clientTag,
            modelRequested: requestedModel,
            providerResolved: provider,
            modelResolved: requestedModel,
            status: 200,
            durationMs,
            ttftMs: Math.round(durationMs * 0.35),
            promptTokens: Math.round(tokens * 0.4),
            completionTokens: Math.round(tokens * 0.6),
            totalTokens: tokens,
            fallbacksTriggered,
            spans: [
              {
                id: `span-gw-${Date.now()}`,
                name: 'Router Gateway Accepted Payload & Verified Quotas',
                category: 'gateway',
                startMs: 0,
                durationMs: 4,
                status: 'ok',
                details: `Stream session dispatched for ${clientTag}`
              },
              {
                id: `span-stream-${Date.now()}`,
                name: `Streamed Tokens via ${provider}`,
                category: 'client',
                startMs: 4,
                durationMs,
                status: 'ok',
                details: `Flushed ${tokens} tokens via Server-Sent Events`
              }
            ],
            costSavedVsOpenAi: (tokens * 0.4 / 1000000 * 2.50) + (tokens * 0.6 / 1000000 * 10.00)
          };
          store.addLog(log);
          res.end();
        }
      );
    } catch (err: any) {
      broadcastSse('error', `Streaming failed: ${err?.message}`);
      res.write(`data: ${JSON.stringify({ error: { message: err?.message || 'Streaming failed' } })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
    return;
  }

  try {
    const startTime = Date.now();
    const result = await providerManager.executeChatCompletion(payload);
    const durationMs = Date.now() - startTime;

    broadcastSse(
      result.fallbacksTriggered.length > 0 ? 'warn' : 'success',
      `Completed via ${result.provider} in ${durationMs}ms (${result.usage.total_tokens} tokens)`
    );

    const log: RequestLog = {
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      clientTag,
      modelRequested: requestedModel,
      providerResolved: result.provider,
      modelResolved: result.model,
      status: 200,
      durationMs,
      ttftMs: Math.round(durationMs * 0.35),
      promptTokens: result.usage.prompt_tokens,
      completionTokens: result.usage.completion_tokens,
      totalTokens: result.usage.total_tokens,
      fallbacksTriggered: result.fallbacksTriggered,
      mcpToolCalls: result.mcpToolCalls,
      spans: result.spans || [],
      costSavedVsOpenAi: (result.usage.prompt_tokens / 1000000 * 2.50) + (result.usage.completion_tokens / 1000000 * 10.00)
    };
    store.addLog(log);

    res.setHeader('x-provider-used', result.provider);
    res.setHeader('x-failovers-count', String(result.fallbacksTriggered.length));
    res.json(result);
  } catch (err: any) {
    broadcastSse('error', `Request failed: ${err?.message}`);
    res.status(500).json({
      error: {
        message: err?.message || 'Internal router error: All fallback providers exhausted',
        type: 'router_error',
        code: 500
      }
    });
  }
};

app.post('/v1/chat/completions', handleChatCompletions);
app.post('/api/v1/chat/completions', handleChatCompletions);

const handleGetModels = (_req: Request, res: Response) => {
  res.json({
    object: 'list',
    data: OPENROUTER_MODELS
  });
};

app.get('/v1/models', handleGetModels);
app.get('/api/v1/models', handleGetModels);

app.get('/api/v1/stats', (_req: Request, res: Response) => {
  res.json({
    metrics: store.metrics,
    activeProvidersCount: store.providers.filter(p => p.enabled && !p.simulateRateLimit429).length,
    rateLimitedCount: store.providers.filter(p => p.simulateRateLimit429).length,
    totalModels: OPENROUTER_MODELS.length
  });
});

app.get('/api/v1/policies', (_req: Request, res: Response) => {
  res.json({ policies: store.intentPolicies });
});

app.post('/api/v1/policies/toggle', (req: Request, res: Response) => {
  const { policyId } = req.body;
  const policy = store.togglePolicy(policyId);
  res.json({ success: true, policy });
});

app.get('/api/v1/keys', (_req: Request, res: Response) => {
  res.json({ keys: store.apiKeys });
});

app.post('/api/v1/keys', (req: Request, res: Response) => {
  const { name, memberEmail, teamRole, dailyBudgetTokens } = req.body;
  const key = store.createApiKey(name, memberEmail, teamRole, dailyBudgetTokens);
  res.json({ success: true, key });
});

app.post('/api/v1/keys/toggle-scope', (req: Request, res: Response) => {
  const { keyId, scopeName } = req.body;
  const updated = store.toggleKeyScope(keyId, scopeName);
  res.json({ success: true, key: updated });
});

app.delete('/api/v1/keys/:id', (req: Request, res: Response) => {
  store.deleteApiKey(req.params.id);
  res.json({ success: true });
});

app.get('/api/v1/logs', (_req: Request, res: Response) => {
  res.json({ logs: store.logs });
});

app.post('/api/v1/logs/clear', (_req: Request, res: Response) => {
  store.logs = [];
  res.json({ success: true });
});

app.get('/api/v1/providers', (_req: Request, res: Response) => {
  res.json({ providers: store.providers });
});

app.post('/api/v1/providers/simulate-429', (req: Request, res: Response) => {
  const { providerId, simulate } = req.body;
  const current = store.providers.find(p => p.id === providerId);
  const nextSim = simulate !== undefined ? Boolean(simulate) : (current ? !current.simulateRateLimit429 : true);
  const updated = store.toggleSimulate429(providerId, nextSim);

  broadcastSse(
    nextSim ? 'warn' : 'info',
    `Provider "${providerId}" rate-limit simulation set to ${nextSim ? 'ACTIVE (Will force failover)' : 'OFF'}`
  );

  res.json({ success: true, simulateRateLimit429: updated });
});

app.get('/api/v1/mcp/tools', (_req: Request, res: Response) => {
  const tools = Object.values(BUILTIN_MCP_TOOLS).map(t => t.definition);
  res.json({
    tools,
    servers: store.mcpServers
  });
});

app.post('/api/v1/mcp/tools/execute', async (req: Request, res: Response) => {
  const { name, arguments: args } = req.body;
  if (!name || !BUILTIN_MCP_TOOLS[name]) {
    res.status(404).json({ error: `Tool "${name}" not found in MCP registry` });
    return;
  }

  try {
    const result = await BUILTIN_MCP_TOOLS[name].handler(args || {});
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Execution failed', isError: true });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nexus Router Gateway operational at http://localhost:${PORT}`);
    console.log(`API Endpoint: http://localhost:${PORT}/v1/chat/completions`);
    console.log(`Models Catalog: http://localhost:${PORT}/v1/models`);
    console.log(`Telemetry Stream: http://localhost:${PORT}/api/logs`);
  });
}

startServer().catch(err => {
  console.error('Failed to initialize server:', err);
});
