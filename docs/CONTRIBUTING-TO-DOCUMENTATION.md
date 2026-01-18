# Contributing to Documentation

**SISO Internal Documentation System v2.0**

This guide explains how to contribute to the SISO Internal documentation using our AI-friendly, auto-generated documentation system.

---

## 🎯 Overview

Our documentation system uses a **filesystem-first approach** with three key components:

1. **YAML Frontmatter** - Machine-readable metadata at the top of each file
2. **Wiki-Style Links** - `[[filename]]` syntax for explicit relationships
3. **Auto-Generated Index** - `npm run docs:index` creates `.docs/index.json` on-demand

**Single Source of Truth**: The markdown files themselves. The JSON index is generated automatically and should **never be manually edited**.

---

## 📝 Adding Frontmatter to Files

Every important documentation file should have YAML frontmatter at the top:

```markdown
---
title: "Page Title"
description: "Brief description of what this page covers"
tags: [tag1, tag2, tag3]
related: ["../path/to/related-file.md", "./another-related-file.md"]
audience: [developers, architects]
priority: high
category: 02-architecture
last_updated: 2025-01-18
---

# Page Content

Your markdown content goes here...
```

### Frontmatter Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | No | Page title (defaults to first heading if omitted) |
| `description` | string | No | Brief description (defaults to first paragraph if omitted) |
| `tags` | array | No | Searchable tags (e.g., `lifelock`, `authentication`, `api`) |
| `related` | array | No | Paths to related documentation files |
| `audience` | array | No | Target audience (developers, architects, product_managers, etc.) |
| `priority` | string | No | Document importance (high, medium, low) |
| `category` | string | No | Category folder (auto-detected from path if omitted) |
| `last_updated` | date | No | Last update date (YYYY-MM-DD format, defaults to file mtime) |

---

## 🔗 Using Wiki-Style Links

AI agents can parse and build relationship graphs from wiki-style links.

### Syntax

```markdown
See [[LifeLock Architecture]] for details on the LifeLock domain.

Related: [[../database/schema]], [[./authentication-guide]].
```

### How It Works

- Links are parsed by the auto-generator script
- Both `[[filename]]` and standard `[text](path.md)` links are supported
- The script resolves relative paths and builds a bidirectional link graph
- AI agents can use the graph to discover related documentation

### Examples

```markdown
# Good
For authentication, see [[Authentication Guide]].
API docs are in [[../04-integrations/05-api/rest]].

# Also Good
See the [Database Schema](../database/schema.md) for table relationships.

# Bad (no link)
For authentication, see the authentication guide in the architecture folder.
```

---

## 🚀 Generating the Documentation Index

### Manual Generation

```bash
npm run docs:index
```

This scans all `.docs/*.md` files and generates `.docs/index.json` with:
- File metadata (title, description, tags, audience)
- Link graph (what links to what)
- Tag index (files by tag)
- Category index (files by category)

### Generated Index Structure

```json
{
  "metadata": {
    "name": "SISO Internal Documentation Index",
    "version": "2.0.0",
    "generated": "2025-01-18T...",
    "total_files": 320
  },
  "stats": {
    "total_files": 320,
    "total_tags": 0,
    "total_categories": 9,
    "total_links": 24
  },
  "files": [
    {
      "path": "01-overview/README.md",
      "title": "01. Overview",
      "description": "START HERE...",
      "tags": ["overview", "getting-started"],
      "audience": ["new_developers", "stakeholders"],
      "category": "01-overview",
      "word_count": 542,
      "headings": [...],
      "links_to": [...]
    }
  ],
  "graph": { ... },
  "tags": { ... },
  "categories": { ... },
  "quick_start": { ... }
}
```

---

## 🤖 For AI Agents

### Quick Navigation

1. **Start Here**: `.docs/01-overview/README.md`
2. **Read the Catalog**: `.docs/index.json` (auto-generated)
3. **Search by Tag**: Use the `tags` index in the catalog
4. **Follow Links**: Use the `graph` to discover related documentation

### Common Queries

| Question | Where to Look |
|----------|---------------|
| "How do I get started?" | `01-overview/` |
| "What's the architecture?" | `02-architecture/` |
| "How do I implement a feature?" | `03-product/01-domains/` |
| "How do I set up AI agents?" | `04-integrations/01-ai-agents/` |
| "Something's broken" | `05-development/03-guides/fixes/` |
| "How do I test?" | `06-testing/` |
| "How do I deploy?" | `07-operations/01-deployment/` |

---

## 📁 File Organization

### Numbered Categories (01-09)

```
.docs/
├── 01-overview/          # START HERE
├── 02-architecture/      # System design, patterns, DB schema
├── 03-product/          # Features, domains, PRDs
├── 04-integrations/     # AI agents, MCP, APIs
├── 05-development/      # Guides, workflows, tooling
├── 06-testing/          # Testing guides, QA, health checks
├── 07-operations/       # Deployment, migrations, monitoring
├── 08-knowledge/        # Research, feedback, stories
└── 09-archive/          # Legacy, deprecated, historical
```

### Naming Conventions

- **Folders**: `kebab-case` (e.g., `01-getting-started`, `ai-agents`)
- **Files**: `Title-Case.md` or `ALL_CAPS.md` (legacy)
- **Numbers**: Used for logical ordering (01-09)
- **Max Depth**: 3 levels from `.docs/` root

---

## ✅ Best Practices

### DO ✅

- Add frontmatter to important files
- Use wiki-style links `[[filename]]` for relationships
- Run `npm run docs:index` after significant changes
- Keep files focused and scoped
- Use numbered folders for logical ordering
- Update `README.md` in each folder

### DON'T ❌

- Manually edit `.docs/index.json` (it's auto-generated)
- Create folders deeper than 3 levels
- Leave empty folders (they will be deleted)
- Duplicate content across multiple files (use links instead)
- Use ambiguous file names (be descriptive)

---

## 🔄 Workflow

### Adding New Documentation

1. Create file in appropriate category folder
2. Add YAML frontmatter with metadata
3. Use wiki-style links to related docs
4. Update folder README.md if needed
5. Run `npm run docs:index` to regenerate catalog
6. Commit the markdown file (index.json is gitignored)

### Updating Existing Documentation

1. Edit the markdown file
2. Update frontmatter if metadata changed
3. Add/update wiki-style links
4. Run `npm run docs:index` to regenerate catalog
5. Commit the changes

### Moving/Renaming Files

1. Move/rename the file
2. Update all links that reference it (use global search)
3. Run `npm run docs:index` to regenerate catalog
4. Commit the changes

---

## 🛠️ Troubleshooting

### Index not updating

```bash
# Regenerate manually
npm run docs:index

# Validate the index
npm run docs:validate
```

### Broken links

```bash
# Search for broken wiki links
grep -r "\[\[.*\]\]" .docs/ | while read line; do
  file=$(echo "$line" | cut -d: -f1)
  link=$(echo "$line" | grep -o "\[\[.*\]\]" | sed 's/\[\[//;s/\]\]//')
  echo "Checking $file for link to $link"
done
```

### Missing frontmatter

```bash
# Find files without frontmatter
for file in $(find .docs -name "*.md"); do
  if ! head -n 1 "$file" | grep -q "^---"; then
    echo "$file: No frontmatter"
  fi
done
```

---

## 📚 Additional Resources

- **Main README**: `.docs/README.md`
- **AI Quick Reference**: `.docs/AI-READY.md`
- **Legacy Catalog**: `.docs/AI-KNOWLEDGE-CATALOG.json` (deprecated, use index.json)

---

## 🎓 Why This Approach?

### Problems with Manual Catalogs

- ❌ Maintenance burden (must update JSON every time files change)
- ❌ Error-prone (JSON syntax errors, incomplete data)
- ❌ Redundant (duplicates folder structure)
- ❌ Always out-of-sync with actual files

### Benefits of Auto-Generation

- ✅ **Always up-to-date** - Generated from actual files on-demand
- ✅ **No redundancy** - Single source of truth (files themselves)
- ✅ **Industry standard** - Used by Jekyll, Docusaurus, Obsidian
- ✅ **AI-friendly** - Machine-readable frontmatter + link graph
- ✅ **Human-friendly** - Edit markdown, run script, done

---

**Last Updated**: 2025-01-18
**Version**: 2.0.0
