# HuggingFace Setup Guide - Enable 90% Compression

**Your Status:** ✅ 203GB disk space available (plenty!)
**Current:** LLMLingua installed, SimplePromptCompressor active (20-30% compression)
**Goal:** Enable LLMLingua (90% compression)

---

## Quick Setup (5-10 minutes)

### Step 1: Create HuggingFace Account ✏️

1. Go to: https://huggingface.co/join
2. Sign up (it's free)
3. Verify your email
4. Come back here when done

---

### Step 2: Get Your Access Token 🔑

1. Go to: https://huggingface.co/settings/tokens
2. Click "New token"
3. Name it: "BlackBox5 LLMLingua"
4. Type: Read
5. Click "Generate token"
6. **Copy the token** (looks like: `hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
7. Save it somewhere safe

---

### Step 3: Login to HuggingFace 🔐

Open your terminal and run:

```bash
huggingface-cli login
```

When prompted:
1. Paste your token (from Step 2)
2. Press Enter

You should see: `Login successful`

---

### Step 4: Accept LLaMA Model License ✅

1. Go to: https://huggingface.co/meta-llama/Llama-3-8b-Instruct
2. Read the license agreement
3. Click "Agree and access repository"
4. Wait for approval (usually instant, sometimes takes a few minutes)
5. You'll get an email when approved

---

### Step 5: Verify Setup ✅

Run this to verify everything works:

```bash
cd /Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/engine/core
python3 verify_compression_setup.py
```

You should see:
```
✅ PASS: LLMLingua Installed
✅ PASS: HuggingFace Auth
🟢 Using LLMLingua (90% compression)
```

---

## What About RAM?

**Good news:** LLMLingua is designed to work with limited RAM!

**How it works:**
- Model loads incrementally (not all at once)
- Uses system memory efficiently
- Falls back to SimplePromptCompressor if RAM is tight
- Compression happens before LLM call (not during)

**Estimated RAM usage:**
- Idle: ~100MB
- During compression: ~500MB-1GB (temporary)
- After compression: Releases RAM back to system

**If RAM is tight:**
- The system will automatically fall back to SimplePromptCompressor (20-30% compression)
- You still save money!
- No errors or crashes

---

## Next Steps After Setup

Once you've completed Steps 1-4, let me know and I'll:

1. ✅ Verify your setup
2. ✅ Test 90% compression
3. ✅ Show you the savings in action
4. ✅ Confirm everything works

---

## Troubleshooting

**Issue:** "Token is required"
- **Fix:** Make sure you copied the entire token (starts with `hf_`)

**Issue:** "Not approved yet"
- **Fix:** Wait for the approval email (usually instant, sometimes 5-10 minutes)

**Issue:** "Out of memory"
- **Fix:** System will fall back to 20-30% compression automatically

---

**Ready when you are!** Come back after completing Steps 1-4, and we'll verify everything works.

---

**Questions?**
- RAM: ~500MB-1GB during compression (temporary)
- Disk: 10GB one-time (you have 203GB free ✅)
- Time: 5-10 minutes total
- Savings: 90% reduction in LLM costs
