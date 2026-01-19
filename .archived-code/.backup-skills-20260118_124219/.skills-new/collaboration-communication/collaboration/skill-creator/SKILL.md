---
name: skill-creator
category: collaboration-communication/collaboration
version: 1.0.0
description: Create your own skills following best practices with proper YAML frontmatter
author: obra/superpowers
verified: true
tags: [meta, skills, development, best-practices, documentation]
---

# Skill Creator

<context>
Learn how to create effective, reusable Agent Skills that extend Claude's capabilities with proper structure, documentation, and community standards.

This meta-skill teaches you the patterns and practices for building high-quality skills that others can use and contribute to.
</context>

<instructions>
Follow systematic approach to create well-structured, documented, and reusable Agent Skills.

Use proper YAML frontmatter, clear documentation, concrete examples, and established patterns. Ensure skills are tested, verified, and ready for community use.
</instructions>

<workflow>
## Planning Phase
1. Identify skill purpose and scope
2. Choose appropriate category
3. Define specific use cases
4. Plan skill structure
5. Design examples and workflows

## Creation Phase
1. Write YAML frontmatter with required fields
2. Create clear overview section
3. Document specific use cases
4. Write actionable instructions
5. Add concrete examples
6. Include best practices
7. Highlight common mistakes

## Validation Phase
1. Complete skill quality checklist
2. Test skill manually
3. Verify Claude integration
4. Conduct peer review
5. Refine based on feedback

## Publishing Phase
1. Organize in proper directory structure
2. Update repository README
3. Document installation process
4. Submit contribution
</workflow>

<rules>
## Skill Structure Requirements
- Valid YAML frontmatter with all required fields
- Clear overview paragraph (2-3 sentences)
- Specific use cases listed with checkmarks
- Actionable guidance (not vague suggestions)
- Concrete examples (not generic descriptions)
- Best practices documented
- Common mistakes highlighted
- Integration notes for Claude

## YAML Frontmatter
```yaml
---
name: your-skill-name
category: core | mcp | workflow | meta
version: 1.0.0
description: One-line summary of what this skill does
author: your-name-or-organization
verified: false
tags: [tag1, tag2, tag3]
---
```

## Quality Standards
- Skill name is descriptive
- Tags are relevant and specific
- Description is concise (one line)
- Examples are realistic and actionable
- Can be used without extra context
</rules>

<best_practices>
## Writing Good Skills

### 1. Clear Purpose
❌ Bad: "Helps with code"
✅ Good: "Test-driven development using RED-GREEN-REFACTOR cycle"

### 2. Specific Use Cases
❌ Bad: "When writing code"
✅ Good: "When building new features from scratch with guaranteed test coverage"

### 3. Actionable Guidance
❌ Bad: "Write good tests"
✅ Good: "Follow RED-GREEN-REFACTOR: write failing test, make it pass, refactor"

### 4. Concrete Examples
❌ Bad: "Here's how to use it:"
✅ Good: "To build a user auth system with TDD:
1. RED: Write test for login validation
2. GREEN: Implement validateLogin()
3. REFACTOR: Extract common validation logic"

## Common Skill Patterns

### Checklist Pattern
```markdown
## Pre-Execution Checklist
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3

## Post-Execution Checklist
- [ ] Verification 1
- [ ] Verification 2
```

### Phase Pattern
```markdown
## Phase 1: Preparation
[Steps and guidance]

## Phase 2: Execution
[Steps and guidance]

## Phase 3: Verification
[Steps and guidance]
```

### Example Pattern
```markdown
## Example: [Specific scenario]
### Before
[Code or situation before]

### After
[Code or situation after]

### Key Changes
- [Change 1]
- [Change 2]
```
</best_practices>

<examples>
## Basic Skill Template
```markdown
---
name: your-skill-name
category: core | mcp | workflow | meta
version: 1.0.0
description: One-line summary of what this skill does
author: your-name-or-organization
verified: false
tags: [tag1, tag2, tag3]
---

# Skill Name

## Overview
[2-3 sentences explaining what this skill does and when to use it]

## When to Use This Skill
✅ [Use case 1]
✅ [Use case 2]
✅ [Use case 3]

## How It Works
[Explanation of the skill's approach]

## Usage Examples
[Concrete examples of using the skill]

## Best Practices
[Key guidelines and patterns]

## Common Mistakes
❌ [What to avoid]

## Integration with Claude
[How Claude uses this skill]
```

## GitHub Repository Structure
```
my-claude-skills/
├── skills/
│   ├── skill-1/
│   │   └── SKILL.md
│   ├── skill-2/
│   │   └── SKILL.md
│   └── skill-3/
│       └── SKILL.md
├── README.md
├── CONTRIBUTING.md
└── LICENSE
```

## README Template
```markdown
# My Claude Skills Collection

A collection of skills for [purpose].

## Skills
- [Skill 1]: [Brief description]
- [Skill 2]: [Brief description]
- [Skill 3]: [Brief description]

## Installation
```bash
git clone https://github.com/username/repo ~/.claude/skills/my-skills
```

## Usage
Skills load automatically when relevant. See individual skill files for details.
```
</examples>

<integration_notes>
## Skill Categories

### Core Skills
Fundamental development practices:
- Testing (TDD, testing patterns)
- Debugging (systematic debugging)
- Git workflows (worktrees, branching)
- Planning and architecture
- Code review practices

### MCP Skills
Model Context Protocol integrations:
- API integrations
- Database operations
- File system operations
- External service connections
- Tool implementations

### Workflow Skills
Team and process workflows:
- Code review processes
- Documentation standards
- Collaboration patterns
- Release processes
- Project management

### Meta Skills
Skills about skills:
- Creating skills
- Testing skills
- Sharing skills
- Skill patterns

## Testing Your Skill

### 1. Manual Testing
```markdown
## Test Cases
1. **Scenario**: [describe situation]
   - **Input**: [what you provide]
   - **Expected**: [what should happen]
   - **Actual**: [what actually happened]
```

### 2. Claude Integration Testing
- Use the skill in Claude Code
- Verify Claude recognizes relevant context
- Check that guidance is followed
- Ensure examples are helpful

### 3. Peer Review
- Have others test the skill
- Gather feedback on clarity
- Identify missing use cases
- Refine based on suggestions

## Contributing to Collections
1. Fork the repository
2. Create a new branch: `git checkout -b skill/my-skill`
3. Add your skill file
4. Update README if needed
5. Submit pull request
</integration_notes>

<output_format>
A complete skill file with:

1. **YAML Frontmatter** (required fields):
   - name: descriptive-skill-name
   - category: core|mcp|workflow|meta
   - version: X.Y.Z (semver)
   - description: One-line summary
   - author: Creator name/org
   - verified: true|false
   - tags: [relevant, tags]

2. **Content Sections**:
   - Overview (2-3 sentences)
   - When to Use This Skill (checkmark list)
   - How It Works
   - Usage Examples
   - Best Practices
   - Common Mistakes
   - Integration with Claude

3. **Quality Validation**:
   - Skill Quality Checklist completed
   - Manual testing documented
   - Claude integration verified
   - Peer review feedback incorporated
</output_format>
