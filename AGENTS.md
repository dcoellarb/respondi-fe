<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project overview

Respondi is a Next.js 16 frontend deployed to Cloudflare Workers via OpenNext. The app is a Spanish-language SaaS product with public marketing pages and a private account dashboard.

## Stack

- **Runtime:** Next.js 16.4, React 19, TypeScript 5
- **Styling:** Tailwind CSS 4 (via `@tailwindcss/turbopack`)
- **Data fetching:** TanStack React Query 5, typed OpenAPI client
- **Forms:** Formik + Yup
- **Analytics:** PostHog (`posthog-js`)
- **Deployment:** Cloudflare Workers via `@opennextjs/cloudflare`
- **Package manager:** pnpm 10 (enforced via `packageManager` field)

## Directory layout

```
src/
  api/           # Typed API client, hooks, query keys, OpenAPI schema
  app/
    (public)/    # Marketing & auth pages (landing, login, register, legal)
    (private)/   # Authenticated dashboard (cuenta/*)
  assets/        # Static brand assets
  components/
    ui/          # Shared UI primitives (button, card, text-field, etc.)
    brand/       # Brand components (logo)
    marketing/   # Marketing-specific components
    account/     # Dashboard components
    seo/         # SEO components
  content/       # Static content data (FAQ, etc.)
  hooks/         # Shared React hooks
  lib/           # Utilities (analytics, metadata, money formatting, etc.)
openapi/         # OpenAPI spec (source of truth for API types)
```

## Conventions

- **Path alias:** `@/*` resolves to `./src/*`. Always use it for imports.
- **API types:** Generated from `openapi/respondi.json` via `pnpm api:types`. Never hand-edit `src/api/schema.d.ts`; regenerate it instead.
- **Route groups:** `(public)` for unauthenticated pages, `(private)` for authenticated pages. Respect the layout boundary each group defines.
- **Linting:** Run `pnpm lint` before committing. ESLint uses `eslint-config-next` with core-web-vitals and TypeScript presets.
- **Environment:** `.env.example` documents all required variables. Never commit `.env.local`, `.env.production`, `.env.staging`, or `.dev.vars` — they are gitignored.
- **Cloudflare:** `wrangler.jsonc` and `open-next.config.ts` define the deployment target. `cacheComponents` is disabled due to an OpenNext/Workers compatibility issue (see `next.config.ts` comments).
