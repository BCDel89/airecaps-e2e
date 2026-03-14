import { test, expect } from '@playwright/test';

test.describe('UI - Registration', () => {
  test('register a new account via UI', async ({ page }) => {
    const email = `ui-test-${Date.now()}@airecaps-test.local`;
    const password = 'TestPass123!';

    await page.goto('/registration');
    await page.waitForSelector('ion-input[formcontrolname="email"]', { timeout: 15000 });

    // Fill email
    await page.locator('ion-input[formcontrolname="email"]').click();
    await page.locator('ion-input[formcontrolname="email"]').locator('input').fill(email);

    // Fill password
    await page.locator('ion-input[formcontrolname="password"]').click();
    await page.locator('ion-input[formcontrolname="password"]').locator('input').fill(password);

    // Fill confirm password
    await page.locator('ion-input[formcontrolname="confirmPassword"]').click();
    await page.locator('ion-input[formcontrolname="confirmPassword"]').locator('input').fill(password);

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
