# Work Queue - Distributed Docker Infrastructure

**Parent:** [README.md](README.md)

---

## Phase 1: Remote Machine Setup (Mac Mini M4)

### 1.1 Initial System Configuration
- [ ] **Enable Remote Access**
  - [ ] Enable SSH: `sudo systemsetup -setremotelogin on`
  - [ ] Create SSH keys (if not exists): `ssh-keygen -t ed25519`
  - [ ] Add SSH public key to Mac Mini: `~/.ssh/authorized_keys`
  - [ ] Test SSH connection from MacBook

- [ ] **Install Package Manager**
  - [ ] Install Homebrew: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
  - [ ] Verify: `brew --version`

- [ ] **Install Docker Runtime**
  - [ ] Choose approach:
    - **Option A:** Colima (recommended, lighter weight)
      ```bash
      brew install colima docker-compose
      colima start --cpu 8 --memory 14 --disk 100
      ```
    - **Option B:** Docker Desktop for Mac
      ```bash
      brew install --cask docker
      # Configure in GUI: 14GB RAM, 8 CPU
      ```
  - [ ] Verify: `docker info`
  - [ ] Verify: `docker-compose --version`

### 1.2 Network Setup
- [ ] **Install Tailscale** (recommended for easier access)
  - [ ] Install: `brew install tailscale`
  - [ ] Start: `sudo tailscale up`
  - [ ] Get Tailscale IP: `tailscale ip -4`
  - [ ] Test from MacBook: `ssh <tailscale-ip>`

- [ ] **Alternative: SSH Tunneling** (if not using Tailscale)
  - [ ] Configure port forwarding script
  - [ ] Test tunnel stability

### 1.3 Repository Setup
- [ ] **Clone Codebase**
  - [ ] `git clone <repo-url> ~/SISO-INTERNAL`
  - [ ] `cd ~/SISO-INTERNAL`
  - [ ] Install dependencies: `npm install`
  - [ ] Verify git access

---

## Phase 2: Memory-Optimized Docker Configuration

### 2.1 Create Docker Compose Files
- [ ] **Memory-Optimized Base Configuration**
  - [ ] Create `docker-compose.memory-optimized.yml`
  - [ ] Configure resource limits for all services
  - [ ] Set memory limits based on 14GB budget
  - [ ] Test: `docker-compose config`

- [ ] **Service-Specific Configurations**
  - [ ] PostgreSQL: 2GB limit, tuned parameters
  - [ ] Neo4j: 2GB limit, heap configuration
  - [ ] Brain API: 1GB limit
  - [ ] Ralph Agent: 2GB limit
  - [ ] Claude Code Runtime: 1.5GB limit
  - [ ] File Watcher: 512MB limit
  - [ ] MCP Servers: 1GB combined limit

### 2.2 Dockerfile Creation
- [ ] **Ralph Agent Container**
  - [ ] Create `.blackbox/docker/ralph-agent/Dockerfile`
  - [ ] Multi-stage build for size optimization
  - [ ] Include dependencies: Python, node, Claude Code CLI
  - [ ] Test: `docker build -t ralph-agent .`

- [ ] **Claude Code Runtime Container**
  - [ ] Create `.blackbox/docker/claude-code/Dockerfile`
  - [ ] Include MCP servers
  - [ ] Volume mounts for workspace
  - [ ] Test: `docker build -t claude-code .`

- [ ] **MCP Server Containers** (optional, if isolating)
  - [ ] Supabase MCP container
  - [ ] Playwright MCP container
  - [ ] Filesystem MCP container

### 2.3 Environment Configuration
- [ ] **Create `.env` file**
  - [ ] Database credentials
  - [ ] API keys (OpenAI, Anthropic)
  - [ ] Service URLs
  - [ ] Memory limits

- [ ] **Create Secrets Management**
  - [ ] Never commit secrets to git
  - [ ] Use `.env.example` as template
  - [ ] Document secret setup

---

## Phase 3: Deployment Automation

### 3.1 Deployment Scripts
- [ ] **Main Deploy Script**
  - [ ] Create `scripts/deploy-remote.sh`
  - [ ] Accepts target host as argument
  - [ ] Copies files via rsync/scp
  - [ ] Executes remote commands via SSH
  - [ ] Provides clear success/failure feedback

- [ ] **Update Script**
  - [ ] Create `scripts/update-remote.sh`
  - [ ] Git pull on remote
  - [ ] Docker-compose rebuild
  - [ ] Graceful restart (no downtime)

- [ ] **Rollback Script**
  - [ ] Create `scripts/rollback-remote.sh`
  - [ ] Revert to previous git commit
  - [ ] Restore previous Docker images
  - [ ] Restore database backups

### 3.2 Health Check Scripts
- [ ] **System Health Monitor**
  - [ ] Create `scripts/monitor-remote.sh`
  - [ ] Check Docker container status
  - [ ] Check RAM usage
  - [ ] Check disk space
  - [ ] Check service endpoints

- [ ] **Automated Alerts**
  - [ ] Container restart notifications
  - [ ] Memory threshold alerts (>90%)
  - [ ] Disk space alerts (<10% free)
  - [ ] Service down alerts

### 3.3 Log Management
- [ ] **Log Aggregation**
  - [ ] Configure Docker logging driver
  - [ ] Create log rotation policy
  - [ ] Centralized log storage

- [ ] **Log Viewing**
  - [ ] Create `scripts/logs-remote.sh`
  - [ ] Stream logs to local machine
  - [ ] Filter by service
  - [ ] Tail specific containers

---

## Phase 4: Monitoring & Observability

### 4.1 Metrics Collection
- [ ] **Install Prometheus** (optional but recommended)
  - [ ] Deploy Prometheus container
  - [ ] Configure scrape targets
  - [ ] Export Docker metrics

- [ ] **Install Grafana** (optional but recommended)
  - [ ] Deploy Grafana container
  - [ ] Connect to Prometheus
  - [ ] Create dashboards

### 4.2 Dashboard Setup
- [ ] **Create Dashboards**
  - [ ] System resources (RAM, CPU, Disk)
  - [ ] Container status
  - [ ] Service health
  - [ ] Agent execution logs

- [ ] **Alert Rules**
  - [ ] High memory usage
  - [ ] Container crashes
  - [ ] Service unavailability
  - [ ] Disk space low

### 4.3 Simple Monitoring (Without Grafana)
- [ ] **Text-based Dashboard**
  - [ ] Create `scripts/dashboard.sh`
  - [ ] Updates every 5 seconds
  - [ ] Shows container status, RAM, logs
  - [ ] Accessible via SSH

---

## Phase 5: Testing & Validation

### 5.1 Load Testing
- [ ] **RAM Usage Validation**
  - [ ] Start all services
  - [ ] Monitor peak RAM usage
  - [ ] Verify stays under 14GB
  - [ ] Document findings

- [ ] **Stress Testing**
  - [ ] Run multiple agents simultaneously
  - [ ] Test under heavy load
  - [ ] Verify circuit breakers work
  - [ ] Document failure modes

### 5.2 Network Testing
- [ ] **Latency Testing**
  - [ ] Test SSH round-trip time
  - [ ] Test file transfer speeds
  - [ ] Test service response times
  - [ ] Document performance

- [ ] **Connection Stability**
  - [ ] Test long-running SSH connections
  - [ ] Test reconnection after network drop
  - [ ] Test Tailscale stability
  - [ ] Document issues

### 5.3 Agent Execution Testing
- [ ] **Ralph Agent Test**
  - [ ] Deploy Ralph to Mac Mini
  - [ ] Trigger autonomous loop
  - [ ] Monitor for 1 hour
  - [ ] Verify no crashes

- [ ] **Claude Code Test**
  - [ ] Execute coding task via Claude Code
  - [ ] Verify file operations work
  - [ ] Verify MCP server connectivity
  - [ ] Test from MacBook (remote)

---

## Phase 6: Documentation & Handoff

### 6.1 Documentation
- [ ] **Setup Guide**
  - [ ] Write comprehensive setup instructions
  - [ ] Include troubleshooting section
  - [ ] Add diagrams and screenshots
  - [ ] Store in `.blackbox/docs/remote-infrastructure/`

- [ ] **Runbook**
  - [ ] Daily operations checklist
  - [ ] Common procedures
  - [ ] Emergency procedures
  - [ ] Contact information

### 6.2 Handoff
- [ ] **Knowledge Transfer**
  - [ ] Document all decisions made
  - [ ] Create video walkthrough
  - [ ] Train team members

- [ ] **Maintenance Schedule**
  - [ ] Update check schedule
  - [ ] Backup schedule
  - [ ] Monitor rotation

---

## Phase 7: Optimization & Hardening

### 7.1 Performance Tuning
- [ ] **Database Tuning**
  - [ ] PostgreSQL configuration
  - [ ] Neo4j configuration
  - [ ] Connection pooling
  - [ ] Query optimization

- [ ] **Container Optimization**
  - [ ] Reduce image sizes
  - [ ] Optimize startup times
  - [ ] Resource limits fine-tuning

### 7.2 Security Hardening
- [ ] **SSH Security**
  - [ ] Key-based auth only
  - [ ] Disable password auth
  - [ ] Fail2ban configuration
  - [ ] Firewall rules

- [ ] **Docker Security**
  - [ ] User namespaces
  - [ ] Read-only filesystems
  - [ ] Drop capabilities
  - [ ] Secret management

### 7.3 Backup Strategy
- [ ] **Database Backups**
  - [ ] Automated PostgreSQL dumps
  - [ ] Neo4j backups
  - [ ] Off-site storage

- [ ] **Configuration Backups**
  - [ ] Docker volumes backup
  - [ ] Environment files backup
  - [ ] Git repository sync

---

## Dependencies

### External
- Mac Mini M4 (16GB) - **REQUIRED**
- Stable internet connection at both locations - **REQUIRED**
- Tailscale account (free tier works) - **RECOMMENDED**

### Internal
- Existing Docker setup in `.blackbox/docker-compose.yml`
- Brain v2.0 infrastructure
- Ralph Agent system
- Claude Code CLI

### Blocked By
- None (can start immediately)

### Blocking
- Production deployment of agents
- Scaling of agent operations
- 24/7 autonomous loops

---

## Estimated Timeline

| Phase | Estimated Time | Notes |
|-------|---------------|-------|
| Phase 1: Remote Setup | 2-3 hours | One-time setup |
| Phase 2: Docker Configs | 4-6 hours | Testing and tuning |
| Phase 3: Deployment | 3-4 hours | Script development |
| Phase 4: Monitoring | 2-4 hours | Optional if using simple monitoring |
| Phase 5: Testing | 4-6 hours | Thorough validation |
| Phase 6: Documentation | 2-3 hours | Writing and recording |
| Phase 7: Optimization | Ongoing | Continuous improvement |
| **Total** | **17-26 hours** | Can be done over a weekend |

---

## Next Actions

**Immediate (Today):**
1. Set up Mac Mini with SSH and Tailscale
2. Install Colima/Docker
3. Test remote access from MacBook

**This Week:**
1. Create memory-optimized docker-compose files
2. Build and test Docker images
3. Deploy initial stack to Mac Mini

**Next Week:**
1. Deploy automation scripts
2. Set up monitoring
3. Load testing and validation

---

## Questions or Blockers?

Document in [notes.md](notes.md) with timestamp and resolution.
