# GitHub Integration for BlackBox5

**Complete CCPM-style GitHub integration for BlackBox5 agents**

---

## What This Is

A complete skill that enables BlackBox5 agents to:
1. Create structured PRDs (Product Requirements Documents)
2. Generate technical Epics from PRDs
3. Decompose Epics into actionable Tasks
4. Sync everything to GitHub Issues
5. Track progress with GitHub comments
6. Read and understand GitHub issues
7. Close issues when complete

**This is spec-driven development with GitHub as the source of truth.**

---

## How BlackBox5 Agents Use This

### When You Say: "Add user authentication to the app"

**BlackBox5 Agent Flow:**

1. **John (PM Agent)** creates PRD using this skill
   - Brainstorms requirements with you
   - Creates `.blackbox5/specs/prds/user-auth.md`

2. **Winston (Architect)** generates Epic using this skill
   - Reads PRD
   - Creates technical spec
   - Saves to `.blackbox5/specs/epics/user-auth/epic.md`

3. **Winston + Arthur** decompose into Tasks
   - Break epic into components
   - Create task files
   - Save to `.blackbox5/specs/epics/user-auth/{001,002,003}.md`

4. **System** syncs to GitHub
   - Creates Epic Issue #200
   - Creates Task Issues #201, #202, #203...
   - Links them together
   - Creates worktree for isolation

5. **Arthur (Developer)** reads GitHub issue
   - Uses this skill to read Issue #201
   - Gets complete context
   - Starts implementing

6. **Arthur** posts progress updates
   - Uses this skill to post comment
   - Shows what's done, what's pending
   - Team sees real-time progress

7. **Arthur** completes task
   - Uses this skill to close Issue #201
   - Posts completion summary
   - Epic progress updates

---

## Quick Start Example

### Step 1: Agent Creates PRD

```
You: "I need user authentication with JWT"

BlackBox5 (using github-integration skill):
"Let me create a PRD for user authentication.
I'll guide you through the requirements gathering...

[Creates structured PRD with:
- Problem statement
- User stories
- Requirements
- Success criteria]

✅ PRD created: .blackbox5/specs/prds/user-auth.md"
```

### Step 2: Agent Generates Epic

```
BlackBox5 (using github-integration skill):
"Reading PRD and generating technical epic...

[Creates epic with:
- Technical architecture
- Key decisions (JWT library, token storage)
- Components (login, refresh, middleware)
- Data flow]

✅ Epic created: .blackbox5/specs/epics/user-auth/epic.md"
```

### Step 3: Agent Decomposes Tasks

```
BlackBox5 (using github-integration skill):
"Breaking epic into actionable tasks...

[Creates tasks:
- 001: Implement JWT utilities
- 002: Create login endpoint
- 003: Add auth middleware
- 004: Implement password reset]

✅ Tasks created: 4 task files"
```

### Step 4: Agent Syncs to GitHub

```
BlackBox5 (using github-integration skill):
"Syncing to GitHub...

[Executes:
- Creates Epic Issue #200
- Creates Task Issues #201, #202, #203, #204
- Renames files: 001.md → 201.md
- Updates frontmatter with GitHub URLs
- Creates worktree: ../epic-user-auth/]

✅ Synced to GitHub
  - Epic: #200
  - Tasks: #201, #202, #203, #204
  - Worktree: ../epic-user-auth/"
```

### Step 5: Agent Reads GitHub Issue

```
BlackBox5 (Arthur, using github-integration skill):
"Reading GitHub Issue #201...

[Parses issue:
- Specification: Implement JWT utilities
- Acceptance Criteria: All 3 criteria
- Dependencies: None
- Can start: Yes]

✅ Ready to execute Issue #201"
```

### Step 6: Agent Posts Progress

```
BlackBox5 (Arthur, using github-integration skill):
"Posting progress to Issue #201...

[Posts comment:
## 🔄 Progress Update
### ✅ Completed
- Created jwt.ts
- Implemented signToken()

### 🔄 In Progress
- Implementing verifyToken()

### ⏸️ Pending
- Implement refreshToken()]

Progress: 60%]

✅ Progress posted to GitHub"
```

### Step 7: Agent Closes Issue

```
BlackBox5 (Arthur, using github-integration skill):
"Closing Issue #201...

[Posts completion summary:
## ✅ Task Completed
### 🎯 All Acceptance Criteria Met
- ✅ Tokens signed with secure secret
- ✅ Verification throws on invalid tokens
- ✅ Refresh tokens rotate correctly

Closes issue #201]

✅ Issue #201 closed"
```

---

## File Structure

```
.blackbox5/
├── specs/
│   ├── prds/                           # Product Requirements
│   │   └── user-auth.md                # PRD with frontmatter
│   │
│   ├── epics/                          # Technical Specifications
│   │   └── user-auth/
│   │       ├── epic.md                 # Epic spec
│   │       ├── 201.md                 # Task (renamed from GitHub)
│   │       ├── 202.md
│   │       ├── 203.md
│   │       ├── github-mapping.md      # Issue number mapping
│   │       └── updates/
│   │           ├── 201/
│   │           │   ├── progress.md
│   │           │   └── notes.md
│   │           └── 202/
│   │
│   └── tasks/                          # Standalone tasks
│
└── engine/.skills/
    └── github-integration/
        ├── SKILL.md                    # This file
        └── commands/
            ├── prd-new.md              # Create PRD
            ├── prd-parse.md            # PRD → Epic
            ├── epic-decompose.md       # Epic → Tasks
            ├── epic-sync.md            # Sync to GitHub
            ├── issue-start.md          # Start work
            └── issue-sync.md           # Post progress
```

---

## How Your Agents Use This

### John (PM Agent)

**When creating requirements:**
```
User: "We need OAuth2 login"

John (PM):
"I'll create a PRD for OAuth2 login."
[Uses github-integration skill]
"PRD created. Here's what I captured:
- Problem: Users need social login
- Requirements: Google, GitHub OAuth
- Success Criteria: Users can log in with Google"
```

### Winston (Architect)

**When designing system:**
```
Winston:
"Reading PRD and generating technical spec..."
[Uses github-integration skill]
"Epic created with technical decisions:
- Use OAuth2 client library
- State parameter for CSRF protection
- Token storage in database"
```

### Arthur (Developer)

**When implementing:**
```
Arthur:
"Reading GitHub Issue #201 to understand task..."
[Uses github-integration skill]
"Got it: Implement JWT utilities.
Acceptance criteria:
1. Tokens signed with secure secret
2. Verification throws on invalid tokens
3. Refresh tokens rotate correctly"

[Arthur implements]

Arthur:
"Posting progress..."
[Uses github-integration skill]
"All criteria met. Closing issue."
```

---

## Key Benefits

### 1. Complete Traceability

Every line of code traces back:
```
PRD → Epic → Task → GitHub Issue → Code → Commit
```

### 2. GitHub as Source of Truth

- Requirements in GitHub Issues
- Progress in GitHub Comments
- Team visibility built-in
- Human-AI collaboration via comments

### 3. Spec-Driven Development

- No "vibe coding"
- Always know WHAT you're building
- Requirements documented first

### 4. Agent Coordination

- John creates PRD
- Winston generates Epic
- Arthur executes tasks
- All use same skill, same workflow

### 5. Human Oversight

- See everything in GitHub
- Comment with feedback
- Agents adjust based on comments

---

## Command Files

The skill includes 6 command files that agents can follow:

1. **prd-new.md** - Guide PRD creation
2. **prd-parse.md** - Guide PRD → Epic transformation
3. **epic-decompose.md** - Guide task breakdown
4. **epic-sync.md** - Guide GitHub sync
5. **issue-start.md** - Guide task execution
6. **issue-sync.md** - Guide progress updates

These are prompts that tell agents exactly what to do.

---

## Integration with Vibe Kanban

**This works with Vibe Kanban too!**

When you sync to GitHub:
1. GitHub Issues created (#200, #201, #202...)
2. Webhook fires → Vibe Kanban
3. Vibe Kanban picks up tasks
4. Executes autonomously with Gemini
5. Posts progress back to GitHub
6. Agents see progress, can adjust

**Best of both worlds:**
- BMAD agents for complex tasks
- Vibe Kanban for routine tasks
- GitHub as the bridge

---

## Testing It Out

### Quick Test

```
You: "Create a PRD for a simple feature: user profile page"

BlackBox5 Agent:
"Sure! I'll use the github-integration skill to create a PRD.

Let me ask some questions:
1. What should the profile page show?
2. Should users be able to edit their profile?
3. Any specific requirements?

[Captures your answers and creates PRD]

✅ PRD created: .blackbox5/specs/prds/user-profile.md"
```

### Full Workflow Test

```
You: "Implement the user profile page"

BlackBox5:
"Let me create the full workflow:

1. Creating PRD... ✅
2. Generating Epic... ✅
3. Decomposing Tasks... ✅
4. Syncing to GitHub... ✅
   - Epic Issue #300
   - Tasks #301, #302, #303
5. Starting work on #301...
   [Reads issue]
   [Implements]
   [Posts progress]
6. Completing #301... ✅

All tracked in GitHub!"
```

---

## What Your Agents Can Do Now

✅ **Create PRDs** - Structured requirements documents
✅ **Generate Epics** - Technical specifications
✅ **Decompose Tasks** - Actionable units
✅ **Sync to GitHub** - Create and link issues
✅ **Read GitHub Issues** - Understand what to build
✅ **Post Progress** - Transparent updates
✅ **Close Issues** - Mark complete
✅ **Full Traceability** - PRD → Code

**Your agents now have complete GitHub integration!** 🚀
