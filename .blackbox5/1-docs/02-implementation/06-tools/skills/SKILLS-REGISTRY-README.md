# BlackBox5 Skills Registry

**Last Updated**: 2025-01-18
**Status**: ✅ Complete
**Total Skills**: 36
**Completion**: 51% of 70 target

---

## Quick Stats

- **Core Infrastructure**: 2 skills
- **Integration & Connectivity**: 6 skills
- **Development Workflow**: 13 skills
- **Knowledge & Documentation**: 5 skills
- **Collaboration & Communication**: 10 skills

---

## Using the Registry

### View All Skills

```bash
# Run verification script
python3 .blackbox5/scripts/verify_skills.py
```

### Browse Skills

```bash
# List all skill files
find .blackbox5/engine/agents/skills -name "SKILL.md" -type f

# View a specific skill
cat .blackbox5/engine/agents/skills/integration-connectivity/api-integrations/rest-api/SKILL.md
```

### Load Skills in Python

```python
from blackbox5.engine.agents.core.SkillManager import SkillManager

# Load all skills (automatically loads from skills/ directory)
manager = SkillManager()

# Access skills
print(f"Loaded {len(manager.skills)} skills")

# Get skill by name
skill = manager.get_skill('rest-api')
print(skill.name, skill.description)
```

---

## Skills Directory Structure

```
.blackbox5/engine/agents/skills/
├── SKILLS-REGISTRY.yaml           # Main registry file
├── core-infrastructure/           # Development tools & version control
│   ├── development-tools/
│   └── version-control/
├── integration-connectivity/      # APIs, databases, integrations
│   ├── api-integrations/
│   └── database-operations/
├── development-workflow/          # Testing, deployment, code quality
│   ├── coding-assistance/
│   ├── deployment-ops/
│   ├── development/
│   └── testing-quality/
├── knowledge-documentation/       # Docs, research, planning
│   ├── documentation/
│   ├── planning-architecture/
│   └── research-analysis/
└── collaboration-communication/   # Automation, collaboration, thinking
    ├── automation/
    ├── collaboration/
    └── thinking-methodologies/
```

---

## Adding New Skills

1. Create skill file following the template structure
2. Add to `SKILLS-REGISTRY.yaml`
3. Run verification script

### Skill Template

```yaml
---
name: my-skill
category: development-workflow/development
version: 1.0.0
description: Brief description of what this skill does
author: blackbox5/core
verified: true
tags: [tag1, tag2, tag3]
---

# My Skill

## Overview

Detailed description...

## When to Use This Skill

✅ Use case 1
✅ Use case 2

---

## Context

Explanation of the skill...

## Instructions

How to use this skill...

## Rules

DO/DON'T guidelines...

## Workflow

Step-by-step process...

## Best Practices

Recommended approaches...

## Anti-Patterns

Before/After examples...

## Examples

Complete working examples...

## Integration Notes

Tool integration...

## Error Handling

Common issues...

## Output Format

Expected outputs...

## Related Skills

- skill1
- skill2

## See Also

External resources...
```

---

## Skill Categories

### Core Infrastructure (2 skills)
Essential tools and development environment setup
- `github-cli` - GitHub CLI workflows
- `using-git-worktrees` - Parallel branch development

### Integration & Connectivity (6 skills)
API integration, database operations, and external services
- `rest-api` - REST API patterns
- `graphql-api` - GraphQL with Apollo
- `webhooks` - Event handling
- `sql-queries` - PostgreSQL queries
- `orm-patterns` - Prisma/Drizzle ORM
- `migrations` - Database migrations

### Development Workflow (13 skills)
Testing, deployment, and code quality practices
- `unit-testing` - Jest/Vitest/Pytest
- `integration-testing` - API and database testing
- `e2e-testing` - Playwright browser automation
- `systematic-debugging` - Debugging methodology
- `linting-formatting` - ESLint/Prettier
- `refactoring` - SOLID principles
- `code-generation` - AI-assisted coding
- `test-driven-development` - TDD cycle
- `docker-containers` - Docker workflows
- `ci-cd` - GitHub Actions
- `kubernetes` - K8s deployments
- `monitoring` - Observability
- `batch-operations` - Bulk processing

### Knowledge & Documentation (5 skills)
Documentation, research, and planning
- `api-documentation` - OpenAPI/Swagger
- `readme-generation` - Project READMEs
- `docs-routing` - Documentation architecture
- `writing-plans` - Implementation planning
- `market-research` - Market analysis

### Collaboration & Communication (10 skills)
Team workflows, automation, and thinking methodologies
- `task-automation` - Workflow automation
- `ui-cycle` - UI development automation
- `notifications-local` - Desktop notifications
- `requesting-code-review` - Code review practices
- `subagent-driven-development` - AI agent orchestration
- `skill-creator` - Creating reusable skills
- `critical-thinking` - Analytical problem-solving
- `deep-research` - In-depth research
- `first-principles-thinking` - Fundamental analysis
- `intelligent-routing` - Task optimization

---

## Verification

Run the verification script to ensure all skills are present:

```bash
python3 .blackbox5/scripts/verify_skills.py
```

Expected output:
```
============================================================
BlackBox5 Skills Verification
============================================================
✅ github-cli
✅ using-git-worktrees
... (all 36 skills)
============================================================
Total: 36
Verified: ✅ 36
Failed: ❌ 0

🎉 All skills verified successfully!
```

---

## Next Steps

### To Add 34 More Skills (Reach 70 Target)

High Priority Skills Needed:
1. `supabase` - Supabase integration patterns
2. `nextjs` - Next.js best practices
3. `react` - React component patterns
4. `typescript` - TypeScript advanced patterns
5. `nodejs` - Node.js backend patterns
6. `python` - Python development patterns
7. `security` - Security best practices
8. `performance` - Performance optimization
9. `accessibility` - A11y patterns
10. `testing-strategies` - Comprehensive testing approach

Medium Priority:
11. `system-design` - Architecture patterns
12. `api-design` - REST/GraphQL design
13. `database-design` - Schema design
14. `caching` - Caching strategies
15. `auth-patterns` - Authentication flows

### To Contribute

1. Follow the skill template structure
2. Include practical examples
3. Add before/after anti-patterns
4. Update this registry
5. Run verification script

---

## Maintenance

### Update Verification Script

```bash
# Edit verification script
vim .blackbox5/scripts/verify_skills.py

# Run verification
python3 .blackbox5/scripts/verify_skills.py
```

### Update Registry

```bash
# Edit registry
vim .blackbox5/engine/agents/.skills-new/SKILLS-REGISTRY.yaml

# Verify changes
python3 .blackbox5/scripts/verify_skills.py
```

---

## Resources

- **BlackBox5 Engine**: `.blackbox5/engine/`
- **Skills Directory**: `.blackbox5/engine/agents/.skills-new/`
- **Verification Script**: `.blackbox5/scripts/verify_skills.py`
- **Registry**: `.blackbox5/engine/agents/.skills-new/SKILLS-REGISTRY.yaml`

---

**Status**: ✅ Registry Complete
**Next**: Add 34 more skills to reach 70 target
**Maintained by**: blackbox5/core
