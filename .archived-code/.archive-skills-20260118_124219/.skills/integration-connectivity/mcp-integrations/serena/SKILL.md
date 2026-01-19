---
name: serena
category: integration-connectivity/mcp-integrations
version: 1.0.0
description: Complete guide to using Serena MCP server for AI-powered code analysis with Claude Code
author: blackbox5/mcp
verified: true
tags: [mcp, serena, code-analysis, review, security]
---

# Serena MCP Server Skills

<context>
**Serena** is an AI-powered development assistance tool that provides intelligent code analysis, review, and optimization capabilities through MCP.

**Type:** STDIO (local)
**Command:** `npx` with Serena package

**Capabilities:**
- Code Quality Analysis - Identifies potential issues and bugs
- Performance Optimization - Suggests performance improvements
- Security Scanning - Detects security vulnerabilities
- Best Practices - Enforces coding standards
- Refactoring Suggestions - Recommends code improvements
- Documentation Generation - Auto-generates code documentation
</context>

<instructions>
When using Serena for code analysis, be specific about what you want to review. Claude will use Serena's tools to analyze your code and provide actionable feedback.

Provide context about the code being analyzed and specify focus areas (security, performance, bugs, etc.) for better results.
</instructions>

<workflow>
  <phase name="Code Analysis">
    <goal>Understand code quality and identify issues</goal>
    <steps>
      <step>Use `serena_analyze_code` to scan for bugs and issues</step>
      <step>Use `serena_explain_code` to understand functionality</step>
      <step>Review identified issues and their severity</step>
    </steps>
  </phase>

  <phase name="Code Review">
    <goal>Perform comprehensive code review</goal>
    <steps>
      <step>Use `serena_review_code` for full review</step>
      <step>Focus on security with `serena_scan_security`</step>
      <step>Check for secrets with `serena_check_secrets`</step>
      <step>Apply suggested improvements</step>
    </steps>
  </phase>

  <phase name="Optimization">
    <goal>Improve code performance and structure</goal>
    <steps>
      <step>Use `serena_optimize_performance` to find bottlenecks</step>
      <step>Use `serena_refactor_code` for structural improvements</step>
      <step>Generate tests with `serena_generate_tests`</step>
      <step>Generate documentation with `serena_generate_docs`</step>
    </steps>
  </phase>

  <phase name="Debugging">
    <goal>Resolve errors and understand issues</goal>
    <steps>
      <step>Use `serena_explain_error` to understand errors</step>
      <step>Use `serena_suggest_improvements` for general feedback</step>
      <step>Apply fixes and verify</step>
    </steps>
  </phase>
</workflow>

<available_skills>
  <skill_group name="Code Analysis">
    <skill name="serena_analyze_code">
      <purpose>Analyze code for quality, bugs, and improvements</purpose>
      <usage>Analyze src/components/Header.tsx for bugs</usage>
      <parameters>
        <param name="file_path">Path to file to analyze</param>
        <param name="focus">Specific focus area (security, performance, bugs, etc.)</param>
      </parameters>
      <returns>Identified issues, severity levels, suggestions for fixes, best practice violations</returns>
    </skill>
    <skill name="serena_explain_code">
      <purpose>Get detailed explanation of code functionality</purpose>
      <usage>Explain how this function works</usage>
      <returns>Code breakdown, algorithm explanation, data flow analysis, dependency mapping</returns>
    </skill>
    <skill name="serena_review_code">
      <purpose>Perform comprehensive code review</purpose>
      <usage>Review changes in src/lib/auth.ts</usage>
      <parameters>
        <param name="file_path">Path to review</param>
        <param name="diff">Only review changed lines (for PRs)</param>
      </parameters>
      <returns>Code quality assessment, security concerns, performance issues, style guide violations, improvement suggestions</returns>
    </skill>
  </skill_group>

  <skill_group name="Code Optimization">
    <skill name="serena_optimize_performance">
      <purpose>Analyze and optimize code performance</purpose>
      <usage>Find performance bottlenecks in my code</usage>
      <returns>Performance bottlenecks, optimization opportunities, caching suggestions, algorithm improvements</returns>
    </skill>
    <skill name="serena_refactor_code">
      <purpose>Suggest refactoring improvements</purpose>
      <usage>Refactor this component to be more maintainable</usage>
      <returns>Structural improvements, design pattern suggestions, code organization tips, simplification opportunities</returns>
    </skill>
  </skill_group>

  <skill_group name="Security Analysis">
    <skill name="serena_scan_security">
      <purpose>Scan code for security vulnerabilities</purpose>
      <usage>Scan for security issues</usage>
      <returns>Security vulnerabilities, common attack vectors, OWASP top 10 issues, remediation steps</returns>
    </skill>
    <skill name="serena_check_secrets">
      <purpose>Detect exposed secrets and credentials</purpose>
      <usage>Check for exposed API keys</usage>
      <returns>Found secrets/credentials, location in code, severity level, recommendations</returns>
    </skill>
  </skill_group>

  <skill_group name="Documentation">
    <skill name="serena_generate_docs">
      <purpose>Generate code documentation</purpose>
      <usage>Generate documentation for this function</usage>
      <returns>Function documentation, parameter descriptions, return value docs, usage examples</returns>
    </skill>
    <skill name="serena_explain_error">
      <purpose>Explain error messages and suggest fixes</purpose>
      <usage>Explain this TypeScript error</usage>
      <parameters>
        <param name="error">Error message or code</param>
        <param name="context">Surrounding code</param>
      </parameters>
      <returns>Error explanation, root cause analysis, fix suggestions, prevention tips</returns>
    </skill>
  </skill_group>

  <skill_group name="Code Generation">
    <skill name="serena_generate_tests">
      <purpose>Generate unit tests for code</purpose>
      <usage>Create test cases for my component</usage>
      <returns>Test file content, test cases, mock setup, assertions</returns>
    </skill>
    <skill name="serena_suggest_improvements">
      <purpose>Get general improvement suggestions</purpose>
      <usage>Suggest modern JavaScript alternatives</usage>
      <returns>Modern language features, library alternatives, pattern improvements, best practice recommendations</returns>
    </skill>
  </skill_group>
</available_skills>

<best_practices>
  <do>
    <item>Run Serena before committing</item>
    <item>Address high-severity issues</item>
    <item>Consider all suggestions</item>
    <item>Ask for clarification</item>
    <item>Use for learning</item>
    <item>Be specific with requests</item>
    <item>Provide relevant code context</item>
    <item>Ask for explanations</item>
    <item>Iterate and re-review</item>
  </do>
  <dont>
    <item>Ignore security warnings</item>
    <item>Blindly accept all changes</item>
    <item>Forget to test suggestions</item>
    <item>Skip code review</item>
    <item>Rely solely on automation</item>
    <item>Use vague requests</item>
  </dont>
</best_practices>

<rules>
  <rule priority="high">Never ignore security warnings from Serena</rule>
  <rule priority="high">Always test suggestions before applying</rule>
  <rule priority="medium">Run Serena on code changes before committing</rule>
  <rule priority="medium">Use specific focus areas for better analysis</rule>
  <rule priority="low">Use Serena as a learning tool</rule>
</rules>

<error_handling>
  <error>
    <condition>Serena not responding</condition>
    <solution>
      <step>Check if MCP server is running</step>
      <step>Verify Serena package is installed</step>
      <step>Restart Claude instance</step>
    </solution>
  </error>
  <error>
    <condition>Generic suggestions</condition>
    <solution>
      <step>Provide more context</step>
      <step>Specify focus area</step>
      <step>Ask for specific issues</step>
    </solution>
  </error>
  <error>
    <condition>Performance slow</condition>
    <solution>
      <step>Analyze smaller code chunks</step>
      <step>Focus on specific files</step>
      <step>Use targeted analysis</step>
    </solution>
  </error>
</error_handling>

<integration_notes>
  <comparison>
    <tools>
      <tool name="Serena">
        <feature>Code Analysis</feature>
        <feature>Security Scanning</feature>
        <feature>Performance Optimization</feature>
      </tool>
      <tool name="Playwright">
        <feature>Testing</feature>
        <feature>Performance</feature>
      </tool>
      <tool name="Chrome DevTools">
        <feature>Browser DevTools</feature>
        <feature>Performance</feature>
      </tool>
    </tools>
    <tip>Use Serena for code analysis, Playwright for testing, Chrome DevTools for browser debugging</tip>
  </comparison>
</integration_notes>

<examples>
  <example>
    <scenario>Security Review</scenario>
    <command>Scan my authentication code for security issues</command>
    <response>
      <result>Found 2 potential security issues:</result>
      <issue>1. Hardcoded API key in auth.ts (line 45)</issue>
      <issue>2. Missing input validation on login form</issue>
      <recommendations>
        <rec>Move API key to environment variables</rec>
        <rec>Add Zod validation for user input</rec>
      </recommendations>
    </response>
  </example>
  <example>
    <scenario>Performance Optimization</scenario>
    <command>Optimize this React component</command>
    <response>
      <result>Performance issues found:</result>
      <issue>1. Unnecessary re-renders (useMemo needed)</issue>
      <issue>2. Large bundle size (code splitting recommended)</issue>
      <issue>3. Missing key prop (causes reconciliation issues)</issue>
      <fixes>
        <fix>Added useMemo for expensive calculations</fix>
        <fix>Implemented lazy loading for images</fix>
        <fix>Fixed key prop in list rendering</fix>
      </fixes>
    </response>
  </example>
  <example>
    <scenario>Code Explanation</scenario>
    <command>Explain how the Supabase query works</command>
    <response>
      <result>This function performs the following:</result>
      <step>1. Connects to Supabase using client</step>
      <step>2. Executes a SELECT query with filter</step>
      <step>3. Orders results by created_at DESC</step>
      <step>4. Limits to 10 records</step>
      <step>5. Returns typed results</step>
      <flow>Data flow: Component → Hook → Supabase → Data → Component</flow>
    </response>
  </example>
</examples>

<integration_notes>
  <integration>
    <platform>Lumelle</platform>
    <capabilities>
      <capability>Review React components for best practices</capability>
      <capability>Optimize component performance</capability>
      <capability>Check for security issues in auth code</capability>
      <capability>Review Supabase queries</capability>
      <capability>Optimize database access</capability>
      <capability>Check for SQL injection risks</capability>
      <capability>Review API endpoints</capability>
      <capability>Check error handling</capability>
      <capability>Optimize response time</capability>
    </capabilities>
  </integration>
</integration_notes>

<advanced_usage>
  <feature>Custom Rules</feature>
  <description>Serena can be configured with custom rules for your project</description>
  <capabilities>
    <capability>Enforce Lumelle coding standards</capability>
    <capability>Check for specific patterns</capability>
    <capability>Custom security rules</capability>
  </capabilities>
  <feature>CI/CD Integration</feature>
  <description>Run Serena in GitHub Actions</description>
  <capabilities>
    <capability>Block merge on critical issues</capability>
    <capability>Generate reports</capability>
  </capabilities>
  <feature>Team Collaboration</feature>
  <description>Share Serena reviews</description>
  <capabilities>
    <capability>Comment on suggestions</capability>
    <capability>Track issue resolution</capability>
  </capabilities>
</advanced_usage>
