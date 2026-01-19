---
name: User Profile Epic
status: planned
created: 2026-01-18T08:18:53Z
progress: 0%
prd: .claude/prds/user-profile.md
github: [TODO - will be added later]
---

# Epic: User Profile Page

## Overview

Enable users to establish and maintain their digital identity within the SISO ecosystem through a secure, privacy-focused profile page. This epic delivers a complete user profile system with viewing, editing, avatar management, privacy controls, and account deletion capabilities - all built with security-first architecture and GDPR/CCPA compliance from day one.

**Core Value Proposition**: Identity + Control + Security

**Technical Approach**: Leverage existing infrastructure (Clerk auth, Supabase DB, Radix UI) with custom hooks for state management, TanStack Query for caching, and Row Level Security for data protection.

---

## Technical Decisions

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| **Custom Hooks for State Management** | Simpler for single-domain feature, easier to test, less boilerplate than global state | Zustand (rejected - overkill for single feature), Redux (rejected - too heavy), Jotai (rejected - already using for app state) |
| **TanStack Query for Server State** | Built-in caching, automatic refetching, optimistic updates, loading/error states handled | SWR (rejected - less powerful), manual fetch (rejected - reinventing the wheel), Apollo (rejected - GraphQL overkill) |
| **React Hook Form + Zod** | Type-safe validation, minimal re-renders, great DX, Zod provides runtime type checking | Formik (rejected - more boilerplate), Unform (rejected - less popular), no validation (rejected - security risk) |
| **Radix UI Primitives** | Already in project, accessible, unstyled, composable, WCAG compliant | Material-UI (rejected - heavy, opinionated), Chakra (rejected - styling conflicts), Headless UI (rejected - already using Radix) |
| **Supabase Storage for Avatars** | Integrated with existing Supabase setup, CDN delivery, RLS policies, free tier generous | Cloudinary (rejected - extra cost, complexity), AWS S3 (rejected - overkill), base64 in DB (rejected - performance) |
| **Row Level Security (RLS)** | Data security at database level, prevents IDOR attacks, required for compliance | Application-level checks (rejected - error-prone), middleware (rejected - can be bypassed), no auth (rejected - insecure) |
| **Server Actions (Not Using)** | Next.js specific, not available in Vite setup, adds complexity | API routes (rejected - creates separation), direct Supabase (chosen - simpler), edge functions (rejected - overkill) |
| **Image Compression on Client** | Faster upload, less bandwidth, better UX, reduces storage costs | Server-side compression (rejected - slower upload), no compression (rejected - storage waste), external service (rejected - cost/latency) |
| **Domain-Driven Structure** | Follows existing codebase patterns, clear boundaries, easier to maintain | Feature-based (rejected - less clear), layered (rejected - over-engineering), flat (rejected - unscalable) |
| **Lazy Loading for Routes** | Faster initial load, code splitting by route, better performance | Eager loading (rejected - slower initial load), granular splitting (rejected - complexity), no splitting (rejected - poor UX) |
| **Privacy: Private by Default** | GDPR compliance, user trust, minimal exposure, safe start | Public by default (rejected - privacy risk), user choice (rejected - confusing), hybrid (rejected - complex) |
| **Account Deletion with Grace Period** | GDPR/CCPA requirement, prevents accidental deletion, user safety | Immediate deletion (rejected - dangerous), soft delete only (rejected - non-compliant), admin approval (rejected - slow) |
| **TypeScript Strict Mode** | Type safety, better DX, fewer runtime errors, already enforced | JavaScript (rejected - unsafe), loose mode (rejected - loses benefits), any types (rejected - defeats purpose) |

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Profile    │  │   Profile    │  │   Avatar     │         │
│  │   Display    │  │     Edit     │  │   Upload     │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
│         └──────────────────┼──────────────────┘                  │
│                            │                                     │
│                   ┌────────▼────────┐                            │
│                   │ useUserProfile  │                            │
│                   │  (Custom Hook)  │                            │
│                   └────────┬────────┘                            │
│                            │                                     │
│                   ┌────────▼────────┐                            │
│                   │  TanStack       │                            │
│                   │  Query Cache    │                            │
│                   └────────┬────────┘                            │
└────────────────────────────┼─────────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────────┐
│                  Service Layer │                                 │
├────────────────────────────┼─────────────────────────────────────┤
│                             │                                     │
│                   ┌────────▼────────┐                            │
│                   │  profileService │                            │
│                   │  (API Client)   │                            │
│                   └────────┬────────┘                            │
└────────────────────────────┼─────────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────────┐
│                  Data Layer │                                    │
├────────────────────────────┼─────────────────────────────────────┤
│                             │                                     │
│         ┌───────────────────┼───────────────────┐                │
│         │                                       │                │
│  ┌──────▼──────┐                    ┌──────────▼──────┐          │
│  │  Supabase   │                    │  Supabase       │          │
│  │  Database   │                    │  Storage        │          │
│  │  (profiles) │                    │  (avatars)      │          │
│  └─────────────┘                    └─────────────────┘          │
│         │                                       │                │
│  ┌──────▼──────┐                    ┌──────────▼──────┐          │
│  │  Row Level  │                    │  RLS Policies   │          │
│  │  Security   │                    │  (Auth)         │          │
│  └─────────────┘                    └─────────────────┘          │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────────┐
│              Authentication Layer │                               │
├────────────────────────────┼─────────────────────────────────────┤
│                             │                                     │
│                   ┌────────▼────────┐                            │
│                   │  Clerk Auth     │                            │
│                   │  (JWT Tokens)   │                            │
│                   └─────────────────┘                            │
└───────────────────────────────────────────────────────────────────┘
```

### Domain Structure

```
src/domains/user/
├── profile/
│   ├── 1-display/                    # Profile viewing
│   │   ├── ui/
│   │   │   ├── components/
│   │   │   │   ├── ProfileHeader.tsx
│   │   │   │   ├── ProfileInfo.tsx
│   │   │   │   ├── SocialLinks.tsx
│   │   │   │   └── TokenBalance.tsx
│   │   │   └── pages/
│   │   │       └── ProfileDisplayPage.tsx
│   │   └── index.ts
│   │
│   ├── 2-edit/                        # Profile editing
│   │   ├── ui/
│   │   │   ├── components/
│   │   │   │   ├── ProfileEditForm.tsx
│   │   │   │   ├── BioField.tsx
│   │   │   │   ├── LocationField.tsx
│   │   │   │   ├── TimezoneSelector.tsx
│   │   │   │   └── SocialLinksEditor.tsx
│   │   │   └── pages/
│   │   │       └── ProfileEditPage.tsx
│   │   └── index.ts
│   │
│   ├── 3-avatar/                      # Avatar management
│   │   ├── ui/
│   │   │   ├── components/
│   │   │   │   ├── AvatarUpload.tsx
│   │   │   │   ├── AvatarPreview.tsx
│   │   │   │   └── AvatarCropper.tsx (Phase 2)
│   │   │   └── pages/
│   │   │       └── AvatarSettingsPage.tsx
│   │   └── index.ts
│   │
│   ├── 4-privacy/                     # Privacy settings
│   │   ├── ui/
│   │   │   ├── components/
│   │   │   │   ├── PrivacySettings.tsx
│   │   │   │   ├── VisibilityToggles.tsx
│   │   │   │   └── DataExportButton.tsx
│   │   │   └── pages/
│   │   │       └── PrivacySettingsPage.tsx
│   │   └── index.ts
│   │
│   ├── 5-account/                     # Account management
│   │   ├── ui/
│   │   │   ├── components/
│   │   │   │   ├── AccountManagement.tsx
│   │   │   │   ├── DeleteAccountDialog.tsx
│   │   │   │   └── DeletionWarning.tsx
│   │   │   └── pages/
│   │   │       └── AccountSettingsPage.tsx
│   │   └── index.ts
│   │
│   ├── _shared/                       # Shared resources
│   │   ├── hooks/
│   │   │   ├── useUserProfile.ts
│   │   │   ├── useProfileUpdate.ts
│   │   │   └── useAvatarUpload.ts
│   │   ├── services/
│   │   │   ├── profileService.ts
│   │   │   ├── avatarService.ts
│   │   │   └── privacyService.ts
│   │   ├── types/
│   │   │   ├── profile.types.ts
│   │   │   ├── avatar.types.ts
│   │   │   └── privacy.types.ts
│   │   ├── utils/
│   │   │   ├── validators.ts
│   │   │   ├── formatters.ts
│   │   │   └── constants.ts
│   │   └── ui/
│   │       └── components/
│   │           ├── ProfileLayout.tsx
│   │           └── ProfileCard.tsx
│   │
│   └── index.ts                       # Domain exports
```

### Data Flow

#### 1. Profile Viewing Flow

```
User navigates to /profile
       ↓
ProfileDisplayPage mounts
       ↓
useUserProfile hook called
       ↓
TanStack Query checks cache
       ↓ (cache miss)
profileService.getProfile()
       ↓
Supabase: SELECT * FROM profiles WHERE id = [user_id]
       ↓ (RLS policy applied)
Data returned from Supabase
       ↓
TanStack Query caches data
       ↓
ProfileDisplayPage renders with data
```

#### 2. Profile Editing Flow

```
User clicks "Edit Profile"
       ↓
ProfileEditPage mounts (edit mode)
       ↓
useProfileUpdate hook initializes
       ↓
Form populated with current profile data
       ↓
User edits fields (real-time validation)
       ↓
User clicks "Save"
       ↓
React Hook Form validates (Zod schema)
       ↓ (valid)
profileService.updateProfile(data)
       ↓
Supabase: UPDATE profiles SET ... WHERE id = [user_id]
       ↓ (RLS policy applied)
TanStack Query updates cache (optimistic)
       ↓
Success notification shown
       ↓
User redirected to /profile
```

#### 3. Avatar Upload Flow

```
User selects image file
       ↓
Client-side validation (type, size)
       ↓
Image compression (browser canvas)
       ↓
Preview shown to user
       ↓
User confirms upload
       ↓
useAvatarUpload hook called
       ↓
Supabase Storage: upload to 'avatars' bucket
       ↓ (RLS policy applied)
Public URL generated
       ↓
profileService.updateAvatar(url)
       ↓
Supabase: UPDATE profiles SET avatar_url = ... WHERE id = [user_id]
       ↓
TanStack Query invalidates profile cache
       ↓
Avatar updated in UI
```

#### 4. Account Deletion Flow

```
User clicks "Delete Account"
       ↓
Confirmation dialog shown
       ↓ (user confirms)
Second confirmation (consequences warning)
       ↓ (user confirms)
profileService.requestAccountDeletion()
       ↓
Supabase: UPDATE profiles SET deletion_scheduled = [24h from now]
       ↓
Clerk: schedule user deletion
       ↓
Email sent to user
       ↓
UI shows "Deletion scheduled" message
       ↓
24 hours later (background job)
       ↓
Supabase: DELETE FROM profiles WHERE id = [user_id]
       ↓
Clerk: DELETE user
       ↓
All user data removed
```

---

## Component Breakdown

### 1. ProfileDisplay Component

**Purpose**: Read-only view of user profile information

**Props**:
```typescript
interface ProfileDisplayProps {
  userId?: string;  // undefined = current user
  editable?: boolean;  // show edit button
}
```

**State**:
- `profile: Profile | null` - Profile data
- `loading: boolean` - Loading state
- `error: Error | null` - Error state

**Child Components**:
- `ProfileHeader` - Avatar, name, email
- `ProfileInfo` - Bio, location, timezone
- `SocialLinks` - Social media links
- `TokenBalance` - SISO token balance

**Features**:
- Responsive layout (mobile/tablet/desktop)
- Loading skeleton
- Error boundary
- Empty state (no profile)
- Edit button (if editable)

**Security**:
- RLS ensures user can only view their own profile
- No PII in HTML/source
- Sanitized output (XSS prevention)

---

### 2. ProfileEdit Component

**Purpose**: Form for editing profile information

**Props**:
```typescript
interface ProfileEditProps {
  profile: Profile;
  onSave: (data: ProfileUpdate) => Promise<void>;
  onCancel: () => void;
}
```

**State**:
- `formData: ProfileUpdate` - Form data
- `errors: FormErrors` - Validation errors
- `saving: boolean` - Saving state
- `dirty: boolean` - Form has changes

**Child Components**:
- `BioField` - Textarea with character counter
- `LocationField` - Text input
- `TimezoneSelector` - Select dropdown
- `SocialLinksEditor` - Social link inputs

**Features**:
- Real-time validation (Zod)
- Character counter (bio: max 500)
- URL validation (social links)
- Dirty state tracking
- Cancel confirmation (if dirty)
- Save button (disabled if invalid or not dirty)
- Auto-save draft (localStorage)

**Security**:
- Input validation (Zod schemas)
- XSS prevention (sanitize input)
- CSRF protection (Clerk tokens)
- Rate limiting (10 updates/minute)

---

### 3. AvatarUpload Component

**Purpose**: Upload and manage avatar images

**Props**:
```typescript
interface AvatarUploadProps {
  currentAvatar: string | null;
  onUpload: (file: File) => Promise<string>;
  onDelete: () => Promise<void>;
}
```

**State**:
- `uploading: boolean` - Upload progress
- `preview: string | null` - Image preview
- `error: string | null` - Error message
- `dragActive: boolean` - Drag & drop state

**Features**:
- Drag & drop upload
- Click to browse
- Image preview
- Client-side compression
- Progress indicator
- Delete button
- Default avatar fallback

**Validation**:
- File type: JPG, PNG, WebP
- File size: < 5MB raw, < 100KB compressed
- Image dimensions: 1:1 aspect ratio (recommended)

**Security**:
- File type validation (MIME + magic bytes)
- File size limits
- Virus scanning (Supabase)
- RLS on storage bucket
- Public URL signing

---

### 4. PrivacySettings Component

**Purpose**: Manage profile visibility and data export

**Props**:
```typescript
interface PrivacySettingsProps {
  profile: Profile;
  onUpdate: (settings: PrivacySettings) => Promise<void>;
}
```

**State**:
- `settings: PrivacySettings` - Privacy settings
- `updating: boolean` - Update state
- `exporting: boolean` - Export state

**Child Components**:
- `VisibilityToggles` - Toggle switches
- `DataExportButton` - Export button

**Features**:
- Profile visibility toggle (public/private)
- Email visibility toggle
- Bio visibility toggle
- Location visibility toggle
- Social links visibility toggle
- Data export button (JSON)
- Export includes all profile data
- Timestamp on export

**Security**:
- RLS ensures user can only edit their own settings
- GDPR compliance (right to data portability)
- No sensitive data in export
- Signed export URL

---

### 5. AccountManagement Component

**Purpose**: Manage account deletion

**Props**:
```typescript
interface AccountManagementProps {
  onDeleteAccount: () => Promise<void>;
}
```

**State**:
- `confirming: boolean` - Confirmation dialog
- `deleting: boolean` - Deletion in progress
- `deletionScheduled: boolean` - Deletion pending

**Child Components**:
- `DeleteAccountDialog` - Confirmation dialog
- `DeletionWarning` - Consequences warning

**Features**:
- Delete account button
- First confirmation dialog
- Second confirmation (consequences warning)
- Grace period (24 hours)
- Cancel deletion option
- Deletion confirmation email
- Clear explanation of consequences

**Security**:
- Double confirmation required
- Grace period (accidental deletion)
- Email confirmation required
- RLS ensures user can only delete their own account
- Complete data removal (GDPR/CCPA)
- Audit log

---

## Data Flow

### API Endpoints Needed

While we're using direct Supabase client calls (not REST API), here's the logical endpoint mapping:

| Operation | Supabase Query | RLS Policy |
|-----------|----------------|------------|
| Get Profile | `SELECT * FROM profiles WHERE id = $1` | Users can view own profile |
| Update Profile | `UPDATE profiles SET ... WHERE id = $1` | Users can update own profile |
| Upload Avatar | Upload to `avatars` bucket | Users can upload to own folder |
| Delete Avatar | Delete from `avatars` bucket | Users can delete own files |
| Export Data | `SELECT * FROM profiles WHERE id = $1` | Users can export own data |
| Delete Account | `DELETE FROM profiles WHERE id = $1` | Users can delete own profile |

### Database Queries

#### Profile Query
```sql
-- Get user profile
SELECT
  id,
  name,
  bio,
  avatar_url,
  location,
  timezone,
  twitter_url,
  linkedin_url,
  youtube_url,
  instagram_url,
  sisos_tokens,
  created_at,
  updated_at
FROM profiles
WHERE id = $1;
```

#### Profile Update
```sql
-- Update profile
UPDATE profiles
SET
  bio = $2,
  location = $3,
  timezone = $4,
  twitter_url = $5,
  linkedin_url = $6,
  youtube_url = $7,
  instagram_url = $8,
  updated_at = NOW()
WHERE id = $1
RETURNING *;
```

#### Avatar Update
```sql
-- Update avatar URL
UPDATE profiles
SET
  avatar_url = $2,
  updated_at = NOW()
WHERE id = $1
RETURNING *;
```

#### Account Deletion (Soft Delete)
```sql
-- Schedule account deletion
UPDATE profiles
SET
  deletion_scheduled = NOW() + INTERVAL '24 hours',
  updated_at = NOW()
WHERE id = $1
RETURNING *;
```

#### Account Deletion (Hard Delete - after 24h)
```sql
-- Permanently delete account
DELETE FROM profiles
WHERE id = $1
  AND deletion_scheduled <= NOW();

-- Also delete related data
DELETE FROM tasks WHERE user_id = $1;
DELETE FROM user_preferences WHERE user_id = $1;
-- ... other user data
```

### RLS Policies

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid()::text = id);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid()::text = id);

-- Users can insert own profile (on signup)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid()::text = id);

-- Users can delete own profile
CREATE POLICY "Users can delete own profile"
ON profiles FOR DELETE
USING (auth.uid()::text = id);

-- Avatar storage policies
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own avatar"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## Tasks Preview

### Phase 1: Foundation & Database Setup (Days 1-2)

**Task 1.1**: Validate database schema
- Check `profiles` table exists in Supabase
- Verify all required columns present
- Create missing columns if needed
- **Dependencies**: None
- **Parallel**: No (must be first)
- **Estimated**: 2 hours

**Task 1.2**: Configure RLS policies
- Enable RLS on `profiles` table
- Create policies for SELECT, INSERT, UPDATE, DELETE
- Test policies with different users
- **Dependencies**: Task 1.1
- **Parallel**: No
- **Estimated**: 3 hours

**Task 1.3**: Set up Supabase Storage for avatars
- Create `avatars` bucket in Supabase Storage
- Configure RLS policies for bucket
- Set up public folder structure
- Test upload/download
- **Dependencies**: Task 1.2
- **Parallel**: No
- **Estimated**: 2 hours

**Task 1.4**: Create TypeScript types
- Define `Profile` type
- Define `ProfileUpdate` type
- Define `PrivacySettings` type
- Define validation schemas with Zod
- **Dependencies**: Task 1.1
- **Parallel**: Yes (with Task 1.2, 1.3)
- **Estimated**: 2 hours

---

### Phase 2: Service Layer (Days 3-4)

**Task 2.1**: Implement profile service
- Create `profileService.ts`
- Implement `getProfile()` method
- Implement `updateProfile()` method
- Implement `deleteProfile()` method
- Add error handling
- **Dependencies**: Task 1.4
- **Parallel**: No
- **Estimated**: 3 hours

**Task 2.2**: Implement avatar service
- Create `avatarService.ts`
- Implement `uploadAvatar()` method
- Implement `deleteAvatar()` method
- Implement `compressImage()` utility
- Add progress tracking
- **Dependencies**: Task 1.3, Task 1.4
- **Parallel**: Yes (with Task 2.1)
- **Estimated**: 4 hours

**Task 2.3**: Implement privacy service
- Create `privacyService.ts`
- Implement `updatePrivacySettings()` method
- Implement `exportUserData()` method
- Implement JSON export formatting
- **Dependencies**: Task 1.4
- **Parallel**: Yes (with Task 2.1, 2.2)
- **Estimated**: 2 hours

**Task 2.4**: Create custom hooks
- Create `useUserProfile` hook
- Create `useProfileUpdate` hook
- Create `useAvatarUpload` hook
- Integrate TanStack Query
- **Dependencies**: Task 2.1, Task 2.2, Task 2.3
- **Parallel**: No (depends on all services)
- **Estimated**: 4 hours

---

### Phase 3: UI Components (Days 5-9)

**Task 3.1**: Build ProfileDisplay component
- Create `ProfileHeader` component
- Create `ProfileInfo` component
- Create `SocialLinks` component
- Create `TokenBalance` component
- Assemble `ProfileDisplay` page
- **Dependencies**: Task 2.4
- **Parallel**: No
- **Estimated**: 4 hours

**Task 3.2**: Build ProfileEdit component
- Create `BioField` component
- Create `LocationField` component
- Create `TimezoneSelector` component
- Create `SocialLinksEditor` component
- Assemble `ProfileEdit` form with React Hook Form
- **Dependencies**: Task 2.4
- **Parallel**: Yes (with Task 3.1)
- **Estimated**: 5 hours

**Task 3.3**: Build AvatarUpload component
- Create drag & drop zone
- Create image preview
- Create progress indicator
- Integrate compression
- Add delete functionality
- **Dependencies**: Task 2.4
- **Parallel**: Yes (with Task 3.1, 3.2)
- **Estimated**: 4 hours

**Task 3.4**: Build PrivacySettings component
- Create `VisibilityToggles` component
- Create `DataExportButton` component
- Implement export functionality
- Assemble `PrivacySettings` page
- **Dependencies**: Task 2.4
- **Parallel**: Yes (with Task 3.1, 3.2, 3.3)
- **Estimated**: 3 hours

**Task 3.5**: Build AccountManagement component
- Create `DeleteAccountDialog` component
- Create `DeletionWarning` component
- Implement deletion flow
- Add confirmation emails
- Assemble `AccountManagement` page
- **Dependencies**: Task 2.4
- **Parallel**: Yes (with Task 3.1, 3.2, 3.3, 3.4)
- **Estimated**: 4 hours

---

### Phase 4: Integration & Routing (Days 10-11)

**Task 4.1**: Create profile routes
- Add `/profile` route
- Add `/profile/edit` route
- Add `/profile/avatar` route
- Add `/profile/privacy` route
- Add `/profile/account` route
- **Dependencies**: Task 3.1, 3.2, 3.3, 3.4, 3.5
- **Parallel**: No
- **Estimated**: 2 hours

**Task 4.2**: Create ProfileLayout
- Create layout wrapper
- Add navigation tabs
- Add breadcrumbs
- Add back button
- **Dependencies**: Task 4.1
- **Parallel**: No
- **Estimated**: 2 hours

**Task 4.3**: Add navigation links
- Add "Profile" to main navigation
- Add mobile navigation
- Add user dropdown link
- **Dependencies**: Task 4.1
- **Parallel**: Yes (with Task 4.2)
- **Estimated**: 1 hour

---

### Phase 5: Security & Validation (Days 12-13)

**Task 5.1**: Implement security measures
- Add XSS prevention
- Add CSRF protection
- Add rate limiting
- Sanitize all inputs
- **Dependencies**: Task 4.1, 4.2, 4.3
- **Parallel**: No
- **Estimated**: 4 hours

**Task 5.2**: Implement validation
- Add Zod schemas for all forms
- Add client-side validation
- Add server-side validation
- Add error messages
- **Dependencies**: Task 4.1, 4.2, 4.3
- **Parallel**: Yes (with Task 5.1)
- **Estimated**: 3 hours

**Task 5.3**: Implement privacy controls
- Add visibility toggles
- Add default privacy settings
- Add data export
- Add account deletion
- **Dependencies**: Task 4.1, 4.2, 4.3
- **Parallel**: Yes (with Task 5.1, 5.2)
- **Estimated**: 3 hours

---

### Phase 6: Testing (Days 14-17)

**Task 6.1**: Unit tests
- Test profile service
- Test avatar service
- Test privacy service
- Test custom hooks
- **Dependencies**: Task 5.1, 5.2, 5.3
- **Parallel**: Yes (with Task 6.2)
- **Estimated**: 6 hours

**Task 6.2**: Component tests
- Test ProfileDisplay
- Test ProfileEdit
- Test AvatarUpload
- Test PrivacySettings
- Test AccountManagement
- **Dependencies**: Task 5.1, 5.2, 5.3
- **Parallel**: Yes (with Task 6.1)
- **Estimated**: 6 hours

**Task 6.3**: E2E tests
- Test profile viewing
- Test profile editing
- Test avatar upload
- Test privacy settings
- Test account deletion
- **Dependencies**: Task 5.1, 5.2, 5.3
- **Parallel**: No (requires all features)
- **Estimated**: 6 hours

**Task 6.4**: Security audit
- Test RLS policies
- Test XSS prevention
- Test CSRF protection
- Test rate limiting
- Test input validation
- **Dependencies**: Task 6.1, 6.2, 6.3
- **Parallel**: No (needs all tests passing)
- **Estimated**: 4 hours

---

### Phase 7: Performance & Accessibility (Days 18-19)

**Task 7.1**: Performance optimization
- Optimize images
- Lazy load components
- Optimize queries
- Add caching
- **Dependencies**: Task 6.4
- **Parallel**: Yes (with Task 7.2)
- **Estimated**: 4 hours

**Task 7.2**: Accessibility audit
- Add ARIA labels
- Test keyboard navigation
- Test screen reader
- Check color contrast
- **Dependencies**: Task 6.4
- **Parallel**: Yes (with Task 7.1)
- **Estimated**: 4 hours

---

### Phase 8: Documentation & Deployment (Days 20-21)

**Task 8.1**: Write documentation
- Document components
- Document hooks
- Document services
- Document API
- **Dependencies**: Task 7.1, 7.2
- **Parallel**: Yes (with Task 8.2)
- **Estimated**: 3 hours

**Task 8.2**: Deploy to staging
- Deploy to staging environment
- Run smoke tests
- Test with real users
- **Dependencies**: Task 7.1, 7.2
- **Parallel**: Yes (with Task 8.1)
- **Estimated**: 2 hours

**Task 8.3**: Deploy to production
- Deploy to production
- Monitor errors
- Monitor performance
- **Dependencies**: Task 8.1, 8.2
- **Parallel**: No
- **Estimated**: 2 hours

---

## Stats

### Task Breakdown
- **Total Tasks**: 29 tasks
- **Parallel Tasks**: 15 tasks (can run concurrently)
- **Sequential Tasks**: 14 tasks (must wait for dependencies)
- **Critical Path**: 21 days (Task 1.1 → 1.2 → 1.3 → 2.1 → 2.4 → 3.1 → 4.1 → 5.1 → 6.4 → 7.1 → 8.3)

### Estimated Effort
- **Foundation & Database**: 9 hours (Days 1-2)
- **Service Layer**: 13 hours (Days 3-4)
- **UI Components**: 20 hours (Days 5-9)
- **Integration & Routing**: 5 hours (Days 10-11)
- **Security & Validation**: 10 hours (Days 12-13)
- **Testing**: 22 hours (Days 14-17)
- **Performance & Accessibility**: 8 hours (Days 18-19)
- **Documentation & Deployment**: 7 hours (Days 20-21)
- **Total**: ~94 hours (12 days of focused work)

### Team Size Impact
- **1 Developer**: 21 days (4.2 weeks)
- **2 Developers**: 12 days (2.4 weeks) - optimal parallelization
- **3 Developers**: 10 days (2 weeks) - diminishing returns

### Risk Assessment
- **Technical Risk**: Low (using proven tech stack)
- **Security Risk**: Low (RLS + Clerk + validation)
- **Performance Risk**: Low (lazy loading + caching)
- **Compliance Risk**: Low (GDPR/CCPA built in)
- **Integration Risk**: Low (follows existing patterns)

---

## Next Steps

### Immediate Actions
1. Review this epic with the team
2. Validate database schema (Task 1.1)
3. Set up Supabase Storage (Task 1.3)
4. Start with service layer (Task 2.1)

### Dependencies to Unblock
1. Confirm `profiles` table exists in Supabase
2. Get Supabase Storage bucket access
3. Verify Clerk authentication is working
4. Ensure Radix UI components are available

### Questions for Review
1. Should we add avatar cropping in MVP? (Currently Phase 2)
2. Should profile be public or private by default? (Recommend private)
3. Should we use Zustand or custom hooks? (Recommend custom hooks)
4. Should we implement 2FA now? (Recommend Phase 2)
5. What's the timeline for Phase 2 features?

---

**Epic Status**: Ready for Development
**Confidence Level**: High (85%)
**Recommended Priority**: High (foundational feature)
**Next Review**: After Task 1.1 completion (Day 2)
