# Components (Shared UI)

- Holds **shared, domain-agnostic UI**: primitives, layout, sidebar, debug widgets, notion-editor, help, effects.
- Domain-specific UI lives in `src/domains/<domain>/*`.
- Keep imports via aliases:
  - `@components/*` for shared UI
  - `@domains/*` for domain modules

Guidelines
- Only place components here if used by multiple domains.
- Co-locate styles with components (CSS/TSX). Avoid domain logic here.
- Prefer composition: shared primitives + domain wrappers inside domains.

Adding a shared component
1) Create under `src/components/<area>/<Name>.tsx` (e.g., `components/ui/Button.tsx`).
2) Export via index if needed; import with `@components/...`.
3) Keep props generic; no domain-specific types/queries.

Notes
- Legacy `src/shared` was retired; all shared UI now lives here.
- Feature-specific UI should move/remain in its domain.
