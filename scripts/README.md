# Scripts

Active automation scripts and utilities for SISO Internal development.

## Structure

All scripts are organized into categorized folders with individual READMEs.

### `/ai`
AI session management and protection scripts.
- **README.md** - AI session documentation
- **ai-session-snapshot.sh** - Create snapshots before AI sessions

### `/docs`
Documentation generation and indexing scripts.
- **README.md** - Documentation generation guide
- **generate-docs-index.cjs** - Generate .docs/index.json for AI consumption

### `/mcp`
MCP (Model Context Protocol) server integration tools.
- **README.md** - MCP integration documentation
- **check-codecs.mjs** - MCP codec validation
- **test-integration.js** - MCP integration testing
- **test-integration.mjs** - MCP integration testing (ESM version)

### `/migrations`
Database migration scripts and documentation.
- **README.md** - Migrations guide
- **apply-nightly-checkout-migration.ts** - Nightly checkout migration
- **setup-public-user.js** - Public user setup
- **sql/** - SQL migration files
- **docs/** - Migration documentation

### `/testing`
Integration testing and validation scripts.
- **README.md** - Testing documentation
- **test-glm-connection.ts** - GLM MCP connectivity tests
- **validate-supabase-sync.ts** - Sync configuration validation

## Usage

### Via npm Scripts

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
# AI Session Management
bash scripts/ai/ai-session-snapshot.sh

# Documentation
node scripts/docs/generate-docs-index.cjs

# Testing
npx tsx scripts/testing/test-glm-connection.ts
npx tsx scripts/testing/validate-supabase-sync.ts

# MCP
node scripts/mcp/check-codecs.mjs
node scripts/mcp/test-integration.js

# Migrations
npx tsx scripts/migrations/apply-nightly-checkout-migration.ts
node scripts/migrations/setup-public-user.js
```

## Adding New Scripts

1. Create a new folder in `scripts/` for the script category
2. Add a README.md to document the scripts
3. Place scripts in the appropriate folder
4. Add npm script references to `package.json` if needed
5. Update this main README with the new category

## Archive

Historical scripts have been moved to **`.archive/`** at the project root. These are one-time scripts from codebase consolidation (Oct 2025) and should not be used in current development.
