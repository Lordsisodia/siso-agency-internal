# Supabase Connection Fix - Complete Cleanup

**Date**: October 10, 2025  
**Issue**: Data not loading from Supabase  
**Root Cause**: User ID format mismatch between storage and lookup

---

## 🔍 Problem Analysis

### The Issue
- Supabase connection was healthy
- Database had data
- But no data was loading in the app

### Root Cause
**User ID Format Mismatch:**

1. **ClerkProvider** stored: `supabase_id: "user_31c4PuaPdFf9abejhmzrN9kcill"`
2. **useSupabaseUserId** queried: `WHERE supabase_id = "prisma-user-user_31c4..."` ❌
3. No match found → `userId = null` → All queries returned empty

### Why It Worked Before
- Legacy test accounts had format: `prisma-user-test-user`
- These matched the prefixed query
- Real user (fuzeheritage@gmail.com) had clean format: `user_31c4...`
- This DIDN'T match → broke when using real account

---

## ✅ Complete Fix Applied

### 1. Database Migration
**File**: `supabase/migrations/[timestamp]_remove_prisma_user_prefix.sql`

```sql
UPDATE users 
SET supabase_id = REPLACE(supabase_id, 'prisma-user-', '')
WHERE supabase_id LIKE 'prisma-user-%';
```

**Result**:
- `prisma-user-test-user` → `test-user`
- `prisma-user-test-user-123` → `test-user-123`
- `user_31c4...` → unchanged (already clean)

### 2. Code Fix - useSupabaseUserId Hook
**File**: `src/shared/lib/supabase-clerk.ts:41`

```typescript
// BEFORE:
.eq('supabase_id', `prisma-user-${clerkUserId}`)

// AFTER:
.eq('supabase_id', clerkUserId)
```

### 3. Import Path Standardization
**Fixed 9 files** to use correct import:

```typescript
// BEFORE (inconsistent):
import { useClerkUser } from '@/shared/ClerkProvider';

// AFTER (standardized):
import { useClerkUser } from '@/shared/hooks/useClerkUser';
```

**Files updated:**
- src/ecosystem/internal/tasks/hooks/useTaskData.ts
- src/ecosystem/internal/tasks/hooks/useTaskActions.ts
- src/ecosystem/internal/admin/auth/AdminAutoLogin.tsx
- src/ecosystem/internal/lifelock/AdminLifeLock.tsx
- src/ecosystem/internal/lifelock/sections/MorningRoutineSection.tsx
- src/ecosystem/internal/lifelock/sections/HomeWorkoutSection.tsx
- src/ecosystem/internal/lifelock/useLifeLockData.ts
- src/ecosystem/internal/feedback/SimpleFeedbackButton.tsx
- src/pages/TestMorningAI.tsx

### 4. Documentation Update
**File**: `src/services/mcp/supabase-client.ts:33`

Updated comment example:
```typescript
// BEFORE:
SELECT id, email FROM users WHERE supabase_id = 'prisma-user-123'

// AFTER:
SELECT id, email FROM users WHERE supabase_id = 'user_123abc'
```

---

## 🎯 Current State (After Fix)

### Database
```json
[
  {
    "email": "fuzeheritage@gmail.com",
    "supabase_id": "user_31c4PuaPdFf9abejhmzrN9kcill"
  },
  {
    "email": "test@example.com", 
    "supabase_id": "test-user-123"
  },
  {
    "email": "test-user@clerk.generated",
    "supabase_id": "test-user"
  }
]
```

### Code Flow (Fixed)
1. User signs in → Clerk ID: `user_31c4PuaPdFf9abejhmzrN9kcill`
2. `useSupabaseUserId("user_31c4...")` queries for `supabase_id = "user_31c4..."` ✅
3. Finds match → returns internal ID: `a95135f0-1970-474a-850c-d280fc6ca217`
4. All data queries use correct userId → Data loads! ✅

---

## 🛡️ Preventing Future Issues

### Import Rules
**Always use**: `@/shared/hooks/useClerkUser`  
**Never use**: `@/shared/ClerkProvider` (for useClerkUser hook)

### User ID Format
**Storage**: Raw Clerk ID (no prefix)  
**Lookup**: Raw Clerk ID (no prefix)  
**No transformations needed**

### Testing Checklist
When adding new components that use auth:
- [ ] Import from `@/shared/hooks/useClerkUser`
- [ ] Use `useSupabaseUserId(user?.id)` for internal ID
- [ ] Test with real account (not just test users)

---

## 📊 Verification

✅ TypeScript compilation: No errors  
✅ Import consistency: 0 wrong imports remaining  
✅ Database state: All users have clean IDs  
✅ Hook logic: Matches storage format

---

## 🎯 Next Steps

1. Restart dev server
2. Sign in with fuzeheritage@gmail.com
3. Verify data loads in all sections
4. Remove debug scripts if tests pass

---

**Fix complete. No more legacy Prisma cruft in the system.**
