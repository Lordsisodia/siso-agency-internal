# SISO-Internal Refactor Plan (Current State)

## Structure
- src/app — entry (App/main), routing, global styles
- src/domains/* — domain-owned pages, components, hooks, services, tests
- src/components — shared UI primitives (sidebar, layout, debug, notion-editor, help, effects)
- src/lib — shared utils/common/hooks + config/constants/data/templates
- src/providers — app-wide providers (moved from lib/context)
- src/services — cross-domain services (integrations, offline, shared, api)
- src/styles, src/assets, src/types

## Path Aliases (tsconfig.app.json)
- @/* -> src/*
- @domains/* -> src/domains/*
- @services/* -> src/services/*
- @components/* -> src/components/*
- @lib/* -> src/lib/*

## Completed Moves
- All pages relocated under src/domains/*/pages; src/pages removed
- Shared services -> src/services/shared
- Auth & chat -> src/domains/auth, src/domains/chat
- Shared ui/common/hooks/utils -> src/components or src/lib
- Integrations consolidated under src/services/integrations
- Offline utilities -> src/services/offline

## Next Steps
- Verify router config uses new domain page paths
- Keep lint/typecheck in CI to catch path regressions
- Regenerate Supabase types after any DB change
- Add co-located tests under domains or tests/ mirrored structure
- Security: esbuild/Vite advisory resolved via upgrade to Vite 7.x / plugin-react-swc 4.2 / Vitest 4 (npm audit now clean).

## Adding a Domain Page (playbook)
1) Create the page in `src/domains/<domain>/pages/<Name>.tsx`.
2) Import it via alias: `@domains/<domain>/pages/<Name>`.
3) Wire the route in `src/App.tsx` (lazy import) or the router config.
4) Keep the page thin; move heavy logic into domain components/services.
5) Add tests next to the domain or mirror under `tests/<domain>/`.

## Quick smoke checklist (routing)
- `npm run dev` starts without cycle errors (Vite 7)
- Root `/` redirects as expected (current: `/admin/life-lock-overview`)
- Sample domain routes load: auth (`/auth`), onboarding (`/onboarding/chat`), client (`/client/dashboard`), tasks (`/admin/tasks`), partners (`/partner/login`), dashboard (`/dashboard/clients`)
- PWA still builds: `npm run build`

## CI basics
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- (Optional) Sync test: `npm run test:sync`
