# Supabase Domain — Index

## Key areas

- `supabase/` (migrations, config)
- `src/services/database/` (Supabase operations)
- RLS policies + triggers (when applicable)

## Common failure modes

- RLS blocks writes/reads unexpectedly
- types out of sync with schema

