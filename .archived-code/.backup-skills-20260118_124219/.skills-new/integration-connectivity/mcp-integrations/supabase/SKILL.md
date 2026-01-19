---
name: supabase
category: integration-connectivity/mcp-integrations
version: 1.0.0
description: Complete guide to using Supabase MCP servers with Claude Code
author: blackbox5/mcp
verified: true
tags: [mcp, supabase, database, storage]
---

# Supabase MCP Server Skills

<context>
Complete guide to using Supabase MCP servers with Claude Code. You have **two Supabase instances** configured:

1. **SISO Internal Supabase** (Global) - `avdgyrepwrvsvwgxrccr`
2. **Lumelle Supabase** (Project) - `tmsbyiwqzesmirbargxv`

Claude automatically detects which Supabase to use based on the current project directory.
</context>

<instructions>
When working with Supabase databases through Claude Code, use natural language commands. Claude will convert your requests into the appropriate Supabase API calls.

Always start with exploration (list tables, describe schema) before making changes. Use transactions for complex operations.
</instructions>

<workflow>
  <phase name="Database Exploration">
    <goal>Understand database structure before querying</goal>
    <steps>
      <step>Use `supabase_list_tables` to see all available tables</step>
      <step>Use `supabase_describe_table` to understand table schema</step>
      <step>Use `supabase_get_relationships` to see foreign key relationships</step>
      <step>Review sample data with `supabase_select` with limit</step>
    </steps>
  </phase>

  <phase name="Query Data">
    <goal>Retrieve data from database</goal>
    <steps>
      <step>Use `supabase_select` for simple queries with filters</step>
      <step>Use `supabase_query` for complex SQL queries</step>
      <step>Always review results before making changes</step>
    </steps>
  </phase>

  <phase name="Modify Data">
    <goal>Insert, update, or delete data</goal>
    <steps>
      <step>Use `supabase_insert` to add new rows</step>
      <step>Use `supabase_update` to modify existing rows</step>
      <step>Use `supabase_delete` to remove rows (always use WHERE clause)</step>
      <step>Verify changes with follow-up queries</step>
    </steps>
  </phase>

  <phase name="Real-time Operations">
    <goal>Subscribe to database changes</goal>
    <steps>
      <step>Use `supabase_subscribe` to watch table changes</step>
      <step>Specify filters to limit notifications</step>
      <step>Handle real-time events appropriately</step>
    </steps>
  </phase>
</workflow>

<available_skills>
  <skill_group name="Database Query">
    <skill name="supabase_query">
      <purpose>Execute raw SQL queries</purpose>
      <usage>Query the users table for all active users</usage>
      <parameters>
        <param name="query">The SQL query to execute</param>
      </parameters>
    </skill>
    <skill name="supabase_select">
      <purpose>Select rows with filtering</purpose>
      <usage>Get all products where price > 100</usage>
      <parameters>
        <param name="table">Table name</param>
        <param name="filter">Filter conditions (optional)</param>
        <param name="columns">Specific columns (optional)</param>
        <param name="order">Order by column (optional)</param>
        <param name="limit">Maximum rows (optional)</param>
      </parameters>
    </skill>
    <skill name="supabase_insert">
      <purpose>Insert new rows</purpose>
      <usage>Insert a new user with email john@example.com</usage>
      <parameters>
        <param name="table">Table name</param>
        <param name="data">Object with column names and values</param>
      </parameters>
    </skill>
    <skill name="supabase_update">
      <purpose>Update existing rows</purpose>
      <usage>Update user john@example.com to set status to inactive</usage>
      <parameters>
        <param name="table">Table name</param>
        <param name="data">Columns to update</param>
        <param name="filter">Filter condition</param>
      </parameters>
    </skill>
    <skill name="supabase_delete">
      <purpose>Delete rows from table</purpose>
      <usage>Delete all users where status is 'deleted'</usage>
      <parameters>
        <param name="table">Table name</param>
        <param name="filter">Filter condition</param>
      </parameters>
    </skill>
  </skill_group>

  <skill_group name="Schema Management">
    <skill name="supabase_list_tables">
      <purpose>List all tables in database</purpose>
      <usage>Show me all tables in the database</usage>
    </skill>
    <skill name="supabase_describe_table">
      <purpose>Get table schema</purpose>
      <usage>Describe the users table</usage>
      <returns>Column names, data types, constraints, indexes</returns>
    </skill>
    <skill name="supabase_get_relationships">
      <purpose>Get foreign key relationships</purpose>
      <usage>Show relationships for the orders table</usage>
    </skill>
  </skill_group>

  <skill_group name="Advanced Operations">
    <skill name="supabase_execute_rpc">
      <purpose>Call PostgreSQL function</purpose>
      <usage>Execute the function get_user_stats with user ID 123</usage>
    </skill>
    <skill name="supabase_subscribe">
      <purpose>Subscribe to real-time changes</purpose>
      <usage>Subscribe to changes in the notifications table</usage>
    </skill>
    <skill name="supabase_upload_file">
      <purpose>Upload file to Supabase Storage</purpose>
      <usage>Upload image.png to the avatars bucket</usage>
    </skill>
    <skill name="supabase_download_file">
      <purpose>Download file from Supabase Storage</purpose>
      <usage>Download avatar.jpg from the avatars bucket</usage>
    </skill>
  </skill_group>
</available_skills>

<rules>
  <rule>Start with exploration - list tables, then describe them</rule>
  <rule>Always verify before modifying data</rule>
  <rule>Never run DELETE without a WHERE clause</rule>
  <rule>Use filters to limit data retrieval</rule>
  <rule>Ask Claude to explain complex queries before running</rule>
</rules>

<best_practices>
  <practice>Use natural language - Claude converts to SQL</practice>
  <practice>Start with supabase_list_tables to understand structure</practice>
  <practice>Use descriptive column names in queries</practice>
  <practice>Ask for explanations of complex queries</practice>
  <rule>Use transactions for complex operations</rule>
</best_practices>

<anti_patterns>
  <pattern>Run DELETE without WHERE clause</pattern>
  <pattern>Modify schema directly in production</pattern>
  <pattern>Insert duplicate primary keys</pattern>
  <pattern>Forget to back up important data</pattern>
</anti_patterns>

<examples>
  <example>
    <scenario>Database exploration workflow</scenario>
    <process>
      <step>Show me all tables</step>
      <step>Describe the users table</step>
      <step>Get the first 10 users</step>
      <step>Count users by status</step>
    </process>
  </example>

  <example>
    <scenario>Data modification workflow</scenario>
    <process>
      <step>Insert a new order with these details: ...</step>
      <step>Update order 123 to set status to 'completed'</step>
      <step>Delete cancelled orders older than 30 days</step>
    </process>
  </example>
</examples>

<multi_database_usage>
  <automatic_detection>
    <scenario>Working in Lumelle project</scenario>
    <behavior>Uses Lumelle Supabase (tmsbyiwqzesmirbargxv)</behavior>
    <example>Get all products from Lumelle database</example>
  </automatic_detection>
  <automatic_detection>
    <scenario>Working in any other project</scenario>
    <behavior>Uses SISO Internal Supabase (avdgyrepwrvsvwgxrccr)</behavior>
    <example>Get all internal users from SISO database</example>
  </automatic_detection>
  <explicit_selection>
    <scenario>Need to specify database explicitly</scenario>
    <examples>
      In the SISO database, get all users
      In the Lumelle database, get all orders
    </examples>
  </explicit_selection>
</multi_database_usage>

<integration_notes>
Project-specific notes:

**Lumelle Project Supabase:**
- Project: Lumelle partnership platform
- Used for: Products, orders, customer data
- Location: Available only in Lumelle project directory

**SISO Internal Supabase:**
- Project: SISO internal operations
- Used for: Internal data, analytics, operations
- Location: Available globally in all projects
</integration_notes>

<error_handling>
  <error>Permission denied</error>
  <solution>
    - Check your Supabase access token
    - Verify RLS policies on the table
  </solution>

  <error>Connection timeout</error>
  <solution>
    - Check your internet connection
    - Verify Supabase URL is correct
  </solution>

  <error>Query returns no results</error>
  <solution>
    - Use supabase_describe_table to verify column names
    - Check if data exists in the table
    - Verify filter conditions
  </solution>
</error_handling>

<related_skills>
  <skill>filesystem</skill>
  <skill>github</skill>
</related_skills>

<see_also>
  <resource>Supabase documentation: https://supabase.com/docs</resource>
  <resource>RLS policies: https://supabase.com/docs/guides/auth/row-level-security</resource>
</see_also>
