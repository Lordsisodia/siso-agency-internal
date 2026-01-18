---
name: filesystem
category: integration-connectivity/mcp-integrations
version: 1.0.0
description: Complete guide to using Filesystem MCP server with Claude Code
author: blackbox5/mcp
verified: true
tags: [mcp, filesystem, files, directories]
---

# Filesystem MCP Server Skills

<context>
Complete guide to using Filesystem MCP server with Claude Code. The Filesystem MCP server provides controlled access to your file system, enabling Claude Code to read, write, search, and manage files.

**Configuration:** Global access to `/Users/shaansisodia`
**Package:** `@modelcontextprotocol/server-filesystem`

**Security Note:** The Filesystem MCP has access to your entire user directory. Claude will ask for confirmation before destructive operations (delete, overwrite, move).
</context>

<instructions>
When working with files through Claude Code, use natural language commands. Claude will convert your requests into appropriate filesystem operations.

For destructive operations, Claude will always ask for confirmation first. Use absolute paths for more reliable operations.
</instructions>

<workflow>
  <phase name="File Exploration">
    <goal>Understand directory structure and find files</goal>
    <steps>
      <step>Use `filesystem_list_directory` to see directory contents</step>
      <step>Use `filesystem_get_directory_tree` to view folder structure</step>
      <step>Use `filesystem_get_file_info` for file metadata</step>
    </steps>
  </phase>

  <phase name="File Reading">
    <goal>Read file contents</goal>
    <steps>
      <step>Use `filesystem_file_exists` to verify file exists</step>
      <step>Use `filesystem_read_file` to read full contents</step>
      <step>Use `filesystem_read_file_lines` for specific line ranges</step>
      <step>Use `filesystem_read_multiple_files` to batch read</step>
    </steps>
  </phase>

  <phase name="File Writing">
    <goal>Create or modify files</goal>
    <steps>
      <step>Use `filesystem_write_file` to create or overwrite</step>
      <step>Use `filesystem_append_file` to add to existing file</step>
      <step>Verify changes with follow-up read</step>
    </steps>
  </phase>

  <phase name="File Search">
    <goal>Find files by name or content</goal>
    <steps>
      <step>Use `filesystem_search_files` to find by name pattern</step>
      <step>Use `filesystem_search_content` to find text within files</step>
      <step>Use `filesystem_find_files_by_extension` for file types</step>
    </steps>
  </phase>

  <phase name="File Organization">
    <goal>Organize and manage files</goal>
    <steps>
      <step>Use `filesystem_create_directory` to create folders</step>
      <step>Use `filesystem_move_file` to relocate files</step>
      <step>Use `filesystem_copy_file` to duplicate</step>
      <step>Use `filesystem_delete_file` or `filesystem_delete_directory` to remove (with confirmation)</step>
    </steps>
  </phase>
</workflow>

<available_skills>
  <skill_group name="File Reading">
    <skill name="filesystem_read_file">
      <purpose>Read the contents of a file</purpose>
      <usage>Read package.json</usage>
      <parameters>
        <param name="path">File path to read</param>
      </parameters>
      <returns>File contents, file metadata (size, type, permissions), encoding information</returns>
    </skill>
    <skill name="filesystem_read_file_lines">
      <purpose>Read specific lines from a file</purpose>
      <usage>Show lines 10-20 of app.ts</usage>
      <parameters>
        <param name="path">File path</param>
        <param name="start_line">Starting line number (1-based)</param>
        <param name="end_line">Ending line number (optional)</param>
      </parameters>
    </skill>
    <skill name="filesystem_read_multiple_files">
      <purpose>Read multiple files at once</purpose>
      <usage>Read all TypeScript files in src/</usage>
      <parameters>
        <param name="paths">Array of file paths</param>
      </parameters>
    </skill>
  </skill_group>

  <skill_group name="File Writing">
    <skill name="filesystem_write_file">
      <purpose>Write content to a file (creates or overwrites)</purpose>
      <usage>Write 'Hello World' to test.txt</usage>
      <parameters>
        <param name="path">File path</param>
        <param name="content">File content</param>
      </parameters>
      <warning>Will overwrite existing files - Claude will ask for confirmation</warning>
    </skill>
    <skill name="filesystem_append_file">
      <purpose>Append content to an existing file</purpose>
      <usage>Append log entry to file.log</usage>
      <parameters>
        <param name="path">File path</param>
        <param name="content">Content to append</param>
      </parameters>
    </skill>
  </skill_group>

  <skill_group name="File Management">
    <skill name="filesystem_create_directory">
      <purpose>Create a new directory</purpose>
      <usage>Create directory src/components/new</usage>
      <parameters>
        <param name="path">Directory path</param>
        <param name="recursive">Create parent directories (default: true)</param>
      </parameters>
    </skill>
    <skill name="filesystem_delete_file">
      <purpose>Delete a file</purpose>
      <usage>Delete test-file.txt</usage>
      <parameters>
        <param name="path">File path</param>
      </parameters>
      <warning>Requires confirmation before deletion</warning>
    </skill>
    <skill name="filesystem_delete_directory">
      <purpose>Delete a directory and its contents</purpose>
      <usage>Delete directory old-folder</usage>
      <parameters>
        <param name="path">Directory path</param>
        <param name="recursive">Delete all contents (default: true)</param>
      </parameters>
      <warning>Destructive operation - requires confirmation</warning>
    </skill>
    <skill name="filesystem_move_file">
      <purpose>Move or rename a file</purpose>
      <usage>Move file to new location</usage>
      <parameters>
        <param name="source">Source path</param>
        <param name="destination">Destination path</param>
      </parameters>
    </skill>
    <skill name="filesystem_copy_file">
      <purpose>Copy a file</purpose>
      <usage>Copy file to backup location</usage>
      <parameters>
        <param name="source">Source path</param>
        <param name="destination">Destination path</param>
      </parameters>
    </skill>
  </skill_group>

  <skill_group name="File Search">
    <skill name="filesystem_search_files">
      <purpose>Search for files by name or pattern</purpose>
      <usage>Find all .ts files</usage>
      <parameters>
        <param name="pattern">File name pattern</param>
        <param name="path">Directory to search (default: current directory)</param>
        <param name="exclude">Patterns to exclude</param>
      </parameters>
    </skill>
    <skill name="filesystem_search_content">
      <purpose>Search for text within files</purpose>
      <usage>Search for 'TODO' in all files</usage>
      <parameters>
        <param name="query">Text to search for</param>
        <param name="path">Directory to search</param>
        <param name="file_pattern">File type filter (optional)</param>
        <param name="exclude">Patterns to exclude</param>
      </parameters>
    </skill>
    <skill name="filesystem_find_files_by_extension">
      <purpose>Find files with specific extension</purpose>
      <usage>Find all .json files</usage>
      <parameters>
        <param name="extension">File extension (e.g., 'ts', 'json', 'md')</param>
        <param name="path">Directory to search</param>
      </parameters>
    </skill>
  </skill_group>

  <skill_group name="Directory Operations">
    <skill name="filesystem_list_directory">
      <purpose>List contents of a directory</purpose>
      <usage>List files in src/</usage>
      <parameters>
        <param name="path">Directory path</param>
      </parameters>
      <returns>Files and subdirectories, file sizes, file types, modification dates</returns>
    </skill>
    <skill name="filesystem_get_directory_tree">
      <purpose>Get tree structure of a directory</purpose>
      <usage>Show directory tree of src/</usage>
      <parameters>
        <param name="path">Directory path</param>
        <param name="depth">Maximum depth (default: unlimited)</param>
      </parameters>
    </skill>
    <skill name="filesystem_get_directory_info">
      <purpose>Get information about a directory</purpose>
      <usage>Get directory size</usage>
      <parameters>
        <param name="path">Directory path</param>
      </parameters>
      <returns>Total size, file count, directory count, permissions</returns>
    </skill>
  </skill_group>

  <skill_group name="File Information">
    <skill name="filesystem_get_file_info">
      <purpose>Get metadata about a file</purpose>
      <usage>Get file info for package.json</usage>
      <parameters>
        <param name="path">File path</param>
      </parameters>
      <returns>File size, creation date, modification date, file type, permissions, owner</returns>
    </skill>
    <skill name="filesystem_file_exists">
      <purpose>Check if a file exists</purpose>
      <usage>Check if config.json exists</usage>
      <parameters>
        <param name="path">File path</param>
      </parameters>
      <returns>Boolean (true/false)</returns>
    </skill>
    <skill name="filesystem_directory_exists">
      <purpose>Check if a directory exists</purpose>
      <usage>Check if node_modules exists</usage>
      <parameters>
        <param name="path">Directory path</param>
      </parameters>
    </skill>
  </skill_group>

  <skill_group name="Permission Management">
    <skill name="filesystem_get_permissions">
      <purpose>Get file or directory permissions</purpose>
      <usage>Get permissions for script.sh</usage>
      <parameters>
        <param name="path">File path</param>
      </parameters>
      <returns>Octal permissions (e.g., 755), symbolic permissions (e.g., rwxr-xr-x), owner, group, others</returns>
    </skill>
    <skill name="filesystem_set_permissions">
      <purpose>Set file or directory permissions</purpose>
      <usage>Make script executable</usage>
      <parameters>
        <param name="path">File path</param>
        <param name="permissions">Octal permissions (e.g., 755, 644)</param>
      </parameters>
    </skill>
  </skill_group>

  <skill_group name="File Comparison">
    <skill name="filesystem_compare_files">
      <purpose>Compare two files</purpose>
      <usage>Compare file1.ts and file2.ts</usage>
      <parameters>
        <param name="path1">First file</param>
        <param name="path2">Second file</param>
      </parameters>
      <returns>Are identical (true/false), differences (if any), line-by-line comparison</returns>
    </skill>
    <skill name="filesystem_get_file_hash">
      <purpose>Get hash of file content</purpose>
      <usage>Get MD5 hash of file</usage>
      <parameters>
        <param name="path">File path</param>
        <param name="algorithm">Hash algorithm (md5, sha1, sha256)</param>
      </parameters>
    </skill>
  </skill_group>
</available_skills>

<rules>
  <rule>
    <condition>Before deleting files or directories</condition>
    <action>Always ask for explicit confirmation</action>
  </rule>
  <rule>
    <condition>When overwriting existing files</condition>
    <action>Warn user and request confirmation</action>
  </rule>
  <rule>
    <condition>For file paths</condition>
    <action>Use absolute paths for more reliable operations</action>
  </rule>
  <rule>
    <condition>Before bulk operations</condition>
    <action>Verify targets and confirm with user</action>
  </rule>
</rules>

<best_practices>
  <practice category="General">
    <do>Use absolute paths</do>
    <do>Check file existence before operations</do>
    <do>Backup important files</do>
    <do>Use descriptive file names</do>
    <do>Organize files logically</do>
    <do>Set appropriate permissions</do>
    <do>Clean up temporary files</do>
    <dont>Delete without confirmation</dont>
    <dont>Overwrite without backup</dont>
    <dont>Use wildcard delete carelessly</dont>
    <dont>Ignore file permissions</dont>
    <dont>Create deep nesting</dont>
    <dont>Hardcode paths in code</dont>
    <dont>Forget to clean up</dont>
  </practice>
</best_practices>

<examples>
  <example scenario="Project Setup">
    <input>Create a new component structure</input>
    <workflow>
      <step>Create directory src/components/Button</step>
      <step>Write Button.tsx with component code</step>
      <step>Write Button.module.css with styles</step>
      <step>Write index.ts with exports</step>
      <step>Verify files created successfully</step>
    </workflow>
  </example>

  <example scenario="Code Search">
    <input>Find all TODO comments in TypeScript files</input>
    <workflow>
      <step>Use filesystem_search_content with query 'TODO'</step>
      <step>Filter by file_pattern '*.ts'</step>
      <step>Review results and list files with TODOs</step>
    </workflow>
  </example>

  <example scenario="File Cleanup">
    <input>Clean up old log files</input>
    <workflow>
      <step>Find files matching *.log</step>
      <step>Get file info to check dates</step>
      <step>Confirm files to delete with user</step>
      <step>Delete confirmed old log files</step>
      <step>Verify cleanup complete</step>
    </workflow>
  </example>
</examples>

<error_handling>
  <error>
    <condition>Permission denied</condition>
    <solution>
      <step>Check file permissions</step>
      <step>Verify you own the file</step>
      <step>Use sudo with caution</step>
      <step>Check parent directory permissions</step>
    </solution>
  </error>
  <error>
    <condition>File not found</condition>
    <solution>
      <step>Verify file path is correct</step>
      <step>Use absolute path</step>
      <step>Check file actually exists</step>
      <step>Check for typos</step>
    </solution>
  </error>
  <error>
    <condition>Cannot delete file</condition>
    <solution>
      <step>Check if file is in use</step>
      <step>Verify permissions</step>
      <step>Close file handles</step>
      <step>Check if file is locked</step>
    </solution>
  </error>
  <error>
    <condition>Disk full</condition>
    <solution>
      <step>Check available space</step>
      <step>Clean up temporary files</step>
      <step>Remove old backups</step>
      <step>Clear cache files</step>
    </solution>
  </error>
</error_handling>

<output_format>
  <format>
    <type>File Contents</type>
    <structure>Raw file content as string with metadata</structure>
  </format>
  <format>
    <type>Directory Listing</type>
    <structure>Array of files with metadata (name, size, type, modified date)</structure>
  </format>
  <format>
    <type>Search Results</type>
    <structure>Array of matching file paths with line numbers and context</structure>
  </format>
  <format>
    <type>File Info</type>
    <structure>Object with size, created, modified, type, permissions</structure>
  </format>
</output_format>

<integration_notes>
  <note category="Security">
    <content>The Filesystem MCP has access to your entire user directory. Claude will confirm destructive operations (delete, overwrite) before executing them.</content>
  </note>
  <note category="File Size Limits">
    <content>Read files: Up to available memory. Write files: Up to available disk space. For large files, use read_file_lines to process in chunks.</content>
  </note>
  <note category="Glob Patterns">
    <content>Supported patterns: *.ts (all TypeScript files), src/**/*.ts (all .ts files in src/), **/*.json (all JSON files anywhere). Exclusions: **/node_modules/**, **/*.test.js</content>
  </note>
</integration_notes>
