# Blackbox4 Spec Templates

**Location:** `/Users/shaansisodia/DEV/AI-HUB/Black Box Factory/current/.blackbox4/5-templates/specs/`

**Version:** 1.0
**Last Updated:** 2025-01-15

---

## Overview

This directory contains comprehensive templates for creating specifications in the Blackbox4 system. These templates are designed to ensure consistency, completeness, and quality across all project documentation.

---

## Available Templates

### 1. PRD Template (`prd-template.md`)

**Purpose:** Product Requirements Document - Complete project specification

**When to use:**
- Starting a new project or feature
- Documenting comprehensive product requirements
- Creating a single source of truth for project scope

**Key sections:**
- Executive Summary
- Overview (Problem, Goals, Success Criteria)
- User Stories
- Functional Requirements
- Non-Functional Requirements
- Technical Constraints
- Assumptions, Dependencies, Risks
- Open Questions & Clarifications

**Best practices:**
- Fill all placeholder brackets [LIKE_THIS]
- Update version control table on changes
- Link related documents in Appendix
- Keep open questions section current

---

### 2. Constitution Template (`constitution-template.md`)

**Purpose:** Project governance and technical standards

**When to use:**
- Establishing project ground rules
- Documenting technology stack decisions
- Defining quality and workflow standards

**Key sections:**
- Vision
- Technology Stack (Frontend, Backend, Database, Infrastructure)
- Quality Standards (Code, Performance, Security, Documentation)
- Architectural Principles
- Development Workflow
- Constraints & Limitations
- Success Metrics
- Decision Log

**Best practices:**
- Complete before starting development
- Review and update quarterly
- Use decision log to track major technical choices
- Keep constraints realistic and up-to-date

---

### 3. User Story Template (`user-story-template.md`)

**Purpose:** Individual user story documentation

**When to use:**
- Breaking down epics into implementable stories
- Documenting specific features or capabilities
- Creating tickets for development team

**Key sections:**
- User Story (As a/I want/So that format)
- Context & Background
- Acceptance Criteria (Given/When/Then format)
- Definition of Done
- Technical Notes
- Dependencies

**Best practices:**
- One user story = one implementable unit
- Keep stories small enough for single sprint
- All acceptance criteria must be testable
- Link dependencies explicitly

---

### 4. Questioning Worksheet (`questioning-worksheet.md`)

**Purpose:** Critical review and gap analysis of specifications

**When to use:**
- Reviewing specs before approval
- Conducting spec workshops
- Identifying gaps and risks
- Preparing for stakeholder reviews

**Key sections:**
- Overview Questioning
- User Stories Questioning
- Requirements Questioning
- Technical Decisions Questioning
- Testability Questioning
- Summary & Action Items

**Best practices:**
- Use with facilitator for best results
- Be honest about confidence levels
- Document all follow-ups needed
- Assign owners to action items

---

## Template Usage Workflow

### For New Projects:

1. **Start with PRD Template**
   - Copy `prd-template.md` to project directory
   - Rename to `prd-[project-name].md`
   - Fill out all sections

2. **Create Constitution**
   - Copy `constitution-template.md` to project directory
   - Rename to `constitution-[project-name].md`
   - Define technical standards and governance

3. **Break Down into Stories**
   - Copy `user-story-template.md` for each user story
   - Name files `us-[number]-[title].md`
   - Ensure all stories link back to PRD

4. **Review with Questioning Worksheet**
   - Copy `questioning-worksheet.md` to project directory
   - Conduct thorough spec review
   - Document gaps and action items

### For Existing Projects:

1. **Audit current documentation**
2. **Identify missing templates**
3. **Fill gaps using appropriate templates**
4. **Update existing docs to match template structure**

---

## Naming Conventions

### PRD Files:
```
prd-[project-name].md
prd-[feature-name].md
```

### Constitution Files:
```
constitution-[project-name].md
constitution-[component-name].md
```

### User Story Files:
```
us-[number]-[short-title].md
us-001-user-registration.md
us-002-password-reset.md
```

### Questioning Worksheets:
```
questioning-[project-name]-[date].md
questioning-[feature-name]-review.md
```

---

## Template Customization

### Adding Sections:
1. Copy template first
2. Add custom sections after standard sections
3. Document reason for addition
4. Keep standard sections intact

### Removing Sections:
1. Don't remove standard sections
2. Mark sections as "N/A" if not applicable
3. Add note explaining why not applicable

### Modifying Structure:
1. Discuss with team first
2. Update template itself (not individual files)
3. Document change in template version history
4. Ensure all future uses follow updated template

---

## Quality Checklist

Before considering a spec complete, ensure:

### PRD:
- [ ] Executive summary is clear and concise
- [ ] All user stories follow standard format
- [ ] All requirements have acceptance criteria
- [ ] Technical constraints are realistic
- [ ] Risks are identified with mitigation strategies
- [ ] Open questions section is current

### Constitution:
- [ ] Vision statement is clear
- [ ] Technology stack is fully specified
- [ ] Quality standards are measurable
- [ ] Architectural principles are defined
- [ ] Development workflow is documented
- [ ] Decision log is being maintained

### User Stories:
- [ ] Follow "As a/I want/So that" format
- [ ] Acceptance criteria use Given/When/Then
- [ ] Definition of Done is complete
- [ ] Dependencies are documented
- [ ] Story is sized appropriately

### Questioning Worksheet:
- [ ] All questioning sections completed
- [ ] Confidence levels assigned
- [ ] Action items have owners and due dates
- [ ] Facilitator notes are comprehensive

---

## Integration with Blackbox4

### Location in Project Structure:
```
.blackbox4/
├── 5-templates/
│   └── specs/
│       ├── prd-template.md
│       ├── constitution-template.md
│       ├── user-story-template.md
│       ├── questioning-worksheet.md
│       └── README.md
├── 1-planning/
│   ├── specs/
│   │   ├── prd-[project].md
│   │   ├── constitution-[project].md
│   │   └── user-stories/
│   │       ├── us-001-*.md
│   │       └── us-002-*.md
│   └── reviews/
│       └── questioning-[project]-[date].md
```

### Links to Other Systems:
- **Kanban Module:** User stories become tasks
- **Context Module:** Technical details inform context
- **Planning Module:** Specs drive implementation plans

---

## Best Practices

1. **Start with templates**
   - Don't create specs from scratch
   - Templates ensure completeness

2. **Keep specs current**
   - Update as requirements change
   - Maintain version history

3. **Be specific**
   - Avoid vague language
   - Use measurable criteria

4. **Think critically**
   - Use questioning worksheet regularly
   - Challenge assumptions

5. **Collaborate**
   - Get input from all stakeholders
   - Review specs with team

6. **Link everything**
   - Cross-reference related documents
   - Maintain traceability

---

## Common Mistakes to Avoid

1. **Skipping sections** - All sections exist for a reason
2. **Being too vague** - Specificity enables implementation
3. **Ignoring constraints** - Real constraints affect design
4. **Forgetting dependencies** - Dependencies impact timeline
5. **Not updating** - Stale specs are worse than no specs
6. **Working in isolation** - Specs need team input

---

## Support and Feedback

### Questions:
- Consult this README first
- Check template examples
- Ask team for clarification

### Improvements:
- Suggest template enhancements
- Report missing sections
- Share successful patterns

### Version History:
- 1.0 (2025-01-15) - Initial template suite

---

## Quick Reference

| Need | Use This Template |
|------|-------------------|
| Document a project | `prd-template.md` |
| Define governance | `constitution-template.md` |
| Create a story | `user-story-template.md` |
| Review a spec | `questioning-worksheet.md` |

---

**Remember:** Templates are tools to help you create better specifications. Use them consistently, customize thoughtfully, and always prioritize clarity and completeness.
