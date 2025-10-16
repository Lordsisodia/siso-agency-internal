# Codex Implementation Prompt: SISO Clients System Refactor

**Task**: Refactor and rebuild the clients management system at `/admin/dash/clients` according to the PRD specifications while maximizing component reuse and minimizing complexity.

---

## 📋 Context

### Current State (What Exists)
**Route**: `/admin/dash/clients`
**Main Page**: `/src/ecosystem/internal/admin/dashboard/pages/AdminClients.tsx`
**Main View**: `/src/ecosystem/internal/admin/clients/AdminClientsView.tsx`

**Existing Database**: `clients` table with current schema (see types below)

**Problems**:
- Too many components doing similar things (messy, over-engineered)
- Dashboard header wastes space ("Client Dashboard" title too big)
- DashboardStats component not optimized for mobile
- Complex column customization not needed yet
- Missing: Individual client detail pages with bottom nav
- Missing: Client tasks integration with Deep Work
- Missing: Simplified onboarding checklist
- No client types/categorization

### PRD Goals (What We Want)
**See**: `/docs/PRD-CLIENTS-SYSTEM.md` for full specification

**Key Requirements**:
1. **Mobile-first** Airtable-style table view (desktop) + card view (mobile) with toggle
2. **Simplified header**: Compact stats (total clients + total value in one line)
3. **Status filters**: Potential → Onboarding → Active → Completed → Archived
4. **Client types**: Restaurant, Agency, Crypto App, E-commerce, SaaS, Other (predefined + custom)
5. **Individual client pages**: Bottom nav with tabs (Overview, Tasks, Timeline, Docs)
6. **Deep Work integration**: Personal/Client task filter on Deep Work page
7. **Component reuse**: 80%+ reuse of existing SISO components

---

## 🗄️ Database Migration Required

### Current Schema (`clients` table - exists)
```typescript
interface ClientData {
  id: string;
  full_name: string;
  email: string | null;
  business_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  status: string;
  progress?: string | null;
  current_step: number;
  total_steps: number;
  completed_steps: string[];
  created_at: string;
  updated_at: string;
  website_url?: string | null;
  professional_role?: string | null;
  bio?: string | null;
  project_name?: string | null;
  company_niche?: string | null;
  development_url?: string | null;
  mvp_build_status?: string | null;
  notion_plan_url?: string | null;
  payment_status?: string | null;
  estimated_price?: number | null;
  initial_contact_date?: string | null;
  start_date?: string | null;
  estimated_completion_date?: string | null;
  todos?: TodoItem[];
  next_steps?: string | null;
  key_research?: string | null;
  priority?: string | null;
  contact_name?: string | null;
  company_name?: string | null;
}
```

### PRD Schema (What We Need - Phase 1)
```typescript
interface Client {
  id: string;
  user_id: string; // RLS

  // Basic Info
  name: string; // Maps to business_name or full_name
  type: string | null; // NEW: Restaurant, Agency, Crypto App, etc.
  status: string; // UPDATED: potential, onboarding, active, completed, archived

  // Project Details
  brief: string | null; // NEW: Client brief/description
  budget: number | null; // Maps to estimated_price
  deadline: Date | null; // Maps to estimated_completion_date
  total_value: number | null; // Same as estimated_price

  // Onboarding Progress (JSONB)
  onboarding_progress: {
    initial_contact: boolean;
    talked_to: boolean;
    proposal_created: boolean;
    quote_given: boolean;
    mvp_created: boolean;
    deposit_collected: boolean;
    project_live: boolean;
  };

  // Metadata
  created_at: Date;
  updated_at: Date;
}
```

### Migration Steps
1. **Add new columns** to existing `clients` table:
   - `type TEXT` (client type)
   - `brief TEXT` (client brief)
   - `onboarding_progress JSONB` (checklist)
   - Rename/map: `business_name` → `name` (or keep both)

2. **Update status values** to match: `potential`, `onboarding`, `active`, `completed`, `archived`

3. **Create `client_types` table**:
```sql
CREATE TABLE client_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT UNIQUE NOT NULL,
  is_system BOOLEAN DEFAULT false,
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

4. **Create `client_tasks` table** (new - for Deep Work integration):
```sql
CREATE TABLE client_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium',
  due_date TIMESTAMPTZ,

  subtasks JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_client_tasks_client ON client_tasks(client_id);
CREATE INDEX idx_client_tasks_user ON client_tasks(user_id, completed);
```

5. **Add RLS policies** for all tables

---

## 🎨 Component Reuse Map

### ✅ KEEP & REUSE (DO NOT DELETE)

| Component | Location | Use For |
|-----------|----------|---------|
| **BottomNavigation** | `/ecosystem/internal/tasks/ui/BottomNavigation.tsx` | Client detail page tabs |
| **TaskCard** | `/ecosystem/internal/tasks/components/TaskCard.tsx` | Client tasks display |
| **Table (shadcn)** | `/shared/ui/table.tsx` | Airtable-style table |
| **Badge** | `/shared/ui/badge.tsx` | Status, type, priority badges |
| **Button** | `/shared/ui/button.tsx` | All CTAs |
| **Dialog** | `/shared/ui/dialog.tsx` | Add/Edit client modals |
| **Checkbox** | `/shared/ui/checkbox.tsx` | Onboarding checklist |
| **Select** | `/shared/ui/select.tsx` | Type dropdown, filters |
| **Input** | `/shared/ui/input.tsx` | Forms, search |

### 🔄 REFACTOR (SIMPLIFY EXISTING)

| Component | Location | What to Change |
|-----------|----------|----------------|
| **AdminClientsView** | `/admin/clients/AdminClientsView.tsx` | Simplify: remove DashboardStats, PriorityListing. Make header compact |
| **ClientCard** | `/admin/clients/ClientCard.tsx` | Simplify to show only: name, status badge, type, total value |
| **AirtableClientsTable** | `/admin/clients/AirtableClientsTable.tsx` | Keep but simplify columns to: Name, Type, Status, Total Value, Updated |
| **ClientsCardGrid** | `/admin/clients/ClientsCardGrid.tsx` | Keep for mobile view |

### ❌ DELETE (TOO COMPLEX / NOT NEEDED)

| Component | Reason |
|-----------|--------|
| **DashboardStats** | Replace with inline compact stats |
| **PriorityListing** | Not in PRD, adds complexity |
| **ColumnCustomizationModal** | Phase 1 doesn't need this |
| **SavedViewsManager** | Phase 1 doesn't need this |
| **BulkActionsBar** | Phase 1 doesn't need this |
| **ImportExportTools** | Phase 1 doesn't need this |
| **ViewOptionsMenu** | Too complex for Phase 1 |
| **ColumnManager** | Not needed yet |

### 🆕 CREATE NEW

| Component | Location | Purpose |
|-----------|----------|---------|
| **ClientDetailPage** | `/admin/clients/pages/ClientDetailPage.tsx` | Individual client page with bottom nav |
| **OverviewTab** | `/admin/clients/tabs/OverviewTab.tsx` | Client brief, budget, deadline, onboarding |
| **TasksTab** | `/admin/clients/tabs/TasksTab.tsx` | Reuses TaskCard for client tasks |
| **OnboardingChecklist** | `/admin/clients/components/OnboardingChecklist.tsx` | 7-step progress tracker |
| **ClientTypeSelect** | `/admin/clients/components/ClientTypeSelect.tsx` | Type dropdown with predefined + custom |
| **TaskFilterSelector** | `/tasks/components/TaskFilterSelector.tsx` | Personal/Client toggle for Deep Work |
| **CompactStats** | `/admin/clients/components/CompactStats.tsx` | One-line stats display |

---

## 📐 Wireframe Reference

### Main Clients Page (Desktop - Table View)
```
┌──────────────────────────────────────────────────────┐
│ Clients                    Total: 12 | $150,000      │ ← Compact header
├──────────────────────────────────────────────────────┤
│ [🔍 Search]  All • Potential • Active  [📊][📇][+ Add]│ ← Filters & toggle
├──────────────────────────────────────────────────────┤
│ Name       │ Type       │ Status    │ Value │ Updated│
├──────────────────────────────────────────────────────┤
│ UberCrypt  │ Crypto App │ 🟢 Active │ $50K  │ Oct 15 │
│ Tasty Bites│ Restaurant │ 🟡 Onboard│ $12K  │ Oct 10 │
└──────────────────────────────────────────────────────┘
```

### Main Clients Page (Mobile - Card View)
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
│ ┌─────────────────────┐ │
│ │ 🟡 Tasty Bites      │ │
│ │ Restaurant          │ │
│ │ $12,000             │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

### Individual Client Page
```
┌──────────────────────────────┐
│ ← UberCrypt         [⋮ Menu] │
├──────────────────────────────┤
│ Client Brief                 │
│ ┌──────────────────────────┐ │
│ │ Building a crypto...     │ │
│ │ [Edit]                   │ │
│ └──────────────────────────┘ │
│                              │
│ Budget: $50,000              │
│ Deadline: Dec 31, 2025       │
│ Type: Crypto App             │
│                              │
│ Onboarding Progress          │
│ ✅ Initial contact           │
│ ✅ Talked to                 │
│ ⬜ Proposal created          │
│ ⬜ Quote given               │
├──────────────────────────────┤
│ 📊 Overview  ✅ Tasks  📅 Docs│ ← Bottom nav
└──────────────────────────────┘
```

### Deep Work Integration
```
┌──────────────────────────────┐
│ Deep Focus Work Rules        │
│ 1. No context switching      │
│ 2. Single task focus         │
├──────────────────────────────┤
│ [All] [Personal] [Client]    │ ← NEW FILTER
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │ ⬜ Build auth flow       │ │
│ │ 🏢 UberCrypt  🔴 High    │ │ ← Client badge
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ ⬜ Review SISO dashboard │ │
│ │ 📱 Personal  🟡 Medium   │ │ ← Personal badge
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

---

## 🚀 Implementation Plan - Phase 1

### Step 1: Database Setup
**Files to create/modify**:
- `supabase/migrations/YYYYMMDDHHMMSS_refactor_clients_schema.sql`

**Tasks**:
1. Add columns to `clients`: `type`, `brief`, `onboarding_progress` (JSONB)
2. Create `client_types` table with system defaults
3. Create `client_tasks` table
4. Add RLS policies
5. Update `status` values to match PRD (potential, onboarding, active, completed, archived)

**SQL Migration**:
```sql
-- Add new columns
ALTER TABLE clients ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS brief TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS onboarding_progress JSONB DEFAULT '{"initial_contact": false, "talked_to": false, "proposal_created": false, "quote_given": false, "mvp_created": false, "deposit_collected": false, "project_live": false}';

-- Create client_types table
CREATE TABLE IF NOT EXISTS client_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT UNIQUE NOT NULL,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert system defaults
INSERT INTO client_types (name, is_system) VALUES
  ('Restaurant', true),
  ('Agency', true),
  ('Crypto App', true),
  ('E-commerce', true),
  ('SaaS', true),
  ('Other', true)
ON CONFLICT (name) DO NOTHING;

-- Create client_tasks table
CREATE TABLE IF NOT EXISTS client_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  subtasks JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_client_tasks_client ON client_tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_client_tasks_user ON client_tasks(user_id, completed);

-- RLS for client_tasks
ALTER TABLE client_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own client tasks"
  ON client_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own client tasks"
  ON client_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own client tasks"
  ON client_tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own client tasks"
  ON client_tasks FOR DELETE
  USING (auth.uid() = user_id);
```

### Step 2: Update TypeScript Types
**File**: `/src/types/client.types.ts`

**Tasks**:
1. Add `ClientTask` interface
2. Add `ClientType` interface
3. Update `ClientData` interface with new fields
4. Add status type: `type ClientStatus = 'potential' | 'onboarding' | 'active' | 'completed' | 'archived'`

**Updated Types**:
```typescript
export type ClientStatus = 'potential' | 'onboarding' | 'active' | 'completed' | 'archived';

export interface OnboardingProgress {
  initial_contact: boolean;
  talked_to: boolean;
  proposal_created: boolean;
  quote_given: boolean;
  mvp_created: boolean;
  deposit_collected: boolean;
  project_live: boolean;
}

export interface ClientType {
  id: string;
  user_id: string | null;
  name: string;
  is_system: boolean;
  created_at: string;
}

export interface ClientTask {
  id: string;
  user_id: string;
  client_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  subtasks: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

// Update existing ClientData interface
export interface ClientData {
  // ... existing fields ...

  // NEW FIELDS
  type: string | null;
  brief: string | null;
  onboarding_progress: OnboardingProgress;
}
```

### Step 3: Simplify Main Clients Page
**File**: `/src/ecosystem/internal/admin/clients/AdminClientsView.tsx`

**Tasks**:
1. **Remove**: `<DashboardStats />`, `<PriorityListing />`
2. **Replace with**: Inline compact stats component
3. **Simplify**: ClientsHeader to show only essential controls
4. **Keep**: Table/Card view toggle, search, status filters

**New structure**:
```tsx
export function AdminClientsView({ isAdmin }: AdminClientsViewProps) {
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [searchQuery, setSearchQuery] = useState("");

  const { clients = [], isLoading, refetch } = useClientsList({
    searchQuery,
    statusFilter,
    sortColumn: 'updated_at',
    sortDirection: 'desc',
  });

  const totalClients = clients.length;
  const totalValue = clients.reduce((acc, c) => acc + (c.estimated_price || 0), 0);

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-4">
          {/* Compact Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Clients</h1>
              <p className="text-sm text-gray-400">
                {totalClients} clients · ${totalValue.toLocaleString()} total value
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}>
                {viewMode === 'table' ? '📇' : '📊'}
              </Button>
              <Button onClick={() => {/* Open add client modal */}}>
                + Add Client
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <div className="flex gap-1">
              {(['all', 'potential', 'onboarding', 'active', 'completed', 'archived'] as const).map(status => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(status)}
                  size="sm"
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="bg-gray-900 rounded-lg border border-gray-800">
            {viewMode === "table" ? (
              <AirtableClientsTable clients={clients} isLoading={isLoading} />
            ) : (
              <ClientsCardGrid clients={clients} isLoading={isLoading} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Step 4: Refactor ClientCard (Mobile)
**File**: `/src/ecosystem/internal/admin/clients/ClientCard.tsx`

**Tasks**:
1. Simplify to show: Client name, Status badge, Type badge, Total value
2. Remove: Invite dialog, progress bar, other complex UI
3. Add: `onClick` to navigate to client detail page

**Simplified version**:
```tsx
export function ClientCard({ client, onClick }: ClientCardProps) {
  return (
    <div
      className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:bg-gray-750 transition cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-white">{client.business_name || client.full_name}</h3>
          {client.type && (
            <Badge variant="outline" className="mt-1 text-xs">
              {client.type}
            </Badge>
          )}
        </div>
        <ClientStatusBadge status={client.status} />
      </div>

      {client.estimated_price && (
        <p className="text-sm text-gray-400 mt-2">
          ${client.estimated_price.toLocaleString()}
        </p>
      )}
    </div>
  );
}
```

### Step 5: Refactor AirtableClientsTable (Desktop)
**File**: `/src/ecosystem/internal/admin/clients/AirtableClientsTable.tsx`

**Tasks**:
1. Simplify columns to: Name, Type, Status, Total Value, Updated
2. Remove: Complex column customization, draggable headers
3. Keep: Sorting, basic filtering
4. Add: Click row to navigate to client detail

**Simplified columns**:
```tsx
const columns = [
  { key: 'name', label: 'Name', width: 200 },
  { key: 'type', label: 'Type', width: 150 },
  { key: 'status', label: 'Status', width: 120 },
  { key: 'total_value', label: 'Value', width: 120 },
  { key: 'updated_at', label: 'Updated', width: 150 },
];
```

### Step 6: Create Client Detail Page
**File**: `/src/ecosystem/internal/admin/clients/pages/ClientDetailPage.tsx`

**Tasks**:
1. Create page with bottom navigation (reuse BottomNavigation component)
2. Setup tabs: Overview, Tasks (Phase 1), Timeline & Docs (Phase 2)
3. Add routing: `/admin/dash/clients/:id`

**Structure**:
```tsx
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { BottomNavigation } from '@/ecosystem/internal/tasks/ui/BottomNavigation';
import { OverviewTab } from '../tabs/OverviewTab';
import { TasksTab } from '../tabs/TasksTab';

type Tab = 'overview' | 'tasks' | 'timeline' | 'docs';

export function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const { client, isLoading } = useClient(clientId);

  if (isLoading) return <div>Loading...</div>;
  if (!client) return <div>Client not found</div>;

  return (
    <div className="min-h-screen bg-black pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={() => window.history.back()}>
            ←
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{client.business_name || client.full_name}</h1>
            <ClientStatusBadge status={client.status} />
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab client={client} />}
        {activeTab === 'tasks' && <TasksTab clientId={clientId} />}
        {activeTab === 'timeline' && <div>Timeline (Phase 2)</div>}
        {activeTab === 'docs' && <div>Docs (Phase 2)</div>}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        tabs={[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'tasks', label: 'Tasks', icon: '✅' },
          { id: 'timeline', label: 'Timeline', icon: '📅' },
          { id: 'docs', label: 'Docs', icon: '📄' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}
```

### Step 7: Create Overview Tab
**File**: `/src/ecosystem/internal/admin/clients/tabs/OverviewTab.tsx`

**Tasks**:
1. Display client brief (editable)
2. Show budget, deadline, type
3. Onboarding checklist (7 steps, interactive)

**Component**:
```tsx
export function OverviewTab({ client }: { client: ClientData }) {
  const [isEditingBrief, setIsEditingBrief] = useState(false);
  const [brief, setBrief] = useState(client.brief || '');

  return (
    <div className="space-y-6">
      {/* Client Brief */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-white">Client Brief</h2>
          <Button size="sm" onClick={() => setIsEditingBrief(!isEditingBrief)}>
            {isEditingBrief ? 'Save' : 'Edit'}
          </Button>
        </div>
        {isEditingBrief ? (
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            className="w-full h-32 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
          />
        ) : (
          <p className="text-gray-300">{brief || 'No brief yet'}</p>
        )}
      </div>

      {/* Project Details */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-400">Budget</label>
          <p className="text-white font-semibold">
            ${client.estimated_price?.toLocaleString() || 'TBD'}
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-400">Deadline</label>
          <p className="text-white font-semibold">
            {client.estimated_completion_date ? format(new Date(client.estimated_completion_date), 'MMM dd, yyyy') : 'TBD'}
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-400">Type</label>
          <p className="text-white font-semibold">{client.type || 'Not set'}</p>
        </div>
      </div>

      {/* Onboarding Checklist */}
      <OnboardingChecklist
        progress={client.onboarding_progress}
        clientId={client.id}
      />
    </div>
  );
}
```

### Step 8: Create OnboardingChecklist Component
**File**: `/src/ecosystem/internal/admin/clients/components/OnboardingChecklist.tsx`

**Tasks**:
1. Display 7 onboarding steps
2. Allow toggling completion
3. Save to database on change

**Component**:
```tsx
export function OnboardingChecklist({ progress, clientId }: Props) {
  const steps = [
    { key: 'initial_contact', label: 'Initial contact' },
    { key: 'talked_to', label: 'Talked to' },
    { key: 'proposal_created', label: 'Proposal created' },
    { key: 'quote_given', label: 'Quote given' },
    { key: 'mvp_created', label: 'MVP created' },
    { key: 'deposit_collected', label: 'Deposit collected' },
    { key: 'project_live', label: 'Project live' },
  ];

  const handleToggle = async (key: string) => {
    const newProgress = { ...progress, [key]: !progress[key] };
    await updateClientOnboarding(clientId, newProgress);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-3">Onboarding Progress</h3>
      <div className="space-y-2">
        {steps.map((step) => (
          <div key={step.key} className="flex items-center gap-2">
            <Checkbox
              checked={progress[step.key]}
              onCheckedChange={() => handleToggle(step.key)}
            />
            <label className="text-gray-300">{step.label}</label>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Step 9: Create Tasks Tab
**File**: `/src/ecosystem/internal/admin/clients/tabs/TasksTab.tsx`

**Tasks**:
1. Fetch client tasks
2. Reuse TaskCard component
3. Add task creation

**Component**:
```tsx
export function TasksTab({ clientId }: { clientId: string }) {
  const { tasks, isLoading } = useClientTasks(clientId);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Client Tasks</h2>
        <Button onClick={() => {/* Open add task modal */}}>
          + Add Task
        </Button>
      </div>

      <div className="space-y-3">
        {tasks?.map((task) => (
          <TaskCard
            key={task.id}
            name={task.title}
            description={task.description}
            priority={task.priority}
            completed={task.completed}
            dueDate={task.due_date}
            subtasks={task.subtasks}
          />
        ))}
      </div>
    </div>
  );
}
```

### Step 10: Deep Work Integration
**File**: `/src/ecosystem/internal/tasks/components/TaskFilterSelector.tsx` (NEW)

**Tasks**:
1. Create filter selector: [All] [Personal] [Client]
2. Update useTasks hook to filter by client_id
3. Add client badge to TaskCard when task has client_id

**Filter Selector**:
```tsx
export function TaskFilterSelector({ value, onChange }: Props) {
  const filters = ['all', 'personal', 'client'] as const;

  return (
    <div className="flex gap-2 p-1 bg-gray-800 rounded-lg w-fit">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onChange(filter)}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition",
            value === filter
              ? "bg-blue-500 text-white"
              : "text-gray-400 hover:text-white"
          )}
        >
          {filter.charAt(0).toUpperCase() + filter.slice(1)}
        </button>
      ))}
    </div>
  );
}
```

**Update Deep Work page** (`/ecosystem/internal/tasks/pages/DeepWorkPage.tsx`):
```tsx
export function DeepWorkPage() {
  const [taskFilter, setTaskFilter] = useState<'all' | 'personal' | 'client'>('all');

  return (
    <div>
      <h1>Deep Focus Work Rules</h1>
      <p>1. No context switching</p>
      <p>2. Single task focus</p>

      {/* NEW: Task Filter */}
      <TaskFilterSelector value={taskFilter} onChange={setTaskFilter} />

      {/* Tasks filtered by selection */}
      <TaskList filter={taskFilter} />
    </div>
  );
}
```

---

## 🎯 Acceptance Criteria

### Phase 1 Must Complete:
- [ ] Database migration runs successfully
- [ ] Main clients page shows simplified header (compact stats)
- [ ] Table view works on desktop (5 columns: Name, Type, Status, Value, Updated)
- [ ] Card view works on mobile (shows name, type, status, value)
- [ ] Toggle between table/card views
- [ ] Status filters work (All, Potential, Onboarding, Active, Completed, Archived)
- [ ] Search works
- [ ] Click client navigates to detail page
- [ ] Client detail page has bottom navigation (Overview, Tasks tabs)
- [ ] Overview tab shows: brief (editable), budget, deadline, type, onboarding checklist
- [ ] Onboarding checklist is interactive (7 steps, toggle completion)
- [ ] Tasks tab shows client tasks (reuses TaskCard)
- [ ] Can add client tasks
- [ ] Deep Work page has Personal/Client filter
- [ ] Client tasks show in Deep Work when "Client" filter selected
- [ ] Client tasks have 🏢 badge with client name
- [ ] Personal tasks have 📱 badge

### Code Quality:
- [ ] TypeScript strict mode (no `any`)
- [ ] Mobile-first responsive
- [ ] Component reuse > 80%
- [ ] Follows existing SISO patterns
- [ ] All new components documented

---

## 📝 Notes for Codex

**Critical Path**:
1. Start with database migration (test it works)
2. Update TypeScript types
3. Simplify AdminClientsView (remove complex components)
4. Create ClientDetailPage with bottom nav
5. Build OverviewTab + OnboardingChecklist
6. Build TasksTab (reuse TaskCard)
7. Add Deep Work filter integration

**Component Reuse Strategy**:
- Copy BottomNavigation from `/ecosystem/internal/tasks/ui/BottomNavigation.tsx` - adapt tabs
- Copy TaskCard from `/ecosystem/internal/tasks/components/TaskCard.tsx` - use as-is
- Use all shadcn/ui components (Table, Badge, Button, Dialog, etc.)

**What NOT to do**:
- ❌ Don't create complex column customization
- ❌ Don't add bulk operations yet
- ❌ Don't build Timeline/Docs tabs (Phase 2)
- ❌ Don't over-engineer - keep it simple!

**Mobile-First Rules**:
- Bottom nav ONLY shows on mobile (`sm:hidden`)
- Table view switches to card view on mobile
- All interactions must work with touch
- Test on 375px width (iPhone SE)

**Questions?**
- If unclear about any component location, search for it first
- If database schema conflicts arise, prioritize keeping existing data
- If component reuse isn't clear, ask before creating new components

---

**Ready to start implementation? Follow the steps sequentially. Good luck!** 🚀
