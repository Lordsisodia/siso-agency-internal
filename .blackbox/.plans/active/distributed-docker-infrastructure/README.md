# Distributed Docker Infrastructure for Blackbox4 Agents

**Plan ID:** `distributed-docker-infrastructure`
**Status:** 🟡 Planning
**Priority:** 🔴 CRITICAL
**Created:** 2025-01-17
**Owner:** SISO Internal Team

---

## Executive Summary

This plan implements a **distributed Docker infrastructure** that moves heavy agent workloads from a MacBook Pro M1 (16GB) to a remote Mac Mini M4 (16GB), enabling:

- **Always-on agent execution** without affecting local development
- **Full-stack infrastructure** running remotely (Brain v2.0, Ralph Agent, MCP servers)
- **Seamless remote access** from anywhere in the world via RustDesk/SSH
- **Memory-optimized configuration** for 16GB systems
- **Production-ready monitoring** and management tooling

**Why This Matters:**
- Frees up local MacBook RAM for development work
- Enables 24/7 autonomous agent loops
- Scales infrastructure independently of development machine
- Critical for production deployment of Blackbox4

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────────────┐
│  THAILAND/VIETNAM - MacBook Pro M1 (16GB)                       │
│  • Development workflow (VS Code, local testing)                │
│  • Access remote infrastructure via RustDesk/SSH                │
│  • View logs, monitor agents, trigger deployments               │
└─────────────────────────────────────────────────────────────────┘
                              │
                    RustDesk / SSH Tunnel
                              │
┌─────────────────────────────────────────────────────────────────┐
│  HOME - Mac Mini M4 (16GB) - Always On                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Docker Stack (via Colima/Docker Desktop):                │   │
│  │ • PostgreSQL + pgvector  (2GB RAM)                       │   │
│  │ • Neo4j                    (2GB RAM)                      │   │
│  │ • Brain API                (1GB RAM)                      │   │
│  │ • Ralph Agent              (2GB RAM)                      │   │
│  │ • Claude Code Runtime      (1.5GB RAM)                    │   │
│  │ • File Watcher             (0.5GB RAM)                    │   │
│  │ • MCP Servers              (1GB RAM)                      │   │
│  │ ────────────────────────────────────────────────────────  │   │
│  │ Total: ~10GB sustained, 14GB peak                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Status

| Component | Status | Progress | Notes |
|-----------|--------|----------|-------|
| **Planning** | 🟢 Complete | 100% | This document |
| **Docker Configs** | 🔴 Not Started | 0% | Need memory-optimized compose files |
| **Remote Setup** | 🔴 Not Started | 0% | Mac Mini configuration |
| **Networking** | 🟡 Partial | 50% | RustDesk working, SSH setup pending |
| **Deployment** | 🔴 Not Started | 0% | Automation scripts |
| **Monitoring** | 🔴 Not Started | 0% | Dashboards and alerts |
| **Documentation** | 🟡 In Progress | 20% | This plan |

**Overall Progress:** 15%

---

## Success Metrics

- [ ] Mac Mini runs full Docker stack within 14GB RAM (80% utilization target)
- [ ] Can access all services from MacBook via SSH tunnel with <100ms latency
- [ ] Autonomous agent loops run 24/7 without manual intervention
- [ ] Zero manual SSH commands required for deployment (fully automated)
- [ ] Real-time monitoring dashboard accessible from MacBook
- [ ] Can deploy updates to remote infrastructure with single command
- [ ] All changes documented and version-controlled

---

## Related Documentation

- [ ] [Original Docker Setup](../../../docker-compose.yml) - Current infrastructure
- [ ] [Brain v2.0 README](../../../9-brain/README.md) - Memory system architecture
- [ ] [Ralph Agent Protocol](../../../1-agents/4-specialists/ralph-agent/protocol.md) - Autonomous agent requirements
- [ ] [Memory Requirements Analysis](docs/memory-analysis.md) - Detailed RAM planning
- [ ] [Networking Setup Guide](networking-setup-guide.md) - How to use RustDesk for remote access ⭐ NEW

---

## Navigation

- [Work Queue](work-queue.md) - Tasks breakdown
- [Checklist](checklist.md) - Implementation checklist
- [Progress Log](progress-log.md) - Daily progress tracking
- [Artifacts](artifacts.md) - Files and configurations created
- [Final Report](final-report.md) - Completion summary (when done)

---

## Next Steps

1. **Read the full plan** - Start with [work-queue.md](work-queue.md)
2. **Review requirements** - Check [success-metrics.md](success-metrics.md)
3. **Set up Mac Mini** - Follow Phase 1 in work queue
4. **Deploy infrastructure** - Follow Phase 2-4 sequentially

---

## Questions?

Refer to the [notes.md](notes.md) for Q&A and decision log.
