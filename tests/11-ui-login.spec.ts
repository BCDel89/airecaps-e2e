import { test, expect } from '@playwright/test';
import { readState } from './helpers';

test.describe('UI - Login', () => {
  test('login via UI with test credentials', async ({ page }) => {
    const state = readState();

    await page.goto('/login');
    await page.waitForSelector('ion-input[formcontrolname="email"]', { timeout: 15000 });

    await page.locator('ion-input[formcontrolname="email"]').click();
    await page.locator('ion-input[formcontrolname="email"]').locator('input').fill(state.email);

    await page.locator('ion-input[formcontrolname="password"]').click();
    await page.locator('ion-input[formcontrolname="password"]').locator('input').fill(state.password);

    await page.locator('ion-button[type="submit"]').click();

    await page.waitForURL('**/tabs/**', { timeout: 15000 });
    expect(page.url()).toContain('/tabs/');
  });

  test('login page loads correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('ion-input[formcontrolname="email"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('ion-input[formcontrolname="password"]')).toBeVisible();
    await expect(page.locator('ion-button[type="submit"]')).toBeVisible();
  });

  test('login fails with bad credentials', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('ion-input[formcontrolname="email"]', { timeout: 15000 });

    await page.locator('ion-input[formcontrolname="email"]').locator('input').fill('notexist@bad.com');
    await page.locator('ion-input[formcontrolname="password"]').locator('input').fill('WrongPass999!');
    await page.locator('ion-button[type="submit"]').click();

    // Should stay on login page (not redirect to tabs)
    await page.waitForTimeout(3000);
    expect(page.url()).not.toContain('/tabs/');
  });
});
