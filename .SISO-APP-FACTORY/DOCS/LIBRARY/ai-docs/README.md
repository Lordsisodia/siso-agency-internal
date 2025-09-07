# Groq API Documentation

This documentation contains comprehensive information about the Groq API for high-speed AI inference.

## Key Features

### ⚡ **High-Speed Inference**
- Ultra-low latency LLM inference
- Hardware acceleration with LPU™ (Language Processing Unit)
- Real-time streaming responses
- Groq's custom silicon architecture

### 🤖 **Supported Models**
- Mixtral-8x7B-32768
- Llama2-70B-4096
- Llama3-8B-8192
- Llama3-70B-8192
- And more cutting-edge models

### 🔄 **Streaming Support**
- Real-time response streaming
- Chunk-by-chunk delivery
- Improved user experience for interactive apps

## Quick Start

### Python SDK
```python
from groq import Groq

client = Groq(
    api_key="YOUR_GROQ_API_KEY",
)

# Basic chat completion
chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "Explain the importance of low-latency LLMs.",
        }
    ],
    model="mixtral-8x7b-32768",
)

print(chat_completion.choices[0].message.content)
```

### Streaming Example
```python
# Streaming chat completion
stream = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "Write a short poem about the ocean.",
        }
    ],
    model="mixtral-8x7b-32768",
    stream=True,
)

for chunk in stream:
    print(chunk.choices[0].delta.content, end="")
print()
```

### JavaScript SDK
```javascript
import Groq from "groq-sdk";

const groq = new Groq({
    api_key: process.env.GROQ_API_KEY,
});

async function main() {
    const chatCompletion = await groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: "Explain the importance of low-latency LLMs.",
            }
        ],
        model: "mixtral-8x7b-32768",
    });

    console.log(chatCompletion.choices[0]?.message?.content || "");
}

main();
```

## API Endpoints

### Chat Completions
```
POST https://api.groq.com/openai/v1/chat/completions
```

**Parameters:**
- `model` (required): Model ID (e.g., "mixtral-8x7b-32768")
- `messages` (required): Array of message objects
- `temperature`: Controls randomness (0-2)
- `max_tokens`: Maximum tokens to generate
- `stream`: Enable streaming responses
- `top_p`: Nucleus sampling parameter
- `stop`: Stop sequences

**Response:**
```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1697351490,
  "model": "mixtral-8x7b-32768",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Response text here..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 24,
    "completion_tokens": 38,
    "total_tokens": 62
  }
}
```

## Use Cases

- **Real-time Chat Applications**
- **Code Generation & Assistance**
- **Content Creation**
- **Interactive AI Agents**
- **Low-latency API Services**

## Best Practices

1. **Use Streaming** for better user experience
2. **Set appropriate max_tokens** to control costs
3. **Handle rate limits** gracefully
4. **Implement proper error handling**
5. **Cache responses** when appropriate

Last Updated: August 2025
Source: Context7 MCP - /groq/groq-api-cookbook