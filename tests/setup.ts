// Vitest global test setup
// - Extend expect with jest-dom matchers
// - Provide lightweight mocks for heavy integrations

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// JSDOM-safe fetch default (tests can override per-case)
if (!(global as any).fetch) {
  (global as any).fetch = vi.fn(async () => ({ ok: true, json: async () => ({}) }));
}

// Mock Clerk in tests to avoid requiring real keys or network
vi.mock('@clerk/clerk-react', () => {
  return {
    ClerkProvider: ({ children }: any) => children,
    useUser: () => ({ user: { id: 'test-user', emailAddresses: [{ emailAddress: 'test@example.com' }], firstName: 'Test', lastName: 'User', imageUrl: '' }, isSignedIn: true, isLoaded: true })
  };
});

// Avoid noisy console errors from React Suspense/lazy during component tests
const origError = console.error;
console.error = (...args: any[]) => {
  const msg = String(args[0] || '');
  if (msg.includes('React DOM') || msg.includes('Not implemented: navigation')) return;
  origError(...args);
};

