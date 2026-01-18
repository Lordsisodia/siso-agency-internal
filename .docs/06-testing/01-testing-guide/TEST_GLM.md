# 🧪 Testing GLM 4.0 Integration

## Quick Setup

1. **Add your GLM API key** to `.env` file:

   ```bash
   # Open .env and replace this line:
   GLM_API_KEY=your_glm_api_key_here

   # With your actual API key:
   GLM_API_KEY=5d3a8f9c-your-actual-api-key-here
   ```

2. **Save the .env file**

3. **Run the test:**

   ```bash
   npm run test:glm:connection
   ```

---

## What the Test Does

The connection test will verify:

✅ GLM_API_KEY is set correctly
✅ GLM client initializes
✅ Simple chat completion works
✅ Task management assistance works
✅ Context-aware queries work

---

## Expected Output

```
🔍 Testing GLM 4.0 Connection...

✅ GLM_API_KEY is set
🔑 API Key: 5d3a8f9c...

🚀 Initializing GLM client...
✅ GLM client initialized

📝 Test 1: Simple Chat Completion
   Query: "Say hello in one sentence"
✅ Response: Hello! I'm GLM, ready to assist you.

📋 Test 2: Task Management Assistance
   Query: "Give me 2 quick productivity tips"
✅ Response: Here are two quick productivity tips: ...

🎯 Test 3: Context-Aware Assistance
   Query with SISO context...
✅ Analysis received: Based on your current tasks...
✅ Suggestions: 2 suggestions provided

🎉 All tests passed! GLM 4.0 is working correctly!
```

---

## Troubleshooting

### ❌ "GLM_API_KEY is not set"

**Fix:** Add your API key to `.env`:
```bash
GLM_API_KEY=your_actual_key_here
```

### ❌ "Authentication failed"

**Fix:** Check your API key:
- Is it the correct key?
- Is it active and not expired?
- Do you have sufficient quota?

### ❌ "Network error"

**Fix:** Check your internet connection and that the GLM API is accessible.

---

## Next Steps

Once tests pass:

1. **Run the full example:**
   ```bash
   npm run example:glm
   ```

2. **Check documentation:**
   - `src/services/mcp/README_GLM.md`
   - `src/services/mcp/GLM_USAGE.md`

3. **Start using GLM in your code:**
   ```typescript
   import { GLMMCPClient } from './services/mcp/glm-client';

   const glm = new GLMMCPClient();
   const advice = await glm.manageTasks({
     query: 'Help me prioritize my tasks'
   });
   ```

---

**Ready to test!** 🚀
