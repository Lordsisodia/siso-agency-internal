# Documentation Generation

Scripts for generating and validating project documentation.

## Scripts

### generate-docs-index.cjs
Generates a comprehensive index of all documentation for AI agent consumption.

**Usage:**
```bash
npm run docs:index
# or
node scripts/docs/generate-docs-index.cjs
```

**Output:**
- `.docs/index.json` - Complete documentation index

**What it indexes:**
- All markdown files in `.docs/`
- Frontmatter metadata (title, tags, audience, etc.)
- Wiki-style and markdown links between documents
- Heading structure and word counts
- File modification times

**Features:**
- Builds link graph showing document relationships
- Creates tag index for topic-based navigation
- Generates category index for structured browsing
- Provides quick-start navigation by audience and topic

**Validation:**
```bash
npm run docs:validate    # Generate and validate index
```

## Index Structure

The generated index includes:
- **metadata** - Generation info and version
- **stats** - File counts, tags, links
- **files** - All documents with full metadata
- **graph** - Link relationships between documents
- **tags** - Tag-to-files mapping
- **categories** - Category-to-files mapping
- **quick_start** - Navigation helpers

## Usage in AI Agents

The index is designed to be consumed by AI agents for:
- Context-aware documentation retrieval
- Understanding documentation structure
- Finding related documents
- Navigating by audience or topic
