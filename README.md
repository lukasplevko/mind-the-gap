# Mind the gap. Make a plan.

An interactive B2 English story game. Meet your crew, talk to station staff, create a route and adapt when the journey changes. Submitted writing is reviewed by an AI language model (Mistral) served from a Cloudflare Worker.

## Structure

- `public/` — static frontend (served via the Worker's assets binding, no build step)
- `worker/index.js` — Worker entry point: routes `/api/language-review` and `/api/language-status`, serves static assets
- `worker/language.js` — language-review logic (calls the Mistral API)
- `wrangler.toml` — Worker config (`main`, `[assets]`)
- `scripts/build.mjs` — optional legacy: bundles everything into a single Worker file (`dist/server/index.js`)

## Local development

```sh
cp .dev.vars.example .dev.vars   # then fill in MISTRAL_API_KEY
npm run dev                      # wrangler dev → http://localhost:8787
```

`.dev.vars` is gitignored — never commit real keys.

## Deploy to Cloudflare (free tier) — git-connected Worker project

1. Dashboard: **Workers & Pages → Create application → Workers → Connect to Git** → this repo, production branch `main`.
2. Build settings:
   - Build command: **empty** (wrangler bundles the Worker itself)
   - Deploy command: `npx wrangler deploy`
   - Preview command: `npx wrangler deploy`
3. Project environment variables (build-time): `CLOUDFLARE_API_TOKEN` (API token with **Account → Workers Scripts → Edit**, template "Edit Cloudflare Workers") and `CLOUDFLARE_ACCOUNT_ID`.
4. After the first successful deploy, add the runtime secret: **Workers & Pages → mind-the-gap → Settings → Variables and Secrets → Add**:
   - `MISTRAL_API_KEY` — type **Secret** (Production and Preview)
   - optionally `MISTRAL_MODEL` — plain text, default `mistral-small-latest`
5. Redeploy. App: `https://mind-the-gap.<your-subdomain>.workers.dev` (or a custom domain).

Get a free Mistral API key at [console.mistral.ai](https://console.mistral.ai) (API Keys; Free mode needs no credit card). For school use with student data, disable training on your data in the Mistral Admin panel (Privacy → Anonymous improvement data), or use a pay-as-you-go key.

Check: `https://<host>/api/language-status` → `{"available":true}` once the secret is set.

## GitHub Pages

Only the static game can be hosted on GitHub Pages (deploy the contents of `public/`). The AI review will not work there — the game falls back to teacher review.
