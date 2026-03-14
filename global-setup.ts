import { request } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const API_URL = process.env.API_URL || 'http://api-recaps-staging.100-85-168-42.sslip.io';

async function globalSetup() {
  const authDir = path.join(__dirname, '.auth');
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

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
  const state = {
    email,
    password,
    token: body.token,
    userId: body.user?.id,
  };

  fs.writeFileSync(
    path.join(authDir, 'state.json'),
    JSON.stringify(state, null, 2)
  );

  console.log(`✅ Test user created: ${email}`);
  await ctx.dispose();
}

export default globalSetup;
