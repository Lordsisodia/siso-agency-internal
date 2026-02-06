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

## Quick Setup (One Command)

```bash
npm run db:setup
```

This installs Prisma and generates types from the schema.

## Manual Setup

1. **Copy environment file:**
   ```bash
   cp .env.prisma .env
   ```

2. **Add your Supabase database password:**
   - Go to Supabase Dashboard → Project Settings → Database
   - Copy your database password
   - Replace `[YOUR-PASSWORD]` in `.env` with the actual password

3. **Install Prisma:**
   ```bash
   npm install -D prisma
   ```

4. **Generate types:**
   ```bash
   npm run db:generate
   ```

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

- `npm run db:setup` - Install Prisma and generate types (one-time)
- `npm run db:generate` - Generate TypeScript types from schema
- `npm run db:introspect` - Pull schema from Supabase (if you change DB)
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

## Your Supabase Project

- **Project URL:** https://avdgyrepwrvsvwgxrccr.supabase.co
- **Schema:** Auto-generated from your actual database
- **Tables included:**
  - `light_work_tasks` / `light_work_subtasks`
  - `deep_work_tasks` / `deep_work_subtasks` / `deep_work_sessions`
  - `daily_reflections`
  - `user_feedback`
  - `daily_routines`
  - `time_blocks`

## Troubleshooting

**Error: Environment variable not found**
- Make sure `.env` file exists with DATABASE_URL and DIRECT_URL

**Error: Can't reach database**
- Check your password is correct
- Make sure you're using the right project URL

**Types not updating**
- Run `npm run db:generate` after any schema changes
