# Scripts

These scripts are small helpers for managing the Blackbox runtime.

## Common

Create a new feedback run (copies from `.runs/_templates/feedback-run/` and sets it active):

```bash
./docs/.blackbox/scripts/new-run.sh "feedback-batch-002" --owner shaun
```

Set the active run:

```bash
./docs/.blackbox/scripts/set-active-run.sh "2026-01-05_feedback-batch-001"
```

Sanity checks:

```bash
./docs/.blackbox/scripts/check-blackbox.sh
./docs/.blackbox/scripts/validate-all.sh
```

