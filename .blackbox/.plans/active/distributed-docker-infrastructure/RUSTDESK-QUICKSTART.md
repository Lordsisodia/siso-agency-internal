# 🚀 Quick Start with RustDesk

**For users who already have RustDesk working**

---

## The Simplest Path Forward

Since RustDesk is already working for you, here's the **simplest approach**:

### Phase 1: Use RustDesk Terminal Only (No SSH needed)

**This is all you need to get started!**

#### Step 1: Connect to Mac Mini via RustDesk

1. Open RustDesk on your MacBook
2. Connect to your Mac Mini at home
3. Click the "Terminal" button in RustDesk

#### Step 2: Run Docker Commands in RustDesk Terminal

```bash
# In RustDesk terminal (connected to Mac Mini):

# Check if Docker is installed
docker --version
docker-compose --version

# If not installed, install Colima
brew install colima docker-compose

# Start Colima with 14GB RAM
colima start --cpu 8 --memory 14 --disk 100

# Verify it's working
docker info
```

#### Step 3: Clone Your Repository

```bash
# In RustDesk terminal:
cd ~
git clone <your-repo-url> SISO-INTERNAL
cd SISO-INTERNAL
```

#### Step 4: Start Docker Stack

```bash
# In RustDesk terminal:
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

**That's it!** You now have Docker running on Mac Mini, controlled via RustDesk.

---

## What You Can Do with Just RustDesk

✅ **Execute any command** on Mac Mini
✅ **Start/stop Docker services**
✅ **View logs in real-time**
✅ **Deploy code updates** (git pull + docker-compose restart)
✅ **Monitor system resources** (docker stats)
✅ **File transfer** via RustDesk's file transfer feature

**This covers 90% of what you need!**

---

## Workflow Example

### Typical Development Session

```bash
# 1. On your MacBook (local development)
code .
# Make changes to code
git commit -m "New feature"
git push

# 2. In RustDesk terminal (on Mac Mini)
cd ~/SISO-INTERNAL
git pull
docker-compose restart ralph-agent

# 3. Watch logs in RustDesk terminal
docker-compose logs -f ralph-agent
```

---

## When You Need More (SSH Tunneling)

You only need SSH tunneling if you want to:

### Use Case 1: Access Databases from MacBook

Example: Use pgAdmin on your MacBook to connect to PostgreSQL on Mac Mini

```bash
# On MacBook - create SSH tunnel (need SSH enabled first)
ssh -L 5432:localhost:5432 username@mac-mini-ip

# Now pgAdmin on MacBook connects to localhost:5432
# Which tunnels to PostgreSQL on Mac Mini
```

### Use Case 2: Access APIs from MacBook

Example: Call Brain API from local development environment

```bash
# On MacBook - create SSH tunnel
ssh -L 8000:localhost:8000 username@mac-mini-ip

# Now fetch('http://localhost:8000/api/...') on MacBook
# Goes to Brain API on Mac Mini
```

---

## How to Enable SSH (If Needed)

```bash
# On Mac Mini (via RustDesk terminal)
sudo systemsetup -setremotelogin on
sudo systemsetup -getremotelogin  # Should say "On"

# Find Mac Mini's IP
ipconfig getifaddr en0  # Or en1 for ethernet
```

Then from MacBook:

```bash
# Test SSH connection
ssh username@mac-mini-ip

# Create SSH config for easy access
nano ~/.ssh/config

# Add this:
Host mac-mini
    HostName 192.168.1.XXX  # Mac Mini's IP
    User your-username
    LocalForward 5432 localhost:5432
    LocalForward 7474 localhost:7474
    LocalForward 7687 localhost:7687
    LocalForward 8000 localhost:8000

# Save and exit (Ctrl+X, Y, Enter)

# Now just run:
ssh mac-mini
# All ports are forwarded automatically!
```

---

## Monitoring Dashboard

You can create a simple monitoring script:

```bash
# On Mac Mini, create: ~/monitor.sh
#!/bin/bash
while true; do
    clear
    echo "=== Docker Status ==="
    docker-compose ps
    echo ""
    echo "=== Resource Usage ==="
    docker stats --no-stream
    echo ""
    echo "=== Recent Logs ==="
    docker-compose logs --tail=5 ralph-agent
    sleep 5
done

chmod +x ~/monitor.sh

# Run in RustDesk terminal
./monitor.sh
```

---

## FAQ

### Q: Do I need Tailscale?

**A: No!** RustDesk is sufficient for most operations. Tailscale is only if you want more seamless networking.

### Q: Can I deploy updates from my MacBook?

**A: Yes!** Just:
1. Push code to git
2. In RustDesk terminal: `git pull && docker-compose restart`

### Q: How do I transfer files?

**A:** Use RustDesk's file transfer feature, or:
```bash
# In RustDesk terminal:
cd ~/SISO-INTERNAL
git pull  # Easiest way!
```

### Q: What if RustDesk connection drops?

**A:** Docker keeps running on Mac Mini. Just reconnect via RustDesk and check:
```bash
docker-compose ps  # See what's running
```

### Q: Can I automate this?

**A:** Yes! Create scripts on Mac Mini:
```bash
# ~/deploy.sh
cd ~/SISO-INTERNAL
git pull
docker-compose up -d --build
docker-compose ps
```

Then in RustDesk terminal: `./deploy.sh`

---

## Summary

### You DON'T Need:
- ❌ Tailscale (RustDesk works fine)
- ❌ Complex SSH setup (for basic operations)
- ❌ Port forwarding (for basic operations)
- ❌ Static IP addresses
- ❌ Router configuration

### You DO Need:
- ✅ RustDesk (already working!)
- ✅ RustDesk terminal access
- ✅ Docker on Mac Mini (Colima)
- ✅ That's it!

---

## Next Steps

1. **Test right now:** Open RustDesk, connect to Mac Mini, open terminal
2. **Check Docker:** Run `docker --version` in RustDesk terminal
3. **Install if needed:** `brew install colima docker-compose`
4. **Start Colima:** `colima start --cpu 8 --memory 14 --disk 100`
5. **Deploy stack:** `cd ~/SISO-INTERNAL && docker-compose up -d`

**That's literally all you need to get started!**

---

## Still Confused?

Read the full [Networking Setup Guide](networking-setup-guide.md) for:
- Detailed SSH tunneling setup
- When to use SSH vs RustDesk
- Advanced networking options
- Troubleshooting tips

---

**Remember: The perfect is the enemy of the good. Start with RustDesk terminal, optimize later if needed!** 🚀
