# 🎯 Quick Start - AI Planning Assistant

## **It's Working Now!**

The Planning Assistant now automatically switches between:
- **Local dev** (localhost) → Uses client-side service
- **Production** (Vercel) → Uses serverless API

---

## **🧪 Test It Now (Local Development):**

```bash
npm run dev
```

Then:
1. Go to `http://localhost:4249/lifelock?section=timebox&subtab=morning`
2. Click the **✨ sparkle button** (bottom-right)
3. Try these messages:

```
"What tasks do I have?"
"I'm free from 9am to 5pm"
"Schedule 2 hours of deep work in the morning"
"Add a meeting from 2pm to 3pm"
```

---

## **🚀 Deploy to Vercel:**

### **1. Add Environment Variables:**

Go to **Vercel Dashboard → Settings → Environment Variables**:

```bash
GLM_API_KEY=b212e1592f9d401582181fc4bedfd34d.3UUZYyTqBF5tPDqK
SUPABASE_URL=https://avdgyrepwrvsvvwxrcc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (from your .env)
```

### **2. Deploy:**

```bash
git add .
git commit -m "feat: add AI Planning Assistant"
git push
```

### **3. Test on Production:**

Visit your Vercel URL and try the same commands!

---

## **🎨 What You Can Do:**

✅ **Plan your day** - "I'm free from 9am to 5pm"
✅ **Get task suggestions** - "What should I work on?"
✅ **Schedule deep work** - "Schedule 2 hours of deep work"
✅ **Add meetings** - "Add a meeting from 2pm to 3pm"
✅ **Voice input** - Click 🎤 and speak
✅ **Block sleep time** - "I'm sleeping from 11pm to 7am"

---

## **🎨 Color-Coded Timeblocks:**

- 🔵 **Deep Work** - Light blue
- 🟢 **Light Work** - Light green
- 🔴 **Meetings** - Red
- ⚫ **Sleep** - Black/dark
- 🟡 **Breaks** - Yellow
- ⚪ **Availability** - Gray

---

## **📚 Documentation:**

- **`LOCAL_DEV_FIX.md`** - How local/production modes work
- **`VERCEL_DEPLOYMENT_GUIDE.md`** - Full deployment guide
- **`IMPLEMENTATION_SUMMARY.md`** - Complete feature overview
- **`AI_PLANNING_ASSISTANT_SETUP.md`** - Technical stack details

---

## **🆘 Troubleshooting:**

### **"GLM_API_KEY not set"**
→ Add `GLM_API_KEY` to your `.env` file

### **"Supabase credentials not configured"**
→ Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` to `.env`

### **"API error" in production**
→ Check Vercel Dashboard → Logs for errors

---

**That's it! Start planning your day with AI! 🚀**

The Planning Assistant will:
- ✅ Read your tasks from Supabase
- ✅ Suggest optimal scheduling
- ✅ Create timeblocks automatically
- ✅ Remember conversation context
- ✅ Work with voice input

**Just click the ✨ button and start chatting!**
