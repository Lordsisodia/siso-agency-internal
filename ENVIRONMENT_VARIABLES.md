# 🔑 Environment Variables - Quick Reference

## **GLM API Key Updated**

**New Test Key:**
```
531d930091214b2a985befa0210b9185.3Mb5KI1czB84IPUb
```

**Status:** ✅ Updated in local `.env` file

---

## **🚀 Deploying to Vercel?**

### **Step 1: Update Vercel Environment Variable**

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Find `GLM_API_KEY` and update it to:
```
531d930091214b2a985befa0210b9185.3Mb5KI1czB84IPUb
```

Or add it if it doesn't exist:
- **Key:** `GLM_API_KEY`
- **Value:** `531d930091214b2a985befa0210b9185.3Mb5KI1czB84IPUb`
- **Environments:** Select All (Production, Preview, Development)

### **Step 2: Redeploy**

After updating the environment variable:
1. Go to **Deployments** in Vercel
2. Click **...** (three dots) on the latest deployment
3. Click **Redeploy**

Or push a new commit:
```bash
git add .
git commit -m "chore: update GLM API key"
git push
```

---

## **✅ Current Environment Configuration:**

### **Local Development (.env):**
```bash
GLM_API_KEY=531d930091214b2a985befa0210b9185.3Mb5KI1czB84IPUb ✅
SUPABASE_URL=https://avdgyrepwrvsvwgxrccr.supabase.co ✅
SUPABASE_ANON_KEY=eyJhbGci... ✅
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... ✅
```

### **Vercel Production:**
```bash
GLM_API_KEY=<needs update> ⚠️
SUPABASE_URL=https://avdgyrepwrvsvwgxrccr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

---

## **🧪 Testing:**

### **Local:**
```bash
# Restart dev server to pick up new key
npm run dev

# Test in browser
http://localhost:4249/lifelock?section=timebox
```

### **Production:**
After updating Vercel env var, test at:
```
https://your-app.vercel.app/lifelock?section=timebox
```

---

## **📝 Notes:**

- This is a **test key** - suitable for development
- For production, get a key from: https://open.bigmodel.cn/
- Monitor usage at your GLM dashboard
- Test keys may have rate limits

---

**Updated:** Just now! ✅
