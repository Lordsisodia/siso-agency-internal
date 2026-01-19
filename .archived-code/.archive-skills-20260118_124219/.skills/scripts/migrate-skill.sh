#!/bin/bash

# BlackBox5 Skills Migration Script
# Migrates skills from old structure to new XML-structured format

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Paths
OLD_SKILLS_BASE=".blackbox5/engine/agents/.skills"
NEW_SKILLS_BASE=".blackbox5/engine/agents/.skills-new"

# Usage function
usage() {
    echo "Usage: $0 <old-category> <skill-name> <new-category-path>"
    echo ""
    echo "Example:"
    echo "  $0 development test-driven-development development-workflow/coding-assistance"
    echo ""
    echo "Old categories:"
    echo "  - development"
    echo "  - mcp-integrations"
    echo "  - git-workflow"
    echo "  - documentation"
    echo "  - testing"
    echo "  - automation"
    echo "  - collaboration"
    echo "  - thinking"
    echo ""
    echo "New category paths:"
    echo "  - core-infrastructure/system-operations"
    echo "  - core-infrastructure/development-tools"
    echo "  - integration-connectivity/mcp-integrations"
    echo "  - integration-connectivity/api-integrations"
    echo "  - integration-connectivity/database-operations"
    echo "  - development-workflow/coding-assistance"
    echo "  - development-workflow/testing-quality"
    echo "  - development-workflow/deployment-ops"
    echo "  - knowledge-documentation/documentation"
    echo "  - knowledge-documentation/research-analysis"
    echo "  - knowledge-documentation/planning-architecture"
    echo "  - collaboration-communication/collaboration"
    echo "  - collaboration-communication/automation"
    echo "  - collaboration-communication/thinking-methodologies"
    exit 1
}

# Check arguments
if [ "$#" -ne 3 ]; then
    usage
fi

OLD_CATEGORY=$1
SKILL_NAME=$2
NEW_CATEGORY=$3

# Construct paths
OLD_PATH="${OLD_SKILLS_BASE}/${OLD_CATEGORY}/${SKILL_NAME}"
NEW_PATH="${NEW_SKILLS_BASE}/${NEW_CATEGORY}/${SKILL_NAME}"

# Check if old skill exists
if [ ! -d "$OLD_PATH" ]; then
    echo -e "${RED}Error: Old skill not found at ${OLD_PATH}${NC}"
    exit 1
fi

# Check if SKILL.md exists
if [ ! -f "${OLD_PATH}/SKILL.md" ]; then
    echo -e "${RED}Error: SKILL.md not found at ${OLD_PATH}${NC}"
    exit 1
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}BlackBox5 Skills Migration${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "Skill: ${YELLOW}${SKILL_NAME}${NC}"
echo -e "From:  ${OLD_PATH}"
echo -e "To:    ${NEW_PATH}"
echo ""

# Create new directory structure
echo -e "${BLUE}[1/5] Creating new directory structure...${NC}"
mkdir -p "${NEW_PATH}/scripts"
echo -e "${GREEN}✓ Directory created${NC}"
echo ""

# Copy SKILL.md
echo -e "${BLUE}[2/5] Copying SKILL.md...${NC}"
cp "${OLD_PATH}/SKILL.md" "${NEW_PATH}/SKILL.md"
echo -e "${GREEN}✓ SKILL.md copied${NC}"
echo ""

# Copy scripts if present
if [ -d "${OLD_PATH}/scripts" ] && [ "$(ls -A ${OLD_PATH}/scripts 2>/dev/null)" ]; then
    echo -e "${BLUE}[3/5] Copying scripts...${NC}"
    cp -r "${OLD_PATH}/scripts/"* "${NEW_PATH}/scripts/"
    echo -e "${GREEN}✓ Scripts copied${NC}"
else
    echo -e "${BLUE}[3/5] No scripts to copy (skipping)${NC}"
fi
echo ""

# Show what needs to be done manually
echo -e "${BLUE}[4/5] Manual conversion required${NC}"
echo -e "${YELLOW}⚠️  The following manual steps are required:${NC}"
echo ""
echo "  1. Open: ${NEW_PATH}/SKILL.md"
echo "  2. Update YAML frontmatter:"
echo "     - category: ${NEW_CATEGORY}"
echo "  3. Convert markdown sections to XML tags:"
echo "     - ## Overview → <context>"
echo "     - ## How It Works → <instructions>"
echo "     - ## Best Practices → <best_practices>"
echo "     - ## Common Mistakes → <anti_patterns>"
echo "  4. Add missing XML tags:"
echo "     - <rules>"
echo "     - <workflow> with <phase> tags"
echo "     - <examples> with <example> tags"
echo "  5. Add <integration_notes> for Claude Code"
echo "  6. Add <error_handling> section"
echo "  7. Add <output_format> section"
echo ""
echo -e "📖 Reference template: ${NEW_SKILLS_BASE}/_templates/SKILL-TEMPLATE.md"
echo ""

# Create migration record
echo -e "${BLUE}[5/5] Creating migration record...${NC}"
RECORD_FILE="${NEW_SKILLS_BASE}/.migrated"
mkdir -p "$(dirname "$RECORD_FILE")"
echo "$(date +%Y-%m-%d) | ${OLD_CATEGORY}/${SKILL_NAME} → ${NEW_CATEGORY}/${SKILL_NAME}" >> "$RECORD_FILE"
echo -e "${GREEN}✓ Migration recorded${NC}"
echo ""

# Summary
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Migration Complete!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "📁 Migrated to: ${NEW_PATH}"
echo -e "⚠️  Status: ${YELLOW}Requires manual XML conversion${NC}"
echo ""
echo "Next steps:"
echo "  1. Open ${NEW_PATH}/SKILL.md"
echo "  2. Convert to XML format using template"
echo "  3. Test with Claude Code"
echo "  4. Mark as verified in registry"
echo ""

# Show diff if git is available
if command -v git &> /dev/null; then
    if [ -d ".git" ]; then
        echo -e "${BLUE}Git status:${NC}"
        git status --short "${NEW_PATH}" 2>/dev/null || true
    fi
fi
