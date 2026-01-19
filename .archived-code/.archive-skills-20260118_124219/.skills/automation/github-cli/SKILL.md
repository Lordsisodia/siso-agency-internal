# Skill: GitHub CLI auth + GraphQL usage

## Trigger (when to use)
- You need to connect this repo’s automation/agents to GitHub safely (without pasting tokens into docs or chat).
- You want reliable GitHub API access (higher rate limits than anonymous), especially for:
  - searching OSS repos
  - fetching repo metadata
  - running GraphQL queries for richer/faster lookups
- You want a repeatable setup teammates can follow.

## Goal
Get GitHub CLI (`gh`) authenticated and verified, then use it to call GitHub’s APIs (REST + GraphQL) safely.

## Key idea (security + ergonomics)
Prefer `gh auth login` over manually managing PATs:
- `gh` stores credentials in your OS keychain (or `gh`’s credential store) instead of committing anything.
- scripts can call `gh api ...` without exporting tokens to shell history.

## Recommended auth method (in order)
1) **GitHub CLI (`gh auth login`)** for local agentic runs (best default).
2) **GitHub App** (best for team/server automation): short‑lived tokens, fine‑grained permissions, easy rotation.
3) **Fine‑grained PAT** if you *must* use a PAT (prefer over “classic”).
4) **Classic PAT** only as a last resort (broad scopes; easier to over‑grant).

## Inputs to collect
- Host:
  - GitHub.com (default), or GitHub Enterprise Server (GHES) host (e.g. `github.company.com`)
- Access needs:
  - Public repos only, or private repos too?
  - Do you need org data (teams/repos in an org)?
- Environment:
  - macOS (Homebrew), Linux (apt/yum), Windows (winget/choco)

## Artifacts (what you should produce)
- A verified `gh` authentication state (`gh auth status` output shows “Logged in”).
- Optional: a small “smoke test” GraphQL query that returns your `viewer.login`.

## Step-by-step setup

### 1) Install GitHub CLI (`gh`)

#### macOS (Homebrew)
```bash
brew install gh
gh --version
```

#### Linux (common)
If you already have `gh` installed:
```bash
gh --version
```

If not, install using your distro’s package manager or follow GitHub CLI install instructions for your distro.

#### Windows
Use one of:
- winget
- Chocolatey

(Then confirm with `gh --version`.)

### 2) Authenticate with GitHub

#### GitHub.com (most common)
Run:
```bash
gh auth login
```

Recommended answers:
- **What account do you want to log into?** GitHub.com
- **What is your preferred protocol for Git operations?** HTTPS (recommended for most users) or SSH (if you already use SSH keys)
- **Authenticate Git with your GitHub credentials?** Yes
- **How would you like to authenticate?** “Login with a web browser” (device flow) is easiest + safest

#### GitHub Enterprise Server (GHES)
```bash
gh auth login --hostname github.company.com
```

#### If you already have a PAT (classic or fine‑grained)
Prefer `gh auth login` (web/device flow). If you must use a token, you can attach it to `gh` without ever committing it into the repo.

Safe-ish patterns that avoid putting a token directly in your command history:

- macOS (token copied to clipboard):
```bash
pbpaste | gh auth login --with-token
```

- Linux (varies by distro/desktop; example with xclip):
```bash
xclip -selection clipboard -o | gh auth login --with-token
```

Notes:
- `gh auth login --with-token` reads the token from stdin.
- For our use case (OSS discovery + GraphQL reads), you usually don’t need extra scopes beyond defaults unless you hit a specific “resource not accessible” error.

### 3) Verify you’re authenticated
```bash
gh auth status
```

You should see:
- you are logged in
- the hostname (github.com or your GHES host)

### 4) (Optional) Ensure `gh` has the right scopes

Important: **GraphQL doesn’t require a special “GraphQL scope”.**  
GraphQL uses the *same token permissions* as REST. If your token can read a resource via REST, it can usually read it via GraphQL too.

Typical needs:
- Public-only discovery: usually fine by default
- Org metadata: may require `read:org`
- Private repos: may require `repo`

For our OSS discovery loops (public GitHub), the “happy path” is:
- authenticate with `gh auth login`
- avoid adding scopes unless you hit a concrete “resource not accessible” error

To refresh auth / request additional scopes:
```bash
gh auth refresh --scopes "read:org"
```

(Adjust scopes based on your needs. Keep them minimal.)

## Using `gh` for GraphQL (what you need to know)

### 1) Quick smoke test: “Who am I?”
```bash
gh api graphql -f query='query { viewer { login } }'
```

Expected output includes your GitHub username:
```json
{ "data": { "viewer": { "login": "your-handle" } } }
```

### 2) Query variables (recommended pattern)
GraphQL is easiest when you pass variables explicitly.

Example: fetch basic repo metadata:
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

### 3) Put queries in a file (best for larger queries)
Create `query.graphql`:
```graphql
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
```

Then run:
```bash
gh api graphql -f query=@query.graphql -f login='your-handle'
```

### 4) Rate limits (why GraphQL helps)
GraphQL can be more efficient than REST because you can fetch multiple fields in one request.
Even with `gh` auth, rate limits still exist — but you’ll generally get much higher limits than anonymous calls.

### 5) Repository search via GraphQL (high-signal OSS discovery)
GitHub’s GraphQL API supports repo search via the `search` field (same query syntax as GitHub’s UI search bar).

Example `repo-search.graphql`:
```graphql
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
```

Run a single page (50 results):
```bash
gh api graphql \
  -f query=@repo-search.graphql \
  -f q='topic:shopify-hydrogen stars:>50 archived:false' \
  -F first=50
```

Paginate (pass the previous `endCursor` as `$endCursor`):
```bash
gh api graphql \
  -f query=@repo-search.graphql \
  -f q='topic:headless-commerce stars:>100 archived:false' \
  -F first=50 \
  -f endCursor='CURSOR_FROM_PREVIOUS_RESPONSE'
```

### 6) Pagination with `gh api graphql --paginate` (no manual cursor copy/paste)
If you want a single command that walks the cursor for you, use `--paginate`.

Key requirement: your query must accept `$endCursor` and return `pageInfo { hasNextPage endCursor }` from the collection you’re paging.

Example: paginate a repo search (returns multiple JSON pages; use `--slurp` if you want one outer array):
```bash
gh api graphql --paginate --slurp \
  -f query=@repo-search.graphql \
  -f q='topic:ecommerce stars:>200 archived:false' \
  -F first=50 \
  -F endCursor=null
```

## How this connects to our OSS discovery workflow

Preferred local auth path:
- Login once: `gh auth login`
- Run discovery: `./.blackbox/scripts/start-oss-discovery-cycle.sh`

Token fallback path (use only if needed):
- set `GITHUB_TOKEN` in your shell (from `gh`, without printing it)

Safe pattern (does **not** print the token):
```bash
export GITHUB_TOKEN="$(gh auth token)"
```

Then run your scripts (example):
```bash
./.blackbox/scripts/start-oss-discovery-and-curate.sh --owner "Shaan" --top 25 -- --min-stars 100
```

Optional cleanup:
```bash
unset GITHUB_TOKEN
```

Important:
- Never paste tokens into chat or commit them into files.
- Prefer `gh` for local “agentic” runs because it keeps auth out of the repo.

If you accidentally pasted a token somewhere public:
- **Revoke it immediately** in GitHub Settings → Developer settings → Personal access tokens.
- Assume it is compromised once exposed.

## Troubleshooting

### “Not logged in”
```bash
gh auth status
gh auth login
```

### “Insufficient scopes / resource not accessible”
- Add scopes (minimally) and retry:
```bash
gh auth refresh --scopes "read:org"
```

### Multiple accounts / hosts confusion
List auth contexts:
```bash
gh auth status
```

Switch host:
```bash
gh auth login --hostname github.company.com
```

### Avoid leaking secrets
- Don’t run `gh auth token` in shared terminals/screenshares.
- Don’t paste token strings into docs/chat.

## Done checklist
- [ ] `gh --version` works
- [ ] `gh auth status` shows “Logged in”
- [ ] `gh api graphql -f query='query { viewer { login } }'` returns your login
- [ ] You can run the OSS discovery scripts without hitting immediate rate limits
