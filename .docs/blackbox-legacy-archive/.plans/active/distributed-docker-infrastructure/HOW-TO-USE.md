# 🚀 HOW TO USE THE SETUP SCRIPT

## Step 1: Copy Script to Mac Mini

The script is located at:
```
.blackbox/.plans/active/distributed-docker-infrastructure/setup-mac-mini.sh
```

### Option A: Via Git (Easiest)

1. On your MacBook, commit and push the script:
```bash
git add .blackbox/.plans/active/distributed-docker-infrastructure/setup-mac-mini.sh
git commit -m "Add Mac Mini setup script"
git push
```

2. In RustDesk terminal (on Mac Mini):
```bash
cd ~/SISO-INTERNAL
git pull
ls .blackbox/.plans/active/distributed-docker-infrastructure/setup-mac-mini.sh
```

### Option B: Via RustDesk File Transfer

1. Open RustDesk on MacBook
2. Connect to Mac Mini
3. Click "File Transfer" button
4. Upload the script file to Mac Mini's home directory

---

## Step 2: Run the Script

In RustDesk terminal (on Mac Mini):

```bash
cd ~
bash setup-mac-mini.sh
```

**Or make it executable first:**

```bash
chmod +x setup-mac-mini.sh
./setup-mac-mini.sh
```

---

## Step 3: Follow the Prompts

The script will:
1. ✅ Check admin privileges
2. ✅ Install Homebrew (if needed)
3. ✅ Install Colima (Docker runtime)
4. ✅ Start Docker with 14GB RAM
5. ✅ Clone your repository
6. ✅ Start all Docker services
7. ✅ Create management scripts
8. ✅ Verify everything is working

**Just press Enter when prompted!**

---

## What You'll See

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

## After Setup Complete

You'll have these scripts ready to use:

```bash
~/start-docker.sh  # Start Docker infrastructure
~/monitor.sh       # Live monitoring dashboard
~/deploy.sh        # Deploy code updates
~/status.sh        # Check infrastructure status
```

---

## Verification

After setup, run:

```bash
~/status.sh
```

You should see:
- Colima status: "colima is running"
- Docker services: Multiple services with "Up" status
- Resource usage: Under 14GB RAM

---

## Troubleshooting

### Script won't run?
```bash
# Make it executable
chmod +x setup-mac-mini.sh

# Or run with bash
bash setup-mac-mini.sh
```

### Colima won't start?
```bash
# Stop and retry
colima stop
colima start --cpu 8 --memory 14 --disk 100
```

### Services not starting?
```bash
# Check logs
cd ~/SISO-INTERNAL
docker-compose logs
```

---

## Need Help?

Check the full plan:
```
.blackbox/.plans/active/distributed-docker-infrastructure/
```

Or read the networking guide:
```
networking-setup-guide.md
```
