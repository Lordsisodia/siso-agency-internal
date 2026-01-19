# Deep Dive: Claude Code Autonomous Frameworks

**What They Actually Do and How They Work**

---

## 1. Claude-Flow 🥈

### **What Is It?**
Claude-Flow is an **operating system for AI agents** - a multi-agent orchestration platform that transforms Claude Code into a collaborative AI system where 54+ specialized agents work together in coordinated swarms.

### **What It Actually Does**

When you run Claude-Flow, here's what happens:

1. **You give a command** → "Build a REST API with user authentication"

2. **The Router analyzes your request** using Q-Learning and Mixture of Experts (MoE) to decide:
   - How complex is this? (Simple/Medium/Complex)
   - Which agents are needed?
   - What's the best approach?

3. **Swarm coordination kicks in**:
   - A **Queen agent** creates a strategic plan
   - **Worker agents** are assigned specific sub-tasks
   - Agents use **consensus algorithms** (Raft, Byzantine) to agree on decisions
   - They work in **parallel** (10-20x faster than sequential)

4. **Agents execute their roles**:
   - `coder` agent writes the code
   - `tester` agent creates tests
   - `reviewer` agent checks quality
   - `security` agent scans for vulnerabilities
   - `architect` agent ensures good design

5. **Learning happens automatically**:
   - Successful patterns are stored in **ReasoningBank** (SQLite)
   - **SONA** (Self-Optimizing Neural Architecture) adapts routing in <0.05ms
   - Next time, the system works better because it learned

### **How It Works Technically**

**Language:** TypeScript/Node.js

**Architecture Flow:**
```
Your Command
    ↓
Claude-Flow Router (Q-Learning + MoE)
    ↓
Swarm Coordinator (Queen → Workers)
    ↓
Agent Execution (54+ specialized agents)
    ↓
Memory System (AgentDB + ReasoningBank)
    ↓
LLM Provider (Claude/OpenAI/Gemini/Local)
    ↓
Learning Loop (SONA + EWC++)
```

**Key Files:**
- `v3/@claude-flow/cli/bin/cli.js` - Entry point
- `v3/@claude-flow/router/` - Q-Learning router
- `v3/@claude-flow/swarm/` - Swarm coordination
- `v3/@claude-flow/agents/` - Agent definitions

**Integration with Claude Code:**
- Runs as an **MCP server** (Model Context Protocol)
- Claude Code connects to it like: `claude mcp add claude-flow -- npx -y claude-flow@v3alpha mcp start`
- Once connected, all 175+ tools are available in Claude Code sessions

### **How It Enables 24/7 Operation**

**Background Daemon:**
```bash
npx claude-flow@v3alpha daemon start
```

This starts 12 **auto-triggered workers** that run continuously:
- **map worker** (every 5 min) - Maps codebase structure
- **audit worker** (every 10 min) - Security scanning
- **optimize worker** (every 15 min) - Performance optimization
- **memory worker** (every 20 min) - Memory management
- **consolidate worker** (every 30 min) - Memory consolidation
- **testgaps worker** (every 20 min) - Test coverage analysis

**Self-Healing:**
- Fault-tolerant consensus (Byzantine - survives up to 1/3 bad agents)
- Drift control (prevents agents from going off-task)
- Regular checkpoints (saves state for recovery)
- Auto-retry with exponential backoff

**Persistence:**
- SQLite database with WAL (Write-Ahead Logging)
- Cross-session memory via AgentDB
- LRU cache for fast pattern lookup
- Survives crashes and restarts

### **API Key Configuration**

**Environment Variables:**
```bash
export ANTHROPIC_API_KEY="sk-ant-..."  # For Claude models
export OPENAI_API_KEY="sk-..."          # For GPT models
export GOOGLE_API_KEY="..."             # For Gemini
```

**Or in Claude Desktop config:**
```json
{
  "mcpServers": {
    "claude-flow": {
      "command": "npx",
      "args": ["claude-flow@v3alpha", "mcp", "start"],
      "env": {
        "ANTHROPIC_API_KEY": "sk-ant-...",
        "OPENAI_API_KEY": "sk-..."
      }
    }
  }
}
```

**GLM Support:**
- Can be added as a custom provider
- Not built-in but architecture supports it
- Would need to add GLM client to provider layer

### **What Happens When It Runs (Example)**

```bash
npx claude-flow@v3alpha swarm "Implement user authentication" --claude
```

**Step 1:** Router analyzes complexity → "Medium complexity"
**Step 2:** Queen agent creates plan → "Need coder, security, tester agents"
**Step 3:** Workers spawn in parallel:
   - Coder agent: Creates JWT authentication system
   - Security agent: Adds OWASP protections
   - Tester agent: Writes unit tests
**Step 4:** Agents share progress via collective memory
**Step 5:** Consensus algorithm validates all work
**Step 6:** Router consolidates results
**Step 7:** SONA learns from successful patterns
**Step 8:** Results returned to you

**Time:** ~5-10 seconds (vs 30+ seconds sequentially)

**Why It's Fast:**
- Agent Booster (WASM) handles simple tasks in <1ms
- Haiku/Sonnet for medium tasks (~500ms)
- Opus + Swarm for complex tasks (2-5s)
- Parallel execution = 10-20x speedup

---

## 2. Sleepless Agent 🥉

### **What Is It?**
Sleepless Agent is a **24/7 AI daemon** that transforms your Claude Code Pro subscription into an autonomous "AgentOS" that processes tasks while you sleep. It's like having a night-shift AI worker that maximizes your Claude Code investment.

### **What It Actually Does**

When Sleepless Agent runs, here's what happens:

1. **You submit a task via Slack** → `/think Implement a user dashboard`

2. **The system creates an isolated workspace:**
   ```
   workspace/tasks/42_user_dashboard/
   ├── README.md           # Task description
   ├── main.py             # Code it writes
   ├── test_main.py        # Tests it creates
   └── .git/               # Git operations
   ```

3. **Three agents process your task sequentially:**

   **Phase 1: Planner Agent** (max 10 turns)
   - Analyzes: "User dashboard with charts and filters"
   - Creates plan:
     ```markdown
     # Task 42: User Dashboard

     ## Plan
     1. Set up Flask application
     2. Create dashboard route
     3. Add chart components
     4. Implement filter controls
     5. Add authentication
     6. Write tests
     ```

   **Phase 2: Worker Agent** (max 30 turns)
   - Executes the plan
   - Writes actual code
   - Updates README with TODO items
   - Uses tools like `run_tests`, `install_deps`

   **Phase 3: Evaluator Agent** (max 10 turns)
   - Reviews the completed work
   - Checks all TODO items are done
   - Identifies issues
   - Provides recommendations

4. **Git automation happens automatically:**
   - Commits changes with message: "feat: implement user dashboard (task #42)"
   - Creates branch: `feature/task-42-user-dashboard`
   - Optionally creates PR via `gh` CLI

5. **Result saved to database** for later review

### **How It Works Technically**

**Language:** Python 3.11+

**Main Loop:**
```python
while self.running:
    # 1. Check if we should pause (cost optimization)
    if not below_threshold():
        await asyncio.sleep(60)
        continue

    # 2. Get next task from queue
    task = get_next_task()

    # 3. Execute with 3-agent workflow
    await execute_three_phase_task(task)

    # 4. Auto-generate more tasks if queue is low
    if len(queue) < 5:
        auto_generate_tasks()
```

**Key Components:**

1. **Task Queue** (SQLite)
   - Tables: tasks, task_logs, usage_logs
   - Columns: id, description, priority, status, phase
   - Supports priorities: THOUGHT > SERIOUS > GENERATED

2. **Claude Code Executor**
   - Uses Claude Code Python Agent SDK
   - Runs commands: `claude --agent planner --max-turns 10`
   - Captures output and updates TODO

3. **Slack Bot**
   - Commands: `/think`, `/chat`, `/check`, `/usage`, `/cancel`
   - Real-time status updates in Slack threads
   - Interactive chat mode

4. **Smart Scheduler**
   - Tracks API usage before each task
   - Stops at thresholds (95% day, 96% night)
   - Time-based budgeting (10% day, 90% night)

### **How It Enables 24/7 Operation**

**Daemon Setup:**

**Linux (systemd):**
```bash
# Installation creates service file
sudo systemctl enable sleepless-agent
sudo systemctl start sleepless-agent
# Starts on boot automatically
```

**macOS (launchd):**
```bash
# Launchd plist file
sleepless-agent service install
# Runs in background as user agent
```

**What Keeps It Alive:**

1. **AsyncIO Event Loop** - Non-blocking operation
2. **Signal Handling** - Graceful shutdown on SIGTERM/SIGINT
3. **Health Checks** - Monitors Claude Code CLI availability
4. **Auto-Retry** - Failed tasks automatically requeued
5. **Watchdog Timer** - If process crashes, service restarts it

**Cost Optimization (The "Sleepless" Magic):**

```python
# From scheduler.py
def get_threshold():
    hour = datetime.now().hour
    if 1 <= hour <= 9:  # Nighttime (cheaper)
        return 96  # Can use 96% of quota
    else:             # Daytime (expensive)
        return 95  # Only use 95% of quota
```

**Why This Works:**
- Claude Code Pro has hourly usage limits
- Nighttime (1am-9am UTC) has higher limits
- Sleepless Agent maximizes nighttime usage
- Stops before hitting limits (avoids overage charges)

**Auto-Task Generation:**

When usage is low AND queue is empty:
```python
# Generates tasks based on recent work
def auto_generate_tasks():
    recent_projects = get_recent_workspaces()

    for project in recent_projects:
        # refine_focused (45%): Improve existing
        # balanced (35%): Mix of new and old
        # new_friendly (20%): Create new projects

        task = Task(
            description=f"Refine {project} based on latest patterns",
            priority=SERIOUS,
            strategy="refine_focused"
        )
        queue.add(task)
```

This creates a **self-sustaining loop**:
- Process tasks → Generate more tasks → Process tasks → ...

### **API Key Configuration**

**No API keys needed!** It uses:
- Your **Claude Code Pro** subscription (built-in)
- **Slack Bot Token** and **App Token** for integration

**Environment Variables:**
```bash
export SLACK_BOT_TOKEN="xoxb-..."     # From Slack app
export SLACK_APP_TOKEN="xapp-..."     # For Socket Mode
```

**Claude Code Authentication:**
- Uses your existing `claude` CLI
- Leverages your Pro subscription
- No separate API costs (within your plan limits)

### **What Happens When It Runs (Full Example)**

**You send:** `/think Add unit tests for the authentication module`

**Timeline:**

```
08:00 UTC - Task submitted to queue
08:01 UTC - Scheduler picks task (below threshold)
08:02 UTC - Planner phase starts:
          - Analyzes codebase
          - Finds auth/ directory
          - Creates plan: 5 test files needed
08:15 UTC - Planner phase complete (10 turns)
08:16 UTC - Worker phase starts:
          - Creates test_auth.py
          - Adds test cases
          - Runs pytest
          - Updates TODO items
08:35 UTC - Worker phase complete (25 turns)
08:36 UTC - Evaluator phase starts:
          - Reviews test coverage
          - Checks edge cases
          - Suggests improvements
08:42 UTC - Evaluator phase complete (8 turns)
08:43 UTC - Git automation:
          - git add test_auth.py
          - git commit "test: add auth unit tests"
          - git push
08:44 UTC - Task marked COMPLETED
08:45 UTC - Usage logged: 43 turns, 0.23 API cost
08:46 UTC - Queue checked → auto-generates 2 more tasks
```

**Result:** You wake up to completed unit tests, properly committed, with quality review - all while you slept!

---

## 3. LLM Autonomous Agent Plugin 🥇

### **What Is It?**
This is a **Claude Code plugin** that adds autonomous self-learning agents directly into Claude Code. Unlike the others (separate systems), this is a **plugin you install inside Claude Code** that extends its functionality.

### **What It Actually Does**

When installed, Claude Code gets new superpowers:

1. **35 specialized agents** organized into 4 groups:
   - **Group 1 (Brain)**: 8 strategic analysis agents
   - **Group 2 (Council)**: 2 decision-making agents
   - **Group 3 (Hand)**: 14 execution agents
   - **Group 4 (Guardian)**: 7 validation agents

2. **Real-time dashboard** showing:
   - Agent performance metrics
   - Token usage and optimization
   - Learning progress
   - System health

3. **40+ linters** that automatically check:
   - Python: pylint, flake8, mypy, bandit
   - JavaScript: eslint, prettier
   - Security: OWASP Top 10 coverage
   - And 30+ more across languages

4. **Pattern learning system**:
   - Remembers what worked (94% accuracy)
   - Predicts best skills (92% accuracy)
   - Gets smarter with each task (35% improvement per 10 similar tasks)

### **How It Works Technically**

**Language:** Python (plugin) + JavaScript (dashboard)

**Architecture:**

```
Claude Code CLI
    ↓
Plugin System (.claude-plugin/)
    ↓
LLM Autonomous Agent Plugin
    ├─ AgentLoader.py (loads agents)
    ├─ agents/
    │   ├─ strategic/ (Group 1)
    │   ├─ decision/ (Group 2)
    │   ├─ execution/ (Group 3)
    │   └─ validation/ (Group 4)
    ├─ skills/ (24 knowledge packages)
    └─ dashboard/ (Flask web server)
```

**Integration with Claude Code:**

**Installation:**
```bash
claude plugin install https://github.com/bejranonda/LLM-Autonomous-Agent-Plugin-for-Claude
```

**This creates:**
```
.claude-plugin/
├── agents/
│   ├── orchestrator.md
│   ├── code-analyzer.md
│   └── ...
├── skills/
│   ├── python.yaml
│   ├── react.yaml
│   └── ...
└── config.json
```

**Usage in Claude Code:**
```bash
claude  # Starts Claude Code normally
# Now you have slash commands available:

/analyze:project              # Strategic agents analyze
/dev:pr-review                # Execution agents review
/dev:model-switch             # Switch between Claude/GLM
/learning:stats              # View learning progress
```

### **How GLM API Support Works**

This is where it shines for your use case!

**GLM Client (`GLMClient.py`):**
```python
class GLMClient:
    """Drop-in replacement for Anthropic SDK"""

    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
        self.models = ["glm-4.7", "glm-4-plus", "glm-4-air", "glm-4-flash"]

    def chat(self, messages, model="glm-4.7"):
        # Works exactly like Anthropic SDK
        # Messages format: [{"role": "user", "content": "..."}]
        response = requests.post(self.base_url, {
            "model": model,
            "messages": messages,
            "stream": True
        }, headers={"Authorization": f"Bearer {self.api_key}"})
        return response
```

**Configuration:**
```bash
# .env file
ANTHROPIC_API_KEY=sk-ant-...     # For Claude
GLM_API_KEY=your-glm-key-here    # For GLM (Zhipu AI)
```

**Model Switching:**
```bash
# Use Claude
/dev:model-switch claude-sonnet-4.5

# Use GLM (much cheaper!)
/dev:model-switch glm-4.7

# Use GLM Flash (fastest!)
/dev:model-switch glm-4-flash
```

**Can It Use Both Simultaneously?**
Yes! The system has:
- **Cross-model analytics** - Compares performance
- **Unified interface** - Same agents work with both
- **Cost optimization** - Automatically picks cheaper option when quality allows

### **How It Enables 24/7 Operation**

**Daemon Mode:**
```python
# Background task manager
from background import BackgroundTaskManager

manager = BackgroundTaskManager()

@manager.task
def continuous_learning():
    """Runs continuously, learning from tasks"""
    while True:
        analyze_recent_tasks()
        update_patterns()
        optimize_skill_selection()
        sleep(300)  # Every 5 minutes

@manager.task
def health_monitor():
    """Monitors system health"""
    while True:
        check_agent_performance()
        alert_if_degraded()
        sleep(60)  # Every minute
```

**State Persistence:**
```
.claude-unified/
├── parameters.json           # All project data
├── patterns.json              # Learned patterns
├── metrics.json               # Performance metrics
├── quality_history.json      # Quality over time
└── backups/                  # Last 10 versions
    ├── parameters.2025-01-18.json
    └── ...
```

**Across Sessions:**
- Patterns learned in session A are available in session B
- Quality tracking persists indefinitely
- Agent performance tracked forever
- Automatic backups every 10 changes

### **What Happens When It Runs (Full Example)**

**Installation:**
```bash
# 1. Install plugin
claude plugin install bejranonda/LLM-Autonomous-Agent-Plugin-for-Claude

# 2. Configure API keys
echo "GLM_API_KEY=your-key" > ~/.claude/.env

# 3. Start Claude Code
claude

# 4. Switch to GLM (for cost savings)
/dev:model-switch glm-4-flash

# 5. Give it a task
Build a REST API with user authentication
```

**What Happens Behind Scenes:**

**Step 1: Task Analysis** (Group 1 - Brain)
- 8 strategic agents analyze your request
- Orchestrator agent coordinates them
- Decision agents create action plan:
  ```
  Plan:
  1. Set up Flask application structure
  2. Implement JWT authentication
  3. Create user endpoints
  4. Add database models
  5. Write tests
  6. Add documentation
  ```

**Step 2: Pattern Matching** (Learning System)
- System searches learned patterns (94% accuracy)
- Finds similar successful projects (92% match)
- Predicts best skill combination (92% accuracy)
- Selects: python, flask, sqlalchemy, pytest skills

**Step 3: Execution** (Group 3 - Hand)
- 14 execution agents work in parallel:
  - `coder` agent writes code
  - `tester` agent creates tests
  - `linter` agent checks quality
  - `security` agent scans for vulnerabilities
  - `documenter` agent writes README

**Step 4: Validation** (Group 4 - Guardian)
- 7 validation agents review output:
  - Quality controller checks code quality
  - Performance analyzer identifies bottlenecks
  - Security validator ensures OWASP compliance
  - Document validator checks completeness

**Step 5: Learning** (Continuous)
- Success patterns stored (for next time)
- Agent performance tracked
- Skill effectiveness recorded
- Cross-project knowledge transferred

**Result:**
- ✅ Complete REST API with auth
- ✅ 90% test coverage
- ✅ OWASP-compliant security
- ✅ Comprehensive documentation
- ✅ All linting passed
- ✅ System learned from this (next time will be 35% faster)

### **Key Advantages for Your Use Case**

**1. GLM Support Out of the Box**
- No configuration needed
- Just set `GLM_API_KEY` environment variable
- `/dev:model-switch glm-4-flash` and you're saving money

**2. Runs Inside Claude Code**
- No separate daemon needed
- Uses Claude Code's existing infrastructure
- Works with `claude` CLI directly

**3. Self-Contained**
- Everything in `.claude-plugin/` directory
- Easy to install/uninstall
- Portable across projects

**4. Real-Time Dashboard**
```bash
# Start dashboard
npm run dashboard

# Visit http://localhost:3000
# See:
# - Which agents are working
# - Token usage (and cost optimization)
# - Learning progress
# - System health
```

**5. Learning Gets Better Over Time**
- First time: Might make mistakes
- Tenth time: 35% faster and more accurate
- 100th time: Optimized patterns, near-perfect results

---

## Summary Comparison

| Feature | Claude-Flow | Sleepless Agent | LLM Plugin |
|---------|-------------|----------------|------------|
| **What is it?** | Orchestration platform | 24/7 daemon | Claude Code plugin |
| **Installation** | `npm install` | `pip install` | `claude plugin install` |
| **Integration** | MCP server | Slack + Claude Code | Built into Claude Code |
| **Agents** | 54+ | 3 (planner/worker/evaluator) | 35 (4 groups) |
| **Learning** | SONA + EWC++ | Basic learning | Advanced pattern learning |
| **GLM Support** | Configurable | ❌ No | ✅ Built-in |
| **24/7 Operation** | Daemon with workers | Daemon with auto-tasks | Background tasks |
| **Best For** | Complex multi-agent projects | Maximizing Claude Pro investment | Easy GLM integration |

**For Your Specific Use Case (Claude Code + GLM API + 24/7):**

🥇 **LLM Plugin** - Best GLM support, runs inside Claude Code, easiest setup
🥈 **Claude-Flow** - Most powerful, but more complex
🥉 **Sleepless Agent** - Best if you want Slack integration and cost optimization

---

**Sources:**
- [Claude-Flow GitHub Repository](https://github.com/ruvnet/claude-flow)
- [Sleepless Agent GitHub Repository](https://github.com/context-machine-lab/sleepless-agent)
- [LLM Autonomous Agent Plugin](https://github.com/bejranonda/LLM-Autonomous-Agent-Plugin-for-Claude)
