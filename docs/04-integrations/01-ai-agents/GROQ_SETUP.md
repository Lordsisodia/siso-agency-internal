# 🚀 Get Your Free Groq API Key

## Step 1: Create Groq Account

1. Go to: https://console.groq.com/
2. Click "Sign Up" (or sign in with GitHub/Google)
3. Verify your email

## Step 2: Get Your API Key

1. Go to: https://console.groq.com/keys
2. Click "Create Key"
3. Give it a name (e.g., "SISO Planning Assistant")
4. Copy the API key (it starts with `gsk_...`)

## Step 3: Add to .env File

Open your `.env` file and replace:

```bash
GROQ_API_KEY=your_groq_api_key_here
```

With:

```bash
GROQ_API_KEY=gsk_your_actual_key_here
```

## Step 4: Start the Server

```bash
node api/local-server.js
```

## Step 5: Test!

Open your browser to: `http://localhost:4249/admin/lifelock/daily`

Click the ✨ sparkle button and try:
- "What tasks do I have?"
- "I'm free from 9am to 5pm"
- "Schedule 2 hours of deep work in the morning"

## Why Groq?

✅ **Ultra-Fast**: Up to 500 tokens/second (instant responses!)
✅ **Free Tier**: Generous free tier for development
✅ **Powerful Models**: Llama 3.3 70B, Mixtral, Gemma
✅ **No Credit Card Needed**: Start testing immediately

## Pricing (After Free Tier)

- **Llama 3.3 70B**: $0.59 per 1M input tokens, $0.79 per 1M output tokens
- **Mixtral 8x7B**: $0.24 per 1M input tokens, $0.24 per 1M output tokens
- **Gemma 2 27B**: $0.19 per 1M input tokens, $0.19 per 1M output tokens

For comparison: That's ~10x cheaper than GPT-4 and ~5x faster!

## Need Help?

- Groq Documentation: https://console.groq.com/docs
- Model Comparison: https://groq.com/
- Status: https://status.groq.com/
