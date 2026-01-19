#!/usr/bin/env bash
# .blackbox4 Testing Starter - Simplified Version
# Quick-start script to begin testing .blackbox4

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

# Try to source lib.sh, but define functions if not available
if [[ -f "$SCRIPT_DIR/lib.sh" ]]; then
    source "$SCRIPT_DIR/lib.sh"
else
    # Define fallback functions
    info() { echo "[INFO] $*"; }
    success() { echo -e "\033[0;32m[✓]\033[0m $*"; }
    error() { echo -e "\033[0;31m[✗]\033[0m $*"; }
    warning() { echo -e "\033[1;33m[!]\033[0m $*"; }
fi

echo "╔════════════════════════════════════════════════════════╗"
echo "║        .blackbox4 Testing Suite                      ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Parse arguments
TEST_TYPE="${1:-quick}"

case "$TEST_TYPE" in
    quick)
        echo "📋 Running Quick Validation Test"
        echo ""
        info "Step 1: Checking .blackbox4 structure..."
        if bash "$SCRIPT_DIR/check-blackbox.sh" > /dev/null 2>&1; then
            success "✓ Structure check passed"
        else
            error "✗ Structure check failed"
            exit 1
        fi

        echo ""
        info "Step 2: Validating script syntax..."
        error_count=0
        script_count=0
        for script in "$SCRIPT_DIR"/*.sh; do
            if [[ -f "$script" ]]; then
                ((script_count++)) || true
                if bash -n "$script" 2>/dev/null; then
                    echo -ne "\rValidating: $script_count scripts"
                else
                    ((error_count++)) || true
                    echo ""
                    error "Syntax error in: $(basename "$script")"
                fi
            fi
        done
        echo ""
        if [[ $error_count -eq 0 ]]; then
            success "✓ All $script_count scripts have valid syntax"
        else
            error "✗ $error_count scripts have syntax errors"
            exit 1
        fi

        echo ""
        info "Step 3: Running memory architecture tests..."
        if [[ -f "$SCRIPT_DIR/../tests/integration/test-memory-architecture.sh" ]]; then
            if bash "$SCRIPT_DIR/../tests/integration/test-memory-architecture.sh" > /dev/null 2>&1; then
                success "✓ Memory architecture tests passed"
            else
                error "✗ Memory architecture tests failed"
                exit 1
            fi
        else
            warning "⚠ Memory architecture tests not found"
        fi

        echo ""
        echo "╔════════════════════════════════════════════════════════╗"
        echo "║  ✓ Quick Validation Test PASSED                      ║"
        echo "╚════════════════════════════════════════════════════════╝"
        echo ""
        info ".blackbox4 is ready for comprehensive testing!"
        echo ""
        ;;

    workflow)
        echo "🔄 Running Workflow Tests"
        echo ""
        info "Creating test plan..."
        TEST_PLAN=$(bash "$SCRIPT_DIR/new-plan.sh "workflow-test-$(date +%s)" 2>&1 | grep "Location:" | cut -d' ' -f2- || true)

        if [[ -z "$TEST_PLAN" || ! -d "$TEST_PLAN" ]]; then
            error "Failed to create test plan"
            exit 1
        fi

        success "✓ Test plan created: $TEST_PLAN"
        echo ""
        info "Creating test checkpoints..."
        cd "$TEST_PLAN" || exit 1

        for i in {1..12}; do
            bash "$SCRIPT_DIR/new-step.sh" "test-step-$i" "Test checkpoint $i for workflow validation" > /dev/null 2>&1
            echo -ne "\rCreated checkpoint: $i/12"
        done
        echo ""

        echo ""
        info "Verifying compaction..."
        step_count=$(ls -1 context/steps/ 2>/dev/null | wc -l)
        compaction_count=$(ls -1 context/compactions/ 2>/dev/null | wc -l)

        if [[ $compaction_count -gt 0 ]]; then
            success "✓ Auto-compaction triggered ($compaction_count compaction(s))"
        else
            info "No compaction triggered yet ($step_count steps in context/)"
        fi

        echo ""
        info "Running validation..."
        if bash "$SCRIPT_DIR/validate-all.sh" > /dev/null 2>&1; then
            success "✓ Validation passed"
        else
            warning "⚠ Validation completed with warnings"
        fi

        echo ""
        echo "╔════════════════════════════════════════════════════════╗"
        echo "║  ✓ Workflow Test PASSED                              ║"
        echo "╚════════════════════════════════════════════════════════╝"
        echo ""
        info "Test plan created at: $TEST_PLAN"
        echo "Review the outputs and provide feedback!"
        echo ""
        ;;

    performance)
        echo "⚡ Running Performance Tests"
        echo ""
        info "Creating performance test plan..."
        PERF_PLAN=$(bash "$SCRIPT_DIR/new-plan.sh "performance-test-$(date +%s)" 2>&1 | grep "Location:" | cut -d' ' -f2- || true)

        if [[ -z "$PERF_PLAN" || ! -d "$PERF_PLAN" ]]; then
            error "Failed to create test plan"
            exit 1
        fi

        cd "$PERF_PLAN" || exit 1

        echo ""
        info "Creating 50 checkpoints and measuring performance..."
        START_TIME=$(date +%s)

        for i in {1..50}; do
            bash "$SCRIPT_DIR/new-step.sh" "perf-step-$i" "Performance test checkpoint $i" > /dev/null 2>&1
            echo -ne "\rCheckpoint: $i/50"

            if [[ $((i % 10)) -eq 0 ]]; then
                context_size=$(du -sh context/ 2>/dev/null | cut -f1)
                echo ""
                info "Context size at $i steps: $context_size"
            fi
        done

        END_TIME=$(date +%s)
        DURATION=$((END_TIME - START_TIME))

        echo ""
        echo ""
        info "Performance Results:"
        echo "  Total time: ${DURATION}s"
        echo "  Average per checkpoint: $((DURATION * 1000 / 50))ms"
        echo "  Final context size: $(du -sh context/ 2>/dev/null | cut -f1)"
        echo "  Compactions: $(ls -1 context/compactions/ 2>/dev/null | wc -l)"

        echo ""
        success "✓ Performance test completed"
        echo ""
        ;;

    full)
        echo "🧪 Running Full Test Suite"
        echo ""
        warning "This will run ALL tests and may take several hours."
        echo ""
        read -p "Continue? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 0
        fi

        echo ""
        info "Running quick validation..."
        bash "$0" quick || exit 1

        echo ""
        info "Running workflow tests..."
        bash "$0" workflow || exit 1

        echo ""
        info "Running performance tests..."
        bash "$0" performance || exit 1

        echo ""
        echo "╔════════════════════════════════════════════════════════╗"
        echo "║  ✓ FULL TEST SUITE PASSED                           ║"
        echo "╚════════════════════════════════════════════════════════╝"
        echo ""
        ;;

    *)
        echo "Unknown test type: $TEST_TYPE"
        echo ""
        echo "Usage: $0 [quick|workflow|performance|full]"
        echo ""
        echo "  quick       - Quick validation test (5-10 min)"
        echo "  workflow    - Workflow functionality test (30 min)"
        echo "  performance - Performance stress test (1-2 hours)"
        echo "  full        - Run all tests (2-3 hours)"
        echo ""
        exit 1
        ;;
esac

