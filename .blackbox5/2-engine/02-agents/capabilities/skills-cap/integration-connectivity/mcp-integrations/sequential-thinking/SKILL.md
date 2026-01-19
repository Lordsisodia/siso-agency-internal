---
name: sequential-thinking
category: integration-connectivity/mcp-integrations
version: 1.0.0
description: Complete guide to using Sequential Thinking MCP server with Claude Code
author: blackbox5/mcp
verified: true
tags: [mcp, sequential-thinking, reasoning, problem-solving]
---

# Sequential Thinking MCP Server Skills

<context>
Complete guide to using Sequential Thinking MCP server with Claude Code. The Sequential Thinking MCP server enhances Claude's reasoning capabilities by breaking down complex problems into step-by-step logical processes.

**Package:** `@modelcontextprotocol/server-sequential-thinking`
**Purpose:** Enhanced reasoning and problem decomposition

Sequential Thinking is a reasoning framework that breaks down complex problems into manageable steps, makes reasoning explicit and traceable, reduces errors through systematic analysis, improves decision-making through structured thought, and enhances problem-solving with methodical approaches.
</context>

<instructions>
When facing complex problems, architecture decisions, algorithm design, or debugging challenges, use Sequential Thinking to break down the problem systematically.

For simple tasks (file operations, basic lookups), Sequential Thinking is not needed. Use it for complex problem solving, root cause analysis, code review, and trade-off analysis.
</instructions>

<workflow>
  <phase name="Problem Understanding">
    <goal>Clearly define the problem to solve</goal>
    <steps>
      <step>State the problem clearly and explicitly</step>
      <step>Identify constraints and requirements</step>
      <step>Gather relevant context and information</step>
      <step>State any assumptions</step>
    </steps>
  </phase>

  <phase name="Problem Decomposition">
    <goal>Break down complex problem into manageable parts</goal>
    <steps>
      <step>Use `sequential_thinking_break_down` to decompose problem</step>
      <step>Identify dependencies between steps</step>
      <step>Estimate complexity of each component</step>
      <step>Identify potential risks</step>
    </steps>
  </phase>

  <phase name="Analysis & Reasoning">
    <goal>Apply logical reasoning to reach conclusions</goal>
    <steps>
      <step>Use `sequential_thinking_reason` for logical analysis</step>
      <step>Use `sequential_thinking_chain` for step-by-step thinking</step>
      <step>Consider multiple approaches</step>
      <step>Evaluate trade-offs</step>
    </steps>
  </phase>

  <phase name="Solution Design">
    <goal>Design and validate solution approach</goal>
    <steps>
      <step>Use `sequential_thinking_design_solution` to plan approach</step>
      <step>Use `sequential_thinking_decide` to evaluate options</step>
      <step>Use `sequential_thinking_assess_risk` to identify risks</step>
      <step>Validate reasoning and assumptions</step>
    </steps>
  </phase>

  <phase name="Verification">
    <goal>Verify solution is correct and complete</goal>
    <steps>
      <step>Test reasoning with edge cases</step>
      <step>Review for logical fallacies</step>
      <step>Consider alternative perspectives</step>
      <step>Document conclusion and rationale</step>
    </steps>
  </phase>
</workflow>

<available_skills>
  <skill_group name="Problem Decomposition">
    <skill name="sequential_thinking_break_down">
      <purpose>Break a complex problem into smaller steps</purpose>
      <usage>Break down the authentication flow</usage>
      <parameters>
        <param name="problem">Complex problem to solve</param>
        <param name="context">Relevant context and constraints</param>
      </parameters>
      <returns>Step-by-step breakdown, dependencies between steps, estimated complexity, potential risks</returns>
    </skill>
  </skill_group>

  <skill_group name="Logical Reasoning">
    <skill name="sequential_thinking_reason">
      <purpose>Apply logical reasoning to reach conclusions</purpose>
      <usage>Reason through this bug</usage>
      <parameters>
        <param name="premise">Starting facts or observations</param>
        <param name="question">What to reason about</param>
        <param name="constraints">Known constraints</param>
      </parameters>
      <returns>Logical steps, intermediate conclusions, final conclusion, confidence level</returns>
    </skill>
    <skill name="sequential_thinking_chain">
      <purpose>Create a chain of thought for a problem</purpose>
      <usage>Think through this feature request</usage>
      <parameters>
        <param name="input">Initial problem or question</param>
        <param name="depth">How deep to explore (default: thorough)</param>
      </parameters>
      <returns>Step-by-step reasoning, alternatives considered, trade-offs analyzed, recommended approach</returns>
    </skill>
  </skill_group>

  <skill_group name="Decision Making">
    <skill name="sequential_thinking_decide">
      <purpose>Make a decision by analyzing options</purpose>
      <usage>Decide between React and Vue</usage>
      <parameters>
        <param name="options">Array of options to consider</param>
        <param name="criteria">Evaluation criteria</param>
        <param name="weights">Importance of each criteria (optional)</param>
      </parameters>
      <returns>Ranked options, pros and cons of each, recommendation with reasoning, risk assessment</returns>
    </skill>
  </skill_group>

  <skill_group name="Analysis">
    <skill name="sequential_thinking_analyze_cause">
      <purpose>Analyze root causes of a problem</purpose>
      <usage>Find root cause of this bug</usage>
      <parameters>
        <param name="problem">Description of the problem</param>
        <param name="symptoms">Observable symptoms</param>
        <param name="context">System context</param>
      </parameters>
      <returns>Possible causes, most likely root cause, investigation steps, verification method</returns>
    </skill>
    <skill name="sequential_thinking_assess_risk">
      <purpose>Assess risks in a plan or approach</purpose>
      <usage>Assess risks in this deployment</usage>
      <parameters>
        <param name="plan">Plan or approach to assess</param>
        <param name="context">System or business context</param>
      </parameters>
      <returns>Identified risks, likelihood and impact, mitigation strategies, acceptance criteria</returns>
    </skill>
  </skill_group>

  <skill_group name="Solution Design">
    <skill name="sequential_thinking_design_solution">
      <purpose>Design a solution step by step</purpose>
      <usage>Design a solution for user authentication</usage>
      <parameters>
        <param name="requirements">What the solution must achieve</param>
        <param name="constraints">Technical or business constraints</param>
        <param name="considerations">Additional factors to consider</param>
      </parameters>
      <returns>Solution architecture, implementation steps, risks and mitigations, testing strategy</returns>
    </skill>
    <skill name="sequential_thinking_design_algorithm">
      <purpose>Design or analyze an algorithm</purpose>
      <usage>Design a sorting algorithm</usage>
      <parameters>
        <param name="problem">Algorithmic problem to solve</param>
        <param name="requirements">Performance or functional requirements</param>
        <param name="constraints">Space or time constraints</param>
      </parameters>
      <returns>Algorithm steps, time complexity, space complexity, optimization opportunities</returns>
    </skill>
  </skill_group>

  <skill_group name="Code Analysis">
    <skill name="sequential_thinking_review_code">
      <purpose>Review code with systematic analysis</purpose>
      <usage>Review this function for bugs</usage>
      <parameters>
        <param name="code">Code to review</param>
        <param name="focus">Specific focus area (security, performance, bugs)</param>
      </parameters>
      <returns>Issues found, severity levels, fix suggestions, best practice violations</returns>
    </skill>
    <skill name="sequential_thinking_debug">
      <purpose>Debug issues systematically</purpose>
      <usage>Debug this error step by step</usage>
      <parameters>
        <param name="error">Error message or unexpected behavior</param>
        <param name="code">Relevant code</param>
        <param name="context">Runtime context</param>
      </parameters>
      <returns>Possible causes, investigation steps, likely fix, prevention strategies</returns>
    </skill>
  </skill_group>
</available_skills>

<rules>
  <rule>
    <condition>When using Sequential Thinking</condition>
    <action>Be explicit about assumptions and show reasoning steps</action>
  </rule>
  <rule>
    <condition>For complex problems</condition>
    <action>Break down into smaller, manageable components</action>
  </rule>
  <rule>
    <condition>When making decisions</condition>
    <action>Consider multiple alternatives and evaluate trade-offs</action>
  </rule>
  <rule>
    <condition>After reaching conclusion</condition>
    <action>Validate reasoning and check for logical fallacies</action>
  </rule>
</rules>

<best_practices>
  <practice category="Reasoning">
    <do>Break complex problems into steps</do>
    <do>Make reasoning explicit</do>
    <do>Consider multiple approaches</do>
    <do>Validate assumptions</do>
    <do>Document thought process</do>
    <do>Learn from mistakes</do>
    <dont>Jump to conclusions</dont>
    <dont>Skip steps</dont>
    <dont>Ignore alternatives</dont>
    <dont>Overlook edge cases</dont>
    <dont>Forget to verify</dont>
    <dont>Make unwarranted assumptions</dont>
  </practice>
  <practice category="Usage">
    <do>Use for complex problem solving</do>
    <do>Use for architecture decisions</do>
    <do>Use for algorithm design</do>
    <do>Use for root cause analysis</do>
    <do>Use for code review</do>
    <dont>Use for simple file operations</dont>
    <dont>Use for straightforward code changes</dont>
    <dont>Use for information lookup</dont>
    <dont>Use for basic questions</dont>
  </practice>
</best_practices>

<examples>
  <example scenario="Debugging">
    <input>Why is authentication failing?</input>
    <workflow>
      <step>Analyze symptoms: 401 errors, tokens appear valid</step>
      <step>Consider possible causes: Token expired? Wrong secret? Format issue?</step>
      <step>Test hypotheses: Check token decoding (valid), verify secret key (mismatch)</step>
      <step>Conclusion: Secret key mismatch in environment config</step>
      <step>Fix: Update SUPABASE_ANON_KEY in .env</step>
    </workflow>
  </example>

  <example scenario="Algorithm Design">
    <input>Design function to find duplicates</input>
    <workflow>
      <step>Understand requirements: Input array, output duplicates, O(n) preferred</step>
      <step>Consider approaches: Nested loops O(n²), Sorting O(n log n), Hash set O(n)</step>
      <step>Select approach: Use hash set for O(n) time</step>
      <step>Design algorithm with seen and duplicates sets</step>
      <step>Analyze complexity: O(n) time, O(n) space</step>
    </workflow>
  </example>

  <example scenario="Decision Making">
    <input>Should we use TypeScript or JavaScript?</input>
    <workflow>
      <step>Define criteria: Type safety (9), Team experience (7), Speed (6), Ecosystem (8)</step>
      <step>Evaluate TypeScript: Excellent type safety, moderate experience, slower initially, excellent ecosystem</step>
      <step>Evaluate JavaScript: Requires extra tools for types, excellent experience, faster initially, excellent ecosystem</step>
      <step>Compare scores: TypeScript 8.5/10, JavaScript 6.5/10</step>
      <step>Recommend TypeScript for type safety and maintainability</step>
      <step>Mitigate risks: Provide training, use JSDoc migration path</step>
    </workflow>
  </example>
</examples>

<error_handling>
  <error>
    <condition>Reasoning seems off</condition>
    <solution>
      <step>State assumptions clearly</step>
      <step>Verify each step</step>
      <step>Check for logical fallacies</step>
      <step>Consider alternative perspectives</step>
    </solution>
  </error>
  <error>
    <condition>Stuck on problem</condition>
    <solution>
      <step>Break it down further</step>
      <step>Try different approach</step>
      <step>Gather more information</step>
      <step>Take a step back</step>
    </solution>
  </error>
  <error>
    <condition>Too many options</condition>
    <solution>
      <step>Define evaluation criteria</step>
      <step>Rank by importance</step>
      <step>Eliminate clearly bad options</step>
      <step>Compare remaining options</step>
    </solution>
  </error>
</error_handling>

<output_format>
  <format>
    <type>Problem Breakdown</type>
    <structure>Hierarchical list of steps with dependencies and complexity estimates</structure>
  </format>
  <format>
    <type>Logical Reasoning</type>
    <structure>Chain of reasoning steps from premise to conclusion with confidence level</structure>
  </format>
  <format>
    <type>Decision Analysis</type>
    <structure>Ranked options with pros/cons, scores, and recommendation</structure>
  </format>
  <format>
    <type>Solution Design</type>
    <structure>Architecture overview with implementation steps and risk assessment</structure>
  </format>
</output_format>

<integration_notes>
  <note category="When to Use">
    <content>Use Sequential Thinking for: Complex problem solving, architecture decisions, algorithm design, root cause analysis, code review, debugging complex issues, risk assessment, trade-off analysis. Quick tasks may not need it: Simple file operations, straightforward code changes, information lookup, basic questions.</content>
  </note>
  <note category="Reasoning Patterns">
    <content>Deductive: General rules → Specific case → Conclusion. Inductive: Specific cases → Patterns → General rule. Abductive: Outcome → Hypotheses → Most likely explanation. Design Thinking: Empathize → Define → Ideate → Prototype → Test.</content>
  </note>
</integration_notes>
