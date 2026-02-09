# Checklist

- [ ] Step 1: <small, verifiable action>
- [ ] Step 2: <small, verifiable action>
- [ ] Step 3: <small, verifiable action>

## Artifacts (required)
- [ ] Fill `artifacts/run-meta.yaml` (inputs + model + outputs pointers)
- [ ] Capture sources in `artifacts/sources.md`
- [ ] Write a short synthesis in `artifacts/summary.md`

## Promotion (required when reusable)
- [ ] Promote to `.blackbox/deepresearch/YYYY-MM-DD_<topic>.md`
- [ ] Link the run folder from the evergreen note
- [ ] Update `.blackbox/journal.md` with what changed + why

## Docs routing (required when creating/updating docs outside `.blackbox`)
- [ ] Put docs in the correct `docs/0X-*/` section (see `docs/README.md`)
- [ ] Update the nearest folder `README.md` or `INDEX.md` with a link (so it’s discoverable)
- [ ] Add an entry to `docs/.blackbox/docs-ledger.md` (so we can always find it)
