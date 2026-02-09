---
name: skill-creator
category: workflow
version: 1.0.0
description: Create your own skills following best practices with proper YAML frontmatter
author: obra/superpowers
verified: true
tags: [meta, skills, development, best-practices]
---

# Skill Creator

## Overview
Learn how to create effective, reusable Agent Skills that extend Claude's capabilities with proper structure, documentation, and community standards.

## When to Use This Skill
✅ Creating custom skills for personal workflows
✅ Contributing skills to community repositories
✅ Standardizing team practices as skills
✅ Documenting domain expertise

## Skill Structure

### Basic Skill Template
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

## Skill Quality Checklist

### Structure
- [ ] Valid YAML frontmatter
- [ ] All required fields populated
- [ ] Version number follows semver
- [ ] Category is appropriate

### Content
- [ ] Clear overview paragraph
- [ ] Specific use cases listed
- [ ] Actionable guidance provided
- [ ] Examples included
- [ ] Best practices documented
- [ ] Common mistakes highlighted

### Usability
- [ ] Skill name is descriptive
- [ ] Tags are relevant
- [ ] Description is concise
- [ ] Examples are realistic
- [ ] Can be used without extra context

### Integration
- [ ] Claude knows when to use it
- [ ] Clear activation triggers
- [ ] Explains what Claude will do
- [ ] Handles edge cases

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

## Publishing Skills

### GitHub Repository Structure
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

### README Template
```markdown
# My Claude Skills Collection

A collection of skills for [purpose].

## Skills
- [Skill 1]: [Brief description]
- [Skill 2]: [Brief description]
- [Skill 3]: [Brief description]

## Installation
\`\`\`bash
git clone https://github.com/username/repo ~/.claude/skills/my-skills
\`\`\`

## Usage
Skills load automatically when relevant. See individual skill files for details.
```

### Contributing to Collections
1. Fork the repository
2. Create a new branch: `git checkout -b skill/my-skill`
3. Add your skill file
4. Update README if needed
5. Submit pull request

## Integration with Claude
When creating skills, say:
- "Help me create a skill for [workflow]"
- "Review my skill and suggest improvements"
- "Convert this process into a reusable skill"
- "What's the best way to structure this skill?"

Claude will:
- Structure the skill correctly
- Write clear documentation
- Add appropriate examples
- Suggest improvements
- Ensure proper YAML formatting
- Test the skill structure
