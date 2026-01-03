# Domains

This workspace now groups product logic by **domains** (features/verticals). Examples:

- `client/` – client experience (dashboards, tasks, docs)
- `partners/` – partnership program (directory, referrals, dashboards)
- `lifelock/`, `dashboard/`, `projects/`, `tasks/`, `app-plan/`, `financial/`, `auth/`, etc.

Patterns
- Pages live in `src/domains/<domain>/pages` (route components)
- Domain-specific components/hooks/services stay inside the same domain folder
- Cross-domain UI lives in `src/components`; shared helpers in `src/lib`; shared services in `src/services`
- Tests can be co-located or mirrored under `tests/` using the same domain paths

When adding a new page
1. Create it in `src/domains/<domain>/pages/<Name>.tsx`.
2. Import via alias `@domains/<domain>/pages/<Name>` (tsconfig & Vite are configured).
3. Keep the route wrapper thin; heavy logic belongs in domain components/services.

Rationale
- Eliminates duplicate page trees (`src/pages` removed) and old `src/shared` sprawl.
- Keeps ownership clear: each domain owns its pages, UI, hooks, and services.
