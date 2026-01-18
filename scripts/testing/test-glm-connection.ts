#!/usr/bin/env tsx
/**
 * Quick GLM Connection Test
 *
 * This script tests if your GLM API key is working correctly.
 *
 * Usage:
 *   npm run test:glm:connection
 *   or
 *   npx tsx scripts/test-glm-connection.ts
 */

import { GLMMCPClient } from '../src/services/mcp/glm-client';

async function testGLMConnection() {
  console.log('🔍 Testing GLM 4.0 Connection...\n');

  // Check if API key is set
  if (!process.env.GLM_API_KEY || process.env.GLM_API_KEY === 'your_glm_api_key_here') {
    console.error('❌ GLM_API_KEY is not set in .env file');
    console.log('\n📝 To fix this:');
    console.log('1. Open your .env file');
    console.log("2. Replace 'your_glm_api_key_here' with your actual GLM API key");
    console.log("3. Get your API key from: https://open.bigmodel.cn/\n");
    process.exit(1);
  }

  console.log('✅ GLM_API_KEY is set');
  console.log('🔑 API Key:', process.env.GLM_API_KEY.substring(0, 10) + '...' + '\n');

  try {
    // Initialize GLM client
    console.log('🚀 Initializing GLM client...');
    const glm = new GLMMCPClient();
    console.log('✅ GLM client initialized\n');

    // Test 1: Simple chat
    console.log('📝 Test 1: Simple Chat Completion');
    console.log('   Query: "Say hello in one sentence"');
    const response1 = await glm.chat({
      messages: [
        { role: 'user', content: 'Say hello in exactly one sentence' }
      ]
    });

    if (response1?.choices?.[0]?.message?.content) {
      console.log('✅ Response:', response1.choices[0].message.content);
    } else {
      throw new Error('No response content received');
    }
    console.log('');

    // Test 2: Task management
    console.log('📋 Test 2: Task Management Assistance');
    console.log('   Query: "Give me 2 quick productivity tips"');
    const response2 = await glm.assist({
      query: 'Give me exactly 2 quick tips for staying productive'
    });

    console.log('✅ Response:', response2.substring(0, 200) + '...');
    console.log('');

    // Test 3: Context-aware assistance
    console.log('🎯 Test 3: Context-Aware Assistance');
    console.log('   Query with SISO context...');
    const response3 = await glm.manageTasks({
      query: 'I have 2 tasks: complete a feature and review code. What should I do first?',
      context: {
        currentTasks: [
          { id: '1', title: 'Complete feature implementation', status: 'in-progress' },
          { id: '2', title: 'Review pull requests', status: 'pending' }
        ],
        domain: 'work'
      }
    });

    console.log('✅ Analysis received:', response3.analysis.substring(0, 150) + '...');
    console.log('✅ Suggestions:', response3.suggestions.length, 'suggestions provided');
    console.log('');

    console.log('🎉 All tests passed! GLM 4.0 is working correctly!\n');

    console.log('📚 Next steps:');
    console.log('   - Run the full example: npm run example:glm');
    console.log('   - Check out the documentation: src/services/mcp/README_GLM.md');
    console.log('   - Start using GLM in your SISO workflows!\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);

    if (error.message.includes('401') || error.message.includes('authentication')) {
      console.log('\n🔑 Authentication failed. Please check:');
      console.log('   - Your API key is correct');
      console.log('   - The API key is active and not expired');
      console.log('   - You have sufficient quota/credits\n');
    } else if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
      console.log('\n🌐 Network error. Please check:');
      console.log('   - Your internet connection');
      console.log('   - The GLM API is accessible\n');
    }

    process.exit(1);
  }
}

// Run the test
testGLMConnection().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
