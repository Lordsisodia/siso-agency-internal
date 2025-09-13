import { describe, it, expect } from 'vitest';

describe('Alias resolution (smoke)', () => {
  it('imports a module via @ alias', async () => {
    const mod = await import('@/shared/utils/slugUtils');
    expect(mod).toBeDefined();
  });
});

