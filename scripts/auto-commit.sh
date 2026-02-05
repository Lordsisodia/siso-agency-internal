#!/bin/bash
# Smart Auto-Commit Script for SISO-INTERNAL
# Run this to start: ./scripts/auto-commit.sh &

REPO_PATH="/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL"
PIDFILE="/tmp/siso-auto-commit.pid"
INTERVAL=900  # 15 minutes

# Check if already running
if [ -f "$PIDFILE" ]; then
  OLD_PID=$(cat "$PIDFILE")
  if ps -p "$OLD_PID" > /dev/null 2>&1; then
    echo "✅ Auto-commit already running (PID: $OLD_PID)"
    exit 0
  fi
fi

# Save PID
echo $$ > "$PIDFILE"

echo "🔄 Auto-commit started for SISO-INTERNAL"
echo "   PID: $$"
echo "   Interval: 15 minutes"
echo "   Stop with: kill $$"
echo ""

cd "$REPO_PATH" || exit 1

while true; do
  sleep $INTERVAL
  
  # Only commit if there are changes and files are stable (not edited in last 30s)
  if ! git diff-index --quiet HEAD --; then
    RECENT_CHANGE=$(find . -type f -mtime -0.00035 ! -path './node_modules/*' ! -path './.git/*' ! -path './.vite-cache/*' 2>/dev/null | head -1)
    
    if [ -z "$RECENT_CHANGE" ]; then
      git add -A
      git commit -m "checkpoint: $(date '+%Y-%m-%d %H:%M')" --quiet
      echo "✅ Checkpoint saved at $(date '+%H:%M')"
    fi
  fi
done
