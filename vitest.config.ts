import { defineConfig, configDefaults, mergeConfig } from 'vitest/config';
import baseViteConfig from './vite.config';

// Merge Vitest test config onto the existing Vite config so aliases, plugins, and envs work in tests.
export default mergeConfig(
  // Ensure we pass a test-like mode into the Vite config
  (baseViteConfig as any)({ mode: 'test' }),
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./tests/setup.ts'],
      include: [
        'tests/**/*.{test,spec}.{ts,tsx}',
        'src/**/*.{test,spec}.{ts,tsx}'
      ],
      exclude: [
        ...configDefaults.exclude,
        'dist/**',
        'node_modules/**'
      ],
      css: true,
      reporters: 'default'
    },
    define: {
      'import.meta.env.VITE_APP_ENV': JSON.stringify('test'),
      // Provide test-safe defaults to avoid runtime throws in providers
      'import.meta.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(process.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_stub'),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || 'http://localhost'),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || 'anon_test_key')
    }
  })
);

