# 07 - MetaGPT Reuse Strategy

**Status:** ✅ Ready to Copy (TEMPLATES ONLY)
**Source:** `Blackbox Implementation Plan/Evaluations/05-METAGPT.md`
**Destination:** `blackbox4/templates/documents/`

**Action:** Copy MetaGPT document templates, not code.

---

## 📦 What You're Getting (Templates, Not Code)

MetaGPT is a full automation system (Python runtime), but Blackbox4 only needs its **document templates**.

### Why Not Copy MetaGPT Code?

| Reason | MetaGPT | Blackbox4 Approach |
|--------|----------|-------------------|
| **Philosophy** | Full automation (code generation) | Manual-first with optional automation (via Ralph) |
| **Execution** | Runs automatically | Human works with AI in chat |
| **Code Quality** | Risk of bad patterns | Human oversight ensures quality |
| **Vendor Swap** | No validation | You have vendor swap validators |
| **Fit** | Wrong level of automation | Use Ralph for autonomy when needed |

**Decision:** Use only MetaGPT's **document templates**, not the code.

---

## 📋 Document Templates to Copy

### A. PRD Template

**Copy to:** `templates/documents/prd-template.md`

**Source:** MetaGPT ProductManager agent output format

```markdown
# Product Requirements Document

## Overview

**Project:** [Project name]
**Version:** [Version]
**Date:** [Date]
**Author:** [Author]

## Product Vision

### Problem Statement
[What problem are we solving?]

### Solution Overview
[What is our solution?]

### Target Users
[Who will use this product?]

### Success Metrics
[How do we measure success?]

## Competitive Analysis

### Competitor 1: [Name]
- Strengths: [What they do well]
- Weaknesses: [Where they fall short]
- Differentiators: [How we're different]

### Competitor 2: [Name]
...

## Features

### Must Have (P0)
- [ ] [Feature 1]
- [ ] [Feature 2]

### Should Have (P1)
- [ ] [Feature 3]
- [ ] [Feature 4]

### Nice to Have (P2)
- [ ] [Feature 5]
- [ ] [Feature 6]

## User Stories

### [Epic Name]

#### Story 1: [Title]
**As a** [user type],
**I want** [action],
**So that** [benefit].

**Acceptance Criteria:**
- [ ] [Criterion 1]
- [ ] [Criterion 2]

#### Story 2: [Title]
...

## Technical Requirements

### Performance
- [Performance requirement 1]
- [Performance requirement 2]

### Scalability
- [Scalability requirement 1]
- [Scalability requirement 2]

### Security
- [Security requirement 1]
- [Security requirement 2]

## Constraints

### Technical Constraints
- [Technical limitation 1]
- [Technical limitation 2]

### Business Constraints
- [Business limitation 1]
- [Business limitation 2]

### Time Constraints
- [Time limitation 1]
- [Time limitation 2]

## Timeline

### Phase 1: [Phase Name]
- [Milestone 1]: [Date]
- [Milestone 2]: [Date]

### Phase 2: [Phase Name]
...
```

---

### B. API Design Template

**Copy to:** `templates/documents/api-design-template.md`

**Source:** MetaGPT Engineer2 agent output format

```markdown
# API Design Document

## Overview

**API Name:** [API name]
**Version:** [Version]
**Date:** [Date]
**Author:** [Author]

## Architecture

### API Style
- [ ] REST
- [ ] GraphQL
- [ ] gRPC

### Communication Protocol
- [ ] HTTP/1.1
- [ ] HTTP/2
- [ ] WebSocket

### Data Format
- [ ] JSON
- [ ] XML
- [ ] Protocol Buffers

## Endpoints

### Authentication

#### POST /api/v1/auth/login
**Description:** [Endpoint description]

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response (200):**
```json
{
  "token": "jwt_token_here",
  "expires_in": 3600
}
```

**Response (401):**
```json
{
  "error": "Unauthorized",
  "message": "Invalid credentials"
}
```

#### POST /api/v1/auth/refresh
**Description:** Refresh JWT token

...

### Users

#### GET /api/v1/users/:id
**Description:** Get user by ID

**Response (200):**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### POST /api/v1/users
**Description:** Create new user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password",
  "name": "John Doe"
}
```

#### PUT /api/v1/users/:id
**Description:** Update user

...

#### DELETE /api/v1/users/:id
**Description:** Delete user

...

## Data Models

### User Model

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | User ID |
| email | String | Yes | User email |
| password | String | Yes | Hashed password |
| name | String | Yes | User name |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Update timestamp |

### Session Model

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Session ID |
| user_id | UUID | Yes | User ID |
| token | String | Yes | JWT token |
| expires_at | DateTime | Yes | Expiration timestamp |
| created_at | DateTime | Yes | Creation timestamp |

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Entity |
| 500 | Internal Server Error |

## Rate Limiting

### Limits
- [ ] 100 requests per minute per IP
- [ ] 1000 requests per hour per user

### Headers
- `X-RateLimit-Limit`: [Rate limit]
- `X-RateLimit-Remaining`: [Remaining requests]
- `X-RateLimit-Reset`: [Reset timestamp]

## Security

### Authentication
- [ ] JWT tokens
- [ ] OAuth 2.0
- [ ] API keys

### Authorization
- [ ] Role-based access control
- [ ] Resource ownership checks
- [ ] Permission-based access

### Data Validation
- [ ] Input validation on all endpoints
- [ ] Output sanitization
- [ ] SQL injection prevention
- [ ] XSS prevention

## Versioning

### Versioning Strategy
- [ ] URL versioning (/api/v1/)
- [ ] Header versioning (Accept: application/vnd.api.v1+json)
- [ ] Deprecation policy

### Breaking Changes
- [ ] Document all breaking changes
- [ ] Provide migration guide
- [ ] Maintain old version for N months
```

---

### C. Competitive Analysis Template

**Copy to:** `templates/documents/competitive-analysis-template.md`

**Source:** MetaGPT ProductManager agent competitive analysis format

```markdown
# Competitive Analysis

## Overview

**Industry:** [Industry name]
**Market:** [Market segment]
**Date:** [Date]
**Author:** [Author]

## Competitors

### Competitor 1: [Name]

#### Overview
- **Founded:** [Year]
- **Funding:** [Funding amount]
- **Employees:** [Employee count]
- **Website:** [Website]

#### Product Overview
- **Core Value Proposition:** [What makes them different]
- **Target Market:** [Who they serve]
- **Business Model:** [How they make money]

#### Strengths
- [Strength 1]
- [Strength 2]
- [Strength 3]

#### Weaknesses
- [Weakness 1]
- [Weakness 2]
- [Weakness 3]

#### Pricing
- [Price point]
- [Pricing model]
- [Value proposition]

#### Key Features
| Feature | Description | Status |
|---------|-------------|--------|
| [Feature 1] | [Description] | [Available/Planned] |
| [Feature 2] | [Description] | [Available/Planned] |

### Competitor 2: [Name]
...

## Market Positioning

### Our Differentiators
- [Differentiator 1]
- [Differentiator 2]
- [Differentiator 3]

### Our Advantages
- [Advantage 1]
- [Advantage 2]
- [Advantage 3]

### Our Disadvantages
- [Disadvantage 1]
- [Disadvantage 2]
- [Disadvantage 3]

## Recommendations

### Opportunities
- [Market opportunity 1]
- [Market opportunity 2]

### Threats
- [Competitive threat 1]
- [Competitive threat 2]

### Strategic Positioning
[How should we position ourselves?]
```

---

## 🚀 Copy Command

```bash
# 1. Create templates directory
mkdir -p blackbox4/templates/documents

# 2. Create document templates
cat > blackbox4/templates/documents/prd-template.md << 'EOF'
[Copy PRD template from above section]
EOF

cat > blackbox4/templates/documents/api-design-template.md << 'EOF'
[Copy API Design template from above section]
EOF

cat > blackbox4/templates/documents/competitive-analysis-template.md << 'EOF'
[Copy Competitive Analysis template from above section]
EOF

# 3. Copy MetaGPT evaluation as reference
cp "Blackbox Implementation Plan/Evaluations/05-METAGPT.md" \
   blackbox4/docs/frameworks/metagpt-reference.md
```

---

## ✅ What You Get After This Section

1. ✅ **3 Document Templates** - PRD, API Design, Competitive Analysis
2. ✅ **Reference Documentation** - MetaGPT evaluation for reference
3. ✅ **Usage Examples** - How to use templates with Blackbox4
4. ✅ **Integration Guide** - How templates fit with BMAD agents

**Total New Code:** 0 lines
**Total Code Reused:** Templates from MetaGPT patterns
**Implementation:** As documentation only, not code

---

## 🎯 Usage Examples

### Use PRD Template with John (PM) Agent

```bash
cd blackbox4/agents/.plans/my-project

# 1. Copy template
cp templates/documents/prd-template.md prd.md

# 2. Fill with AI (using John PM agent)
# "Read: agents/bmad/john.agent.yaml
# Apply prd.md template and fill in product details"

# 3. Use in BMAD Phase 2 (Planning)
./scripts/bmad-phase-tracker.sh set planning
```

### Use API Design Template with Winston (Architect) Agent

```bash
cd blackbox4/agents/.plans/my-project

# 1. Copy template
cp templates/documents/api-design-template.md api-design.md

# 2. Fill with AI (using Winston Architect agent)
# "Read: agents/bmad/winston.agent.yaml
# Apply api-design.md template and design REST API"
```

### Use Competitive Analysis with Mary (Analyst) Agent

```bash
cd blackbox4/agents/.plans/my-project

# 1. Copy template
cp templates/documents/competitive-analysis-template.md competitive-analysis.md

# 2. Fill with AI (using Mary Analyst agent)
# "Read: agents/bmad/mary.agent.yaml
# Apply competitive-analysis.md template and research 3-5 competitors"
```

---

## 📊 Integration Summary

| Component | Source | Size | Action | Status |
|-----------|--------|------|--------|--------|
| **PRD Template** | MetaGPT | Template | Copy | ✅ Ready |
| **API Design Template** | MetaGPT | Template | Copy | ✅ Ready |
| **Competitive Analysis Template** | MetaGPT | Template | Copy | ✅ Ready |
| **MetaGPT Evaluation** | Implementation Plan | Doc | Copy as ref | ✅ Ready |
| **Usage Examples** | This doc | Examples | New | ✅ Ready |

**Reuse Ratio:** 100% templates from MetaGPT patterns
**Implementation:** Documentation only, no code

---

## ✅ Success Criteria

After completing this section:

1. ✅ `templates/documents/prd-template.md` exists with full template
2. ✅ `templates/documents/api-design-template.md` exists with full template
3. ✅ `templates/documents/competitive-analysis-template.md` exists with full template
4. ✅ All templates are well-documented with examples
5. ✅ Integration with BMAD agents is documented
6. ✅ Reference documentation is available

---

## 🎯 Next Step

**Go to:** `08-SWARM-REUSE.md`

**Add Swarm context variable and validation patterns (as patterns, not code).**
