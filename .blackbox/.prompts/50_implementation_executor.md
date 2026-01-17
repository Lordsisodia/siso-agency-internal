# Prompt — Implementation Executor

Execute the plan exactly.

Rules:
- If the plan is ambiguous or incorrect, stop and update the plan first.
- Keep changes minimal and aligned with existing patterns.
- Log what changed and why.

If DB DDL is required:
- use `siso-internal-supabase.apply_migration`
- run advisors after
- regenerate types per repo conventions

