# Domains

This folder is the **domain-based knowledge map** for SISO Internal.

Goal: preserve context by organizing reusable “how things work” notes around stable boundaries:

- `ui/` — screens, components, UX patterns
- `auth/` — session, redirects, access guards
- `supabase/` — schema, RLS, edge functions, data access patterns
- `integrations/` — Stripe, Slack, etc.
- `build/` — Vite/Tauri builds, CI, deployment

Guidelines:

- Prefer small, focused notes (1–3 pages).
- Link to concrete code paths where applicable.
- When a run discovers something durable, promote it here.

