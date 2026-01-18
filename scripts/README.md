# Scripts

Active automation scripts and utilities for SISO Internal development.

## Structure

### Active Scripts (Root Level)

#### **ai-session-snapshot.sh**
Creates snapshots of the current state before AI agent sessions.
- Used by: `npm run ai:snapshot`, `npm run ai:protect`
- Purpose: Protect working state before autonomous AI operations

#### **generate-docs-index.cjs**
Generates documentation index for AI consumption.
- Used by: `npm run docs:index`, `npm run docs:validate`
- Output: `.docs/index.json`
- Purpose: Index all documentation for AI agent context

#### **test-glm-connection.ts**
Tests GLM MCP server connectivity.
- Used by: `npm run test:glm:connection`
- Purpose: Verify MCP server integration

#### **validate-supabase-sync.ts**
Validates Supabase sync configuration and data integrity.
- Used by: `npm run validate:sync`
- Purpose: Ensure offline sync system is correctly configured

### `/mcp`
MCP (Model Context Protocol) server integration tools.
- **check-codecs.mjs** - MCP codec validation (used by `npm run check:mcp`)
- **test-integration.js** - MCP integration testing
- **test-integration.mjs** - MCP integration testing (ESM version)

### `/migrations`
Database migration scripts.
- **apply-nightly-checkout-migration.ts** - Nightly checkout feature migration
- **create-public-user.sql** - Public user setup
- **QUICK-REFERENCE.md** - Migration command reference
- **MIGRATION-SUMMARY.md** - Migration documentation
- **README-NIGHTLY-CHECKOUT-MIGRATION.md** - Nightly checkout migration guide

### Archive Location

Historical scripts have been moved to **`.archive/`** at the project root (not in `scripts/`).

The `.archive/` directory contains:
- **analysis/** - Code analysis tools (duplicate detection, import checking)
- **migration/** - One-time code migration scripts
- **fixes/** - Import path fixes and transformations
- **verification/** - Build and health check scripts
- **maintenance/** - Bug fix scripts
- **testing/** - Ad-hoc testing utilities
- **database/** - Old database debugging scripts
- **utilities/** - General utility scripts
- **setup/** - Setup scripts
- **utils/** - Duplicate of utilities folder
- **test-tools/** - Testing tools
- **deployment/** - Deployment triggers and markers
- **obsolete-root/** - Obsolete root-level scripts

**Note:** Archive contents are historical artifacts from codebase consolidation (Oct 2025) and should not be used in current development.

## Usage

### Active Scripts

Use via npm scripts from `package.json`:

```bash
# AI Session Management
npm run ai:snapshot              # Create AI session snapshot
npm run ai:protect               # Snapshot + confirm safe to proceed

# Documentation
npm run docs:index               # Generate documentation index
npm run docs:validate            # Generate and validate index

# Testing
npm run test:glm:connection      # Test GLM MCP connection

# Validation
npm run validate:sync            # Validate Supabase sync
npm run validate                 # Full validation (typecheck + sync)
npm run check:mcp                # Check MCP codecs
```

### Direct Script Execution

```bash
# Generate documentation index
node scripts/generate-docs-index.cjs

# Test GLM connection
npx tsx scripts/test-glm-connection.ts

# Validate sync configuration
npx tsx scripts/validate-supabase-sync.ts

# Create AI session snapshot
bash scripts/ai-session-snapshot.sh

# Check MCP codecs
node scripts/mcp/check-codecs.mjs
```

### Database Migrations

```bash
# Apply nightly checkout migration
npx tsx scripts/migrations/apply-nightly-checkout-migration.ts
```

## Adding New Scripts

1. Place active scripts in the root `scripts/` directory
2. Create subdirectories for organized groups (e.g., `scripts/mcp/`)
3. Add npm script references to `package.json` if they need to be run via npm
4. Update this README with documentation

## Archive Policy

Scripts are moved to `/archive` when they:
- Are one-time migration scripts that have been executed
- Are analysis tools specific to a completed refactoring
- Fix specific bugs that are no longer relevant
- Have been superseded by newer implementations
- Are ad-hoc utilities not part of regular development workflow

Archive scripts are kept for historical reference but should not be used in current development.
