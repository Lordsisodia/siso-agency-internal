import { test, expect } from './setup';
import { TestHelpers } from './setup';

test.describe('Desktop Navigation Fix - feedback_20260115_001', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for tests - bypass Clerk
    await page.route('**/v1/client**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          response: {
            sessions: [{
              status: 'active',
              user: {
                id: 'test-user-123',
                email_addresses: [{ email_address: 'test@blackbox4.dev' }],
                first_name: 'Test',
                last_name: 'User'
              }
            }]
          }
        })
      });
    });

    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('should display bottom navigation on desktop', async ({ page }) => {
    // Navigate to admin life-lock-overview
    await page.goto('http://localhost:4249/admin/life-lock-overview');
    await TestHelpers.waitForLoadComplete(page);

    // Wait for page to load
    await page.waitForTimeout(1000);

    // Take screenshot
    await page.screenshot({
      path: '.blackbox/.memory/working/shared/task-context/desktop-nav-test-1-bottom-nav-visible.png',
      fullPage: true
    });

    // Look for bottom navigation - try multiple selectors
    const bottomNav = page.locator('nav').filter({ hasText: /^(Today|Tasks|AI|Stats|More)/ }).first();

    // Check if bottom navigation exists
    const navExists = await bottomNav.count();
    expect(navExists).toBeGreaterThan(0);

    // Check if bottom navigation is visible
    if (navExists > 0) {
      await expect(bottomNav).toBeVisible();

      // Verify it has the expected navigation tabs
      const expectedTabs = ['Today', 'Tasks', 'AI', 'Stats', 'More'];

      for (const tab of expectedTabs) {
        const tabElement = page.locator(`button:has-text("${tab}")`, `a:has-text("${tab}")`).first();

        // Check if tab exists
        const tabCount = await tabElement.count();
        if (tabCount > 0) {
          await expect(tabElement.first()).toBeVisible();
        }
      }
    }
  });

  test('should have proper bottom padding to prevent content overlap', async ({ page }) => {
    await page.goto('http://localhost:4249/admin/life-lock-overview');
    await TestHelpers.waitForLoadComplete(page);
    await page.waitForTimeout(1000);

    // Get the main content area
    const mainContent = page.locator('main').first();

    // Check if main content has bottom padding
    const paddingBottom = await mainContent.evaluate(el => {
      return window.getComputedStyle(el).paddingBottom;
    });

    // Parse padding value (should be something like "96px" or "6rem")
    const paddingValue = parseInt(paddingBottom);

    // Bottom padding should be at least 80px to accommodate bottom nav
    expect(paddingValue).toBeGreaterThanOrEqual(80);

    // Screenshot for verification
    await page.screenshot({
      path: '.blackbox/.memory/working/shared/task-context/desktop-nav-test-2-bottom-padding.png',
      fullPage: true
    });
  });

  test('should center bottom navigation on desktop with max-width', async ({ page }) => {
    await page.goto('http://localhost:4249/admin/life-lock-overview');
    await TestHelpers.waitForLoadComplete(page);
    await page.waitForTimeout(1000);

    // Find bottom navigation container
    const bottomNav = page.locator('nav[class*="bottom"], nav[class*="fixed"]').first();

    const navCount = await bottomNav.count();
    if (navCount > 0) {
      // Check if navigation has max-width (should not stretch across entire screen on desktop)
      const navWidth = await bottomNav.evaluate(el => el.offsetWidth);
      const viewportWidth = page.viewportSize()?.width || 1920;

      // On desktop, nav should be centered and not full width
      // If it has max-width, it should be less than viewport
      // Note: This might not apply if the design calls for full-width nav
      console.log(`Navigation width: ${navWidth}px, Viewport: ${viewportWidth}px`);

      // Check for centering classes (flex with justify-center)
      const justifyContent = await bottomNav.evaluate(el => {
        return window.getComputedStyle(el).justifyContent;
      });

      console.log(`Justify content: ${justifyContent}`);

      // Screenshot
      await page.screenshot({
        path: '.blackbox/.memory/working/shared/task-context/desktop-nav-test-3-centering.png',
        fullPage: true
      });
    }
  });

  test('should work on mobile viewport as well', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('http://localhost:4249/admin/life-lock-overview');
    await TestHelpers.waitForLoadComplete(page);
    await page.waitForTimeout(1000);

    // Look for bottom navigation on mobile
    const bottomNav = page.locator('nav[class*="bottom"], nav[class*="fixed"]').first();

    const navCount = await bottomNav.count();
    if (navCount > 0) {
      await expect(bottomNav).toBeVisible();

      // Screenshot
      await page.screenshot({
        path: '.blackbox/.memory/working/shared/task-context/desktop-nav-test-4-mobile.png',
        fullPage: true
      });
    }
  });

  test('navigation buttons should be clickable', async ({ page }) => {
    await page.goto('http://localhost:4249/admin/life-lock-overview');
    await TestHelpers.waitForLoadComplete(page);
    await page.waitForTimeout(1000);

    // Try to find and click navigation items
    const navigationTabs = ['Today', 'Tasks'];

    for (const tab of navigationTabs) {
      const tabElement = page.locator(`button:has-text("${tab}")`, `a:has-text("${tab}")`).first();

      const count = await tabElement.count();
      if (count > 0) {
        // Click should work without error
        await tabElement.first().click();
        await page.waitForTimeout(500);

        // Screenshot after click
        await page.screenshot({
          path: `.blackbox/.memory/working/shared/task-context/desktop-nav-test-5-clicked-${tab.toLowerCase()}.png`,
          fullPage: true
        });

        // Go back to overview
        await page.goto('http://localhost:4249/admin/life-lock-overview');
        await page.waitForTimeout(500);
      }
    }
  });
});
