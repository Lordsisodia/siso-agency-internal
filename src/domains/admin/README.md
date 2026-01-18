# Admin Domain

Administrative dashboard for managing clients, partners, financials, and settings.

## Structure

```
admin/
├── 1-overview/       # Admin overview and dashboard
│   └── ui/
│       ├── pages/    # Overview pages
│       └── components/ # Dashboard components
├── 2-clients/        # Client management
│   └── ui/
│       ├── pages/    # Client pages
│       ├── components/ # Client components
│       └── hooks/    # Client-specific hooks
├── 3-partners/       # Partner management
│   └── ui/
│       ├── pages/    # Partner pages
│       └── components/ # Partner components
├── 4-financials/     # Financial management
│   └── ui/
│       ├── pages/    # Financial pages
│       └── components/ # Financial components
├── 5-settings/       # Settings and configuration
│   └── ui/
│       ├── pages/    # Settings pages
│       └── components/ # Settings components
├── _shared/          # Cross-cutting pieces
│   ├── ui/
│   │   └── components/ # Shared UI components
│   ├── domain/       # Domain logic and types
│   └── hooks/        # Custom hooks
└── index.ts          # Barrel exports
```

## Flow

1. **Overview** (1-overview): Admin dashboard and analytics overview
2. **Clients** (2-clients): Client relationship management
3. **Partners** (3-partners): Partner and outreach management
4. **Financials** (4-financials): Financial dashboard and expenses
5. **Settings** (5-settings): System configuration and settings

## Key Features

- **Dashboard**: Administrative overview with KPIs
- **Client Management**: Client CRM and relationships
- **Partner Portal**: Partner tracking and management
- **Financial Dashboard**: Revenue, expenses, and analytics
- **Settings**: System configuration and preferences

## Usage

```tsx
import { AdminDashboard, ClientTable, PartnerGrid } from '@/domains/admin';
```
