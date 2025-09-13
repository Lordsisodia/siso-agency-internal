import { test as base, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs/promises';

// Custom fixtures for SISO Internal E2E testing
export type TestFixtures = {
  testUser: {
    email: string;
    password: string;
    name: string;
  };
  apiClient: {
    get: (endpoint: string) => Promise<any>;
    post: (endpoint: string, data: any) => Promise<any>;
    put: (endpoint: string, data: any) => Promise<any>;
    delete: (endpoint: string) => Promise<any>;
  };
  testData: {
    cleanup: () => Promise<void>;
    seed: () => Promise<void>;
  };
};

// Extend base test with custom fixtures
export const test = base.extend<TestFixtures>({
  testUser: async ({}, use) => {
    const user = {
      email: `test-${Date.now()}@siso.app`,
      password: 'Test123!@#',
      name: 'Test User'
    };
    await use(user);
  },

  apiClient: async ({ baseURL }, use) => {
    const client = {
      get: async (endpoint: string) => {
        const response = await fetch(`${baseURL}/api${endpoint}`);
        return response.json();
      },
      post: async (endpoint: string, data: any) => {
        const response = await fetch(`${baseURL}/api${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        return response.json();
      },
      put: async (endpoint: string, data: any) => {
        const response = await fetch(`${baseURL}/api${endpoint}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        return response.json();
      },
      delete: async (endpoint: string) => {
        const response = await fetch(`${baseURL}/api${endpoint}`, {
          method: 'DELETE'
        });
        return response.json();
      }
    };
    await use(client);
  },

  testData: async ({}, use) => {
    const testData = {
      cleanup: async () => {
        // Cleanup test data from database
        console.log('Cleaning up test data...');
      },
      seed: async () => {
        // Seed test data to database
        console.log('Seeding test data...');
      }
    };
    
    // Setup
    await testData.seed();
    
    // Use
    await use(testData);
    
    // Teardown
    await testData.cleanup();
  }
});

export { expect };

// Helper functions
export class TestHelpers {
  static async waitForLoadComplete(page: any) {
    await page.waitForLoadState('networkidle');
    // Wait for app to be fully loaded (adjust selector as needed)
    await page.waitForSelector('body', { state: 'visible' });
  }

  static async login(page: any, email: string, password: string) {
    await page.goto('/');
    // Using Clerk authentication flow
    await page.click('text=Sign in');
    await page.waitForURL('**/sign-in**');
    await page.fill('input[name="identifier"]', email);
    await page.click('button:has-text("Continue")');
    await page.fill('input[name="password"]', password);
    await page.click('button:has-text("Continue")');
    await page.waitForURL('/internal/lifelock');
  }

  static async logout(page: any) {
    await page.click('[data-testid="user-button"]');
    await page.click('text=Sign out');
    await page.waitForURL('/');
  }

  static async navigateToTab(page: any, tabName: string) {
    await page.click(`button:has-text("${tabName}")`);
    await page.waitForTimeout(500); // Wait for tab transition
  }

  static async fillForm(page: any, formData: Record<string, any>) {
    for (const [field, value] of Object.entries(formData)) {
      const selector = `[data-testid="${field}"], [name="${field}"], #${field}`;
      const element = await page.locator(selector).first();
      
      const tagName = await element.evaluate((el: any) => el.tagName.toLowerCase());
      const type = await element.getAttribute('type');
      
      if (type === 'checkbox') {
        if (value) await element.check();
        else await element.uncheck();
      } else if (tagName === 'select') {
        await element.selectOption(value);
      } else {
        await element.fill(value.toString());
      }
    }
  }

  static async captureScreenshot(page: any, name: string) {
    const screenshotDir = path.join(process.cwd(), 'test-screenshots');
    await fs.mkdir(screenshotDir, { recursive: true });
    await page.screenshot({ 
      path: path.join(screenshotDir, `${name}-${Date.now()}.png`),
      fullPage: true 
    });
  }

  static async checkAccessibility(page: any) {
    // Basic accessibility checks
    const violations = await page.evaluate(() => {
      const issues: string[] = [];
      
      // Check for alt text on images
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.alt && img.src) {
          issues.push(`Image missing alt text: ${img.src}`);
        }
      });
      
      // Check for form labels
      const inputs = document.querySelectorAll('input:not([type="hidden"]), select, textarea');
      inputs.forEach(input => {
        const id = input.id;
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledBy = input.getAttribute('aria-labelledby');
        
        if (id && !document.querySelector(`label[for="${id}"]`) && !ariaLabel && !ariaLabelledBy) {
          issues.push(`Input missing label: ${id || input.getAttribute('name')}`);
        }
      });
      
      // Check heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let lastLevel = 0;
      headings.forEach(heading => {
        const level = parseInt(heading.tagName[1]);
        if (lastLevel > 0 && level > lastLevel + 1) {
          issues.push(`Heading hierarchy skip: ${heading.tagName} after H${lastLevel}`);
        }
        lastLevel = level;
      });
      
      return issues;
    });
    
    return violations;
  }

  static async mockAPI(page: any, endpoint: string, response: any, status = 200) {
    await page.route(`**/api${endpoint}`, route => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }

  static async interceptNetworkErrors(page: any) {
    const errors: string[] = [];
    
    page.on('requestfailed', request => {
      errors.push(`Request failed: ${request.url()}`);
    });
    
    page.on('pageerror', error => {
      errors.push(`Page error: ${error.message}`);
    });
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(`Console error: ${msg.text()}`);
      }
    });
    
    return errors;
  }

  static async waitForToast(page: any, message: string) {
    await page.waitForSelector(`text="${message}"`, { timeout: 5000 });
  }

  static async dismissToast(page: any) {
    const toast = await page.locator('[role="alert"]').first();
    if (await toast.isVisible()) {
      const closeButton = toast.locator('button[aria-label="Close"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  async measure(page: any, name: string, fn: () => Promise<void>) {
    const start = Date.now();
    await fn();
    const duration = Date.now() - start;
    
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);
  }

  getMetrics() {
    const result: Record<string, any> = {};
    
    for (const [name, values] of this.metrics.entries()) {
      const sorted = [...values].sort((a, b) => a - b);
      result[name] = {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        count: values.length
      };
    }
    
    return result;
  }
}

// Page object pattern base class
export class BasePage {
  constructor(protected page: any) {}

  async navigateTo(path: string) {
    await this.page.goto(path);
    await TestHelpers.waitForLoadComplete(this.page);
  }

  async getTitle() {
    return await this.page.title();
  }

  async waitForElement(selector: string) {
    await this.page.waitForSelector(selector, { state: 'visible' });
  }

  async clickElement(selector: string) {
    await this.page.click(selector);
  }

  async fillInput(selector: string, value: string) {
    await this.page.fill(selector, value);
  }

  async getElementText(selector: string) {
    return await this.page.textContent(selector);
  }

  async isElementVisible(selector: string) {
    return await this.page.isVisible(selector);
  }
}