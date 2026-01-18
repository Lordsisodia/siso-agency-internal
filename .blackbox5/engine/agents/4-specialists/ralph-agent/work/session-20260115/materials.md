# Materials Index - Session 2026-01-15

## Code Files

| File | Purpose | Location |
|------|---------|----------|
| test-runner.sh | Validation suite runner + reporting | `Blackbox3/ralph/tests/test-runner.sh` |
| lib.sh | Shared output helpers for the suite | `Blackbox3/ralph/tests/lib.sh` |
| run-continuously.sh | Manual continuous loop runner | `Blackbox3/ralph/tests/run-continuously.sh` |
| baseline.json | Baseline inventories (scripts/agents/docs) | `Blackbox3/ralph/tests/baseline.json` |
| monitor-blackbox.sh | Continuous monitoring wrapper (state/logs/dashboard) | `Blackbox3/ralph/scripts/monitor-blackbox.sh` |
| scan-issues.sh | Issue detection scanner (writes work/issues) | `Blackbox3/ralph/scripts/scan-issues.sh` |

## Documentation Files

| File | Purpose | Location |
|------|---------|----------|
| tests README | How to run/update baseline/CI usage | `Blackbox3/ralph/tests/README.md` |
| Continuous validation doc | Updated to reflect suite exists | `Blackbox3/ralph/CONTINUOUS-VALIDATION.md` |

## Artifacts

- JSON reports are written under: `Blackbox3/ralph/.ralph/.tmp/test-results/`
- Baseline updates are done via: `bash Blackbox3/ralph/tests/test-runner.sh --update-baseline`
- No sub-agent outputs were produced in this session.
- Monitoring runtime outputs are written under: `Blackbox3/ralph/work/monitoring/` (results, health log, alerts, dashboard)
- Issue scan outputs are written under: `Blackbox3/ralph/work/issues/` (issues.json + report.md)

## Where Everything Is Stored

- **Main work area:** `Blackbox3/ralph/`
- **Test suite:** `Blackbox3/ralph/tests/`
- **Monitoring outputs:** `Blackbox3/ralph/work/monitoring/`
- **Session docs (this folder):** `agents/ralph-agent/work/session-20260115/`
