# Research + Grouping Checklist

Use this checklist when transforming `.blackbox/inbox/issues.md` into `.blackbox/state/groups.md` and issue folders.

## Normalize each item

- Rewrite into a single, testable problem statement.
- If it contains multiple problems, split into multiple issues.
- Add clarifying questions (but don’t block grouping on unanswered questions).

## Capture minimal context

- Which screen / route / feature is impacted?
- Which integration (Stripe, Slack, Supabase, etc.)?
- Which layer is most likely involved?
  - UI / components
  - services / business logic
  - database / RLS / migrations
  - auth / sessions
  - build/deploy

## Group by shared code areas

Prefer grouping by **shared code paths** over vague categories:

- `supabase/rls` (policies, permissions, row filtering)
- `supabase/schema` (tables, migrations, triggers)
- `integrations/stripe`
- `integrations/slack`
- `ui/forms` (form state, validation, disabled states)
- `auth/session` (refresh, redirects, guards)

## Output artifacts

- Update `.blackbox/state/groups.md`
- Create issue folders under `.blackbox/issues/`
- Seed each issue with `.blackbox/templates/issue_plan.md`

