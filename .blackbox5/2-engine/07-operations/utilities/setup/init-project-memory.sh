#!/bin/bash

# Project Memory Initialization Script
# Location: blackbox5/engine/scripts/init-project-memory.sh
# Usage: pm:init [project-name] [project-root]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check arguments
if [ -z "$1" ]; then
    log_error "Project name required"
    echo "Usage: pm:init <project-name> [project-root]"
    echo "Example: pm:init my-project"
    echo "Example: pm:init my-project /path/to/project"
    exit 1
fi

PROJECT_NAME=$1
PROJECT_ROOT=${2:-"."}  # Default to current directory

# Validate project root
if [ ! -d "$PROJECT_ROOT" ]; then
    log_error "Project root does not exist: $PROJECT_ROOT"
    exit 1
fi

# Get BlackBox5 engine location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BLACKBOX5_ENGINE="$(dirname "$SCRIPT_DIR")"

MEMORY_TEMPLATES="$BLACKBOX5_ENGINE/memory-templates"
PROJECT_MEMORY="$PROJECT_ROOT/.project-memory"

# Check if templates exist
if [ ! -d "$MEMORY_TEMPLATES" ]; then
    log_error "Memory templates not found at: $MEMORY_TEMPLATES"
    exit 1
fi

# Check if project memory already exists
if [ -d "$PROJECT_MEMORY" ]; then
    log_warn "Project memory already exists at: $PROJECT_MEMORY"
    read -p "Do you want to reinitialize? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Aborted"
        exit 0
    fi
    log_warn "Backing up existing .project-memory to .project-memory.backup"
    mv "$PROJECT_MEMORY" "$PROJECT_MEMORY.backup"
fi

# Start initialization
log_info "Initializing project memory for: $PROJECT_NAME"
log_info "Project root: $PROJECT_ROOT"
log_info "Memory location: $PROJECT_MEMORY"

# Create .project-memory directory
log_info "Creating .project-memory directory..."
mkdir -p "$PROJECT_MEMORY"

# Copy template files
log_info "Copying templates..."
cp -r "$MEMORY_TEMPLATES/project-template/"* "$PROJECT_MEMORY/"

# Initialize project-specific files
log_info "Initializing project-specific files..."

DATE=$(date +%Y-%m-%d)
PROJECT_ID=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g')

# Initialize INDEX.yaml
sed -i '' "s/{PROJECT_NAME}/$PROJECT_NAME/g" "$PROJECT_MEMORY/INDEX.yaml.template"
sed -i '' "s/{PROJECT_ID}/$PROJECT_ID/g" "$PROJECT_MEMORY/INDEX.yaml.template"
sed -i '' "s/{DATE}/$DATE/g" "$PROJECT_MEMORY/INDEX.yaml.template"
mv "$PROJECT_MEMORY/INDEX.yaml.template" "$PROJECT_MEMORY/INDEX.yaml"

# Initialize project.yaml
sed -i '' "s/{PROJECT_NAME}/$PROJECT_NAME/g" "$PROJECT_MEMORY/project.yaml.template"
sed -i '' "s/{PROJECT_DESCRIPTION}/Project: $PROJECT_NAME/g" "$PROJECT_MEMORY/project.yaml.template"
sed -i '' "s/{DATE}/$DATE/g" "$PROJECT_MEMORY/project.yaml.template"
mv "$PROJECT_MEMORY/project.yaml.template" "$PROJECT_MEMORY/project.yaml"

# Initialize context.yaml
sed -i '' "s/{PROJECT_NAME}/$PROJECT_NAME/g" "$PROJECT_MEMORY/context.yaml.template"
sed -i '' "s/{PROJECT_DESCRIPTION}/Project: $PROJECT_NAME/g" "$PROJECT_MEMORY/context.yaml.template"
sed -i '' "s/{PRIMARY_GOAL}/To be determined/g" "$PROJECT_MEMORY/context.yaml.template"
sed -i '' "s/{DATE}/$DATE/g" "$PROJECT_MEMORY/context.yaml.template"
mv "$PROJECT_MEMORY/context.yaml.template" "$PROJECT_MEMORY/context.yaml"

# Initialize timeline.yaml
sed -i '' "s/{PROJECT_NAME}/$PROJECT_NAME/g" "$PROJECT_MEMORY/timeline.yaml.template"
sed -i '' "s/{DATE}/$DATE/g" "$PROJECT_MEMORY/timeline.yaml.template"
mv "$PROJECT_MEMORY/timeline.yaml.template" "$PROJECT_MEMORY/timeline.yaml"

# Create directory structure
log_info "Creating directory structure..."
mkdir -p "$PROJECT_MEMORY/research"
mkdir -p "$PROJECT_MEMORY/plans"
mkdir -p "$PROJECT_MEMORY/tasks/active"
mkdir -p "$PROJECT_MEMORY/tasks/completed"
mkdir -p "$PROJECT_MEMORY/decisions/technical"
mkdir -p "$PROJECT_MEMORY/decisions/architectural"
mkdir -p "$PROJECT_MEMORY/decisions/scope"

# Copy agent interface documentation
log_info "Copying agent interface documentation..."
mkdir -p "$PROJECT_MEMORY/.docs"
cp "$MEMORY_TEMPLATES/AGENT-INTERFACE/"*.md "$PROJECT_MEMORY/.docs/"

# Create .gitignore
log_info "Creating .gitignore..."
cat > "$PROJECT_MEMORY/.gitignore" << EOF
# Auto-generated files
*.backup
*~

# Temporary files
.DS_Store
Thumbs.db
EOF

# Success!
log_info "✅ Project memory initialized successfully!"
echo ""
echo "Project: $PROJECT_NAME"
echo "Location: $PROJECT_MEMORY"
echo ""
echo "Next steps:"
echo "  1. Review and update .project-memory/INDEX.yaml"
echo "  2. Update .project-memory/project.yaml with project details"
echo "  3. Update .project-memory/context.yaml with project context"
echo "  4. Start using the memory system!"
echo ""
echo "Agent interface documentation: .project-memory/.docs/"
log_info "Done!"
