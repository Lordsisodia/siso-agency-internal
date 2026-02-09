# Blackbox4 Operations Guide

**Version:** 1.0.0
**Last Updated:** 2026-01-15
**Audience:** System operators, maintainers, DevOps

---

## Overview

This guide covers operational procedures for maintaining and troubleshooting Blackbox4.

---

## Table of Contents

1. [Daily Operations](#daily-operations)
2. [Starting Ralph](#starting-ralph)
3. [Stopping Ralph](#stopping-ralph)
4. [Monitoring](#monitoring)
5. [Backup & Recovery](#backup--recovery)
6. [Troubleshooting](#troubleshooting)
7. [Maintenance Tasks](#maintenance-tasks)
8. [Performance Tuning](#performance-tuning)

---

## Daily Operations

### Morning Checklist

```bash
cd .blackbox4

# 1. Check system health
./4-scripts/validate-structure.sh

# 2. Check Ralph status
./4-scripts/ralph-status.sh

# 3. Review overnight logs
.tail -100 .runtime/.ralph/logs/ralph-$(date +%Y%m%d).log

# 4. Check memory usage
du -sh .memory/*
```

### Monitoring Ralph Runs

**Quick Status:**
```bash
./4-scripts/ralph-status.sh
```

**Full Dashboard:**
```bash
./.monitoring/dashboard.sh
```

**View Live Logs:**
```bash
./.monitoring/dashboard.sh logs
```

---

## Starting Ralph

### Initial Setup

```bash
# 1. Create a plan
cd .blackbox4
./4-scripts/new-plan.sh "Your goal here"

# 2. Navigate to plan
cd .plans/active/YYYY-MM-DD_HHMM_your-goal/

# 3. Edit PRD (optional)
vim prd.json

# 4. Start Ralph
cd ../../..
blackbox4 generate-ralph    # Generate Ralph agent
blackbox4 autonomous-loop   # Start autonomous execution
```

### Verify Ralph Started

```bash
./4-scripts/ralph-status.sh

# Expected output:
# ● Ralph is running (PID: 12345)
# State: active
# Current PRD: Your goal here
```

---

## Stopping Ralph

### Graceful Shutdown

```bash
# 1. Check Ralph PID
cat .runtime/.ralph/pid

# 2. Send SIGTERM (graceful shutdown)
kill $(cat .runtime/.ralph/pid)

# 3. Wait for shutdown (up to 30 seconds)
sleep 5

# 4. Verify stopped
./4-scripts/ralph-status.sh
```

### Force Shutdown (Emergency Only)

```bash
# Send SIGKILL (immediate termination)
kill -9 $(cat .runtime/.ralph/pid)

# Clean up PID file
rm .runtime/.ralph/pid
```

### Resetting Ralph Mid-Run

**Scenario:** Ralph is stuck in a loop or misbehaving

```bash
# 1. Stop Ralph
kill $(cat .runtime/.ralph/pid)

# 2. Backup current state
cp .runtime/.ralph/state.json .runtime/.ralph/state.json.backup

# 3. Reset to safe state
echo '{"state":"idle","last_action":null}' > .runtime/.ralph/state.json

# 4. Restart Ralph
blackbox4 autonomous-loop
```

---

## Monitoring

### Real-Time Monitoring

**Dashboard:**
```bash
./.monitoring/dashboard.sh
```

**Key Metrics to Watch:**
- Ralph state (should be "active" or "processing")
- Run status (success/failed/running)
- Error count (should be low)
- Memory usage (working memory should stay under 10MB)

### Log Analysis

**View today's errors:**
```bash
grep "ERROR" .runtime/.ralph/logs/ralph-$(date +%Y%m%d).log
```

**View recent warnings:**
```bash
grep "WARNING" .runtime/.ralph/logs/ralph-$(date +%Y%m%d).log | tail -20
```

**Count errors by type:**
```bash
grep "ERROR" .runtime/.ralph/logs/ralph-*.log | \
    sed 's/.*ERROR \([^:]*\):.*/\1/' | \
    sort | uniq -c | sort -rn
```

### Performance Metrics

**Average step time:**
```bash
# Extract step timing from logs
grep "Step completed in" .runtime/.ralph/logs/ralph-*.log | \
    sed 's/.*completed in \([0-9]*\)ms.*/\1/' | \
    awk '{sum+=$1; count++} END {print "Average:", sum/count, "ms"}'
```

**Token usage (if logged):**
```bash
grep "tokens" .runtime/.ralph/logs/ralph-*.log | tail -10
```

---

## Backup & Recovery

### Backup Strategy

**Daily Backups (Automated):**
```bash
# Add to crontab: 0 2 * * * /path/to/backup.sh

#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d)
BACKUP_DIR="/backup/blackbox4/$DATE"

mkdir -p "$BACKUP_DIR"

# Backup critical files
cp -r .runtime/.ralph "$BACKUP_DIR/"
cp -r .memory "$BACKUP_DIR/"
cp -r .plans/active "$BACKUP_DIR/"

# Compress
tar -czf "$BACKUP_DIR.tar.gz" "$BACKUP_DIR"
rm -rf "$BACKUP_DIR"

# Keep last 7 days
find /backup/blackbox4 -name "*.tar.gz" -mtime +7 -delete
```

### Manual Backup

```bash
# Quick backup before major changes
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf "blackbox4-backup-$DATE.tar.gz" \
    .runtime/.ralph \
    .memory \
    .plans/active
```

### Recovery Procedures

**Restore from Backup:**
```bash
# 1. Stop Ralph
kill $(cat .runtime/.ralph/pid)

# 2. Extract backup
tar -xzf blackbox4-backup-DATE.tar.gz

# 3. Restore state
cp -r backup/.runtime/.ralph/* .runtime/.ralph/
cp -r backup/.memory/* .memory/
cp -r backup/.plans/active/* .plans/active/

# 4. Restart Ralph
blackbox4 autonomous-loop
```

**Recover Corrupted State:**
```bash
# 1. Detect corruption
if ! jq empty .runtime/.ralph/state.json 2>/dev/null; then
    echo "State file corrupted!"

    # 2. Find last good state
    cd .runtime/.ralph/runs
    last_good=$(ls -t run-*.json | head -1)

    # 3. Extract state from run
    jq '.state' "$last_good" > ../state.json

    # 4. Verify
    if jq empty ../state.json 2>/dev/null; then
        echo "State recovered from $last_good"
    fi
fi
```

---

## Troubleshooting

### Common Issues

#### 1. Ralph Won't Start

**Symptoms:** `blackbox4 autonomous-loop` exits immediately

**Diagnosis:**
```bash
# Check for existing process
ps aux | grep ralph

# Check for stale PID file
cat .runtime/.ralph/pid

# Check Ralph logs
tail -50 .runtime/.ralph/logs/ralph-$(date +%Y%m%d).log
```

**Solutions:**
- If stale PID: `rm .runtime/.ralph/pid`
- If missing PRD: Create PRD or copy from template
- If missing state: `echo '{"state":"idle"}' > .runtime/.ralph/state.json`

#### 2. Ralph Stuck in Loop

**Symptoms:** Ralph repeating same step, not progressing

**Diagnosis:**
```bash
# Check current state
jq '.' .runtime/.ralph/state.json

# Check recent steps
tail -20 .runtime/.ralph/logs/ralph-$(date +%Y%m%d).log
```

**Solutions:**
```bash
# 1. Stop Ralph
kill $(cat .runtime/.ralph/pid)

# 2. Advance state manually
# Edit state.json and increment step/iteration

# 3. Restart Ralph
blackbox4 autonomous-loop
```

#### 3. High Memory Usage

**Symptoms:** .memory/working/ growing beyond 10MB

**Diagnosis:**
```bash
# Check memory size
du -sh .memory/*

# Count files
find .memory/working -type f | wc -l
```

**Solutions:**
```bash
# 1. Compact working memory
./4-scripts/compact-memory.sh

# 2. Archive old sessions
./4-scripts/archive-session.sh --older-than 7d

# 3. Manual cleanup
rm -rf .memory/working/old-*.json
```

#### 4. MCP Server Errors

**Symptoms:** Agent fails with "MCP server not found"

**Diagnosis:**
```bash
# Check MCP config
cat ~/.claude/mcp.json

# Test MCP server
mcp list-servers
```

**Solutions:**
```bash
# 1. Restart Claude Code CLI
# 2. Reinstall MCP server
npm install -g @modelcontextprotocol/server-NAME

# 3. Update MCP config
# Edit ~/.claude/mcp.json
```

### Debug Mode

**Enable verbose logging:**
```bash
# Set environment variable
export RALPH_DEBUG=true

# Start Ralph
blackbox4 autonomous-loop
```

**Enable trace logging:**
```bash
export RALPH_TRACE=true
blackbox4 autonomous-loop
```

---

## Maintenance Tasks

### Daily

- [ ] Check Ralph status
- [ ] Review overnight logs for errors
- [ ] Verify memory usage under limits

### Weekly

- [ ] Run structure validation
- [ ] Compact working memory
- [ ] Archive old plans
- [ ] Review run statistics

### Monthly

- [ ] Full backup verification
- [ ] Dependency updates
- [ ] Performance review
- [ ] Documentation updates

### Quarterly

- [ ] Security audit
- [ ] Architecture review
- [ ] Capacity planning
- [ ] Disaster recovery test

---

## Performance Tuning

### Memory Management

**Working Memory Limit:**
```bash
# Set in .config/memory.yaml
working:
  max_size: 10MB
  auto_compact: true
  compact_threshold: 8MB
```

**Extended Memory Pruning:**
```bash
# Remove old embeddings
chroma-cli delete --namespace "blackbox4" --where "timestamp < $(date -d '30 days ago' +%s)"
```

### Ralph Tuning

**Increase Speed:**
```bash
# Use faster model for simple steps
export RALPH_FAST_MODEL=claude-haiku-4-0-20251101

# Reduce thinking time
export RALPH_MAX_THINK_TIME=30
```

**Increase Quality:**
```bash
# Use best model for critical steps
export RALPH_MODEL=claude-opus-4-5-20251101

# Increase thinking time
export RALPH_MAX_THINK_TIME=120
```

### Cache Optimization

**Clear Ralph cache:**
```bash
rm -rf .runtime/.ralph/cache/*
```

**Warm up cache:**
```bash
# Pre-load common patterns
./4-scripts/warm-cache.sh
```

---

## Emergency Procedures

### Complete System Reset

**WARNING:** This will lose all current work!

```bash
# 1. Stop everything
kill $(cat .runtime/.ralph/pid)

# 2. Backup current state
tar -czf "emergency-backup-$(date +%Y%m%d_%H%M%S).tar.gz" \
    .runtime .memory .plans

# 3. Reset to factory defaults
./4-scripts/factory-reset.sh

# 4. Restart
blackbox4 autonomous-loop
```

### Data Recovery

**If .memory/ is corrupted:**
```bash
# 1. Stop Ralph
kill $(cat .runtime/.ralph/pid)

# 2. Restore from archival
cp -r .memory/archival/latest/* .memory/working/

# 3. Rebuild extended memory
./4-scripts/rebuild-extended-memory.sh
```

---

## Contact & Support

**Documentation:**
- [Getting Started](../1-getting-started/)
- [Contributing](../../CONTRIBUTING.md)
- [Dependencies](../2-reference/DEPENDENCIES.md)

**Issues:**
Report bugs or request help via:
- GitHub Issues
- Discord/Slack community
- Email support

---

**Last Updated:** 2026-01-15
**Maintainer:** Blackbox4 Team
**Version:** 1.0.0
