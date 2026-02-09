# Notes - Distributed Docker Infrastructure

**Parent:** [README.md](README.md)

---

## Purpose

This document captures Q&A, decisions, random thoughts, and ideas throughout the project. It's the working notebook for the distributed infrastructure setup.

---

## Project Log

### 2025-01-17 - Initial Planning

**Context:**
- User has MacBook Pro M1 (16GB) in Thailand/Vietnam
- User has Mac Mini M4 (16GB) at home sitting idle
- Need to run heavy agent infrastructure without affecting local development
- Current Docker stack (PostgreSQL, Neo4j, Brain API, etc.) takes 8-12GB RAM
- Want to add Ralph Agent, Claude Code Runtime, and MCP servers

**Decision Made:**
- ✅ Proceed with distributed Docker infrastructure on Mac Mini
- ✅ Use Tailscale for easy remote access
- ✅ Memory budget: 14GB (leaving 2GB for OS)
- ✅ Use Colima for Docker runtime on Mac Mini (lighter than Docker Desktop)

**Questions Raised:**
1. *What about network latency between Thailand/Vietnam and home?*
   - **Answer:** SSH/Tailscale should be < 100ms if both have good internet. Will measure and document.

2. *What if Mac Mini loses power or internet?*
   - **Answer:** Document in runbook. System should auto-restart on boot. Consider UPS for power backup.

3. *Can we run this entirely in the cloud instead?*
   - **Answer:** Yes, but costs money. Using existing hardware is $0. Document cloud migration path for future.

4. *What about backups?*
   - **Answer:** Will implement automated database backups to cloud storage (Backblaze B2, etc.)

**Next Actions:**
1. Set up Mac Mini with SSH and Tailscale
2. Install Colima/Docker
3. Create memory-optimized docker-compose files
4. Test RAM usage with all services running

---

## Architecture Decisions

### Docker Runtime Choice

**Options Considered:**
1. Docker Desktop for Mac
   - ✅ Official, well-supported
   - ✅ Nice GUI for management
   - ❌ Heavier resource usage
   - ❌ Commercial license may cost money eventually

2. Colima (Container Linux on Mac)
   - ✅ Lightweight
   - ✅ Free and open source
   - ✅ CLI-based (good for remote)
   - ❌ Less GUI support
   - ❌ Newer project

**Decision:** Colima
**Rationale:** Lighter weight, better for headless Mac Mini, free, sufficient for our needs

**Configuration:**
```bash
colima start --cpu 8 --memory 14 --disk 100
```

### Network Access Choice

**Options Considered:**
1. Direct SSH over internet
   - ✅ Simple, no extra software
   - ❌ Requires port forwarding (security risk)
   - ❌ IP changes (dynamic DNS needed)

2. SSH Tunneling
   - ✅ Secure
   - ❌ Manual setup each time
   - ❌ Can be unstable

3. Tailscale
   - ✅ Zero-config networking
   - ✅ Works everywhere, even behind NAT
   - ✅ Built-in encryption
   - ✅ No port forwarding needed
   - ❌ Requires third-party service (but free tier is generous)

**Decision:** Tailscale
**Rationale:** Easiest setup, most reliable, works from anywhere, free for personal use

**Configuration:**
```bash
# On both machines
brew install tailscale
sudo tailscale up
```

### Memory Allocation Strategy

**Total Budget:** 14GB (out of 16GB)

**Rationale:**
- macOS needs ~1-2GB for itself
- Docker overhead ~500MB
- Leaves headroom for spikes

**Allocation:**
| Service | Allocation | Rationale |
|---------|------------|-----------|
| PostgreSQL + pgvector | 2GB | pgvector needs RAM for embeddings |
| Neo4j | 2GB | Graph DB, cache-heavy |
| Brain API | 1GB | Python API, ML models |
| Ralph Agent | 2GB | Autonomous agent, LLM calls |
| Claude Code Runtime | 1.5GB | CLI + MCP servers |
| File Watcher | 0.5GB | Background process |
| MCP Servers | 1GB | Multiple services |
| **Total** | **12GB** | 2GB headroom remaining |

**Contingency:** If we exceed budget, we can:
1. Disable Neo4j (if not using graph features)
2. Reduce pgvector cache size
3. Run fewer agents simultaneously
4. Move to cloud (last resort)

---

## Technical Notes

### Docker Compose Structure

```yaml
# docker-compose.memory-optimized.yml
version: '3.8'

services:
  postgres:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 512M
    environment:
      - POSTGRES_SHARED_BUFFERS=256MB
      - POSTGRES_WORK_MEM=32MB

  neo4j:
    deploy:
      resources:
        limits:
          memory: 2G
    environment:
      - NEO4J_dbms_memory_heap_max__size=512m
```

### SSH Access Pattern

```bash
# From MacBook (Thailand/Vietnam)
ssh mac-mini-tailscale-ip

# Or with tunneling for specific ports
ssh -L 5432:localhost:5432 \
    -L 7474:localhost:7474 \
    -L 8000:localhost:8000 \
    mac-mini-tailscale-ip
```

### Deployment Pattern

```bash
# From MacBook
./scripts/deploy-remote.sh mac-mini

# What it does:
# 1. Git push to remote
# 2. SSH to remote
# 3. Git pull
# 4. docker-compose build
# 5. docker-compose up -d
# 6. Health check
```

---

## Ideas & Future Enhancements

### Short-term (This Project)
- [ ] Automated backups to cloud storage
- [ ] Log aggregation and search
- [ ] Metrics dashboard (Grafana?)
- [ ] Alert system (email/slack)
- [ ] Automatic restart on boot

### Medium-term (Next Quarter)
- [ ] Multiple environment support (dev, staging, prod)
- [ ] Blue-green deployments
- [ ] Load balancing for agents
- [ ] Automatic scaling based on load
- [ ] CI/CD integration

### Long-term (Future)
- [ ] Cloud migration path (AWS/GCP)
- [ ] Kubernetes orchestration
- [ ] Multi-region deployment
- [ ] Edge computing (agents closer to users)
- [ ] GPU support for ML workloads

---

## Risks & Mitigations

### Risk 1: Internet Connection Loss at Home

**Impact:** High - Cannot access infrastructure
**Probability:** Medium - Power outages, ISP issues

**Mitigation:**
- UPS for Mac Mini (4+ hours battery)
- Cellular backup (iPhone hotspot)
- Automatic restart when connection restored
- Document recovery procedures

### Risk 2: Memory Exceeded

**Impact:** High - System unstable, OOM kills
**Probability:** Low - We're budgeting conservatively

**Mitigation:**
- Extensive testing before going "live"
- Resource limits on all containers
- Monitoring and alerts
- Quick rollback procedure
- Cloud migration path documented

### Risk 3: Security Breach

**Impact:** High - Data loss, unauthorized access
**Probability:** Low - Using best practices

**Mitigation:**
- SSH key-only auth
- Disable password authentication
- Fail2ban for brute force protection
- Regular security updates
- Firewall rules
- Secret management (never commit secrets)
- Regular security audits

### Risk 4: Data Loss

**Impact:** Critical - Irretrievable data
**Probability:** Low - Multiple safeguards

**Mitigation:**
- Automated daily backups
- Off-site backup storage
- Regular restore testing
- Database replication (future)
- Document recovery procedures

---

## References

### Useful Commands

```bash
# Check Docker stats
docker stats --no-stream

# Check container logs
docker logs -f <container-name>

# Restart specific service
docker-compose restart <service-name>

# Rebuild and restart
docker-compose up -d --build <service-name>

# SSH tunnel for specific ports
ssh -L <local-port>:localhost:<remote-port> <host>

# Tailscale status
tailscale status

# Tailscale IP
tailscale ip -4

# Colima status
colima status

# Colima restart with different config
colima stop
colima start --cpu 8 --memory 14 --disk 100
```

### Useful Links

- [Colima Documentation](https://github.com/abiosoft/colima)
- [Tailscale Documentation](https://tailscale.com/kb/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Resource Constraints](https://docs.docker.com/config/containers/resource_constraints/)

---

## Random Thoughts

> "The best infrastructure is infrastructure you don't have to think about. If it works reliably and silently, we've succeeded."

> "Distributed systems are hard. Adding network latency to the mix makes it harder. But the freedom of having a local development machine that's actually responsive? Worth it."

> "The Mac Mini M4 is a beast. 16GB is tight but doable. We're pushing the limits, but that's where the interesting stuff happens."

> "Tailscale is magic. Seriously. Zero-config VPN that just works? I wish all software was this polished."

---

## Meeting Notes

### Planning Meeting - 2025-01-17

**Attendees:** SISO Internal Team
**Duration:** 30 minutes

**Agenda:**
1. Should we do distributed infrastructure?
2. What are the alternatives?
3. What's the timeline?

**Outcomes:**
- ✅ Approved to proceed with Mac Mini approach
- ✅ Tailscale selected for networking
- ✅ Colima selected for Docker runtime
- ✅ Target: 2-3 weeks to completion

**Action Items:**
1. Create this plan document ✅
2. Set up Mac Mini with SSH and Tailscale
3. Create memory-optimized docker-compose files
4. Test RAM usage

**Next Meeting:** After Phase 2 completion

---

## Questions & Answers

### Q: Why not just use cloud services?

**A:** Cost. Running equivalent infrastructure in cloud would cost $50-100/month. Using existing Mac Mini is $0. Plus, we own the data and have full control.

### Q: What if we need more than 16GB RAM?

**A:** Options:
1. Upgrade Mac Mini to 24GB or 32GB (M4 supports up to 32GB)
2. Offload some services to cloud (e.g., Neo4j)
3. Optimize current setup (reduce cache sizes, etc.)

### Q: Can we run this on a cheaper machine?

**A:** Maybe. M4 is very efficient. An Intel Mac Mini might work but would be slower and use more power. An old laptop would work too but might be less reliable. M4 Mac Mini with 16GB is the sweet spot.

### Q: What about power consumption?

**A:** M4 Mac Mini is very efficient. Idle power is ~5W, under load maybe ~20-30W. At $0.20/kWh, that's $3-5/month. Negligible.

### Q: Can we run multiple Mac Minis?

**A:** Yes! Could have one for databases, one for agents, one for testing. Docker Swarm or Kubernetes would make this easier. Future enhancement.

---

## Decision Log

| Date | Decision | Rationale | Status |
|------|----------|-----------|--------|
| 2025-01-17 | Use Mac Mini M4 for remote infrastructure | Existing hardware, $0 cost, sufficient RAM | ✅ Implemented |
| 2025-01-17 | Use Colima for Docker runtime | Lightweight, free, CLI-based | 🟡 To be done |
| 2025-01-17 | Use Tailscale for networking | Zero-config, reliable, secure | 🟡 To be done |
| 2025-01-17 | Memory budget: 14GB | Leaves 2GB for macOS and overhead | 🟡 To be validated |

---

## Template for New Notes

```
### DATE - Title

**Context:**
[Brief description of situation]

**Decision Made:**
- [ ] Item 1

**Questions Raised:**
1. *Question?*
   - **Answer:** Response

**Next Actions:**
1. Action item 1
2. Action item 2
```
