# Domain Map (SISO Internal)

This is the “index of indexes” for how SISO Internal is organized (for agents and humans).

## Domains

- `ui/` — routes, components, layout patterns, forms, state
- `auth/` — login/session refresh, redirects, guards
- `supabase/` — migrations, schema, RLS, types, edge functions
- `integrations/` — external APIs (Stripe, Slack, etc.)
- `build/` — Vite build, PWA, Tauri, deploy

## What belongs here vs elsewhere

- `docs/.blackbox/domains/**` → durable “how it works” knowledge
- `docs/.blackbox/.runs/**` → per-batch execution state, plans, logs, handoffs
- `docs/.blackbox/.agents/**` → agent packages (role + dependencies + templates)
- `docs/process/**` → how the team works (non-agent runtime)
- `docs/platform/**`, `docs/product/**` → product/platform documentation

