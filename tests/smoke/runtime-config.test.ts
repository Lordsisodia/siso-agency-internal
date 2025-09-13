import { describe, it, expect } from 'vitest';

describe('Runtime configuration (smoke)', () => {
  it('exposes VITE_APP_ENV in tests', () => {
    expect(import.meta.env.VITE_APP_ENV).toBe('test');
  });

  it('provides stubbed keys to avoid runtime throws', () => {
    expect(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY).toBeTruthy();
    expect(import.meta.env.VITE_SUPABASE_URL).toBeTruthy();
  });
});

