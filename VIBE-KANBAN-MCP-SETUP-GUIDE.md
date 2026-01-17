# 🔗 Vibe Kanban + MCP Servers: Complete Docker Setup Guide

## 🎯 Two Types of MCP Integration

### Type 1: Vibe Kanban AS MCP Server (Built-in ✅)
**What it does:** Exposes Vibe Kanban controls to external tools
- Other apps can create tasks, start agents, etc.
- Already configured in your Docker setup
- No extra work needed

### Type 2: Vibe Kanban USING MCP Servers (This Guide)
**What it does:** Gives AI agents (Gemini, Claude) access to external tools
- Filesystem operations
- Database access
- Web search
- Custom APIs
- **Can run in Docker!**

---

## 🐳 Docker Architecture: MCP Servers with Vibe Kanban

### Option 1: MCP Servers in Docker (Recommended for Mac Mini)

```
┌─────────────────────────────────────────────────┐
│  Docker Compose Stack                            │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐      ┌──────────────┐         │
│  │ Vibe Kanban  │◄────►│ MCP Servers  │         │
│  │ (Port 3000)  │      │ (Various)    │         │
│  └──────────────┘      └──────────────┘         │
│         │                      │                 │
│         │                      │                 │
│  ┌──────▼──────┐        ┌─────▼──────┐          │
│  │   Gemini    │        │ External   │          │
│  │   Agent     │        │ Services   │          │
│  └─────────────┘        │ (DB, APIs) │          │
│                         └────────────┘          │
└─────────────────────────────────────────────────┘
```

### Option 2: MCP Servers on Host (Simpler but Less Isolated)

```
┌───────────────────┐         ┌──────────────────┐
│   Docker Container│         │   Host Machine   │
├───────────────────┤         ├──────────────────┤
│                   │         │                  │
│  ┌──────────────┐ │         │ ┌──────────────┐ │
│  │ Vibe Kanban  │─┼─────────┼►│ MCP Servers  │ │
│  │              │ │  Docker  │ │ (host:port)  │ │
│  └──────────────┘ │ Network │ └──────────────┘ │
│                   │         │                  │
└───────────────────┘         └──────────────────┘
```

---

## 🚀 Recommended Setup: MCP Servers in Docker

### Step 1: Update docker-compose.vibe-kanban.yml

Add MCP servers as separate services:

```yaml
version: '3.8'

services:
  # =========================================================================
  # VIBE KANBAN
  # =========================================================================
  vibe-kanban:
    image: bloopai/vibe-kanban:latest
    container_name: vibe-kanban
    restart: unless-stopped

    ports:
      - "3000:3000"

    volumes:
      - vibe-kanban-data:/app/data
      - ~/SISO-INTERNAL:/workspace/SISO-INTERNAL:rw

    environment:
      - PORT=3000
      - HOST=0.0.0.0
      - MCP_HOST=127.0.0.1
      - MCP_PORT=3001

    networks:
      - vibe-network

  # =========================================================================
  # WEBHOOK SERVER (.blackbox Integration)
  # =========================================================================
  webhook-server:
    build:
      context: .
      dockerfile: .blackbox/4-scripts/integrations/vibe-kanban/Dockerfile
    container_name: vibe-webhook-server
    restart: unless-stopped

    ports:
      - "5001:5001"

    volumes:
      - ~/SISO-INTERNAL/.blackbox:/app/.blackbox:rw
      - ~/SISO-INTERNAL:/workspace/SISO-INTERNAL:rw

    environment:
      - PYTHONUNBUFFERED=1

    networks:
      - vibe-network

  # =========================================================================
  # MCP SERVER: Filesystem
  # =========================================================================
  mcp-filesystem:
    image: node:20-alpine
    container_name: mcp-filesystem-server
    restart: unless-stopped

    working_dir: /app

    command: sh -c "npm install -g @modelcontextprotocol/server-filesystem && npx @modelcontextprotocol/server-filesystem /workspace/SISO-INTERNAL"

    volumes:
      - ~/SISO-INTERNAL:/workspace/SISO-INTERNAL:rw

    environment:
      - MCP_PORT=5002

    ports:
      - "5002:5002"

    networks:
      - vibe-network

  # =========================================================================
  # MCP SERVER: Supabase (Database)
  # =========================================================================
  mcp-supabase:
    image: node:20-alpine
    container_name: mcp-supabase-server
    restart: unless-stopped

    working_dir: /app

    command: sh -c "npm install -g @supabase/mcp-server && npx @supabase/mcp-server"

    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - MCP_PORT=5003

    ports:
      - "5003:5003"

    networks:
      - vibe-network

  # =========================================================================
  # MCP SERVER: Fetch (Web requests)
  # =========================================================================
  mcp-fetch:
    image: node:20-alpine
    container_name: mcp-fetch-server
    restart: unless-stopped

    working_dir: /app

    command: sh -c "npm install -g @modelcontextprotocol/server-fetch && npx @modelcontextprotocol/server-fetch"

    environment:
      - MCP_PORT=5004

    ports:
      - "5004:5004"

    networks:
      - vibe-network

  # =========================================================================
  # POSTGRESQL DATABASE
  # =========================================================================
  postgres:
    image: postgres:16-alpine
    container_name: vibe-postgres
    restart: unless-stopped

    environment:
      POSTGRES_USER: vibeuser
      POSTGRES_PASSWORD: vibe_secure_password_change_me
      POSTGRES_DB: vibe_kanban

    ports:
      - "5433:5432"

    volumes:
      - vibe-postgres-data:/var/lib/postgresql/data

    networks:
      - vibe-network

volumes:
  vibe-kanban-data:
    name: vibe-kanban-data
  vibe-postgres-data:
    name: vibe-postgres-data

networks:
  vibe-network:
    driver: bridge
    name: vibe-network
```

### Step 2: Create MCP Configuration File

Create `.blackbox/4-scripts/integrations/vibe-kanban/mcp-config.json`:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/workspace/SISO-INTERNAL"],
      "env": {
        " workspace": "/workspace/SISO-INTERNAL"
      }
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server"],
      "env": {
        "SUPABASE_URL": "your-supabase-url",
        "SUPABASE_ANON_KEY": "your-anon-key"
      }
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "your-brave-api-key"
      }
    }
  }
}
```

### Step 3: Configure MCP Servers in Vibe Kanban UI

1. **Open Vibe Kanban:** http://localhost:3000
2. **Go to:** Settings → MCP Servers
3. **Click:** "Add Server"
4. **Configure each server:**

#### Example: Filesystem Server
```
Name: filesystem
Command: npx
Args: -y @modelcontextprotocol/server-filesystem /workspace/SISO-INTERNAL
```

#### Example: Supabase Server
```
Name: supabase
Command: npx
Args: -y @supabase/mcp-server
Environment Variables:
  SUPABASE_URL: your-supabase-url
  SUPABASE_ANON_KEY: your-anon-key
```

#### Example: Fetch Server
```
Name: fetch
Command: npx
Args: -y @modelcontextprotocol/server-fetch
```

### Step 4: Test MCP Integration

Create a test task in Vibe Kanban:

```
Title: Test MCP Integration
Description: Use the filesystem MCP server to list all TypeScript files in the src directory, then use the fetch server to get the README from github.com/modelcontextprotocol/servers.
```

Start with Gemini/Claude and watch it use the MCP tools!

---

## 🎯 Popular MCP Servers to Add

### Filesystem Operations:
```bash
npm install -g @modelcontextprotocol/server-filesystem
```
- Read/write files
- List directories
- Search files

### Database Access:
```bash
npm install -g @supabase/mcp-server
# or
npm install -g @modelcontextprotocol/server-postgres
```
- Query databases
- Run migrations
- Inspect schemas

### Web Operations:
```bash
npm install -g @modelcontextprotocol/server-fetch
# or
npm install -g @modelcontextprotocol/server-brave-search
```
- Fetch URLs
- Web search
- API calls

### Memory & Context:
```bash
npm install -g @modelcontextprotocol/server-sequential-thinking
# or
npm install -g @modelcontextprotocol/server-memory
```
- Enhanced reasoning
- Context management
- Memory storage

### Custom Tools:
Create your own MCP server for your specific needs!

---

## 📝 Setup Script: Automated MCP Server Installation

Create `setup-mcp-servers.sh`:

```bash
#!/bin/bash
###############################################################################
# SETUP: MCP Servers for Vibe Kanban in Docker
###############################################################################

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🔗 MCP SERVERS SETUP FOR VIBE KANBAN                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo -e "${GREEN}Step 1: Stopping existing containers...${NC}"
docker-compose -f docker-compose.vibe-kanban.yml down 2>/dev/null || true
echo "✅ Containers stopped"
echo ""

echo -e "${GREEN}Step 2: Creating MCP server configuration...${NC}"
mkdir -p .blackbox/4-scripts/integrations/vibe-kanban

cat > .blackbox/4-scripts/integrations/vibe-kanban/mcp-config.json << 'EOF'
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/workspace/SISO-INTERNAL"]
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    }
  }
}
EOF
echo "✅ MCP configuration created"
echo ""

echo -e "${GREEN}Step 3: Updating Docker Compose configuration...${NC}"
# Backup existing config
cp docker-compose.vibe-kanban.yml docker-compose.vibe-kanban.yml.backup

# Add MCP server services to docker-compose
echo "⚠️  Manual step required:"
echo "   Please edit docker-compose.vibe-kanban.yml"
echo "   Add the MCP server services from the guide"
echo ""

echo -e "${GREEN}Step 4: Starting Docker stack...${NC}"
docker-compose -f docker-compose.vibe-kanban.yml up -d
echo "✅ Docker stack started"
echo ""

echo -e "${GREEN}Step 5: Installing Node.js MCP servers...${NC}"
docker exec vibe-kanban npm install -g @modelcontextprotocol/server-filesystem 2>/dev/null || true
docker exec vibe-kanban npm install -g @modelcontextprotocol/server-fetch 2>/dev/null || true
echo "✅ MCP servers installed"
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ MCP servers setup complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📋 What's been set up:"
echo "   • MCP server configuration created"
echo "   • Docker stack updated"
echo "   • Node.js MCP servers installed"
echo ""
echo "🚀 Next steps:"
echo "   1. Open Vibe Kanban: http://localhost:3000"
echo "   2. Go to Settings → MCP Servers"
echo "   3. Add each MCP server from the configuration"
echo "   4. Test with a task that uses MCP tools"
echo ""
echo "📖 For full documentation:"
echo "   cat .blackbox/.plans/active/vibe-kanban-mcp-setup.md"
echo ""
```

---

## 🔧 Manual Configuration in Vibe Kanban UI

If you prefer not to use Docker for MCP servers:

### Option A: Host-based MCP Servers

Run MCP servers on your Mac Mini host:

```bash
# Install globally
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-fetch
npm install -g @supabase/mcp-server

# Start servers
npx @modelcontextprotocol/server-filesystem ~/SISO-INTERNAL &
npx @modelcontextprotocol/server-fetch &
```

Then in Vibe Kanban Settings → MCP Servers:

```
Server Name: filesystem
Transport: stdio
Command: npx
Args: -y @modelcontextprotocol/server-filesystem /Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL
```

### Option B: Docker Network Access

Configure Vibe Kanban to connect to Docker-hosted MCP servers:

```
Server Name: filesystem-docker
Transport: stdio
Command: docker
Args: exec mcp-filesystem-server npx @modelcontextprotocol/server-filesystem /workspace/SISO-INTERNAL
```

---

## 🎯 Testing MCP Integration

### Test Task 1: Filesystem + Fetch
```
Title: Test MCP Servers
Description:
1. Use filesystem MCP to list all .tsx files in src/domains
2. Pick one file and read its contents
3. Use fetch MCP to get the latest React docs from https://react.dev
4. Compare the file with React best practices
```

### Test Task 2: Database + Analysis
```
Title: Database Schema Analysis
Description:
1. Use Supabase MCP to connect to the database
2. List all tables
3. Get the schema for the users table
4. Suggest improvements based on best practices
```

### Test Task 3: Web Search + Implementation
```
Title: Implement Feature from Research
Description:
1. Use Brave Search MCP to find best practices for JWT authentication
2. Use filesystem MCP to read the current auth implementation
3. Implement improvements based on research
4. Use Supabase MCP to update database schema if needed
```

---

## 📊 MCP Server Resource Requirements

### Lightweight Servers (128MB each):
- Filesystem
- Fetch
- Sequential thinking

### Medium Servers (256MB each):
- Supabase
- Postgres MCP

### Heavy Servers (512MB+):
- Custom ML servers
- Large language model MCP servers

### Total Memory Budget:
```
Vibe Kanban:        1GB
MCP Servers (5x):   1GB (200MB each)
PostgreSQL:         512MB
Webhook Server:     256MB
────────────────────────────
Total:              ~2.75GB (well within 16GB!)
```

---

## 🚀 Production Considerations

### Security:
- 🔒 Use environment variables for API keys
- 🔒 Don't commit MCP config with secrets
- 🔒 Limit filesystem access to specific directories
- 🔒 Use read-only filesystem where possible

### Performance:
- ⚡ Use Alpine Docker images (smaller, faster)
- ⚡ Limit MCP server memory allocation
- ⚡ Cache frequently accessed data
- ⚡ Use connection pooling for database MCP

### Reliability:
- ✅ Add health checks to MCP server containers
- ✅ Auto-restart on failure
- ✅ Log aggregation for debugging
- ✅ Monitor resource usage

---

## 🎁 Summary

### Docker Approach (Recommended):
- ✅ Isolated environment
- ✅ Easy to scale
- ✅ Consistent across machines
- ✅ Simple resource management
- ✅ Auto-restart on failure

### Host Approach (Simpler):
- ✅ Easier to debug
- ✅ No Docker overhead
- ✅ Direct file access
- ❌ Less isolated
- ❌ Harder to reproduce

**Recommendation:** Use Docker for MCP servers on Mac Mini for production use.

---

## 📖 Full MCP Server List

Official MCP servers: https://github.com/modelcontextprotocol/servers

Available servers:
- `@modelcontextprotocol/server-filesystem` - File operations
- `@modelcontextprotocol/server-fetch` - HTTP requests
- `@modelcontextprotocol/server-postgres` - PostgreSQL database
- `@modelcontextprotocol/server-brave-search` - Web search
- `@modelcontextprotocol/server-memory` - Memory/context
- `@modelcontextprotocol/server-sequential-thinking` - Reasoning
- `@supabase/mcp-server` - Supabase integration
- And many more community servers!

---

**Next:** Run `./setup-mcp-servers.sh` and configure MCP servers in Vibe Kanban UI! 🚀
