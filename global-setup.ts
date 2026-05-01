import { request } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const API_URL = process.env.API_URL || 'https://api-staging.airecaps.com';
const PROD_API_URL = 'https://api.airecaps.com';

async function globalSetup() {
  const authDir = path.join(__dirname, '.auth');
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  // Staging: dynamic test user
  const email = `e2e-${Date.now()}@airecaps-test.local`;
  const password = 'E2eTestPass123!';

  const ctx = await request.newContext({ baseURL: API_URL });

  const res = await ctx.post('/api/auth/register', {
    data: { email, password }
  });

  if (!res.ok()) {
    throw new Error(`Registration failed: ${res.status()} ${await res.text()}`);
  }

  const body = await res.json();
  fs.writeFileSync(
    path.join(authDir, 'state.json'),
    JSON.stringify({ email, password, token: body.token, userId: body.user?.id }, null, 2)
  );
  console.log(`✅ Staging test user created: ${email}`);
  await ctx.dispose();

  // Production: stable hardcoded test user (must already exist in prod DB)
  const prodEmail = process.env.PROD_TEST_EMAIL;
  const prodPassword = process.env.PROD_TEST_PASSWORD;
  if (prodEmail && prodPassword) {
    const prodCtx = await request.newContext({ baseURL: PROD_API_URL });
    const prodRes = await prodCtx.post('/api/auth/login', {
      data: { email: prodEmail, password: prodPassword }
    });
    if (!prodRes.ok()) {
      console.warn(`⚠️  Production test user login failed: ${prodRes.status()} ${await prodRes.text()}`);
    } else {
      const prodBody = await prodRes.json();
      fs.writeFileSync(
        path.join(authDir, 'prod-state.json'),
        JSON.stringify({ email: prodEmail, password: prodPassword, token: prodBody.token, userId: prodBody.user?.id }, null, 2)
      );
      console.log(`✅ Production test user authenticated: ${prodEmail}`);
    }
    await prodCtx.dispose();
  }
}

export default globalSetup;
