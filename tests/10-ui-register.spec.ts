import { test, expect } from '@playwright/test';

test.describe('UI - Registration', () => {
  test('register a new account via UI', async ({ page }) => {
    const email = `ui-test-${Date.now()}@airecaps-test.local`;
    const password = 'TestPass123!';

    await page.goto('/registration');
    await page.waitForSelector('ion-input[formcontrolname="email"]', { timeout: 15000 });

    // Type email (keyboard.type triggers Angular reactive form change detection)
    await page.locator('ion-input[formcontrolname="email"] input').click();
    await page.keyboard.type(email);
    await page.keyboard.press('Tab');

    // Type password
    await page.locator('ion-input[formcontrolname="password"] input').click();
    await page.keyboard.type(password);
    await page.keyboard.press('Tab');

    // Type confirm password
    await page.locator('ion-input[formcontrolname="confirmPassword"] input').click();
    await page.keyboard.type(password);
    await page.keyboard.press('Tab');

    // Wait for password validation chips to go green
    await page.waitForTimeout(500);

    // Submit
    const submitBtn = page.locator('ion-button[type="submit"]');
    await expect(submitBtn).toBeEnabled({ timeout: 5000 });
    await submitBtn.click();

    // Should redirect to tabs after registration
    await page.waitForURL('**/tabs/**', { timeout: 15000 });
    expect(page.url()).toContain('/tabs/');
  });

  test('registration page renders all fields', async ({ page }) => {
    await page.goto('/registration');
    await page.waitForSelector('ion-input[formcontrolname="email"]', { timeout: 15000 });
    await expect(page.locator('ion-input[formcontrolname="email"]')).toBeVisible();
    await expect(page.locator('ion-input[formcontrolname="password"]')).toBeVisible();
    await expect(page.locator('ion-input[formcontrolname="confirmPassword"]')).toBeVisible();
    await expect(page.locator('ion-button[type="submit"]')).toBeVisible();
  });
});
