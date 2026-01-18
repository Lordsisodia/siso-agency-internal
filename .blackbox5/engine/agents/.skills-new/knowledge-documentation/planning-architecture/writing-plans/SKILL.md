---
name: writing-plans
category: knowledge-documentation/planning-architecture
version: 1.0.0
description: Create detailed implementation strategies and architecture documentation
author: obra/superpowers
verified: true
tags: [planning, architecture, documentation, strategy]
---

# Writing Plans

<context>
Create detailed, actionable implementation plans that break down complex features into clear steps with proper architecture consideration.

Good plans prevent miscommunication, identify risks early, and ensure everyone understands what they're building and why.
</context>

<instructions>
When creating implementation plans, include all essential sections: executive summary, technical approach, implementation steps, testing strategy, and risk assessment.

Make steps atomic (small and focused), include definition of done for each step, and plan for iteration rather than attempting everything at once.
</instructions>

<workflow>
  <phase name="Executive Summary">
    <goal>Provide clear overview of what and why</goal>
    <steps>
      <step>Write 2-3 sentence overview explaining what we're building and why</step>
      <step>Define primary goal (what success looks like)</step>
      <step>List secondary goals (additional benefits)</step>
      <step>Explicitly state non-goals (what's out of scope)</step>
      <step>Define success metrics (performance, quality, timeline)</step>
    </steps>
  </phase>

  <phase name="Technical Approach">
    <goal>Define architecture and design decisions</goal>
    <steps>
      <step>Describe high-level architecture</step>
      <step>List components and their responsibilities</step>
      <step>Map data flow through the system</step>
      <step>Document alternatives considered with pros/cons</step>
      <step>State chosen approach with rationale</step>
    </steps>
  </phase>

  <phase name="Implementation Steps">
    <goal>Break down into atomic, executable phases</goal>
    <steps>
      <step>Phase 1: Foundation - Core infrastructure and setup</step>
      <step>Phase 2: Core Features - Main functionality</step>
      <step>Phase 3: Integration & Polish - Complete and refine</step>
      <step>For each phase: list specific tasks with [ ] checkboxes</step>
      <step>Include dependencies and deliverables for each phase</step>
    </steps>
    <step_format>
      <bad_example>Build the payment system</bad_example>
      <good_example>Create Stripe checkout form</good_example>
    </step_format>
  </phase>

  <phase name="Testing Strategy">
    <goal>Plan comprehensive testing approach</goal>
    <steps>
      <step>Define unit test coverage (core business logic, edge cases)</step>
      <step>Define integration tests (APIs, databases, external services)</step>
      <step>Define manual testing scenarios (user flows, performance)</step>
      <step>Set test coverage goal (recommend >80%)</step>
    </steps>
  </phase>

  <phase name="Risk Assessment">
    <goal>Identify and mitigate potential issues</goal>
    <steps>
      <step>Identify technical risks with impact and probability</step>
      <step>Define mitigation strategies for each risk</step>
      <step>List dependencies (external approvals, resources)</step>
      <step>Create rollback plan for if things go wrong</step>
    </steps>
  </phase>

  <phase name="Iteration Planning">
    <goal>Plan incremental delivery</goal>
    <steps>
      <step>Define MVP scope (core functionality, happy path only)</step>
      <step>Define Iteration 2 (enhanced error handling, edge cases)</step>
      <step>Define Iteration 3 (advanced features, polish)</step>
    </steps>
  </phase>
</workflow>

<rules>
  <rule>Make steps atomic - small, focused, and completable</rule>
  <rule>Include definition of done for each step</rule>
  <rule>Always consider edge cases upfront</rule>
  <rule>Plan for iteration, not one big release</rule>
  <rule>Include rollback plan for major changes</rule>
  <rule>Document alternatives considered with rationale</rule>
</rules>

<best_practices>
  <practice>Break down complex tasks until each step takes hours, not days</practice>
  <practice>Include specific acceptance criteria for each step</practice>
  <practice>Think about error cases, not just happy path</practice>
  <practice>Consider performance, security, and maintainability</practice>
  <practice>Buffer time for unknown unknowns</practice>
  <practice>Plan tests alongside implementation, not after</practice>
</best_practices>

<anti_patterns>
  <pattern>Skip the "why" - context matters</pattern>
  <pattern>No alternative analysis - first idea isn't always best</pattern>
  <pattern>Unrealistic timelines - buffer time for the unknown</pattern>
  <pattern>Ignore risks - what could go wrong?</pattern>
  <pattern>Testing as afterthought - plan tests upfront</pattern>
  <pattern>No rollback plan - assume you'll need it</pattern>
</anti_patterns>

<examples>
  <example>
    <scenario>Building a payment feature</scenario>
    <plan_structure>
      <section>Executive Summary</section>
      <content>
        - Overview: Add Stripe checkout for one-time payments
        - Goals: Enable users to purchase premium features
        - Non-goals: Recurring subscriptions, refunds
        - Metrics: 95% successful checkout rate
      </content>

      <section>Technical Approach</section>
      <content>
        - Architecture: Frontend Stripe Elements + Backend webhook handler
        - Components: Checkout form, payment service, webhook handler
        - Data Flow: User → Stripe → Webhook → App → Database
        - Alternatives: PayPal (higher fees), Stripe Checkout (less customizable)
        - Decision: Stripe Elements for maximum control
      </content>

      <section>Implementation Steps</section>
      <content>
        Phase 1: Foundation (Days 1-2)
        - [ ] Set up Stripe account and test keys
        - [ ] Create payment service base class
        - [ ] Set up webhook endpoint
        - Deliverable: Bare-bones payment infrastructure

        Phase 2: Core Features (Days 3-5)
        - [ ] Build checkout form with Stripe Elements
        - [ ] Implement payment intent creation
        - [ ] Handle webhook events (success, failure)
        - [ ] Update database with payment status
        - Deliverable: Working checkout flow

        Phase 3: Integration & Polish (Days 6-7)
        - [ ] Add error handling and user feedback
        - [ ] Implement idempotency for webhooks
        - [ ] Add logging and monitoring
        - [ ] Security review and testing
        - Deliverable: Production-ready payment feature
      </content>
    </plan_structure>
  </example>
</examples>

<integration_notes>
When planning with Claude, use phrases like:
- "Help me create a plan for [feature]"
- "Break down this implementation into steps"
- "What are the risks with this approach?"
- "Create an architecture doc for [system]"

Claude will:
- Structure comprehensive plans
- Identify potential issues
- Suggest alternatives
- Break down complex tasks
- Ensure nothing is forgotten
- Create clear, actionable steps
</integration_notes>

<output_format>
Required sections:
1. Executive Summary (overview, goals, metrics)
2. Technical Approach (architecture, components, alternatives)
3. Implementation Steps (phased, with checkboxes)
4. Testing Strategy (unit, integration, manual)
5. Risk Assessment (risks, mitigations, rollback)

Optional sections:
6. Iteration Planning (MVP, future iterations)
7. Edge Cases to Handle
8. Success Criteria Definition
</output_format>

<related_skills>
  <skill>systematic-debugging</skill>
  <skill>test-driven-development</skill>
  <skill>deep-research</skill>
</related_skills>
