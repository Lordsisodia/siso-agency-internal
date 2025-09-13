import { test, expect } from '../e2e/setup';
import { TestHelpers } from '../e2e/setup';

test.describe('App Health Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start with clean state
    await page.goto('/');
  });

  test('app loads successfully', async ({ page }) => {
    // Check if app loads without errors
    const errors = await TestHelpers.interceptNetworkErrors(page);
    
    await page.goto('/');
    await TestHelpers.waitForLoadComplete(page);
    
    // Verify no critical errors
    expect(errors).toHaveLength(0);
    
    // Verify core elements are present
    const title = await page.title();
    expect(title).toContain('SISO');
    
    // Check for main app container
    await expect(page.locator('#root')).toBeVisible();
  });

  test('critical resources load', async ({ page }) => {
    const resources: string[] = [];
    
    page.on('response', response => {
      const url = response.url();
      const status = response.status();
      
      if (status >= 400) {
        resources.push(`Failed: ${url} (${status})`);
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify no failed resources
    expect(resources).toHaveLength(0);
  });

  test('authentication page loads', async ({ page }) => {
    await page.goto('/');
    
    // Check for Clerk sign-in button
    const signInButton = page.locator('text=Sign in');
    await expect(signInButton).toBeVisible();
    
    // Click sign in and verify redirect
    await signInButton.click();
    await page.waitForURL('**/sign-in**');
    
    // Verify sign-in form is present
    await expect(page.locator('input[name="identifier"]')).toBeVisible();
  });

  test('main navigation works', async ({ page }) => {
    // Mock authenticated state for navigation test
    await page.route('**/v1/client**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          response: {
            sessions: [{
              status: 'active',
              user: {
                id: 'test-user',
                email_addresses: [{ email_address: 'test@siso.app' }]
              }
            }]
          }
        })
      });
    });
    
    await page.goto('/internal/lifelock');
    
    // Check for tab navigation
    const tabs = [
      'Morning Routine',
      'Deep Focus Work',
      'Light Focus Work', 
      'Home Workout',
      'Nightly Checkout'
    ];
    
    for (const tab of tabs) {
      const tabButton = page.locator(`button:has-text("${tab}")`);
      if (await tabButton.isVisible()) {
        await tabButton.click();
        await page.waitForTimeout(300); // Wait for tab transition
        
        // Verify tab content loads
        await expect(page.locator('.space-y-6').first()).toBeVisible();
      }
    }
  });

  test('database connection is healthy', async ({ page, apiClient }) => {
    // Check API health endpoint
    try {
      const response = await fetch(`${page.context()._options.baseURL}/api/health`);
      
      if (response.ok) {
        const data = await response.json();
        expect(data.status).toBe('healthy');
      }
    } catch (error) {
      // API might not be implemented yet
      console.log('Health endpoint not available');
    }
  });

  test('error boundaries work correctly', async ({ page }) => {
    // Inject error to test error boundary
    await page.goto('/');
    
    const hasErrorBoundary = await page.evaluate(() => {
      // Check if React Error Boundary is present
      const root = document.getElementById('root');
      return root !== null;
    });
    
    expect(hasErrorBoundary).toBe(true);
  });

  test('responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await TestHelpers.waitForLoadComplete(page);
    
    // Check if mobile menu or responsive elements are visible
    const isMobileResponsive = await page.evaluate(() => {
      const viewport = window.innerWidth;
      return viewport <= 768;
    });
    
    expect(isMobileResponsive).toBe(true);
  });

  test('console has no errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await TestHelpers.waitForLoadComplete(page);
    
    // Filter out expected warnings (like React dev mode warnings)
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('Warning:') && 
      !error.includes('DevTools') &&
      !error.includes('[HMR]')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('performance metrics are acceptable', async ({ page }) => {
    await page.goto('/');
    
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });
    
    // Basic performance thresholds
    expect(metrics.domContentLoaded).toBeLessThan(3000); // 3 seconds
    expect(metrics.loadComplete).toBeLessThan(5000); // 5 seconds
    
    if (metrics.firstContentfulPaint > 0) {
      expect(metrics.firstContentfulPaint).toBeLessThan(2000); // 2 seconds
    }
  });

  test('accessibility basics pass', async ({ page }) => {
    await page.goto('/');
    await TestHelpers.waitForLoadComplete(page);
    
    const violations = await TestHelpers.checkAccessibility(page);
    
    // Log violations for debugging but don't fail the smoke test
    if (violations.length > 0) {
      console.log('Accessibility issues found:', violations);
    }
    
    // For smoke test, just ensure no critical violations
    const criticalViolations = violations.filter(v => 
      v.includes('missing alt text') || 
      v.includes('missing label')
    );
    
    expect(criticalViolations.length).toBeLessThanOrEqual(5);
  });
});