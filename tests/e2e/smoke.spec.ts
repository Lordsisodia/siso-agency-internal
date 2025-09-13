import { test, expect } from '@playwright/test';

test('Testing dashboard loads', async ({ page }) => {
  await page.goto('/testing');
  await expect(page.getByRole('heading', { name: /AI App Plan Testing Dashboard/i })).toBeVisible();
});

