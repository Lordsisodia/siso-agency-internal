#!/usr/bin/env bash
set -euo pipefail

# Start a UI Adaptive Development Cycle run:
# - Creates a new run directory with timestamp
# - Seeds a cycle file with 6 phases (Observe, Define, Build, Verify, Deploy, Close)
# - Creates prompt-by-prompt checklist for each phase
# - Sets up artifact directories for screenshots, logs, etc.
#
# Run from repo root:
#   ./4-scripts/start-ui-cycle.sh --url <url> --component <name> "task description"
#
# Example:
#   ./4-scripts/start-ui-cycle.sh --url http://localhost:3000 --component LoginButton "Change button from blue to red"

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

BOX_ROOT="$(find_box_root)"
RUNS_DIR="${BOX_ROOT}/.runs"

usage() {
  cat <<'EOF' >&2
Usage:
  start-ui-cycle.sh --url <url> --component <name> [--hours <n>] [--resume | --overwrite] <task description>

Required:
  --url <url>           Target URL for testing (e.g., http://localhost:3000)
  --component <name>    Component name to modify (e.g., LoginButton)
  <task description>    What UI change to make (one line)

Optional:
  --hours <n>           Planned duration in hours (default: 2, typical: 1-3)
  --resume              Append to existing cycle file
  --overwrite           Replace existing cycle file

Phases (autonomous 65-minute cycle):
  Phase 0: Pre-Flight  (2 min)  - Environment validation
  Phase 1: Observe     (5 min)  - Capture baseline screenshots
  Phase 2: Define      (10 min) - Write success criteria
  Phase 3: Build       (30 min) - Make UI changes
  Phase 4: Verify      (15 min) - Run tests, check console
  Phase 5: Deploy      (5 min)  - Commit, push, verify prod
  Phase 6: Close       (3 min)  - Archive artifacts, report

Artifacts created:
  .runs/ui-cycle-{timestamp}/
  ├── artifacts/              # Success criteria, tests, backups
  ├── screenshots/
  │   ├── before/             # Baseline (mobile, tablet, desktop)
  │   ├── after/              # Post-change
  │   └── production.png      # Live verification
  ├── logs/                   # Console, performance, test results
  ├── cycle.md                # Phase-by-phase checklist
  └── cycle.json              # Metadata (task, URL, component)

Example:
  ./4-scripts/start-ui-cycle.sh \
    --url http://localhost:3000/login \
    --component LoginButton \
    "Change login button from blue to red"
EOF
}

url=""
component=""
hours=2
resume=false
overwrite=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --url)
      shift
      url="${1:-}"
      shift || true
      ;;
    --component)
      shift
      component="${1:-}"
      shift || true
      ;;
    --hours)
      shift
      hours="${1:-2}"
      shift || true
      ;;
    --resume)
      resume=true
      shift || true
      ;;
    --overwrite)
      overwrite=true
      shift || true
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --)
      shift
      break
      ;;
    *)
      break
      ;;
  esac
done

task="$*"

if [[ -z "$url" ]]; then
  error "Missing required argument: --url"
  usage
  exit 2
fi

if [[ -z "$component" ]]; then
  error "Missing required argument: --component"
  usage
  exit 2
fi

if [[ -z "$task" ]]; then
  error "Missing required argument: <task description>"
  usage
  exit 2
fi

if [[ "$resume" == "true" && "$overwrite" == "true" ]]; then
  error "Use only one of --resume or --overwrite"
  exit 2
fi

# Create run directory
timestamp="$(now_timestamp_dir)"
run_dir="${RUNS_DIR}/ui-cycle-${timestamp}"
cycle_file="${run_dir}/cycle.md"

# Check for resume/overwrite
if [[ -d "$run_dir" && "$resume" != "true" && "$overwrite" != "true" ]]; then
  error "Run directory already exists: ${run_dir}"
  info "Use --resume to append or --overwrite to replace"
  exit 1
fi

if [[ -d "$run_dir" && "$overwrite" == "true" ]]; then
  rm -rf "$run_dir"
fi

# Create directory structure
mkdir -p "${run_dir}/artifacts"
mkdir -p "${run_dir}/screenshots/before"
mkdir -p "${run_dir}/screenshots/after"
mkdir -p "${run_dir}/logs"

# Create cycle metadata
cat >"${run_dir}/cycle.json" <<EOF
{
  "cycle_id": "${timestamp}",
  "started_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "task": "${task}",
  "url": "${url}",
  "component": "${component}",
  "planned_duration_hours": ${hours},
  "agent": "ui-cycle"
}
EOF

# Calculate prompts per phase (roughly 70 min total / 5 min per prompt)
total_minutes=$((hours * 60))
prompts_per_phase=$((total_minutes / 70))
if [[ $prompts_per_phase -lt 3 ]]; then
  prompts_per_phase=3
fi

append_phase_checklist() {
  local phase_name="$1"
  local phase_num="$2"
  local prompt_count="$3"
  local out="$4"

  local i=1
  while [[ $i -le $prompt_count ]]; do
    cat >>"$out" <<EOF

### Phase ${phase_num} (${phase_name}) - Prompt ${i}
- Time:
- Objective:
- Commands run:
- Files touched:
- Result:
- Next prompt:
EOF
    i=$((i + 1))
  done
}

# Create or update cycle file
if [[ -f "$cycle_file" && "$resume" == "true" ]]; then
  # Append to existing cycle file
  append_phase_checklist "Resume" "R" "$prompts_per_phase" "$cycle_file"
  success "UI Cycle resumed:"
  info "  run: ${run_dir}"
  info "  cycle: cycle.md (appended ${prompts_per_phase} prompts)"
else
  # Create new cycle file
  cat >"$cycle_file" <<EOF
# UI Adaptive Development Cycle

**Task:** ${task}
**Component:** ${component}
**URL:** ${url}
**Planned Duration:** ~${hours}h (${total_minutes} minutes)
**Started at:** $(now_timestamp_human)
**Run Directory:** \`.runs/ui-cycle-${timestamp}/\`

## Cycle Metadata

- **Cycle ID:** ${timestamp}
- **Target URL:** ${url}
- **Component:** ${component}
- **Change Type:** (color | layout | text | spacing | component | other)
- **Status:** 🔄 In Progress

## Success Criteria (fill during Phase 2: Define)

### Must-Have (Blocking Failures)
- [ ] No console errors after changes
- [ ] No visual regressions on mobile/desktop
- [ ] ${component} renders correctly
- [ ] Existing functionality preserved

### Should-Have (Quality Gates)
- [ ] Accessibility score > 90
- [ ] Touch targets >= 44x44px (mobile)
- [ ] Text contrast >= WCAG AA
- [ ] Performance within 10% of baseline

## 6-Phase Execution

### Phase 0: Pre-Flight (2 min)

**Objective:** Validate environment before starting

**Gates:**
```bash
# 1. Git must be clean
git status --porcelain
# Expected: No output

# 2. Dev server must be running
curl -s -o /dev/null -w "%{http_code}" ${url}
# Expected: 200

# 3. MCP servers available (verify with user if needed)
```

**If gate fails:** STOP and report specific blocker

**Artifacts:** Environment validation report

---
EOF

  append_phase_checklist "Pre-Flight" "0" "1" "$cycle_file"

  cat >>"$cycle_file" <<EOF

### Phase 1: Observe (5 min)

**Objective:** Capture baseline state before changes

**Steps:**
1. Navigate to target URL (using Chrome DevTools MCP or Playwright)
2. Capture screenshots at 3 viewports:
   - Mobile: 375x667
   - Tablet: 768x1024
   - Desktop: 1920x1080
3. Capture console logs
4. Capture performance metrics
5. Inspect target component

**Artifacts:**
- \`screenshots/before/mobile.png\`
- \`screenshots/before/tablet.png\`
- \`screenshots/before/desktop.png\`
- \`logs/before-console.json\`
- \`logs/before-performance.json\`
- \`artifacts/component-map.md\`

---
EOF

  append_phase_checklist "Observe" "1" "$prompts_per_phase" "$cycle_file"

  cat >>"$cycle_file" <<EOF

### Phase 2: Define (10 min)

**Objective:** Create success criteria

**Steps:**
1. Write success criteria checklist
2. Generate acceptance test
3. Define verification approach

**Artifacts:**
- \`artifacts/success-criteria.md\`
- \`artifacts/acceptance.test.ts\`

---
EOF

  append_phase_checklist "Define" "2" "$prompts_per_phase" "$cycle_file"

  cat >>"$cycle_file" <<EOF

### Phase 3: Build (30 min)

**Objective:** Make minimal, targeted changes

**Rules:**
- ONE file type per batch (component OR style OR test)
- Use Edit tool (not Write) to preserve structure
- Create backups before modifying

**Steps:**
1. Backup files: \`cp src/components/${component}.tsx artifacts/${component}.tsx.backup\`
2. Make surgical changes using Edit tool
3. Verify changes:
   - \`npm run type-check\`
   - \`npm run lint\`
   - \`npm run build\`

**Build Gates:**
- ✅ Type check passes
- ✅ Lint passes
- ✅ Build succeeds

**Loop Behavior:** Max 2 build loops, then escalate

**Artifacts:**
- Modified source files
- \`artifacts/*.backup\`
- \`logs/typecheck.log\`
- \`logs/lint.log\`
- \`logs/build.log\`

---
EOF

  append_phase_checklist "Build" "3" "$prompts_per_phase" "$cycle_file"

  cat >>"$cycle_file" <<EOF

### Phase 4: Verify (15 min)

**Objective:** Automated validation against success criteria

**Steps:**
1. Run acceptance tests: \`npx playwright test\`
2. Capture after screenshots (same viewports)
3. Check console (zero errors)
4. Visual regression check (<5% diff)
5. Accessibility audit (score >90)
6. Performance check (within 10% baseline)

**Verification Gates:**
- ✅ All tests pass
- ✅ Zero console errors
- ✅ Visual diff < 5%
- ✅ A11y score > 90
- ✅ Performance within 10%

**Loop Behavior:** Max 2 verify loops, then escalate

**Artifacts:**
- \`screenshots/after/*.png\`
- \`logs/test-results.json\`
- \`logs/after-console.json\`
- \`logs/accessibility.json\`
- \`logs/after-performance.json\`
- \`artifacts/verification-report.md\`

---
EOF

  append_phase_checklist "Verify" "4" "$prompts_per_phase" "$cycle_file"

  cat >>"$cycle_file" <<EOF

### Phase 5: Deploy (5 min)

**Objective:** Ship to production with verification

**Steps:**
1. Commit changes:
   \`\`\`bash
   git add src/
   git commit -m "feat(${component}): ${task}"
   \`\`\`
2. Create feature branch: \`git checkout -b ui-cycle-${timestamp}\`
3. Deploy to production (platform-specific)
4. Verify production (console clean, screenshot)

**Artifacts:**
- \`git-commit-sha.txt\`
- \`deployment-url.txt\`
- \`screenshots/production.png\`

---
EOF

  append_phase_checklist "Deploy" "5" "$prompts_per_phase" "$cycle_file"

  cat >>"$cycle_file" <<EOF

### Phase 6: Close (3 min)

**Objective:** Archive artifacts and generate report

**Steps:**
1. Generate cycle report
2. Archive artifacts: \`cp -r ${run_dir} /archive/ui-cycles/${timestamp}/\`
3. Update index: \`echo "${timestamp}|${task}|success|url" >> /archive/ui-cycles/index.csv\`
4. Cleanup local: \`rm -rf ${run_dir}\`

**Artifacts:**
- Cycle report (markdown)
- Archived artifacts in \`/archive/ui-cycles/${timestamp}/\`
- Updated index in \`/archive/ui-cycles/index.csv\`

---
EOF

  append_phase_checklist "Close" "6" "$prompts_per_phase" "$cycle_file"

  cat >>"$cycle_file" <<EOF

## Loop Tracking

Track your loops here:
\`\`\`yaml
loops:
  build: 0/2
  verify: 0/2
\`\`\`

**Escalate when:**
- Build loops reach 2
- Verify loops reach 2
- Total time exceeds 90 minutes
- Production deployment fails

## Progress Report Format

Update after each phase:

\`\`\`markdown
## UI Cycle Progress - {PHASE}

**Task:** ${task}
**Status:** {emoji} {status_message}
**Run Directory:** .runs/ui-cycle-${timestamp}/

**Done:**
- ✅ {completed_action_1}
- ✅ {completed_action_2}

**Artifacts:**
- ${run_dir}/screenshots/before/*.png
- ${run_dir}/logs/console.json

**Next:** {next_action}

**Blocking Issues:** {blockers}
\`\`\`

## MCP Servers Required

- **chrome-devtools**: Navigate, screenshots, console inspection
- **playwright**: Automated testing, visual regression
- **serena**: Code analysis, component location
- **filesystem**: Artifact management, file operations

## Quick Reference

```bash
# Navigate to URL (Chrome MCP)
# Take screenshot (Chrome MCP)
# Get console logs (Chrome MCP)

# Run tests
npx playwright test

# Type check
npm run type-check

# Lint
npm run lint

# Commit
git add src/
git commit -m "feat(scope): description"
git push

# Deploy (platform-specific)
npx wrangler deploy  # Cloudflare
vercel --prod         # Vercel
netlify deploy --prod # Netlify
```

## Completion Checklist

At cycle completion:
- [ ] All 6 phases completed
- [ ] All verification gates passed
- [ ] Production deployed and verified
- [ ] Cycle report generated
- [ ] Artifacts archived
- [ ] Index updated
- [ ] Local directory cleaned
EOF

  success "UI Cycle created:"
  info "  run:      .runs/ui-cycle-${timestamp}/"
  info "  cycle:    cycle.md"
  info "  task:     ${task}"
  info "  url:      ${url}"
  info "  component:${component}"
  info ""
  info "Next steps:"
  info "  1. Load the UI Cycle agent:"
  info "     load agent custom/agents/ui-cycle"
  info ""
  info "  2. Execute the cycle:"
  info "     *ui-cycle \"${task}\" --url=${url} --component=${component}"
  info ""
  info "  3. Or work through phases manually in cycle.md"
  info ""

  # Send notification if available
  if [[ -x "${SCRIPT_DIR}/notify.sh" ]]; then
    "${SCRIPT_DIR}/notify.sh" --local "[UI Cycle] Created: ${task}" 2>/dev/null || true
  fi
fi
