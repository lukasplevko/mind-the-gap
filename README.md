# Mind the gap. Make a plan.

An interactive B2 English story game. Meet your crew, talk to station staff, create a route and adapt when the journey changes. Submitted writing is reviewed by an AI language model (Mistral) served from Cloudflare Pages Functions.

## Structure

- `public/` — static frontend (no build step needed)
- `functions/api/` — Cloudflare Pages Functions (`/api/language-review`, `/api/language-status`)
- `worker/language.js` — language-review logic used by the Functions (calls the Mistral API)
- `scripts/build.mjs` — optional: bundles everything into a single Worker (`dist/server/index.js`) for advanced-mode deploys

## Local development

```sh
cp .dev.vars.example .dev.vars   # then fill in MISTRAL_API_KEY
npm run dev                      # wrangler pages dev → http://localhost:8788
```

`.dev.vars` is gitignored — never commit real keys.

## Deploy to Cloudflare Pages (free tier)

1. Push this repo to GitHub and connect it in the Cloudflare dashboard (**Workers & Pages → Create application → Pages → Connect to Git**).
2. Build settings: build command **empty**, build output directory **`public`**.
3. After the first deploy, go to **Settings → Variables and Secrets** and add:
   - `MISTRAL_API_KEY` — type **Secret** (set it for both **Production** and **Preview**)
   - optionally `MISTRAL_MODEL` — plain text, default `mistral-small-latest`
4. Redeploy. The game is served from `public/`, the API from `functions/`.

Get a free Mistral API key at [console.mistral.ai](https://console.mistral.ai) (API Keys; Free mode needs no credit card). For school use with student data, disable training on your data in the Mistral Admin panel (Privacy → Anonymous improvement data), or use a pay-as-you-go key.

## GitHub Pages

Only the static game can be hosted on GitHub Pages (deploy the contents of `public/`). The AI review will not work there — the game falls back to teacher review.
