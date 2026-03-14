import { Page } from '@playwright/test';
import { readState } from './helpers';

/**
 * Perform full UI login using credentials from .auth/state.json.
 * Auth is stored in Angular's in-memory service, so we must go through the login form.
 */
export async function loginUI(page: Page): Promise<void> {
  const state = readState();
  await page.goto('/login');
  await page.waitForSelector('ion-input[formcontrolname="email"]', { timeout: 15000 });
  await page.locator('ion-input[formcontrolname="email"]').locator('input').fill(state.email);
  await page.locator('ion-input[formcontrolname="password"]').locator('input').fill(state.password);
  await page.locator('ion-button[type="submit"]').click();
  await page.waitForURL('**/tabs/**', { timeout: 15000 });
}
