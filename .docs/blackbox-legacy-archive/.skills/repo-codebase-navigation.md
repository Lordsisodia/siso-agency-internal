# Repo Codebase Navigation (Skill)

Goal: quickly locate the *real* code paths involved in an issue.

## Tactics

- Start from the user-facing symptom → identify route/screen/component.
- Search for the exact UI text / label / error message.
- Find the data-fetch / mutation call site (services layer).
- Identify any schema/RLS dependencies if Supabase is involved.

## Outputs to write into issue handoffs

- “Entry points” (file paths)
- “Likely root cause” hypothesis
- “Related patterns” (existing components/hooks/services)

