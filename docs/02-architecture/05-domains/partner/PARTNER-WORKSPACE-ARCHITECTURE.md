# Partner Workspace Architecture Plan

## Context
- **Date:** 2025-10-19
- **Initiative:** Internal partnerships workspace, mirroring the client workspace flow while focusing on partner tracking, referral performance, and documentation.
- **Goal:** Provide a single-screen experience that covers partner directory management, detailed partner workspaces, and supporting data services backed by Supabase.

## UX Surfaces
1. **Partners Directory Page**
   - Hero metrics (active partners, pipeline value, owed commission).
   - Filters for status, tier, owner, and region.
   - Airtable-style grid with inline edits, bulk actions, and quick row preview.
2. **Partner Workspace Page**
   - Gradient hero with partner status badge, tier pill, and roll-up metrics.
   - Tab set: `overview`, `tasks`, `referrals`, `docs`, `activity`.
   - Mobile bottom-nav parity (reuse `DailyBottomNav`).
3. **Partner Record Panel (future)**
   - Slide-over modal for quick edits from directory grid without full navigation.

## Domain Structure
```
src/ecosystem/internal/partners/
  components/
    overview/
    tasks/
    referrals/
    docs/
    activity/
    table/
    shared/
  hooks/
    usePartnersDirectory.ts
    usePartnerWorkspace.ts
  layout/
    PartnerWorkspaceLayout.tsx
  pages/
    PartnersDirectoryPage.tsx
    PartnerWorkspacePage.tsx
  services/
    partnerWorkspaceService.ts
    partnerDirectoryService.ts
  constants/
    partnerTabs.ts
    partnerStatus.ts
  types/
    partner.types.ts
  index.ts
```
- Components follow client patterns (`ClientsOverviewTab`, etc.) but remain partner-specific.
- Hooks expose `{ data, isLoading, error, mutations }` bundles for predictable consumption.
- Services encapsulate Supabase reads/writes and return domain DTOs.

## Data Model
- **Existing tables:** `partners`, `partner_referrals`, `partner_commissions`, `partner_training`, `partner_resources`.
- **New tables:**
  - `partner_tasks`
    - Tracks operational todos per partner, separate from client deep work tasks.
    - Columns: `id`, `partner_id`, `user_id`, `title`, `description`, `status`, `priority`, `due_date`, `completed_at`, `metadata`, timestamps.
  - `partner_documents`
    - Stores Notion URLs, storage assets, and labels.
    - Columns: `id`, `partner_id`, `owner_id`, `title`, `document_type`, `notion_url`, `storage_path`, `tags`, timestamps.
  - `partner_activity_log`
    - Timeline events (outreach, commission payment, document upload).
    - Columns: `id`, `partner_id`, `event_type`, `occurred_at`, `actor_id`, `payload`, timestamps.
- **Policies:**
  - Admins: full access on all partner tables.
  - Partner users: row-filtered access on their own records (future requirement once external partner portal is read/write).

## Services & Hooks
- `partnerDirectoryService`
  - `listPartners(filters)`, `bulkUpdateStatus(ids, status)`, `fetchSummaryMetrics()`.
- `partnerWorkspaceService`
  - `getPartnerById(id)`, `getPartnerTasks(id)`, `getPartnerReferrals(id)`, `getPartnerDocs(id)`, `getPartnerActivity(id)`, mutation helpers.
- Hooks memoize derived metrics (commission totals, referral win rate) and expose mutation callbacks for inline edits.

## UI Patterns to Reuse
- Header badge/metrics composition from `ClientWorkspaceLayout` with partner KPIs.
- Airtable grid styling from `AirtablePartnersTable.refactored.tsx` wrapped in partner-specific components.
- `Tabs` + `DailyBottomNav` combo for desktop/mobile parity.
- Editable fields via `EditableField` shared component when convenient.

## Implementation Phases
1. **Scaffold & Mock**
   - Generate directories, barrel exports, placeholder components/hook skeletons.
   - Use static mocks in hooks until services land.
2. **Directory Integration**
   - Wire `usePartnersDirectory` to Supabase selects, add filters and optimistic updates.
3. **Workspace Data Flow**
   - Implement services + hooks, connect tabs to real data, add optimistic task mutations.
4. **Database Migration**
   - Apply new tables + policies via `apply_migration` (name: `create_partner_tasks`, `create_partner_documents`, `create_partner_activity_log`).
   - Run advisors, regenerate Supabase types.
5. **QA & Extensions**
   - Add Vitest hooks unit coverage and Playwright smoke tests for both pages.
   - Prepare slide-over quick edit for future iteration.

## Open Questions
- Do partner users need in-app task management immediately, or is it internal-only for now?
- Which events should seed `partner_activity_log` (e.g., system-generated vs manual entries)?
- Should partner documents integrate Supabase Storage uploads or remain external links initially?

## 2025-10-19 Updates
- Partner directory now consumes shared Airtable table components with live Supabase data and aggregations.
- Workspace tabs execute real CRUD mutations for tasks and documents (with automatic activity logging in `partner_activity_log`).
- Admin navigation includes a dedicated “Partner Workspace” section with routes `/admin/partners` and `/admin/partners/:partnerId`.
- Supabase security tightened: RLS enabled for legacy tables surfaced by advisors, and new partner tables ship with policies + activity triggers.

### Activity Backfill & Audit (Planned)
- **Referral lineage:** backfill `partner_activity_log` with one event per historic `partner_referrals` row (`event_type = 'referral'`, `occurred_at = referred_at`, payload includes `status` + `estimated_value`). Requires idempotent SQL script filtered by `created_at < '2025-10-01'`.
- **Commission sync:** generate `commission` events for any `partner_commissions` row lacking a matching activity entry; piggyback on backfill script once referral inserts succeed.
- **Ongoing hooks:** ensure future data imports (CSV/Airtable) call the shared `logPartnerActivity` helper so the timeline stays authoritative.
- **Verification:** after backfill, spot-check at least three partner workspaces to confirm chronological ordering and absence of duplicates before marking the migration complete.

### Validation & Testing Plan
- **UI Guards:** referral creation modal now blocks submission until `client_name`, valid `client_email`, and non-negative value fields pass simple regex/number validation; commission modal enforces positive amounts and valid timestamps.
- **Unit Coverage TODO:** add Vitest suite stubbing Supabase client to assert `createPartnerReferral` and `upsertPartnerCommission` payloads + activity logging side effects.
- **E2E Coverage TODO:** Playwright happy-path to create referral → advance to `won` → log commission, asserting timeline reflects new events.
