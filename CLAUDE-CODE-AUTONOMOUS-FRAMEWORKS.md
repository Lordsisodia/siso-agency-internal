# Claude Code Autonomous Frameworks Research

**Date:** 2026-01-19
**Goal:** Find frameworks that enable Claude Code to run autonomously 24/7 with API keys

---

## Top Frameworks for 24/7 Claude Code Operation

### 1. **Claude-Flow** ⭐ MOST RECOMMENDED

**Repository:** [ruvnet/claude-flow](https://github.com/ruvnet/claude-flow)
**Last Updated:** 3 days ago (Very Active!)
**Stars:** High activity, recent development

**Key Features:**
- 🚀 **MCP Integration** - Runs as MCP server with 175+ tools
- 🤖 **54+ Specialized Agents** - Coding, testing, security, etc.
- 🧠 **Self-Learning** - SONA architecture with <0.05ms adaptation
- 🔄 **Background Daemons** - Auto-triggered workers every 5-30 minutes
- 💾 **Persistent Memory** - Cross-session memory with AgentDB
- 🎯 **Multi-Swarm** - 4 topologies, 5 consensus algorithms

**Setup:**
```bash
# Install
npm install claude-flow@v3alpha

# Initialize
npx claude-flow@v3alpha init

# Start MCP server
npx claude-flow@v3alpha mcp start

# Start background daemon for 24/7 operation
npx claude-flow@v3alpha daemon start
```

**API Keys Required:**
```bash
export ANTHROPIC_API_KEY="sk-ant-..."  # Required for Claude
export OPENAI_API_KEY="sk-..."          # Optional (GPT)
export GOOGLE_API_KEY="..."             # Optional (Gemini)
```

**GLM API Support:** Can be added via custom provider configuration

**Why It's Great for 24/7:**
- Runs scheduled workers automatically (map, audit, optimize, memory, etc.)
- Self-healing with retry mechanisms
- Learns from successful patterns
- Fault-tolerant with consensus protocols

---

### 2. **Sleepless Agent** 💤 OPTIMIZED FOR CONTINUOUS OPERATION

**Repository:** [context-machine-lab/sleepless-agent](https://github.com/context-machine-lab/sleepless-agent)
**Last Updated:** October 26, 2025

**Key Features:**
- ⏰ **24/7 AI Daemon** - Transforms Claude Code Pro into AgentOS
- 💬 **Slack Integration** - Task submission via `/think`, `/chat`, `/check`
- 🎯 **Smart Scheduling** - 95% daytime, 96% nighttime thresholds
- 🔄 **Auto Git** - Commits, branches, PRs automatically
- 📊 **SQLite Task Queue** - Persistent task management
- 🏗️ **Isolated Workspaces** - Parallel processing without conflicts

**Setup:**
```bash
# Install
pip install sleepless-agent

# Initialize
sleepless-agent init

# Configure Slack tokens
export SLACK_BOT_TOKEN="xoxb-..."
export SLACK_APP_TOKEN="xapp-..."

# Run as daemon (Linux)
sudo systemctl enable sleepless-agent
sudo systemctl start sleepless-agent

# Or as Launchd agent (macOS)
sleepless-agent service install
```

**API Keys Required:**
- Claude Code Pro (built-in CLI authentication)
- Slack Bot Token
- Slack App Token

**Cost Optimization:**
- Maximizes Claude Code Pro free tier
- Intelligent threshold management
- Nighttime elevated limits (96%)
- Auto-commits skip review (saves usage)

**Why It's Great for 24/7:**
- Designed specifically for continuous operation
- Time-based threshold optimization
- Persistent task queue
- Production-ready service integration

---

### 3. **LLM Autonomous Agent Plugin** 🧪 SELF-LEARNING

**Repository:** [bejranonda/LLM-Autonomous-Agent-Plugin-for-Claude](https://github.com/bejranonda/LLM-Autonomous-Agent-Plugin-for-Claude)
**Last Updated:** October 23, 2025

**Key Features:**
- 🧠 **Automatic Learning** - Self-improving over time
- 📊 **Real-time Dashboard** - Monitor performance live
- 🔍 **40+ Linters** - Code quality checks
- 🛡️ **OWASP Security** - Security scanning
- 🔀 **CodeRabbit PR Integration** - Automated PR reviews
- 🎯 **Plugin Architecture** - Easy to extend

**Setup:**
```bash
# Clone and install
git clone https://github.com/bejranonda/LLM-Autonomous-Agent-Plugin-for-Claude.git
cd LLM-Autonomous-Agent-Plugin-for-Claude
npm install

# Configure API keys in .env
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env
echo "GLM_API_KEY=your-glm-key" >> .env  # GLM support

# Start plugin
npm start
```

**API Keys Required:**
- ANTHROPIC_API_KEY (Claude)
- GLM_API_KEY (supported!)
- Optional: GitHub Token for PR operations

**Why It's Great for 24/7:**
- Self-learning improves over time
- Real-time monitoring
- Extensive code quality checks
- Security-focused

---

### 4. **Continuous Claude v3** 🔄 CONTEXT PERSISTENCE

**Repository:** [parcadei/Continuous-Claude-v3](https://github.com/parcadei/Continuous-Claude-v3)
**Last Updated:** January 8, 2026 (Very Recent!)

**Key Features:**
- 💾 **Context Persistence** - Maintains context across sessions
- 🤖 **Specialized Agents** - Orchestrates multiple agent types
- 🧠 **Continuous Learning** - Improves with each session
- 🔄 **Session Management** - Seamless multi-session operation
- 📊 **Performance Tracking** - Monitor agent effectiveness

**Setup:**
```bash
# Clone
git clone https://github.com/parcadei/Continuous-Claude-v3.git
cd Continuous-Claude-v3

# Install dependencies
npm install

# Configure
cp config.example.json config.json
# Edit config.json with your API keys

# Run
npm run continuous
```

**API Keys Required:**
- Claude API Key
- Optional: GLM, OpenAI, or other provider keys

**Why It's Great for 24/7:**
- Very recently updated (Jan 2026)
- Focus on session continuity
- Persistent context memory

---

### 5. **Auto-Claude** 🚀 MULTI-SESSION

**Repository:** [AndyMik90/Auto-Claude](https://github.com/AndyMik90/Auto-Claude)

**Key Features:**
- 🔄 **Multi-Session** - Runs multiple Claude sessions
- 🔐 **OAuth Setup** - Secure authentication
- 🤖 **Autonomous Operation** - Self-directed coding
- 📊 **Session Management** - Track multiple sessions

**Setup:**
```bash
git clone https://github.com/AndyMik90/Auto-Claude.git
cd Auto-Claude

# Install
npm install

# OAuth configuration required
# Follow repository instructions for OAuth setup
```

**API Keys Required:**
- OAuth credentials (not API keys)
- Claude Code OAuth app

---

### 6. **Cisco IT Claude Agent Framework** 🏢 PRODUCTION-READY

**Repository:** [ciscoittech/claude-agent-framework](https://github.com/ciscoittech/claude-agent-framework)

**Key Features:**
- 👥 **Specialized Agent Team** - 100+ specialized AI agents
- 🔄 **Parallel Processing** - Agents work simultaneously
- 🏢 **Battle-Tested** - Production-proven architecture
- 📊 **15 Workflow Orchestrators** - Complex multi-agent workflows
- 🛠️ **110 Agent Skills** - Comprehensive skill library

**Setup:**
```bash
git clone https://github.com/ciscoittech/claude-agent-framework.git
cd claude-agent-framework

# Install
npm install

# Configure agents
# Extensive configuration system
```

**Why It's Great for 24/7:**
- Battle-tested in production
- Enterprise-grade architecture
- Extensive agent library

---

## Comparison Table

| Framework | 24/7 Support | GLM API | Learning | Daemon | Stars | Last Updated |
|-----------|-------------|---------|----------|--------|-------|--------------|
| **Claude-Flow** | ✅ Excellent | ⚠️ Configurable | ✅ SONA | ✅ Yes | High | 3 days ago |
| **Sleepless Agent** | ✅ Excellent | ❌ No | ✅ Yes | ✅ Yes | Medium | Oct 2025 |
| **LLM Plugin** | ✅ Good | ✅ Yes | ✅ Yes | ⚠️ Manual | Medium | Oct 2025 |
| **Continuous Claude v3** | ✅ Good | ✅ Yes | ✅ Yes | ⚠️ Manual | Low | Jan 2026 |
| **Auto-Claude** | ✅ Good | ❌ No | ⚠️ Basic | ⚠️ Manual | Low | Unknown |
| **Cisco Framework** | ✅ Excellent | ⚠️ Configurable | ✅ Yes | ✅ Yes | Medium | Unknown |

---

## Recommended Setup for Your Use Case

**For 24/7 operation with GLM API:**

### Option 1: Claude-Flow (Most Powerful)
```bash
# Install Claude-Flow
npm install claude-flow@v3alpha

# Add custom GLM provider
# Edit config to add GLM as fallback provider
export GLM_API_KEY="your-glm-key"

# Start everything
npx claude-flow@v3alpha init
npx claude-flow@v3alpha daemon start
```

### Option 2: LLM Plugin (Best GLM Support)
```bash
# Clone and install
git clone https://github.com/bejranonda/LLM-Autonomous-Agent-Plugin-for-Claude.git
cd LLM-Autonomous-Agent-Plugin-for-Claude
npm install

# Configure with GLM
echo "GLM_API_KEY=your-key" > .env
echo "ANTHROPIC_API_KEY=your-claude-key" >> .env

# Run with GLM as primary
npm start --provider glm
```

### Option 3: Sleepless Agent (Most Optimized)
```bash
# Install
pip install sleepless-agent

# Setup Slack integration
sleepless-agent init

# Configure to use GLM for planning
# (Requires modification to support GLM)
```

---

## Resources & Tutorials

### Videos:
1. [How to Make Claude Code Agents Work 24/7 For Free](https://www.youtube.com/watch?v=cWDI4o-Jqyg) - YouTube, 3 weeks ago
2. [Auto Claude: AI Coding on Steroids!](https://www.youtube.com/watch?v=eaNA2oOXoUg) - Features AutoCloud framework
3. [I Forced Claude to Code for 24 Hours NONSTOP](https://www.youtube.com/watch?v=usQ2HBTTWxs)

### Articles:
1. [The Claude Code Revolution: How I Run an Autonomous Agent](https://octospark.ai/blog/the-comprehensive-guide-to-claude-code)
2. [Claude Code CLI: Autonomous Agent Mode](https://medium.com/@nishantsoni.us/claude-code-cli-autonomous-agent-mode-9ccf0e7aab5d)
3. [I Got Tired of Losing Claude Code Hours, So I Automated It](https://www.reddit.com/r/ClaudeAI/comments/1lvnluz/i_got_tired_of_losing_claude_code_hours_so_i/) - Reddit

### Awesome Lists:
- [awesome-claude-code](https://github.com/jqueryscript/awesome-claude-code) - Curated resources
- [awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) - 100+ subagents

---

## Quick Start Recommendation

**For your specific needs (Claude Code + GLM API + 24/7):**

1. **Start with:** [LLM-Autonomous-Agent-Plugin-for-Claude](https://github.com/bejranonda/LLM-Autonomous-Agent-Plugin-for-Claude)
   - Best GLM support out of the box
   - Self-learning capabilities
   - Real-time dashboard

2. **Add:** [Claude-Flow](https://github.com/ruvnet/claude-flow) for advanced features
   - More agents (54+ vs plugin's basic set)
   - Better orchestration
   - MCP integration

3. **Consider:** [Sleepless Agent](https://github.com/context-machine-lab/sleepless-agent) for optimization
   - Best for cost optimization
   - Production-ready daemon
   - Slack integration

---

## Next Steps

1. **Clone the repositories** that interest you
2. **Set up API keys:**
   ```bash
   export ANTHROPIC_API_KEY="sk-ant-..."
   export GLM_API_KEY="your-glm-key"
   ```
3. **Test locally first** before running 24/7
4. **Start with daemon mode** for continuous operation
5. **Monitor usage** to optimize costs

---

**Sources:**
- [Claude-Flow GitHub Repository](https://github.com/ruvnet/claude-flow)
- [Sleepless Agent GitHub Repository](https://github.com/context-machine-lab/sleepless-agent)
- [LLM Autonomous Agent Plugin](https://github.com/bejranonda/LLM-Autonomous-Agent-Plugin-for-Claude)
- [Continuous Claude v3](https://github.com/parcadei/Continuous-Claude-v3)
- [Auto-Claude Multi-Session](https://github.com/AndyMik90/Auto-Claude)
- [Cisco IT Claude Framework](https://github.com/ciscoittech/claude-agent-framework)
- [Awesome Claude Code](https://github.com/jqueryscript/awesome-claude-code)
- [Agents Orchestration](https://github.com/wshobson/agents)
- [How to Make Claude Code Agents Work 24/7 For Free](https://www.youtube.com/watch?v=cWDI4o-Jqyg)
- [The Claude Code Revolution](https://octospark.ai/blog/the-comprehensive-guide-to-claude-code)
