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
        baseURL: process.env.API_URL || 'https://api-staging.airecaps.com',
        extraHTTPHeaders: { 'Content-Type': 'application/json' },
      },
    },
    {
      name: 'browser',
      testMatch: /1[0-9]-.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.FE_URL || 'https://staging.airecaps.com',
        headless: true,
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'production-api',
      testMatch: /0[1-9]-.*\.spec\.ts/,
      use: {
        baseURL: 'https://api.airecaps.com',
        extraHTTPHeaders: { 'Content-Type': 'application/json' },
      },
    },
    {
      name: 'production-browser',
      testMatch: /1[0-9]-.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://airecaps.com',
        headless: true,
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
});
