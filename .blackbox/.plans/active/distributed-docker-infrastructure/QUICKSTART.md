# Quick Start Guide - Distributed Docker Infrastructure

**Status:** 🟡 Ready to begin (awaiting Mac Mini access)

---

## TL;DR

You're moving heavy Docker workloads from your MacBook Pro M1 (16GB) to a remote Mac Mini M4 (16GB) using:
- **Colima** for Docker runtime
- **Tailscale** for networking
- **Memory budget:** 14GB

**Goal:** 24/7 agent operations without affecting local development.

---

## Pre-Flight Checklist

Before starting, ensure you have:

- [ ] **Access to Mac Mini M4** (physical or remote)
- [ ] **Admin privileges** on both machines
- [ ] **Stable internet** at both locations
- [ ] **2-3 hours** for initial setup
- [ ] **GitHub access** for repository

---

## Quick Start (30 Minutes)

### Step 1: Mac Mini Initial Setup (10 minutes)

```bash
# SSH into Mac Mini (or use directly)
ssh your-user@mac-mini-local-ip

# Enable SSH if not already enabled
sudo systemsetup -setremotelogin on

# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Colima (Docker runtime)
brew install colima docker-compose

# Start Colima with 14GB RAM
colima start --cpu 8 --memory 14 --disk 100

# Verify
docker info
docker-compose --version
```

### Step 2: Install Tailscale (5 minutes)

```bash
# On Mac Mini
brew install tailscale
sudo tailscale up
tailscale ip -4  # Note this IP

# On your MacBook (Thailand/Vietnam)
brew install tailscale
sudo tailscale up
```

### Step 3: Test Remote Access (5 minutes)

```bash
# From MacBook, test SSH via Tailscale
ssh your-user@<mac-mini-tailscale-ip>

# If it works, you're ready to proceed!
# If not, check Tailscale status on both machines
```

### Step 4: Clone Repository (5 minutes)

```bash
# On Mac Mini
cd ~
git clone <your-repo-url> SISO-INTERNAL
cd SISO-INTERNAL
npm install
```

### Step 5: Deploy Docker Stack (5 minutes)

```bash
# On Mac Mini
cd ~/SISO-INTERNAL

# Test with existing docker-compose
docker-compose -f docker-compose.yml up -d

# Check status
docker-compose ps
docker stats
```

---

## Verify Setup

```bash
# Check all services are running
docker-compose ps

# Check RAM usage
docker stats --no-stream

# Check you can access from MacBook
ssh mac-mini "docker ps"
```

**Expected Result:** All services running, RAM usage < 14GB

---

## What's Next?

After verifying the basic setup works:

1. **Create memory-optimized docker-compose** - See Phase 2 in work-queue.md
2. **Build custom Docker images** - For Ralph Agent, Claude Code Runtime
3. **Set up deployment automation** - Scripts to deploy from MacBook
4. **Configure monitoring** - Dashboards and alerts
5. **Load test** - Validate RAM usage and performance

**Detailed instructions:** See [work-queue.md](work-queue.md)

---

## Troubleshooting

### Colima won't start

```bash
# Check if VM is already running
colima status

# Stop and restart
colima stop
colima start --cpu 8 --memory 14 --disk 100
```

### Tailscale not connecting

```bash
# Check Tailscale status
sudo tailscale status

# Restart Tailscale
sudo tailscale down
sudo tailscale up
```

### Docker out of memory

```bash
# Check current usage
docker stats

# Stop heavy services
docker-compose stop neo4j  # If not using graph DB

# Restart with more RAM
colima stop
colima start --memory 16  # If you have more RAM available
```

### Can't SSH from MacBook

```bash
# Check Tailscale IPs
tailscale ip -4  # On both machines

# Ping Mac Mini from MacBook
ping <mac-mini-tailscale-ip>

# Check SSH is enabled on Mac Mini
sudo systemsetup -getremotelogin
```

---

## Memory Budget Reference

When creating memory-optimized docker-compose:

```yaml
services:
  postgres:
    deploy:
      resources:
        limits:
          memory: 2G  # PostgreSQL + pgvector

  neo4j:
    deploy:
      resources:
        limits:
          memory: 2G  # Graph database

  brain-api:
    deploy:
      resources:
        limits:
          memory: 1G  # Python API

  ralph-agent:
    deploy:
      resources:
        limits:
          memory: 2G  # Autonomous agent

  claude-code:
    deploy:
      resources:
        limits:
          memory: 1.5G  # CLI + MCP

  file-watcher:
    deploy:
      resources:
        limits:
          memory: 512M  # Background process

  mcp-servers:
    deploy:
      resources:
        limits:
          memory: 1G  # Multiple MCP servers

# Total: ~10GB sustained, headroom for spikes
```

---

## Common Commands

```bash
# On MacBook (Thailand/Vietnam)

# Deploy to remote
./scripts/deploy-remote.sh mac-mini

# Check status
ssh mac-mini "docker-compose ps"

# View logs
ssh mac-mini "docker-compose logs -f"

# Monitor resources
ssh mac-mini "docker stats"

# Restart service
ssh mac-mini "docker-compose restart ralph-agent"

# Update deployment
./scripts/update-remote.sh mac-mini
```

---

## Progress Tracking

Track your progress in:

- [ ] [checklist.md](checklist.md) - 143 implementation items
- [ ] [progress-log.md](progress-log.md) - Daily progress
- [ ] [status.md](status.md) - Current status

---

## Need Help?

1. **Check documentation:**
   - [work-queue.md](work-queue.md) - Detailed implementation plan
   - [notes.md](notes.md) - Q&A and decisions
   - [docs-to-read.md](docs-to-read.md) - Required reading

2. **Check existing setup:**
   - [docker-compose.yml](../../../docker-compose.yml) - Current infrastructure
   - [Brain v2.0 README](../../../9-brain/README.md) - Memory system
   - [Ralph Agent Protocol](../../../1-agents/4-specialists/ralph-agent/protocol.md) - Agent requirements

3. **Ask questions:**
   - Document in [notes.md](notes.md) with timestamp
   - We'll research and answer

---

## Remember

- This is a **critical infrastructure project** - take your time
- **Test everything** before relying on it
- **Document decisions** as you go
- **Ask for help** when stuck
- **Celebrate progress** - this is complex work!

---

**You've got this! The planning is complete. Now it's just execution.** 🚀

**When you're ready to start, begin with Phase 1 in [work-queue.md](work-queue.md).**
