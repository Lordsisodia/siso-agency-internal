# Lane: Activity feed + timeline UI (audit / customer timeline)

Goal: find OSS implementations of **timeline / activity feed** UI patterns we can reuse for:
- Support timeline (customer/order activity)
- Returns Ops timeline (status changes, decisions, overrides)
- Audit trail UI (immutable log + per-actor/per-object filters)

This lane prefers **UI + data contract patterns** over full platforms.

## What we’re looking for (high-signal)

### Timeline UI patterns
- event list that supports grouping (by day/actor/type)
- per-event “details” expanders + deep links
- filters/search (event type, actor, date range, object id)
- pagination + virtualization (for large histories)

### Event schema conventions
- `actor`, `action`, `object`, `timestamp`, `metadata`, `trace_id`
- reason fields (“why this decision”) + links to related objects (order/return/customer)

## What we avoid (reduce churn)
- social-network feeds (Twitter/Mastodon clones)
- RSS readers/news aggregators
- “portfolio timeline” personal sites
- copyleft runtime deps unless reference-only

## Recommended next run (command)

- `GITHUB_TOKEN="$(gh auth token)" ./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "Shaan" --top 25 --status triage --note-prefix "Seeded (activity-feed/timeline pass): " -- --queries-md .blackbox/snippets/research/github-search-queries-activity-feed-timeline.md --no-derived-queries --no-rotate --min-stars 25 --max-total-queries 28 --max-queries-per-group 6 --no-gap-boost --no-catalog-gap-boost --no-coverage-quota-boost --exclude-keywords "portfolio,resume,curriculum,cv,mastodon,twitter,lemmy,reddit,microblog" --exclude-regex \"\\\\b(feed\\\\s*reader|rss\\\\s*reader|news\\\\s*aggregator|course|homework|assignment|tutorial|leetcode)\\\\b\"`

## Stop rule (avoid churn)

If one pass yields mostly social feeds/news readers or duplicates, pause this lane and focus on mining timelines from the best admin apps already curated.

