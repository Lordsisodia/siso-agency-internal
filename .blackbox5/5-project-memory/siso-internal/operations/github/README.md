# GitHub Integration Memory

This folder contains **GitHub Integration** memory - issues, PRs, and sync state.

## Structure

```
github/
├── issues/              # GitHub issue records
│   └── {issue-number}/
│       ├── issue.json         # Raw issue data
│       ├── comments/          # Comment history
│       ├── events.json        # Issue events
│       └── sync-log.json      # Sync history
│
├── pull-requests/       # Pull request records
│   └── {pr-number}/
│       ├── pr.json            # Raw PR data
│       ├── comments/          # Review comments
│       ├── reviews/           # Review records
│       └── events.json        # PR events
│
└── sync-history/        # Sync state
    ├── last-sync.txt          # Last successful sync
    ├── pending/               # Pending updates
    └── conflicts/             # Sync conflicts
```

## Usage

### Syncing Issues

When syncing from GitHub, create `{issue-number}/issue.json`:

```json
{
  "id": 123,
  "number": 123,
  "title": "",
  "state": "open",
  "created_at": "",
  "updated_at": "",
  "labels": [],
  "assignees": [],
  "body": ""
}
```

### Recording Comments

Save each comment to `comments/{comment-id}.json`

### Tracking Sync

Update `sync-history/last-sync.txt` with timestamp after each sync.
