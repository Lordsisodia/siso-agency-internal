# 🚀 Codex MCP Quick Start Guide

## ✅ What's Fixed

1. **Environment variables** now properly configured in `[mcp_servers.zen.env]`
2. **Startup timeouts** increased to 180s for slow-starting servers
3. **All MCPs configured** in global `~/.codex/config.toml`
4. **AGENTS.md created** with project-specific instructions

## 🔧 MCP Status

Run this command to check MCP status:
```bash
codex mcp list
```

You should see:
- ✅ **zen** - Multi-model AI (with all API keys)
- ✅ **clear-thought** - Advanced reasoning
- ✅ **serena** - Code intelligence
- ✅ **filesystem** - File operations
- ✅ **fetch** - Web content fetcher
- ✅ **siso-internal-supabase** - Database operations (project-specific)

## ⏱️ First Startup

**IMPORTANT:** The first time you start Codex after this config change:
- MCPs will take **2-3 minutes** to initialize
- `uvx` needs to download packages
- `npx` needs to install dependencies
- **Don't panic if it seems slow!**

Subsequent startups will be **5-10 seconds**.

## 🧪 Testing MCPs

### Test in Codex TUI
```bash
cd /Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL
codex
```

Then try these commands:
```
/mcp                    # Show available MCP tools
/status                 # Show session config
```

### Test Prompts

**Test Zen MCP:**
```
Use zen to analyze this architectural decision: Should we use SSR or CSR for the dashboard?
```

**Test Supabase MCP:**
```
List all tables in the SISO Internal database using the Supabase MCP
```

**Test Serena MCP:**
```
Use serena to find all React components that use useState hook
```

**Test Filesystem MCP:**
```
List all files in the src/ecosystem/internal/lifelock directory
```

## 🐛 Troubleshooting

### MCPs Still Timing Out?

1. **Check logs:**
   ```bash
   tail -f ~/.codex/log/codex-tui.log
   ```

2. **Test manually:**
   ```bash
   # Test zen
   uvx --from git+https://github.com/BeehiveInnovations/zen-mcp-server.git zen-mcp-server

   # Test supabase
   npx -y @supabase/mcp-server-supabase@latest --project-ref=avdgyrepwrvsvwgxrccr
   ```

3. **Increase timeout further:**
   Edit `~/.codex/config.toml`:
   ```toml
   startup_timeout_ms = 300000  # 5 minutes
   ```

4. **Check internet connection:**
   `uvx` and `npx` need to download packages on first run

### Environment Variables Not Working?

Verify they're set:
```bash
env | grep -E "(GEMINI|OPENROUTER|GROQ|CEREBRAS|SUPABASE)_API_KEY"
```

If missing, restart your terminal or run:
```bash
source ~/.zshrc  # or ~/.bashrc
```

### Supabase MCP Not Working?

Check the access token is valid:
```bash
curl -H "Authorization: Bearer sbp_46f04e75f8bba39917efda341bbf260ac60d3c8d" \
     https://api.supabase.com/v1/projects
```

## 📝 AGENTS.md File

The `AGENTS.md` file tells Codex:
- What MCP tools are available
- When to use each tool
- Project-specific best practices
- Database schema conventions
- Code organization patterns

**Location:** `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/AGENTS.md`

**How it works:**
- Codex automatically reads `AGENTS.md` when you start a session
- Instructions apply to current directory and subdirectories
- You can have multiple `AGENTS.md` files for different features

## 🎯 Best Practices

### Database Operations
```
ALWAYS use Supabase MCP for:
- Listing tables
- Applying migrations
- Executing queries
- Checking advisors
- Generating types
```

### Code Navigation
```
ALWAYS use Serena MCP for:
- Finding symbols
- Refactoring
- Understanding code structure
```

### Complex Reasoning
```
ALWAYS use Zen or Clear-Thought for:
- Architectural decisions
- Multi-step planning
- Code review suggestions
```

## 🔄 Restarting Codex

After config changes:
```bash
# Exit current Codex session (Ctrl+C)
# Restart
codex
```

Or start fresh:
```bash
cd /Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL
codex exec "List all database tables using Supabase MCP"
```

## 📊 Performance Expectations

| MCP Server | First Start | Subsequent Starts | Tools Available |
|------------|-------------|-------------------|-----------------|
| zen | 120-180s | 5-10s | 10+ models |
| clear-thought | 60-120s | 3-5s | Reasoning workflows |
| serena | 60-90s | 5-8s | Code intelligence |
| filesystem | 2-5s | 1-2s | File operations |
| fetch | 2-5s | 1-2s | Web content |
| siso-internal-supabase | 30-60s | 5-10s | Database operations |

## ⚡ Quick Commands

```bash
# Check MCP status
codex mcp list

# Get MCP details
codex mcp get zen
codex mcp get siso-internal-supabase

# Start with specific profile
codex --profile fast

# Override config per session
codex --config 'model="gpt-5"'

# Non-interactive mode
codex exec "your prompt here"

# View logs in real-time
tail -f ~/.codex/log/codex-tui.log
```

## 🎉 You're Ready!

Your Codex is now configured with:
- ✅ Multi-model AI (Zen MCP)
- ✅ Advanced reasoning (Clear-Thought MCP)
- ✅ Code intelligence (Serena MCP)
- ✅ Database operations (Supabase MCP)
- ✅ File system access (Filesystem MCP)
- ✅ Web content fetching (Fetch MCP)
- ✅ Project-specific instructions (AGENTS.md)

Start coding with AI superpowers! 🚀
