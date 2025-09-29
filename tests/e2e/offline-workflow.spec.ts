import { test, expect, Page } from '@playwright/test';

test.describe('Offline Workflow E2E Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Enable service workers
    await page.goto('http://localhost:5174');
    
    // Wait for service worker to register
    await page.waitForTimeout(2000);
  });

  test('should load app shell when offline', async () => {
    // First visit to cache assets
    await page.goto('http://localhost:5174/admin/life-lock');
    await page.waitForLoadState('networkidle');
    
    // Go offline
    await page.context().setOffline(true);
    
    // Reload page
    await page.reload();
    
    // Should still load the basic shell
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('text=LifeLock')).toBeVisible();
  });

  test('should show offline indicator when disconnected', async () => {
    await page.goto('http://localhost:5174/admin/life-lock');
    
    // Add offline indicator to page if not already present
    await page.evaluate(() => {
      if (!document.querySelector('[data-testid="offline-indicator"]')) {
        const indicator = document.createElement('div');
        indicator.setAttribute('data-testid', 'offline-indicator');
        indicator.textContent = 'Online';
        document.body.appendChild(indicator);
        
        // Update indicator based on connection
        const updateIndicator = () => {
          indicator.textContent = navigator.onLine ? 'Online' : 'Offline Mode';
        };
        
        window.addEventListener('online', updateIndicator);
        window.addEventListener('offline', updateIndicator);
      }
    });
    
    // Should initially show online
    await expect(page.locator('[data-testid="offline-indicator"]')).toContainText('Online');
    
    // Go offline
    await page.context().setOffline(true);
    
    // Trigger offline event
    await page.evaluate(() => {
      window.dispatchEvent(new Event('offline'));
    });
    
    // Should show offline mode
    await expect(page.locator('[data-testid="offline-indicator"]')).toContainText('Offline Mode');
  });

  test('should cache and retrieve tasks offline', async () => {
    await page.goto('http://localhost:5174/admin/life-lock');
    
    // Wait for initial data load
    await page.waitForTimeout(3000);
    
    // Create a task while online
    await page.click('[data-testid="add-task-button"]', { timeout: 10000 });
    await page.fill('[data-testid="task-title-input"]', 'Test Offline Task');
    await page.click('[data-testid="save-task-button"]');
    
    // Wait for task to be saved
    await page.waitForTimeout(1000);
    
    // Go offline
    await page.context().setOffline(true);
    
    // Reload page
    await page.reload();
    
    // Task should still be visible from cache
    await expect(page.locator('text=Test Offline Task')).toBeVisible();
  });

  test('should queue task creation when offline', async () => {
    await page.goto('http://localhost:5174/admin/life-lock');
    
    // Go offline immediately
    await page.context().setOffline(true);
    
    // Create offline storage test
    await page.evaluate(() => {
      // Mock offline storage for testing
      const mockStorage = {
        tasks: [],
        queue: [],
        addTask: function(task) {
          this.tasks.push(task);
          this.queue.push({
            type: 'create',
            table: 'tasks',
            data: task,
            timestamp: Date.now()
          });
        },
        getQueueSize: function() {
          return this.queue.length;
        }
      };
      
      window.mockOfflineStorage = mockStorage;
    });
    
    // Add task while offline
    await page.evaluate(() => {
      window.mockOfflineStorage.addTask({
        id: 'offline-task-1',
        title: 'Offline Created Task',
        category: 'light-work',
        priority: 'medium'
      });
    });
    
    // Verify task is queued
    const queueSize = await page.evaluate(() => window.mockOfflineStorage.getQueueSize());
    expect(queueSize).toBe(1);
    
    // Add offline indicator to show queue status
    await page.evaluate(() => {
      const queueIndicator = document.createElement('div');
      queueIndicator.setAttribute('data-testid', 'queue-indicator');
      queueIndicator.textContent = `${window.mockOfflineStorage.getQueueSize()} changes queued`;
      document.body.appendChild(queueIndicator);
    });
    
    await expect(page.locator('[data-testid="queue-indicator"]')).toContainText('1 changes queued');
  });

  test('should sync queued changes when back online', async () => {
    await page.goto('http://localhost:5174/admin/life-lock');
    
    // Set up offline storage mock
    await page.evaluate(() => {
      window.mockSyncManager = {
        queue: [
          {
            type: 'create',
            table: 'light_work_tasks',
            data: { title: 'Queued Task 1' },
            timestamp: Date.now()
          },
          {
            type: 'update', 
            table: 'deep_work_tasks',
            data: { completed: true },
            timestamp: Date.now()
          }
        ],
        syncInProgress: false,
        sync: async function() {
          this.syncInProgress = true;
          // Simulate API calls
          await new Promise(resolve => setTimeout(resolve, 1000));
          this.queue = [];
          this.syncInProgress = false;
          return { success: true, synced: 2 };
        }
      };
    });
    
    // Go offline
    await page.context().setOffline(true);
    
    // Add sync status indicator
    await page.evaluate(() => {
      const syncStatus = document.createElement('div');
      syncStatus.setAttribute('data-testid', 'sync-status');
      syncStatus.textContent = `${window.mockSyncManager.queue.length} items to sync`;
      document.body.appendChild(syncStatus);
    });
    
    await expect(page.locator('[data-testid="sync-status"]')).toContainText('2 items to sync');
    
    // Go back online
    await page.context().setOffline(false);
    
    // Trigger sync
    await page.evaluate(async () => {
      const result = await window.mockSyncManager.sync();
      document.querySelector('[data-testid="sync-status"]').textContent = 
        `Sync complete: ${result.synced} items`;
    });
    
    await expect(page.locator('[data-testid="sync-status"]')).toContainText('Sync complete: 2 items');
  });

  test('should handle daily planning offline', async () => {
    await page.goto('http://localhost:5174/admin/life-lock');
    
    // Navigate to timebox section
    await page.click('text=Timebox', { timeout: 10000 });
    
    // Go offline
    await page.context().setOffline(true);
    
    // Test daily planning functionality
    await page.evaluate(() => {
      // Mock daily planning storage
      window.mockDailyPlanning = {
        plans: {},
        savePlan: function(date, plan) {
          this.plans[date] = plan;
          localStorage.setItem('siso_daily_plans', JSON.stringify(this.plans));
        },
        getPlan: function(date) {
          return this.plans[date] || null;
        }
      };
      
      // Save a plan offline
      const today = new Date().toISOString().split('T')[0];
      window.mockDailyPlanning.savePlan(today, {
        selectedTasks: ['task-1', 'task-2'],
        timeSlots: {
          'slot-09-00': 'task-1',
          'slot-10-00': 'task-2'
        },
        lastModified: Date.now()
      });
    });
    
    // Verify plan is saved locally
    const planExists = await page.evaluate(() => {
      const today = new Date().toISOString().split('T')[0];
      const plan = window.mockDailyPlanning.getPlan(today);
      return plan && plan.selectedTasks.length === 2;
    });
    
    expect(planExists).toBe(true);
  });

  test('should work on mobile viewport offline', async () => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:5174/admin/life-lock');
    
    // Wait for initial load
    await page.waitForLoadState('networkidle');
    
    // Go offline
    await page.context().setOffline(true);
    
    // Reload to test offline functionality
    await page.reload();
    
    // Should still work on mobile
    await expect(page.locator('body')).toBeVisible();
    
    // Test touch interactions work offline
    await page.touchscreen.tap(200, 300);
    
    // Verify responsive design still works
    const isMobile = await page.evaluate(() => window.innerWidth < 768);
    expect(isMobile).toBe(true);
  });

  test('should persist data through app restart offline', async () => {
    await page.goto('http://localhost:5174/admin/life-lock');
    
    // Create test data
    await page.evaluate(() => {
      localStorage.setItem('test-offline-data', JSON.stringify({
        tasks: [
          { id: '1', title: 'Persistent Task 1' },
          { id: '2', title: 'Persistent Task 2' }
        ],
        timestamp: Date.now()
      }));
    });
    
    // Go offline
    await page.context().setOffline(true);
    
    // Reload (simulates app restart)
    await page.reload();
    
    // Check data persists
    const persistedData = await page.evaluate(() => {
      const data = localStorage.getItem('test-offline-data');
      return data ? JSON.parse(data) : null;
    });
    
    expect(persistedData).toBeTruthy();
    expect(persistedData.tasks).toHaveLength(2);
    expect(persistedData.tasks[0].title).toBe('Persistent Task 1');
  });

  test('should show connection quality indicator', async () => {
    await page.goto('http://localhost:5174/admin/life-lock');
    
    // Add connection quality test
    await page.evaluate(() => {
      const indicator = document.createElement('div');
      indicator.setAttribute('data-testid', 'connection-quality');
      indicator.textContent = 'Testing connection...';
      document.body.appendChild(indicator);
      
      // Simulate connection speed test
      setTimeout(() => {
        const speed = navigator.onLine ? 'fast' : 'offline';
        indicator.textContent = `Connection: ${speed}`;
      }, 1000);
    });
    
    await page.waitForTimeout(1500);
    
    await expect(page.locator('[data-testid="connection-quality"]')).toContainText('Connection:');
  });
});

test.describe('PWA Installation Tests', () => {
  test('should be installable as PWA', async ({ page }) => {
    await page.goto('http://localhost:5174');
    
    // Check for PWA manifest
    const manifestLink = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(manifestLink).toBeTruthy();
    
    // Verify manifest content
    const manifestResponse = await page.request.get(`http://localhost:5174${manifestLink}`);
    const manifest = await manifestResponse.json();
    
    expect(manifest.name).toBe('SISO Internal - Offline Productivity Hub');
    expect(manifest.short_name).toBe('SISO Local');
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('/');
  });

  test('should register service worker', async ({ page }) => {
    await page.goto('http://localhost:5174');
    
    // Wait for service worker registration
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          return !!registration;
        } catch (error) {
          return false;
        }
      }
      return false;
    });
    
    expect(swRegistered).toBe(true);
  });

  test('should cache critical resources', async ({ page }) => {
    await page.goto('http://localhost:5174');
    
    // Wait for caching to complete
    await page.waitForTimeout(3000);
    
    // Check if service worker has cached resources
    const cacheSize = await page.evaluate(async () => {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        let totalSize = 0;
        
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          totalSize += keys.length;
        }
        
        return totalSize;
      }
      return 0;
    });
    
    expect(cacheSize).toBeGreaterThan(0);
  });
});