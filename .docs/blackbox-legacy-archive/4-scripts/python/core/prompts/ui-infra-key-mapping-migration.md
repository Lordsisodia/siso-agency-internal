# UI↔Infra Key-Mapping Migration (remove Shopify GIDs) — Prompt Pack

Use this when you want to execute the “remove vendor IDs above adapters” work as a focused run.

## Hard constraints (paste at start)

1) Do not change unrelated code.
2) Treat `VariantKey`/`ProductKey` as the only identifiers above adapters.
3) Measure progress only via:
   - `./.blackbox/scripts/check-vendor-leaks.sh`

## Start here

Plan folder:
- `docs/.blackbox/agents/.plans/2025-12-29_0741_ui-infra-key-mapping-migration-remove-shopify-gids/`

Run instructions:
- `docs/.blackbox/agents/.plans/2025-12-29_0741_ui-infra-key-mapping-migration-remove-shopify-gids/RUN-NOW.md`

## Target outcome

- `./.blackbox/scripts/check-vendor-leaks.sh` has **no** `gid://shopify/` matches in UI/providers or client config.

## Suggested first 5 prompts

1) Read `docs/05-planning/research/ui-infra-key-mapping-strategy.md` and restate the mapping decision in 3 bullets.
2) Run `./.blackbox/scripts/check-vendor-leaks.sh` and confirm the exact matches; cite file paths.
3) Propose the internal `VariantKey` values that replace the current GIDs (2–10 keys) and where they live.
4) Identify the single mapping registry location (one module) and how missing mappings should fail.
5) Draft the file-by-file code edit plan (no code yet), then checkpoint.

