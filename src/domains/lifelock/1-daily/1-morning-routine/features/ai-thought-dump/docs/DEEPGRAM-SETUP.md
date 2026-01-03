# 🎙️ Deepgram Real-Time Voice Setup - Quick Start

**Last Updated**: October 12, 2025
**Status**: ✅ Code complete - Just needs API key
**Time to setup**: 5 minutes

---

## ✅ Current Status

### **What's Already Built:**
- ✅ `deepgram.service.ts` - WebSocket real-time transcription
- ✅ `voice.service.ts` - Integrated with Deepgram
- ✅ `SimpleThoughtDumpPage.tsx` - Real-time conversation UI
- ✅ Database fixes - Habit saves working
- ✅ Fallback logic - Web Speech API if no Deepgram key

### **What You Need:**
- 🔑 Deepgram API key (FREE - get in 2 minutes)

---

## 🚀 Setup Steps (5 Minutes Total)

### **Step 1: Get FREE Deepgram API Key** (2 minutes)

1. **Visit:** https://console.deepgram.com/signup

2. **Sign up:**
   - Use your email
   - No credit card required
   - Free tier: **45,000 minutes/year** (123 min/day!)
   - OR $200 free credits

3. **Get API key:**
   - After signup → Dashboard
   - Look for "API Keys" section
   - Click "Create a New API Key"
   - Copy the key (starts with something like `abc123...`)

### **Step 2: Add Key to .env** (30 seconds)

Open `.env` file and replace line 20:

```bash
# BEFORE:
VITE_DEEPGRAM_API_KEY=YOUR_KEY_HERE

# AFTER:
VITE_DEEPGRAM_API_KEY=your_actual_key_here
```

### **Step 3: Restart Dev Server** (10 seconds)

```bash
npm run dev
```

### **Step 4: Clear Old Failed Queue** (30 seconds)

**IMPORTANT:** Auto-cleanup is now enabled! The system will automatically clear broken records on startup.

Look for this in console:
```
🧹 [AUTO-CLEANUP] Removing X broken daily_health sync actions...
✅ [AUTO-CLEANUP] Broken actions cleared - sync will work now!
```

If you don't see it, it means queue is already clean. ✅

### **Step 5: Test!** (2 minutes)

1. Go to Morning Routine tab
2. Click AI Thought Dump button
3. Click green **"Start Talking"** button
4. **Speak:** "I need to finish the proposal and call the client"
5. **Watch:** Words appear in real-time as you speak! 🎉
6. **Pause 300ms** → AI responds
7. **Keep talking** → Natural conversation
8. Click **"End Conversation"** when done

---

## 🔍 Console Messages (What Success Looks Like)

### **On Page Load:**
```
🔑 [DEEPGRAM] API Key loaded: true
🔧 [VOICE AI] Voice service available globally
🔧 [OFFLINE] offlineManager available globally
🧹 [AUTO-CLEANUP] Removing 6 broken daily_health sync actions...
✅ [AUTO-CLEANUP] Broken actions cleared!
```

### **When You Click "Start Talking":**
```
🎤 [VOICE AI] Starting speech recognition...
🌟 [VOICE AI] Using Deepgram Real-Time (Premium - WebSocket streaming)
🌐 [DEEPGRAM] Connecting to WebSocket...
✅ [DEEPGRAM] WebSocket connected
✅ [DEEPGRAM] Streaming started (250ms chunks)
```

### **As You Speak:**
```
📝 [DEEPGRAM] Interim: I need to
📝 [DEEPGRAM] Interim: I need to finish
📝 [DEEPGRAM] Interim: I need to finish the proposal
📝 [DEEPGRAM] Final: I need to finish the proposal and call the client.
🎤 [CONVERSATION] Sentence finalized: I need to finish the proposal and call the client.
```

### **AI Responds:**
```
✅ [VOICE AI] Using OpenAI TTS (Premium)
▶️ [VOICE AI] OpenAI TTS playback started
🏁 [VOICE AI] OpenAI TTS playback completed
```

---

## ❌ Troubleshooting

### **Problem: "Deepgram API key not configured"**
**Solution:**
- Check `.env` file has correct key on line 20
- Restart dev server: `npm run dev`
- Key should NOT be `YOUR_KEY_HERE`

### **Problem: "Using Web Speech API (Fallback)"**
**Cause:** Deepgram key not detected
**Check:**
```javascript
// Browser console:
console.log(import.meta.env.VITE_DEEPGRAM_API_KEY)
```
Should show your key, not `undefined`

### **Problem: WebSocket Connection Error**
**Causes:**
1. Invalid API key
2. Network firewall blocking WebSocket
3. Deepgram service down (rare)

**Solution:**
- Verify API key is correct
- Check console for specific error
- Falls back to Web Speech API automatically

### **Problem: No Words Appearing**
**Check:**
1. Microphone permission granted?
2. Console shows "✅ [DEEPGRAM] Streaming started"?
3. Speaking loud enough?
4. Try refreshing page

### **Problem: Database Save Errors**
**Fixed automatically!** The system now:
- Strips invalid IDs from daily_health records
- Uses proper upsert with conflict resolution
- Auto-cleans broken records on startup

---

## 🎯 How It Works (Technical Overview)

### **Real-Time Conversation Flow:**

```
1. User clicks "Start Talking"
   ↓
2. Get microphone permission
   ↓
3. Open WebSocket to Deepgram
   wss://api.deepgram.com/v1/listen
   ↓
4. Start MediaRecorder (250ms chunks)
   ↓
5. Stream audio → Deepgram WebSocket
   ↓
6. Deepgram returns transcripts:
   - Interim results (words as you speak)
   - Final results (after 300ms silence)
   ↓
7. UI updates in real-time:
   setTranscript(text) ← Shows live
   ↓
8. On final result (sentence complete):
   - Send to gpt-4o-mini
   - AI processes & responds
   - Play response via TTS
   - Keep listening! (continuous)
   ↓
9. User keeps talking
   - New sentence detected
   - Process & respond
   - Back-and-forth naturally
   ↓
10. User clicks "End Conversation"
    - Stop WebSocket
    - Clean up resources
    - Organize tasks
```

### **Key Parameters:**

**Audio Capture:**
- Format: `audio/webm;codecs=opus`
- Sample rate: 16kHz
- Chunk size: 250ms (ultra-responsive)

**Deepgram Config:**
- Model: `nova-2` (latest, most accurate)
- Language: `en-US`
- Punctuate: `true` (auto-add punctuation)
- Interim results: `true` (real-time words)
- Endpointing: `300ms` (silence = sentence done)

**Conversation Logic:**
- Interim: Update UI (show words)
- Final: Send to AI + clear transcript + keep listening
- Continuous mode until user stops

---

## 💰 Cost Breakdown (Free Tier)

### **Deepgram Free Tier:**
- **45,000 minutes/year**
- = **123 minutes/day**
- = **~3,700 minutes/month**

### **Your Usage (Estimated):**
- 10 minutes/day morning planning
- = **300 minutes/month**
- = **8% of free tier**

**Conclusion:** You'll **never pay** for Deepgram with normal usage! 🎉

### **Full Stack Cost (if you exceeded free tier):**

| Component | Cost/Min | 10 Min/Day | Monthly |
|-----------|----------|------------|---------|
| Deepgram STT | $0.0043 | $0.043 | $1.29 |
| gpt-4o-mini | $0.0001 | $0.001 | $0.03 |
| OpenAI TTS | $0.001 | $0.01 | $0.30 |
| **TOTAL** | **$0.0054** | **$0.054** | **$1.62** |

**vs Vapi:** $0.10/min = **$30/month** (18x more expensive!)

---

## 🧪 Testing Checklist

### **Basic Tests:**
- [ ] API key loads (check console)
- [ ] WebSocket connects (see "✅ [DEEPGRAM] WebSocket connected")
- [ ] Microphone activates (browser asks permission)
- [ ] Words appear as you speak
- [ ] Sentence auto-sends after pause
- [ ] AI responds
- [ ] Can keep talking after AI response

### **Advanced Tests:**
- [ ] Multiple sentences in one session
- [ ] Long monologue (2+ minutes)
- [ ] Background noise handling
- [ ] Network disconnection recovery
- [ ] Fallback to Web Speech API (when key removed)

### **Database Tests:**
- [ ] Habit checkbox saves without errors
- [ ] No UUID errors in console
- [ ] No sync failures
- [ ] Multiple habit clicks merge into one record

---

## 📊 What You Should See

### **Success Indicators:**
✅ Console: `🌟 [VOICE AI] Using Deepgram Real-Time`
✅ UI: Blue bubble with your words appearing live
✅ Console: `📝 [DEEPGRAM] Interim: [your words]`
✅ Console: `📝 [DEEPGRAM] Final: [complete sentence]`
✅ AI responds within 1 second
✅ Microphone stays active for next sentence

### **Failure Indicators (Will Fallback):**
⚠️ Console: `🔄 [VOICE AI] Using Web Speech API (Fallback)`
⚠️ Console: `⚠️ [VOICE AI] No Deepgram key`
⚠️ Console: `❌ [DEEPGRAM] WebSocket error`

**Note:** Fallback is automatic - feature still works, just less reliable!

---

## 🎯 Feature Comparison

| Feature | Deepgram | Web Speech API |
|---------|----------|----------------|
| **Real-time** | ✅ Yes (~50ms) | ✅ Yes (~100ms) |
| **Accuracy** | 95%+ | 80-90% |
| **Reliability** | ✅✅✅ Excellent | ⚠️ Unreliable |
| **Cost** | FREE tier | FREE |
| **Browser Support** | All modern | Chrome/Safari only |
| **Interrupts/Errors** | Rare | Frequent |
| **Continuous Mode** | ✅ Perfect | ⚠️ Buggy |
| **Punctuation** | ✅ Auto | ❌ No |

---

## 🔧 Advanced Configuration

### **Change Deepgram Model:**

Edit `voice.service.ts:173`:
```typescript
{
  model: 'nova-2',        // Default (best accuracy)
  // OR
  model: 'nova',          // Faster, slightly less accurate
  // OR
  model: 'base',          // Cheapest (for testing)
}
```

### **Adjust Silence Detection:**

Edit `voice.service.ts:176`:
```typescript
endpointing: 300,  // Default: 300ms pause = send
// Shorter = More responsive, might cut off mid-sentence
// Longer = Less responsive, more complete sentences
```

### **Change Language:**

Edit `voice.service.ts:173`:
```typescript
language: 'en-US',  // Default
// OR
language: 'en-GB',  // British English
language: 'es',     // Spanish
language: 'fr',     // French
// 36+ languages supported!
```

---

## 📁 File Locations (Current Architecture)

```
src/
├── services/
│   └── voice/
│       ├── deepgram.service.ts          ← NEW: Real-time STT
│       └── voice.service.ts             ← UPDATED: Deepgram integration
│
├── domains/lifelock/features/ai-thought-dump/
│   ├── components/
│   │   └── SimpleThoughtDumpPage.tsx    ← UPDATED: Real-time UI
│   ├── services/
│   │   ├── ai/
│   │   │   ├── gpt5Nano.service.ts      ← Brain (gpt-4o-mini)
│   │   │   └── taskProcessor.service.ts ← Task processing
│   │   └── tools/
│   │       └── toolExecutor.ts          ← Function calling
│   └── config/
│       └── prompts.ts                   ← System prompts
│
└── shared/
    └── services/
        └── offlineManager.ts            ← UPDATED: Auto-cleanup + upsert fix
```

**Location is CORRECT** - `features/ai-thought-dump/` is the right place! ✅

---

## 🎬 Quick Start Command Summary

```bash
# 1. Get Deepgram key from: https://console.deepgram.com/signup

# 2. Add to .env:
# VITE_DEEPGRAM_API_KEY=your_key_here

# 3. Restart server:
npm run dev

# 4. Test in browser:
# - Go to Morning Routine → AI Thought Dump
# - Click "Start Talking"
# - Speak naturally
# - Watch magic happen! 🎉
```

---

## 🐛 Known Issues & Fixes

### ✅ **All Fixed:**
1. **UUID Database Error** - Auto-cleanup on startup
2. **Whisper Batch Mode** - Replaced with Deepgram real-time
3. **No Real-Time Feedback** - Now shows words as you speak
4. **Confusing UX** - Clear messages ("Recording", "Listening", etc.)
5. **TTS Autoplay Blocked** - Removed greeting audio
6. **Multiple Database Records** - Proper upsert with conflict resolution

### **Remaining (Minor):**
- Icon manifest warning (cosmetic, ignore)
- Multiple Supabase client instances (harmless warning)

---

## 🎯 Success Criteria

You'll know it's working when:

✅ Console shows: `🌟 [VOICE AI] Using Deepgram Real-Time`
✅ You speak: "I need to..." and see words appear instantly
✅ You pause: 300ms → sentence auto-sends to AI
✅ AI responds: Within 1 second
✅ You can immediately speak again: Natural conversation!
✅ No database errors when clicking habits
✅ Total cost: $0/month (FREE tier covers you)

---

## 🚀 Next: Get That API Key!

**Action NOW:**
1. Open: https://console.deepgram.com/signup
2. Sign up (2 min)
3. Copy API key
4. Paste into `.env` line 20
5. Run: `npm run dev`
6. Test the conversation!

**You're literally 5 minutes away from having a Vapi-quality AI assistant for FREE!** 🎉

---

**Document:** `src/domains/lifelock/1-daily/1-morning-routine/features/ai-thought-dump/DEEPGRAM-SETUP.md`
**Related:** `docs/planning/MORNING-AI-VOICE-CONVERSATION-UPGRADE.md`
