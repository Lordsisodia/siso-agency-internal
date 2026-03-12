import { describe, it, expect } from 'vitest';
import { helloWorld, sayHello } from '@/lib/utils/hello-world';

describe('helloWorld', () => {
  it('should return "Hello, World!" when no name is provided', () => {
    expect(helloWorld()).toBe('Hello, World!');
  });

  it('should return a greeting with the provided name', () => {
    expect(helloWorld('Claude')).toBe('Hello, Claude!');
  });

  it('should handle empty string', () => {
    expect(helloWorld('').replace('Hello, ', '').replace('!', '')).toBe('');
  });
});

describe('sayHello', () => {
  it('should log the greeting to console', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    sayHello('Test');
    expect(consoleSpy).toHaveBeenCalledWith('Hello, Test!');
    consoleSpy.mockRestore();
  });
});
