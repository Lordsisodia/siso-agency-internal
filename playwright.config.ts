import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : '50%',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results.json' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },
  
  projects: [
    // Smoke tests - critical path validation
    {
      name: 'smoke',
      testDir: './tests/smoke',
      testMatch: '**/*.smoke.spec.ts',
      timeout: 20_000,
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      }
    },
    
    // E2E tests - comprehensive feature testing
    {
      name: 'e2e-chrome',
      testDir: './tests/e2e',
      testMatch: '**/*.e2e.spec.ts',
      timeout: 60_000,
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      }
    },
    
    // Mobile responsive tests
    {
      name: 'mobile',
      testDir: './tests/e2e',
      testMatch: '**/mobile/*.spec.ts',
      use: { 
        ...devices['iPhone 13'],
      }
    },
    
    // Cross-browser testing
    {
      name: 'firefox',
      testDir: './tests/e2e',
      testMatch: '**/*.e2e.spec.ts',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'safari',
      testDir: './tests/e2e',
      testMatch: '**/*.e2e.spec.ts',
      use: { ...devices['Desktop Safari'] }
    }
  ],
  
  webServer: {
    command: process.env.CI ? 'npm run build && npm run preview' : 'npm run dev',
    url: process.env.BASE_URL || 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  
  /* Configure global test settings */
  expect: {
    timeout: 10_000,
  },
});

