# AI Session Management

Scripts for managing AI agent sessions and protecting working state.

## Scripts

### ai-session-snapshot.sh
Creates snapshots of the current repository state before autonomous AI agent operations.

**Usage:**
```bash
npm run ai:snapshot
# or
bash scripts/ai/ai-session-snapshot.sh
```

**Purpose:**
- Protects working state before AI agents make changes
- Creates timestamped snapshots in `.git/ai-snapshots/`
- Enables rollback if AI sessions cause issues

**Related Commands:**
```bash
npm run ai:protect    # Snapshot + confirm safe to proceed
npm run ai:restore    # List available snapshots for restoration
```

## Snapshots

Snapshots are stored in `.git/ai-snapshots/` with format: `restore_YYYYMMDD_HHMMSS.sh`

To restore a snapshot:
```bash
bash .git/ai-snapshots/restore_TIMESTAMP.sh
```
