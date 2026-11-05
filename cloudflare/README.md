# Cloudflare Workers Deployment Guide for PartSure AI Gateway

This directory provides the production-ready Cloudflare Worker implementing the official **Workshop Parts Desk (v6)** Team Model Gateway.

- **URL Protocol**: Strict HTTPS on Port 443 with zero redirects.
- **Endpoint**: `POST /gateway`
- **Authentication**: `Authorization: Bearer <TEAM_GATEWAY_TOKEN>`
- **Cost**: 100% Free on Cloudflare's edge network (up to 100,000 requests/day).

---

## Method 1: Deploy in 30 Seconds via Cloudflare Web Dashboard (Easiest, No CLI needed)

1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com).
2. In the left menu, click **Workers & Pages** → **Create application** → **Create Worker**.
3. Name it: `partsure-gateway` and click **Deploy**.
4. Click **Edit code**:
   - Delete the starter code.
   - Copy and paste the entire contents of [`worker.js`](worker.js).
   - Click **Save and deploy**.
5. Go to the worker's **Settings** tab → **Variables and Secrets**:
   - Click **Add variable**:
     - `TEAM_GATEWAY_TOKEN`: `partsure-secret-token-2026`
     - `TEAM_PROVIDER_URL`: `https://api.openai.com/v1/chat/completions` (or Groq: `https://api.groq.com/openai/v1/chat/completions`)
     - `TEAM_MODEL`: `gpt-4o-mini` (or Groq: `llama-3.3-70b-versatile`)
   - Click **Add secret** (encrypted):
     - `TEAM_PROVIDER_KEY`: Your OpenAI/Groq API key (`sk-...` or `gsk_...`)
   - Click **Save**.

Your public HTTPS gateway URL is now live at:
`https://partsure-gateway.<your-cloudflare-subdomain>.workers.dev/gateway`

---

## Method 2: Deploy via Wrangler CLI

If you have Node.js and Wrangler installed:

```bash
cd cloudflare
npx wrangler login
npx wrangler secret put TEAM_PROVIDER_KEY
npx wrangler deploy
```

---

## Verifying in Competition Portal

Once deployed:
1. Open the **Team model gateway** tab in the competition portal.
2. Enter:
   - **Public HTTPS gateway URL**: `https://partsure-gateway.<your-subdomain>.workers.dev/gateway`
   - **Restricted bearer token**: `partsure-secret-token-2026`
3. Click **Save new revision**.
4. Click **Check connection**.
5. Once connection verification passes, submit `PartSure_AI_submission.zip`.
