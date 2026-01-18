---
name: github-cli
category: core-infrastructure/development-tools
version: 1.0.0
description: GitHub CLI authentication and GraphQL API usage for safe GitHub operations
author: obra/superpowers
verified: true
tags: [github, cli, authentication, graphql, api, security]
---

# Skill: GitHub CLI Auth + GraphQL Usage

<context>
<trigger>
Use this skill when:
- You need to connect this repo's automation/agents to GitHub safely (without pasting tokens into docs or chat)
- You want reliable GitHub API access (higher rate limits than anonymous), especially for:
  - Searching OSS repos
  - Fetching repo metadata
  - Running GraphQL queries for richer/faster lookups
- You want a repeatable setup teammates can follow
</trigger>

<goal>
Get GitHub CLI (`gh`) authenticated and verified, then use it to call GitHub's APIs (REST + GraphQL) safely.
</goal>

<key_idea>
Prefer `gh auth login` over manually managing PATs:
- `gh` stores credentials in your OS keychain (or `gh`'s credential store) instead of committing anything
- Scripts can call `gh api ...` without exporting tokens to shell history
</key_idea>

<recommended_auth_method>
In order of preference:
1. **GitHub CLI (`gh auth login`)** for local agentic runs (best default)
2. **GitHub App** (best for team/server automation): short-lived tokens, fine-grained permissions, easy rotation
3. **Fine-grained PAT** if you *must* use a PAT (prefer over "classic")
4. **Classic PAT** only as a last resort (broad scopes; easier to over-grant)
</recommended_auth_method>

<inputs_to_collect>
- **Host:** GitHub.com (default), or GitHub Enterprise Server (GHES) host (e.g. `github.company.com`)
- **Access needs:**
  - Public repos only, or private repos too?
  - Do you need org data (teams/repos in an org)?
- **Environment:**
  - macOS (Homebrew), Linux (apt/yum), Windows (winget/choco)
</inputs_to_collect>

<artifacts>
- A verified `gh` authentication state (`gh auth status` output shows "Logged in")
- Optional: a small "smoke test" GraphQL query that returns your `viewer.login`
</artifacts>
</context>

<instructions>
<workflow>
<phase name="Installation">
<step>Install GitHub CLI (`gh`)</step>

<commands>
# macOS (Homebrew)
brew install gh
gh --version

# Linux (common)
# If you already have gh installed:
gh --version

# If not, install using your distro's package manager
# or follow GitHub CLI install instructions for your distro

# Windows
# Use winget or Chocolatey, then confirm:
gh --version
</commands>
</phase>

<phase name="Authentication">
<step>Authenticate with GitHub</step>

<variant name="GitHub.com (most common)">
<commands>
gh auth login
</commands>
<recommended_answers>
- **What account do you want to log into?** GitHub.com
- **What is your preferred protocol for Git operations?** HTTPS (recommended) or SSH (if you already use SSH keys)
- **Authenticate Git with your GitHub credentials?** Yes
- **How would you like to authenticate?** "Login with a web browser" (device flow) is easiest + safest
</recommended_answers>
</variant>

<variant name="GitHub Enterprise Server (GHES)">
<commands>
gh auth login --hostname github.company.com
</commands>
</variant>

<variant name="Existing PAT">
<commands>
# macOS (token copied to clipboard)
pbpaste | gh auth login --with-token

# Linux (example with xclip)
xclip -selection clipboard -o | gh auth login --with-token
</commands>
<notes>
- `gh auth login --with-token` reads the token from stdin
- For OSS discovery + GraphQL reads, you usually don't need extra scopes beyond defaults unless you hit a specific "resource not accessible" error
</notes>
</variant>
</phase>

<phase name="Verification">
<step>Verify you're authenticated</step>
<commands>
gh auth status
</commands>
<expected_output>
- You are logged in
- The hostname (github.com or your GHES host)
</expected_output>
</phase>

<phase name="Scopes (Optional)">
<step>Ensure `gh` has the right scopes</step>
<important>
**GraphQL doesn't require a special "GraphQL scope".**
GraphQL uses the *same token permissions* as REST. If your token can read a resource via REST, it can usually read it via GraphQL too.
</important>

<typical_needs>
- Public-only discovery: usually fine by default
- Org metadata: may require `read:org`
- Private repos: may require `repo`
</typical_needs>

<commands>
# Refresh auth / request additional scopes
gh auth refresh --scopes "read:org"
</commands>
<notes>
Adjust scopes based on your needs. Keep them minimal.
</notes>
</phase>
</workflow>

<graphql_usage>
<phase name="Smoke Test">
<step>Quick test: "Who am I?"</step>
<commands>
gh api graphql -f query='query { viewer { login } }'
</commands>
<expected_output>
```json
{ "data": { "viewer": { "login": "your-handle" } } }
```
</expected_output>
</phase>

<phase name="Query Variables">
<step>Use variables (recommended pattern)</step>
<example>
Fetch basic repo metadata:
```bash
gh api graphql \
  -f query='
    query($owner:String!, $name:String!) {
      repository(owner:$owner, name:$name) {
        nameWithOwner
        url
        stargazerCount
        pushedAt
        primaryLanguage { name }
      }
    }' \
  -f owner='illacloud' \
  -f name='illa-builder'
```
</example>
</phase>

<phase name="Query Files">
<step>Put queries in a file (best for larger queries)</step>
<commands>
# Create query.graphql
cat > query.graphql <<'EOF'
query($login:String!) {
  user(login: $login) {
    repositories(first: 5, orderBy: {field: UPDATED_AT, direction: DESC}) {
      nodes {
        nameWithOwner
        url
        stargazerCount
      }
    }
  }
}
EOF

# Run it
gh api graphql -f query=@query.graphql -f login='your-handle'
</commands>
</phase>

<phase name="Rate Limits">
<step>Understanding rate limits</step>
<notes>
GraphQL can be more efficient than REST because you can fetch multiple fields in one request.
Even with `gh` auth, rate limits still exist — but you'll generally get much higher limits than anonymous calls.
</notes>
</phase>

<phase name="Repository Search">
<step>High-signal OSS discovery via search</step>
<commands>
# Create repo-search.graphql
cat > repo-search.graphql <<'EOF'
query($q: String!, $first: Int!, $endCursor: String) {
  search(type: REPOSITORY, query: $q, first: $first, after: $endCursor) {
    repositoryCount
    pageInfo { endCursor hasNextPage }
    nodes {
      ... on Repository {
        nameWithOwner
        url
        description
        stargazerCount
        pushedAt
        licenseInfo { spdxId name }
        primaryLanguage { name }
        repositoryTopics(first: 12) { nodes { topic { name } } }
      }
    }
  }
}
EOF

# Run a single page (50 results)
gh api graphql \
  -f query=@repo-search.graphql \
  -f q='topic:shopify-hydrogen stars:>50 archived:false' \
  -F first=50

# Paginate (pass the previous endCursor)
gh api graphql \
  -f query=@repo-search.graphql \
  -f q='topic:headless-commerce stars:>100 archived:false' \
  -F first=50 \
  -f endCursor='CURSOR_FROM_PREVIOUS_RESPONSE'
</commands>
</phase>

<phase name="Auto-pagination">
<step>Use `--paginate` for automatic cursor handling</step>
<commands>
gh api graphql --paginate --slurp \
  -f query=@repo-search.graphql \
  -f q='topic:ecommerce stars:>200 archived:false' \
  -F first=50 \
  -F endCursor=null
</commands>
<requirements>
Your query must accept `$endCursor` and return `pageInfo { hasNextPage endCursor }` from the collection you're paging.
</requirements>
</phase>
</graphql_usage>

<integration_notes>
<oss_discovery_workflow>
Preferred local auth path:
- Login once: `gh auth login`
- Run discovery: `./.blackbox/scripts/start-oss-discovery-cycle.sh`

Token fallback path (use only if needed):
<commands>
# Set GITHUB_TOKEN in your shell (from gh, without printing it)
export GITHUB_TOKEN="$(gh auth token)"

# Run your scripts
./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "Shaan" --top 25 -- --min-stars 100

# Optional cleanup
unset GITHUB_TOKEN
</commands>
</oss_discovery_workflow>
</integration_notes>

<rules>
<security_rules>
- Never paste tokens into chat or commit them into files
- Prefer `gh` for local "agentic" runs because it keeps auth out of the repo
- Don't run `gh auth token` in shared terminals/screenshares
- Don't paste token strings into docs/chat
</security_rules>

<incident_response>
If you accidentally pasted a token somewhere public:
1. **Revoke it immediately** in GitHub Settings → Developer settings → Personal access tokens
2. Assume it is compromised once exposed
</incident_response>
</rules>

<troubleshooting>
<issue condition="Not logged in">
<solution>
```bash
gh auth status
gh auth login
```
</solution>
</issue>

<issue condition="Insufficient scopes / resource not accessible">
<solution>
Add scopes (minimally) and retry:
```bash
gh auth refresh --scopes "read:org"
```
</solution>
</issue>

<issue condition="Multiple accounts / hosts confusion">
<solution>
List auth contexts:
```bash
gh auth status
```
Switch host:
```bash
gh auth login --hostname github.company.com
```
</solution>
</issue>
</troubleshooting>

<done_checklist>
- [ ] `gh --version` works
- [ ] `gh auth status` shows "Logged in"
- [ ] `gh api graphql -f query='query { viewer { login } }'` returns your login
- [ ] You can run the OSS discovery scripts without hitting immediate rate limits
</done_checklist>
</instructions>
