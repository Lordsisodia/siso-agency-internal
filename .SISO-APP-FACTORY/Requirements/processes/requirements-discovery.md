# Requirements Discovery Process

**A systematic approach to gathering, analyzing, and documenting product requirements.**

---

## 🎯 **Discovery Overview**

### Purpose
Transform stakeholder needs, user problems, and business objectives into clear, actionable product requirements.

### Discovery Timeline
**Total Duration:** 2-3 weeks  
**Effort:** 40-60% of PRD development time  
**Key Principle:** Invest time upfront to save months later  

---

## 📋 **Pre-Discovery Preparation**

### 1. Stakeholder Identification (Day 1)
Create a comprehensive stakeholder map:

| Stakeholder Type | Examples | Information Needed | Interview Priority |
|-----------------|----------|-------------------|------------------|
| **Primary Users** | End users, customers | Pain points, workflows, goals | High |
| **Business Stakeholders** | Product owners, executives | Business objectives, constraints | High |
| **Technical Team** | Developers, architects | Technical constraints, capabilities | High |
| **Secondary Users** | Admins, support team | Edge cases, operational needs | Medium |
| **External Partners** | Vendors, integrators | Integration requirements | Medium |

### 2. Research Foundation (Days 1-2)
**Existing Knowledge Audit:**
- [ ] Previous user research and feedback
- [ ] Support tickets and common issues
- [ ] Analytics data and usage patterns
- [ ] Competitive analysis and market research
- [ ] Technical debt and system constraints

**Research Questions Framework:**
- **What** are users trying to accomplish?
- **Why** is this important to them/business?
- **How** do they currently solve this problem?
- **When** and **where** does this problem occur?
- **Who** else is affected by this problem?

---

## 🗣️ **Stakeholder Interview Process**

### Interview Planning (Day 2)
**Interview Structure:** 45-60 minutes per session  
**Schedule:** Mix of 1:1 and small group sessions  
**Documentation:** Record with permission, take detailed notes  

### Interview Script Template

#### Opening (5 minutes)
- Introduce yourself and the project
- Explain the purpose and timeline
- Set expectations for confidentiality and follow-up
- Get permission to record (if applicable)

#### Background & Context (10 minutes)
**For Users:**
- "Tell me about your current role and daily responsibilities"
- "How does [problem area] fit into your typical workflow?"
- "What tools do you currently use for this?"

**For Business Stakeholders:**
- "What business objective is driving this project?"
- "How does this align with broader company goals?"
- "What does success look like for this initiative?"

#### Problem Deep Dive (20 minutes)
**Universal Questions:**
- "Describe the biggest challenges you face with [problem area]"
- "Walk me through what happens when [scenario occurs]"
- "What's the most frustrating part of the current process?"
- "If you could wave a magic wand, what would the ideal solution look like?"

**Follow-up Probes:**
- "Can you give me a specific example?"
- "How often does this happen?"
- "What's the impact when this goes wrong?"
- "Who else is affected by this?"

#### Solution Exploration (15 minutes)
- "What solutions have you tried before?"
- "What worked well? What didn't?"
- "What would make the biggest difference in your work?"
- "What concerns do you have about potential solutions?"

#### Constraints & Priorities (10 minutes)
- "What are the non-negotiable requirements?"
- "What would be nice to have but not essential?"
- "What are the biggest risks or concerns?"
- "What timeline constraints should we consider?"

#### Closing (5 minutes)
- "Is there anything important we haven't discussed?"
- "Who else should we talk to about this?"
- "Would you be available for follow-up questions?"
- "Can we schedule a time to review our findings with you?"

### Interview Best Practices
✅ **Do:**
- Ask open-ended questions
- Listen more than you talk
- Probe for specific examples
- Stay curious and avoid leading questions
- Document exact quotes for powerful insights

❌ **Don't:**
- Propose solutions during discovery
- Interrupt or rush responses
- Make assumptions about user knowledge
- Skip the emotional aspects of problems
- Promise features or timelines

---

## 📊 **Data Collection & Analysis**

### Quantitative Research (Days 3-5)
**Analytics Deep Dive:**
- User behavior patterns and drop-off points
- Feature usage statistics and adoption rates
- Performance metrics and error rates
- Support ticket volume and categories
- A/B test results and user feedback scores

**Surveys & Questionnaires:**
- Broader user base validation of interview insights
- Quantify problem severity and frequency
- Prioritize feature requests and pain points
- Gather demographic and usage pattern data

### Qualitative Research (Days 6-8)
**User Observation:**
- Shadow users in their natural environment
- Document current workflows and pain points
- Identify unstated needs and assumptions
- Observe workarounds and creative solutions

**Competitive Analysis:**
- How do competitors solve similar problems?
- What are the strengths/weaknesses of existing solutions?
- Where are the opportunities for differentiation?
- What can we learn from their user feedback?

---

## 🔍 **Requirement Synthesis**

### Requirements Workshop (Days 9-10)
**Participants:** Core project team + key stakeholders  
**Duration:** 4-6 hours (can be split across days)  
**Facilitator:** Product manager or business analyst  

#### Workshop Agenda:

**1. Insights Sharing (60 minutes)**
- Present key findings from interviews and research
- Identify themes and patterns across stakeholders
- Discuss surprises and conflicting viewpoints
- Validate insights with stakeholders present

**2. Problem Definition (45 minutes)**
- Create problem statements using "How Might We" format
- Prioritize problems by impact and frequency
- Ensure alignment on root causes vs. symptoms
- Document problem statements for PRD

**3. Solution Brainstorming (60 minutes)**
- Generate multiple solution approaches
- Consider technical feasibility and constraints
- Evaluate solutions against user needs and business goals
- Identify dependencies and integration points

**4. Requirements Extraction (90 minutes)**
- Convert insights into specific, measurable requirements
- Categorize requirements (functional, non-functional, constraints)
- Apply MoSCoW prioritization (Must/Should/Could/Won't)
- Define acceptance criteria for high-priority requirements

**5. Next Steps Planning (30 minutes)**
- Assign ownership for requirement validation
- Schedule follow-up sessions with stakeholders
- Plan prototype or mockup creation
- Set timeline for PRD completion

### Requirement Documentation Framework

#### Functional Requirements Template
**Requirement ID:** FR-001  
**Title:** [Brief, descriptive name]  
**User Story:** As a [user type], I want [capability] so that [benefit]  
**Priority:** Must Have | Should Have | Could Have | Won't Have  
**Source:** [Interview/Research/Workshop]  
**Acceptance Criteria:**
- [ ] [Specific, testable criterion 1]
- [ ] [Specific, testable criterion 2]

**Business Justification:** [Why this matters to business]  
**User Impact:** [How this affects user experience]  
**Technical Notes:** [Implementation considerations]  
**Dependencies:** [Other requirements or systems this depends on]

#### Non-Functional Requirements Template
**Requirement ID:** NFR-001  
**Category:** Performance | Security | Usability | Scalability | etc.  
**Description:** [Clear, measurable requirement]  
**Measurement:** [How success will be measured]  
**Priority:** Critical | Important | Nice-to-Have  
**Source:** [Where this requirement came from]

---

## ✅ **Requirement Validation**

### Validation Methods (Days 11-14)

#### 1. Stakeholder Review Cycles
- **Round 1:** Share draft requirements with interview participants
- **Round 2:** Present refined requirements to broader stakeholder group
- **Round 3:** Final validation with decision makers

#### 2. Prototype Validation
- Create low-fidelity wireframes or mockups
- Test key user flows with representative users
- Validate assumptions about user behavior and preferences
- Refine requirements based on prototype feedback

#### 3. Technical Feasibility Review
- Architect review of technical requirements
- Identify technical risks and constraints
- Estimate development effort for requirements
- Recommend alternative approaches for complex requirements

#### 4. Business Case Validation
- Cost-benefit analysis of key requirements
- ROI projections for different solution approaches
- Risk assessment for high-impact requirements
- Resource and timeline validation

### Validation Checklist
- [ ] All requirements are specific and measurable
- [ ] Each requirement has clear acceptance criteria
- [ ] Requirements are prioritized and justified
- [ ] Technical feasibility is confirmed
- [ ] User needs are clearly connected to business value
- [ ] Edge cases and error scenarios are considered
- [ ] Dependencies and constraints are identified
- [ ] Stakeholders have reviewed and approved requirements

---

## 📝 **Documentation & Handoff**

### Final Discovery Deliverables
1. **Requirements Specification Document**
   - All functional and non-functional requirements
   - Prioritization with business justification
   - User stories and acceptance criteria
   - Technical constraints and dependencies

2. **User Research Summary**
   - Key insights from interviews and observations
   - User personas and journey maps
   - Pain points and opportunity areas
   - Quotes and evidence supporting requirements

3. **Technical Assessment**
   - Architecture recommendations
   - Technology stack considerations
   - Integration requirements and constraints
   - Security and compliance considerations

4. **Business Case Documentation**
   - Problem statement and business impact
   - Success metrics and measurement plan
   - Resource requirements and timeline
   - Risk assessment and mitigation strategies

### PRD Development Transition
**Handoff Meeting:** Present discovery findings to PRD development team  
**Questions & Clarifications:** Address any gaps or uncertainties  
**Ongoing Support:** Make discovery team available during PRD development  
**Change Management:** Process for handling new requirements or changes  

---

## 🚀 **Discovery Success Factors**

### What Makes Discovery Successful
✅ **Clear Scope:** Well-defined boundaries and objectives  
✅ **Stakeholder Buy-in:** Commitment from all key participants  
✅ **Diverse Perspectives:** Multiple viewpoints and user types  
✅ **Evidence-Based:** Data and research backing all conclusions  
✅ **Actionable Output:** Requirements that teams can implement  

### Common Discovery Pitfalls
❌ **Solution Fixation:** Focusing on solutions instead of problems  
❌ **Insufficient User Input:** Relying too heavily on internal opinions  
❌ **Scope Creep:** Expanding discovery without adjusting timeline  
❌ **Analysis Paralysis:** Over-researching without making decisions  
❌ **Poor Documentation:** Losing insights due to inadequate records  

### Discovery Metrics
- **Stakeholder Coverage:** % of identified stakeholders interviewed
- **Requirement Quality:** % of requirements with clear acceptance criteria
- **Validation Rate:** % of requirements validated through multiple sources
- **Change Rate:** % of requirements changed during PRD development
- **Satisfaction Score:** Stakeholder satisfaction with discovery process

---

*Effective requirements discovery is the foundation of successful products. Invest time upfront to save months of rework and ensure you're building the right thing.*