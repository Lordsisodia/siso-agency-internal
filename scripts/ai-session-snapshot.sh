#!/bin/bash
# AI Session Snapshot - Auto-save before AI changes anything

SNAPSHOT_DIR=".git/ai-snapshots"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create snapshot directory if it doesn't exist
mkdir -p "$SNAPSHOT_DIR"

# Check if there are changes
if ! git diff-index --quiet HEAD --; then
    echo "📸 Creating snapshot of current state..."

    # Create a snapshot file with diff
    git diff HEAD > "$SNAPSHOT_DIR/snapshot_${TIMESTAMP}.diff"
    git status --short > "$SNAPSHOT_DIR/snapshot_${TIMESTAMP}.status"

    # Create restore script
    cat > "$SNAPSHOT_DIR/restore_${TIMESTAMP}.sh" << 'RESTORE_EOF'
#!/bin/bash
echo "🔄 Restoring snapshot from ${TIMESTAMP}..."
git apply "$(dirname "$0")/snapshot_${TIMESTAMP}.diff"
echo "✅ Snapshot restored!"
RESTORE_EOF

    chmod +x "$SNAPSHOT_DIR/restore_${TIMESTAMP}.sh"

    echo "✅ Snapshot saved: $SNAPSHOT_DIR/snapshot_${TIMESTAMP}.diff"
    echo "   To restore: bash $SNAPSHOT_DIR/restore_${TIMESTAMP}.sh"
else
    echo "✅ No changes to snapshot"
fi

# Clean up old snapshots (keep last 10)
ls -t "$SNAPSHOT_DIR"/snapshot_*.diff | tail -n +11 | xargs -r rm
ls -t "$SNAPSHOT_DIR"/restore_*.sh | tail -n +11 | xargs -r rm
ls -t "$SNAPSHOT_DIR"/snapshot_*.status | tail -n +11 | xargs -r rm
