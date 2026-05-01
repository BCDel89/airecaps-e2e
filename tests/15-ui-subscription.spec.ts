import { test, expect } from '@playwright/test';
import { FE_URL } from './helpers';
import { login } from './ui-helpers';

test.describe('UI Subscription Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('view subscription plans', async ({ page }) => {
    // Navigate to subscription page
    await page.goto(`${FE_URL}/tabs/subscriptions`);
    await page.waitForLoadState('networkidle');
    
    // Verify plans are displayed (use first() to avoid strict mode violation if text appears in nav)
    await expect(page.getByText('Free').first()).toBeVisible();
    await expect(page.getByText('Basic').first()).toBeVisible();
    await expect(page.getByText('Premium').first()).toBeVisible();
  });

  test('upgrade to Basic plan with test card', async ({ page }) => {
    // Navigate to subscription page
    await page.goto(`${FE_URL}/tabs/subscriptions`);
    await page.waitForLoadState('networkidle');
    
    // Click upgrade on Basic plan
    const basicCard = page.locator('[data-testid="plan-youtube-basic"]').or(page.getByText('Basic').locator('..'));
    await basicCard.getByRole('button', { name: /upgrade|subscribe/i }).click();
    
    // Wait for Stripe payment form
    await page.waitForSelector('iframe[name*="stripe"]', { timeout: 10000 });
    
    // Fill Stripe card element (in iframe)
    const stripeFrame = page.frameLocator('iframe[name*="stripe"]').first();
    
    // Card number
    await stripeFrame.locator('[placeholder*="card number"]').fill('4242424242424242');
    
    // Expiry
    await stripeFrame.locator('[placeholder*="MM / YY"]').fill('12/34');
    
    // CVC
    await stripeFrame.locator('[placeholder*="CVC"]').fill('123');
    
    // ZIP if present
    const zipField = stripeFrame.locator('[placeholder*="ZIP"]');
    if (await zipField.isVisible()) {
      await zipField.fill('12345');
    }
    
    // Submit payment
    await page.getByRole('button', { name: /pay|subscribe|confirm/i }).click();
    
    // Wait for success
    await expect(page.getByText(/success|thank you|subscribed/i)).toBeVisible({ timeout: 15000 });
  });
});
