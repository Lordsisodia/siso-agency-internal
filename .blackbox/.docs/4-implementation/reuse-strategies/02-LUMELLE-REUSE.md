# 02 - Lumelle Blackbox Reuse Strategy

**Status:** ✅ ALREADY DONE (NO ACTION NEEDED)
**Source:** Already in `Blackbox3/scripts/`
**Reference:** `Blackbox3/LUMELLE-SCRIPTS-INTEGRATION.md`

**Action:** Just keep existing scripts. No changes needed.

---

## 📦 What You Already Have

All 5 Lumelle Blackbox scripts are **already integrated** into Blackbox3.

| Script | Location in Blackbox3 | Purpose | Status |
|--------|----------------------|---------|--------|
| `validate-docs.py` | `scripts/python/validate-docs.py` | Documentation structure validator | ✅ Working |
| `plan-status.py` | `scripts/python/plan-status.py` | Plan status tracker | ✅ Working |
| `validate-loop.sh` | `scripts/validate-loop.sh` | Periodic validation monitor | ✅ Working |
| `start-10h-monitor.sh` | `scripts/start-10h-monitor.sh` | Long-run monitoring | ✅ Working |
| `check-vendor-leaks.sh` | `scripts/check-vendor-leaks.sh` | Vendor independence checker | ✅ Working |

---

## 🔍 Verification

These scripts are already in Blackbox3. Let's verify:

```bash
# Check if Lumelle scripts exist in Blackbox3
ls -lh "Black Box Factory/current/Blackbox3/scripts/python/validate-docs.py"
ls -lh "Black Box Factory/current/Blackbox3/scripts/python/plan-status.py"
ls -lh "Black Box Factory/current/Blackbox3/scripts/validate-loop.sh"
ls -lh "Black Box Factory/current/Blackbox3/scripts/start-10h-monitor.sh"
ls -lh "Black Box Factory/current/Blackbox3/scripts/check-vendor-leaks.sh"
```

**Expected Output:** All 5 scripts exist and are executable.

---

## ✅ What You Get After Copying Blackbox3

When you copy Blackbox3 to `blackbox4/` (see 01-BLACKBOX3-REUSE.md), you automatically get:

1. ✅ **validate-docs.py** - Ensures documentation follows 6-10 root folders rule
2. ✅ **plan-status.py** - Monitors plan/run progress with artifact tracking
3. ✅ **validate-loop.sh** - Continuously monitors workspace for issues
4. ✅ **start-10h-monitor.sh** - Simplified interface for 10-20 hour monitoring
5. ✅ **check-vendor-leaks.sh** - Detects vendor-specific IDs and copy

**Total:** 5 production-ready scripts, 0 new code to write.

---

## 🚀 How to Use (Already Working)

### 1. Documentation Validation

```bash
cd blackbox4
python scripts/python/validate-docs.py
```

**What it does:**
- Validates 6-10 visible root folders
- Checks README.md in each root folder
- Validates 1-10 child folders per root
- Detects nested .blackbox folders (only root-level allowed)

**Exit codes:** 0 = OK, 1 = FAIL

---

### 2. Plan Status Tracking

```bash
# View status
python scripts/python/plan-status.py --plan agents/.plans/my-plan

# Write status to artifacts
python scripts/python/plan-status.py --plan agents/.plans/my-plan --write
```

**What it does:**
- Tracks decisions (target_user, license_policy)
- Artifact presence + size + mtime for each plan
- Memory step/compaction cadence
- Progress vs targets
- NO external dependencies (pure Python stdlib)

**Output:** Markdown status report to stdout or `<plan>/artifacts/status.md`

---

### 3. Periodic Validation

```bash
# Basic monitoring (every 15 minutes)
./scripts/validate-loop.sh

# Auto-fix template drift
./scripts/validate-loop.sh --auto-sync

# One-time validation check
./scripts/validate-loop.sh --once

# Limited duration (10 runs, then stop)
./scripts/validate-loop.sh --max-runs 10

# With notifications
./scripts/validate-loop.sh --interval-min 15 --notify-local --notify-telegram
```

**What it does:**
- Runs validate-all.sh every N minutes
- Logs results with timestamps
- Sends notifications on failures
- Auto-fixes template drift with --auto-sync
- Monitors feature research health
- Tracks tranche quality
- Updates dashboards periodically

**Stop:** Ctrl+C

**Output:**
- Log file: `.local/validate-loop.log`
- Status JSON: `.local/validate-status.json`

---

### 4. Long-Run Monitoring

```bash
# Basic 20-minute interval with local notifications
./scripts/start-10h-monitor.sh --interval-min 20 --notify-local

# With Telegram notifications
./scripts/start-10h-monitor.sh --interval-min 30 --notify-telegram

# Both notification types
./scripts/start-10h-monitor.sh --interval-min 15 --notify-local --notify-telegram
```

**What it does:**
- Wrapper around validate-loop.sh
- Configurable interval (default: 20 min)
- Local and Telegram notifications
- Recovery notifications

**Stop:** Ctrl+C

---

### 5. Vendor Leak Detection

```bash
# Report-only (default)
./scripts/check-vendor-leaks.sh

# Fail on violations (CI/pre-commit)
./scripts/check-vendor-leaks.sh --fail

# Scan specific source directory
./scripts/check-vendor-leaks.sh --src ./src
```

**What it does:**
- Detects vendor IDs (e.g., Shopify GIDs)
- Detects vendor-specific checkout copy
- Base64-encoded vendor ID detection (obfuscated leaks)
- Allow-list for transitional matches
- Report-only or fail modes

**Patterns detected:**
- `gid://shopify/`
- "Preparing Shopify checkout"
- "Secure checkout (Shopify)"
- `stripe.com`
- `api.stripe.com`
- Base64-encoded vendor IDs

---

## 📊 Integration Summary

| Component | Source | Status in Blackbox3 | Action |
|-----------|--------|-------------------|--------|
| Lumelle Scripts | `lumelle-blackbox/docs/.blackbox/scripts/` | ✅ Already integrated | Just keep |
| Path Adaptation | Done (paths updated) | ✅ Complete | No changes |
| Documentation | `LUMELLE-SCRIPTS-INTEGRATION.md` | ✅ Complete | No changes |

---

## ✅ Success Criteria

After copying Blackbox3 to `blackbox4/`:

1. ✅ All 5 Lumelle scripts exist and are executable
2. ✅ All scripts work as documented
3. ✅ No additional changes needed
4. ✅ Just use existing functionality

---

## 🎯 Next Step

**Go to:** `03-OPENCODE-REUSE.md`

**Add Oh-My-OpenCode integration (MCP, enhanced agents, LSP).**
