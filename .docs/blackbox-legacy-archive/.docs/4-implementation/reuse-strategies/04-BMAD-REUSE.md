# 04 - BMAD Reuse Strategy

**Status:** ✅ ALREADY INTEGRATED (ADD ONE SCRIPT)
**Source:** `Blackbox3/agents/bmad/` + Blackbox Implementation Plan/Evaluations/02-BMAD-METHOD.md`
**Destination:** `blackbox4/agents/bmad/`

**Action:** Keep existing BMAD agents, add one BMAD phase tracker script.

---

## 📦 What You Already Have

### A. 12+ BMAD Agents (Already in Blackbox3)

**Location:** `blackbox4/agents/bmad/` (after copying Blackbox3)

**Agents:**

| Agent | File | Purpose | Status |
|-------|------|---------|--------|
| **Mary (Analyst)** | `mary.agent.yaml` | Research & competitive analysis | ✅ Working |
| **John (PM)** | `john.agent.yaml` | Product requirements & PRDs | ✅ Working |
| **Winston (Architect)** | `winston.agent.yaml` | System architecture & design | ✅ Working |
| **Dev (Developer)** | `dev.agent.yaml` | Implementation & coding | ✅ Working |
| **QA (QA Engineer)** | `qa.agent.yaml` | Testing & validation | ✅ Working |
| **SM (Scrum Master)** | `sm.agent.yaml` | Sprint management | ✅ Working |
| **UX Designer** | `ux-designer.agent.yaml` | User experience design | ✅ Working |
| **Tech Writer** | `tech-writer.agent.yaml` | Documentation | ✅ Working |
| **Security Expert** | `security.agent.yaml` | Security patterns & review | ✅ Working |
| **DevOps Engineer** | `devops.agent.yaml` | DevOps & deployment | ✅ Working |
| **Data Engineer** | `data.agent.yaml` | Data pipelines & ETL | ✅ Working |

**Total:** 12 production-ready BMAD agents.

---

### B. BMAD 4-Phase Methodology (Already Documented)

**Location:** `Blackbox3/agents/bmad/workflows/four-phase.md`

**Phases:**

| Phase | Name | Purpose | Deliverables |
|-------|------|---------|-------------|
| **Phase 1** | Analysis | Research, brainstorming, product brief | Product Brief |
| **Phase 2** | Planning | PRD, tech spec, UX design | PRD, Tech Spec, UX Design |
| **Phase 3** | Solutioning | Architecture, epics/stories | Architecture, Epics, Stories |
| **Phase 4** | Implementation | Sprint planning, story dev, code review | Working Code |

**Status:** ✅ Methodology documented in `workflows/four-phase.md`.

---

### C. BMAD Workflows (Already Documented)

**Location:** `blackbox4/agents/bmad/workflows/`

**Workflows:**

| Workflow | File | Purpose | Status |
|----------|------|---------|--------|
| **Analysis** | `analysis.md` | Phase 1 workflows | ✅ Documented |
| **Planning** | `planning.md` | Phase 2 workflows | ✅ Documented |
| **Solutioning** | `solutioning.md` | Phase 3 workflows | ✅ Documented |
| **Implementation** | `implementation.md` | Phase 4 workflows | ✅ Documented |

**Total:** 4 workflow documents with 50+ step-by-step processes.

---

## 🔧 Add: BMAD Phase Tracker Script

This is the **only new code** to write in this section.

**Create:** `blackbox4/scripts/bmad-phase-tracker.sh`

```bash
#!/usr/bin/env bash
# BMAD 4-Phase Tracker
# Source: Blackbox Implementation Plan/Evaluations/02-BMAD-METHOD.md
# Adds BMAD phase discipline to Blackbox4

PLAN_DIR="$(pwd)"
PHASE_FILE="$PLAN_DIR/.phase"
BMAD_WORKFLOWS="$PLAN_DIR/agents/bmad/workflows"

# BMAD Phases
PHASE_ANALYSIS="analysis"
PHASE_PLANNING="planning"
PHASE_SOLUTIONING="solutioning"
PHASE_IMPLEMENTATION="implementation"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Show current phase
show_phase() {
    if [[ -f "$PHASE_FILE" ]]; then
        local phase=$(cat "$PHASE_FILE" 2>/dev/null | grep "^phase:" | cut -d' ' -f2)
        case "$phase" in
            $PHASE_ANALYSIS)
                echo -e "${GREEN}Current Phase: Analysis${NC}"
                ;;
            $PHASE_PLANNING)
                echo -e "${YELLOW}Current Phase: Planning${NC}"
                ;;
            $PHASE_SOLUTIONING)
                echo -e "${YELLOW}Current Phase: Solutioning${NC}"
                ;;
            $PHASE_IMPLEMENTATION)
                echo -e "${GREEN}Current Phase: Implementation${NC}"
                ;;
            *)
                echo -e "${RED}No phase set${NC}"
                ;;
        esac
    else
        echo -e "${YELLOW}No phase file found${NC}"
    fi
}

# Set current phase
set_phase() {
    local phase="$1"
    
    # Validate phase
    case "$phase" in
        $PHASE_ANALYSIS|$PHASE_PLANNING|$PHASE_SOLUTIONING|$PHASE_IMPLEMENTATION)
            # Valid phase
            ;;
        *)
            echo -e "${RED}Error: Invalid phase '$phase'${NC}"
            echo "Valid phases: $PHASE_ANALYSIS, $PHASE_PLANNING, $PHASE_SOLUTIONING, $PHASE_IMPLEMENTATION"
            return 1
            ;;
    esac
    
    # Write phase file
    echo "phase: $phase" > "$PHASE_FILE"
    
    # Show workflow guidance
    if [[ -d "$BMAD_WORKFLOWS" ]]; then
        local workflow_file="$BMAD_WORKFLOWS/${phase}.md"
        if [[ -f "$workflow_file" ]]; then
            echo ""
            echo "--- BMAD ${phase^} Workflow ---"
            head -20 "$workflow_file"
            echo "---"
            echo ""
            echo "Full workflow: cat $workflow_file"
        fi
    fi
    
    echo -e "${GREEN}Phase set to: $phase${NC}"
    return 0
}

# Validate we're in the right phase for current task
validate_phase() {
    local expected="$1"
    local current=$(cat "$PHASE_FILE" 2>/dev/null | grep "^phase:" | cut -d' ' -f2)
    
    if [[ "$current" != "$expected" ]]; then
        echo -e "${RED}Error: Current phase is '$current', but task requires '$expected'${NC}"
        echo "Use: bmad-phase set $expected"
        return 1
    fi
    
    echo -e "${GREEN}Phase validated: $current${NC}"
    return 0
}

# Show phase requirements
show_requirements() {
    local phase=$(cat "$PHASE_FILE" 2>/dev/null | grep "^phase:" | cut -d' ' -f2)
    
    if [[ -z "$phase" ]]; then
        echo "No phase set"
        return 1
    fi
    
    case "$phase" in
        $PHASE_ANALYSIS)
            echo "Analysis Phase Requirements:"
            echo "- Research conducted"
            echo "- Competitive analysis complete"
            echo "- Product brief created"
            ;;
        $PHASE_PLANNING)
            echo "Planning Phase Requirements:"
            echo "- PRD written"
            echo "- Technical spec created"
            echo "- UX design complete"
            ;;
        $PHASE_SOLUTIONING)
            echo "Solutioning Phase Requirements:"
            echo "- Architecture designed"
            echo "- Epics and stories defined"
            echo "- Implementation plan ready"
            ;;
        $PHASE_IMPLEMENTATION)
            echo "Implementation Phase Requirements:"
            echo "- Sprint planning complete"
            echo "- Stories developed"
            echo "- Code reviews passed"
            ;;
    esac
}

# Main CLI
case "$1" in
    show|status)
        show_phase
        ;;
    set)
        if [[ -z "$2" ]]; then
            echo "Usage: $0 set <phase>"
            echo "Phases: $PHASE_ANALYSIS, $PHASE_PLANNING, $PHASE_SOLUTIONING, $PHASE_IMPLEMENTATION"
            exit 1
        fi
        set_phase "$2"
        ;;
    validate)
        if [[ -z "$2" ]]; then
            echo "Usage: $0 validate <expected-phase>"
            exit 1
        fi
        validate_phase "$2"
        ;;
    requirements)
        show_requirements
        ;;
    *)
        echo "BMAD 4-Phase Tracker"
        echo ""
        echo "Usage: $0 {show|set|validate|requirements} [args]"
        echo ""
        echo "Commands:"
        echo "  show           - Show current phase"
        echo "  set <phase>    - Set current phase"
        echo "  validate <phase> - Validate task against phase"
        echo "  requirements    - Show phase requirements"
        echo ""
        echo "Phases:"
        echo "  $PHASE_ANALYSIS       - Research, brainstorming, product brief"
        echo "  $PHASE_PLANNING       - PRD, tech spec, UX design"
        echo "  $PHASE_SOLUTIONING    - Architecture, epics, stories"
        echo "  $PHASE_IMPLEMENTATION - Sprint planning, development, code review"
        exit 1
        ;;
esac
```

**Size:** ~150 lines of new bash code.

---

## 🚀 Installation Command

```bash
# Create BMAD phase tracker script
cat > blackbox4/scripts/bmad-phase-tracker.sh << 'EOF'
[... paste the script above ...]
EOF

# Make executable
chmod +x blackbox4/scripts/bmad-phase-tracker.sh

# Create symlink for convenience
ln -sf "$(pwd)/scripts/bmad-phase-tracker.sh" blackbox4/bmad
```

---

## 🎯 Usage Examples

### Phase 1: Analysis

```bash
cd blackbox4/agents/.plans/my-plan

# Set phase
./scripts/bmad-phase-tracker.sh set analysis

# Show workflow guidance
./scripts/bmad-phase-tracker.sh set analysis
# Output: Shows first 20 lines of analysis.md workflow

# Work with Mary agent
# "Load: agents/bmad/mary.agent.yaml"
# "Run competitive analysis using research workflow"
```

### Phase 2: Planning

```bash
# Set phase
./scripts/bmad-phase-tracker.sh set planning

# Show requirements
./scripts/bmad-phase-tracker.sh requirements
# Output: "PRD written, Technical spec created, UX design complete"

# Work with John agent
# "Load: agents/bmad/john.agent.yaml"
# "Create PRD for this project"
```

### Phase 3: Solutioning

```bash
# Set phase
./scripts/bmad-phase-tracker.sh set solutioning

# Work with Winston agent
# "Load: agents/bmad/winston.agent.yaml"
# "Design system architecture for this feature"
```

### Phase 4: Implementation

```bash
# Set phase
./scripts/bmad-phase-tracker.sh set implementation

# Work with Dev agent
# "Load: agents/bmad/dev.agent.yaml"
# "Implement epics 1-3 from the solutioning phase"
```

---

## ✅ What You Get After This Section

1. ✅ **12 BMAD agents** - Already in Blackbox3
2. ✅ **50+ BMAD workflows** - Already documented
3. ✅ **4-Phase methodology** - Already documented
4. ✅ **BMAD phase tracker** - One new script (~150 lines)
5. ✅ **Phase validation** - Enforce process discipline
6. ✅ **Workflow guidance** - Auto-show relevant workflows

**Total New Code:** ~150 lines (BMAD phase tracker only)
**Total Code Reused:** 100% of BMAD agents and workflows

---

## 📊 Integration Summary

| Component | Source | Size | Action | Status |
|-----------|--------|------|--------|--------|
| **BMAD Agents** | Blackbox3/agents/bmad/ | 12 agents | Keep (already there) |
| **BMAD Workflows** | Blackbox3/agents/bmad/workflows/ | 4 docs | Keep (already there) |
| **Phase Methodology** | Implementation Plan | 1 doc | Already documented |
| **Phase Tracker** | NEW | ~150 lines | Write script |

**Reuse Ratio:** 95% existing, 5% new (phase tracker only)

---

## ✅ Success Criteria

After completing this section:

1. ✅ All 12 BMAD agents present in `blackbox4/agents/bmad/`
2. ✅ All 4 workflow documents present
3. ✅ BMAD phase tracker script created
4. ✅ Can set phase: `./scripts/bmad-phase-tracker.sh set planning`
5. ✅ Can show phase: `./scripts/bmad-phase-tracker.sh show`
6. ✅ Can validate phase: `./scripts/bmad-phase-tracker.sh validate planning`
7. ✅ Phase tracker shows workflow guidance when phase is set
8. ✅ Phase file `.phase` is created in plan directories

---

## 🎯 Next Step

**Go to:** `05-RALPH-REUSE.md`

**Ralph is already integrated in Blackbox3, just use existing integration.**
