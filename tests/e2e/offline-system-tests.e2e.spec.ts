import { test, expect, Page } from '@playwright/test';

test.describe('🚀 SISO Offline System Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Go to the app
    await page.goto('http://localhost:5177');
    
    // Wait for app to load
    await page.waitForLoadState('networkidle');
  });

  test('should show clean status button in top-right', async ({ page }) => {
    // Check for the new clean status button
    const statusButton = page.locator('button:has-text("Synced"), button:has-text("Offline"), button:has-text("pending")');
    await expect(statusButton).toBeVisible();
    
    // Should be positioned in top-right
    const boundingBox = await statusButton.boundingBox();
    expect(boundingBox?.x).toBeGreaterThan(300); // Should be on the right side
    expect(boundingBox?.y).toBeLessThan(100); // Should be near the top
  });

  test('should expand details when status button clicked', async ({ page }) => {
    // Find and click the status button
    const statusButton = page.locator('button').first();
    await statusButton.click();
    
    // Should show details panel
    await expect(page.locator('text=Sync Status')).toBeVisible();
    
    // Should have close button
    const closeButton = page.locator('button:has-text("×")');
    await expect(closeButton).toBeVisible();
    
    // Close the panel
    await closeButton.click();
    await expect(page.locator('text=Sync Status')).not.toBeVisible();
  });

  test('should work offline - create and cache tasks', async ({ page }) => {
    // Test offline task creation
    await page.evaluate(() => {
      // Add test data to window for easy access
      window.testOfflineData = {
        task: {
          id: 'test-offline-task-' + Date.now(),
          user_id: '0e402267-17de-43a9-b54f-3756bcd24614',
          title: 'Offline Test Task',
          description: 'Created while offline',
          priority: 'HIGH',
          completed: false,
          task_date: new Date().toISOString().split('T')[0],
          original_date: new Date().toISOString().split('T')[0],
          current_task_date: new Date().toISOString().split('T')[0]
        }
      };
    });

    // Go offline
    await page.context().setOffline(true);
    
    // Verify status button shows offline
    await expect(page.locator('button:has-text("Offline")')).toBeVisible();
    
    // Test saving data while offline
    const saveResult = await page.evaluate(async () => {
      // Import the offline manager
      const { offlineManager } = await import('/src/shared/services/offlineManager.ts');
      
      // Try to save a task offline
      return await offlineManager.saveUniversal('lightWorkTasks', window.testOfflineData.task, true);
    });
    
    expect(saveResult.success).toBe(true);
    expect(saveResult.offline).toBe(true);
  });

  test('should sync when back online', async ({ page }) => {
    // Create offline data first
    await page.context().setOffline(true);
    
    await page.evaluate(async () => {
      const { offlineManager } = await import('/src/shared/services/offlineManager.ts');
      
      window.testSyncData = {
        id: 'sync-test-' + Date.now(),
        user_id: '0e402267-17de-43a9-b54f-3756bcd24614',
        title: 'Sync Test Task',
        task_date: new Date().toISOString().split('T')[0],
        original_date: new Date().toISOString().split('T')[0],
        current_task_date: new Date().toISOString().split('T')[0]
      };
      
      await offlineManager.saveUniversal('lightWorkTasks', window.testSyncData, true);
    });
    
    // Go back online
    await page.context().setOffline(false);
    
    // Wait for sync to complete
    await page.waitForTimeout(3000);
    
    // Check if status button shows synced or pending
    const statusButton = page.locator('button:has-text("Synced"), button:has-text("pending"), button:has-text("Syncing")');
    await expect(statusButton).toBeVisible();
  });

  test('should handle mobile viewport correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Status button should still be visible and clickable
    const statusButton = page.locator('button').first();
    await expect(statusButton).toBeVisible();
    
    // Click should work on mobile
    await statusButton.click();
    
    // Details panel should fit mobile screen
    const detailsPanel = page.locator('text=Sync Status').locator('..');
    await expect(detailsPanel).toBeVisible();
    
    const panelBox = await detailsPanel.boundingBox();
    expect(panelBox?.width).toBeLessThan(375); // Should fit in mobile width
  });

  test('should show PWA manifest and service worker', async ({ page }) => {
    // Check PWA manifest exists
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json');
    
    // Verify manifest content
    const manifestResponse = await page.request.get('http://localhost:5177/manifest.json');
    expect(manifestResponse.ok()).toBe(true);
    
    const manifest = await manifestResponse.json();
    expect(manifest.name).toContain('SISO');
    expect(manifest.display).toBe('standalone');
    
    // Check service worker registration
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          return !!registration;
        } catch {
          return false;
        }
      }
      return false;
    });
    
    expect(swRegistered).toBe(true);
  });

  test('should persist data through page reload', async ({ page }) => {
    // Create test data
    await page.evaluate(async () => {
      const { offlineManager } = await import('/src/shared/services/offlineManager.ts');
      
      window.persistTestData = {
        id: 'persist-test-' + Date.now(),
        user_id: '0e402267-17de-43a9-b54f-3756bcd24614',
        title: 'Persistence Test Task',
        task_date: new Date().toISOString().split('T')[0],
        original_date: new Date().toISOString().split('T')[0],
        current_task_date: new Date().toISOString().split('T')[0]
      };
      
      await offlineManager.saveUniversal('lightWorkTasks', window.persistTestData, true);
    });
    
    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check that offline manager still has the data
    const dataExists = await page.evaluate(async () => {
      const { offlineManager } = await import('/src/shared/services/offlineManager.ts');
      const stats = await offlineManager.getOfflineStats();
      return stats.database.lightWorkTasks > 0;
    });
    
    expect(dataExists).toBe(true);
  });

  test('should show correct status colors', async ({ page }) => {
    // Test online status (green)
    await page.context().setOffline(false);
    await page.waitForTimeout(1000);
    
    const onlineButton = page.locator('button:has-text("Synced")');
    if (await onlineButton.isVisible()) {
      await expect(onlineButton).toHaveClass(/bg-green-500/);
    }
    
    // Test offline status (red)
    await page.context().setOffline(true);
    await page.waitForTimeout(1000);
    
    const offlineButton = page.locator('button:has-text("Offline")');
    await expect(offlineButton).toBeVisible();
    await expect(offlineButton).toHaveClass(/bg-red-500/);
  });
});

test.describe('🚀 PWA Installation Tests', () => {
  test('should be installable as PWA on mobile', async ({ page }) => {
    // Set mobile user agent
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15');
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:5177');
    
    // Check PWA criteria
    const manifest = await page.request.get('http://localhost:5177/manifest.json');
    const manifestData = await manifest.json();
    
    expect(manifestData.name).toBeTruthy();
    expect(manifestData.short_name).toBeTruthy();
    expect(manifestData.start_url).toBeTruthy();
    expect(manifestData.display).toBe('standalone');
    expect(manifestData.icons).toBeDefined();
    expect(manifestData.icons.length).toBeGreaterThan(0);
  });
});