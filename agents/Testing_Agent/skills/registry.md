# Skills Registry

This file defines available skills for this agent.

## Core Skills (Available to All)

| Skill | Description |
|-------|-------------|
| fs | File system operations (Read, Write, Edit, Glob, Grep) |
| terminal | Bash commands |
| github | GitHub CLI (gh) operations |

## Testing Skills

### test:install
Install Playwright CLI.
```bash
npm install -g @playwright/cli@latest
```

### test:pages
Test all key pages with screenshots.
```bash
# Open browser
playwright open https://siso-internal.vercel.app

# Test each page
playwright goto https://siso-internal.vercel.app/admin/lifelock/daily
playwright snapshot
playwright screenshot /tmp/daily-$(date +%s).png
playwright console

playwright goto https://siso-internal.vercel.app/admin/lifelock/weekly
playwright snapshot
playwright screenshot /tmp/weekly-$(date +%s).png
playwright console

playwright close
```

### test:flow
Test a specific user flow.
```bash
playwright open https://siso-internal.vercel.app
playwright snapshot
playwright screenshot /tmp/login-start.png
# ... continue flow
playwright screenshot /tmp/login-end.png
playwright console
playwright close
```

### test:screenshot
Take a screenshot of current page.
```bash
playwright screenshot /tmp/$(date +%s).png
```

### test:console
Check for console errors.
```bash
playwright console
```

## Workflow

1. `test:install` - Ensure Playwright CLI is installed
2. `test:pages` - Test all pages
3. `test:flow` - Test specific flows
4. Save results to `workspace/` directory

---

## CMUX Browser Skill

Control browser in your workspace via CMUX.

**Already configured:**
- Workspace: `workspace:24`
- Browser surface: `surface:50`

See `skills/cmux-browser/SKILL.md` for full documentation.

Quick commands:
```bash
# Navigate
cmux browser --surface surface:50 goto https://siso-internal.vercel.app

# Snapshot
cmux browser --surface surface:50 snapshot --compact

# Click
cmux browser --surface surface:50 click "button:Label"

# Console errors
cmux browser errors list
```
