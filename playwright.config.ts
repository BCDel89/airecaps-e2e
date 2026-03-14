import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  globalSetup: './global-setup.ts',
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.API_URL || 'http://api-recaps-staging.100-85-168-42.sslip.io',
    extraHTTPHeaders: { 'Content-Type': 'application/json' },
  },
});
