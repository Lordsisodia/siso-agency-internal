# 🚀 COMPLETE SETUP GUIDE - MacBook & Mac Mini

**Read this guide completely, then follow the steps exactly!**

---

## 📋 OVERVIEW

You will:
1. **Download SISO-INTERNAL** on your MacBook
2. **Look at the code** and understand the setup
3. **Run the setup script** on Mac Mini via RustDesk
4. **Docker runs 24/7** on Mac Mini, accessible from anywhere

---

## STEP 1: Download SISO-INTERNAL on MacBook

**Open Terminal on your MacBook and run:**

```bash
# Navigate to your projects folder
cd ~/DEV/SISO-ECOSYSTEM/

# Clone the repository
git clone https://github.com/Lordsisodia/siso-agency-internal.git SISO-INTERNAL

# Go into the directory
cd SISO-INTERNAL

# Verify you have the setup files
ls -la .blackbox/.plans/active/distributed-docker-infrastructure/
```

**You should see these files:**
- `setup-mac-mini.sh` - The automated setup script
- `HOW-TO-USE.md` - How to use the script
- `README.md` - Project overview
- And other planning documents

---

## STEP 2: Look at the Code

Let's understand what the setup script does:

### 2.1: Read the Setup Script

**On your MacBook, open the file:**
```
.blackbox/.plans/active/distributed-docker-infrastructure/setup-mac-mini.sh
```

**Or view it in terminal:**
```bash
cd ~/DEV/SISO-ECOSYSTEM/SISO-INTERNAL
less .blackbox/.plans/active/distributed-docker-infrastructure/setup-mac-mini.sh
```

### 2.2: What the Script Does

The script automatically performs **11 steps**:

1. ✅ **Check admin privileges** - Ensures you can install software
2. ✅ **Install Homebrew** - Package manager for Mac (if not installed)
3. ✅ **Install Colima** - Docker runtime for Mac
4. ✅ **Start Colima** - Creates Docker VM with 14GB RAM
5. ✅ **Test Docker** - Verifies Docker works
6. ✅ **Clone repository** - Downloads your code
7. ✅ **Start Docker services** - Runs all containers
8. ✅ **Verify services** - Checks everything is running
9. ✅ **Check resources** - Ensures RAM usage is under 14GB
10. ✅ **Create management scripts** - Makes convenient commands
11. ✅ **Complete setup** - Shows success message

### 2.3: Management Scripts Created

After setup, you'll have these scripts on Mac Mini:

```bash
~/start-docker.sh  # Start Docker infrastructure
~/monitor.sh       # Live monitoring dashboard
~/deploy.sh        # Deploy code updates
~/status.sh        # Check infrastructure status
```

---

## STEP 3: Prepare Mac Mini (Via RustDesk)

### 3.1: Open RustDesk

1. **Open RustDesk** on your MacBook
2. **Connect to your Mac Mini** at home
3. Wait for the connection to establish

### 3.2: Open Terminal in RustDesk

1. Look for a **"Terminal"** button in RustDesk
2. Click it to open a terminal on Mac Mini
3. You should see a shell prompt like: `username@MacMini ~ %`

### 3.3: Verify You're Connected

**In RustDesk terminal, type:**
```bash
whoami
pwd
```

You should see your username and home directory path.

---

## STEP 4: Run the Setup Script

### 4.1: Download the Script on Mac Mini

**In RustDesk terminal (on Mac Mini), run:**

```bash
# Go to home directory
cd ~

# Clone the repository
git clone https://github.com/Lordsisodia/siso-agency-internal.git SISO-INTERNAL

# Go into the directory
cd SISO-INTERNAL

# Verify the setup script is there
ls -la .blackbox/.plans/active/distributed-docker-infrastructure/setup-mac-mini.sh
```

**You should see `setup-mac-mini.sh` listed**

### 4.2: Make the Script Executable

**In RustDesk terminal, run:**
```bash
chmod +x .blackbox/.plans/active/distributed-docker-infrastructure/setup-mac-mini.sh
```

### 4.3: Run the Setup Script

**In RustDesk terminal, run:**
```bash
bash .blackbox/.plans/active/distributed-docker-infrastructure/setup-mac-mini.sh
```

---

## 🎯 What Happens Next

### You'll See This:

```
╔════════════════════════════════════════════════════════════╗
║  🚀 MAC MINI DOCKER INFRASTRUCTURE SETUP                  ║
║  Automated Setup Script                                    ║
╚════════════════════════════════════════════════════════════╝

This script will:
  ✓ Install Homebrew (if needed)
  ✓ Install Colima (Docker runtime)
  ✓ Clone your repository
  ✓ Start Docker with 14GB RAM
  ✓ Start all Docker services
  ✓ Create management scripts

This will take 15-20 minutes. Go grab a coffee! ☕

Press Enter to continue...
```

### Press Enter and Watch the Magic!

The script will show progress like:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1/11: Checking Admin Privileges
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Admin privileges confirmed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2/11: Installing Homebrew
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ️  Installing Homebrew...
...
```

---

## 🎉 When Setup Completes

You'll see:

```
╔════════════════════════════════════════════════════════════╗
║  ✅ SETUP COMPLETE!                                      ║
╚════════════════════════════════════════════════════════════╝

🎉 Your Mac Mini Docker infrastructure is now running!

Quick Start Commands:
  ~/status.sh          - Check everything is running
  ~/monitor.sh         - View live monitoring dashboard
  ~/deploy.sh          - Deploy code updates
```

---

## ✅ Verification

### Check Everything Is Running

**In RustDesk terminal, run:**
```bash
~/status.sh
```

**You should see:**
- Colima status: "colima is running"
- Docker services: Multiple services with "Up" status
- Resource usage: Under 14GB RAM

### View Live Monitoring

**In RustDesk terminal, run:**
```bash
~/monitor.sh
```

This shows a live dashboard that updates every 5 seconds!

---

## 📚 Daily Usage

### To Check Status
```bash
~/status.sh
```

### To View Monitoring Dashboard
```bash
~/monitor.sh
```

### To Deploy Updates from MacBook

**On MacBook:**
```bash
cd ~/DEV/SISO-ECOSYSTEM/SISO-INTERNAL
# Make changes
git add .
git commit -m "Update feature"
git push
```

**On Mac Mini (via RustDesk):**
```bash
cd ~/SISO-INTERNAL
git pull
~/deploy.sh
```

### To View Logs
```bash
cd ~/SISO-INTERNAL
docker-compose logs -f
```

---

## 🆘 Troubleshooting

### Script Won't Run?
```bash
# Try with bash explicitly
bash .blackbox/.plans/active/distributed-docker-infrastructure/setup-mac-mini.sh
```

### Colima Won't Start?
```bash
colima stop
colima start --cpu 8 --memory 14 --disk 100
```

### Services Not Starting?
```bash
cd ~/SISO-INTERNAL
docker-compose logs
```

### Need to Restart Everything?
```bash
~/start-docker.sh
```

---

## 📖 Documentation

All documentation is in:
```
.blackbox/.plans/active/distributed-docker-infrastructure/
```

Key files:
- `README.md` - Project overview
- `RUSTDESK-QUICKSTART.md` - Quick start guide
- `HOW-TO-USE.md` - How to use the setup script
- `networking-setup-guide.md` - Networking options

---

## 🎯 Summary

**What You Did:**
1. ✅ Downloaded SISO-INTERNAL on MacBook
2. ✅ Looked at the code and understood the setup
3. ✅ Ran automated setup script on Mac Mini
4. ✅ Docker now runs 24/7 on Mac Mini

**What You Have Now:**
- 🚀 Mac Mini running Docker with all services
- 📊 Monitoring dashboard accessible via RustDesk
- 🔄 One-command deployment workflow
- 💪 Your MacBook freed up for development

**What's Next:**
- Use `~/monitor.sh` to watch your infrastructure
- Use `~/deploy.sh` to push updates
- Enjoy working on a fast, responsive MacBook!

---

**Remember:** Docker keeps running on Mac Mini even if you close RustDesk. It's always on!

🚀 **You're ready to go!**
