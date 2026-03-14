import { test, expect } from '@playwright/test';
import { loginUI } from './ui-helpers';

test.describe('UI - History (My Summaries)', () => {
  test('history page loads', async ({ page }) => {
    await loginUI(page);
    await page.goto('/tabs/history');
    await page.waitForSelector('ion-title', { timeout: 15000 });
    const title = page.locator('ion-title').filter({ hasText: 'My Summaries' });
    await expect(title).toBeVisible({ timeout: 10000 });
  });

  test('shows summaries list or empty state', async ({ page }) => {
    await loginUI(page);
    await page.goto('/tabs/history');
    await page.waitForTimeout(3000);

    // History page shows either a list of summaries (listitem/link structure) or an empty state
    const pageContent = await page.content();
    const hasSummaryList = pageContent.includes('history-detail') || pageContent.includes('ion-list');
    const hasEmptyState = pageContent.includes('No Summaries Yet') || pageContent.includes('empty-state');
    const isLoading = await page.locator('ion-spinner').isVisible().catch(() => false);

    expect(hasSummaryList || hasEmptyState || isLoading).toBeTruthy();
  });
});
