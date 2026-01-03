# src/app

- Entry point (App, main, global styles) and top-level routing helpers.
- Imports use aliases (`@app/*`, `@domains/*`, `@components/*`, etc.).

Contents
- `App.tsx` – route tree and layout wiring
- `main.tsx` – React bootstrap, providers, Router, QueryClient
- `index.css` – global styles
- `routes/` – supplemental route groups (e.g., TestingRoutes)

Guidelines
- Keep app-level concerns here; feature UI stays in `src/domains/*`.
- For new routes/pages, add them in the owning domain and import lazily in `App.tsx`.
