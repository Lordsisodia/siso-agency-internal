# PRD: SISO Clients Management System

**Version**: 1.0
**Date**: 2025-10-17
**Status**: Planning
**Owner**: Shaan Sisodia

---

## 📋 Executive Summary

A mobile-first client management system for SISO Internal that tracks client projects from potential leads to completion, integrates with existing Deep Focus Tasks, and provides Airtable-style organization with minimal cognitive overhead.

**Key Features**:
- Airtable-style client list with table/card view toggle
- Individual client pages with bottom navigation (Overview, Tasks, Timeline, Docs)
- Seamless integration with Deep Focus Tasks system
- Client-specific task management reusing existing UI
- Mobile-first design optimized for quick updates

---

## 🎯 Problem Statement

**Current State**: Client work is scattered across different tools (Notion, messages, memory). No centralized view of client status, tasks, or project value.

**Desired State**: Single source of truth for all client work that:
- Shows client pipeline (Potential → Onboarding → Active → Completed → Archived)
- Connects client tasks to daily deep work sessions
- Provides quick mobile access to client info
- Reuses existing SISO UI patterns for consistency

**Success Metrics**:
- Time to find client info: < 5 seconds
- Mobile usability: 100% (all actions possible on phone)
- Component reuse: > 80% (minimal new components)

---

## 🔑 Core Requirements

### Must Have (Phase 1)
- [x] Client CRUD operations (Create, Read, Update, Delete)
- [x] Client status tracking (Potential, Onboarding, Active, Completed, Archived)
- [x] Client type categorization (predefined + custom)
- [x] Airtable-style table view for desktop
- [x] Card view for mobile
- [x] Individual client page with bottom nav
- [x] Overview tab (client brief, onboarding checklist, budget, deadline)
- [x] Tasks tab (reuses Deep Focus Task UI)
- [x] Deep Work integration (Personal/Client task selector)
- [x] Basic search and filter by status

### Should Have (Phase 2)
- [ ] Timeline tab (editable milestones)
- [ ] Docs tab (Notion links with CRUD)
- [ ] Client task sync with Deep Work
- [ ] Quick actions (swipe gestures on mobile)
- [ ] Client avatar/logo upload

### Nice to Have (Phase 3)
- [ ] Revenue tracking and invoicing
- [ ] Time tracking per client
- [ ] Client analytics dashboard
- [ ] Export client data

---

## 👤 User Stories

### As a user managing clients:
1. **Add new client**: "I meet a potential client and want to quickly add them with minimal info"
2. **Track onboarding**: "I want to see where each client is in the onboarding process"
3. **View all clients**: "I want an Airtable-style view of all clients with status and type"
4. **Manage client tasks**: "I want to create tasks for UberCrypt and see them in my deep work"
5. **Switch between personal/client work**: "During deep work, I want to filter tasks by Personal vs Client"
6. **Update client info**: "I want to edit the client brief, budget, and deadline easily"
7. **Mobile quick-check**: "On my phone, I want to quickly see client status and next action"

---

## 🗄️ Database Schema

### `clients` Table
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,

  -- Basic Info
  name TEXT NOT NULL,
  type TEXT, -- 'Restaurant', 'Agency', 'Crypto App', etc.
  status TEXT NOT NULL DEFAULT 'potential', -- potential, onboarding, active, completed, archived

  -- Project Details
  brief TEXT, -- Client brief/description
  budget DECIMAL(10, 2), -- Optional budget
  deadline TIMESTAMPTZ, -- Optional deadline
  total_value DECIMAL(10, 2), -- Total project value

  -- Onboarding Checklist (JSONB for flexibility)
  onboarding_progress JSONB DEFAULT '{"initial_contact": false, "talked_to": false, "proposal_created": false, "quote_given": false, "mvp_created": false, "deposit_collected": false, "project_live": false}',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_status CHECK (status IN ('potential', 'onboarding', 'active', 'completed', 'archived'))
);

-- Index for fast queries
CREATE INDEX idx_clients_user_status ON clients(user_id, status);
CREATE INDEX idx_clients_user_type ON clients(user_id, type);
```

### `client_types` Table (Predefined + Custom)
```sql
CREATE TABLE client_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id), -- NULL = system default
  name TEXT UNIQUE NOT NULL,
  is_system BOOLEAN DEFAULT false, -- true for predefined types
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System defaults
INSERT INTO client_types (name, is_system) VALUES
  ('Restaurant', true),
  ('Agency', true),
  ('Crypto App', true),
  ('E-commerce', true),
  ('SaaS', true),
  ('Other', true);
```

### `client_tasks` Table (Extends Deep Focus Tasks)
```sql
CREATE TABLE client_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,

  -- Task fields (mirrors deep_focus_tasks structure)
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium', -- low, medium, high
  due_date TIMESTAMPTZ,

  -- Subtasks
  subtasks JSONB DEFAULT '[]', -- [{"id": "uuid", "title": "...", "completed": false}]

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_client_tasks_client ON client_tasks(client_id);
CREATE INDEX idx_client_tasks_user ON client_tasks(user_id, completed);
```

### `client_docs` Table (Phase 2)
```sql
CREATE TABLE client_docs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) NOT NULL,

  title TEXT NOT NULL,
  notion_url TEXT, -- Link to Notion document
  doc_type TEXT, -- 'contract', 'proposal', 'invoice', 'other'

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_client_docs_client ON client_docs(client_id);
```

### `client_timeline` Table (Phase 2)
```sql
CREATE TABLE client_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) NOT NULL,

  milestone TEXT NOT NULL,
  deadline TIMESTAMPTZ,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_client_timeline_client ON client_timeline(client_id);
```

---

## 🎨 UI/UX Design

### 1. Main Clients Page (`/clients`)

#### Desktop: Airtable-Style Table View
```
┌─────────────────────────────────────────────────────────────────┐
│ Client Dashboard                    [🔍 Search] [+ Add Client]  │
├─────────────────────────────────────────────────────────────────┤
│ [📊 Table] [📇 Cards]  |  All • Potential • Onboarding • Active │
├─────────────────────────────────────────────────────────────────┤
│ Name          │ Type        │ Status      │ Total Value │ Next  │
├─────────────────────────────────────────────────────────────────┤
│ UberCrypt     │ Crypto App  │ 🟢 Active   │ $50,000     │ →     │
│ Tasty Bites   │ Restaurant  │ 🟡 Onboard  │ $12,000     │ →     │
│ CloudFlow     │ SaaS        │ ⚪ Potential │ TBD         │ →     │
└─────────────────────────────────────────────────────────────────┘

Status Colors:
⚪ Potential (gray)
🟡 Onboarding (yellow)
🟢 Active (green)
✅ Completed (blue)
📦 Archived (gray, faded)
```

#### Mobile: Card View
```
┌─────────────────────────┐
│ Clients          [+ Add] │
├─────────────────────────┤
│ All • Active • Potential│
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ 🟢 UberCrypt        │ │
│ │ Crypto App          │ │
│ │ $50,000             │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ 🟡 Tasty Bites      │ │
│ │ Restaurant          │ │
│ │ $12,000             │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

### 2. Individual Client Page (`/clients/:id`)

#### Bottom Navigation (Reuses LifeLock Pattern)
```
┌─────────────────────────────────────┐
│ ← UberCrypt              [⋮ Menu]   │
├─────────────────────────────────────┤
│                                     │
│  [Current Tab Content]              │
│                                     │
│                                     │
├─────────────────────────────────────┤
│ 📊 Overview  ✅ Tasks  📅 Timeline  │
│              🟢 Active              │
└─────────────────────────────────────┘
```

#### Tab 1: Overview
```
┌─────────────────────────────────────┐
│ Client Brief                        │
│ ┌─────────────────────────────────┐ │
│ │ Building a crypto portfolio app │ │
│ │ with real-time tracking...      │ │
│ │ [Edit]                          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Project Details                     │
│ Budget: $50,000                     │
│ Deadline: Dec 31, 2025              │
│ Type: Crypto App                    │
│                                     │
│ Onboarding Progress                 │
│ ✅ Initial contact                  │
│ ✅ Talked to                        │
│ ✅ Proposal created                 │
│ ✅ Quote given                      │
│ ✅ MVP created                      │
│ ✅ Deposit collected                │
│ ⬜ Project live                     │
└─────────────────────────────────────┘
```

#### Tab 2: Tasks (Reuses Deep Focus Task UI)
```
┌─────────────────────────────────────┐
│ Deep Focus Tasks        [+ Add Task]│
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ ⬜ Build authentication flow    │ │
│ │    ⬜ Design login screen       │ │
│ │    ⬜ Integrate Clerk           │ │
│ │    🔴 High  📅 Oct 20           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ⬜ Setup Supabase database      │ │
│ │    🟡 Medium  📅 Oct 22         │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Tab 3: Timeline (Phase 2)
```
┌─────────────────────────────────────┐
│ Project Timeline        [+ Milestone]│
├─────────────────────────────────────┤
│ ✅ Discovery & Planning             │
│    Completed Oct 1, 2025            │
│                                     │
│ 🔵 Design Phase (In Progress)       │
│    Due: Oct 25, 2025                │
│                                     │
│ ⬜ Development Phase                │
│    Due: Nov 30, 2025                │
└─────────────────────────────────────┘
```

#### Tab 4: Docs (Phase 2)
```
┌─────────────────────────────────────┐
│ Documents & Files       [+ Add Doc] │
├─────────────────────────────────────┤
│ 📄 Project Proposal                 │
│    Notion • Oct 1, 2025             │
│                                     │
│ 📄 Contract (Signed)                │
│    Notion • Oct 5, 2025             │
│                                     │
│ 💰 Invoice #001                     │
│    Notion • Oct 10, 2025            │
└─────────────────────────────────────┘
```

### 3. Deep Work Integration

#### Updated Deep Work Page (`/deep-work`)
```
┌─────────────────────────────────────┐
│ Deep Focus Work Rules               │
│ ┌─────────────────────────────────┐ │
│ │ 1. No context switching         │ │
│ │ 2. Single task focus            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Task Filter                         │
│ ┌─────────────────────────────────┐ │
│ │ [All] [Personal] [Client Work]  │ │ ← NEW
│ └─────────────────────────────────┘ │
│                                     │
│ Tasks                               │
│ ┌─────────────────────────────────┐ │
│ │ ⬜ Build auth flow              │ │
│ │    🏢 UberCrypt  🔴 High        │ │ ← Client badge
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ ⬜ Review SISO admin dashboard  │ │
│ │    📱 Personal  🟡 Medium       │ │ ← Personal badge
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

Filter Behavior:
- "All": Shows all tasks (personal + client)
- "Personal": Shows only tasks without client_id
- "Client Work": Shows only tasks with client_id
```

---

## 🔧 Component Reuse Map

### Existing Components to Reuse (80%+ reuse target)

| Component | Source | Use In Clients |
|-----------|--------|----------------|
| **BottomNavigation** | `/ecosystem/internal/lifelock/components/BottomNavigation.tsx` | Client detail page navigation |
| **TaskCard** | `/ecosystem/internal/tasks/components/TaskCard.tsx` | Client tasks display |
| **SubtaskItem** | `/ecosystem/internal/tasks/components/SubtaskItem.tsx` | Client task subtasks |
| **StatusBadge** | `/shared/components/StatusBadge.tsx` | Client status indicators |
| **Button** | `/components/ui/button.tsx` | All CTAs |
| **Input** | `/components/ui/input.tsx` | Forms and search |
| **Select** | `/components/ui/select.tsx` | Type dropdown, filters |
| **Dialog** | `/components/ui/dialog.tsx` | Add/Edit modals |
| **Checkbox** | `/components/ui/checkbox.tsx` | Onboarding checklist |
| **Table** | `/components/ui/table.tsx` | Airtable-style view |

### New Components Needed (20%)

| Component | Purpose | Location |
|-----------|---------|----------|
| **ClientsTable** | Airtable-style table view | `/ecosystem/internal/clients/components/ClientsTable.tsx` |
| **ClientCard** | Mobile card view | `/ecosystem/internal/clients/components/ClientCard.tsx` |
| **ClientForm** | Add/Edit client modal | `/ecosystem/internal/clients/components/ClientForm.tsx` |
| **OnboardingChecklist** | Progress tracker | `/ecosystem/internal/clients/components/OnboardingChecklist.tsx` |
| **TaskFilterSelector** | Personal/Client toggle | `/ecosystem/internal/tasks/components/TaskFilterSelector.tsx` |

---

## 🏗️ Technical Architecture

### File Structure
```
src/ecosystem/internal/clients/
├── pages/
│   ├── ClientsPage.tsx          # Main list view
│   └── ClientDetailPage.tsx     # Individual client page
├── components/
│   ├── ClientsTable.tsx         # Airtable view
│   ├── ClientCard.tsx           # Card view
│   ├── ClientForm.tsx           # Add/Edit modal
│   ├── OnboardingChecklist.tsx  # Checklist component
│   └── tabs/
│       ├── OverviewTab.tsx
│       ├── TasksTab.tsx
│       ├── TimelineTab.tsx      # Phase 2
│       └── DocsTab.tsx          # Phase 2
├── hooks/
│   ├── useClients.ts            # Fetch all clients
│   ├── useClient.ts             # Fetch single client
│   ├── useClientTasks.ts        # Fetch client tasks
│   └── useClientMutations.ts    # CRUD operations
└── types/
    └── client.ts                # TypeScript types

src/ecosystem/internal/tasks/
├── components/
│   └── TaskFilterSelector.tsx   # NEW: Personal/Client filter
└── hooks/
    └── useTasks.ts              # UPDATED: Add client filter
```

### Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Supabase Database                    │
│  clients, client_types, client_tasks, client_timeline   │
└───────────────────┬─────────────────────────────────────┘
                    │
        ┌───────────┴──────────┐
        │                      │
┌───────▼────────┐   ┌────────▼─────────┐
│  Clients Page  │   │  Deep Work Page  │
│  (List View)   │   │  (Task Filter)   │
└───────┬────────┘   └────────┬─────────┘
        │                     │
        │ Click client        │ Filter: Client
        ▼                     ▼
┌──────────────────┐   ┌────────────────┐
│ Client Detail    │   │ Show client    │
│ (Bottom Nav)     │   │ tasks only     │
└──────┬───────────┘   └────────────────┘
       │
       │ Tasks Tab
       ▼
┌──────────────────┐
│ Client Tasks     │
│ (Reuses TaskCard)│
└──────────────────┘
```

### State Management

Using **SWR** (existing pattern):

```typescript
// hooks/useClients.ts
export function useClients(status?: ClientStatus) {
  const { user } = useClerkUser();

  const { data, error, mutate } = useSWR(
    user ? ['clients', user.id, status] : null,
    async () => {
      let query = supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Client[];
    }
  );

  return { clients: data, error, mutate };
}

// hooks/useClientTasks.ts
export function useClientTasks(clientId: string) {
  const { data, error, mutate } = useSWR(
    clientId ? ['client_tasks', clientId] : null,
    async () => {
      const { data, error } = await supabase
        .from('client_tasks')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ClientTask[];
    }
  );

  return { tasks: data, error, mutate };
}
```

---

## 🚀 Implementation Phases

### Phase 1: Core MVP (Week 1-2)
**Goal**: Basic client management with table/card views

- [ ] Database setup
  - [ ] Create `clients` table
  - [ ] Create `client_types` table with system defaults
  - [ ] Create `client_tasks` table
  - [ ] Add RLS policies
- [ ] Main clients page
  - [ ] Airtable-style table view (desktop)
  - [ ] Card view (mobile)
  - [ ] View toggle component
  - [ ] Status filter tabs
  - [ ] Search functionality
- [ ] Client CRUD
  - [ ] Add client modal
  - [ ] Edit client modal
  - [ ] Delete client confirmation
  - [ ] Client type dropdown (predefined + custom)
- [ ] Individual client page
  - [ ] Bottom navigation setup
  - [ ] Overview tab (brief, budget, deadline, onboarding checklist)
  - [ ] Basic routing

**Deliverables**: Working clients list + individual client pages (Overview only)

---

### Phase 2: Task Integration (Week 3)
**Goal**: Connect client tasks to Deep Work

- [ ] Client tasks
  - [ ] Tasks tab on client detail page
  - [ ] Reuse TaskCard and SubtaskItem components
  - [ ] Add/edit/delete client tasks
  - [ ] Task CRUD operations
- [ ] Deep Work integration
  - [ ] Add TaskFilterSelector component
  - [ ] Update useTasks hook to support client filter
  - [ ] Add client badge to task cards
  - [ ] Personal/Client/All filter logic
- [ ] Task sync
  - [ ] Client tasks appear in Deep Work when filtered
  - [ ] Task status updates sync across views

**Deliverables**: Client tasks fully integrated with Deep Work

---

### Phase 3: Timeline & Docs (Week 4)
**Goal**: Complete project management features

- [ ] Timeline tab
  - [ ] Create `client_timeline` table
  - [ ] Timeline UI component
  - [ ] Add/edit/delete milestones
  - [ ] Mark milestones complete
- [ ] Docs tab
  - [ ] Create `client_docs` table
  - [ ] Docs list UI
  - [ ] Add/edit/delete Notion links
  - [ ] Doc type categorization
- [ ] Polish
  - [ ] Mobile UX refinements
  - [ ] Loading states
  - [ ] Error handling
  - [ ] Empty states

**Deliverables**: Full client management system

---

### Phase 4: Enhancements (Future)
- [ ] Client avatars/logos
- [ ] Revenue tracking & invoicing
- [ ] Time tracking per client
- [ ] Client analytics dashboard
- [ ] Export functionality
- [ ] Swipe gestures on mobile
- [ ] Bulk operations

---

## 🎯 Success Criteria

### Functionality
- ✅ Can add/edit/delete clients in < 30 seconds
- ✅ Client tasks sync with Deep Work in real-time
- ✅ Mobile UI is 100% functional (no desktop required)
- ✅ Onboarding progress updates instantly
- ✅ Search returns results in < 1 second

### Code Quality
- ✅ Component reuse > 80%
- ✅ TypeScript strict mode (no `any`)
- ✅ Test coverage > 70% for hooks
- ✅ Mobile-first responsive design
- ✅ Follows existing SISO patterns

### UX/Performance
- ✅ Page load < 2 seconds
- ✅ Zero layout shift on load
- ✅ Airtable-style table works on desktop
- ✅ Card view optimized for mobile touch
- ✅ Bottom nav matches LifeLock UX

---

## 🔐 Security & Permissions

### Row-Level Security (RLS)
```sql
-- Only users can see their own clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own clients"
  ON clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
  ON clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
  ON clients FOR DELETE
  USING (auth.uid() = user_id);

-- Same for client_tasks, client_docs, client_timeline
```

---

## 📊 Analytics & Tracking (Future)

Potential metrics to track:
- Total clients by status
- Average time in each status
- Total project value (active vs completed)
- Tasks completed per client
- Revenue by client type
- Client acquisition funnel

---

## 🐛 Known Limitations & Risks

### Risks
1. **Task Sync Complexity**: Client tasks appearing in Deep Work could cause performance issues if user has 100+ tasks
   - **Mitigation**: Use pagination, lazy loading, and optimize queries

2. **Mobile Table View**: Airtable-style tables are hard to use on mobile
   - **Mitigation**: Default to card view on mobile, table only on desktop

3. **Onboarding Checklist Rigidity**: Fixed checklist might not fit all client types
   - **Mitigation**: Phase 4 could add custom checklist templates

### Out of Scope (For Now)
- Email integration with clients
- Calendar sync for deadlines
- Team collaboration (multi-user access)
- Automated status transitions
- Client portal (external client access)

---

## 📚 References

### Existing SISO Components
- LifeLock bottom nav: `/ecosystem/internal/lifelock/components/BottomNavigation.tsx`
- Deep Focus Tasks: `/ecosystem/internal/tasks/components/TaskCard.tsx`
- Supabase patterns: `/services/database/`

### Design Inspiration
- Airtable: Table view UX
- Notion: Simple, clean card views
- Linear: Status workflows and filters

---

## ✅ Approval & Sign-off

**Created by**: Claude (SISO SuperClaude)
**Reviewed by**: Shaan Sisodia
**Approved**: [ ] Pending

**Next Steps**:
1. Review and approve PRD
2. Create database migration
3. Start Phase 1 implementation
4. Weekly check-ins on progress

---

*PRD Version 1.0 | SISO Internal | Mobile-First Client Management*
