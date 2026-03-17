import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  globalSetup: './global-setup.ts',
  reporter: [['html', { open: 'never' }], ['list']],
  projects: [
    {
      name: 'api',
      testMatch: /0[1-9]-.*\.spec\.ts/,
      use: {
        baseURL: process.env.API_URL || 'http://api-recaps-staging.100-85-168-42.sslip.io',
        extraHTTPHeaders: { 'Content-Type': 'application/json' },
      },
    },
    {
      name: 'browser',
      testMatch: /1[0-9]-.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.FE_URL || 'http://ai-recaps-staging.100-85-168-42.sslip.io',
        headless: true,
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
});
