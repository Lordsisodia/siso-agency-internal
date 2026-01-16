import { config } from 'dotenv';
import { resolve } from 'path';
import Groq from 'groq-sdk';

// Force reload .env
config({ path: resolve('.env') });

console.log('🔍 Testing Groq API (forced reload)...\n');
console.log('🔑 API Key:', process.env.GROQ_API_KEY?.substring(0, 15) + '...');
console.log('🔑 Full Key:', process.env.GROQ_API_KEY);

try {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  console.log('\n✅ Groq client initialized');
  console.log('📝 Testing simple chat...\n');

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'user', content: 'Say "Hello from Groq!" in exactly one sentence.' }
    ],
    max_tokens: 50,
  });

  console.log('✅ Response received!');
  console.log('📄 Content:', response.choices[0]?.message?.content || 'No content');
  console.log('\n🎉 Groq API is working!');

} catch (error) {
  console.error('\n❌ Error:', error.message);

  // Log full error details
  if (error.cause) {
    console.error('Cause:', error.cause);
  }

  process.exit(1);
}
