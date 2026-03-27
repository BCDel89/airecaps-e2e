import { test, expect } from '@playwright/test';
import { readState } from './helpers';

test.describe('UI - Login', () => {
  test('login via UI with test credentials', async ({ page }) => {
    const state = readState();

    await page.goto('/login');
    await page.waitForSelector('ion-input[formcontrolname="email"]', { timeout: 15000 });

    await page.locator('ion-input[formcontrolname="email"] input').click();
    await page.keyboard.type(state.email);
    await page.keyboard.press('Tab');

    await page.locator('ion-input[formcontrolname="password"] input').click();
    await page.keyboard.type(state.password);
    await page.keyboard.press('Tab');

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

    await page.locator('ion-input[formcontrolname="email"] input').click();
    await page.keyboard.type('notexist@bad.com');
    await page.keyboard.press('Tab');

    await page.locator('ion-input[formcontrolname="password"] input').click();
    await page.keyboard.type('WrongPass999!');
    await page.keyboard.press('Tab');

    await page.locator('ion-button[type="submit"]').click();

    // Should stay on login page (not redirect to tabs)
    await page.waitForTimeout(3000);
    expect(page.url()).not.toContain('/tabs/');
  });
});
