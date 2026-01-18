# Lane: Search — Facets, Autocomplete, Adapters

Goal: collect OSS we can reuse for:
- storefront search UX (autocomplete, facets, “refinements”)
- admin search/filter UX (saved views, filter chips, query builders)
- lightweight search backends for prototypes (Typesense/Meilisearch).

This lane is intentionally **component + adapter focused** (not “run Elastic/Kibana as a product”).

## High-signal curated picks (current)

Autocomplete / combobox primitives:
- `algolia/autocomplete` (deepen) — strong keyboard/autocomplete UX primitives
- `downshift-js/downshift` (deepen) — headless combobox/autocomplete building blocks
- `moroshko/react-autosuggest` (watch) — older, evaluate maintenance before reuse

Search UI toolkits:
- `algolia/instantsearch` (deepen) — facets/refinements patterns + adapters
- `typesense/typesense-instantsearch-adapter` (existing) — Typesense ↔ InstantSearch bridge

Search backend JS clients (useful for prototypes):
- `typesense/typesense-js` (deepen)
- `meilisearch/meilisearch-js` (deepen)

Small/local search:
- `lucaong/minisearch` (deepen) — client-side full-text search (useful for small indexes)
- `itemsapi/itemsjs` (deepen) — faceted search engine in JS (filters/facets)

## What to avoid (noise)

- Terminal autocomplete / CLI tools (looks like “autocomplete” but wrong domain)
  - e.g. Fig / Inshellisense
- Full dashboard products (Kibana/OpenSearch Dashboards/Grafana)
  - too heavy + licensing risk + wrong layer for our needs

## Recommended next run (copy/paste)

Search topics (backend + UI primitives):
- `GITHUB_TOKEN="$(gh auth token)" ./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "Shaan" --top 25 --status triage --note-prefix "Seeded (search topics pass): " -- --queries-md .blackbox/snippets/research/github-search-queries-search-topics.md --no-derived-queries --min-stars 200 --max-total-queries 24 --max-queries-per-group 8 --no-gap-boost --no-catalog-gap-boost --no-coverage-quota-boost --exclude-regex "\\b(portfolio|resume|curriculum|cv|personal\\s*(site|website)?|my\\s*site)\\b"`

## Stop rule (avoid churn)

Pause this lane when:
- new curated adds per run < 3 for 2 consecutive runs, or
- most seeds are “dashboard products” or CLI autocomplete repos.
