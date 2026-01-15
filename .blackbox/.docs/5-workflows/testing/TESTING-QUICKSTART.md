# Blackbox3 Testing Quick Start

**Ready to test Blackbox3? Here's how to start in 5 minutes.**

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Navigate to Blackbox3
```bash
cd /Users/shaansisodia/DEV/AI-HUB/"Black Box Factory/current/Blackbox3"
```

### Step 2: Run Quick Validation
```bash
./scripts/start-testing.sh quick
```

**Expected output:**
```
╔════════════════════════════════════════════════════════╗
║        Blackbox3 Testing Suite                      ║
╚════════════════════════════════════════════════════════╝

📋 Running Quick Validation Test

Step 1: Checking Blackbox3 structure...
✓ Structure check passed

Step 2: Validating script syntax...
Validating: 56 scripts
✓ All 56 scripts have valid syntax

Step 3: Testing Python imports...
✓ Python imports successful

Step 4: Running memory architecture tests...
✓ Memory architecture tests passed

╔════════════════════════════════════════════════════════╗
║  ✓ Quick Validation Test PASSED                      ║
╚════════════════════════════════════════════════════════╝
```

### Step 3: Celebrate! 🎉
If all checks pass, Blackbox3 is working!

---

## 📋 Testing Options

### 1. Quick Validation (5-10 minutes)
**What:** Validate system components
**When:** First time setup, after changes
**Command:**
```bash
./scripts/start-testing.sh quick
```

**Tests:**
- ✅ Blackbox3 structure
- ✅ Script syntax (all 56)
- ✅ Python imports
- ✅ Memory architecture (13 tests)

---

### 2. Workflow Test (30 minutes)
**What:** Test core workflows end-to-end
**When:** After quick validation passes
**Command:**
```bash
./scripts/start-testing.sh workflow
```

**Tests:**
- ✅ Plan creation
- ✅ Checkpoint system (12 steps)
- ✅ Auto-compaction
- ✅ Validation
- ✅ Artifact management

---

### 3. Performance Test (1-2 hours)
**What:** Stress test with 50+ checkpoints
**When:** After workflow test passes
**Command:**
```bash
./scripts/start-testing.sh performance
```

**Tests:**
- ✅ 50 checkpoint creation
- ✅ Execution timing
- ✅ Context growth measurement
- ✅ Memory usage
- ✅ Compaction cycles

---

### 4. Full Test Suite (2-3 hours)
**What:** Run all tests sequentially
**When:** Comprehensive validation
**Command:**
```bash
./scripts/start-testing.sh full
```

**Tests:**
- ✅ All quick tests
- ✅ All workflow tests
- ✅ All performance tests

---

## 🎯 Manual Testing Scenarios

### Scenario 1: Simple Research Task (30 min)
**Goal:** Research top 5 tools in a category

```bash
# 1. Create plan
./scripts/new-plan.sh "research-task"

# 2. Navigate to plan
cd agents/.plans/$(ls -t agents/.plans/ | head -1)

# 3. Add checkpoints
./../../scripts/new-step.sh "research" "Found 5 tools"
./../../scripts/new-step.sh "analysis" "Compared features"
./../../scripts/new-step.sh "synthesis" "Created comparison matrix"

# 4. Validate
./../../scripts/validate-all.sh

# 5. Promote artifacts
./../../scripts/promote.sh . ~/Desktop/research-output
```

**What to test:**
- [ ] Plan creates with 13 templates
- [ ] Checkpoints numbered correctly
- [ ] Files save to right locations
- [ ] Validation passes
- [ ] Promotion works

---

### Scenario 2: Complex Multi-Agent Task (2 hours)
**Goal:** Use multiple agents for a feature

```bash
# 1. Create run (execution mode)
./scripts/new-run.sh "feature-design"

# 2. Navigate to run
cd agents/.plans/$(ls -t agents/.plans/ | head -1)

# 3. Simulate agent handoffs
./../../scripts/new-step.sh "analyst" "Competitor analysis complete"
./../../scripts/new-step.sh "pm" "PRD drafted"
./../../scripts/new-step.sh "architect" "System design complete"
./../../scripts/new-step.sh "dev" "Implementation plan ready"

# 4. Create tranche report
./../../scripts/new-tranche.sh "phase1" "Planning phase complete"

# 5. Validate
./../../scripts/validate-loop.sh
```

**What to test:**
- [ ] Run folder created with run-meta.yaml
- [ ] Multiple agents can coordinate
- [ ] Tranche reports generate
- [ ] Loop validation works
- [ ] Context stays manageable

---

### Scenario 3: Long-Running Session (6 hours)
**Goal:** Test extended session with 50+ steps

```bash
# 1. Create plan
./scripts/new-plan.sh "long-session-test"

# 2. Navigate
cd agents/.plans/$(ls -t agents/.plans/ | head -1)

# 3. Create 50+ checkpoints over time
for i in {1..50}; do
    ./../../scripts/new-step.sh "task-$i" "Completed task $i"
    echo "Created checkpoint $i/50"
    sleep 2  # Simulate work
done

# 4. Check compactions
ls -lh context/compactions/

# 5. Measure final context
du -sh context/
```

**What to test:**
- [ ] All 50 checkpoints create
- [ ] Auto-compaction triggers (should happen 5 times)
- [ ] Context stays manageable
- [ ] No performance degradation
- [ ] AI maintains context throughout

---

## 📊 Collecting Feedback

### During Testing

**After each test scenario:**

1. **Open feedback template:**
   ```bash
   open "../../FEEDBACK-TEMPLATE.md"
   ```

2. **Fill out:**
   - What worked ✅
   - What failed ❌
   - Pain points 😤
   - Suggestions 💡
   - Metrics 📊

3. **Save with test name:**
   ```bash
   cp "../../FEEDBACK-TEMPLATE.md" \
      "feedback-$(date +%Y%m%d-%H%M%S).md"
   ```

### Key Metrics to Track

| Metric | How to Measure |
|--------|----------------|
| **Time to complete** | Track start/end time |
| **Commands used** | Count unique commands |
| **Errors encountered** | Log error count |
| **Context size** | `du -sh context/` |
| **Compactions** | `ls context/compactions/ \| wc -l` |
| **Memory usage** | `ps aux \| grep blackbox3` |

---

## 🐛 When Things Go Wrong

### Error: "Command not found"
**Fix:** Make sure scripts are executable
```bash
chmod +x scripts/*.sh
```

### Error: "Python import failed"
**Fix:** Check Python path
```bash
which python3
python3 --version  # Should be 3.8+
```

### Error: "Invalid YAML"
**Fix:** Validate agent configs
```bash
python3 -c "import yaml; yaml.safe_load(open('agents/xxx.agent.yaml'))"
```

### Error: "Context overflow"
**Fix:** Run compaction manually
```bash
./scripts/compact-context.sh
```

---

## 📈 Testing Checklist

### Day 1: Component Validation
- [ ] Run `./scripts/start-testing.sh quick`
- [ ] Verify all checks pass
- [ ] Document any failures
- [ ] Fix critical issues

### Day 2: Workflow Testing
- [ ] Run `./scripts/start-testing.sh workflow`
- [ ] Test Scenario 1: Simple Task
- [ ] Collect feedback
- [ ] Document issues

### Day 3: Extended Testing
- [ ] Test Scenario 2: Multi-Agent
- [ ] Test Scenario 3: Long Session (partial)
- [ ] Collect feedback
- [ ] Document patterns

### Day 4: Performance Testing
- [ ] Run `./scripts/start-testing.sh performance`
- [ ] Complete Scenario 3: Long Session
- [ ] Measure all metrics
- [ ] Document bottlenecks

### Day 5: Analysis
- [ ] Compile all feedback
- [ ] Identify improvement areas
- [ ] Create recommendations
- [ ] Prioritize improvements

---

## 🎬 Ready to Start?

**Execute this command right now:**

```bash
cd /Users/shaansisodia/DEV/AI-HUB/"Black Box Factory/current/Blackbox3" && \
./scripts/start-testing.sh quick
```

**In 5 minutes, you'll know:**
- ✅ Is Blackbox3 working?
- ✅ Are all components functional?
- ✅ What needs fixing?

**Then proceed to:**
```bash
./scripts/start-testing.sh workflow  # 30 minutes
./scripts/start-testing.sh performance  # 1-2 hours
./scripts/start-testing.sh full  # 2-3 hours
```

---

## 📚 Reference Documents

- **Testing Strategy:** `../BLACKBOX3-TESTING-STRATEGY.md`
- **Feedback Template:** `../FEEDBACK-TEMPLATE.md`
- **Typeless AI Guide:** `../TYPELESS-AI-GUIDE.md`
- **Blackbox3 README:** `README.md`

---

**Happy Testing! 🧪**

**Remember:** The goal is not just to find bugs, but to understand how Blackbox3 performs in real-world usage. Every issue you find makes the system better!
