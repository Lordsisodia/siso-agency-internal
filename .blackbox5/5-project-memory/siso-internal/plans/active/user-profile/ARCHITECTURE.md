# User Profile Epic - Technical Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                          │
│                    (React Components + Pages)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Profile    │  │   Profile    │  │   Avatar     │            │
│  │   Display    │  │     Edit     │  │   Upload     │            │
│  │              │  │              │  │              │            │
│  │  • Header    │  │  • Bio       │  │  • Dropzone  │            │
│  │  • Info      │  │  • Location  │  │  • Preview   │            │
│  │  • Social    │  │  • Timezone  │  │  • Progress  │            │
│  │  • Tokens    │  │  • Social    │  │  • Delete    │            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
│         │                  │                  │                    │
│         └──────────────────┼──────────────────┘                    │
│                            │                                       │
│                   ┌────────▼────────┐                              │
│                   │  Privacy        │  ┌──────────────┐          │
│                   │  Settings       │  │   Account    │          │
│                   │                 │  │  Management  │          │
│                   │  • Toggles      │  │              │          │
│                   │  • Export       │  │  • Delete    │          │
│                   └────────┬────────┘  │  • Warning   │          │
│                            │            └──────┬───────┘          │
│                            │                   │                  │
│                            └─────────┬─────────┘                  │
│                                      │                            │
└──────────────────────────────────────┼────────────────────────────┘
                                       │
┌──────────────────────────────────────┼────────────────────────────┐
│                          HOOKS LAYER │                              │
│                      (Custom Hooks + State)                        │
├──────────────────────────────────────┼────────────────────────────┤
│                                      │                            │
│                             ┌────────▼────────┐                    │
│                             │ useUserProfile  │                    │
│                             │                 │                    │
│                             │ • profile       │                    │
│                             │ • loading       │                    │
│                             │ • error         │                    │
│                             │ • refetch()     │                    │
│                             └────────┬────────┘                    │
│                                      │                            │
│                             ┌────────▼────────┐                    │
│                             │useProfileUpdate │                    │
│                             │                 │                    │
│                             │ • update()      │                    │
│                             │ • saving        │                    │
│                             │ • errors        │                    │
│                             └────────┬────────┘                    │
│                                      │                            │
│                             ┌────────▼────────┐                    │
│                             │useAvatarUpload  │                    │
│                             │                 │                    │
│                             │ • upload()      │                    │
│                             │ • progress      │                    │
│                             │ • preview       │                    │
│                             └────────┬────────┘                    │
│                                      │                            │
└──────────────────────────────────────┼────────────────────────────┘
                                       │
┌──────────────────────────────────────┼────────────────────────────┐
│                         QUERY LAYER │                               │
│                    (TanStack Query + Cache)                        │
├──────────────────────────────────────┼────────────────────────────┤
│                                      │                            │
│                             ┌────────▼────────┐                    │
│                             │ Query Cache     │                    │
│                             │                 │                    │
│                             │ • [profile]     │                    │
│                             │ • [avatar]      │                    │
│                             │ • [privacy]     │                    │
│                             │                 │                    │
│                             │ • staleTime     │                    │
│                             │ • cacheTime     │                    │
│                             └────────┬────────┘                    │
│                                      │                            │
└──────────────────────────────────────┼────────────────────────────┘
                                       │
┌──────────────────────────────────────┼────────────────────────────┐
│                        SERVICE LAYER │                               │
│                     (API + Utilities)                               │
├──────────────────────────────────────┼────────────────────────────┤
│                                      │                            │
│    ┌─────────────────┐   ┌──────────▼────────┐                    │
│    │ profileService  │   │  avatarService    │                    │
│    │                 │   │                   │                    │
│    │ • getProfile()  │   │ • uploadAvatar()  │                    │
│    │ • updateProfile()│  │ • deleteAvatar()  │                    │
│    │ • deleteProfile()│  │ • compressImage() │                    │
│    └────────┬────────┘   └──────────┬────────┘                    │
│             │                       │                             │
│             └───────────┬───────────┘                             │
│                         │                                        │
│                ┌────────▼────────┐                                │
│                │ privacyService  │                                │
│                │                 │                                │
│                │ • updateSettings()│                               │
│                │ • exportData()   │                                │
│                └────────┬────────┘                                │
│                         │                                        │
└─────────────────────────┼────────────────────────────────────────┘
                          │
┌─────────────────────────┼────────────────────────────────────────┐
│                    DATA LAYER │                                    │
│                (Supabase + Storage)                                │
├─────────────────────────┼────────────────────────────────────────┤
│                          │                                        │
│         ┌────────────────┼────────────────┐                       │
│         │                                 │                       │
│  ┌──────▼──────┐                  ┌───────▼───────┐               │
│  │  Supabase   │                  │  Supabase     │               │
│  │  Database   │                  │  Storage      │               │
│  │             │                  │               │               │
│  │  • profiles │                  │  • avatars/   │               │
│  │  • users    │                  │    {user_id}/ │               │
│  │             │                  │               │               │
│  │  ┌─────────┐│                  │  ┌───────────┐│               │
│  │  │   RLS   ││                  │  │    RLS    ││               │
│  │  │ Policies││                  │  │  Policies  ││               │
│  │  └─────────┘│                  │  └───────────┘│               │
│  └─────────────┘                  └───────────────┘               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────┼────────────────────────────────────────┐
│              AUTHENTICATION LAYER │                                │
├─────────────────────────┼────────────────────────────────────────┤
│                          │                                        │
│                 ┌────────▼────────┐                               │
│                 │   Clerk Auth    │                               │
│                 │                 │                               │
│                 │  • JWT Token    │                               │
│                 │  • Session Mgmt │                               │
│                 │  • User Profile │                               │
│                 └────────┬────────┘                               │
│                          │                                        │
│                 ┌────────▼────────┐                               │
│                 │ ClerkIntegration│                               │
│                 │                 │                               │
│                 │ • useAuth()     │                               │
│                 │ • getToken()    │                               │
│                 │ • getUserId()   │                               │
│                 └─────────────────┘                               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App.tsx
│
└─ Routes
   │
   └─ /profile (ClerkAuthGuard)
      │
      └─ ProfileLayout
         │
         ├─ ProfileNavigation (tabs)
         │  ├─ Display
         │  ├─ Edit
         │  ├─ Avatar
         │  ├─ Privacy
         │  └─ Account
         │
         └─ Outlet
            │
            ├─ ProfileDisplayPage
            │  └─ ProfileDisplay
            │     ├─ ProfileHeader
            │     │  ├─ Avatar (Radix UI)
            │     │  ├─ Name
            │     │  └─ Email
            │     ├─ ProfileInfo
            │     │  ├─ Bio
            │     │  ├─ Location
            │     │  └─ Timezone
            │     ├─ SocialLinks
            │     │  ├─ Twitter
            │     │  ├─ LinkedIn
            │     │  ├─ YouTube
            │     │  └─ Instagram
            │     └─ TokenBalance
            │
            ├─ ProfileEditPage
            │  └─ ProfileEdit (React Hook Form)
            │     ├─ BioField (textarea + counter)
            │     ├─ LocationField (input)
            │     ├─ TimezoneSelector (select)
            │     ├─ SocialLinksEditor
            │     │  ├─ TwitterInput
            │     │  ├─ LinkedInInput
            │     │  ├─ YouTubeInput
            │     │  └─ InstagramInput
            │     └─ FormActions
            │        ├─ SaveButton
            │        └─ CancelButton
            │
            ├─ AvatarSettingsPage
            │  └─ AvatarUpload
            │     ├─ Dropzone (react-dropzone)
            │     ├─ AvatarPreview
            │     ├─ ProgressBar
            │     └─ DeleteButton
            │
            ├─ PrivacySettingsPage
            │  └─ PrivacySettings
            │     ├─ VisibilityToggles
            │     │  ├─ ProfileVisibility (switch)
            │     │  ├─ EmailVisibility (switch)
            │     │  ├─ BioVisibility (switch)
            │     │  ├─ LocationVisibility (switch)
            │     │  └─ SocialVisibility (switch)
            │     └─ DataExportButton
            │
            └─ AccountSettingsPage
               └─ AccountManagement
                  ├─ DeleteAccountButton
                  └─ DeleteAccountDialog
                     ├─ DeletionWarning
                     ├─ ConfirmationCheckbox
                     └─ ConfirmButton
```

## Data Flow Diagrams

### 1. Profile Viewing Flow

```
User Action: Navigate to /profile
        ↓
┌───────────────────────────────────┐
│ React Router: Match /profile route │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ ClerkAuthGuard: Check auth status │
│  • If not authenticated           │
│    → Redirect to /auth            │
│  • If authenticated               │
│    → Continue to ProfileDisplay   │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ ProfileDisplayPage: Mount         │
│  • Call useUserProfile() hook     │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ useUserProfile Hook:              │
│  • Call TanStack Query            │
│  • Check cache for [profile] key  │
│  • If cache miss → fetch data     │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ TanStack Query:                   │
│  • Call profileService.getProfile()│
│  • Set loading: true              │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ profileService.getProfile():      │
│  • Get Clerk JWT token            │
│  • Call Supabase:                 │
│    SELECT * FROM profiles         │
│    WHERE id = user_id             │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ Supabase Database:                │
│  • Receive query                  │
│  • Check RLS policy:              │
│    "Users can view own profile"   │
│  • Verify: auth.uid() == id      │
│  • If valid → return data         │
│  • If invalid → return error      │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ TanStack Query:                   │
│  • Receive data                   │
│  • Cache with key: [profile]      │
│  • Set loading: false             │
│  • Set error: null                │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ useUserProfile Hook:              │
│  • Return { profile, loading,     │
│            error, refetch }       │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ ProfileDisplayPage: Render        │
│  • If loading → Show skeleton     │
│  • If error → Show error message  │
│  • If data → Render profile       │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ User sees profile information     │
└───────────────────────────────────┘
```

### 2. Profile Editing Flow

```
User Action: Click "Edit Profile"
        ↓
┌───────────────────────────────────┐
│ ProfileEditPage: Mount            │
│  • Call useProfileUpdate() hook   │
│  • Get current profile data       │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ React Hook Form:                  │
│  • Initialize form with profile   │
│  • Set default values             │
│  • Register validation schema     │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ User edits fields:                │
│  • Bio (textarea)                 │
│  • Location (input)               │
│  • Timezone (select)              │
│  • Social links (inputs)          │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ Real-time Validation (Zod):       │
│  • Bio: max 500 chars             │
│  • Location: required             │
│  • Timezone: required             │
│  • URLs: valid URL format         │
│  • Show errors if invalid         │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ User clicks "Save"                │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ React Hook Form:                  │
│  • Validate all fields            │
│  • If invalid → Show errors       │
│  • If valid → Call onSubmit       │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ useProfileUpdate Hook:            │
│  • Call profileService.update()   │
│  • Set saving: true               │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ TanStack Query (Optimistic):      │
│  • Update cache immediately       │
│  • Assume success                 │
│  • Rollback on error              │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ profileService.update():          │
│  • Get Clerk JWT token            │
│  • Call Supabase:                 │
│    UPDATE profiles                │
│    SET bio = $1,                  │
│        location = $2,             │
│        timezone = $3,             │
│        updated_at = NOW()         │
│    WHERE id = user_id             │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ Supabase Database:                │
│  • Check RLS policy:              │
│    "Users can update own profile" │
│  • Verify: auth.uid() == id      │
│  • Update record                  │
│  • Return updated data            │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ TanStack Query:                   │
│  • Invalidate cache               │
│  • Refetch from server            │
│  • Update with fresh data         │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ useProfileUpdate Hook:            │
│  • Set saving: false              │
│  • Show success toast             │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ Redirect to /profile              │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ User sees updated profile         │
└───────────────────────────────────┘
```

### 3. Avatar Upload Flow

```
User Action: Drag & drop image
        ↓
┌───────────────────────────────────┐
│ AvatarUpload Component:           │
│  • onDrop event triggered         │
│  • Get File object                │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ Client-side Validation:           │
│  • Check file type:               │
│    image/jpeg, image/png,         │
│    image/webp                     │
│  • Check file size: < 5MB         │
│  • If invalid → Show error        │
│  • If valid → Continue            │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ Image Compression:                │
│  • Create Image object            │
│  • Draw to canvas (max 400x400)   │
│  • Convert to blob (WebP)         │
│  • Target: < 100KB                │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ Show Preview:                     │
│  • Create object URL              │
│  • Display preview to user        │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ User clicks "Upload"              │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ useAvatarUpload Hook:             │
│  • Call avatarService.upload()    │
│  • Set uploading: true            │
│  • Set progress: 0                │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ avatarService.upload():           │
│  • Get Clerk JWT token            │
│  • Generate unique filename       │
│  • Call Supabase Storage:         │
│    upload(bucket, path, file)     │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ Supabase Storage:                 │
│  • Check RLS policy:              │
│    "Users can upload own avatar"  │
│  • Verify: auth.uid() matches    │
│    folder name                    │
│  • Upload file to:                │
│    avatars/{user_id}/{filename}  │
│  • Generate public URL            │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ Update Progress:                  │
│  • Track upload progress          │
│  • Update UI progress bar         │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ Upload Complete:                  │
│  • Receive public URL             │
│  • Delete old avatar (if exists)  │
│  • Call profileService.update()   │
│    to save new URL                │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ TanStack Query:                   │
│  • Invalidate [profile] cache     │
│  • Refetch from server            │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ useAvatarUpload Hook:             │
│  • Set uploading: false           │
│  • Show success toast             │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ User sees new avatar              │
└───────────────────────────────────┘
```

### 4. Account Deletion Flow

```
User Action: Click "Delete Account"
        ↓
┌───────────────────────────────────┐
│ AccountManagement Component:      │
│  • Show DeleteAccountDialog       │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ First Confirmation:               │
│  • "Are you sure?"                │
│  • Explain consequences:          │
│    - All data will be lost        │
│    - Cannot be undone             │
│  • User clicks "Confirm"          │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ Second Confirmation:              │
│  • "This is your last chance"     │
│  • Show grace period: 24 hours    │
│  • User types "DELETE" to confirm │
│  • User clicks "Confirm"          │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ profileService.requestDeletion(): │
│  • Get Clerk JWT token            │
│  • Call Supabase:                 │
│    UPDATE profiles                │
│    SET deletion_scheduled =       │
│        NOW() + INTERVAL '24 hours'│
│    WHERE id = user_id             │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ Supabase Database:                │
│  • Schedule deletion              │
│  • Return scheduled timestamp     │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ Clerk Backend API:                │
│  • Schedule user deletion         │
│  • Send confirmation email        │
│  • Include cancellation link      │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ Update UI:                        │
│  • Show "Deletion scheduled"      │
│  • Show countdown timer           │
│  • Provide "Cancel deletion"      │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ 24 Hours Later (Background Job):  │
│  • Supabase:                      │
│    DELETE FROM profiles           │
│    WHERE id = user_id             │
│      AND deletion_scheduled <=    │
│          NOW()                    │
│  • Delete related data:           │
│    - tasks                        │
│    - user_preferences             │
│    - etc.                         │
│  • Clerk:                         │
│    DELETE user                    │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ Account permanently deleted       │
└───────────────────────────────────┘
```

## Security Architecture

### Authentication Flow

```
┌───────────────────────────────────┐
│ User: Login via Clerk             │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ Clerk: Authenticate user          │
│  • Verify credentials             │
│  • Create session                 │
│  • Generate JWT token             │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ Clerk Client (Frontend):          │
│  • Store JWT token                │
│  • Provide useAuth() hook         │
│  • Expose getToken() method       │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ Supabase Client:                  │
│  • Initialize with JWT token      │
│  • Set auth header                │
│  • Make authenticated requests   │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ Supabase RLS:                     │
│  • Extract auth.uid() from JWT    │
│  • Compare with record owner      │
│  • Allow/deny based on policy     │
└───────────────────────────────────┘
```

### Authorization Matrix

| Operation | Auth Required | RLS Policy | Additional Checks |
|-----------|--------------|------------|-------------------|
| View Profile | Yes | `auth.uid() = id` | None |
| Edit Profile | Yes | `auth.uid() = id` | Rate limit |
| Upload Avatar | Yes | `auth.uid() = folder_name` | File validation |
| Delete Avatar | Yes | `auth.uid() = folder_name` | None |
| Update Privacy | Yes | `auth.uid() = id` | Rate limit |
| Export Data | Yes | `auth.uid() = id` | Rate limit |
| Delete Account | Yes | `auth.uid() = id` | Grace period |

### Data Protection Layers

```
┌─────────────────────────────────────┐
│      Layer 1: Frontend Validation   │
│  • Zod schemas                      │
│  • React Hook Form                  │
│  • Client-side checks               │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│      Layer 2: Transmission          │
│  • HTTPS (encrypted)                │
│  • CSRF tokens (Clerk)              │
│  • JWT authentication               │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│      Layer 3: Application           │
│  • Input sanitization               │
│  • Output escaping                  │
│  • Rate limiting                    │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│      Layer 4: Database (RLS)        │
│  • Row-level security              │
│  • User isolation                  │
│  • Policy enforcement               │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│      Layer 5: Storage               │
│  • Bucket policies                  │
│  • Signed URLs                      │
│  • File validation                  │
└─────────────────────────────────────┘
```

## Performance Optimization

### Caching Strategy

```
┌─────────────────────────────────────┐
│         TanStack Query Cache        │
│                                     │
│  Key: ["profile"]                   │
│  Data: { profile, avatar, ... }     │
│  staleTime: 5 minutes               │
│  cacheTime: 30 minutes              │
│                                     │
│  On mutation:                       │
│  • Invalidate cache                 │
│  • Refetch from server              │
│  • Update UI optimistically         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         Supabase CDN Cache          │
│                                     │
│  Avatar images:                     │
│  • Cached at edge                   │
│  • Cache-Control: 1 hour            │
│  • Transform: resize, compress      │
└─────────────────────────────────────┘
```

### Lazy Loading Strategy

```
App.tsx
│
├─ Immediate load:
│  └─ Auth, Home, Core pages
│
└─ Lazy load:
   ├─ ProfileDisplay (dynamic import)
   ├─ ProfileEdit (dynamic import)
   ├─ AvatarUpload (dynamic import)
   ├─ PrivacySettings (dynamic import)
   └─ AccountManagement (dynamic import)

Result:
• Initial bundle: ~200KB
• Profile chunks: ~50KB each
• Faster initial load
• Load on demand
```

---

**Architecture Status**: Complete and validated
**Tech Stack Confirmed**: Clerk + Supabase + Radix UI + TanStack Query
**Security Model**: RLS + JWT + Validation (defense in depth)
**Performance Target**: <2s page load, <1s interactions
