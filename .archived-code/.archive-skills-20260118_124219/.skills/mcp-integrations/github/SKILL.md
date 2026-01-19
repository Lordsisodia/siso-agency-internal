# GitHub MCP Server Skills

Complete guide to using GitHub MCP server with Claude Code.

## Overview

The GitHub MCP server connects Claude Code to GitHub's API, enabling repository management, issue tracking, pull requests, and more.

**Configuration:** HTTP endpoint at `https://api.githubcopilot.com/mcp/`

**Requires:** GitHub Personal Access Token (PAT)

---

## Prerequisites

Before using GitHub MCP, ensure you have:

1. **GitHub Account** - A GitHub account
2. **Personal Access Token** - GitHub PAT with appropriate scopes
3. **Repository Access** - Access to repositories you want to manage

**Getting a GitHub PAT:**
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes:
   - `repo` - Full repository access
   - `issues` - Issue management
   - `pull_requests` - PR management
   - `workflows` - GitHub Actions
4. Set environment variable: `export GITHUB_TOKEN="your-token-here"`

---

## Available Skills

### Repository Management

#### `github_list_repositories`
List repositories accessible to your account.

**Usage:**
```
List all my repositories
Get repositories sorted by updated date
```

**Parameters:**
- `sort`: Sort by (updated, created, full_name)
- `per_page`: Results per page (default: 30)
- `affiliation`: Filter by owner, collaborator, organization_member

---

#### `github_get_repository`
Get details of a specific repository.

**Usage:**
```
Get details for repo shaansisodia/lumelle
Show repository information for lumelle
```

**Parameters:**
- `owner`: Repository owner
- `repo`: Repository name

**Returns:**
- Repository description
- Stars, forks, watchers
- Default branch
- Language statistics
- Last updated date

---

#### `github_create_repository`
Create a new repository.

**Usage:**
```
Create a new repository called my-new-repo
Create repo 'test-project' with description 'Testing repo'
```

**Parameters:**
- `name`: Repository name (required)
- `description`: Repository description
- `private`: Visibility (true/false)
- `auto_init`: Initialize with README
- `gitignore_template`: .gitignore template
- `license_template`: License template

---

#### `github_update_repository`
Update repository settings.

**Usage:**
```
Update repository description for lumelle
Make lumelle repository private
```

**Parameters:**
- `owner`: Repository owner
- `repo`: Repository name
- `updates`: Fields to update

---

#### `github_delete_repository`
Delete a repository.

**Usage:**
```
Delete repository test-repo
```

**Warning:** This action cannot be undone!

---

### Branch Management

#### `github_list_branches`
List branches in a repository.

**Usage:**
```
List all branches in lumelle
Get branches sorted by name
```

---

#### `github_get_branch`
Get details of a specific branch.

**Usage:**
```
Get details for branch dev in lumelle
Show the main branch
```

**Returns:**
- Branch name
- Commit SHA
- Commit message
- Author information

---

#### `github_create_branch`
Create a new branch.

**Usage:**
```
Create branch feature/new-ui from main
Create branch hotfix/crash from dev
```

**Parameters:**
- `branch`: New branch name
- `from_branch`: Base branch (default: main)

---

#### `github_delete_branch`
Delete a branch.

**Usage:**
```
Delete branch feature/old-feature
```

---

### Issue Management

#### `github_list_issues`
List issues in a repository.

**Usage:**
```
List all open issues in lumelle
Get issues labeled 'bug'
Show my assigned issues
```

**Parameters:**
- `state`: Issue state (open, closed, all)
- `labels`: Filter by labels
- `assignee`: Filter by assignee
- `creator`: Filter by creator
- `sort`: Sort by (created, updated, comments)

---

#### `github_get_issue`
Get details of a specific issue.

**Usage:**
```
Get issue #123 in lumelle
Show details for issue 456
```

**Returns:**
- Issue title and body
- Labels and assignees
- Comments
- State (open/closed)
- Created/closed dates

---

#### `github_create_issue`
Create a new issue.

**Usage:**
```
Create an issue titled 'Fix login bug' with description ...
Create issue for feature request
```

**Parameters:**
- `title`: Issue title (required)
- `body`: Issue description (supports markdown)
- `labels`: Array of label names
- `assignees`: Array of usernames
- `milestone`: Milestone number

---

#### `github_update_issue`
Update an existing issue.

**Usage:**
```
Update issue #123 to add label 'bug'
Assign issue 456 to @username
Close issue #789
```

**Parameters:**
- `issue_number`: Issue number
- `updates`: Fields to update

---

#### `github_list_issue_comments`
Get comments on an issue.

**Usage:**
```
Get comments for issue #123
```

---

#### `github_create_issue_comment`
Add a comment to an issue.

**Usage:**
```
Comment on issue #123: 'This is fixed'
```

---

### Pull Request Management

#### `github_list_pull_requests`
List pull requests in a repository.

**Usage:**
```
List all open PRs in lumelle
Get pull requests from branch feature/new-ui
Show my pull requests
```

**Parameters:**
- `state`: PR state (open, closed, all)
- `head`: Filter by head branch
- `base`: Filter by base branch
- `sort`: Sort by (created, updated, popularity)

---

#### `github_get_pull_request`
Get details of a specific PR.

**Usage:**
```
Get PR #42 in lumelle
Show pull request 15 details
```

**Returns:**
- PR title and body
- Branch names (head/base)
- Status (open/closed/merged)
- Review status
- Mergeable status
- Commits and files changed

---

#### `github_create_pull_request`
Create a new pull request.

**Usage:**
```
Create a PR from feature/new-ui to main
Create PR with title 'Add login feature'
```

**Parameters:**
- `title`: PR title (required)
- `head`: Head branch (required)
- `base`: Base branch (default: main)
- `body`: PR description (supports markdown)
- `draft`: Create as draft PR

---

#### `github_update_pull_request`
Update an existing PR.

**Usage:**
```
Update PR #42 to add reviewer
Merge PR #15
Close pull request #78
```

---

#### `github_list_pull_request_files`
Get files changed in a PR.

**Usage:**
```
Show files changed in PR #42
```

---

#### `github_list_pull_request_comments`
Get review comments on a PR.

**Usage:**
```
Get comments for PR #42
```

---

#### `github_create_pull_request_review`
Create a review on a PR.

**Usage:**
```
Approve PR #42
Request changes on PR #15 with comment ...
```

**Parameters:**
- `event`: Review action (APPROVE, REQUEST_CHANGES, COMMENT)
- `body`: Review comments

---

### Commit Management

#### `github_list_commits`
List commits in a repository.

**Usage:**
```
Show recent commits in lumelle
Get commits on branch dev
List commits by user shaansisodia
```

---

#### `github_get_commit`
Get details of a specific commit.

**Usage:**
```
Get commit abc123def
Show commit details for SHA ...
```

**Returns:**
- Commit message
- Author and committer
- File changes
- Added/deleted lines
- Parent commits

---

#### `github_compare_commits`
Compare two commits or branches.

**Usage:**
```
Compare main and dev branches
Show diff between commit A and commit B
```

**Returns:**
- Files changed
- Diff stats
- Merge base

---

## Common Workflows

### 1. Repository Setup
```
Create a new repository
Initialize with README
Add .gitignore
```

### 2. Feature Development
```
Create feature branch
Make changes and commit
Create pull request
Get code review
Merge to main
```

### 3. Bug Tracking
```
Create issue for bug
Assign to developer
Add comments and updates
Close issue when fixed
```

### 4. Code Review
```
List open PRs
Review PR #42
Request changes or approve
Merge after approval
```

### 5. Release Management
```
Create release branch
Merge feature branches
Tag release
Create GitHub release
```

---

## Integration with Lumelle

### Repository Management
```
Get Lumelle repository stats
List open pull requests
Show recent commits
```

### Issue Tracking
```
Create issues for Lumelle bugs
Track partner integration issues
Update issue status
```

### Branch Strategy
```
Create feature branches
Compare dev and main
Merge PRs
Delete merged branches
```

---

## Tips

1. **Use issue numbers** - Reference issues in commits: `Fixes #123`
2. **Link PRs to issues** - `Closes #456` in PR description
3. **Use templates** - GitHub has issue/PR templates
4. **Protect main branch** - Require PRs for changes
5. **Use labels** - Organize issues and PRs

---

## Best Practices

✅ **DO:**
- Write descriptive commit messages
- Link PRs to issues
- Use PR templates
- Review code before merging
- Delete merged branches
- Use labels for organization
- Protect main branch

❌ **DON'T:**
- Push directly to main
- Create huge PRs
- Ignore review comments
- Forget to update documentation
- Leave stale issues open
- Use vague commit messages
- Skip code review

---

## Troubleshooting

**Authentication failed:**
- Verify GitHub token is set
- Check token has required scopes
- Regenerate token if expired

**Repository not found:**
- Verify repository name
- Check you have access
- Ensure correct owner/name

**PR cannot be merged:**
- Check for merge conflicts
- Verify branch protection rules
- Ensure all reviews approved

**Rate limit exceeded:**
- Wait before retrying
- Use pagination
- Cache results

---

## Rate Limits

GitHub API rate limits:

- **Authenticated requests:** 5,000 per hour
- **Search API:** 30 requests per minute

Claude will handle rate limiting automatically.

---

**Need Help?** Just ask Claude: "Show me how to use GitHub MCP to..."
