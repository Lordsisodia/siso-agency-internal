# PDR Cookbook Context for BMAD Intelligence

## 🎯 **SISO Agency App Understanding**

### Core Business Model
SISO is an **AI-powered development agency** that builds custom websites and PWAs:
- **Speed Advantage**: Deliver in hours/days (vs weeks/months for traditional agencies)
- **AI Development**: Autonomous AI agents handle development work
- **Template Strategy**: Each custom build becomes reusable template
- **Partner Program**: 20% commission for referrals + 10% for team leaders (30% total)
- **Industry Agnostic**: Serve restaurants, crypto, agencies, ANY business

### PDR System Architecture
**PDR (Project Development Report)** is the core workflow:
1. **75-Step Timeline Process**: Structured client project workflow
2. **Autonomous Framework**: AI agents generate comprehensive PDRs with minimal human intervention
3. **Parallel Execution**: Multiple agents work simultaneously (4-hour PDRs vs 2-week discovery)
4. **Version-Based Planning**: Day 1 → Day 2 → Week 2 → Month 2 → Year 2 progression

## 🏗️ **Client Portal Architecture Context**

### Key Components
- **Live PDR Activity**: Real-time visibility into AI agents building projects
- **PDR Step Timeline**: 75-step structured workflow visualization
- **Project Header**: Client project overview and status
- **Enhanced Descriptions**: Detailed step descriptions with time estimates

### Client Experience Flow
1. **Onboarding**: Capture design preferences through mood boards
2. **Research Phase**: AI analyzes competitors + market research
3. **Planning Phase**: Feature roadmap with 5 version stages
4. **Development**: Real-time AI agent development visibility
5. **Template Creation**: Convert project to reusable template

### Database Schema (From PDR System)
```sql
-- PDR Step Tracking
- client_id (tenant isolation)
- project_id
- step_number (1-75)
- status (pending/in_progress/completed)
- ai_agent_assigned
- estimated_duration
- actual_duration
- client_feedback
```

## 🎭 **BMAD Integration Strategy**

### PDR-Enhanced BMAD Workflow
The PDR cookbook provides BMAD with:

1. **Pre-Built Client Understanding**:
   - Industry analysis patterns
   - Competitor research frameworks  
   - Market positioning strategies
   - Technical architecture templates

2. **Structured Development Process**:
   - 75-step methodology for client projects
   - Version-based feature planning
   - AI agent orchestration patterns
   - Quality gates and testing frameworks

3. **Client Portal Specific Context**:
   - Real-time project visibility requirements
   - Partner commission tracking needs
   - Template library management
   - Client feedback integration

### BMAD Agent Context Enhancement

#### Analyst Agent (Enhanced with PDR)
- **Market Research**: Use PDR step 2-4 methodologies
- **Competitor Analysis**: Leverage competitor deep-analysis frameworks
- **Industry Positioning**: Apply PDR market positioning strategies

#### PM Agent (Enhanced with PDR)
- **Feature Planning**: Use PDR version-based roadmap approach
- **Client Journey**: Apply 75-step client experience framework
- **Partner Integration**: Include commission structure in planning

#### Architect Agent (Enhanced with PDR)
- **Technical Planning**: Use PDR technical architecture templates
- **Database Design**: Apply PDR database schema patterns
- **API Planning**: Leverage PDR API integration blueprints

#### UX Expert Agent (Enhanced with PDR)
- **Mood Board Analysis**: Use PDR design preference capture
- **Competitor UI Analysis**: Apply PDR wireframe generation guidelines
- **Client Dashboard**: Design for real-time AI agent visibility

## 📊 **Performance Metrics Context**

### SISO Success Metrics (Apply to Client Portal)
- **Development Speed**: 10x faster than traditional agencies
- **Client Satisfaction**: 4.5+/5 rating on speed, quality, price
- **Project Delivery**: Website/PWA live within 48-72 hours
- **Cost Advantage**: 50-70% cheaper than traditional agencies
- **Partner Revenue**: $100K+ monthly through commission program

### PDR System Metrics (Apply to BMAD)
- **Time Reduction**: 75% reduction in project planning time
- **Quality**: 90%+ client approval on first draft
- **Completeness**: 100% of required sections included
- **Automation**: <10% human intervention needed

## 🚀 **Key Files for BMAD Context**

### Core PDR Components to Reference
1. **PDR-cookbook/SISO-AGENCY-PLATFORM-PDR.md**: Complete business context
2. **PDR-cookbook/SYSTEM-OVERVIEW.md**: Architecture understanding
3. **PDR-cookbook/steps/**: 75-step methodology reference
4. **src/data/enhanced-pdr-descriptions.ts**: Step details and timing
5. **src/components/client/roadmap/**: Live client portal components

### Templates Available for BMAD
- Market research schemas
- Competitor analysis templates
- Feature planning roadmaps
- Technical architecture templates
- Database schema templates
- API integration blueprints

## 🎯 **BMAD Story Creation Context**

### When Creating Stories, BMAD Should Know:
- **Client Portal Focus**: Every feature serves client visibility and satisfaction
- **AI Agent Transparency**: Clients must see AI agents working in real-time
- **Partner Commission**: All revenue features must support 20%/10% commission structure
- **Template Creation**: Every client project becomes reusable template
- **75-Step Process**: All client workflows follow structured PDR methodology
- **Performance Standards**: Client portal must be 10x faster than traditional agencies

### Story Patterns to Apply:
- Real-time AI agent activity visualization
- Client onboarding with mood board capture
- Partner commission tracking and payouts
- Template library management for reuse
- Mobile-first PWA experience (clients expect app-like experience)
- Competitor analysis integration with project planning

## 🔒 **Security Context from PDR**
- **Client Data Isolation**: Multi-tenant architecture (client_id filtering)
- **Partner Commission Security**: Financial data protection
- **Template IP Protection**: Proprietary template library security
- **AI Agent Monitoring**: Secure agent activity logging
- **Client File Security**: Secure file upload/management for project assets

---

*This context enables BMAD agents to understand SISO's AI-powered agency business model and create stories that align with the PDR cookbook methodology for maximum client satisfaction and business success.*