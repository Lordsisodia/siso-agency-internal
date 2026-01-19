# Skills Migration Guide

Guide for migrating existing skills from the old structure to the new XML-structured format.

## Overview

- **Old Structure**: `.blackbox5/engine/agents/.skills/` (8 categories, flat structure)
- **New Structure**: `.blackbox5/engine/agents/.skills-new/` (5 top-level, 15 sub-categories)
- **Key Change**: XML tags for better prompt parsing and control

## Migration Process

### Step 1: Map Old Skills to New Categories

| Old Category | New Category Path | Skills Count |
|--------------|-------------------|--------------|
| `development/` | `development-workflow/coding-assistance/` | 1 |
| `mcp-integrations/` | `integration-connectivity/mcp-integrations/` | 13 |
| `git-workflow/` | `core-infrastructure/development-tools/` | 1 |
| `documentation/` | `knowledge-documentation/documentation/` | 2 |
| `testing/` | `development-workflow/testing-quality/` | 1 |
| `automation/` | `collaboration-communication/automation/` | 3 |
| `collaboration/` | `collaboration-communication/collaboration/` | 6 |
| `thinking/` | `collaboration-communication/thinking-methodologies/` | 4 |

### Step 2: Convert SKILL.md to XML Format

**Old Format** (Markdown):
```markdown
# Test-Driven Development (TDD)

## Overview
Master the RED-GREEN-REFACTOR cycle...

## When to Use This Skill
✅ Building new features from scratch
✅ Refactoring existing code...

## The TDD Cycle
### 1. RED Phase
Write a failing test...
```

**New Format** (XML + Markdown):
```markdown
---
name: test-driven-development
category: development-workflow/coding-assistance
version: 1.0.0
description: RED-GREEN-REFACTOR cycle for bulletproof code
author: obra/superpowers
verified: true
tags: [testing, tdd, development, quality]
---

# Test-Driven Development (TDD)

<context>
TDD is a software development process that relies on the repetition of a short development cycle...
</context>

<instructions>
Follow the RED-GREEN-REFACTOR cycle strictly:
1. RED: Write a failing test first
2. GREEN: Write minimal code to pass the test
3. REFACTOR: Improve code while keeping tests green
</instructions>

<workflow>
<phase name="RED">
Write the MINIMAL test case for new functionality and confirm it FAILS.
</phase>
<phase name="GREEN">
Write just enough code to make the test pass.
</phase>
<phase name="REFACTOR">
Clean up duplication while keeping tests green.
</phase>
</workflow>
```

### Step 3: Update YAML Frontmatter

**Required Fields**:
```yaml
---
name: skill-name                    # Must match folder name
category: category-path/skill-category  # New hierarchical path
version: 1.0.0                     # Semantic version
description: One-line summary      # Clear, concise description
author: author-name/source         # Attribution
verified: true                     # Whether tested/verified
tags: [tag1, tag2, tag3]          # For discovery
---
```

### Step 4: Add XML Tags

Replace markdown sections with XML equivalents:

| Old Markdown | New XML Tag |
|--------------|-------------|
| `## Overview` | `<context>` |
| `## How It Works` | `<instructions>` |
| `## Best Practices` | `<best_practices>` |
| `## Common Mistakes` | `<anti_patterns>` |
| `## Examples` | `<examples>` |

### Step 5: Move to New Directory Structure

```bash
# Example: Moving TDD skill
mkdir -p .blackbox5/engine/agents/.skills-new/development-workflow/coding-assistance/test-driven-development/scripts
cp .blackbox5/engine/agents/.skills/development/test-driven-development/SKILL.md \
   .blackbox5/engine/agents/.skills-new/development-workflow/coding-assistance/test-driven-development/SKILL.md
# Convert to XML format (manual step)
# Copy scripts if present
```

## Migration Checklist

For each skill:

- [ ] Map to new category path
- [ ] Create new directory structure
- [ ] Update YAML frontmatter
- [ ] Convert content to XML tags
- [ ] Copy scripts folder (if present)
- [ ] Test with Claude
- [ ] Update registry
- [ ] Mark as ✅ Verified

## Automated Migration Script

Create `scripts/migrate-skill.sh`:

```bash
#!/bin/bash

# Usage: ./migrate-skill.sh <old-category> <skill-name> <new-category-path>

OLD_CATEGORY=$1
SKILL_NAME=$2
NEW_CATEGORY=$3

OLD_PATH=".blackbox5/engine/agents/.skills/${OLD_CATEGORY}/${SKILL_NAME}"
NEW_PATH=".blackbox5/engine/agents/.skills-new/${NEW_CATEGORY}/${SKILL_NAME}"

echo "Migrating ${SKILL_NAME}..."

# Create new directory
mkdir -p "${NEW_PATH}/scripts"

# Copy skill file
cp "${OLD_PATH}/SKILL.md" "${NEW_PATH}/SKILL.md"

# Copy scripts if present
if [ -d "${OLD_PATH}/scripts" ]; then
  cp -r "${OLD_PATH}/scripts/"* "${NEW_PATH}/scripts/"
fi

echo "✅ Migrated to: ${NEW_PATH}"
echo "⚠️  Manual conversion to XML format required"
```

## Batch Migration

Migrate all skills at once:

```bash
#!/bin/bash

# Define mappings
declare -A MAPPINGS=(
  ["development/test-driven-development"]="development-workflow/coding-assistance/test-driven-development"
  ["mcp-integrations/supabase"]="integration-connectivity/mcp-integrations/supabase"
  ["mcp-integrations/shopify"]="integration-connectivity/mcp-integrations/shopify"
  # ... add all 33 mappings
)

# Loop through mappings
for old_path in "${!MAPPINGS[@]}"; do
  new_path="${MAPPINGS[$old_path]}"
  ./scripts/migrate-skill.sh \
    "$(dirname $old_path)" \
    "$(basename $old_path)" \
    "$new_path"
done
```

## Testing Migration

After migration, test each skill:

1. **Load Claude Code** with the new skill path
2. **Trigger the skill** by mentioning related keywords
3. **Verify output** follows the specified format
4. **Check XML parsing** works correctly

## Rollback Plan

If migration fails:

```bash
# Keep old structure intact until verification complete
# Rollback by deleting .skills-new and starting from .skills
rm -rf .blackbox5/engine/agents/.skills-new
```

## Verification

For each migrated skill, verify:

- [ ] YAML frontmatter is valid
- [ ] All XML tags are properly closed
- [ ] Category path matches directory structure
- [ ] Scripts folder preserved (if present)
- [ ] Skill loads correctly in Claude
- [ ] Output matches expected format

## Post-Migration

1. **Update agent configurations** to point to new skills path
2. **Run full test suite** with all skills
3. **Update documentation** references
4. **Archive old structure** (keep for 30 days)
5. **Remove old structure** after verification period

## Timeline

- **Phase 1**: Create new structure (✅ Complete)
- **Phase 2**: Migrate 33 existing skills (🔧 In Progress)
- **Phase 3**: Test and verify (Pending)
- **Phase 4**: Update engine configuration (Pending)
- **Phase 5**: Archive old structure (Pending)

## Help & Support

- **Template**: `.skills-new/_templates/SKILL-TEMPLATE.md`
- **Registry**: `.skills-new/SKILLS-REGISTRY.md`
- **Issues**: Report migration problems in project issues

---

**Last Updated**: 2025-01-18
**Status**: 🔄 Migration In Progress (0/33 skills migrated)
