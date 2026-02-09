# Checklist - Distributed Docker Infrastructure

**Parent:** [README.md](README.md)

---

## Phase 1: Remote Machine Setup

### Initial Configuration
- [ ] SSH enabled on Mac Mini
- [ ] SSH keys generated and configured
- [ ] SSH connection tested from MacBook
- [ ] Homebrew installed on Mac Mini
- [ ] Colima installed and running
- [ ] Colima configured: 8 CPU, 14GB RAM, 100GB disk
- [ ] `docker info` returns valid output
- [ ] `docker-compose --version` confirmed

### Network Setup
- [ ] Tailscale installed on Mac Mini
- [ ] Tailscale authenticated and running
- [ ] Tailscale IP noted and saved
- [ ] Tailscale installed on MacBook
- [ ] Tailscale authenticated on MacBook
- [ ] Can ping Mac Mini via Tailscale IP
- [ ] SSH connection tested via Tailscale

### Repository Setup
- [ ] Repository cloned to Mac Mini at `~/SISO-INTERNAL`
- [ ] Can run `git pull` successfully
- [ ] Can run `git push` successfully
- [ ] npm dependencies installed
- [ ] All build scripts tested

---

## Phase 2: Docker Configuration

### Memory-Optimized Compose
- [ ] `docker-compose.memory-optimized.yml` created
- [ ] All services have memory limits set
- [ ] All services have memory reservations set
- [ ] Total memory budget: 14GB
- [ ] `docker-compose config` validates without errors
- [ ] Service dependencies configured correctly
- [ ] Health checks configured for all services
- [ ] Restart policies configured (unless-stopped)

### Service Configurations
- [ ] PostgreSQL: 2GB limit, tuned parameters
- [ ] Neo4j: 2GB limit, heap size configured
- [ ] Brain API: 1GB limit, dependencies included
- [ ] Ralph Agent: 2GB limit, all dependencies
- [ ] Claude Code Runtime: 1.5GB limit, MCP servers
- [ ] File Watcher: 512MB limit
- [ ] MCP Servers: 1GB combined limit

### Dockerfiles
- [ ] Ralph Agent Dockerfile created
- [ ] Ralph Agent image builds successfully
- [ ] Ralph Agent container runs successfully
- [ ] Claude Code Runtime Dockerfile created
- [ ] Claude Code Runtime image builds successfully
- [ ] Claude Code Runtime container runs successfully
- [ ] All images pushed to registry (optional)

### Environment Setup
- [ ] `.env.example` created with all required variables
- [ ] `.env` created on Mac Mini (not in git)
- [ ] Database credentials set
- [ ] API keys configured
- [ ] Service URLs configured
- [ ] All secrets documented in `.env.example`

---

## Phase 3: Deployment Automation

### Deployment Scripts
- [ ] `scripts/deploy-remote.sh` created
- [ ] Deploy script accepts host argument
- [ ] Deploy script copies files via rsync
- [ ] Deploy script executes remote docker-compose up
- [ ] Deploy script provides success/failure feedback
- [ ] Deploy script tested end-to-end

### Update Scripts
- [ ] `scripts/update-remote.sh` created
- [ ] Update script does git pull on remote
- [ ] Update script rebuilds containers
- [ ] Update script does graceful restart
- [ ] Update script tested end-to-end

### Rollback Scripts
- [ ] `scripts/rollback-remote.sh` created
- [ ] Rollback reverts to previous commit
- [ ] Rollback restores previous Docker images
- [ ] Rollback restores database backups
- [ ] Rollback tested end-to-end

### Health Check Scripts
- [ ] `scripts/monitor-remote.sh` created
- [ ] Monitor checks container status
- [ ] Monitor checks RAM usage
- [ ] Monitor checks disk space
- [ ] Monitor checks service endpoints
- [ ] Monitor output is readable

### Log Management
- [ ] Docker logging driver configured
- [ ] Log rotation policy configured
- [ ] `scripts/logs-remote.sh` created
- [ ] Logs can be streamed to local machine
- [ ] Logs can be filtered by service
- [ ] Logs can be tailed

---

## Phase 4: Monitoring

### Metrics Collection (Optional)
- [ ] Prometheus deployed (if using)
- [ ] Prometheus configured with scrape targets
- [ ] Prometheus collecting metrics
- [ ] Grafana deployed (if using)
- [ ] Grafana connected to Prometheus
- [ ] Dashboards created

### Simple Monitoring
- [ ] `scripts/dashboard.sh` created
- [ ] Dashboard shows container status
- [ ] Dashboard shows RAM usage
- [ ] Dashboard shows CPU usage
- [ ] Dashboard shows recent logs
- [ ] Dashboard updates automatically

### Alerts
- [ ] Container restart notifications configured
- [ ] High memory alerts configured (>90%)
- [ ] Disk space alerts configured (<10% free)
- [ ] Service down alerts configured
- [ ] Alert delivery tested

---

## Phase 5: Testing

### Load Testing
- [ ] All services started successfully
- [ ] Peak RAM usage measured and documented
- [ ] Peak RAM usage stays under 14GB
- [ ] System stable for 1+ hours under load
- [ ] Multiple agents tested simultaneously
- [ ] Circuit breakers tested and work
- [ ] Failure modes documented

### Network Testing
- [ ] SSH round-trip time measured
- [ ] File transfer speeds measured
- [ ] Service response times measured
- [ ] Long-running SSH tested (1+ hour)
- [ ] Reconnection after drop tested
- [ ] Tailscale stability tested
- [ ] All performance documented

### Agent Testing
- [ ] Ralph Agent deployed to Mac Mini
- [ ] Ralph Agent autonomous loop tested
- [ ] Ralph Agent monitored for 1+ hour
- [ ] No crashes or failures observed
- [ ] Claude Code executed remotely
- [ ] File operations tested
- [ ] MCP server connectivity tested
- [ ] All tests from MacBook (remote)

---

## Phase 6: Documentation

### Setup Guide
- [ ] Setup guide written
- [ ] Setup guide includes screenshots
- [ ] Setup guide includes diagrams
- [ ] Troubleshooting section complete
- [ ] Common errors documented
- [ ] Solutions verified
- [ ] Guide stored in `.blackbox/docs/`

### Runbook
- [ ] Daily operations checklist created
- [ ] Common procedures documented
- [ ] Emergency procedures documented
- [ ] Contact information listed
- [ ] Runbook tested by another person

### Knowledge Transfer
- [ ] All decisions documented
- [ ] Video walkthrough recorded
- [ ] Team training completed
- [ ] Questions answered

---

## Phase 7: Optimization

### Performance Tuning
- [ ] PostgreSQL configuration tuned
- [ ] Neo4j configuration tuned
- [ ] Connection pooling configured
- [ ] Queries optimized
- [ ] Container startup times optimized
- [ ] Image sizes reduced

### Security
- [ ] SSH key-only auth enabled
- [ ] SSH password auth disabled
- [ ] Fail2ban configured
- [ ] Firewall rules configured
- [ ] Docker user namespaces configured
- [ ] Docker read-only filesystems tested
- [ ] Docker capabilities dropped
- [ ] Secret management implemented

### Backups
- [ ] Automated PostgreSQL dumps configured
- [ ] Neo4j backups configured
- [ ] Docker volumes backup configured
- [ ] Environment files backup configured
- [ ] Off-site backup storage configured
- [ ] Restore procedure tested

---

## Final Validation

### System Acceptance
- [ ] All services running on Mac Mini
- [ ] RAM usage within budget (14GB)
- [ ] Can access all services from MacBook
- [ ] Deployment scripts work end-to-end
- [ ] Monitoring operational
- [ ] Alerts working
- [ ] Documentation complete
- [ ] Team trained

### Production Readiness
- [ ] Backup strategy in place
- [ ] Rollback procedure tested
- [ ] Security hardened
- [ ] Performance optimized
- [ ] Monitoring comprehensive
- [ ] Documentation complete
- [ ] Support plan in place

---

## Completion Criteria

This plan is **COMPLETE** when:

- [x] All phases have 100% checklist completion
- [x] Mac Mini runs full stack within 14GB RAM
- [x] Can deploy updates with single command from MacBook
- [x] Autonomous agents run 24/7 without intervention
- [x] Real-time monitoring accessible from MacBook
- [x] Full documentation and runbooks available
- [x] System has run stably for 7+ days
- [x] At least one successful rollback tested

**Current Progress:** 0% (0/143 items completed)

---

## Notes

- Update this checklist as you complete items
- Mark items with `[x]` when complete
- Add items if needed
- Document any deviations in [notes.md](notes.md)
