/**
 * PartSure AI - Cloudflare Workers Team Model Gateway
 * 
 * Complies with Workshop Parts Desk (v6) GATEWAY.md & EVENT_RULES.md:
 * - Public HTTPS on port 443 with no redirects
 * - Endpoint: POST /gateway
 * - Header: Authorization: Bearer <TEAM_GATEWAY_TOKEN>
 * - Body: { messages: [...], max_output_tokens: number }
 * - Response: { text: string, usage: { input_tokens: number, output_tokens: number } }
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight handling
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Health / generic test endpoint
    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response(
        JSON.stringify({
          status: 'online',
          service: 'PartSure AI Inference Gateway',
          version: '2.0.0-cloudflare',
          endpoint: '/gateway',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Must be POST /gateway
    if (url.pathname !== '/gateway') {
      return new Response(
        JSON.stringify({ error: 'Endpoint not found. Use POST /gateway' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed. Use POST.' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Restricted Bearer Token Verification
    const authHeader = request.headers.get('Authorization') || '';
    const expectedToken = env.TEAM_GATEWAY_TOKEN || 'partsure-secret-token-2026';
    if (authHeader !== `Bearer ${expectedToken}`) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: invalid bearer token' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse incoming JSON payload
    let frame;
    try {
      frame = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Malformed JSON payload' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!frame.messages || !Array.isArray(frame.messages) || frame.messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid payload: messages array required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const maxTokens = Number(frame.max_output_tokens) || 512;
    const providerUrl = env.TEAM_PROVIDER_URL || 'https://api.openai.com/v1/chat/completions';
    const providerKey = env.TEAM_PROVIDER_KEY || '';
    const model = env.TEAM_MODEL || 'gpt-4o-mini';

    if (!providerKey) {
      return new Response(
        JSON.stringify({
          error: 'Configuration missing: set TEAM_PROVIDER_KEY secret in Cloudflare Worker settings',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Forward inference call to LLM Provider (OpenAI / Groq / OpenRouter)
    try {
      const response = await fetch(providerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${providerKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: frame.messages,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return new Response(
          JSON.stringify({
            error: 'Upstream LLM provider returned an error',
            status: response.status,
            detail: errorText,
          }),
          { status: 502, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      const usage = data.usage || {};

      const outputBody = {
        text: content,
        usage: {
          input_tokens: usage.prompt_tokens || 0,
          output_tokens: usage.completion_tokens || 0,
        },
      };

      return new Response(JSON.stringify(outputBody), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'Inference request failed', message: err.message }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }
  },
};
