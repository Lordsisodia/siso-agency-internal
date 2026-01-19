# Architecture Analysis: User Profile Page

## System Location

### Domain Placement
The user profile page fits best as a **new dedicated domain** at:
```
src/domains/user/
```

Following the established **feature-based pattern** used in the codebase:
```
user/
├── features/
│   ├── profile/           # Main profile page and editing
│   │   ├── ui/
│   │   │   ├── pages/
│   │   │   │   └── ProfilePage.tsx
│   │   │   └── components/
│   │   │       ├── ProfileHeader.tsx
│   │   │       ├── ProfileForm.tsx
│   │   │       ├── AvatarUpload.tsx
│   │   │       └── SocialLinksEditor.tsx
│   ├── settings/          # Account settings
│   │   ├── ui/
│   │   │   ├── pages/
│   │   │   │   └── SettingsPage.tsx
│   │   │   └── components/
│   │   │       ├── AccountSettings.tsx
│   │   │       ├── NotificationSettings.tsx
│   │   │       └── PrivacySettings.tsx
│   └── preferences/       # User preferences
│       ├── ui/
│       │   ├── pages/
│       │   │   └── PreferencesPage.tsx
│       │   └── components/
│       │       ├── ThemeSelector.tsx
│       │       └── DisplayPreferences.tsx
├── _shared/
│   ├── ui/
│   │   └── components/
│   │       ├── UserAvatar.tsx
│   │       └── UserProfileCard.tsx
│   ├── domain/
│   │   ├── types/
│   │   │   └── profile.types.ts
│   │   └── services/
│   │       └── profileService.ts
│   └── hooks/
│       ├── useUserProfile.ts
│       └── useProfileUpdate.ts
└── index.ts
```

**Alternative**: Could be placed within `src/domains/admin/5-settings/` if treated as admin functionality, but this is not recommended as user profiles are user-facing, not administrative.

## Component Interactions

### Existing Integration Points

1. **Authentication Layer**
   - **Clerk Auth**: Primary authentication via `@clerk/clerk-react`
   - **ClerkAuthGuard**: Route protection wrapper
   - **useClerkUser Hook**: Provides user data (id, email, name, imageUrl)
   - Location: `/src/lib/auth/`

2. **Profile Dropdown Components** (Already Exist)
   - `UserProfileDropdown` - Located in `/src/domains/lifelock/1-daily/_shared/components/`
   - `SidebarFooter` - Located in `/src/components/sidebar/` with profile menu
   - Both navigate to `/profile` (route doesn't exist yet)

3. **Data Layer**
   - **Supabase Integration**: `/src/services/integrations/supabase/`
   - **Database Schema**: `profiles` table already exists in Supabase
   - **Type Definitions**: Profile types in `/src/services/integrations/supabase/types.ts`

4. **Shared UI Components**
   - Avatar component: `/src/components/ui/avatar.tsx`
   - Form components: `/src/components/ui/form.tsx`, `/src/components/ui/input.tsx`
   - Dialog/Sheet components for modals

### Will Interact With

- **XP Store Domain** (`/src/domains/xp-store/`): Display user XP and level
- **LifeLock Domain** (`/src/domains/lifelock/`): User's daily stats and achievements
- **Tasks Domain** (`/src/domains/tasks/`): User's task preferences and settings
- **Admin Domain** (`/src/domains/admin/5-settings/`): If admin-specific settings needed

## Data Flow

### Current User Data Flow

```
Clerk Auth → Clerk User Object → useClerkUser Hook → Components
                 ↓
            Supabase Auth (legacy, being phased out)
                 ↓
            Supabase Profiles Table (extended user data)
```

### Proposed User Profile Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      User Profile Page                       │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ↓                           ↓
         Clerk Auth API              Supabase API
        (auth user data)            (profile data)
                │                           │
                ↓                           ↓
         ┌──────────────┐          ┌──────────────┐
         │ Clerk User   │          │  Profiles    │
         │ Object       │          │  Table       │
         │              │          │              │
         │ - id         │          │ - id         │
         │ - email      │          │ - full_name  │
         │ - firstName  │          │ - bio        │
         │ - lastName   │          │ - avatar_url │
         │ - imageUrl   │          │ - social_links│
         │ - fullName   │          │ - tokens     │
         └──────────────┘          │ - preferences│
                  │                └──────────────┘
                  │                         │
                  └──────────┬──────────────┘
                             ↓
                    ┌────────────────┐
                    │ Profile Service│
                    │ (API Layer)    │
                    └────────────────┘
                             │
                             ↓
                    ┌────────────────┐
                    │useUserProfile  │
                    │Custom Hook     │
                    └────────────────┘
                             │
                             ↓
                    ┌────────────────┐
                    │  Profile Page  │
                    │  Components    │
                    └────────────────┘
```

### Profile Data Structure

From Supabase types (`/src/services/integrations/supabase/types.ts`):

```typescript
interface Profile {
  id: string;                      // Clerk user ID
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  professional_role: string | null;
  business_name: string | null;

  // Social Links
  twitter_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  instagram_url: string | null;
  website_url: string | null;

  // Gamification
  siso_tokens: number | null;
  onboarding_completed: boolean | null;

  // Web3
  solana_wallet_address: string | null;

  // Metadata
  created_at: string;
  updated_at: string;
}
```

## Integration Points

### API Endpoints Needed

**Supabase Queries** (via `/src/services/integrations/supabase/client`):

1. **Get Profile**
   ```typescript
   supabase
     .from('profiles')
     .select('*')
     .eq('id', userId)
     .single()
   ```

2. **Update Profile**
   ```typescript
   supabase
     .from('profiles')
     .update(updates)
     .eq('id', userId)
     .select()
   ```

3. **Upload Avatar**
   ```typescript
   supabase.storage
     .from('avatars')
     .upload(`${userId}/${fileName}`, file)
   ```

4. **Create Profile** (if doesn't exist)
   ```typescript
   supabase
     .from('profiles')
     .insert({ id: userId, ... })
   ```

### Database Tables

**Existing** (in Supabase):
- `profiles` table - Already exists with full schema
- `users` table - Clerk's table (read-only from app perspective)

**No new tables needed** - infrastructure is ready.

### Authentication Requirements

1. **Authentication Required**: All profile pages must be wrapped in `ClerkAuthGuard`
2. **User ID**: Available from Clerk's `useUser()` hook
3. **Profile Sync**: Need to create Clerk→Supabase profile sync on first login
4. **Authorization**: Users can only edit their own profile (row-level security in Supabase)

### File Upload Requirements

- **Storage**: Supabase Storage bucket `avatars` (likely needs to be created)
- **Image Processing**: Client-side resize/compression before upload
- **Public URLs**: Supabase Storage provides public URL generation

## Routing Structure

### Current Routing

**Location**: `/src/app/App.tsx`

Uses `react-router-dom` with the following patterns:
- Admin routes: `/admin/*`
- Auth routes: `/auth`
- LifeLock routes: `/admin/lifelock/*`

### Proposed User Profile Routes

```typescript
// Add to App.tsx routes
<Route
  path="/profile"
  element={<ClerkAuthGuard><ProfilePage /></ClerkAuthGuard>}
/>
<Route
  path="/profile/edit"
  element={<ClerkAuthGuard><ProfileEditPage /></ClerkAuthGuard>}
/>
<Route
  path="/settings"
  element={<ClerkAuthGuard><SettingsPage /></ClerkAuthGuard>}
/>
```

### Navigation Patterns

**Existing** navigation to profile (from `SidebarFooter.tsx`):
```typescript
navigateTo('/profile')  // Already implemented, route doesn't exist
```

**Profile Menu Items** (from `UserProfileDropdown.tsx`):
```typescript
handleNavigateToSettings()  // Implemented, needs route
handleNavigateToXP()        // Goes to /admin/lifelock/analytics
```

## State Management

### Current State Management

**Zustand** (Primary store pattern):
- **Task Store**: `/src/domains/tasks/stores/taskStore.ts`
- Pattern: Zustand + devtools + persist + immer middleware
- Excellent pattern to follow for user profile state

**React Hooks** (Authentication):
- `useClerkUser` - Clerk user data
- `useAuthSession` - Auth session management
- `useUser` - Legacy Supabase auth (being phased out)

### Recommended Profile State Management

**Option 1: Zustand Store** (Recommended for complex profile state)
```typescript
// src/domains/user/_shared/stores/profileStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface ProfileStore {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
}

export const useProfileStore = create<ProfileStore>()(
  devtools(
    persist(
      (set, get) => ({
        // ... implementation
      }),
      { name: 'profile-store' }
    )
  )
);
```

**Option 2: Custom Hooks** (Simpler, for straightforward CRUD)
```typescript
// src/domains/user/_shared/hooks/useUserProfile.ts
export function useUserProfile(userId: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // ... fetch logic
  return { profile, isLoading, updateProfile, uploadAvatar };
}
```

**Recommendation**: Start with custom hooks, migrate to Zustand if state complexity grows.

### Local State vs Global State

- **Profile Editing**: Local component state (form state)
- **Current Profile Data**: Global (Zustand or Context)
- **User Session**: Clerk's built-in state (don't duplicate)
- **Preferences**: Persist in localStorage (via Zustand persist)

## Key Findings

### 1. **Infrastructure is Ready**
- ✅ Supabase `profiles` table exists with comprehensive schema
- ✅ Clerk authentication is fully integrated
- ✅ UI components (Avatar, Form, Dialog) are available
- ✅ Profile dropdowns already navigate to `/profile` (route just needs implementation)

### 2. **Two Auth Systems Present**
- **Current**: Clerk (primary, actively used)
- **Legacy**: Supabase Auth (being phased out)
- ⚠️ **Decision Needed**: Use Clerk user ID as foreign key to Supabase profiles
- ⚠️ **Sync Needed**: Create profile in Supabase on first Clerk login

### 3. **Domain Structure is Well-Established**
- Follow **feature-based pattern** (like `tasks/` domain)
- NOT a numbered flow (not sequential)
- Create new `user/` domain (don't force into `admin/`)
- Reuse shared patterns from existing domains

### 4. **Profile Components Already Exist**
- `UserProfileDropdown` in LifeLock domain (XP-focused, minimal)
- `SidebarFooter` with profile menu (navigates to `/profile`)
- Both show user avatar and basic info
- Opportunity to consolidate and enhance

### 5. **Integration with Gamification System**
- Profile connects to XP system (`siso_tokens` in schema)
- Level display (already in UserProfileDropdown)
- Achievement display potential
- Social links for sharing achievements

### 6. **File Upload Infrastructure Needed**
- Supabase Storage bucket for avatars
- Image processing (resize/compress) on client
- Public URL generation for profile pictures

### 7. **Routing Integration Points**
- Add routes to `/src/app/App.tsx`
- Wrap all routes in `ClerkAuthGuard`
- Follow existing pattern: lazy load for performance
- Add to navigation menus

### 8. **Type Safety Available**
- Supabase types already generated (`/src/services/integrations/supabase/types.ts`)
- Use these types for type-safe profile operations
- Extend with additional types as needed

## Recommendations

### Immediate Actions

1. **Create user domain structure**
   ```bash
   src/domains/user/features/profile/ui/pages/
   src/domains/user/_shared/domain/
   src/domains/user/_shared/hooks/
   ```

2. **Create profile service layer**
   - Implement CRUD operations for Supabase profiles
   - Handle avatar uploads
   - Create profile on first login if missing

3. **Build profile page components**
   - Profile view page
   - Profile edit form
   - Avatar upload component
   - Social links editor

4. **Add routing**
   - Add `/profile` route to App.tsx
   - Wrap in ClerkAuthGuard
   - Lazy load for performance

### Future Enhancements

1. **Profile Completion** - Onboarding flow
2. **Privacy Settings** - Control profile visibility
3. **Activity Feed** - User's recent activity
4. **Achievement Display** - Showcase accomplishments
5. **Social Features** - Follow other users, comments
6. **Profile Themes** - Customization options

### Technical Considerations

1. **Row-Level Security** - Ensure users can only edit their own profile
2. **Optimistic Updates** - Improve perceived performance
3. **Image Optimization** - Compress avatars before upload
4. **Caching Strategy** - Cache profile data appropriately
5. **Error Handling** - Graceful degradation for missing profiles
6. **Loading States** - Skeleton screens during data fetch
