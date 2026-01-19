# BlackBox5 Code Extraction Plan
## Step-by-Step Guide to Copying Framework Code

**Created**: 2025-01-18
**Purpose**: Systematically extract, copy, and adapt production code from 15 frameworks
**Target**: Make BlackBox5 fully operational with multi-agent infrastructure

---

## 🎯 Extraction Strategy

### Phase 1: Auto-Claude (Most Critical)
**Why**: Multi-agent orchestration, MCP integration, persistent memory
**Time**: 10-14 days
**Value**: ⭐⭐⭐⭐⭐ (cannot build easily yourself)

### Phase 2: CCPM (Integration)
**Why**: GitHub sync, issue tracking (adaptable to Vibe Kanban)
**Time**: 5-7 days
**Value**: ⭐⭐⭐⭐

### Phase 3: Cognee (Memory)
**Why**: Context management (complements Auto-Claude)
**Time**: 3-5 days
**Value**: ⭐⭐⭐⭐

---

## 📋 Extraction Checklist

For each component, we'll:
1. ✅ Locate source code
2. ✅ Understand dependencies
3. ✅ Copy to BlackBox5
4. ✅ Adapt for BlackBox5 architecture
5. ✅ Test functionality
6. ✅ Document integration

---

## Phase 1: Auto-Claude Extraction (Days 1-14)

### Day 1-3: Agent SDK Client

**Source**: `.docs/research/agents/auto-claude/apps/backend/core/client.py`

#### Step 1: Locate and Examine

```bash
# Navigate to source
cd .docs/research/agents/auto-claude/apps/backend/core

# Examine the file
head -100 client.py

# Check size
wc -l client.py

# Check dependencies
grep "^import\|^from" client.py | head -20
```

#### Step 2: Extract Core Components

**What to extract**:
```python
# From client.py, extract these functions:

1. create_client() - Main factory function
2. _get_cached_project_data() - Project index caching
3. load_project_index() - Project scanning
4. detect_project_capabilities() - Capability detection
5. get_tools_for_agent() - Tool permissions
```

#### Step 3: Copy to BlackBox5

```bash
# Create target directory
mkdir -p .blackbox5/engine/core

# Copy the file
cp .docs/research/agents/auto-claude/apps/backend/core/client.py \
   .blackbox5/engine/core/AgentClient.py

# Edit to remove Claude SDK dependencies
# We'll adapt this to use Anthropic API directly
```

#### Step 4: Adapt for BlackBox5

**File**: `.blackbox5/engine/core/AgentClient.py`

**Key changes**:
```python
# REMOVE (Auto-Claude specific):
from claude_agent_sdk import ClaudeSDKClient

# REPLACE WITH:
import anthropic

# ADAPT the create_client function:
def create_client(
    agent_type: str,
    project_dir: Path,
    model: str = "claude-sonnet-4-5-20250929"
) -> 'BlackBox5AgentClient':
    """
    Create agent client (adapted from Auto-Claude)

    Args:
        agent_type: Type of agent (developer, tester, planner, etc.)
        project_dir: Project directory
        model: Model to use

    Returns:
        Configured agent client
    """
    return BlackBox5AgentClient(
        agent_type=agent_type,
        project_dir=project_dir,
        model=model
    )
```

#### Step 5: Test

```bash
# Create test file
cat > .blackbox5/tests/test_agent_client.py << 'EOF'
from pathlib import Path
import sys
sys.path.insert(0, '.blackbox5/engine/core')

from AgentClient import create_client

# Test creating client
client = create_client('developer', Path('.'))

print("✅ Client created")
print(f"Agent type: {client.agent_type}")
print(f"Capabilities: {client.capabilities}")
print(f"Allowed tools: {client.allowed_tools}")
EOF

# Run test
python .blackbox5/tests/test_agent_client.py
```

**Acceptance Criteria**:
- [ ] File copied successfully
- [ ] Dependencies identified
- [ ] Adaptations made (removed Claude SDK)
- [ ] Test passes
- [ ] Client creates without errors

---

### Day 4-6: MCP Integration

**Source**: `.docs/research/agents/auto-claude/apps/backend/core/client.py` (MCP sections)

#### Step 1: Locate MCP Code

```bash
# Search for MCP-related code
cd .docs/research/agents/auto-claude/apps/backend

grep -r "mcp_server" --include="*.py" | head -20

# Find MCP configuration
grep -r "MCP" --include="*.py" -A 5 | head -50
```

#### Step 2: Extract MCP Integration

**Key files to examine**:
```python
# In client.py, look for:
- mcp_servers configuration
- get_mcp_servers_for_project()
- MCP server startup
- Tool discovery from MCP
```

#### Step 3: Copy and Adapt

**File**: `.blackbox5/engine/core/MCPIntegration.py`

```bash
# Create MCP integration file
cat > .blackbox5/engine/core/MCPIntegration.py << 'EOF'
"""
MCP Integration for BlackBox5
Adapted from Auto-Claude's MCP system
"""
import subprocess
import json
from pathlib import Path
from typing import Dict, List, Any

class MCPManager:
    """
    Manage MCP server connections

    Adapted from Auto-Claude's MCP integration.
    Starts MCP servers and discovers their tools.
    """

    def __init__(self, project_dir: Path):
        self.project_dir = project_dir
        self.active_servers = {}

    def discover_mcp_servers(self) -> List[str]:
        """
        Discover available MCP servers

        Returns:
            List of server names
        """
        # Check for MCP servers in common locations
        servers = []

        # Check project-local MCP servers
        mcp_config = self.project_dir / '.mcp.json'
        if mcp_config.exists():
            with open(mcp_config) as f:
                config = json.load(f)
                servers.extend(config.get('servers', {}).keys())

        return servers

    def start_server(self, server_name: str, server_config: dict) -> bool:
        """
        Start an MCP server

        Args:
            server_name: Name of the server
            server_config: Server configuration

        Returns:
            True if started successfully
        """
        command = server_config.get('command', [])
        args = server_config.get('args', [])

        try:
            # Start server process
            process = subprocess.Popen(
                [command] + args,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )

            self.active_servers[server_name] = process
            return True

        except Exception as e:
            print(f"Failed to start MCP server {server_name}: {e}")
            return False

    def get_server_tools(self, server_name: str) -> List[dict]:
        """
        Get available tools from an MCP server

        Args:
            server_name: Name of the server

        Returns:
            List of tool definitions
        """
        # Query MCP server for tools
        # This is simplified - actual implementation uses MCP protocol
        return [
            {
                "name": "read_file",
                "description": "Read a file",
                "inputSchema": {"type": "object", "properties": {"path": {"type": "string"}}}
            },
            {
                "name": "write_file",
                "description": "Write to a file",
                "inputSchema": {"type": "object", "properties": {"path": {"type": "string"}, "content": {"type": "string"}}}
            }
        ]

    def stop_all_servers(self):
        """Stop all active MCP servers"""
        for server_name, process in self.active_servers.items():
            process.terminate()
            process.wait()

        self.active_servers.clear()
EOF
```

#### Step 4: Test MCP Integration

```bash
# Test MCP discovery
python -c "
from pathlib import Path
import sys
sys.path.insert(0, '.blackbox5/engine/core')
from MCPIntegration import MCPManager

mgr = MCPManager(Path('.'))
servers = mgr.discover_mcp_servers()
print(f'Found MCP servers: {servers}')
"
```

**Acceptance Criteria**:
- [ ] MCPManager created
- [ ] Can discover servers
- [ ] Can start/stop servers
- [ ] Can get tool definitions

---

### Day 7-10: Persistent Memory System

**Source**: `.docs/research/agents/auto-claude/apps/backend/integrations/graphiti/`

#### Step 1: Explore Graphiti Memory

```bash
# Navigate to Graphiti code
cd .docs/research/agents/auto-claude/apps/backend/integrations/graphiti

# List files
ls -la

# Examine main files
head -50 queries_pkg/graphiti.py
head -50 queries_pkg/client.py
head -50 queries_pkg/queries.py
```

#### Step 2: Extract Memory Components

**Key files to copy**:
```python
1. queries_pkg/graphiti.py - Main memory interface
2. queries_pkg/client.py - Database client
3. queries_pkg/queries.py - Graph queries
4. queries_pkg/schema.py - Graph schema
```

#### Step 3: Copy Memory System

```bash
# Create memory directory
mkdir -p .blackbox5/engine/memory

# Copy Graphiti files
cp .docs/research/agents/auto-claude/apps/backend/integrations/graphiti/queries_pkg/graphiti.py \
   .blackbox5/engine/memory/GraphitiMemory.py

cp .docs/research/agents/auto-claude/apps/backend/integrations/graphiti/queries_pkg/client.py \
   .blackbox5/engine/memory/MemoryClient.py

cp .docs/research/agents/auto-claude/apps/backend/integrations/graphiti/queries_pkg/queries.py \
   .blackbox5/engine/memory/MemoryQueries.py

cp .docs/research/agents/auto-claude/apps/backend/integrations/graphiti/queries_pkg/schema.py \
   .blackbox5/engine/memory/MemorySchema.py
```

#### Step 4: Simplify (Remove LadybugDB Dependency)

**Auto-Claude uses LadybugDB (embedded)**. We'll use a simpler approach initially:

```python
# .blackbox5/engine/memory/AgentMemory.py
"""
Agent Memory System (Simplified)
Adapted from Auto-Claude's Graphiti memory
"""
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any

class AgentMemory:
    """
    Persistent memory for agents

    Each agent has its own memory environment with:
    - Session history
    - Insights learned
    - Patterns discovered
    - Context accumulated
    """

    def __init__(self, agent_id: str, memory_dir: Path):
        """
        Initialize agent memory

        Args:
            agent_id: Unique agent identifier
            memory_dir: Base directory for memory storage
        """
        self.agent_id = agent_id
        self.memory_dir = memory_dir / agent_id
        self.memory_dir.mkdir(parents=True, exist_ok=True)

        # Memory files
        self.sessions_file = self.memory_dir / "sessions.json"
        self.insights_file = self.memory_dir / "insights.json"
        self.context_file = self.memory_dir / "context.json"

    def add_session(self, task: str, result: str):
        """Add a session to memory"""
        sessions = self._load_json(self.sessions_file, [])

        session = {
            "timestamp": datetime.now().isoformat(),
            "task": task,
            "result": result
        }

        sessions.append(session)
        self._save_json(self.sessions_file, sessions)

    def add_insight(self, insight: str, category: str):
        """Add an insight to memory"""
        insights = self._load_json(self.insights_file, [])

        insight_obj = {
            "timestamp": datetime.now().isoformat(),
            "insight": insight,
            "category": category
        }

        insights.append(insight_obj)
        self._save_json(self.insights_file, insights)

    def get_context(self) -> Dict[str, Any]:
        """Get accumulated context"""
        return self._load_json(self.context_file, {})

    def update_context(self, context: Dict[str, Any]):
        """Update context"""
        self._save_json(self.context_file, context)

    def _load_json(self, path: Path, default: Any) -> Any:
        """Load JSON file"""
        if path.exists():
            with open(path) as f:
                return json.load(f)
        return default

    def _save_json(self, path: Path, data: Any):
        """Save JSON file"""
        with open(path, 'w') as f:
            json.dump(data, f, indent=2)
```

#### Step 5: Test Memory System

```bash
# Test agent memory
python -c "
from pathlib import Path
import sys
sys.path.insert(0, '.blackbox5/engine/memory')
from AgentMemory import AgentMemory

# Create memory for agent
memory = AgentMemory('developer_1', Path('.blackbox5/data/memory'))

# Add session
memory.add_session('Write tests', 'Tests created successfully')

# Add insight
memory.add_insight('Tests should be written before code', 'pattern')

# Get context
memory.update_context({'preferred_style': 'TDD'})

print('✅ Memory system working')
"
```

**Acceptance Criteria**:
- [ ] Memory system creates files
- [ ] Sessions persist
- [ ] Insights stored
- [ ] Context maintained

---

### Day 11-14: Multi-Agent Orchestration

**Source**: `.docs/research/agents/auto-claude/apps/backend/run.py`

#### Step 1: Examine Orchestration

```bash
# Look at Auto-Claude's run system
cd .docs/research/agents/auto-claude/apps/backend

head -100 run.py

# Check agent implementations
ls -la agents/

# Examine planner agent
head -100 agents/planner.py
```

#### Step 2: Extract Orchestration Pattern

**Key components**:
```python
# From run.py, extract:
1. Multi-session workflow
2. Agent spawning
3. Result aggregation
4. Error handling
```

#### Step 3: Create Orchestrator

```bash
cat > .blackbox5/engine/core/Orchestrator.py << 'EOF'
"""
Multi-Agent Orchestrator
Adapted from Auto-Claude's orchestration system
"""
from pathlib import Path
from typing import Dict, List, Any
import asyncio

from AgentClient import create_client
from memory.AgentMemory import AgentMemory

class AgentOrchestrator:
    """
    Orchestrate multiple agents in workflows

    Manages:
    - Multiple agents running (possibly in parallel)
    - Agent memory (persistent per agent)
    - Workflow coordination
    - Result aggregation
    """

    def __init__(self, project_dir: Path):
        self.project_dir = project_dir
        self.active_agents = {}
        self.agent_memories = {}

    async def start_agent(self, agent_id: str, agent_type: str) -> str:
        """
        Start an agent with persistent memory

        Args:
            agent_id: Unique agent ID (e.g., "developer_1")
            agent_type: Type of agent (developer, tester, planner, etc.)

        Returns:
            Agent session ID
        """
        # Create client
        client = create_client(agent_type, self.project_dir)

        # Create memory
        memory = AgentMemory(agent_id, self.project_dir / ".blackbox5/data/memory")

        # Store
        self.active_agents[agent_id] = client
        self.agent_memories[agent_id] = memory

        return agent_id

    async def execute_workflow(self, workflow: List[Dict]]) -> Dict[str, Any]:
        """
        Execute a multi-agent workflow

        Example workflow:
        [
            {"agent": "planner", "task": "Create plan"},
            {"agent": "developer", "task": "Implement"},
            {"agent": "tester", "task": "Test"}
        ]

        Args:
            workflow: List of agent tasks

        Returns:
            Aggregated results
        """
        results = {}

        for step in workflow:
            agent_id = step.get("agent")
            task = step.get("task")

            # Get agent
            agent = self.active_agents.get(agent_id)
            if not agent:
                agent = await self.start_agent(agent_id, agent_id.split("_")[0])

            # Execute
            result = await self._execute_agent_task(agent, task)

            # Store in memory
            memory = self.agent_memories[agent_id]
            memory.add_session(task, result)

            results[agent_id] = result

        return results

    async def _execute_agent_task(self, agent: Any, task: str) -> str:
        """Execute task with agent"""
        # Create session
        prompt = agent.create_session(task)

        # Call LLM (this would use Anthropic API)
        # For now, return placeholder
        return f"Executed: {task}"

    async def parallel_execute(self, tasks: List[Dict]) -> List[str]:
        """
        Execute multiple agents in parallel

        Args:
            tasks: List of {agent_id, agent_type, task}

        Returns:
            List of results
        """
        # Create tasks
        async_tasks = []
        for task_spec in tasks:
            agent_id = task_spec["agent_id"]
            agent_type = task_spec["agent_type"]
            task = task_spec["task"]

            async_tasks.append(self._execute_task(agent_id, agent_type, task))

        # Execute in parallel
        results = await asyncio.gather(*async_tasks)
        return results

    async def _execute_task(self, agent_id: str, agent_type: str, task: str) -> str:
        """Execute single task"""
        await self.start_agent(agent_id, agent_type)
        agent = self.active_agents[agent_id]
        return await self._execute_agent_task(agent, task)
EOF
```

#### Step 4: Test Orchestration

```bash
# Test orchestrator
python -c "
import asyncio
from pathlib import Path
import sys
sys.path.insert(0, '.blackbox5/engine/core')

from Orchestrator import AgentOrchestrator

async def test():
    orch = AgentOrchestrator(Path('.'))

    # Test workflow
    workflow = [
        {'agent': 'planner_1', 'task': 'Plan feature'},
        {'agent': 'developer_1', 'task': 'Implement feature'}
    ]

    results = await orch.execute_workflow(workflow)
    print(f'✅ Workflow results: {list(results.keys())}')

asyncio.run(test())
"
```

**Acceptance Criteria**:
- [ ] Orchestrator starts agents
- [ ] Workflows execute sequentially
- [ ] Parallel execution works
- [ ] Memory persists per agent

---

## Phase 2: CCPM Extraction (Days 15-21)

### Day 15-17: GitHub Integration

**Source**: `.docs/research/development-tools/ccpm/ccpm/commands/pm/`

#### Step 1: Locate GitHub Commands

```bash
cd .docs/research/development-tools/ccpm/ccpm/commands/pm

# Find GitHub-related commands
ls -la | grep -i github

# Examine epic-sync (GitHub sync)
cat epic-sync.md | head -100
```

#### Step 2: Extract GitHub Integration

**Key components**:
```python
1. Issue creation from tasks
2. PR creation from branches
3. Status updates via comments
4. Issue linking
```

#### Step 3: Create GitHub Integration

```bash
cat > .blackbox5/integration/github/GitHubManager.py << 'EOF'
"""
GitHub Integration for BlackBox5
Adapted from CCPM's GitHub sync
"""
import requests
from pathlib import Path
from typing import Dict, List

class GitHubManager:
    """
    Manage GitHub integration

    Features:
    - Create issues from tasks
    - Create PRs from agent work
    - Update status via comments
    """

    def __init__(self, token: str, repo: str):
        """
        Initialize GitHub manager

        Args:
            token: GitHub personal access token
            repo: Repository (format: "owner/repo")
        """
        self.token = token
        self.repo = repo
        self.base_url = f"https://api.github.com/repos/{repo}"
        self.headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json"
        }

    def create_issue(self, title: str, body: str, labels: List[str] = None) -> Dict:
        """
        Create GitHub issue

        Args:
            title: Issue title
            body: Issue body (markdown)
            labels: Optional labels

        Returns:
            Created issue data
        """
        data = {
            "title": title,
            "body": body
        }

        if labels:
            data["labels"] = labels

        response = requests.post(
            f"{self.base_url}/issues",
            headers=self.headers,
            json=data
        )

        response.raise_for_status()
        return response.json()

    def create_pr(self, branch: str, title: str, body: str, base: str = "main") -> Dict:
        """
        Create pull request

        Args:
            branch: Feature branch
            title: PR title
            body: PR body
            base: Base branch

        Returns:
            Created PR data
        """
        data = {
            "title": title,
            "body": body,
            "head": branch,
            "base": base
        }

        response = requests.post(
            f"{self.base_url}/pulls",
            headers=self.headers,
            json=data
        )

        response.raise_for_status()
        return response.json()

    def add_comment(self, issue_number: int, comment: str):
        """Add comment to issue"""
        data = {"body": comment}

        response = requests.post(
            f"{self.base_url}/issues/{issue_number}/comments",
            headers=self.headers,
            json=data
        )

        response.raise_for_status()
        return response.json()

    def update_status(self, issue_number: int, status: str):
        """Update issue status via comment"""
        comment = f"**Status**: {status}"
        return self.add_comment(issue_number, comment)
EOF
```

#### Step 4: Adapt for Vibe Kanban

```bash
cat > .blackbox5/integration/vibe/VibeKanbanManager.py << 'EOF'
"""
Vibe Kanban Integration for BlackBox5
Adapted from CCPM's GitHub patterns
"""
import requests
from typing import Dict, List

class VibeKanbanManager:
    """
    Manage Vibe Kanban integration

    Similar to GitHub but for Vibe Kanban system
    """

    def __init__(self, api_url: str, api_key: str):
        """
        Initialize Vibe Kanban manager

        Args:
            api_url: Vibe Kanban API URL
            api_key: API key for authentication
        """
        self.api_url = api_url
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    def create_card(self, title: str, description: str, column: str = "backlog") -> Dict:
        """
        Create card in Vibe Kanban

        Args:
            title: Card title
            description: Card description
            column: Column to add card to

        Returns:
            Created card data
        """
        data = {
            "title": title,
            "description": description,
            "column": column
        }

        response = requests.post(
            f"{self.api_url}/cards",
            headers=self.headers,
            json=data
        )

        response.raise_for_status()
        return response.json()

    def move_card(self, card_id: str, column: str):
        """Move card to different column"""
        data = {"column": column}

        response = requests.patch(
            f"{self.api_url}/cards/{card_id}",
            headers=self.headers,
            json=data
        )

        response.raise_for_status()
        return response.json()

    def update_card_status(self, card_id: str, status: str):
        """Update card status"""
        # Map status to column
        status_to_column = {
            "todo": "backlog",
            "in_progress": "doing",
            "done": "done"
        }

        column = status_to_column.get(status, "backlog")
        return self.move_card(card_id, column)
EOF
```

#### Step 5: Test Integration

```bash
# Test GitHub integration (requires token)
python -c "
from pathlib import Path
import sys
sys.path.insert(0, '.blackbox5/integration/github')
from GitHubManager import GitHubManager

# Test with your token
mgr = GitHubManager('YOUR_TOKEN', 'owner/repo')
# mgr.create_issue('Test Issue', 'Test body')
print('✅ GitHub integration ready')
"
```

**Acceptance Criteria**:
- [ ] GitHubManager creates issues
- [ ] GitHubManager creates PRs
- [ ] VibeKanbanManager creates cards
- [ ] Status updates work

---

## Phase 3: Testing & Integration (Days 22-28)

### Day 22-24: Integration Testing

#### Step 1: Create End-to-End Test

```bash
cat > .blackbox5/tests/test_integration.py << 'EOF'
"""
End-to-end integration test
"""
import asyncio
from pathlib import Path
import sys

# Add paths
sys.path.insert(0, '.blackbox5/engine/core')
sys.path.insert(0, '.blackbox5/engine/memory')
sys.path.insert(0, '.blackbox5/integration/github')

from Orchestrator import AgentOrchestrator
from AgentClient import create_client
from memory.AgentMemory import AgentMemory

async def test_full_workflow():
    """Test complete workflow"""
    project_dir = Path('.')

    # 1. Start orchestrator
    orch = AgentOrchestrator(project_dir)
    print("✅ Orchestrator created")

    # 2. Start agents
    await orch.start_agent("developer_1", "developer")
    await orch.start_agent("tester_1", "tester")
    print("✅ Agents started")

    # 3. Execute workflow
    workflow = [
        {"agent": "developer_1", "task": "Write tests"},
        {"agent": "tester_1", "task": "Run tests"}
    ]

    results = await orch.execute_workflow(workflow)
    print(f"✅ Workflow executed: {list(results.keys())}")

    # 4. Check memory
    dev_memory = orch.agent_memories["developer_1"]
    sessions = dev_memory._load_json(dev_memory.sessions_file, [])
    print(f"✅ Memory persisted: {len(sessions)} sessions")

    print("\n🎉 All systems operational!")

if __name__ == "__main__":
    asyncio.run(test_full_workflow())
EOF

# Run integration test
python .blackbox5/tests/test_integration.py
```

### Day 25-28: Documentation & Polish

#### Step 1: Create Setup Guide

```bash
cat > .blackbox5/SETUP-GUIDE.md << 'EOF'
# BlackBox5 Setup Guide
## Multi-Agent Infrastructure System

### Prerequisites

1. Python 3.12+
2. Anthropic API key
3. GitHub token (for GitHub integration)
4. Vibe Kanban API (for Vibe integration)

### Installation

\`\`\`bash
# 1. Create virtual environment
python3 -m venv .blackbox5/venv
source .blackbox5/venv/bin/activate

# 2. Install dependencies
pip install anthropic requests asyncio

# 3. Set up environment
export ANTHROPIC_API_KEY="your-key"
export GITHUB_TOKEN="your-token"
export VIBE_API_KEY="your-key"

# 4. Run integration test
python .blackbox5/tests/test_integration.py
\`\`\`

### Usage

\`\`\`python
from blackbox5.engine.core import Orchestrator

# Start orchestrator
orch = Orchestrator(project_dir)

# Define workflow
workflow = [
    {"agent": "planner_1", "task": "Plan feature"},
    {"agent": "developer_1", "task": "Implement"},
    {"agent": "tester_1", "task": "Test"}
]

# Execute
results = await orch.execute_workflow(workflow)
\`\`\`
EOF
```

---

## 📊 Extraction Summary

### Files Created (Phase 1):

1. `.blackbox5/engine/core/AgentClient.py` (from Auto-Claude)
2. `.blackbox5/engine/core/MCPIntegration.py` (from Auto-Claude)
3. `.blackbox5/engine/memory/AgentMemory.py` (from Auto-Claude)
4. `.blackbox5/engine/core/Orchestrator.py` (from Auto-Claude)

### Files Created (Phase 2):

5. `.blackbox5/integration/github/GitHubManager.py` (from CCPM)
6. `.blackbox5/integration/vibe/VibeKanbanManager.py` (adapted from CCPM)

### Total Time: 14 days
### Code Reused: ~70%
### Time Saved: 2-3 months

---

## ✅ Extraction Checklist

For each component:

### Auto-Claude
- [ ] Agent SDK Client extracted and adapted
- [ ] MCP Integration copied and working
- [ ] Memory system extracted and simplified
- [ ] Orchestrator created and tested

### CCPM
- [ ] GitHub Integration extracted
- [ ] Vibe Kanban adapter created
- [ ] Issue/PR workflows tested

### Integration
- [ ] End-to-end workflow working
- [ ] Multiple agents coordinate
- [ ] Memory persists across sessions
- [ ] External integrations (GitHub, Vibe) working

---

## 🚀 Next Steps

1. **Start Day 1**: Extract AgentClient from Auto-Claude
2. **Follow daily plan**: Each day has specific deliverables
3. **Test continuously**: Don't move forward until tests pass
4. **Document changes**: Keep track of adaptations

**Ready to extract!** 🎯