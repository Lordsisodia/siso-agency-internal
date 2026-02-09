# Supabase DDL + RLS (Skill)

When an issue touches schema or permissions:

## DDL rules

- Use `siso-internal-supabase.apply_migration` for DDL (CREATE/ALTER/DROP).
- Name migrations in `snake_case`.

## After DDL

- Run `siso-internal-supabase.get_advisors` with `type="security"`.
- Regenerate TypeScript types per repo conventions.

## RLS checklist

- Confirm policies enforce user isolation.
- Validate both reads and writes for intended roles.
- Add regression checks for common query paths.

