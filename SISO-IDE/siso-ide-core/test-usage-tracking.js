import { trackClaudeUsage, trackSessionStart, trackSessionEnd } from './server/usageTracker.js';

// Test usage tracking with mock Claude API responses
console.log('🧪 Testing SISO IDE Usage Tracking');
console.log('==================================');

// Test 1: Track a session start
console.log('\n1. Testing session start tracking...');
const testSessionId = 'test-session-' + Date.now();
trackSessionStart(testSessionId, {
  model: 'claude-3.5-sonnet',
  projectPath: '/Users/test/my-project',
  permissionMode: 'default',
  hasMcp: true,
  resumed: false
});

// Test 2: Track Claude API usage with token data
console.log('\n2. Testing Claude API usage tracking...');

// Simulate a typical Claude CLI response with usage data
const mockClaudeResponse1 = {
  type: 'text',
  content: 'Hello! I can help you with that.',
  usage: {
    input_tokens: 25,
    output_tokens: 12,
    cache_creation_input_tokens: 0,
    cache_read_input_tokens: 0
  },
  model: 'claude-3.5-sonnet',
  session_id: testSessionId
};

trackClaudeUsage(mockClaudeResponse1, {
  sessionId: testSessionId,
  model: 'claude-3.5-sonnet',
  projectPath: '/Users/test/my-project',
  promptLength: 25,
  hasAttachments: false
});

// Test 3: Track a more expensive API call
console.log('\n3. Testing expensive API call tracking...');

const mockClaudeResponse2 = {
  type: 'text',
  content: 'Here is a detailed analysis of your code with suggestions for improvement...',
  usage: {
    input_tokens: 1250,
    output_tokens: 850,
    cache_creation_input_tokens: 200,
    cache_read_input_tokens: 100
  },
  model: 'claude-4-opus',
  session_id: testSessionId
};

trackClaudeUsage(mockClaudeResponse2, {
  sessionId: testSessionId,
  model: 'claude-4-opus',
  projectPath: '/Users/test/my-project',
  promptLength: 1250,
  hasAttachments: true
});

// Test 4: Track session end
console.log('\n4. Testing session end tracking...');
setTimeout(() => {
  trackSessionEnd(testSessionId, {
    exitCode: 0,
    duration: 45000, // 45 seconds
    reason: 'normal'
  });

  console.log('\n✅ Usage tracking tests completed!');
  console.log('\nNow check the Usage tab in SISO IDE to see real data instead of mock data.');
  console.log('Visit: http://localhost:5176/ -> Usage tab');
  
  process.exit(0);
}, 1000);