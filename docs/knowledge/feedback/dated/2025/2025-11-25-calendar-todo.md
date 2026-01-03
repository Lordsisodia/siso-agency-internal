# Calendar To-Do Split View — 2025-11-25 (P1 idea)

**Request:** Add a simple to-do list tracker on the Calendar page with a split view: one button shows the calendar; the other toggles to a deep-work-style task list. Tasks entered in the to-do list should also appear on the calendar (bidirectional sync).

## Goals
- Split-view toggle: Calendar ↔️ To-Do (same page, SPA).
- Reuse the deep-work task UI (tasks + subtasks, priority, completion).
- Data is shared: creating/editing a to-do item reflects on the calendar; calendar items can surface in the list.
- Keep UI minimal and mobile-friendly; match existing LifeLock styling.

## UX Outline
- Top of Calendar page: two-segment control (Calendar | To-Do).
- To-Do panel uses deep-work task components (priority chips, subtasks, completion check, drag order).
- Calendar entries created from to-dos should carry title, priority, date/duration; show as events.
- Quick add: “Add task” text field; default date = selected calendar day.
- Subtasks map to calendar notes or stay list-only (decide during implementation).

## Tech/Integration Notes
- Data model: reuse deep work task schema where possible; add `source = 'calendar'` + `eventDate/start/end`.
- When creating a to-do, create/patch a calendar event row (Supabase) with same ID/ref.
- Hook reuse: leverage `useDeepWorkTasksSupabase` patterns; consider thin wrapper hook for calendar scope.
- UI reuse: import deep-work task list component with theming overrides; avoid new patterns.
- Offline: keep optimistic updates consistent with calendar store; mirror to IndexedDB if calendar already offline-enabled.

## Open Questions
- Should subtasks appear as separate calendar items or remain nested?
- How to handle multi-day/recurring events from a single task?
- Do we show calendar event time on the list item chip?

## Next Steps (proposed)
1) ✅ Mount split toggle on Calendar page (Calendar | To-Do) and embed deep-work list for selected date.
2) ✅ Reuse deep-work components; quick-add creates deep-work task and linked calendar event.
3) ✅ Reverse sync: creating a calendar event now auto-creates a deep-work task when none is selected.
4) ✅ Client linking: to-dos/events can be tied to a client; linked tasks/events surface client badge.
5) QA on mobile + offline; add to docs.
