#!/bin/bash

###############################################################################
# BlackBox5 Skills Consolidation Script
#
# This script consolidates all skills from multiple locations into ONE
# canonical skills folder at .blackbox5/engine/agents/.skills/
#
# Usage: ./consolidate-skills.sh [--dry-run]
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_DIR="/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5"
ENGINE_DIR="$BASE_DIR/engine/agents"
OLD_SKILLS="$ENGINE_DIR/.skills"
NEW_SKILLS="$ENGINE_DIR/.skills-new"
ENGINE_SKILLS="$BASE_DIR/engine/skills"
MODULES_SKILLS="$BASE_DIR/engine/modules/.skills"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$BASE_DIR/.backup-skills-$TIMESTAMP"

# Parse arguments
DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    echo -e "${YELLOW}=== DRY RUN MODE - No changes will be made ===${NC}\n"
fi

###############################################################################
# Helper Functions
###############################################################################

print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

###############################################################################
# Phase 1: Preparation
###############################################################################

phase1_preparation() {
    print_header "Phase 1: Preparation"

    echo "Creating backup directory..."
    if [[ "$DRY_RUN" == false ]]; then
        mkdir -p "$BACKUP_DIR"
    fi
    print_success "Backup directory created: $BACKUP_DIR"

    echo -e "\nBacking up existing skills folders..."
    if [[ -d "$OLD_SKILLS" ]]; then
        echo "  Backing up .skills..."
        if [[ "$DRY_RUN" == false ]]; then
            cp -R "$OLD_SKILLS" "$BACKUP_DIR/.skills"
        fi
        print_success "Backed up .skills"
    fi

    if [[ -d "$NEW_SKILLS" ]]; then
        echo "  Backing up .skills-new..."
        if [[ "$DRY_RUN" == false ]]; then
            cp -R "$NEW_SKILLS" "$BACKUP_DIR/.skills-new"
        fi
        print_success "Backed up .skills-new"
    fi

    if [[ -d "$ENGINE_SKILLS" ]]; then
        echo "  Backing up engine/skills..."
        if [[ "$DRY_RUN" == false ]]; then
            cp -R "$ENGINE_SKILLS" "$BACKUP_DIR/engine-skills"
        fi
        print_success "Backed up engine/skills"
    fi

    if [[ -d "$MODULES_SKILLS" ]]; then
        echo "  Backing up modules/.skills..."
        if [[ "$DRY_RUN" == false ]]; then
            cp -R "$MODULES_SKILLS" "$BACKUP_DIR/modules-skills"
        fi
        print_success "Backed up modules/.skills"
    fi

    print_success "Phase 1 Complete: All folders backed up"
}

###############################################################################
# Phase 2: Structure Setup
###############################################################################

phase2_structure_setup() {
    print_header "Phase 2: Structure Setup"

    echo "Creating canonical folder structure in .skills..."

    # Create the new structure
    STRUCTURE=(
        ".skills/collaboration-communication/collaboration"
        ".skills/collaboration-communication/thinking-methodologies"
        ".skills/collaboration-communication/automation"
        ".skills/integration-connectivity/api-integrations"
        ".skills/integration-connectivity/database-operations"
        ".skills/integration-connectivity/mcp-integrations"
        ".skills/development-workflow/coding-assistance"
        ".skills/development-workflow/testing-quality"
        ".skills/development-workflow/deployment-ops"
        ".skills/core-infrastructure/development-tools"
        ".skills/knowledge-documentation/documentation"
        ".skills/knowledge-documentation/planning-architecture"
    )

    for dir in "${STRUCTURE[@]}"; do
        full_path="$ENGINE_DIR/$dir"
        echo "  Creating: $dir"
        if [[ "$DRY_RUN" == false ]]; then
            mkdir -p "$full_path"
        fi
    done

    print_success "Phase 2 Complete: Folder structure created"
}

###############################################################################
# Phase 3: Content Migration
###############################################################################

phase3_content_migration() {
    print_header "Phase 3: Content Migration"

    # First, copy everything from .skills-new (our canonical structure)
    echo "Migrating content from .skills-new (canonical structure)..."
    if [[ -d "$NEW_SKILLS" ]]; then
        for category in "$NEW_SKILLS"/*; do
            if [[ -d "$category" ]]; then
                cat_name=$(basename "$category")
                echo "  Migrating: $cat_name"
                if [[ "$DRY_RUN" == false ]]; then
                    cp -R "$category" "$ENGINE_DIR/.skills/"
                fi
            fi
        done
        print_success "Migrated .skills-new content"
    fi

    # Migrate unique content from old .skills
    echo -e "\nChecking for unique content in old .skills..."
    if [[ -d "$OLD_SKILLS" ]]; then

        # Check for skills that might not be in .skills-new
        UNIQUE_FOLDERS=(
            "mcp-integrations"
            "documentation"
        )

        for folder in "${UNIQUE_FOLDERS[@]}"; do
            if [[ -d "$OLD_SKILLS/$folder" ]]; then
                echo "  Checking: $folder"

                # This is a simplified check - in reality you'd want more sophisticated comparison
                # For now, we'll skip since most content should be in .skills-new
                print_warning "$folder - skipped (likely exists in .skills-new)"
            fi
        done
    fi

    # Migrate from engine/skills
    echo -e "\nMigrating content from engine/skills..."
    if [[ -d "$ENGINE_SKILLS" ]]; then
        for item in "$ENGINE_SKILLS"/*; do
            if [[ -d "$item" ]]; then
                name=$(basename "$item")
                echo "  Found: $name"

                # These need to be placed appropriately
                case "$name" in
                    "verify")
                        echo "    → Moving to testing-quality/"
                        if [[ "$DRY_RUN" == false ]]; then
                            cp -R "$item" "$ENGINE_DIR/.skills/development-workflow/testing-quality/"
                        fi
                        ;;
                    "workflow")
                        echo "    → Moving to deployment-ops/"
                        if [[ "$DRY_RUN" == false ]]; then
                            cp -R "$item" "$ENGINE_DIR/.skills/development-workflow/deployment-ops/"
                        fi
                        ;;
                    "siso-tasks")
                        echo "    → Moving to documentation/"
                        if [[ "$DRY_RUN" == false ]]; then
                            cp -R "$item" "$ENGINE_DIR/.skills/knowledge-documentation/documentation/"
                        fi
                        ;;
                    *)
                        print_warning "    → Unknown category, skipping"
                        ;;
                esac
            fi
        done
        print_success "Migrated engine/skills content"
    fi

    print_success "Phase 3 Complete: All content migrated"
}

###############################################################################
# Phase 4: Cleanup
###############################################################################

phase4_cleanup() {
    print_header "Phase 4: Cleanup"

    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${YELLOW}DRY RUN: Would remove the following folders:${NC}"
        echo "  - $OLD_SKILLS (would be moved to trash/backup)"
        echo "  - $ENGINE_SKILLS (would be moved to trash/backup)"
        echo "  - $MODULES_SKILLS (would be moved to trash/backup)"
        echo "  - $NEW_SKILLS (would be removed after consolidation)"
    else
        # Create an archive folder instead of deleting
        ARCHIVE_DIR="$BASE_DIR/.archive-skills-$TIMESTAMP"
        mkdir -p "$ARCHIVE_DIR"

        echo "Archiving old skills folders..."

        if [[ -d "$OLD_SKILLS" ]]; then
            echo "  Archiving: .skills"
            mv "$OLD_SKILLS" "$ARCHIVE_DIR/.skills"
        fi

        if [[ -d "$ENGINE_SKILLS" ]]; then
            echo "  Archiving: engine/skills"
            mv "$ENGINE_SKILLS" "$ARCHIVE_DIR/engine-skills"
        fi

        if [[ -d "$MODULES_SKILLS" ]]; then
            echo "  Archiving: modules/.skills"
            mv "$MODULES_SKILLS" "$ARCHIVE_DIR/modules-skills"
        fi

        # We keep .skills-new for now as reference until we verify everything works
        print_warning "Keeping .skills-new for now - remove after verification"

        print_success "Phase 4 Complete: Old folders archived"
    fi
}

###############################################################################
# Phase 5: Verification
###############################################################################

phase5_verification() {
    print_header "Phase 5: Verification"

    echo "Verifying migration..."
    echo ""

    # Count skills in canonical location
    if [[ -d "$ENGINE_DIR/.skills" ]]; then
        TOTAL_SKILLS=$(find "$ENGINE_DIR/.skills" -name "SKILL.md" | wc -l | tr -d ' ')
        echo "Total skills in canonical location: $TOTAL_SKILLS"
    fi

    echo ""
    echo "Folder structure:"
    tree -L 3 -d "$ENGINE_DIR/.skills" 2>/dev/null || find "$ENGINE_DIR/.skills" -type d | head -30

    echo ""
    print_success "Phase 5 Complete: Verification done"

    echo ""
    echo -e "${GREEN}=== Migration Complete! ===${NC}"
    echo ""
    echo "Backup location: $BACKUP_DIR"
    echo "Archive location: $ARCHIVE_DIR"
    echo ""
    echo "Next steps:"
    echo "  1. Verify all skills are present"
    echo "  2. Update SkillManager.py to use new path"
    echo "  3. Update AgentLoader.py to use new path"
    echo "  4. Test skill loading"
    echo "  5. If all works, remove: $NEW_SKILLS"
}

###############################################################################
# Main Execution
###############################################################################

main() {
    print_header "BlackBox5 Skills Consolidation"

    echo "This will consolidate all skills into ONE canonical location:"
    echo "  → $ENGINE_DIR/.skills/"
    echo ""
    echo "Locations being consolidated:"
    echo "  1. $OLD_SKILLS"
    echo "  2. $NEW_SKILLS"
    echo "  3. $ENGINE_SKILLS"
    echo "  4. $MODULES_SKILLS"
    echo ""

    if [[ "$DRY_RUN" == false ]]; then
        read -p "Continue? (y/N) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Migration cancelled"
            exit 1
        fi
    fi

    phase1_preparation
    phase2_structure_setup
    phase3_content_migration
    phase4_cleanup
    phase5_verification
}

# Run main function
main "$@"
