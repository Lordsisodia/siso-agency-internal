# Offline Conflict Resolution Protocol for Supabase + IndexedDB

This document captures the pragmatic, two-week implementation plan for reliable offline conflict resolution in SISO Internal.

## Overview of the Approach

To enable safe offline-first syncing in two weeks, we adopt a pragmatic Last-Writer-Wins (LWW) strategy augmented with conflict detection and selective field merging. The goal is to prevent silent data loss while keeping the solution simple (no complex CRDTs). In practice, this means:

- Optimistic updates with version checks: Each offline update carries the last known server timestamp. We only apply it on the server if the record hasn’t changed remotely in the meantime.
- Per-field merge for concurrent edits: If two devices edited different fields of the same task, both changes are preserved. If the same field is edited on both, the later update (by timestamp) wins.
- “Delete wins” rule: A deletion on one device overrides an edit to that task on another device. This avoids resurrecting tasks that a user intentionally deleted.
- Deterministic resolution: Conflicts are resolved using timestamps and rules (no random choice), ensuring all clients converge to the same state.
- Minimal UI disruption: Conflicts auto-resolve with subtle indicators; no heavy dialogs in this phase.

This approach mirrors best practices for mobile/PWA offline sync: use simple timestamp-based merging unless the use-case truly demands CRDT complexity. Next, we detail the data model changes and sync algorithm.

## Data Structures & Metadata for Sync

- updated_at (server-side): Each row includes updated_at with trigger-based updates; serves as version indicator.
- Soft-delete marker: Prefer `is_deleted boolean` (or status enum) to propagate deletions as updates.
- IndexedDB metadata: Keep `_last_synced` (server updated_at at last pull), `_needs_sync`, and `_sync_status` per record. Do not overwrite `_last_synced` on local edits.
- Offline change queue: Queue actions with `{id, table, action, data, baseline_updated_at, timestamp}`. If schema changes are heavy, the sync service can look up baseline via local store at runtime.
- Ordering key: Ensure explicit `order_index` (or equivalent) for list reordering.

## Sync State Machine

1) Queue Offline Mutations
- Apply local change instantly; set `_needs_sync=true`, `_sync_status='pending'`.
- Queue `{ action: create|update|delete, data, baseline_updated_at }`.

2) Push to Server with Conflict Detection
- create → `insert` (or `upsert` with client UUIDs) idempotently.
- update → conditional update using optimistic concurrency:
  ```ts
  const { data, error } = await supabase
    .from('tasks')
    .update(changes)
    .eq('id', id)
    .eq('updated_at', baselineUpdatedAt)
    .select();
  ```
- 0 rows affected ⇒ conflict. Fetch current server row for merge.
- delete → soft-delete (preferred) or hard delete. Treat as idempotent.
- Retry/backoff: exponential; actions remain queued until success; creates are upserts; updates safe to retry.

3) Conflict Resolution Merge
- If remote row missing or `is_deleted=true` ⇒ delete wins; drop local edit and remove locally.
- Else, field-wise comparison using baseline:
  - If server field unchanged vs baseline ⇒ apply local change.
  - If server field changed too ⇒ same-field conflict → LWW by server timestamp.
- Send merged record via update/upsert; update local with new server `updated_at`, clear `_needs_sync`.
- Reordering conflicts: treat list order as atomic; if multiple position conflicts detected, prefer one full order (e.g., server order) rather than intermixing.

4) Pull Server Changes
- After pushing queue, fetch rows `updated_at > lastSync`.
- Upsert into local stores; set `_last_synced` and `_sync_status='synced'`.
- If soft-deleted rows present, reflect deletion locally.

## Merge Policy & UX
- Automatic, deterministic merges; avoid duplicates/copies.
- Optional subtle toast: “Some changes were merged from another device.”
- No resurrection: deletes take precedence.

## Example Scenarios
- Different-field edits ⇒ both preserved after merge.
- Same-field edits ⇒ last server timestamp wins.
- Edit vs delete ⇒ delete wins; item removed locally.
- Reorder vs reorder ⇒ choose one full order to avoid garbled lists.

## Idempotence & Reliability
- Stable UUIDs + optimistic concurrency yield idempotent writes.
- Queue survives crashes; on restart, remaining actions retry.
- Partial failures keep actions queued with retry_count and backoff; optional `_sync_status='error'` for max-retry cases.

## Test Plan (Playwright + unit)
- Single-device offline create/edit/delete → sync success, flags cleared.
- Two-device same-field conflicts → LWW observed; convergence verified.
- Two-device different-field edits → merged result; convergence verified.
- Edit vs delete → delete wins; no resurrection.
- Reorder conflicts → consistent final order; no half-mixed sequences.
- Idempotency under network flaps → no duplicates; final state correct.

## Acceptance Criteria
- No silent data loss; deterministic convergence.
- Reordering determinism with at most one reorder discarded.
- Idempotent sync operations; retries safe.
- Minimal UI disruption; optional indicators for merges.
- Migration: optional one-time full pull to stamp `_last_synced` baselines.

## References
- PowerSync guidance on LWW and delete-wins for Supabase sync.
- RXDB / timestamp-based sync patterns.
- SISO Offline-First docs and current cache-first hooks.

