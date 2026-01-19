#!/bin/bash
#
# Check Blackbox4 dependencies
# Verifies all required and optional dependencies
#

BB4_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✅]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠️ ]${NC} $1"
}

log_error() {
    echo -e "${RED}[❌]${NC} $1"
}

echo "=== Blackbox4 Dependency Check ==="
echo

# Counters
total=0
satisfied=0
warnings=0
errors=0

# Check Claude Code CLI
((total++))
if command -v claude &> /dev/null; then
    claude_version=$(claude --version 2>/dev/null || echo "unknown")
    log_success "Claude Code CLI: installed ($claude_version)"
    ((satisfied++))
else
    log_error "Claude Code CLI: not found"
    echo "   Install from: https://claude.ai/code"
    ((errors++))
fi

# Check Bash version
((total++))
if [[ -n "$BASH_VERSION" ]]; then
    bash_major=$(echo "$BASH_VERSION" | cut -d. -f1)
    if [[ $bash_major -ge 4 ]]; then
        log_success "Bash: $BASH_VERSION (4.0+ required)"
        ((satisfied++))
    else
        log_error "Bash: $BASH_VERSION (4.0+ required)"
        ((errors++))
    fi
else
    log_error "Bash: not found"
    ((errors++))
fi

# Check jq
((total++))
if command -v jq &> /dev/null; then
    jq_version=$(jq --version 2>/dev/null)
    log_success "jq: $jq_version"
    ((satisfied++))
else
    log_warning "jq: not installed (optional)"
    echo "   Install: brew install jq  # macOS"
    ((warnings++))
fi

# Check yq
((total++))
if command -v yq &> /dev/null; then
    yq_version=$(yq --version 2>/dev/null | head -1)
    log_success "yq: $yq_version"
    ((satisfied++))
else
    log_warning "yq: not installed (optional)"
    echo "   Install: brew install yq  # macOS"
    ((warnings++))
fi

# Check Python 3
((total++))
if command -v python3 &> /dev/null; then
    python_version=$(python3 --version 2>/dev/null)
    log_success "Python: $python_version"
    ((satisfied++))
else
    log_warning "Python 3: not found (optional)"
    echo "   Some scripts may require Python 3.10+"
    ((warnings++))
fi

# Check MCP servers
((total++))
mcp_config="$HOME/.claude/mcp.json"
if [[ -f "$mcp_config" ]]; then
    # Count configured MCP servers
    mcp_count=$(jq '.mcpServers | length' "$mcp_config" 2>/dev/null || echo "0")

    # Check for specific servers
    filesystem=$(jq -r '.mcpServers | keys[] | select(contains("filesystem") or contains("filesystem-mcp"))' "$mcp_config" 2>/dev/null | wc -l)
    supabase=$(jq -r '.mcpServers | keys[] | select(contains("supabase"))' "$mcp_config" 2>/dev/null | wc -l)
    github=$(jq -r '.mcpServers | keys[] | select(contains("github"))' "$mcp_config" 2>/dev/null | wc -l)

    if [[ $filesystem -gt 0 ]]; then
        log_success "Filesystem MCP: configured ($filesystem server(s))"
        ((satisfied++))
    else
        log_error "Filesystem MCP: not configured"
        ((errors++))
    fi

    if [[ $supabase -gt 0 ]]; then
        log_success "Supabase MCP: configured ($supabase server(s))"
    else
        log_warning "Supabase MCP: not configured (optional)"
        ((warnings++))
    fi

    if [[ $github -gt 0 ]]; then
        log_success "GitHub MCP: configured ($github server(s))"
    else
        log_warning "GitHub MCP: not configured (optional)"
        ((warnings++))
    fi

    echo ""
    log_info "Total MCP servers configured: $mcp_count"
else
    log_warning "MCP config not found at $mcp_config"
    log_info "MCP servers will be configured when you run Claude Code CLI"
    ((warnings++))
fi

# Check system tools
echo ""
log_info "System Tools:"

# Check find
((total++))
if command -v find &> /dev/null; then
    log_success "find: installed"
    ((satisfied++))
else
    log_error "find: not found"
    ((errors++))
fi

# Check grep
((total++))
if command -v grep &> /dev/null; then
    log_success "grep: installed"
    ((satisfied++))
else
    log_error "grep: not found"
    ((errors++))
fi

# Summary
echo ""
echo "==================================="
echo "           Summary"
echo "==================================="
echo ""
echo "Total checks:    $total"
echo -e "${GREEN}Satisfied:       $satisfied${NC}"
echo -e "${YELLOW}Warnings:        $warnings${NC}"
echo -e "${RED}Errors:          $errors${NC}"
echo ""

# Calculate satisfaction rate
if [[ $total -gt 0 ]]; then
    rate=$((satisfied * 100 / total))
    echo "Satisfaction rate: ${rate}%"
    echo ""
fi

# Exit with appropriate code
if [[ $errors -gt 0 ]]; then
    log_error "Dependency check failed with $errors error(s)"
    echo ""
    echo "Please install missing dependencies and run again."
    exit 1
elif [[ $warnings -gt 0 ]]; then
    log_warning "Dependency check passed with $warnings warning(s)"
    echo ""
    echo "Core dependencies are satisfied. Optional dependencies are missing."
    exit 0
else
    log_success "All dependencies satisfied!"
    echo ""
    echo "Blackbox4 is ready to use."
    exit 0
fi
