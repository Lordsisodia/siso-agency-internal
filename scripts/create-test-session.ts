// Script to create a test Clerk session token
// This allows automated testing without manual login

import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { createClerkClient } from '@clerk/clerk-sdk-node';

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

async function createTestSession() {
  try {
    // Try to find existing test user
    const users = await clerk.users.getUserList({
      limit: 10,
    });

    let testUser = users.data.find(u => u.emailAddresses[0]?.emailAddress === 'test@blackbox4.dev');

    // Create test user if doesn't exist
    if (!testUser) {
      testUser = await clerk.users.createUser({
        emailAddress: ['test@blackbox4.dev'],
        password: 'TestPassword123!TestPassword',
        firstName: 'Test',
        lastName: 'User',
      });
      console.log('Created test user:', testUser.id);
    }

    // Create a session token for the test user
    const token = await clerk.sessions.createSessionToken(testUser.id);

    console.log('\n=== TEST SESSION CREATED ===');
    console.log('User ID:', testUser.id);
    console.log('Email: test@blackbox4.dev');
    console.log('Session Token:', token);
    console.log('\nUse this token in your tests by setting __session cookie:\n');
    console.log(`document.cookie="__session=${token}; path=/"`);
    console.log('\nOr use in Playwright:\n');
    console.log(`await page.context().addCookies([{\n  name: '__session',\n  value: '${token}',\n  domain: 'localhost',\n  path: '/'\n}]);`);

  } catch (error) {
    console.error('Error creating test session:', error);
  }
}

createTestSession();
