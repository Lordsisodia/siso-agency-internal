# Prisma Setup for SISO Internal (Database in Code)

This adds a "database in code" layer over your existing Supabase setup.
**Nothing changes in your app** - this is additive for type safety.

## What This Gives You

### Before (Supabase only):
```typescript
// No types, manual interfaces
const { data } = await supabase
  .from('light_work_tasks')
  .select('*');
// data is any[]
```

### After (Prisma + Supabase):
```typescript
// Full type safety
const tasks = await prisma.lightWorkTask.findMany({
  where: { userId: '123' },
  include: { subtasks: true }
});
// tasks is LightWorkTask[] with full autocomplete
```

## Setup Steps

1. **Copy environment file:**
   ```bash
   cp .env.prisma.example .env
   ```

2. **Add your Supabase credentials:**
   - Go to Supabase Dashboard → Project Settings → Database
   - Copy "Connection string" (URI format)
   - Replace `[YOUR-PASSWORD]` and `[YOUR-PROJECT-REF]` in `.env`

3. **Install Prisma CLI:**
   ```bash
   npm install -D prisma
   ```

4. **Generate types:**
   ```bash
   npm run db:generate
   ```

5. **Optional: Sync with actual database:**
   ```bash
   npm run db:introspect
   ```
   This pulls your actual Supabase schema into `schema.prisma`

## Usage

```typescript
import { prisma } from '@/lib/services/prisma/client';

// Type-safe queries
const tasks = await prisma.lightWorkTask.findMany({
  where: { completed: false },
  orderBy: { createdAt: 'desc' },
  include: { subtasks: true }
});

// Full autocomplete on tasks
// tasks[0].subtasks[0].title ← typed!
```

## Important Notes

- **This is READ-ONLY for now** - keep using Supabase client for writes
- **No migrations** - manage schema in Supabase dashboard
- **Types are generated** - run `npm run db:generate` after schema changes
- **Safe to ignore** - your existing code works unchanged

## Scripts

- `npm run db:generate` - Generate TypeScript types from schema
- `npm run db:introspect` - Pull schema from Supabase
- `npm run db:studio` - Open Prisma Studio (visual DB browser)

## Comparison: Convex vs Supabase + Prisma

| Feature | Convex | Supabase + Prisma |
|---------|--------|-------------------|
| Schema in code | ✅ Native | ✅ Prisma schema |
| Auto migrations | ✅ Yes | ❌ Manual SQL |
| Type generation | ✅ Runtime | ✅ Build-time |
| MCP/AI tools | ❌ Limited | ✅ Excellent |
| Query language | TypeScript | Prisma Client |
| Branded IDs | ✅ Yes | ❌ No |

**Trade-off:** You get 80% of Convex's DX with 100% of Supabase's ecosystem.
