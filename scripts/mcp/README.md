# MCP Integration Scripts

Tools for testing and validating Model Context Protocol (MCP) server integrations.

## Scripts

### check-codecs.mjs
Validates MCP codec configurations.

**Usage:**
```bash
npm run check:mcp
# or
node scripts/mcp/check-codecs.mjs
```

**Purpose:** Ensures MCP server codecs are properly configured and functional.

### test-integration.js / test-integration.mjs
Tests MCP server integration.

**Usage:**
```bash
node scripts/mcp/test-integration.js
# or
node scripts/mcp/test-integration.mjs
```

**Purpose:** Validates end-to-end MCP server connectivity and functionality.

## Related Documentation

- See `.docs/04-integrations/02-mcp/` for MCP integration documentation
- See `src/services/mcp/` for MCP service implementation
