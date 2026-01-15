# Runbook: Deep Research Agent

## 🧭 Stages (recommended workflow)

### Stage 0 — Align

- Define the research goal in 1 sentence.
- Define the decision this research should enable (what changes if we learn X?).

### Stage 1 — Plan

- Create a plan folder.
- Write success metrics + a work queue (5–10 items).

### Stage 2 — Research

- Gather evidence with a hypothesis-driven approach.
- Capture sources/links as you go (so the output is auditable).

### Stage 3 — Synthesize

- Turn findings into ranked recommendations.
- Call out unknowns and what would de-risk them.

### Stage 4 — Report

- Produce a final report with artifacts and next steps.

## 🧠 Plan-local memory (required for long runs)

- Maintain `<plan>/context/context.md` (rolling summary)
- After each checkpoint, write one step file:

```bash
./docs/.blackbox/scripts/new-step.sh --plan docs/.blackbox/agents/.plans/<plan> "Checkpoint: <what changed>"
```

- Every 10 step files are compacted automatically; compact early if context gets unwieldy.

---

## 🗣️ Communication templates (what the agent “says”)

Use these when sending human-facing updates (chat/Slack/voice):

- Read-aloud status updates: `docs/07-templates/agent-comms/read-aloud-status-update.md`
- Decision requests: `docs/07-templates/agent-comms/decision-request.md`
- End-of-run summary: `docs/07-templates/agent-comms/end-of-run-summary.md`

---

## Start a new run

Optional: start from the agent prompt in:
- `docs/.blackbox/agents/deep-research/prompt.md`

```bash
./.blackbox/scripts/new-run.sh deep-research "<topic>" \
  --prompt .blackbox/agents/deep-research/prompts/library/<pick-one>.md
```

The plan folder will include an `artifacts/` directory. Minimum expected artifacts:
- `artifacts/run-meta.yaml`
- `artifacts/sources.md`
- `artifacts/summary.md`
- `artifacts/extracted.json` (when possible)

## Optional: enable Telegram updates

Option A: set env vars (never commit/store tokens in tracked files):

```bash
export TELEGRAM_BOT_TOKEN="***"
export TELEGRAM_CHAT_ID="123456789"
```

Option B: local markdown config (gitignored, no `.env`):

```bash
mkdir -p ./.blackbox/.local
cat > ./.blackbox/.local/telegram.md <<'EOF'
bot_token: ***
chat_id: 123456789
EOF
```

Send a test ping:

```bash
./.blackbox/scripts/notify-telegram.sh "[Deep Research] Starting run: <topic>"
```

Then inside the created plan folder, create:
- `work-queue.md`
- `success-metrics.md`
- `progress-log.md`
- `final-report.md`
- `artifact-map.md`
- `rankings.md`

If the outcome is reusable, promote it to an evergreen note and log it:

```bash
./.blackbox/scripts/promote.sh docs/.blackbox/agents/.plans/<run-folder> "<topic-slug>"
```

If you create/update any canonical docs under `docs/0X-*/`, append an entry to:
- `docs/08-meta/repo/docs-ledger.md`

## Suggested files (templates)

### `work-queue.md`
```md
# Work Queue

## Next actions (keep 5–10)
- [ ] …
```

### `progress-log.md`
```md
# Progress Log

- YYYY-MM-DD HH:MM — <what changed> — <why it matters>
```

## How to avoid low-value loops
- Never do “more searching” without a hypothesis.
- Never add a section to the report that doesn’t drive a decision.
- Prefer small validation steps over broad scanning once top ideas emerge.
