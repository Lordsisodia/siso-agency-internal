# Testing Scripts

Integration testing and validation scripts.

## Scripts

### test-glm-connection.ts
Tests GLM (General Language Model) MCP server connectivity.

**Usage:**
```bash
npm run test:glm:connection
# or
npx tsx scripts/testing/test-glm-connection.ts
```

**Purpose:** Verifies that the GLM MCP server is accessible and responding correctly.

**What it tests:**
- MCP server connection
- Codec functionality
- Request/response flow
- Error handling

### validate-supabase-sync.ts
Validates Supabase sync configuration and data integrity for offline functionality.

**Usage:**
```bash
npm run validate:sync
# or
npx tsx scripts/testing/validate-supabase-sync.ts
```

**Purpose:** Ensures the offline sync system is correctly configured and operational.

**What it validates:**
- Sync configuration files
- Database schema compatibility
- RLS (Row Level Security) policies
- Conflict resolution setup
- Data integrity constraints

**Related Commands:**
```bash
npm run validate         # Full validation (typecheck + sync)
npm run test:sync        # Run sync service tests
```

## When to Use

### Before Deployments
Run these scripts before deploying to ensure:
- MCP integrations are working
- Sync system is properly configured
- No configuration issues exist

### After Changes
Run after making changes to:
- MCP server configuration
- Sync-related code
- Database schema
- RLS policies

### Troubleshooting
Use these scripts when:
- MCP connections are failing
- Sync is not working properly
- Data inconsistencies occur
- Configuration issues suspected
