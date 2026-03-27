import { test, expect } from '@playwright/test';
import { loginUI } from './ui-helpers';

test.describe('UI - Summarize Now', () => {
  test('summarize page loads with video search input', async ({ page }) => {
    await loginUI(page);
    await page.goto('/tabs/summarize');
    await page.waitForSelector('ion-title', { timeout: 15000 });
    await expect(page.locator('ion-input[formcontrolname="videoSearch"]')).toBeVisible({ timeout: 10000 });
  });

  test('search for a video and see results', async ({ page }) => {
    test.setTimeout(45000);
    await loginUI(page);
    await page.goto('/tabs/summarize');
    await page.waitForSelector('ion-input[formcontrolname="videoSearch"]', { timeout: 15000 });

    await page.locator('ion-input[formcontrolname="videoSearch"] input').click();
    await page.keyboard.type('tech news');
    await page.keyboard.press('Enter');

    // Wait for results to appear (app-video-item components or any result)
    await page.waitForSelector('app-video-item', { timeout: 20000 });
    const videos = page.locator('app-video-item');
    await expect(videos.first()).toBeVisible();
  });
});
