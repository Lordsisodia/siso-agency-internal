# Deep Research Question Bank (SISO Internal)

Last updated: 2025-10-20
Owner: Shaan / SISO Internal
Purpose: Curated, high‑leverage questions for an external deep‑research agent to answer. Each set is tailored to our current architecture, roadmap, and constraints.

Context sources to attach when sending to the research agent:
- README.md (root) and docs/README.md
- docs/LIFELOCK-DOMAIN-STRUCTURE-CURRENT-STATE.md
- docs/OFFLINE-FIRST-COMPLETE-FIX.md and docs/OFFLINE-INFRASTRUCTURE-ANALYSIS.md
- docs/AI-THOUGHT-DUMP-SYSTEM-COMPLETE.md
- docs/PRD-CLIENTS-SYSTEM.md
- src/ecosystem/internal/lifelock/ (selected files if needed)

---

## 1) Product Vision & Positioning
- What’s the clearest one‑sentence positioning for SISO Internal that differentiates us from Notion/Things/Linear while centering LifeLock + Deep Work?
- What jobs‑to‑be‑done (JTBD) segments most strongly resonate with LifeLock’s daily→weekly→monthly→yearly→life stack?
- What value metrics should we track that correlate with user success (e.g., deep‑work minutes, morning XP, weekly streaks)?
- What “non‑obvious” wedge features (e.g., voice thought‑dump → auto‑tasks) most likely create habit‑forming loops for mobile‑first users?
- What are the top 3 killer demo flows we should perfect for first‑time activation?

## 2) Personas & Use Cases
- Which 3 personas (solo founder, student, agency operator, etc.) align best with LifeLock and our Clients system? Why?
- For each persona, what are “critical moments” where the app must be instant/offline, and what’s the minimal feature set to delight?
- What onboarding checklist per persona maximizes first‑week retention (mobile‑first)?

## 3) LifeLock Multi‑Horizon Design (Daily→Life)
- Which information roll‑ups from daily should appear on weekly/monthly/yearly to drive planning (not just reporting)?
- What proven UI patterns make weekly and monthly planning feel as “actionable” as daily (avoid passive dashboards)?
- How should we partition data and caches by time horizon to keep each view instant and offline‑ready?

## 4) Gamification & XP System
- Based on behavioral science, what XP reward schedule will maximize adherence without causing burnout or “point chasing”?
- How should we tune wake‑time multipliers and weekend bonuses (see docs/features/MORNING-ROUTINE-XP-SYSTEM.md) to drive consistent routines?
- What achievements and streak mechanics best sustain month‑over‑month engagement (7, 21, 66‑day science)?
- How should we verify that XP correlates with meaningful outcomes (deep‑work minutes, tasks closed)?

## 5) Voice & Thought‑Dump AI
- For a PWA, what is the most reliable cross‑browser STT/TTS stack (Web Speech API vs on‑device vs server), and what are fallbacks on iOS Safari?
- What prompt engineering and structured extraction patterns most robustly turn free‑form speech into prioritized tasks + subtasks (with duration and tags)?
- What confidence metrics and human‑in‑the‑loop UI should we add to reduce incorrect task generation?
- What privacy model should we adopt for voice data (storage duration, encryption, user controls)?

## 6) Offline‑First Architecture & Sync
- For Supabase + IndexedDB, what conflict resolution strategy should we adopt for tasks, subtasks, and habits: LWW, field‑level merges, or CRDTs? Under what conditions?
- What is a minimal, provably safe sync protocol we can ship in 1–2 weeks that handles create/update/delete + reordering without data loss?
- How should we detect and surface “stale cache” vs “fresh data” on mobile without adding friction?
- What telemetry should we log to validate our offline success rate and mean time to consistency after reconnect?

## 7) Data Model, RLS, and Security
- For clients + tasks, what schema and indexes minimize read/write cost while keeping queries fast on mobile (see docs/PRD-CLIENTS-SYSTEM.md)?
- What Postgres constraints and triggers (e.g., updated_at) should we standardize to protect data integrity across all tables?
- What RLS patterns and test cases guarantee isolation by `auth.uid()` for the new clients tables and existing task tables?
- What is our policy baseline for PII/health‑adjacent data in LifeLock (nutrition, workouts) to satisfy CCPA/GDPR expectations?

## 8) Analytics & Decision Loops
- Which leading indicators best predict D7/D30 retention in our app category?
- What weekly metrics should SISO watch to guide roadmap decisions (activation, engagement, retention, resurrection)?
- How should we attribute XP and voice features to downstream outcomes like deep‑work time and client revenue?

## 9) Clients System (PRD Execution)
- What are the sharpest trade‑offs for “client tasks”: dedicated table vs reusing core tasks with `client_id`? Which scales better with offline sync?
- What filters and saved views (status, type, value) most help on mobile without complex multi‑select UI?
- What minimal timeline/docs features provide 80% of value in Phase 2 while staying offline‑friendly?
- What revenue or invoicing primitives should we add first if we move to Phase 3?

## 10) Performance & PWA Reliability
- What budgets (JS/CSS size, images, font strategy) should we set to guarantee <2s FCP on mid‑tier Android offline/online?
- What are the highest‑ROI instant‑load patterns we haven’t yet applied across all hooks (see OFFLINE-FIRST-COMPLETE-FIX)?
- What service worker strategy (runtime caching, background sync) pairs best with our IndexedDB design?

## 11) Security, Privacy, and Compliance
- What baseline app privacy policy and data retention schedule should we publish given voice and wellness data?
- What is the simplest, correct approach to secrets, tokens, and rate limits for a Vercel + Supabase + Clerk stack?
- What incident‑response plan should we document for data loss, auth failures, or sync conflicts?

## 12) Monetization & Growth
- For our audience, what pricing packaging is most viable (free plan limits, Pro features: offline analytics, client timelines, AI extras)?
- What native, low‑friction referral mechanisms work best in PWAs?
- What “wow” moments during week 1 convert best to paid?

## 13) Integrations (Scope & Order)
- Which 2 integrations (Google Calendar, Notion, Gmail) deliver the biggest net value relative to implementation cost and offline constraints?
- What import/export formats should we support first to win switching users from Notion/Airtable?

## 14) Edge Functions & Automation
- What daily/weekly summarization jobs should run as Supabase Edge Functions (or cron on Vercel) to power roll‑ups and insights?
- How should we structure idempotency and backoff for background sync + summarization tasks?

## 15) Testing & Reliability
- What test harness should we adopt for offline flows (playwright+workbox mocks, contract tests, property‑based tests for sync)?
- What invariants should we enforce (e.g., task order is contiguous, subtasks belong to parent, XP never negative), and how do we test them?

---

# Priority “Top 12” Questions (Highest ROI)
1) What is the minimal, safe conflict‑resolution design we can ship for tasks/subtasks with Supabase + IndexedDB in 2 weeks, including edge cases (reordering, concurrent edits, deletes)?
2) What exact weekly and monthly roll‑ups should we compute (from daily) to make planning truly actionable, and how do we keep them instant + offline?
3) What is the most reliable STT/TTS stack for a mobile PWA across iOS Safari, Chrome Android, and desktop, with graceful fallbacks and privacy guarantees?
4) Which persona’s activation journey should we optimize first, and what is the day‑1 flow that produces the largest D7 retention lift?
5) Which XP reward schedule and achievements maximize routine adherence over 30–60 days without burnout?
6) For clients, should we extend core tasks with `client_id` or keep a separate `client_tasks` table? Analyze offline sync complexity, RLS, and queries.
7) Which 10 analytics events (names + payloads) should we instrument first to guide the roadmap and measure XP/voice efficacy?
8) What is our PII/privacy baseline for voice + wellness data that keeps legal risk low while maintaining feature usefulness?
9) What service worker + caching strategy ensures sub‑100ms tab switches for all LifeLock views after first load?
10) Which two integrations (and exact MVP scopes) yield the best retention/paid conversion within 2 weeks of work?
11) What schema/index/trigger patterns should we standardize across all tables (clients, tasks, timelines) for correctness and performance?
12) What background summarization jobs (daily/weekly) give the most “wow per watt” and how should we design them to be idempotent and offline‑aware?

---

# How To Use This Bank
- Pick a section → copy 3–5 questions → attach relevant docs listed above → ask the deep‑research agent for: (a) crisp answers with citations, (b) trade‑off tables, (c) a 7‑day action plan, and (d) a validation checklist.
- For architectural topics, request sequence diagrams and data‑flow sketches.
- For UX topics, request annotated mobile wireframes and usage heuristics.
