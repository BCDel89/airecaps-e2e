import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { readState } from './helpers';

function readProdState() {
  const p = path.join(__dirname, '..', '.auth', 'prod-state.json');
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

/**
 * Perform full UI login using credentials from .auth/state.json (staging)
 * or .auth/prod-state.json (production). Detects environment from page URL.
 * Uses keyboard.type() instead of fill() because Angular reactive forms
 * don't detect changes from Playwright's fill() method.
 */
export async function loginUI(page: Page): Promise<void> {
  await page.goto('/login');
  await page.waitForSelector('ion-input[formcontrolname="email"]', { timeout: 15000 });

  const currentUrl = page.url();
  const isProd = currentUrl.includes('airecaps.com') && !currentUrl.includes('staging');
  const state = isProd ? readProdState() : readState();

  const emailInput = page.locator('ion-input[formcontrolname="email"] input');
  await emailInput.click();
  await page.keyboard.type(state.email);
  await page.keyboard.press('Tab');

  const passwordInput = page.locator('ion-input[formcontrolname="password"] input');
  await passwordInput.click();
  await page.keyboard.type(state.password);
  await page.keyboard.press('Tab');

  await page.locator('ion-button[type="submit"]').click();
  await page.waitForURL('**/tabs/**', { timeout: 15000 });
}

export const login = loginUI;
