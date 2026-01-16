import 'dotenv/config';
import Groq from 'groq-sdk';

console.log('🔍 Testing Groq API...\n');
console.log('🔑 API Key:', process.env.GROQ_API_KEY?.substring(0, 10) + '...');

try {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  console.log('✅ Groq client initialized\n');
  console.log('📝 Testing simple chat...');

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
  if (error.message.includes('401') || error.message.includes('invalid_api_key')) {
    console.error('\n🔑 API Key Issue!');
    console.error('Please check:');
    console.error('1. The API key is correct');
    console.error('2. The key starts with "gsk_"');
    console.error('3. The key is active at https://console.groq.com/keys\n');
  }
  process.exit(1);
}
