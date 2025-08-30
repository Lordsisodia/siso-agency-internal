# Context Cleanup Command

Memory bank optimization specialist for reducing token usage in SISO documentation and achieving 15-25% token reduction.

## Quick Context Cleanup

Immediate optimization of current session:

```bash
# Analyze current context usage
echo "Current context analysis..."
find . -name "*.md" -path "./.claude/*" -o -path "./docs/*" -o -name "CLAUDE.md" | wc -l

# Check for duplicate documentation
find . -name "README.md" | head -5
```

## Full Context Optimization Process

### **1. Documentation Audit**
```bash
# Find all documentation files
find . -name "*.md" -not -path "./node_modules/*" | sort

# Check for duplicate content
grep -r "Installation\|Getting Started\|Usage" docs/ README.md CLAUDE.md

# Identify large files
find . -name "*.md" -not -path "./node_modules/*" -exec wc -l {} + | sort -nr | head -10
```

### **2. Redundancy Detection**
```bash
# Find duplicate sections
grep -r "## Architecture\|## Tech Stack\|## Installation" . --include="*.md"

# Check overlapping documentation
diff docs/README.md README.md 2>/dev/null || echo "Files differ"
```

### **3. Archive Strategy**
```bash
# Create archive directory
mkdir -p docs/archive

# Move outdated documentation
find . -name "*-old.md" -o -name "*-backup.md" -o -name "*-deprecated.md"
```

## Context Optimization Targets

### **High Impact** (Major Token Reduction)
- [ ] **Consolidate duplicate README sections** across multiple directories
- [ ] **Merge overlapping architecture documentation**
- [ ] **Archive historical/deprecated documentation**
- [ ] **Eliminate redundant installation instructions**
- [ ] **Consolidate similar configuration guides**

### **Medium Impact** (Moderate Token Reduction)
- [ ] **Streamline verbose examples** in documentation
- [ ] **Remove outdated code snippets**
- [ ] **Consolidate similar troubleshooting sections**
- [ ] **Optimize repetitive configuration examples**
- [ ] **Merge similar development guides**

### **Low Impact** (Minor Token Reduction)
- [ ] **Remove excessive whitespace** in documentation
- [ ] **Optimize markdown formatting**
- [ ] **Consolidate similar link collections**
- [ ] **Remove redundant badges/shields**

## SISO-Specific Optimizations

### **Documentation Structure Analysis**
```bash
# Analyze current structure
tree -I 'node_modules' -P '*.md' --charset ascii

# Check for redundant files
ls -la *README* *GUIDE* *DOC* 2>/dev/null
```

### **AI-First Documentation Consolidation**
```bash
# Find AI-related documentation
find . -path "./ai-first/*" -name "*.md"
find . -name "*AI*" -o -name "*ai*" | grep -i "\.md$"

# Check for duplicate AI guides
grep -r "AI integration\|AI service\|MCP" . --include="*.md"
```

### **Database Documentation Cleanup**
```bash
# Find database-related docs
find . -name "*database*" -o -name "*prisma*" -o -name "*DB*" | grep -i "\.md$"
grep -r "Database\|Prisma\|PostgreSQL\|SQLite" . --include="*.md"
```

## Optimization Strategies

### **1. Content Consolidation**
- **Merge similar sections** from different files
- **Create single source of truth** for architecture
- **Eliminate copy-paste documentation**
- **Use imports/references** instead of duplication

### **2. Archive Management**
- **Move historical docs** to `/docs/archive/`
- **Keep only current versions** of guides
- **Archive old migration guides**
- **Remove outdated troubleshooting**

### **3. Smart References**
- **Link to external docs** instead of copying
- **Reference existing patterns** instead of re-explaining
- **Use includes** for common sections
- **Create reusable snippets**

## Implementation Plan

### **Phase 1: Quick Wins** (15% reduction)
```bash
# Remove obvious duplicates
find . -name "*-backup.md" -o -name "*-old.md" -delete

# Archive outdated files
mkdir -p docs/archive
mv docs/legacy-* docs/archive/ 2>/dev/null || true
```

### **Phase 2: Content Merge** (20% reduction)
```bash
# Identify merge candidates
grep -l "Architecture\|Tech Stack" *.md docs/*.md

# Create consolidated architecture doc
# Merge installation instructions
# Consolidate development guides
```

### **Phase 3: Reference Optimization** (25% reduction)
```bash
# Replace content with references
# Use @import syntax where possible
# Link to external documentation
# Create reusable template sections
```

## Validation

### **Token Usage Measurement**
```bash
# Count total documentation tokens (approximate)
find . -name "*.md" -not -path "./node_modules/*" -exec wc -w {} + | tail -1

# Measure reduction
echo "Before: [baseline tokens]"
echo "After: [optimized tokens]"
echo "Reduction: [percentage]%"
```

### **Content Quality Check**
- [ ] **All essential information preserved**
- [ ] **No broken internal links**
- [ ] **Clear navigation maintained**
- [ ] **Development workflow still documented**
- [ ] **Architecture guidance complete**

## Maintenance

### **Regular Cleanup Schedule**
- **Weekly**: Remove temporary documentation
- **Monthly**: Check for duplicate content
- **Quarterly**: Archive outdated guides
- **Release**: Update and consolidate documentation

### **Prevention Strategies**
- **Use templates** for consistent documentation
- **Single source of truth** for architecture decisions
- **Link don't duplicate** external references
- **Regular documentation reviews**