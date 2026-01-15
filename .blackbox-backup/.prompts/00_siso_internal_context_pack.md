# SISO Internal — Context Pack

Use this prompt pack as a reusable “always include” context for agent runs in `docs/.blackbox/.plans/`.

## Project context

- Repo: SISO-INTERNAL (React + TypeScript + Vite + Supabase PWA)
- Mobile-first UI expectations
- TypeScript strict mode
- Prefer existing patterns over new abstractions

## Database rules (Supabase)

- Use `siso-internal-supabase.apply_migration` for DDL changes
- After DDL: run advisors (`type="security"`) and regenerate types
- RLS policies matter for user isolation

## Blackbox workflow

- Use `inbox/issues.md` → group in `state/groups.md`
- Per-issue work lives in `issues/<ISSUE>/plan.md`
- Each plan must have: acceptance criteria + verification checklist

