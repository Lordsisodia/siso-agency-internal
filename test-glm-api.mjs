import 'dotenv/config';
import { ZhipuAI } from 'zhipuai-sdk-nodejs-v4';

console.log('🔍 Testing GLM API Connection...\n');
console.log('🔑 API Key:', process.env.GLM_API_KEY?.substring(0, 15) + '...');

if (!process.env.GLM_API_KEY) {
  console.error('❌ GLM_API_KEY is not set');
  process.exit(1);
}

try {
  const client = new ZhipuAI({
    apiKey: process.env.GLM_API_KEY,
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
  });

  console.log('✅ GLM client initialized\n');
  console.log('📝 Testing simple chat...');

  const response = await client.createCompletions({
    model: 'glm-4-plus',
    messages: [
      { role: 'user', content: 'Say "Hello from GLM!" in exactly one sentence.' }
    ],
    temperature: 0.7,
    maxTokens: 50,
  });

  console.log('✅ Response received!');
  console.log('📄 Content:', response.choices[0]?.message?.content || 'No content');
  console.log('\n🎉 GLM API is working!');

} catch (error) {
  console.error('\n❌ Error:', error.message);
  if (error.error) {
    console.error('   Details:', JSON.stringify(error.error, null, 2));
  }
  process.exit(1);
}
