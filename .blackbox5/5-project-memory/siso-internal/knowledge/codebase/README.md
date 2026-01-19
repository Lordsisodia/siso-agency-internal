# Codebase Knowledge

This folder contains **Codebase Knowledge** - patterns, gotchas, and structure understanding (Ralph-style learning).

## Structure

```
codebase/
├── patterns/            # Discovered code patterns
│   └── {category}/
│       └── {pattern-name}.md
│           - Description of pattern
│           - Code examples
│           - When to use
│
├── gotchas/             # Common pitfalls
│   └── {gotcha-name}.md
│       - What to avoid
│       - Why it's a problem
│       - How to fix
│
├── structure.json       # Code structure understanding
└── relationships.json   # Component relationships
```

## Purpose

This memory helps agents understand:

### Patterns
- Reusable code patterns discovered in codebase
- Best practices for common scenarios
- Architectural patterns used

### Gotchas
- Common mistakes to avoid
- Known issues and workarounds
- Performance pitfalls

### Structure
- How codebase is organized
- Component hierarchy
- Module relationships

## Usage

When an agent discovers a pattern, save to `patterns/{category}/{name}.md`:

```markdown
# {Pattern Name}

## Description
{What the pattern does}

## When to Use
{When this pattern is applicable}

## Example
\```code
{Code example}
\```

## Related Patterns
- [{Related Pattern}](../{file})
```
