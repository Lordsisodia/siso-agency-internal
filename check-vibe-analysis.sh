#!/bin/bash
#
# check-vibe-analysis.sh
#
# Quick status check for Ralph's Vibe Kanban continuous analysis
#

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║     Ralph Continuous Vibe Kanban Analysis - Status Check                   ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if process is running
if [ -f "ralph-vibe-background.log" ]; then
    if pgrep -f "continuous-vibe-kanban-analysis.sh" > /dev/null; then
        echo "✅ Status: RUNNING (autonomous background process)"
    else
        echo "⚠️  Status: STOPPED (log file exists but process not running)"
    fi
else
    echo "❌ Status: NOT STARTED"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Latest Analysis Results"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

OUTPUT_DIR=".blackbox5/engine/runtime/ralph/vibe-continuous"

if [ -d "$OUTPUT_DIR" ]; then
    FILE_COUNT=$(ls -1 "$OUTPUT_DIR"/*.md 2>/dev/null | wc -l | tr -d ' ')
    echo "Analysis documents generated: $FILE_COUNT"
    echo ""

    if [ $FILE_COUNT -gt 0 ]; then
        echo "Latest files:"
        ls -lht "$OUTPUT_DIR"/*.md | head -5 | awk '{print "  " $9 " (" $6 " " $7 " " $8 ")"}'
        echo ""

        # Count issues
        ISSUE_COUNT=$(grep -r "PRIORITY" "$OUTPUT_DIR"/*.md 2>/dev/null | wc -l | tr -d ' ')
        echo "Total issues identified: $ISSUE_COUNT"
        echo ""

        # Show latest improvement
        LATEST_ROADMAP=$(ls -t "$OUTPUT_DIR"/VIBE-IMPROVEMENT-ROADMAP.md 2>/dev/null | head -1)
        if [ -n "$LATEST_ROADMAP" ]; then
            echo "Latest roadmap preview:"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            head -30 "$LATEST_ROADMAP"
            echo "..."
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        fi
    fi
else
    echo "No analysis directory found yet (first run in progress)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Log File (last 20 lines)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "ralph-vibe-background.log" ]; then
    tail -20 ralph-vibe-background.log
else
    echo "No log file found"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Next Steps"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "• Ralph runs automatically every 10 minutes"
echo "• Analysis documents are updated each run"
echo "• Check the output directory: $OUTPUT_DIR"
echo "• View full log: tail -f ralph-vibe-background.log"
echo "• Stop analysis: kill $(cat ralph-vibe-background.pid 2>/dev/null || echo 'process not found')"
echo ""
