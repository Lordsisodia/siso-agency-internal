# BlackBox5 Quick Start Guide

## 🚀 Getting Started in 30 Seconds

### 1. Basic Usage

```bash
# Navigate to your project
cd /Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL

# Run a task with default developer agent
python .blackbox5/bb5.py "Fix the type error in GamificationDashboard.tsx"

# Use a specific agent
python .blackbox5/bb5.py --agent bug_fixer "Debug the reward catalog issue"

# Run a multi-agent workflow
python .blackbox5/bb5.py --workflow "Analyze the bug, fix it, write tests, and review"
```

### 2. Interactive Mode (Recommended)

```bash
python .blackbox5/bb5.py --interactive
```

Then you can interact naturally:
```
bb5> Analyze the performance issue in the analytics dashboard
bb5> --agent frontend_developer Add a loading state to RewardCatalog
bb5> --workflow Fix the gamification bug and test it
bb5> quit
```

## 🎯 Common Use Cases

### Debugging a Bug
```bash
bb5> --agent bug_fixer The reward catalog is showing undefined for rewards
```

### Feature Development
```bash
bb5> --agent frontend_developer Add a new chart type to the analytics dashboard
```

### Code Review
```bash
bb5> --agent code_reviewer Review the recent changes to gamification components
```

### Writing Tests
```bash
bb5> Write unit tests for the RewardCatalog component
```

### Documentation
```bash
bb5> --agent documentation Create API docs for the reward service
```

### Analytics Work
```bash
bb5> --agent analytics_specialist Add user engagement tracking to the dashboard
```

## 📋 Available Agents

| Agent | Best For | Example |
|-------|----------|---------|
| `developer` | General tasks | "Add a new button" |
| `frontend_developer` | React/TypeScript/UI | "Update the dashboard layout" |
| `backend_developer` | Supabase/API/DB | "Create a new rewards table" |
| `analytics_specialist` | Gamification/Dashboards | "Add engagement tracking" |
| `bug_fixer` | Debugging/Errors | "Fix the type error in line 45" |
| `code_reviewer` | Quality/Security | "Review the PR changes" |
| `documentation` | Docs/Guides | "Document the reward API" |

## 🔄 Workflow Examples

### Bug Fix Workflow
```bash
bb5> --workflow Investigate the reward catalog bug, fix it, write tests, and review
```
This automatically:
1. Uses `bug_fixer` to investigate
2. Uses `developer` to fix
3. Uses `tester` to write tests
4. Uses `code_reviewer` to review

### Feature Development Workflow
```bash
bb5> --workflow Design the new achievement system, implement it, test it, and document it
```

### Code Review Workflow
```bash
bb5> --workflow Review the analytics changes, check for security issues, and suggest improvements
```

## 💡 Pro Tips

### 1. Be Specific
```
❌ Bad: Fix the component
✅ Good: Fix the null reference error in GamificationDashboard.tsx line 45
```

### 2. Provide Context
```
❌ Bad: Add error handling
✅ Good: Add error handling to the reward redemption flow in RewardCatalog.tsx
```

### 3. Use Workflows for Complex Tasks
```
Instead of running multiple commands:
  bb5> Analyze the bug
  bb5> Fix it
  bb5> Test it

Use a workflow:
  bb5> --workflow Analyze, fix, and test the bug
```

### 4. Choose the Right Agent
```
For UI issues → frontend_developer
For database issues → backend_developer
For analytics → analytics_specialist
For bugs → bug_fixer
For PR reviews → code_reviewer
```

## 🔧 Configuration

The system is configured to use GLM-4.7 by default. To change settings:

Edit `.blackbox5/engine/config.yml`:

```yaml
glm:
  enabled: true
  model: "glm-4.7"  # Change to glm-4-plus or glm-4-air if needed
  api_key: "${GLM_API_KEY}"
```

## 📊 Project Context

BlackBox5 automatically understands your SISO-INTERNAL project structure:

- **Analytics**: `src/domains/analytics/`
- **Gamification**: `src/domains/lifelock/habits/gamification/`
- **Components**: Each domain's component directory
- **Types**: Type definitions across the project

Agents automatically know:
- Where files are located
- How components are structured
- What technologies you're using (React, TypeScript, Supabase)
- Your coding patterns and conventions

## 🐛 Troubleshooting

### Issue: "Agent failed to start"
**Solution**: Check that Redis is running:
```bash
redis-cli ping  # Should return PONG
```

### Issue: "GLM API error"
**Solution**: Verify your API key is set:
```bash
echo $GLM_API_KEY
```

### Issue: "Import errors"
**Solution**: Make sure you're in the project directory:
```bash
cd /Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL
```

## 🎓 Learning More

- **Full Documentation**: `.blackbox5/docs/`
- **Agent Details**: `.blackbox5/custom_agents/{agent_type}/agent.md`
- **Tests**: `.blackbox5/tests/`
- **Examples**: `.blackbox5/examples/`

## 🚀 Next Steps

1. **Try interactive mode**: `python .blackbox5/bb5.py --interactive`
2. **Start with a small task**: "Add console.log to RewardCatalog.tsx"
3. **Scale up to complex workflows**: Bug fixes, feature development
4. **Create custom agents**: Add your own specialized agents

## 💬 Example Session

```bash
$ python .blackbox5/bb5.py --interactive

📁 Project: /Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL
🔧 Initializing BlackBox5...
✅ BlackBox5 ready!

🎯 BlackBox5 Interactive Mode
Type 'help' for commands, 'quit' to exit

bb5> --agent bug_fixer The reward catalog is showing undefined

🤖 Agent: bug_fixer
📋 Task: The reward catalog is showing undefined

[Agent analyzes the issue...]
✅ Agent started: agent_bug_fixer_123

[Investigating RewardCatalog.tsx...]
[Found null reference error at line 45...]
[Adding null check...]
✅ Fix applied!

bb5> --workflow Review the fix, write tests, and document

🔄 Workflow: Review the fix, write tests, and document
📋 Steps: 3
  1. code_reviewer: Review the code
  2. tester: Write and run tests
  3. documentation: Create documentation

✅ Workflow complete!
   Steps completed: 3
   Total time: 45.23s

bb5> quit
👋 Goodbye!
```

## 🎉 You're Ready!

Start using BlackBox5 to:
- ✅ Fix bugs faster
- ✅ Write better code
- ✅ Automate repetitive tasks
- ✅ Get code reviews
- ✅ Generate documentation
- ✅ Run multi-agent workflows

Happy coding! 🚀
