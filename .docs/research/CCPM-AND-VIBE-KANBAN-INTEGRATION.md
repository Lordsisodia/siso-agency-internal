# CCPM + Vibe Kanban Integration

**How GitHub-native project management meets autonomous AI task execution**

---

## What is Vibe Kanban?

**Vibe Kanban** is an **autonomous AI task execution system** built by bloopai (`bloopai/vibe-kanban:latest`).

### Core Capabilities

1. **Autonomous Task Queue** - Vibe Kanban manages a queue of tasks
2. **AI Agent Execution** - Uses AI agents (primarily Gemini) to execute tasks
3. **MCP Integration** - Model Context Protocol for tool access
4. **Webhook System** - Emits events for task lifecycle tracking
5. **Persistent Storage** - SQLite/PostgreSQL database for task state
6. **Codebase Mount** - Direct read-write access to your codebase

### What It Does

```
User adds task to Vibe Kanban queue
  ↓
Vibe Kanban picks up task
  ↓
AI agent (Gemini) executes task
  ↓
Agent makes git commits
  ↓
Task completes → logs to database
  ↓
Webhook fires with completion status
```

---

## What is CCPM?

**CCPM** (Chain-Based Project Management) is a **GitHub-native project management system**.

### Core Capabilities

1. **Spec-Driven Development** - PRD → Epic → Tasks workflow
2. **GitHub Issues** - Uses GitHub Issues as source of truth
3. **Parallel Execution** - Worktree-based parallel development
4. **Progress Tracking** - GitHub comments for transparent updates
5. **Human-AI Collaboration** - Bridge between humans and AI agents

### What It Does

```
User creates PRD (product requirements)
  ↓
CCPM generates Epic (technical spec)
  ↓
CCPM decomposes into Tasks
  ↓
CCPM syncs to GitHub Issues
  ↓
AI agents execute tasks (in worktrees)
  ↓
Progress posted as GitHub comments
  ↓
Issues close on completion
```

---

## The Integration Opportunity

### Current Situation

**Vibe Kanban:**
- ✅ Autonomous task execution
- ✅ AI agent management
- ✅ Task queue system
- ✅ MCP tool access
- ❌ **No GitHub integration**
- ❌ **No spec-driven development**
- ❌ **Limited human visibility**

**CCPM:**
- ✅ GitHub-native workflow
- ✅ Spec-driven development
- ✅ Human collaboration
- ✅ Progress transparency
- ❌ **Manual task creation**
- ❌ **No autonomous execution**
- ❌ **Requires human prompting**

### The Perfect Match

```
CCPM (Planning + Tracking)
  +
Vibe Kanban (Autonomous Execution)
  =
Complete AI-Assisted Development System
```

---

## How They Work Together

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Human Layer                             │
│  (Defines requirements, reviews progress, provides feedback) │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    CCPM Layer                               │
│  - PRD creation (/pm:prd-new)                               │
│  - Epic generation (/pm:prd-parse)                          │
│  - Task decomposition (/pm:epic-decompose)                  │
│  - GitHub sync (/pm:epic-sync)                              │
│  - Progress tracking (/pm:issue-sync)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  GitHub Issues Layer                        │
│  - Issue #123 (Epic: User Authentication)                   │
│  - Issue #124 (Task: JWT login endpoint)                    │
│  - Issue #125 (Task: Password reset)                        │
│  - Progress comments                                        │
│  - Human feedback via comments                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                 Integration Bridge                           │
│  - Webhook server listens to GitHub                         │
│  - New issues → Vibe Kanban queue                           │
│  - Issue comments → Agent context                           │
│  - Task completion → GitHub comment                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                Vibe Kanban Layer                            │
│  - Task queue management                                    │
│  - AI agent orchestration (Gemini)                          │
│  - MCP tool access (filesystem, fetch, etc.)                │
│  - Git commit tracking                                      │
│  - Webhook emission                                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  Execution Layer                            │
│  - AI agents work in worktrees                              │
│  - Make git commits                                         │
│  - Use MCP tools                                            │
│  - Report progress via webhooks                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Complete Workflow Example

### Scenario: Add User Authentication to Your App

#### Step 1: Human Creates PRD (CCPM)

```bash
/pm:prd-new user-auth
```

CCPM helps brainstorm requirements:
```markdown
---
name: user-auth
description: Implement JWT-based authentication system
status: backlog
created: 2026-01-18T10:00:00Z
---

# PRD: User Authentication

## Problem Statement
Users need secure access to the application with JWT tokens.

## Requirements
### Functional
- Login with email/password
- JWT token generation
- Password reset flow
- Session management

### Non-Functional
- Token expiry: 1 hour
- Refresh token support
- Rate limiting on login

## Success Criteria
- Users can log in
- Tokens are secure
- Password reset works
```

#### Step 2: CCPM Generates Epic

```bash
/pm:prd-parse user-auth
```

CCPM creates technical epic:
```markdown
---
name: user-auth
status: backlog
created: 2026-01-18T10:00:00Z
progress: 0%
prd: .claude/prds/user-auth.md
---

# Epic: User Authentication

## Overview
Implement JWT-based authentication with secure password handling.

## Key Decisions
- Use jsonwebtoken library
- BCrypt for password hashing
- SQLite for session storage
- Redis for token blacklist

## Components
- src/lib/jwt.ts - JWT utilities
- src/api/auth/login.ts - Login endpoint
- src/api/auth/reset.ts - Password reset
- src/middleware/auth.ts - Authentication middleware
```

#### Step 3: CCPM Decomposes Tasks

```bash
/pm:epic-decompose user-auth
```

CCPM creates tasks:
```markdown
---
name: Implement JWT utilities
status: open
parallel: true
---

# Task: Implement JWT utilities

## Specification
Create src/lib/jwt.ts with:
- signToken(user, expiry)
- verifyToken(token)
- refreshToken(oldToken)

## Acceptance Criteria
- Tokens signed with secure secret
- Verification throws on invalid tokens
- Refresh tokens rotate correctly
```

#### Step 4: CCPM Syncs to GitHub

```bash
/pm:epic-sync user-auth
```

CCPM creates GitHub Issues:
- Issue #123: Epic: user-auth
- Issue #124: Task: Implement JWT utilities
- Issue #125: Task: Create login endpoint
- Issue #126: Task: Add auth middleware
- Issue #127: Task: Implement password reset
- Issue #128: Task: Write tests (depends on 124,125,126,127)

#### Step 5: Integration Bridge Triggers Vibe Kanban

**Webhook server** listens for new GitHub issues:

```python
@app.route('/webhook/github', methods=['POST'])
def github_webhook():
    data = request.json
    action = data.get('action')

    if action == 'opened':
        issue = data.get('issue')
        labels = [l['name'] for l in issue['labels']]

        if 'task' in labels:
            # Extract task details from issue body
            task_details = parse_issue_body(issue['body'])

            # Add to Vibe Kanban queue
            add_to_vibe_queue(
                title=issue['title'],
                issue_number=issue['number'],
                specification=task_details['specification'],
                acceptance_criteria=task_details['acceptance_criteria'],
                context={
                    'github_url': issue['html_url'],
                    'epic': get_epic_name(labels)
                }
            )

    return jsonify({'status': 'queued'}), 200
```

**Vibe Kanban receives task:**

```json
{
  "id": "vk-001",
  "title": "Implement JWT utilities",
  "github_issue": 124,
  "github_url": "https://github.com/owner/repo/issues/124",
  "specification": "Create src/lib/jwt.ts with JWT functions",
  "acceptance_criteria": [
    "Tokens signed with secure secret",
    "Verification throws on invalid tokens",
    "Refresh tokens rotate correctly"
  ],
  "context": {
    "epic": "user-auth",
    "worktree": "../epic-user-auth/"
  }
}
```

#### Step 6: Vibe Kanban Executes Task

**Vibe Kanban:**
1. Picks up task from queue
2. Spawns Gemini agent with MCP tools
3. Agent reads task spec from GitHub Issue
4. Agent implements in worktree (isolated)
5. Agent commits with format: `Issue #124: Implemented JWT signToken`

**Gemini Agent (with MCP tools):**
```
I'm implementing Issue #124: Implement JWT utilities

Context:
- Epic: user-auth
- Worktree: ../epic-user-auth/
- Specification: Create src/lib/jwt.ts
- Acceptance Criteria: [from GitHub Issue]

Actions:
1. Read current codebase structure (MCP: filesystem)
2. Create src/lib/jwt.ts with:
   - signToken(user, expiry)
   - verifyToken(token)
   - refreshToken(oldToken)
3. Write unit tests
4. Commit: "Issue #124: Implemented JWT utilities"
```

#### Step 7: Vibe Kanban Posts Progress

**Webhook from Vibe Kanban:**

```json
{
  "event": "task.progress",
  "task_id": "vk-001",
  "github_issue": 124,
  "progress": {
    "status": "in_progress",
    "completed": ["Created src/lib/jwt.ts", "Implemented signToken"],
    "in_progress": "Implementing verifyToken",
    "pending": ["Implement refreshToken", "Write tests"]
  }
}
```

**Webhook server posts to GitHub:**

```bash
gh issue comment 124 --body "## 🔄 Progress Update

### ✅ Completed
- Created src/lib/jwt.ts
- Implemented signToken(user, expiry)

### 🔄 In Progress
- Implementing verifyToken(token)

### ⏸️ Pending
- Implement refreshToken(oldToken)
- Write unit tests

**Executed by:** Vibe Kanban (Gemini)
**Workspace:** epic-user-auth worktree"
```

#### Step 8: Task Completion

**Vibe Kanban webhook:**

```json
{
  "event": "task.completed",
  "task_id": "vk-001",
  "github_issue": 124,
  "result": {
    "status": "success",
    "artifacts": [
      "src/lib/jwt.ts",
      "tests/lib/jwt.test.ts"
    ],
    "commits": [
      "abc123: Issue #124: Implemented JWT utilities",
      "def456: Issue #124: Added JWT tests"
    ],
    "acceptance_criteria": [
      {"criterion": "Tokens signed with secure secret", "status": "pass"},
      {"criterion": "Verification throws on invalid tokens", "status": "pass"},
      {"criterion": "Refresh tokens rotate correctly", "status": "pass"}
    ]
  }
}
```

**Webhook server posts completion:**

```bash
gh issue comment 124 --body "## ✅ Task Completed

### 🎯 All Acceptance Criteria Met
- ✅ Tokens signed with secure secret
- ✅ Verification throws on invalid tokens
- ✅ Refresh tokens rotate correctly

### 📦 Deliverables
- src/lib/jwt.ts (JWT utilities)
- tests/lib/jwt.test.ts (Unit tests)

### 💻 Commits
- abc123: Issue #124: Implemented JWT utilities
- def456: Issue #124: Added JWT tests

### 🧪 Testing
- Unit tests: ✅ Passing (8/8)
- Integration: ✅ Verified

**Executed by:** Vibe Kanban (Gemini)
**Duration:** 23 minutes

Ready for review!"

gh issue close 124
```

#### Step 9: Human Reviews

Human sees:
- GitHub Issue #124 closed
- All acceptance criteria met
- Code changes in commits
- Test results

If changes needed:
```bash
gh issue comment 124 --body "Please add rate limiting to login endpoint"
```

Issue reopens:
```bash
gh issue reopen 124
```

Webhook sends back to Vibe Kanban for fixes!

#### Step 10: Epic Progress

CCPM updates epic progress:
```markdown
---
name: user-auth
progress: 16%  # 1 of 6 tasks complete
status: in-progress
---
```

Vibe Kanban automatically picks up next task (#125) since it has no dependencies!

---

## Integration Implementation

### Component 1: GitHub → Vibe Kanban Bridge

**File:** `.blackbox/4-scripts/integrations/github-vibe-bridge/webhook-server.py`

```python
#!/usr/bin/env python3
"""
GitHub → Vibe Kanban Bridge
Listens for GitHub issue events and queues tasks in Vibe Kanban
"""

from flask import Flask, request, jsonify
import requests
import os
from pathlib import Path

app = Flask(__name__)

# Configuration
GITHUB_WEBHOOK_SECRET = os.getenv('GITHUB_WEBHOOK_SECRET')
VIBE_KANBAN_URL = 'http://vibe-kanban:3000/api/tasks'

@app.route('/webhook/github', methods=['POST'])
def github_webhook():
    """Handle GitHub webhook events"""

    # Verify webhook signature (production)
    # signature = request.headers.get('X-Hub-Signature-256')
    # if not verify_signature(signature, request.data):
    #     return jsonify({'error': 'Invalid signature'}), 401

    data = request.json
    action = data.get('action')

    # New issue opened
    if action == 'opened':
        issue = data.get('issue', {})
        labels = [l['name'] for l in issue.get('labels', [])]

        # Only process tasks (not epics)
        if 'task' in labels:
            task = parse_github_issue(issue)
            result = queue_to_vibe_kanban(task)

            if result.get('success'):
                # Comment on issue
                post_github_comment(
                    issue['number'],
                    f"✅ Task queued to Vibe Kanban (ID: {result['task_id']})"
                )

            return jsonify(result)

    # Issue comment (human feedback)
    elif action == 'created' and 'issue' in data:
        comment = data.get('comment', {})
        issue = data.get('issue', {})

        # Check if this is human feedback (not from bot)
        if not comment.get('user', {}).get('type') == 'Bot':
            # Send feedback to Vibe Kanban
            send_feedback_to_vibe(issue['number'], comment['body'])

    # Issue reopened (needs fixes)
    elif action == 'reopened':
        issue = data.get('issue', {})
        requeue_to_vibe_kanban(issue['number'])

    return jsonify({'status': 'processed'}), 200

def parse_github_issue(issue):
    """Extract task details from GitHub issue"""

    body = issue.get('body', '')
    labels = [l['name'] for l in issue.get('labels', [])]

    # Parse issue body to extract sections
    specification = extract_section(body, '## Specification')
    acceptance_criteria = extract_list(body, '## Acceptance Criteria')
    file_changes = extract_list(body, '## File Changes')

    # Extract epic name from labels
    epic_label = next((l for l in labels if l.startswith('epic:')), None)
    epic_name = epic_label.replace('epic:', '') if epic_label else None

    # Check dependencies
    depends_on = extract_dependencies(issue)

    return {
        'title': issue['title'],
        'issue_number': issue['number'],
        'github_url': issue['html_url'],
        'specification': specification,
        'acceptance_criteria': acceptance_criteria,
        'file_changes': file_changes,
        'epic': epic_name,
        'depends_on': depends_on,
        'labels': labels,
        'created_at': issue['created_at']
    }

def queue_to_vibe_kanban(task):
    """Send task to Vibe Kanban queue"""

    try:
        response = requests.post(
            VIBE_KANBAN_URL,
            json=task,
            timeout=10
        )
        response.raise_for_status()

        return {
            'success': True,
            'task_id': response.json().get('task_id')
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def post_github_comment(issue_number, body):
    """Post comment to GitHub issue"""

    import subprocess
    subprocess.run([
        'gh', 'issue', 'comment', str(issue_number), '--body', body
    ])

def send_feedback_to_vibe(issue_number, feedback):
    """Send human feedback to Vibe Kanban"""

    # Parse feedback for action items
    # Send to Vibe Kanban as context for the task
    requests.post(
        f'{VIBE_KANBAN_URL}/feedback',
        json={
            'issue_number': issue_number,
            'feedback': feedback
        }
    )

def requeue_to_vibe_kanban(issue_number):
    """Reopen task in Vibe Kanban for fixes"""

    requests.post(
        f'{VIBE_KANBAN_URL}/requeue',
        json={'issue_number': issue_number}
    )

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)
```

### Component 2: Vibe Kanban → GitHub Bridge

**File:** `.blackbox/4-scripts/integrations/vibe-kanban/github-reporter.py`

```python
#!/usr/bin/env python3
"""
Vibe Kanban → GitHub Reporter
Listens for Vibe Kanban events and posts to GitHub
"""

from flask import Flask, request, jsonify
import subprocess
import os
from datetime import datetime

app = Flask(__name__)

@app.route('/webhook/vibe-kanban', methods=['POST'])
def vibe_kanban_webhook():
    """Handle Vibe Kanban webhook events"""

    data = request.json
    event_type = data.get('event')

    if event_type == 'task.started':
        handle_task_started(data)
    elif event_type == 'task.progress':
        handle_task_progress(data)
    elif event_type == 'task.completed':
        handle_task_completed(data)
    elif event_type == 'task.failed':
        handle_task_failed(data)

    return jsonify({'status': 'posted'}), 200

def handle_task_started(data):
    """Post task start notification"""

    issue_number = data['task']['github_issue']
    agent = data['task'].get('agent', 'Gemini')

    comment = f"""## 🚀 Task Started

**Agent:** {agent}
**Started:** {datetime.now().isoformat()}

Working on this task in isolated worktree...
"""

    post_comment(issue_number, comment)
    update_issue_label(issue_number, 'in-progress')

def handle_task_progress(data):
    """Post progress update"""

    issue_number = data['task']['github_issue']
    progress = data['progress']

    completed = progress.get('completed', [])
    in_progress = progress.get('in_progress', '')
    pending = progress.get('pending', [])

    comment = f"""## 🔄 Progress Update

### ✅ Completed
{chr(10).join(f'- {c}' for c in completed)}

### 🔄 In Progress
- {in_progress}

### ⏸️ Pending
{chr(10).join(f'- {p}' for p in pending)}

**Updated:** {datetime.now().isoformat()}
"""

    post_comment(issue_number, comment)

def handle_task_completed(data):
    """Post completion notification"""

    issue_number = data['task']['github_issue']
    result = data['result']

    # Format acceptance criteria
    criteria = result.get('acceptance_criteria', [])
    criteria_text = '\n'.join(
        f"- {'✅' if c['status'] == 'pass' else '❌'} {c['criterion']}"
        for c in criteria
    )

    # Format commits
    commits = result.get('commits', [])
    commits_text = '\n'.join(
        f"- {c}" for c in commits
    )

    comment = f"""## ✅ Task Completed

### 🎯 All Acceptance Criteria Met
{criteria_text}

### 📦 Deliverables
{chr(10).join(f'- {a}' for a in result.get('artifacts', []))}

### 💻 Commits
{commits_text}

### 🧪 Testing
- Unit tests: ✅ Passing
- Integration: ✅ Verified

**Executed by:** Vibe Kanban ({data['task'].get('agent', 'Gemini')})
**Duration:** {result.get('duration', 'Unknown')}
**Completed:** {datetime.now().isoformat()}

Ready for review!
"""

    post_comment(issue_number, comment)

    # Close issue
    subprocess.run(['gh', 'issue', 'close', str(issue_number)])

def handle_task_failed(data):
    """Post failure notification"""

    issue_number = data['task']['github_issue']
    error = data.get('error', 'Unknown error')

    comment = f"""## ❌ Task Failed

**Error:** {error}

**Failed:** {datetime.now().isoformat()}

This task needs attention and may require manual intervention.
"""

    post_comment(issue_number, comment)
    update_issue_label(issue_number, 'failed')

def post_comment(issue_number, body):
    """Post comment to GitHub issue"""

    subprocess.run([
        'gh', 'issue', 'comment', str(issue_number), '--body', body
    ])

def update_issue_label(issue_number, label):
    """Update issue labels"""

    subprocess.run([
        'gh', 'issue', 'edit', str(issue_number),
        '--add-label', label
    ])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
```

### Component 3: Docker Compose Update

**File:** `docker-compose.vibe-kanban.yml` (additions)

```yaml
services:
  # ... existing vibe-kanban service ...

  # GitHub → Vibe Kanban Bridge
  github-vibe-bridge:
    build:
      context: .
      dockerfile: .blackbox/4-scripts/integrations/github-vibe-bridge/Dockerfile
    container_name: github-vibe-bridge
    restart: unless-stopped

    ports:
      - "5002:5002"

    environment:
      - GITHUB_WEBHOOK_SECRET=${GITHUB_WEBHOOK_SECRET}
      - VIBE_KANBAN_URL=http://vibe-kanban:3000

    volumes:
      - ~/.config/gh:/root/.config/gh:ro  # GitHub CLI auth

    networks:
      - vibe-network

  # Vibe Kanban → GitHub Reporter (already exists)
  webhook-server:
    # ... existing config ...
```

---

## Benefits of Integration

### 1. Autonomous Execution
- CCPM creates tasks in GitHub
- Vibe Kanban autonomously executes them
- No manual agent prompting needed

### 2. Human Visibility
- All progress posted as GitHub comments
- Humans can see what AI is doing
- Real-time status updates

### 3. Feedback Loop
- Humans comment on GitHub Issues
- Feedback sent to Vibe Kanban
- Agents adjust based on feedback

### 4. Complete Traceability
- GitHub Issues = Source of truth
- Commits linked to issues
- Full audit trail

### 5. Parallel Execution
- CCPM identifies parallelizable tasks
- Vibe Kanban executes them concurrently
- Multiple agents working simultaneously

### 6. Spec-Driven Development
- Everything starts from PRD
- Requirements flow through to execution
- No "vibe coding"

---

## Comparison: Before vs After

### Before (Separate Systems)

**CCPM Only:**
```
/pm:epic-sync user-auth
→ Creates GitHub Issues
→ Human must manually invoke agents
→ Agents work, but no automatic tracking
→ Progress updates require manual sync
```

**Vibe Kanban Only:**
```
Tasks added to queue manually
→ No spec-driven development
→ No GitHub integration
→ Limited human visibility
→ No requirements traceability
```

### After (Integrated)

```
/pm:prd-new user-auth        (Human + CCPM)
→ /pm:prd-parse user-auth     (CCPM)
→ /pm:epic-decompose user-auth (CCPM)
→ /pm:epic-sync user-auth     (CCPM → GitHub)
→ Webhook triggers Vibe Kanban (Bridge)
→ Tasks execute autonomously   (Vibe Kanban)
→ Progress posts to GitHub     (Bridge)
→ Humans see real-time updates (GitHub)
→ Humans provide feedback      (GitHub comments)
→ Feedback sent to agents      (Bridge)
→ Tasks complete → Issues close (Automated)
```

---

## Setup Instructions

### Step 1: Configure GitHub Webhooks

```bash
# Create GitHub webhook
gh webhook create \
  --repo owner/repo \
  --url https://your-server.com/webhook/github \
  --events=issues,issue_comment \
  --secret=your-webhook-secret
```

### Step 2: Update Vibe Kanban Configuration

```bash
# Set environment variables
export VIBE_GITHUB_INTEGRATION=true
export VIBE_WEBHOOK_URL=http://webhook-server:5001/webhook/vibe-kanban
```

### Step 3: Start Services

```bash
docker-compose -f docker-compose.vibe-kanban.yml up -d
```

### Step 4: Test Integration

```bash
# Create test task
/pm:prd-new test-integration
/pm:prd-parse test-integration
/pm:epic-decompose test-integration
/pm:epic-sync test-integration

# Check it appears in Vibe Kanban queue
curl http://localhost:3000/api/tasks

# Wait for completion
# Check GitHub for progress comments
```

---

## Key Takeaways

**CCPM provides:**
- ✅ Spec-driven development (PRD → Epic → Tasks)
- ✅ GitHub-native workflow
- ✅ Human collaboration interface
- ✅ Progress transparency

**Vibe Kanban provides:**
- ✅ Autonomous task execution
- ✅ AI agent management
- ✅ MCP tool access
- ✅ Webhook system

**Together they provide:**
- 🚀 End-to-end autonomous development
- 👥 Human-AI collaboration
- 📊 Complete visibility
- 🔄 Feedback loop
- 📝 Full traceability

**This is how AI-assisted development should work!** 🎉

---

**Full integration documentation:** `.docs/research/development-tools/ccpm/GITHUB-INTEGRATION-EXPLAINED.md`
**Vibe Kanban integration:** `.blackbox/.plans/active/vibe-kanban-integration.md`
