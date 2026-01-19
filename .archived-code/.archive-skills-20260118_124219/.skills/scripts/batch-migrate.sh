#!/bin/bash

# BlackBox5 Skills Batch Migration Script
# Migrates all 33 existing skills to new structure

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

MIGRATION_SCRIPT="$(dirname "$0")/migrate-skill.sh"

# Migration mappings: old-category/skill-name -> new-category-path
declare -a MAPPINGS=(
    # Development (1 skill)
    "development/test-driven-development|development-workflow/coding-assistance"

    # MCP Integrations (13 skills)
    "mcp-integrations/supabase|integration-connectivity/mcp-integrations"
    "mcp-integrations/shopify|integration-connectivity/mcp-integrations"
    "mcp-integrations/github|integration-connectivity/mcp-integrations"
    "mcp-integrations/serena|integration-connectivity/mcp-integrations"
    "mcp-integrations/chrome-devtools|integration-connectivity/mcp-integrations"
    "mcp-integrations/playwright|integration-connectivity/mcp-integrations"
    "mcp-integrations/filesystem|integration-connectivity/mcp-integrations"
    "mcp-integrations/sequential-thinking|integration-connectivity/mcp-integrations"
    "mcp-integrations/siso-internal|integration-connectivity/mcp-integrations"
    "mcp-integrations/artifacts-builder|integration-connectivity/mcp-integrations"
    "mcp-integrations/docx|integration-connectivity/mcp-integrations"
    "mcp-integrations/pdf|integration-connectivity/mcp-integrations"
    "mcp-integrations/mcp-builder|integration-connectivity/mcp-integrations"

    # Git Workflow (1 skill)
    "git-workflow/using-git-worktrees|core-infrastructure/development-tools"

    # Documentation (2 skills)
    "documentation/docs-routing|knowledge-documentation/documentation"
    "documentation/feedback-triage|knowledge-documentation/documentation"

    # Testing (1 skill)
    "testing/systematic-debugging|development-workflow/testing-quality"

    # Automation (3 skills)
    "automation/github-cli|core-infrastructure/development-tools"
    "automation/long-run-ops|development-workflow/deployment-ops"
    "automation/ui-cycle|collaboration-communication/automation"

    # Collaboration (6 skills)
    "collaboration/notifications-local|collaboration-communication/collaboration"
    "collaboration/notifications-mobile|collaboration-communication/collaboration"
    "collaboration/notifications-telegram|collaboration-communication/collaboration"
    "collaboration/requesting-code-review|collaboration-communication/collaboration"
    "collaboration/skill-creator|collaboration-communication/collaboration"
    "collaboration/subagent-driven-development|collaboration-communication/collaboration"

    # Thinking (4 skills)
    "thinking/deep-research|collaboration-communication/thinking-methodologies"
    "thinking/first-principles-thinking|collaboration-communication/thinking-methodologies"
    "thinking/intelligent-routing|collaboration-communication/thinking-methodologies"
    "thinking/writing-plans|knowledge-documentation/planning-architecture"
)

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}BlackBox5 Skills Batch Migration${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "This will migrate ${#MAPPINGS[@]} skills to the new structure."
echo ""
echo -e "${YELLOW}⚠️  Each skill will require manual XML conversion after migration.${NC}"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "Starting batch migration..."
echo ""

# Counter
SUCCESS=0
FAILED=0

# Loop through mappings
for mapping in "${MAPPINGS[@]}"; do
    IFS='|' read -r OLD_PATH NEW_CATEGORY <<< "$mapping"

    OLD_CATEGORY=$(dirname "$OLD_PATH")
    SKILL_NAME=$(basename "$OLD_PATH")

    echo -e "${BLUE}Migrating: ${SKILL_NAME}${NC}"

    # Run migration script
    if "$MIGRATION_SCRIPT" "$OLD_CATEGORY" "$SKILL_NAME" "$NEW_CATEGORY" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ ${SKILL_NAME}${NC}"
        ((SUCCESS++))
    else
        echo -e "${YELLOW}✗ ${SKILL_NAME} (failed)${NC}"
        ((FAILED++))
    fi
    echo ""
done

# Summary
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Batch Migration Complete!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "Migrated: ${GREEN}${SUCCESS}${NC} skills"
echo -e "Failed:   ${YELLOW}${FAILED}${NC} skills"
echo ""
echo "Next steps:"
echo "  1. Review migrated skills in .skills-new/"
echo "  2. Convert each SKILL.md to XML format"
echo "  3. Test with Claude Code"
echo "  4. Update SKILLS-REGISTRY.md"
echo ""
echo "See MIGRATION-GUIDE.md for detailed instructions."
