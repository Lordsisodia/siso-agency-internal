# Networking Setup Guide - RustDesk + SSH Tunneling

**Purpose:** How to connect your MacBook (Thailand/Vietnam) to Mac Mini (home) for Docker infrastructure

---

## Current Situation

- ✅ You're already using **RustDesk** for remote access
- ❌ Tailscale is not set up
- ✅ Need a solution that works with your current setup

---

## Solution: RustDesk + SSH Tunneling

Since RustDesk is already working, we have **two options**:

### Option A: Use RustDesk + SSH Port Forwarding (RECOMMENDED)

**How it works:**
1. RustDesk gives you GUI access to Mac Mini
2. Open SSH tunnel through RustDesk connection
3. Access Docker services via localhost on your MacBook

**Pros:**
- ✅ Uses what you already have (RustDesk)
- ✅ No additional software needed
- ✅ Works through existing RustDesk connection
- ✅ Secure (SSH encryption)

**Cons:**
- ⚠️ Requires RustDesk to be running
- ⚠️ Need to keep SSH tunnel open
- ⚠️ Slightly more manual than Tailscale

### Option B: Switch to Tailscale (ALTERNATIVE)

**How it works:**
1. Install Tailscale on both machines
2. They connect directly over internet
3. Access Mac Mini via Tailscale IP

**Pros:**
- ✅ Zero-config networking
- ✅ More reliable than tunneling
- ✅ Works even if RustDesk is down
- ✅ Can access multiple services easily

**Cons:**
- ⚠️ Need to install new software
- ⚠️ Need to configure on both machines

---

## Option A: RustDesk + SSH Tunnel (Detailed Guide)

### Step 1: Enable SSH on Mac Mini

```bash
# On Mac Mini (via RustDesk or direct access)
sudo systemsetup -setremotelogin on
sudo systemsetup -getremotelogin  # Verify it says "On"
```

### Step 2: Find Mac Mini's Local IP

```bash
# On Mac Mini
ipconfig getifaddr en0  # Usually for WiFi
# OR
ipconfig getifaddr en1  # Usually for ethernet
```

Let's say it returns: `192.168.1.100`

### Step 3: Test SSH from MacBook

```bash
# On MacBook - connect to your local network first, or use RustDesk

# If you're on the same local network as Mac Mini:
ssh username@192.168.1.100

# If you're remote (Thailand/Vietnam), you'll need to use RustDesk's
# port forwarding feature OR set up SSH through RustDesk
```

### Step 4: Create SSH Tunnel for Docker Services

Once you have SSH access, create tunnels for the services you need:

```bash
# On MacBook - create SSH tunnel
ssh -L 5432:localhost:5432 \
    -L 7474:localhost:7474 \
    -L 7687:localhost:7687 \
    -L 8000:localhost:8000 \
    username@192.168.1.100

# Keep this terminal open!
# Now you can access services on your MacBook:
# - PostgreSQL: localhost:5432
# - Neo4j HTTP: localhost:7474
# - Neo4j Bolt: localhost:7687
# - Brain API: localhost:8000
```

### Step 5: Use SSH Config for Easy Access

Create `~/.ssh/config` on your MacBook:

```ssh-config
# ~/.ssh/config

Host mac-mini
    HostName 192.168.1.100  # Mac Mini's local IP
    User your-username
    LocalForward 5432 localhost:5432
    LocalForward 7474 localhost:7474
    LocalForward 7687 localhost:7687
    LocalForward 8000 localhost:8000
```

Now just run: `ssh mac-mini` and all ports are forwarded!

---

## Option B: RustDesk Port Forwarding (Alternative)

If RustDesk supports port forwarding, you can use it directly:

### Step 1: Check RustDesk Version

```bash
# Make sure you have the latest RustDesk
# It supports port forwarding in recent versions
```

### Step 2: Configure Port Forwarding in RustDesk

1. Open RustDesk on MacBook
2. Connect to Mac Mini
3. Look for "Port Forward" settings
4. Add forwards for ports:
   - 22 (SSH)
   - 5432 (PostgreSQL)
   - 7474 (Neo4j HTTP)
   - 7687 (Neo4j Bolt)
   - 8000 (Brain API)

### Step 3: Access via Forwarded Ports

Once configured, services are available on `localhost:` on your MacBook.

---

## Simplest Approach: Just SSH via RustDesk Terminal

Actually, the **simplest approach** is:

1. **Use RustDesk's built-in terminal** to access Mac Mini
2. **Run Docker commands directly** in that terminal
3. **No SSH tunneling needed** for basic operations

```bash
# In RustDesk terminal connected to Mac Mini:

# Check Docker status
docker ps

# View logs
docker logs -f ralph-agent

# Restart services
docker-compose restart

# Deploy updates
cd ~/SISO-INTERNAL
git pull
docker-compose up -d --build
```

**This is probably all you need!**

---

## What You Actually Need

For this project, you need to be able to:

1. **Execute commands on Mac Mini** - RustDesk terminal ✅
2. **Transfer files to Mac Mini** - RustDesk file transfer ✅
3. **View logs from Mac Mini** - RustDesk terminal ✅
4. **Restart Docker services** - RustDesk terminal ✅

**That's it!** You don't need complex networking for most operations.

---

## When You Need More (Advanced)

Only if you need to:

1. **Access databases directly from MacBook** (e.g., use pgAdmin on MacBook to connect to PostgreSQL on Mac Mini)
2. **Access APIs directly from MacBook** (e.g., call Brain API from local development)
3. **Use GUI tools that connect to remote services**

**Then** you need SSH tunneling or Tailscale.

---

## My Recommendation

### Start Simple (Phase 1)

**Just use RustDesk's built-in features:**

1. ✅ Use RustDesk **terminal** to run commands on Mac Mini
2. ✅ Use RustDesk **file transfer** to copy files
3. ✅ Use RustDesk **remote desktop** for GUI access

**This covers 90% of what you need!**

### Add SSH Tunneling Later (Phase 3+)

Only if you need direct access to databases/APIs from MacBook:

1. Enable SSH on Mac Mini
2. Create SSH config with port forwarding
3. Access services via localhost

### Consider Tailscale (Optional, Future)

If RustDesk becomes limiting:

1. Install Tailscale on both machines (5 minutes)
2. Get direct network access
3. More reliable, easier to use

---

## Updated Work Queue

I'll update the plan to:

1. **Phase 1:** Use RustDesk for initial setup (no Tailscale required)
2. **Phase 2:** Add SSH tunneling if needed
3. **Optional Phase:** Switch to Tailscale if you want better networking

---

## Quick Test

**Try this right now:**

1. Open RustDesk
2. Connect to Mac Mini
3. Open terminal in RustDesk
4. Run: `docker ps` or `docker info`

**If that works, you're all set!** No additional networking needed.

---

## Questions?

1. **Can you access Mac Mini via RustDesk right now?**
   - If yes → You can proceed with Phase 1 immediately
   - If no → Need to troubleshoot RustDesk setup

2. **Does RustDesk show a terminal/terminal feature?**
   - If yes → Use that for all Docker commands
   - If no → We'll enable SSH and tunnel through RustDesk

3. **Do you need to access databases/APIs from your MacBook directly?**
   - If no → RustDesk terminal is sufficient
   - If yes → We'll set up SSH tunneling

Let me know your answers and I'll tailor the approach!
