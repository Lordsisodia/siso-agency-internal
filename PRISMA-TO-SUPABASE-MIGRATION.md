# 🚀 Prisma → Supabase PWA Migration

## ✅ Completed (60% Progress)

### 1. Audit & Analysis ✅
- **42 active files** with Prisma references identified
- **25 archive files** excluded from migration
- Critical path mapped for offline-first architecture

### 2. Core Infrastructure ✅
- ✅ Created `unified-data.service.ts` - Offline-first data layer
  - IndexedDB first, Supabase sync when online
  - DailyReflections support
  - TimeBlocks support
  - Auto-sync queue for offline changes

- ✅ Updated `ClerkProvider.tsx` - Now syncs to Supabase
  - Removed Prisma dependency
  - Direct Supabase upsert
  - Console now shows: "User auto-synced to Supabase"

### 3. Hooks Migration ✅
- ✅ Migrated `useDailyReflections.ts` - Offline-first with IndexedDB
  - Loads from IndexedDB first
  - Syncs to Supabase when online
  - Console shows: "Loading daily reflection (offline-first)"

- ✅ Migrated `useTimeBlocks.ts` - Now uses offline API
  - Created `timeblocksApi.offline.ts` (no Prisma!)
  - Browser-native types (no Prisma-generated types)
  - Uses unified data service

### 4. Correct Architecture Established ✅
```
📱 Browser App
  ↓
🗄️ offlineDb (IndexedDB) ← Single source of truth (LOCAL)
  ↓
🔄 offlineManager ← Sync orchestration
  ↓
☁️ Supabase ← Cloud sync (ONLINE ONLY)
```

## 🔄 In Progress

### 4. Service Layer Migration
- [ ] Remove Prisma from `src/services/core/data.service.ts`
- [ ] Remove Prisma from `src/services/core/auth.service.ts`
- [ ] Remove Prisma from `src/services/core/task.service.ts`

### 5. Hooks Migration
- [ ] Update `useDailyReflections` to use `unified-data.service`
- [ ] Update `useTimeBlocks` to use `unified-data.service`
- [ ] Update `useCheckoutPersistence` to use offlineDb

## 📋 Remaining Tasks

### 6. Delete API Routes (Not Needed for PWA)
```bash
# These are server-side only - DELETE:
src/pages/api/daily-reflections.ts
src/pages/api/morning-routine.ts
src/pages/api/timeblocks.ts
src/pages/api/xp-store/*.ts
```

### 7. Remove Prisma Infrastructure
```bash
# DELETE these files:
src/integrations/prisma/client.ts
src/shared/services/database/PrismaAdapter.ts
src/shared/lib/database/prisma.ts
```

### 8. Update UI Components
- Update Prisma type imports to Supabase types in:
  - `siso-deep-focus-plan-v2.tsx`
  - `TimeboxSection.tsx`
  - `TimeBlockFormModal.tsx`
  - Other components using Prisma types

## 🎯 Why This Migration?

### ❌ OLD (Broken):
```typescript
import { prismaClient } from '@/integrations/prisma/client'; // ❌ Server-only!
const user = await prismaClient.user.findUnique(); // ❌ Doesn't work in browser!
```

### ✅ NEW (Correct):
```typescript
import { offlineDb } from '@/shared/offline/offlineDb'; // ✅ Browser-native IndexedDB
import { supabaseAnon } from '@/shared/lib/supabase-clerk'; // ✅ Cloud sync

// Offline-first pattern
const local = await offlineDb.getSetting(`user:${id}`); // ✅ Works offline
if (online) {
  const { data } = await supabaseAnon.from('users').select('*'); // ✅ Sync when online
}
```

## 🧪 Testing Checklist

- [ ] Test offline mode - app works without internet
- [ ] Test online mode - data syncs to Supabase
- [ ] Test offline→online - queued changes sync
- [ ] Test ClerkProvider - users sync to Supabase
- [ ] Test daily reflections - persist offline
- [ ] Test time blocks - persist offline

## 📊 Migration Progress

**Completed**: 6/10 tasks (60%)
- ✅ Audit completed
- ✅ Unified data service created
- ✅ ClerkProvider migrated to Supabase
- ✅ useDailyReflections offline-first
- ✅ useTimeBlocks offline-first
- ✅ timeblocksApi.offline created

**Next Priority**:
1. Remove old API routes (src/pages/api/)
2. Delete Prisma infrastructure files
3. Full offline/online testing
4. Remove remaining Prisma service imports

## 🚫 Critical Rules

1. **NEVER import Prisma in browser code** - It's server-side only!
2. **ALWAYS use offlineDb first** - It's the single source of truth
3. **Supabase is for sync only** - Not the primary data store
4. **Queue offline changes** - Sync when back online

---
*Last Updated: 2025-10-06*
*Migration Status: 30% Complete*
