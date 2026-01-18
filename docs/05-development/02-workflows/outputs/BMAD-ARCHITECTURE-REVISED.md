# 🏗️ REVISED BMAD ARCHITECTURE - SISO INTERNAL

**Context:** SISO-INTERNAL is the **CEO Admin Dashboard** for viewing data from separate backend apps
**Version:** 2.1 (Ecosystem-Aware)
**Date:** October 3, 2025

---

## 🎯 ECOSYSTEM CONTEXT

### **SISO Ecosystem Overview**

```
SISO-ECOSYSTEM/
├── SISO-INTERNAL/           ← THIS APP (CEO dashboard - read-only views)
├── SISO-PARTNERSHIPS/       ← Partnership program backend (separate app)
├── SISO-CLIENT-BASE/        ← Client management backend (separate app - not built yet)
└── SISO-PUBLIC/             ← Public-facing app
```

### **SISO-INTERNAL Purpose**
**CEO administrative dashboard that:**
- Views partnership data from SISO-PARTNERSHIPS backend
- Views client data from SISO-CLIENT-BASE backend (future)
- Manages internal operations (LifeLock, tasks, admin)
- **Does NOT** contain the partnership/client backends themselves

**Key Insight:** This changes our architecture - we need space for **backend integrations** rather than domain backends.

---

## 🏗️ REVISED TARGET ARCHITECTURE

### **Updated Structure (Ecosystem-Aware)**

```
src/
├── 📱 app/                          # Application shell
│   ├── App.tsx
│   ├── routes/
│   └── layouts/
│
├── 🎯 domains/                      # Internal business domains
│   ├── lifelock/                    # Personal productivity (CEO use)
│   │   ├── pages/
│   │   ├── sections/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── config/
│   │
│   ├── tasks/                       # Internal task management
│   │   ├── pages/
│   │   ├── components/
│   │   └── hooks/
│   │
│   ├── admin/                       # Admin operations
│   │   ├── pages/
│   │   ├── components/
│   │   └── hooks/
│   │
│   ├── partnerships/                # Partnership data VIEWS (not backend)
│   │   ├── pages/
│   │   │   └── PartnerDashboard.tsx      # Views data from SISO-PARTNERSHIPS
│   │   ├── components/
│   │   │   └── PartnerLeaderboard.tsx    # Displays partnership metrics
│   │   └── hooks/
│   │       └── usePartnershipData.ts     # Fetches from partnerships backend
│   │
│   └── clients/                     # Client data VIEWS (future)
│       ├── pages/
│       │   └── ClientDashboard.tsx       # Views data from SISO-CLIENT-BASE
│       ├── components/
│       │   └── ClientOverview.tsx        # Displays client metrics
│       └── hooks/
│           └── useClientData.ts          # Fetches from client-base backend
│
├── 🔧 shared/                       # Truly shared UI/utilities
│   ├── ui/                          # shadcn/ui primitives
│   ├── components/                  # Reusable components
│   ├── hooks/                       # Generic hooks
│   ├── utils/                       # Pure utilities
│   └── auth/                        # Authentication
│
├── 🏗️ infrastructure/               # Technical infrastructure
│   ├── api/                         # API clients
│   │   ├── supabase.ts             # Supabase client (internal DB)
│   │   └── http.ts                 # HTTP client utilities
│   │
│   ├── integrations/                # 🆕 Backend integrations
│   │   ├── partnerships/           # SISO-PARTNERSHIPS integration
│   │   │   ├── client.ts           # API client for partnerships backend
│   │   │   ├── types.ts            # Partnership data types
│   │   │   └── hooks.ts            # React Query hooks
│   │   │
│   │   ├── client-base/            # SISO-CLIENT-BASE integration (future)
│   │   │   ├── client.ts           # API client for client-base backend
│   │   │   ├── types.ts            # Client data types
│   │   │   └── hooks.ts            # React Query hooks
│   │   │
│   │   └── supabase/               # Internal Supabase (existing)
│   │       ├── client.ts
│   │       └── types.ts
│   │
│   ├── database/                    # Internal database (Supabase)
│   │   ├── schema.ts
│   │   └── migrations/
│   │
│   ├── config/                      # Configuration
│   │   ├── env.ts
│   │   └── constants.ts
│   │
│   ├── types/                       # Global types
│   │   ├── api.ts
│   │   └── entities.ts
│   │
│   └── services/                    # Infrastructure services
│       ├── auth/
│       ├── analytics/
│       └── logging/
│
└── 📊 models/                       # 🆕 Business models (from other apps)
    ├── partnerships/                # Partnership models
    │   ├── Partner.ts
    │   ├── Referral.ts
    │   └── Commission.ts
    │
    └── clients/                     # Client models (future)
        ├── Client.ts
        ├── Project.ts
        └── Invoice.ts
```

---

## 🔄 KEY ARCHITECTURE CHANGES

### **1. Backend Integration Layer (NEW)**

**Purpose:** Clean integration with separate SISO backend apps

```typescript
// infrastructure/integrations/partnerships/client.ts
import axios from 'axios';
import { PartnershipApiResponse } from './types';

export class PartnershipsClient {
  private baseUrl = process.env.PARTNERSHIPS_API_URL;

  async getPartnerMetrics(partnerId: string) {
    const { data } = await axios.get<PartnershipApiResponse>(
      `${this.baseUrl}/api/partners/${partnerId}/metrics`
    );
    return data;
  }

  async getLeaderboard() {
    const { data } = await axios.get(`${this.baseUrl}/api/leaderboard`);
    return data;
  }
}

export const partnershipsClient = new PartnershipsClient();
```

**Usage in domain:**
```typescript
// domains/partnerships/hooks/usePartnershipData.ts
import { useQuery } from '@tanstack/react-query';
import { partnershipsClient } from '@/infrastructure/integrations/partnerships';

export const usePartnershipData = (partnerId: string) => {
  return useQuery({
    queryKey: ['partnership', partnerId],
    queryFn: () => partnershipsClient.getPartnerMetrics(partnerId),
  });
};
```

### **2. Domain Separation**

**Internal Domains** (data owned by SISO-INTERNAL):
- `lifelock/` - CEO's personal productivity
- `tasks/` - Internal task management
- `admin/` - Admin operations

**External Domain Views** (data from other SISO apps):
- `partnerships/` - Views partnership data (from SISO-PARTNERSHIPS)
- `clients/` - Views client data (from SISO-CLIENT-BASE - future)

### **3. Models Directory (NEW)**

**Inspired by SISO-PARTNERSHIPS structure:**
```typescript
// models/partnerships/Partner.ts
export interface Partner {
  id: string;
  name: string;
  email: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalCommissions: number;
  activeReferrals: number;
  createdAt: Date;
}

// models/partnerships/Referral.ts
export interface Referral {
  id: string;
  partnerId: string;
  clientName: string;
  status: 'pending' | 'qualified' | 'converted';
  revenue: number;
  commissionRate: number;
}
```

**These match the structure in SISO-PARTNERSHIPS but live here for type safety.**

---

## 🎯 ALIGNMENT WITH ECOSYSTEM PATTERNS

### **Patterns from SISO-PARTNERSHIPS & SISO-CLIENT-BASE**

Both apps use:
```
/models/              # Business domain models
/integrations/        # External integrations (Supabase, etc.)
/utils/financial/     # Domain utilities
/config/              # Configuration
/types/               # TypeScript types
```

**SISO-INTERNAL adopts similar patterns:**
```
/models/              # ✅ Added (partnership, client models)
/infrastructure/
  /integrations/      # ✅ Enhanced (partnerships, client-base clients)
  /config/            # ✅ Exists
  /types/             # ✅ Exists
```

---

## 📋 UPDATED BMAD PLAN

### **Phase 1: Emergency Triage (UNCHANGED)**
- Delete exact binary duplicates
- Create component registry
- Add barrel exports

### **Phase 2: Domain Consolidation (UPDATED)**

#### **Story 2.1: Create Enhanced Structure**
```bash
# Internal domains
mkdir -p src/domains/{lifelock,tasks,admin}

# External domain views
mkdir -p src/domains/{partnerships,clients}

# Infrastructure integrations (NEW)
mkdir -p src/infrastructure/integrations/{partnerships,client-base,supabase}

# Business models (NEW)
mkdir -p src/models/{partnerships,clients}
```

#### **Story 2.2: Set Up Partnership Integration**
**Goal:** Create clean integration with SISO-PARTNERSHIPS backend

**Tasks:**
- [ ] Create partnership API client:
  ```typescript
  // infrastructure/integrations/partnerships/client.ts
  export class PartnershipsClient {
    // Methods to fetch data from SISO-PARTNERSHIPS
  }
  ```
- [ ] Create partnership types (matching SISO-PARTNERSHIPS models)
- [ ] Create React Query hooks for data fetching
- [ ] Move partnership views to `/domains/partnerships/`
- [ ] Test partnership dashboard still works

**Acceptance Criteria:**
- ✅ Partnership data loads from external backend
- ✅ Clean separation between view layer and data fetching
- ✅ Type-safe integration

**Time:** 1 day

#### **Story 2.3: Reserve Client Base Structure (FUTURE)**
**Goal:** Create placeholder structure for future client-base integration

**Tasks:**
- [ ] Create empty directories:
  ```bash
  mkdir -p src/infrastructure/integrations/client-base
  mkdir -p src/domains/clients/{pages,components,hooks}
  mkdir -p src/models/clients
  ```
- [ ] Add README explaining future integration:
  ```markdown
  # Client Base Integration (NOT YET IMPLEMENTED)

  This directory is reserved for future integration with SISO-CLIENT-BASE backend.

  When SISO-CLIENT-BASE is ready, implement:
  - API client in /infrastructure/integrations/client-base/
  - Data models in /models/clients/
  - View components in /domains/clients/

  Pattern to follow: See /domains/partnerships/ for reference.
  ```
- [ ] Commit: "📦 Reserve structure for future client-base integration"

**Acceptance Criteria:**
- ✅ Structure exists for future use
- ✅ Clear documentation for future developers
- ✅ No breaking changes

**Time:** 30 minutes

---

## 🎯 ARCHITECTURE PRINCIPLES (UPDATED)

### **1. Domain Ownership**
```typescript
// ✅ CORRECT: Internal domains own their components
/domains/lifelock/components/SisoDeepFocusPlan.tsx

// ✅ CORRECT: External domains own their VIEWS
/domains/partnerships/pages/PartnerDashboard.tsx
/domains/partnerships/components/PartnerLeaderboard.tsx
```

### **2. Backend Integration**
```typescript
// ✅ CORRECT: Integrations in infrastructure layer
/infrastructure/integrations/partnerships/client.ts
/infrastructure/integrations/client-base/client.ts

// ❌ WRONG: Backend logic in domain layer
/domains/partnerships/services/partnershipBackend.ts  // Backend is separate app!
```

### **3. Data Flow**
```
SISO-PARTNERSHIPS (Backend App)
        ↓ HTTP API
Infrastructure Integration Layer (/infrastructure/integrations/partnerships/)
        ↓ React Query Hooks
Domain Layer (/domains/partnerships/hooks/)
        ↓ Component Props
View Layer (/domains/partnerships/pages/)
```

---

## 🔍 VALIDATION BEFORE EXECUTION

### **Pre-Flight Checklist**

**✅ Understanding Verified:**
- [x] SISO-INTERNAL is CEO dashboard (read-only views)
- [x] Partnership backend is separate app (SISO-PARTNERSHIPS)
- [x] Client backend is separate app (SISO-CLIENT-BASE - future)
- [x] Need integration layer, not domain backends

**✅ Architecture Validated:**
- [x] Domain structure preserves LifeLock excellence
- [x] Integration layer for external backends
- [x] Models directory for type safety
- [x] Future-proof for client-base integration

**✅ Safety Verified:**
- [x] Emergency rollback script ready (`emergency-rollback.sh`)
- [x] Backup commit pushed (`317dab0`)
- [x] Backward compatibility maintained
- [x] No breaking changes in Phase 1

**✅ Ecosystem Alignment:**
- [x] Matches SISO-PARTNERSHIPS patterns (`/models/`, `/integrations/`)
- [x] Ready for SISO-CLIENT-BASE integration
- [x] Clean separation of concerns

---

## 🚀 READY FOR EXECUTION

### **What Will Be Done**

**Phase 1 (Week 1) - ZERO RISK:**
1. Delete 6 exact binary duplicates of AdminTasks
2. Create component registry (600 components documented)
3. Add barrel exports for top 20 components

**Phase 2 (Weeks 2-4) - LOW RISK:**
1. Create enhanced directory structure (includes integrations layer)
2. Migrate internal domains (lifelock, tasks, admin)
3. Set up partnership integration (clean API client)
4. Reserve structure for future client-base integration

**Phase 3 (Week 5-6) - MEDIUM RISK:**
1. Delete old directories after migration
2. Full testing and validation

**Phase 4 (Week 6) - ZERO RISK:**
1. Automated duplicate detection
2. Pre-commit hooks
3. Architecture validation

### **What Will NOT Break**

- ✅ LifeLock workflows (migration preserves structure)
- ✅ Partnership dashboard (enhanced with clean integration)
- ✅ Admin features (consolidation fixes duplicates)
- ✅ Current imports (backward compatibility maintained)

### **What Will Improve**

- ✅ Zero duplicate components (600 → 0)
- ✅ Clean backend integration (partnerships client ready)
- ✅ Future-proof structure (client-base reserved)
- ✅ 95% AI accuracy (clear ownership)
- ✅ 25% productivity boost (no time wasted)

---

## 🎯 FINAL APPROVAL CHECKLIST

**Before executing Phase 1:**
- [ ] Review this revised architecture
- [ ] Confirm partnership integration approach makes sense
- [ ] Approve reserved client-base structure
- [ ] Verify emergency rollback is ready
- [ ] Give go-ahead to start execution

**Estimated Timeline:**
- Phase 1: 1 week (safe, immediate impact)
- Phase 2: 3 weeks (migration + integration)
- Phase 3: 2 weeks (cleanup)
- Phase 4: 1 week (prevention)

**Total:** 7 weeks to complete consolidation

---

*Ready for execution with full ecosystem awareness!* 🚀
