import { test, expect, request } from '@playwright/test';
import { API_URL, TRANSCRIPT_URL, FE_URL } from './helpers';

// Note: API /health returns { status: "ok" }
//       Transcript /health returns { status: "healthy" }

test.describe('Health Checks', () => {
  test('API health', async () => {
    const ctx = await request.newContext();
    const res = await ctx.get(`${API_URL}/health`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBeTruthy(); // "ok"
    await ctx.dispose();
  });

  test('Transcript service health', async () => {
    const ctx = await request.newContext();
    const res = await ctx.get(`${TRANSCRIPT_URL}/health`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('healthy');
    await ctx.dispose();
  });

  test('Frontend serves 200', async () => {
    const ctx = await request.newContext();
    const res = await ctx.get(FE_URL);
    expect(res.status()).toBe(200);
    await ctx.dispose();
  });
});
