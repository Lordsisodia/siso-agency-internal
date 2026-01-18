# Admin Domain

Administrative interface for managing clients, partners, and business operations.

## Structure

```
admin/
├── clients/          # Client management
│   ├── hooks/       # Client data hooks
│   └── components/  # Client UI components
├── dashboard/       # Admin dashboard
│   ├── components/  # Dashboard widgets
│   └── pages/       # Dashboard pages
├── industries/      # Industry management
├── partners/        # Partner relationships
└── xp-store/        # XP store management
```

## Key Features

- **Client Management**: View and manage client information
- **Dashboard**: Business analytics and metrics
- **Partners**: Partner relationship tracking
- **Industries**: Industry categorization and management

## Usage

```tsx
import { AdminDashboard, ClientTable } from '@/domains/admin';
```
