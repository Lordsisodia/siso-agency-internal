
# Project Development Notes

## Important: Supabase TypeScript Types

The current Database type definition in `src/integrations/supabase/client.ts` is a temporary solution to avoid TypeScript errors. It only explicitly defines the `plans` table and uses type assertions to allow queries to other tables.

### Recommended Approach

For a proper solution, you should generate complete TypeScript types from your Supabase schema:

1. Install the Supabase CLI
2. Run `supabase gen types typescript --project-id avdgyrepwrvsvwgxrccr > types.ts`
3. Replace the current Database type with the generated one

Until then, you can use the `safeQuery` helper function from `src/utils/typeHelpers.ts` for queries to tables not defined in the current type:

```typescript
import { safeQuery } from '@/utils/typeHelpers';

// Example usage
const { data, error } = await safeQuery('profiles')
  .select('*')
  .eq('user_id', userId);
```

This is not ideal from a type-safety perspective, but it's a pragmatic workaround until proper types are generated.
