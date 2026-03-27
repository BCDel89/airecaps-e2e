import { Page } from '@playwright/test';
import { readState } from './helpers';

/**
 * Perform full UI login using credentials from .auth/state.json.
 * Uses keyboard.type() instead of fill() because Angular reactive forms
 * don't detect changes from Playwright's fill() method.
 */
export async function loginUI(page: Page): Promise<void> {
  const state = readState();
  await page.goto('/login');
  await page.waitForSelector('ion-input[formcontrolname="email"]', { timeout: 15000 });

  // Click and type email (keyboard.type triggers Angular change detection)
  const emailInput = page.locator('ion-input[formcontrolname="email"] input');
  await emailInput.click();
  await page.keyboard.type(state.email);
  await page.keyboard.press('Tab');

  // Click and type password
  const passwordInput = page.locator('ion-input[formcontrolname="password"] input');
  await passwordInput.click();
  await page.keyboard.type(state.password);
  await page.keyboard.press('Tab');

  // Submit
  await page.locator('ion-button[type="submit"]').click();
  await page.waitForURL('**/tabs/**', { timeout: 15000 });
}

// Alias for backward compatibility
export const login = loginUI;
