# How the Autonomous Research Works

## Your Questions Answered

### Q: Is it one Claude agent talking to itself?

**A: NO.** This is **NOT using Claude at all**. It's a simple Python script that:

1. Uses **GitHub CLI** (`gh` command) to fetch issues
2. Uses **subprocess** to run shell commands
3. Uses **basic Python** (if/else, string matching) to categorize issues
4. Runs in a **while loop** checking every 30 seconds

**No AI, no Claude, no LLMs.** Just Python + GitHub CLI.

### Q: How did it find 174 GitHub issues?

**A: It's monitoring 10 different repositories, not just yours:**

- **5** from FoundationAgents/MetaGPT
- **9** from openai/swarm
- **20** from agentscope-ai/agentscope
- **20** from microsoft/agent-framework
- **20** from google/adk-python
- **20** from MervinPraison/PraisonAI
- **20** from bytedance/deer-flow
- **20** from ruvnet/claude-flow
- **20** from iflytek/astron-agent
- **20** from bmad-code-org/BMAD-METHOD

**Total: 174 real GitHub issues**

### Q: Is the data real or fake?

**A: 100% REAL.** I verified:

```bash
gh issue list --repo FoundationAgents/MetaGPT --limit 5
# Returns:
#1912: Unable to reproduce the work in the Metagpt paper
#1911: Hugging Face Space is not accessible
#1910: pip install metagpt==0.8.2 error
#1903: window运行main分支不兼容
#1902: 无法安装, 由于pip源没有faiss-cpu==1.7.4
```

These are **actual issues** from the actual GitHub repositories.

## How It Actually Works

### The Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  run-autonomous-research.py (Single Python Script)          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  while time < end_time:                                    │
│    for repo in [10 repositories]:                          │
│      1. Run: gh issue list --repo $repo                    │
│      2. Parse JSON output                                  │
│      3. Check state file (what have we seen?)             │
│      4. Filter to NEW issues only                          │
│      5. Write analysis to .md file                         │
│      6. Update state file                                  │
│    sleep(30 seconds)                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### The Code Flow

```python
# 1. Fetch issues using GitHub CLI
result = subprocess.run(
    ['gh', 'issue', 'list', '--repo', repo, '--limit', '20',
     '--json', 'number,title,body,state,labels,createdAt,url'],
    capture_output=True,
    text=True
)

# 2. Parse JSON
issues_data = json.loads(result.stdout)

# 3. Check what we've seen
seen_issues = set(state_data.get('repos', {}).get(repo, []))

# 4. Filter to new issues only
new_issues = [issue for issue in issues_data
              if issue['number'] not in seen_issues]

# 5. Write analysis
for issue in new_issues:
    analysis += f"## Issue #{issue['number']}: {issue['title']}\n"
    # ... simple string formatting, no AI

# 6. Save state
state_data['repos'][repo] = list(seen_issues)
```

### The "Smart" Categorization

This is just **string matching**, not AI:

```python
if any(word in title_lower for word in ['bug', 'error', 'fail']):
    analysis += "Appears to be a **bug report**"
elif any(word in title_lower for word in ['install', 'setup']):
    analysis += "Related to **installation**"
```

## Why It's Not "Agents"

### What It IS:
- ✅ A Python script
- ✅ Running a loop
- ✅ Fetching data via GitHub CLI
- ✅ Writing files to disk
- ✅ Tracking state in JSON
- ✅ Simple if/else logic

### What It's NOT:
- ❌ No Claude API calls
- ❌ No LLM usage
- ❌ No multiple agents
- ❌ No prompt injection
- ❌ No agent-to-agent communication
- ❌ No complex AI reasoning

## The "Autonomous" Part

"Autonomous" here means:
- Runs without human intervention
- Continues on a loop
- Automatically detects new issues
- Self-managing state

But it's **NOT autonomous AI** - it's just a **scripted automation**.

## Verification

You can verify everything yourself:

```bash
# Check what's running
ps aux | grep run-autonomous-research.py

# See the actual code
cat run-autonomous-research.py

# Verify issues are real
gh issue list --repo openai/swarm --limit 5

# Check the state file
cat .blackbox5/engine/operations/runtime/ralph/github_state.json

# View the generated analysis
cat .blackbox5/engine/development/framework-research/FoundationAgents-MetaGPT-ANALYSIS.md
```

## Summary

This is a **simple Python automation script**, not an AI agent system. It:

1. Fetches real GitHub issues via CLI
2. Tracks what it's seen in a JSON file
3. Only processes NEW issues
4. Runs in a loop every 30 seconds
5. Writes markdown reports

The "174 issues" came from **10 different repositories**, not just one.
The data is **100% real** - verified against actual GitHub APIs.
