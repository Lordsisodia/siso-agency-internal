# 🚀 BlackBox5 - Start Using Now!

## Quick Start (3 Steps)

### 1. Navigate to Your Project
```bash
cd /Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL
```

### 2. Run a Task
```bash
# Simple task
python .blackbox5/bb5.py "Add console.log to RewardCatalog.tsx"

# With specific agent
python .blackbox5/bb5.py --agent bug_fixer "Fix the bug in GamificationDashboard.tsx"

# Multi-agent workflow
python .blackbox5/bb5.py --workflow "Analyze, fix, and test the reward catalog bug"
```

### 3. Or Use Interactive Mode
```bash
python .blackbox5/bb5.py --interactive
```

Then type commands like:
```
bb5> Fix the bug in RewardCatalog
bb5> --agent frontend_developer Add loading state to dashboard
bb5> --workflow Debug, fix, test, and review
```

---

## Available Agents

| Agent | Use For |
|-------|---------|
| `developer` | General development tasks |
| `frontend_developer` | React, TypeScript, UI components |
| `backend_developer` | Supabase, API, database |
| `analytics_specialist` | Gamification, dashboards, tracking |
| `bug_fixer` | Debugging and error fixing |
| `code_reviewer` | Code quality and security |
| `documentation` | Technical writing and docs |

---

## Real Examples

### Fix a Bug
```bash
python .blackbox5/bb5.py --agent bug_fixer "The reward catalog is showing undefined"
```

### Add a Feature
```bash
python .blackbox5/bb5.py --agent frontend_developer "Add a loading state to GamificationDashboard"
```

### Code Review
```bash
python .blackbox5/bb5.py --agent code_reviewer "Review the recent changes to analytics components"
```

### Complete Workflow
```bash
python .blackbox5/bb5.py --workflow "Investigate the bug, fix it, write tests, and review"
```

---

## What Agents Know About Your Project

BlackBox5 automatically understands:
- **Your codebase structure** - SISO-INTERNAL domain organization
- **Your tech stack** - React, TypeScript, Supabase, Vite
- **Your patterns** - Component structure, service layer, type definitions
- **Your files** - Knows where GamificationDashboard, RewardCatalog, etc. are located

---

## Project Context Agents Know

### Analytics Domain
- `src/domains/analytics/components/GamificationDashboard.tsx`
- `src/domains/analytics/components/StoreManagementPanel.tsx`

### Gamification Features
- `src/domains/lifelock/habits/gamification/2-spend/features/storefront/RewardCatalog.tsx`
- `src/domains/lifelock/habits/gamification/3-track/ui/pages/AnalyticsDashboard.tsx`

### Utilities
- `src/lib/utils/formatters.ts`

---

## Configuration

BlackBox5 uses GLM-4.7 by default. Your GLM API key is configured in:
`.blackbox5/engine/config.yml`

To check if everything is set up:
```bash
bash .blackbox5/verify-setup.sh
```

---

## Troubleshooting

### Issue: "Redis not running"
```bash
brew services start redis
```

### Issue: "Import errors"
```bash
cd /Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL
```

### Issue: "GLM API error"
Make sure your `GLM_API_KEY` environment variable is set.

---

## Next Steps

1. **Try it now**: `python .blackbox5/bb5.py --interactive`
2. **Start small**: "Add a console.log to RewardCatalog.tsx"
3. **Scale up**: Bug fixes, feature development, code reviews
4. **Read more**: `.blackbox5/QUICKSTART.md` for detailed guide

---

## Files Reference

- **CLI**: `.blackbox5/bb5.py` - Main command-line interface
- **Config**: `.blackbox5/engine/config.yml` - System configuration
- **Agents**: `.blackbox5/custom_agents/{type}/agent.md` - Agent definitions
- **Examples**: `.blackbox5/examples/real-world-tasks.py` - Practical examples
- **Docs**: `.blackbox5/QUICKSTART.md` - Comprehensive guide

---

**Ready to code?** Start with: `python .blackbox5/bb5.py --interactive`
