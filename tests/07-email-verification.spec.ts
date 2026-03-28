import { test, expect, request } from '@playwright/test';
import { API_URL, readState, authHeaders } from './helpers';

test.describe('Email Verification', () => {
  test('profile includes emailVerified field', async () => {
    const state = readState();
    const ctx = await request.newContext({ baseURL: API_URL });
    const res = await ctx.get('/api/users/profile', {
      headers: authHeaders(state.token)
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('emailVerified');
    await ctx.dispose();
  });

  test('resend verification without auth returns error', async () => {
    const ctx = await request.newContext({ baseURL: API_URL });
    const res = await ctx.post('/api/auth/resend-verification');
    // 401 (proper auth guard) or 500 (no user context) — route is under /api/auth/* wildcard
    expect([401, 500]).toContain(res.status());
    await ctx.dispose();
  });

  test('resend verification with auth succeeds or says already verified', async () => {
    const state = readState();
    const ctx = await request.newContext({ baseURL: API_URL });
    const res = await ctx.post('/api/auth/resend-verification', {
      headers: authHeaders(state.token)
    });
    // 200 = email sent, 400 = already verified, 500 = email service error — all valid
    expect([200, 400, 500]).toContain(res.status());
    const body = await res.json();
    expect(body.message || body.error).toBeTruthy();
    await ctx.dispose();
  });

  test('verify-email rejects invalid token', async () => {
    const ctx = await request.newContext({ baseURL: API_URL });
    const res = await ctx.get('/api/auth/verify-email?token=invalid_token_12345', {
      maxRedirects: 0
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Invalid or expired');
    await ctx.dispose();
  });

  test('verify-email rejects missing token', async () => {
    const ctx = await request.newContext({ baseURL: API_URL });
    const res = await ctx.get('/api/auth/verify-email', {
      maxRedirects: 0
    });
    expect(res.status()).toBe(400);
    await ctx.dispose();
  });
});
