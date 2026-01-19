---
name: github
category: integration-connectivity/mcp-integrations
version: 1.0.0
description: Complete guide to using GitHub MCP server with Claude Code
author: blackbox5/mcp
verified: true
tags: [mcp, github, repository, issues, pr]
---

# GitHub MCP Server Skills

<context>
Complete guide to using GitHub MCP server with Claude Code. The GitHub MCP server connects Claude Code to GitHub's API, enabling repository management, issue tracking, pull requests, and more.

**Configuration:** HTTP endpoint at `https://api.githubcopilot.com/mcp/`

**Requires:** GitHub Personal Access Token (PAT)
</context>

<instructions>
When working with GitHub through Claude Code, use natural language commands. Claude will convert your requests into the appropriate GitHub API calls.

For destructive operations (delete, merge, close), Claude will ask for confirmation. Always verify repository names and branches before making changes.
</instructions>

<workflow>
  <phase name="Repository Setup">
    <goal>Initialize or connect to a GitHub repository</goal>
    <steps>
      <step>Use `github_list_repositories` to see available repositories</step>
      <step>Use `github_get_repository` to get repository details</step>
      <step>Use `github_create_repository` to create new repository if needed</step>
    </steps>
  </phase>

  <phase name="Branch Management">
    <goal>Create and manage branches for feature development</goal>
    <steps>
      <step>Use `github_list_branches` to see existing branches</step>
      <step>Use `github_create_branch` to create new feature branch</step>
      <step>Use `github_get_branch` to get branch details and commit info</step>
    </steps>
  </phase>

  <phase name="Issue Tracking">
    <goal>Track bugs and feature requests</goal>
    <steps>
      <step>Use `github_list_issues` to see existing issues</step>
      <step>Use `github_create_issue` to create new issue</step>
      <step>Use `github_update_issue` to update issue status or add assignees</step>
      <step>Use `github_create_issue_comment` to add comments</step>
    </steps>
  </phase>

  <phase name="Pull Request Management">
    <goal>Create and manage pull requests for code review</goal>
    <steps>
      <step>Use `github_list_pull_requests` to see open PRs</step>
      <step>Use `github_create_pull_request` to create new PR</step>
      <step>Use `github_get_pull_request` to view PR details and status</step>
      <step>Use `github_create_pull_request_review` to review and approve</step>
      <step>Use `github_update_pull_request` to merge or close</step>
    </steps>
  </phase>

  <phase name="Commit Management">
    <goal>Review and compare commits</goal>
    <steps>
      <step>Use `github_list_commits` to see commit history</step>
      <step>Use `github_get_commit` to view commit details</step>
      <step>Use `github_compare_commits` to compare branches or commits</step>
    </steps>
  </phase>
</workflow>

<available_skills>
  <skill_group name="Repository Management">
    <skill name="github_list_repositories">
      <purpose>List repositories accessible to your account</purpose>
      <usage>List all my repositories</usage>
      <parameters>
        <param name="sort">Sort by (updated, created, full_name)</param>
        <param name="per_page">Results per page (default: 30)</param>
        <param name="affiliation">Filter by owner, collaborator, organization_member</param>
      </parameters>
    </skill>
    <skill name="github_get_repository">
      <purpose>Get details of a specific repository</purpose>
      <usage>Get details for repo shaansisodia/lumelle</usage>
      <parameters>
        <param name="owner">Repository owner</param>
        <param name="repo">Repository name</param>
      </parameters>
      <returns>Repository description, stars, forks, watchers, default branch, language statistics, last updated date</returns>
    </skill>
    <skill name="github_create_repository">
      <purpose>Create a new repository</purpose>
      <usage>Create a new repository called my-new-repo</usage>
      <parameters>
        <param name="name">Repository name (required)</param>
        <param name="description">Repository description</param>
        <param name="private">Visibility (true/false)</param>
        <param name="auto_init">Initialize with README</param>
        <param name="gitignore_template">.gitignore template</param>
        <param name="license_template">License template</param>
      </parameters>
    </skill>
    <skill name="github_update_repository">
      <purpose>Update repository settings</purpose>
      <usage>Update repository description for lumelle</usage>
      <parameters>
        <param name="owner">Repository owner</param>
        <param name="repo">Repository name</param>
        <param name="updates">Fields to update</param>
      </parameters>
    </skill>
    <skill name="github_delete_repository">
      <purpose>Delete a repository</purpose>
      <usage>Delete repository test-repo</usage>
      <warning>This action cannot be undone!</warning>
    </skill>
  </skill_group>

  <skill_group name="Branch Management">
    <skill name="github_list_branches">
      <purpose>List branches in a repository</purpose>
      <usage>List all branches in lumelle</usage>
    </skill>
    <skill name="github_get_branch">
      <purpose>Get details of a specific branch</purpose>
      <usage>Get details for branch dev in lumelle</usage>
      <returns>Branch name, commit SHA, commit message, author information</returns>
    </skill>
    <skill name="github_create_branch">
      <purpose>Create a new branch</purpose>
      <usage>Create branch feature/new-ui from main</usage>
      <parameters>
        <param name="branch">New branch name</param>
        <param name="from_branch">Base branch (default: main)</param>
      </parameters>
    </skill>
    <skill name="github_delete_branch">
      <purpose>Delete a branch</purpose>
      <usage>Delete branch feature/old-feature</usage>
    </skill>
  </skill_group>

  <skill_group name="Issue Management">
    <skill name="github_list_issues">
      <purpose>List issues in a repository</purpose>
      <usage>List all open issues in lumelle</usage>
      <parameters>
        <param name="state">Issue state (open, closed, all)</param>
        <param name="labels">Filter by labels</param>
        <param name="assignee">Filter by assignee</param>
        <param name="creator">Filter by creator</param>
        <param name="sort">Sort by (created, updated, comments)</param>
      </parameters>
    </skill>
    <skill name="github_get_issue">
      <purpose>Get details of a specific issue</purpose>
      <usage>Get issue #123 in lumelle</usage>
      <returns>Issue title and body, labels and assignees, comments, state (open/closed), created/closed dates</returns>
    </skill>
    <skill name="github_create_issue">
      <purpose>Create a new issue</purpose>
      <usage>Create an issue titled 'Fix login bug' with description ...</usage>
      <parameters>
        <param name="title">Issue title (required)</param>
        <param name="body">Issue description (supports markdown)</param>
        <param name="labels">Array of label names</param>
        <param name="assignees">Array of usernames</param>
        <param name="milestone">Milestone number</param>
      </parameters>
    </skill>
    <skill name="github_update_issue">
      <purpose>Update an existing issue</purpose>
      <usage>Update issue #123 to add label 'bug'</usage>
      <parameters>
        <param name="issue_number">Issue number</param>
        <param name="updates">Fields to update</param>
      </parameters>
    </skill>
    <skill name="github_list_issue_comments">
      <purpose>Get comments on an issue</purpose>
      <usage>Get comments for issue #123</usage>
    </skill>
    <skill name="github_create_issue_comment">
      <purpose>Add a comment to an issue</purpose>
      <usage>Comment on issue #123: 'This is fixed'</usage>
    </skill>
  </skill_group>

  <skill_group name="Pull Request Management">
    <skill name="github_list_pull_requests">
      <purpose>List pull requests in a repository</purpose>
      <usage>List all open PRs in lumelle</usage>
      <parameters>
        <param name="state">PR state (open, closed, all)</param>
        <param name="head">Filter by head branch</param>
        <param name="base">Filter by base branch</param>
        <param name="sort">Sort by (created, updated, popularity)</param>
      </parameters>
    </skill>
    <skill name="github_get_pull_request">
      <purpose>Get details of a specific PR</purpose>
      <usage>Get PR #42 in lumelle</usage>
      <returns>PR title and body, branch names (head/base), status (open/closed/merged), review status, mergeable status, commits and files changed</returns>
    </skill>
    <skill name="github_create_pull_request">
      <purpose>Create a new pull request</purpose>
      <usage>Create a PR from feature/new-ui to main</usage>
      <parameters>
        <param name="title">PR title (required)</param>
        <param name="head">Head branch (required)</param>
        <param name="base">Base branch (default: main)</param>
        <param name="body">PR description (supports markdown)</param>
        <param name="draft">Create as draft PR</param>
      </parameters>
    </skill>
    <skill name="github_update_pull_request">
      <purpose>Update an existing PR</purpose>
      <usage>Update PR #42 to add reviewer</usage>
    </skill>
    <skill name="github_list_pull_request_files">
      <purpose>Get files changed in a PR</purpose>
      <usage>Show files changed in PR #42</usage>
    </skill>
    <skill name="github_list_pull_request_comments">
      <purpose>Get review comments on a PR</purpose>
      <usage>Get comments for PR #42</usage>
    </skill>
    <skill name="github_create_pull_request_review">
      <purpose>Create a review on a PR</purpose>
      <usage>Approve PR #42</usage>
      <parameters>
        <param name="event">Review action (APPROVE, REQUEST_CHANGES, COMMENT)</param>
        <param name="body">Review comments</param>
      </parameters>
    </skill>
  </skill_group>

  <skill_group name="Commit Management">
    <skill name="github_list_commits">
      <purpose>List commits in a repository</purpose>
      <usage>Show recent commits in lumelle</usage>
    </skill>
    <skill name="github_get_commit">
      <purpose>Get details of a specific commit</purpose>
      <usage>Get commit abc123def</usage>
      <returns>Commit message, author and committer, file changes, added/deleted lines, parent commits</returns>
    </skill>
    <skill name="github_compare_commits">
      <purpose>Compare two commits or branches</purpose>
      <usage>Compare main and dev branches</usage>
      <returns>Files changed, diff stats, merge base</returns>
    </skill>
  </skill_group>
</available_skills>

<rules>
  <rule>
    <condition>Before creating or modifying resources</condition>
    <action>Always verify repository name and current branch</action>
  </rule>
  <rule>
    <condition>When creating pull requests</condition>
    <action>Link to related issues using "Closes #123" in description</action>
  </rule>
  <rule>
    <condition>When deleting repositories or branches</condition>
    <action>Ask for explicit confirmation first</action>
  </rule>
  <rule>
    <condition>When merging pull requests</condition>
    <action>Verify all reviews are approved and checks pass</action>
  </rule>
</rules>

<best_practices>
  <practice category="General">
    <do>Write descriptive commit messages</do>
    <do>Link PRs to issues</do>
    <do>Use PR templates</do>
    <do>Review code before merging</do>
    <do>Delete merged branches</do>
    <do>Use labels for organization</do>
    <do>Protect main branch</do>
    <dont>Push directly to main</dont>
    <dont>Create huge PRs</dont>
    <dont>Ignore review comments</dont>
    <dont>Forget to update documentation</dont>
    <dont>Leave stale issues open</dont>
    <dont>Use vague commit messages</dont>
    <dont>Skip code review</dont>
  </practice>
</best_practices>

<examples>
  <example scenario="Repository Setup">
    <input>Create a new repository called my-project with README</input>
    <workflow>
      <step>Create repository with auto_init=true</step>
      <step>Add .gitignore template</step>
      <step>Clone locally</step>
    </workflow>
  </example>

  <example scenario="Feature Development">
    <input>Create a new feature for user authentication</input>
    <workflow>
      <step>Create branch feature/user-auth from main</step>
      <step>Make changes and commit</step>
      <step>Create PR with description "Implements user login #42"</step>
      <step>Get code review</step>
      <step>After approval, merge to main</step>
      <step>Delete feature branch</step>
    </workflow>
  </example>

  <example scenario="Bug Tracking">
    <input>Track login bug</input>
    <workflow>
      <step>Create issue with title "Fix login timeout"</step>
      <step>Add labels: bug, high-priority</step>
      <step>Assign to developer</step>
      <step>Create branch bugfix/login-timeout</step>
      <step>Fix and create PR</step>
      <step>Close issue after merge</step>
    </workflow>
  </example>
</examples>

<error_handling>
  <error>
    <condition>Authentication failed</condition>
    <solution>
      <step>Verify GitHub token is set</step>
      <step>Check token has required scopes</step>
      <step>Regenerate token if expired</step>
    </solution>
  </error>
  <error>
    <condition>Repository not found</condition>
    <solution>
      <step>Verify repository name</step>
      <step>Check you have access</step>
      <step>Ensure correct owner/name format</step>
    </solution>
  </error>
  <error>
    <condition>PR cannot be merged</condition>
    <solution>
      <step>Check for merge conflicts</step>
      <step>Verify branch protection rules</step>
      <step>Ensure all reviews approved</step>
    </solution>
  </error>
  <error>
    <condition>Rate limit exceeded</condition>
    <solution>
      <step>Wait before retrying</step>
      <step>Use pagination</step>
      <step>Cache results</step>
    </solution>
  </error>
</error_handling>

<output_format>
  <format>
    <type>Repository Information</type>
    <structure>
      <field>name: Repository name</field>
      <field>description: Repository description</field>
      <field>stars: Number of stars</field>
      <field>forks: Number of forks</field>
      <field>default_branch: Main branch name</field>
      <field>language: Primary language</field>
    </structure>
  </format>
  <format>
    <type>Pull Request</type>
    <structure>
      <field>number: PR number</field>
      <field>title: PR title</field>
      <field>state: open/closed/merged</field>
      <field>head: Head branch</field>
      <field>base: Base branch</field>
      <field>mergeable: Can be merged</field>
      <field>review_status: Review state</field>
    </structure>
  </format>
</output_format>

<integration_notes>
  <note category="Rate Limits">
    <content>GitHub API rate limits: Authenticated requests: 5,000 per hour, Search API: 30 requests per minute. Claude will handle rate limiting automatically.</content>
  </note>
  <note category="Authentication">
    <content>Requires GitHub Personal Access Token with scopes: repo (full repository access), issues (issue management), pull_requests (PR management), workflows (GitHub Actions)</content>
  </note>
  <note category="Getting Token">
    <content>Go to GitHub Settings → Developer settings → Personal access tokens → Generate new token (classic)</content>
  </note>
</integration_notes>
