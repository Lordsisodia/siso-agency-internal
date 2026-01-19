---
name: artifacts-builder
category: integration-connectivity/mcp-integrations
version: 1.0.0
description: Build complex Claude.ai HTML artifacts using React, Tailwind CSS, and shadcn/ui
author: blackbox5/mcp
verified: true
tags: [mcp, artifacts, react, ui, frontend]
---

# Artifacts Builder

<context>
Create interactive Claude.ai HTML artifacts with modern React patterns, Tailwind CSS styling, and shadcn/ui components.

This skill helps you build rich, interactive HTML artifacts that can be rendered directly in Claude.ai conversations.

**When to Use:**
- Building interactive demos and prototypes
- Creating data visualizations
- Developing UI mockups
- Making reusable tool interfaces
</context>

<instructions>
When building artifacts, Claude will structure the HTML correctly with React 18, Tailwind CSS, and Babel for in-browser JSX transformation.

Always use `className` instead of `class`, follow React hooks patterns, and handle edge cases gracefully.
</instructions>

<workflow>
  <phase name="Artifact Structure">
    <goal>Set up proper HTML artifact foundation</goal>
    <steps>
      <step>Create HTML5 boilerplate with proper meta tags</step>
      <step>Include React 18, ReactDOM, and Babel CDNs</step>
      <step>Add Tailwind CSS CDN</step>
      <step>Create root div and script with type="text/babel"</step>
    </steps>
  </phase>

  <phase name="Component Development">
    <goal>Build interactive React components</goal>
    <steps>
      <step>Define component with function syntax</step>
      <step>Use React hooks (useState, useEffect) for state</step>
      <step>Implement proper event handlers</step>
      <step>Add Tailwind classes for styling</step>
    </steps>
  </phase>

  <phase name="Styling & Layout">
    <goal>Apply modern styling with Tailwind CSS</goal>
    <steps>
      <step>Use utility classes for layout</step>
      <step>Apply responsive variants (md:, lg:)</step>
      <step>Add state variants (hover:, focus:)</step>
      <step>Consider dark mode (dark:)</step>
    </steps>
  </phase>

  <phase name="Integration">
    <goal>Render and test the artifact</goal>
    <steps>
      <step>Mount component with ReactDOM.createRoot</step>
      <step>Verify interactivity works</step>
      <step>Test responsive behavior</step>
      <step>Validate data flow</step>
    </steps>
  </phase>
</workflow>

<available_skills>
  <skill_group name="Basic Patterns">
    <skill name="create_basic_artifact">
      <purpose>Create a basic HTML artifact template</purpose>
      <usage>Create an artifact that shows hello world</usage>
    </skill>
    <skill name="use_react_hooks">
      <purpose>Use useState and useEffect for interactivity</purpose>
      <usage>Add state management to the component</usage>
    </skill>
    <skill name="apply_tailwind_styling">
      <purpose>Apply Tailwind CSS utility classes</purpose>
      <usage>Style the component with modern design</usage>
    </skill>
  </skill_group>

  <skill_group name="Interactive Components">
    <skill name="data_table">
      <purpose>Create sortable data table with filtering</purpose>
      <usage>Make a table showing user data with sorting</usage>
    </skill>
    <skill name="chart_visualization">
      <purpose>Create bar charts and visualizations</purpose>
      <usage>Build a bar chart for sales data</usage>
    </skill>
    <skill name="validated_form">
      <purpose>Create form with validation and error handling</purpose>
      <usage>Make a contact form with validation</usage>
    </skill>
  </skill_group>

  <skill_group name="Advanced Features">
    <skill name="data_fetching">
      <purpose>Fetch and display data from APIs</purpose>
      <usage>Show data from an external API</usage>
    </skill>
    <skill name="animation">
      <purpose>Add CSS transitions and animations</purpose>
      <usage>Animate the list items when they appear</usage>
    </skill>
    <skill name="state_management">
      <purpose>Manage complex component state</purpose>
      <usage>Add useReducer for complex state logic</usage>
    </skill>
  </skill_group>
</available_skills>

<best_practices>
  <do>
    <item>Use className instead of class</item>
    <item>Follow React hooks rules</item>
    <item>Handle loading and error states</item>
    <item>Use responsive Tailwind classes</item>
    <item>Add proper accessibility attributes</item>
    <item>Test with sample data</item>
    <item>Include error boundaries</item>
  </do>
  <dont>
    <item>Use class instead of className</item>
    <item>Forget to close JSX tags</item>
    <item>Hardcode large datasets</item>
    <item>Ignore edge cases</item>
    <item>Skip validation</item>
  </dont>
</best_practices>

<rules>
  <rule priority="high">Always use className not class for React</rule>
  <rule priority="high">Include proper React 18 CDN links</rule>
  <rule priority="medium">Use Tailwind utility classes for styling</rule>
  <rule priority="medium">Handle errors gracefully</rule>
  <rule priority="low">Add dark mode support when appropriate</rule>
</rules>

<error_handling>
  <error>
    <condition>Component not rendering</condition>
    <solution>
      <step>Verify ReactDOM.createRoot is called</step>
      <step>Check script type is "text/babel"</step>
      <step>Ensure all CDNs are loaded</step>
    </solution>
  </error>
  <error>
    <condition>Styles not applying</condition>
    <solution>
      <step>Check using className not class</step>
      <step>Verify Tailwind CDN is included</step>
      <step>Check for typos in class names</step>
    </solution>
  </error>
  <error>
    <condition>Interactivity not working</condition>
    <solution>
      <step>Verify event handlers are properly defined</step>
      <step>Check state updates with useState</step>
      <step>Ensure component re-renders on state change</step>
    </solution>
  </error>
</error_handling>

<integration_notes>
  <tailwind_tips>
    <tip>Use responsive: md:text-lg lg:text-xl</tip>
    <tip>Use states: hover:bg-blue-600 focus:ring-2</tip>
    <tip>Use dark mode: dark:bg-gray-800 dark:text-white</tip>
  </tailwind_tips>
</integration_notes>

<examples>
  <example>
    <scenario>Interactive Data Table</scenario>
    <description>Create sortable data table with filtering</description>
    <features>
      <feature>Sort by clicking column headers</feature>
      <feature>Filter data by search input</feature>
      <feature>Paginate large datasets</feature>
    </features>
  </example>
  <example>
    <scenario>Chart Visualization</scenario>
    <description>Bar chart showing data</description>
    <features>
      <feature>Animated bars</feature>
      <feature>Dynamic data rendering</feature>
      <feature>Responsive layout</feature>
    </features>
  </example>
  <example>
    <scenario>Form with Validation</scenario>
    <description>Contact form with real-time validation</description>
    <features>
      <feature>Email validation</feature>
      <feature>Required field checks</feature>
      <feature>Error message display</feature>
      <feature>Success feedback</feature>
    </features>
  </example>
</examples>
