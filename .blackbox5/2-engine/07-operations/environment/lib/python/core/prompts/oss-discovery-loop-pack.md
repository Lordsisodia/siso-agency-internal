# OSS discovery loop prompt pack (pasteable)

Use these prompts to run repeatable “discover → catalog → curate → decide” loops.

Notes:
- These prompts assume you are in `docs/`.
- Do **not** paste GitHub tokens into chat.
- Use GitHub CLI auth + local env injection: `GITHUB_TOKEN="$(gh auth token)" <command ...>`.

---

## Prompt 0 — One-time setup (auth smoke test)

Paste:

Confirm GitHub CLI auth works (do not print tokens):

- `gh --version`
- `gh auth status`
- `gh api graphql -f query='query { viewer { login } }'`

Then summarize:
- which GitHub user is authenticated
- token scopes shown by `gh auth status` (masked is fine)

---

## Prompt 1 — Baseline loop run (fast)

Paste:

Run one full OSS loop using GitHub CLI auth (do not print tokens). From `docs/`, run:

- `GITHUB_TOKEN="$(gh auth token)" ./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "Shaan" --top 25 -- --min-stars 100`

Then summarize:
- how many repos are in `.blackbox/oss-catalog/catalog.json`
- how many curated items in `.blackbox/oss-catalog/curation.json`
- top 10 items in `.blackbox/oss-catalog/shortlist.md` by priority
- any repos with `license_bucket=flagged` that were newly added to curation in this run (name + reason)

---

## Prompt 2 — Baseline loop run (safe small call, rate-limit friendly)

Paste:

Run a smaller cycle to avoid GitHub Search rate limits:

- `GITHUB_TOKEN="$(gh auth token)" ./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "Shaan" --top 10 -- --min-stars 200 --max-total-queries 10 --max-repos 25 --no-catalog-gap-boost --no-coverage-quota-boost`

Then summarize the same bullets as Prompt 1.

---

## Prompt 3 — Promote 6 POCs (stop the infinite search)

Paste:

From the current catalog+shortlist, pick 6 repos that best match our focus in `.blackbox/oss-catalog/search-focus.md`:

- 2 for workflows/audit/policy
- 2 for returns/exchanges/store credit
- 1 for support timeline/helpdesk primitives
- 1 for admin/bulk-edit tooling

Update `.blackbox/oss-catalog/curation.json`:
- set those 6 to `status=poc`
- add `poc` fields: `timebox_days`, `scope`, `acceptance_criteria`, `decision_by` (use a date 10 days from today)
- keep `owner` as “Shaan”

Then run `./.blackbox/scripts/render-oss-catalog.sh` and show the top of `.blackbox/oss-catalog/poc-backlog.md`.

---

## Prompt 4 — License cleanup (fast risk gate)

Paste:

Scan `.blackbox/oss-catalog/catalog.json` for repos with `license_bucket=flagged` or `license_bucket=verify`.

- For the 10 highest-star repos among those, add them to `.blackbox/oss-catalog/curation.json` with `status=watch`
  (if license is unclear) or `status=reject` (if clearly copyleft and not worth it), and put a short reason in
  `notes`.
- Do not change any existing `status=poc` items.

Then run `./.blackbox/scripts/render-oss-catalog.sh`.

---

## Prompt 5 — Batch runs (hands-off discovery window)

Paste:

Run a batch of cycles (1 per 30 minutes) without changing code:

- `GITHUB_TOKEN="$(gh auth token)" ./.blackbox/scripts/start-oss-discovery-batch.sh --runs 6 --interval-min 30 -- --min-stars 100`

After the batch completes:
- report how many new repos were added to `.blackbox/oss-catalog/catalog.json` compared to before the batch
- seed the latest run into triage:
  - `python3 ./.blackbox/scripts/research/seed_oss_curation_from_extracted.py --latest --curation .blackbox/oss-catalog/curation.json --top 25 --status triage --owner "Shaan" --note-prefix "Seeded (batch pass): "`
- render:
  - `./.blackbox/scripts/render-oss-catalog.sh`

---

## Prompt 6 — Targeted discovery (returns + shipping)

Paste:

Run a new discovery cycle targeted at returns/shipping without changing code:

- `GITHUB_TOKEN="$(gh auth token)" ./.blackbox/scripts/start-oss-discovery-cycle.sh --min-stars 50`

After it completes, seed curation from the newest run:
- `python3 ./.blackbox/scripts/research/seed_oss_curation_from_extracted.py --latest --curation .blackbox/oss-catalog/curation.json --top 25 --status triage --owner "Shaan" --note-prefix "Seeded (returns/shipping pass): "`

Then:
- `./.blackbox/scripts/render-oss-catalog.sh`
- report whether tag counts for `returns` and `shipping` increased in the catalog.

---

## Prompt 6e — Targeted discovery (returns lane, low-stars but filtered)

Paste:

Run a low-stars returns/RMA lane pass (returns OSS is niche). Keep noise down with exclusions:

- `GITHUB_TOKEN="$(gh auth token)" ./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "Shaan" --top 25 --status triage --note-prefix "Seeded (returns low-stars pass): " -- --queries-md .blackbox/.local/github-search-queries.returns-only-v3-low-stars.md --no-derived-queries --min-stars 5 --include-archived --max-total-queries 30 --max-queries-per-group 10 --max-repos 120 --no-gap-boost --no-catalog-gap-boost --no-coverage-quota-boost --exclude-regex "\\b(portfolio|resume|curriculum|cv|homework|assignment|course|semester|leetcode|tutorial|cheatsheet|whitepaper|paper|book|erc20|ethereum|blockchain|ico|crowdsale|landofcoder|codecanyon|envato|ticksy)\\b"`
- `GITHUB_TOKEN="$(gh auth token)" ./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "Shaan" --top 25 --status triage --note-prefix "Seeded (returns low-stars pass): " -- --queries-md .blackbox/snippets/research/github-search-queries-returns-low-stars.md --no-derived-queries --min-stars 5 --include-archived --max-total-queries 30 --max-queries-per-group 10 --max-repos 120 --no-gap-boost --no-catalog-gap-boost --no-coverage-quota-boost --exclude-regex "\\b(portfolio|resume|curriculum|cv|homework|assignment|course|semester|leetcode|tutorial|cheatsheet|whitepaper|paper|book|erc20|ethereum|blockchain|ico|crowdsale|landofcoder|codecanyon|envato|ticksy)\\b"`

Then:
- kill obvious non-commerce noise quickly (crypto tokens, paid extension landing pages)
- render:
  - `./.blackbox/scripts/render-oss-catalog.sh`
- report:
  - whether `returns` tag coverage increased in `.blackbox/oss-catalog/catalog.json`
  - how many new non-reject items were added to curation

---

## Prompt 6b — Targeted discovery (storefront topics, high-signal)

Paste:

Run a targeted storefront discovery pass using topic-based queries (reduces “personal site” noise):

- `GITHUB_TOKEN="$(gh auth token)" ./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "Shaan" --top 25 --status triage --note-prefix "Seeded (storefront topics pass): " -- --queries-md .blackbox/.local/github-search-queries.storefront-topics-v1.md --no-derived-queries --min-stars 200 --max-total-queries 24 --max-queries-per-group 8 --no-gap-boost --no-catalog-gap-boost --no-coverage-quota-boost --exclude-regex "\\b(portfolio|resume|curriculum|cv|personal\\s*(site|website)?|my\\s*site)\\b"`
- `GITHUB_TOKEN="$(gh auth token)" ./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "Shaan" --top 25 --status triage --note-prefix "Seeded (storefront topics pass): " -- --queries-md .blackbox/snippets/research/github-search-queries-storefront-topics.md --no-derived-queries --min-stars 200 --max-total-queries 24 --max-queries-per-group 8 --no-gap-boost --no-catalog-gap-boost --no-coverage-quota-boost --exclude-regex "\\b(portfolio|resume|curriculum|cv|personal\\s*(site|website)?|my\\s*site)\\b"`

Then summarize:
- how many new repos were added to `.blackbox/oss-catalog/catalog.json`
- how many new items were added to `.blackbox/oss-catalog/curation.json`
- any repos with `license_bucket=flagged` that were seeded (name + decision)

---

## Prompt 6g — Targeted discovery (storefront starters + blog components)

Paste:

Run a discovery pass aimed at full storefront starter codebases (useful for pattern mining) plus blog/UI components:

- `GITHUB_TOKEN="$(gh auth token)" ./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "Shaan" --top 25 --status triage --note-prefix "Seeded (storefront/blog components pass): " -- --queries-md .blackbox/.local/github-search-queries.storefront-blog-components.md --no-derived-queries --min-stars 100 --exclude-keywords "awesome" --max-total-queries 24 --max-queries-per-group 8 --max-repos 120 --no-gap-boost --no-catalog-gap-boost --no-coverage-quota-boost --exclude-regex "\\b(portfolio|resume|curriculum|cv|personal\\s*(site|website)?|my\\s*site|course|homework|assignment|leetcode)\\b"`
- `GITHUB_TOKEN="$(gh auth token)" ./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "Shaan" --top 25 --status triage --note-prefix "Seeded (storefront/blog components pass): " -- --queries-md .blackbox/snippets/research/github-search-queries-storefront-content.md --no-derived-queries --min-stars 100 --exclude-keywords "awesome" --max-total-queries 24 --max-queries-per-group 8 --max-repos 120 --no-gap-boost --no-catalog-gap-boost --no-coverage-quota-boost --exclude-regex "\\b(portfolio|resume|curriculum|cv|personal\\s*(site|website)?|my\\s*site|course|homework|assignment|leetcode)\\b"`

Then:
- promote the best 3–6 storefront starters to `status=deepen` (pattern mining)
- reject obvious personal sites / non-commerce repos quickly
- render:
  - `./.blackbox/scripts/render-oss-catalog.sh`

---

## Prompt 6c — Targeted discovery (blog/content topics, high-signal)

Paste:

Run a blog/content component pass via topics (MDX/remark/rehype/shiki/etc.):

- `GITHUB_TOKEN="$(gh auth token)" ./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "Shaan" --top 25 --status triage --note-prefix "Seeded (blog topics pass): " -- --queries-md .blackbox/snippets/research/github-search-queries-content-blocks.md --no-derived-queries --min-stars 200 --exclude-keywords "awesome" --max-total-queries 24 --max-queries-per-group 8 --no-gap-boost --no-catalog-gap-boost --no-coverage-quota-boost --exclude-regex "\\b(portfolio|resume|curriculum|cv|personal\\s*(site|website)?|my\\s*site)\\b"`

Then summarize:
- how many new repos were added to `.blackbox/oss-catalog/catalog.json`
- how many new items were added to `.blackbox/oss-catalog/curation.json`
- top 10 candidates (by score) from the latest run’s `artifacts/oss-ranked.md`

---

## Prompt 6f — Targeted discovery (page sections/components: FAQ/pricing/testimonials/newsletter)

Paste:

Run a discovery pass for reusable page sections (for blog pages + marketing/content-heavy surfaces):

- `GITHUB_TOKEN="$(gh auth token)" ./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "Shaan" --top 25 --status triage --note-prefix "Seeded (sections/components pass): " -- --queries-md .blackbox/snippets/research/github-search-queries-sections-components.md --no-derived-queries --min-stars 100 --max-total-queries 24 --max-queries-per-group 8 --max-repos 120 --no-gap-boost --no-catalog-gap-boost --no-coverage-quota-boost --exclude-regex "\\b(portfolio|resume|curriculum|cv|personal\\s*(site|website)?|my\\s*site|course|homework|assignment|leetcode)\\b"`

Then:
- do a quick kill-sweep on obvious non-fit repos (keep `triage` usable)
- promote best 5–8 to `status=deepen` (component mining)
- render:
  - `./.blackbox/scripts/render-oss-catalog.sh`

---

## Prompt 6d — Targeted discovery (search topics: backend + UI primitives)

Paste:

Run a search pass via topics (Meilisearch/Typesense/InstantSearch/autocomplete/facets):

- `GITHUB_TOKEN="$(gh auth token)" ./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "Shaan" --top 25 --status triage --note-prefix "Seeded (search topics pass): " -- --queries-md .blackbox/snippets/research/github-search-queries-search-topics.md --no-derived-queries --min-stars 200 --max-total-queries 24 --max-queries-per-group 8 --no-gap-boost --no-catalog-gap-boost --no-coverage-quota-boost --exclude-regex "\\b(portfolio|resume|curriculum|cv|personal\\s*(site|website)?|my\\s*site)\\b"`

Then summarize:
- how many new repos were added to `.blackbox/oss-catalog/catalog.json`
- how many new items were added to `.blackbox/oss-catalog/curation.json`
- which repos should be marked `deepen` (max 6) vs `reject` (noise)

---

## Prompt 7 — POC deepening notes scaffold (#1)

Paste:

Pick the highest-priority `status=poc` repo and create concrete deepening notes:

- Find its repo entry markdown in the most recent run under `.blackbox/agents/.plans/.../oss/entries/*.md` if present;
  otherwise write the details into the curation item `notes`.

Add:
- “1 day POC plan” (steps)
- “integration touchpoints” (APIs, webhooks, DB)
- “risks + mitigations”

Then render catalog and ensure `poc-backlog.md` reflects the POC details:
- `./.blackbox/scripts/render-oss-catalog.sh`

---

## Prompt 8 — POC deepening notes scaffold (#2)

Paste:

Repeat Prompt 7 for the second highest-priority `status=poc` repo. Keep it concrete and timeboxed. Then render catalog:
- `./.blackbox/scripts/render-oss-catalog.sh`

---

## Prompt 9 — POC deepening notes scaffold (#3/#4/#5/#6)

Paste:

Repeat Prompt 7 for the remaining `status=poc` repos (in priority order) until all POCs have:
- a 1–2 day plan
- touchpoints
- risks/mitigations
- acceptance criteria

Then render:
- `./.blackbox/scripts/render-oss-catalog.sh`

---

## Prompt 10 — Weekly “decide / drop / deepen” checkpoint

Paste:

From `.blackbox/oss-catalog/poc-backlog.md`, for each `status=poc` item:
- decide `ship | keep_poc | drop`
- if `ship`, create a next-step execution note (2–4 bullets) in `notes`
- if `drop`, set status=reject and add a crisp reason

Do not change unrelated triage/watch items.

Then run:
- `./.blackbox/scripts/render-oss-catalog.sh`
