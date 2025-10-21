# Deep Research Briefs & Prompt Templates

Last updated: 2025-10-20
Owner: Shaan / SISO Internal

This file provides short, copy‑pasteable briefs for our highest‑impact unknowns. Each brief includes: goal, inputs to attach, questions to answer, required outputs, and acceptance criteria.

---

## Brief A — Offline Conflict Resolution (Supabase + IndexedDB)

- Goal: Ship a minimal, safe conflict‑resolution design for tasks/subtasks/habits in 2 weeks.
- Attach: docs/OFFLINE-FIRST-COMPLETE-FIX.md, src/shared/offline/offlineDb.ts (excerpt), representative hooks (useTaskEditing.ts, useHealthNonNegotiablesSupabase.ts), any task table schemas.
- Questions:
  1) For our data shapes, when is LWW sufficient vs when do we need field‑level merges or CRDTs?
  2) How do we handle reordering semantics and concurrent deletes in a way that is offline‑tolerant?
  3) What sync protocol (metadata, version vectors, timestamps) is cheapest that still prevents data loss?
  4) What merge policy and UI affordances reduce user confusion when conflicts occur?
- Required outputs:
  - Detailed protocol spec (records, metadata, queues, retry/backoff)
  - Edge cases catalogue + resolution rules
  - Migration plan for local cache metadata
  - Test plan (unit + Playwright offline scenarios)
- Acceptance criteria:
  - Handles create/update/delete + reordering without data loss
  - Deterministic merges; idempotent retries
  - Documented recovery for partial failures

Prompt template:
“Given our attached offline architecture and example schemas, design a conflict‑resolution protocol for Supabase + IndexedDB that we can implement in 2 weeks. Provide data structures, merge rules for tasks/subtasks, reordering strategy, sync state machine, and a step‑by‑step test plan. Cite sources for best practices.”

---

## Brief B — Weekly/Monthly/Yearly Roll‑Ups (Actionable Planning)

- Goal: Define the exact aggregates and UI primitives that turn daily data into actionable weekly/monthly/yearly planning screens.
- Attach: docs/LIFELOCK-DOMAIN-STRUCTURE-CURRENT-STATE.md, src/ecosystem/internal/lifelock/views (overview), any existing weekly/monthly code stubs, docs/features/MORNING-ROUTINE-XP-SYSTEM.md.
- Questions:
  1) Which metrics best predict next‑week success (e.g., deep‑work minutes, XP consistency, habit streaks)?
  2) What slice‑and‑dice views are most useful on mobile without heavy filters?
  3) What caches and precomputations should we materialize nightly to keep these views instant and offline?
- Required outputs:
  - List of computed metrics + formulas
  - Wireframe sketches (mobile‑first) and interaction notes
  - Background job plan (Edge Functions schedule + idempotency)
  - Data model additions for summaries
- Acceptance criteria:
  - Sub‑100ms load after first sync
  - All metrics derivable from existing daily data or minimal additions

Prompt template:
“Using our LifeLock structure and daily data, propose the weekly/monthly/yearly aggregates and UX needed for actionable planning. Include formulas, nightly jobs, cache strategy, and mobile wireframes. Optimize for offline instant loads.”

---

## Brief C — Cross‑Browser STT/TTS Strategy for PWA

- Goal: Ship a reliable, private voice stack for iOS Safari, Android Chrome, and desktop that degrades gracefully.
- Attach: docs/AI-THOUGHT-DUMP-SYSTEM-COMPLETE.md, src/services/voiceService.ts, MobileMicrophoneButton.tsx.
- Questions:
  1) What combination of Web Speech API, server STT, and on‑device options yields highest reliability and lowest latency?
  2) What are iOS Safari constraints for PWAs (microphone permissions, background audio, sample rates), and exact workarounds?
  3) How should we structure consent, storage, and deletion for voice data?
- Required outputs:
  - Decision tree for platform detection and fallback
  - Latency/accuracy trade‑off table (by platform)
  - Implementation checklist with code‑level tips
  - Privacy policy paragraph + user settings spec
- Acceptance criteria:
  - Works on iOS Safari PWA reliably
  - Latency < 2s end‑to‑task on good network

Prompt template:
“Design a cross‑browser STT/TTS strategy for our PWA (iOS Safari, Android Chrome, desktop). Provide platform decision tree, fallbacks, latency expectations, and privacy controls. Reference known browser limitations and recommended APIs.”

---

## Brief D — Clients System: Schema, RLS, and Offline Plan

- Goal: Finalize a production‑ready schema and access model for clients + tasks that works with our offline approach.
- Attach: docs/PRD-CLIENTS-SYSTEM.md, docs/OFFLINE-FIRST-COMPLETE-FIX.md.
- Questions:
  1) Should we model `client_tasks` separately or extend core tasks with `client_id`? Evaluate RLS, indexes, and offline complexity.
  2) What triggers and constraints (updated_at, status enums, FK cascades) should we standardize?
  3) What query shapes and indexes will keep mobile pages fast (card/table) with filters by status/type/value?
- Required outputs:
  - Final schemas + RLS policies
  - Migration scripts with naming conventions
  - Query cookbook for mobile screens
  - Offline cache key strategy
- Acceptance criteria:
  - Strict RLS isolation by `auth.uid()`
  - Sub‑200ms queries on typical data sizes

Prompt template:
“Propose final schemas, RLS policies, and index/trigger patterns for the Clients system, including an offline caching plan. Provide DDL, queries for mobile filters, and a migration + testing checklist.”
