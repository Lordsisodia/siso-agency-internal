# ISSUE-20260105-0011 — Timebox full-screen add-task + availability planning

## Stage 2a — Option set (preserve current timebox save/sync)

- **Option A (reuse `time_blocks` with availability type flag)**
  - Represent availability blocks as `time_blocks` rows with `type`/`category` = `availability` / `AVAILABILITY`.
  - Keeps existing offline queue + `SYNC_TABLE_MAP.timeBlocks` onConflict (`user_id,date,start_time`) intact; no new tables or sync paths.
  - Minimal risk to current TimeBlockForm modal behavior; just extend category maps and UI filter rules.
- **Option B (new `availability_blocks` surface table)**
  - Separate table + offline queue entries.
  - Risks duplicating logic in `offlineDb`, `syncService`, and `TimeBlockUtils`, and could drift from the proven timeblock sync path.
- **Option C (derived availability schedule only in client cache)**
  - Store availability in local cache/settings and expand into time blocks at render time.
  - Would bypass Supabase persistence and break cross-device continuity/sync guarantees.

**Choice:** Option A. It reuses the proven `time_blocks` pipeline (offline save ➜ `syncService` ➜ Supabase) so existing save/sync semantics stay unchanged while adding a new `AVAILABILITY` category/type for differentiation.

## Stage 3 — Execution plan (includes availability representation)

1) **Data model (availability blocks)**
   - Add `AVAILABILITY` category value in UI + map to `type: 'availability'` in unified data service and `TimeBlockFormModal` category palettes.
   - Keep storage in the existing `time_blocks` table and `offlineDb` queue (`timeBlocks`), preserving `onConflict: user_id,date,start_time` behavior.
   - Ensure filters/queries can distinguish availability vs standard blocks without altering sync pipeline.

2) **Full-screen add-task/availability UX**
   - Create a full-screen modal/sheet that wraps the existing `TimeBlockFormModal` logic (no changes to submit/update handlers) with toggles for task vs availability and quick “add to availability” affordance.
   - Provide availability presets (e.g., focus, meeting-free, heads-down) that pre-fill category `AVAILABILITY`, start/end, and notes while keeping save flow identical.

3) **Planner + conflict logic**
   - Reuse existing conflict detection (`onCheckConflicts`, `TimeBlockUtils`) so availability blocks still respect overlaps; add visual differentiation only.
   - Keep auto-fit and buffer logic unchanged; availability blocks simply pass through to the same handlers.

4) **Sync/offline guarantees**
   - No new tables; extend category→type mapping in `unified-data.service.ts` and ensure `syncService` `timeBlocks` config remains untouched to preserve current save/sync semantics.
   - Add light tests around saving an availability block offline then syncing online to confirm parity with existing timebox behavior.

5) **Rollout + guardrails**
   - Feature-flag the full-screen “Add availability” entry point; fall back to existing modal.
   - Telemetry/logging: reuse timeblock events but tag `availability` category for tracking.
