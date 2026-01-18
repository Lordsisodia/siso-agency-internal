# Database Migrations

Database schema and data migration scripts for SISO Internal.

## Structure

```
migrations/
├── apply-nightly-checkout-migration.ts    # Main migration runner
├── setup-public-user.js                   # Public user setup script
├── sql/                                   # SQL migration files
│   ├── add_nightly_checkout_metrics.sql  # Add nightly checkout metrics table
│   └── create-public-user.sql             # Create public user role
└── docs/                                  # Migration documentation
    ├── MIGRATION-SUMMARY.md               # Overall migration summary
    ├── QUICK-REFERENCE.md                 # Quick command reference
    └── README-NIGHTLY-CHECKOUT-MIGRATION.md  # Nightly checkout migration guide
```

## Migrations

### Nightly Checkout Migration

**Files:**
- `apply-nightly-checkout-migration.ts` - Main migration script
- `sql/add_nightly_checkout_metrics.sql` - SQL schema changes
- `docs/README-NIGHTLY-CHECKOUT-MIGRATION.md` - Detailed guide

**Usage:**
```bash
npx tsx scripts/migrations/apply-nightly-checkout-migration.ts
```

**What it does:**
- Adds nightly checkout metrics tracking
- Creates necessary database tables and indexes
- Migrates existing data to new schema

### Public User Setup

**Files:**
- `setup-public-user.js` - Setup script
- `sql/create-public-user.sql` - SQL for public user role

**Usage:**
```bash
node scripts/migrations/setup-public-user.js
# or manually apply the SQL:
psql -f scripts/migrations/sql/create-public-user.sql
```

**What it does:**
- Creates a public user role for unauthenticated access
- Sets up appropriate RLS (Row Level Security) policies

## Running Migrations

### Automatic Migration
```bash
# Run the nightly checkout migration
npx tsx scripts/migrations/apply-nightly-checkout-migration.ts

# Setup public user
node scripts/migrations/setup-public-user.js
```

### Manual SQL Execution
```bash
# Apply SQL files directly
psql -d your_database -f scripts/migrations/sql/add_nightly_checkout_metrics.sql
psql -d your_database -f scripts/migrations/sql/create-public-user.sql
```

## Documentation

See the `docs/` folder for detailed migration information:
- **QUICK-REFERENCE.md** - Quick command reference for common tasks
- **MIGRATION-SUMMARY.md** - Summary of all migrations and their purpose
- **README-NIGHTLY-CHECKOUT-MIGRATION.md** - Detailed guide for nightly checkout feature

## Adding New Migrations

1. Create a new migration script in this directory
2. Add any SQL files to `sql/`
3. Document the migration in `docs/` or create a new README
4. Update this README with the new migration information

## Best Practices

- Always test migrations on a staging database first
- Backup your database before running migrations
- Keep migration scripts idempotent (safe to run multiple times)
- Document any breaking changes in the migration docs
- Use transaction blocks in SQL migrations for atomicity
