# Lane: Support timeline + Helpdesk primitives

Goal: find **embeddable support primitives** we can integrate into an ops timeline (customer/order conversation history),
without adopting a full helpdesk suite.

This lane is about:
- capturing customer conversations into our event/timeline model
- building “support inbox” primitives (threads, assignments, SLA-ish timestamps) if needed
- finding chat widget / messaging UI references we can mine for UX patterns

## What we’re looking for (high-signal)

### Timeline primitives (core)
- Conversation threads mapped to a customer + order (not just “tickets”)
- Message ingestion patterns (email → thread, chat → thread)
- Internal notes + tagging + assignment
- Audit-friendly storage (who changed status, when, why)

### Embeddable UI primitives (reference / optional)
- Chat widget / web messenger (JS/TS, embeddable snippet)
- “conversation sidebar” patterns (timeline view, attachments, rich text)
- Status transitions + timestamps (first response, resolution time)

## What we explicitly avoid (to reduce churn)
- Full helpdesk platforms unless they teach a reusable pattern
- LLM chat apps (not support primitives)
- Copyleft-heavy licenses for runtime (AGPL/GPL) unless we only keep as a reference

## Current curated highlights (from our catalog/curation)

Higher-fit primitives:
- `django-helpdesk/django-helpdesk` (deepen) — simple ticketing primitives in Python; good to mine for models + workflows
- `papercups-io/chat-widget` (deepen) — embeddable chat widget patterns (JS/TS)

Useful “watch” references (verify license + scope):
- `chatwoot/chatwoot` (watch, license=verify) — broad helpdesk/messenger; keep until license confirmed
- `intergram/intergram` (watch) — lightweight widget reference
- `node-zendesk/node-zendesk` (watch) — API wrapper patterns (integration touchpoints)
- `chaskiq/chaskiq` / `peppermint-lab/peppermint` / `trudesk/trudesk` (watch) — pattern mining, not direct adoption
- `channel-io/channel-web-sdk-loader` (watch) — vendor loader patterns for embeddable widgets (bootstrapping/snippet)
- `classiebit/addchat-laravel` (watch) — chat widget + ticketing-ish flows (MIT; non-primary stack but useful reference)
- `rotatordisk92/react-slack-chat` (watch, license=verify) — embeddable widget UI patterns (verify license)
- `aliezzahn/event-timeline-roadmap` (watch, license=verify) — timeline/roadmap UI component reference (admin timeline patterns)
- `tarunc/intercom.io` (watch) — Intercom API client patterns (Node.js)
- `intercom/intercom-dotnet` (watch) — Intercom API client patterns (.NET)

License-risky “reject” references:
- `zammad/zammad` (reject, AGPL)
- `freescout-help-desk/freescout` (reject, AGPL)

## How we evaluate quickly (keep it tactical)

1) **Can it power a timeline event model?**
   - Does it have threads/messages/assignments that map to customer + order?
2) **Is there an embeddable surface?**
   - Widget, SDK, API client, or clean primitives we can lift.
3) **Integration touchpoints**
   - Email ingestion, webhooks, message bus, DB schema, attachments.
4) **License gating**
   - `safe` → proceed; `verify` → watch; `flagged` → reject unless reference-only.

## Recommended next runs (commands)

Support timeline query pack (high-signal, keep it narrow):
- `GITHUB_TOKEN="$(gh auth token)" ./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "Shaan" --top 25 --status triage --note-prefix "Seeded (support timeline pass): " -- --queries-md .blackbox/snippets/research/github-search-queries-support-timeline.md --no-derived-queries --min-stars 30 --max-total-queries 18 --max-queries-per-group 8 --max-repos 80 --no-gap-boost --no-catalog-gap-boost --no-coverage-quota-boost --exclude-keywords "ai,llm,chatgpt,copilot,knowledge-base,notes,note-taking,wiki,pkm" --exclude-regex "\\b(ai|llm|chatgpt|copilot|knowledge\\s*base|notes?|note-taking|pkm|second\\s*brain|obsidian|notion)\\b"`

## Stop rule (avoid diminishing returns)

If we run **2 passes** and mostly get:
- AGPL/GPL helpdesks we can’t integrate, or
- chat apps unrelated to support,

…pause this lane and rotate to returns/shipping/workflow primitives for the next cycle.
