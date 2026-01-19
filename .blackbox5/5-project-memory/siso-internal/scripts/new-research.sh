#!/bin/bash

# new-research.sh - Create a new research folder from template
#
# Usage: ./scripts/new-research.sh

set -e

PROJECT_ROOT="$(dirname "$(dirname "$0")")"
TODAY=$(date +%Y-%m-%d)

echo "🔬 Creating new research"
echo ""
read -p "Enter research topic (short, kebab-case): " TOPIC
SLUG="${TOPIC// /-}"

echo ""
echo "Research location:"
echo "  1) Active (knowledge/research/active/$SLUG/)"
echo "  2) Archived (knowledge/research/archived/$SLUG/)"
read -p "Choose location [1-2]: " LOCATION

case $LOCATION in
    1)
        RESEARCH_DIR="$PROJECT_ROOT/knowledge/research/active/$SLUG"
        ;;
    2)
        RESEARCH_DIR="$PROJECT_ROOT/knowledge/research/archived/$SLUG"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "📝 Creating research: $SLUG"

# Create directory
mkdir -p "$RESEARCH_DIR"

# Create 4D analysis files
cat > "$RESEARCH_DIR/STACK.md" << 'EOF'
# [TOPIC] - Technology Stack

> **Dimension**: Technology
> **Question**: What technologies are used?

## Technologies

| Technology | Purpose | Version | Notes |
|------------|---------|---------|-------|
|            |         |         |       |

## Key Findings

-

## References

-
EOF

cat > "$RESEARCH_DIR/FEATURES.md" << 'EOF'
# [TOPIC] - Features

> **Dimension**: Features
> **Question**: What features does it have?

## Core Features

### Feature 1
**Description**:
**Use Case**:
**Priority**:

### Feature 2
**Description**:
**Use Case**:
**Priority**:

## Key Findings

-

## References

-
EOF

cat > "$RESEARCH_DIR/ARCHITECTURE.md" << 'EOF'
# [TOPIC] - Architecture

> **Dimension**: Architecture
> **Question**: How is it structured?

## System Architecture

```
[Insert diagram or description]
```

## Components

| Component | Responsibility | Dependencies |
|-----------|----------------|--------------|
|           |                |              |

## Data Flow

1.
2.
3.

## Key Findings

-

## References

-
EOF

cat > "$RESEARCH_DIR/PITFALLS.md" << 'EOF'
# [TOPIC] - Pitfalls & Risks

> **Dimension**: Pitfalls
> **Question**: What could go wrong?

## Known Issues

| Issue | Severity | Impact | Mitigation |
|-------|----------|--------|------------|
|       |          |        |            |

## Common Mistakes

1. **Mistake**
   - Why it happens
   - How to avoid

2. **Mistake**
   - Why it happens
   - How to avoid

## Key Findings

-

## References

-
EOF

cat > "$RESEARCH_DIR/SUMMARY.md" << 'EOF'
# [TOPIC] - Research Summary

> **4D Analysis Complete**
> **Date**: [DATE]
> **Researcher**: [NAME]

## Overview

[Brief description of what was researched and why]

## Key Takeaways

### Technology (STACK.md)
-

### Features (FEATURES.md)
-

### Architecture (ARCHITECTURE.md)
-

### Pitfalls (PITFALLS.md)
-

## Recommendations

1.
2.
3.

## Next Steps

-

## References

- [Link 1]()
- [Link 2]()
EOF

# Replace placeholders
sed -i '' "s/\[TOPIC\]/$(echo $SLUG | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')/g" "$RESEARCH_DIR"/*.md
sed -i '' "s/\[DATE\]/$TODAY/g" "$RESEARCH_DIR/SUMMARY.md"

# Create metadata.yaml
cat > "$RESEARCH_DIR/metadata.yaml" << EOF
# Research Metadata

topic: "$SLUG"
status: "active"
created: "$TODAY"
last_updated: "$TODAY"

framework: "4d-analysis"

dimensions:
  - name: "Technology"
    file: "STACK.md"
  - name: "Features"
    file: "FEATURES.md"
  - name: "Architecture"
    file: "ARCHITECTURE.md"
  - name: "Pitfalls"
    file: "PITFALLS.md"

summary: "SUMMARY.md"

related:
  features: []
  decisions: []
  tasks: []
EOF

echo "✅ Created: $RESEARCH_DIR/"
echo "  - STACK.md"
echo "  - FEATURES.md"
echo "  - ARCHITECTURE.md"
echo "  - PITFALLS.md"
echo "  - SUMMARY.md"
echo "  - metadata.yaml"
echo ""
echo "Next steps:"
echo "  1. Edit research files to add your findings"
echo "  2. Update STATE.yaml to add to active_research or archived_research section"
echo "  3. Run ./scripts/generate-dashboards.sh to update views"
