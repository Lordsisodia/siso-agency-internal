/**
 * API Testing Utilities
 * Utilities for testing AI chat assistant API integrations
 */

export interface APITestResult {
  service: string;
  success: boolean;
  responseTime: number;
  error?: string;
  data?: any;
}

export interface GroqTestResponse {
  model: string;
  response: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenAITestResponse {
  model: string;
  response: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Test Groq API integration
 */
export async function testGroqAPI(): Promise<APITestResult> {
  const startTime = Date.now();
  
  try {
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return {
        service: 'Groq',
        success: false,
        responseTime: 0,
        error: 'GROQ_API_KEY not found in environment variables'
      };
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192', // Fast model for testing
        messages: [
          {
            role: 'user',
            content: 'Hello! This is a test message. Please respond with "Groq API test successful" and nothing else.'
          }
        ],
        max_tokens: 50,
        temperature: 0.1
      })
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.text();
      return {
        service: 'Groq',
        success: false,
        responseTime,
        error: `HTTP ${response.status}: ${errorData}`
      };
    }

    const data = await response.json();
    
    return {
      service: 'Groq',
      success: true,
      responseTime,
      data: {
        model: data.model,
        response: data.choices?.[0]?.message?.content || 'No response content',
        usage: data.usage
      } as GroqTestResponse
    };
  } catch (error) {
    return {
      service: 'Groq',
      success: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test OpenAI API integration (optional)
 */
export async function testOpenAIAPI(): Promise<APITestResult> {
  const startTime = Date.now();
  
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return {
        service: 'OpenAI',
        success: false,
        responseTime: 0,
        error: 'OPENAI_API_KEY not found in environment variables'
      };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Cheapest model for testing
        messages: [
          {
            role: 'user',
            content: 'Hello! This is a test message. Please respond with "OpenAI API test successful" and nothing else.'
          }
        ],
        max_tokens: 50,
        temperature: 0.1
      })
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.text();
      return {
        service: 'OpenAI',
        success: false,
        responseTime,
        error: `HTTP ${response.status}: ${errorData}`
      };
    }

    const data = await response.json();
    
    return {
      service: 'OpenAI',
      success: true,
      responseTime,
      data: {
        model: data.model,
        response: data.choices?.[0]?.message?.content || 'No response content',
        usage: data.usage
      } as OpenAITestResponse
    };
  } catch (error) {
    return {
      service: 'OpenAI',
      success: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test Supabase database connection
 */
export async function testSupabaseConnection(): Promise<APITestResult> {
  const startTime = Date.now();
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return {
        service: 'Supabase',
        success: false,
        responseTime: 0,
        error: 'SUPABASE_URL or SUPABASE_ANON_KEY not found in environment variables'
      };
    }

    // Test basic connection by checking if we can reach the REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      }
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        service: 'Supabase',
        success: true,
        responseTime,
        data: {
          url: supabaseUrl,
          status: 'Connected successfully'
        }
      };
    } else {
      return {
        service: 'Supabase',
        success: false,
        responseTime,
        error: `HTTP ${response.status}: Failed to connect to Supabase`
      };
    }
  } catch (error) {
    return {
      service: 'Supabase',
      success: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test Web Speech API availability
 */
export async function testWebSpeechAPI(): Promise<APITestResult> {
  const startTime = Date.now();
  
  try {
    // Check if SpeechRecognition is available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      return {
        service: 'Web Speech API',
        success: false,
        responseTime: Date.now() - startTime,
        error: 'SpeechRecognition not supported in this browser'
      };
    }

    // Check if we can create a recognition instance
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    return {
      service: 'Web Speech API',
      success: true,
      responseTime: Date.now() - startTime,
      data: {
        supported: true,
        lang: recognition.lang,
        continuous: recognition.continuous,
        interimResults: recognition.interimResults
      }
    };
  } catch (error) {
    return {
      service: 'Web Speech API',
      success: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test voice processing pipeline
 */
export async function testVoiceProcessingPipeline(testText: string = "This is a test message for AI processing"): Promise<APITestResult> {
  const startTime = Date.now();
  
  try {
    // Simulate the voice → text → AI → task creation pipeline
    const groqResult = await testGroqAPI();
    
    if (!groqResult.success) {
      return {
        service: 'Voice Processing Pipeline',
        success: false,
        responseTime: Date.now() - startTime,
        error: `Groq API failed: ${groqResult.error}`
      };
    }

    // Test AI processing of voice input
    const aiResponse = await processVoiceInput(testText);
    
    return {
      service: 'Voice Processing Pipeline',
      success: true,
      responseTime: Date.now() - startTime,
      data: {
        originalText: testText,
        aiResponse: aiResponse,
        groqResponseTime: groqResult.responseTime
      }
    };
  } catch (error) {
    return {
      service: 'Voice Processing Pipeline',
      success: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Process voice input through AI
 */
async function processVoiceInput(text: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('Groq API key not available');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant for a morning routine app. Process the user\'s thoughts and provide a brief, encouraging response. If they mention tasks or goals, acknowledge them positively.'
        },
        {
          role: 'user',
          content: text
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`AI processing failed: HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No response from AI';
}

/**
 * Run all API tests
 */
export async function runAllAPITests(): Promise<APITestResult[]> {
  console.log('🧪 Running all API tests...');
  
  const tests = [
    testWebSpeechAPI(),
    testGroqAPI(),
    testOpenAIAPI(),
    testSupabaseConnection(),
    testVoiceProcessingPipeline()
  ];

  const results = await Promise.all(tests);
  
  // Log summary
  const successCount = results.filter(r => r.success).length;
  console.log(`✅ ${successCount}/${results.length} API tests passed`);
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.service}: ${result.responseTime}ms`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  return results;
}

/**
 * Generate environment setup instructions
 */
export function generateSetupInstructions(): string {
  return `
# AI Chat Assistant - Environment Setup

## Required Environment Variables

Add these to your .env.local file:

\`\`\`bash
# Groq AI API (Required)
GROQ_API_KEY=gsk_your_groq_key_here

# OpenAI API (Optional)
OPENAI_API_KEY=sk_your_openai_key_here

# Supabase Database (Required for persistence)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Enable development features
NODE_ENV=development
\`\`\`

## Getting API Keys

### 1. Groq API (Free Tier)
- Visit: https://console.groq.com/
- Sign up for free account
- Navigate to API Keys section
- Create new API key
- Free tier: 30 requests/minute

### 2. OpenAI API (Optional)
- Visit: https://platform.openai.com/
- Sign up for account
- Navigate to API Keys section
- Create new API key
- Cost: ~$0.10 per 1M input tokens

### 3. Supabase (Free Tier)
- Visit: https://supabase.com/
- Create new project
- Go to Settings > API
- Copy Project URL and anon public key
- Free tier: 50,000 monthly active users

## Testing Commands

\`\`\`bash
# Run all API tests
npm run test:api

# Run individual tests
npm run test:groq
npm run test:openai
npm run test:supabase
npm run test:voice
\`\`\`
`;
}

// Type declarations for global objects
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}