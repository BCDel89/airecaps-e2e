import { test, expect, request } from '@playwright/test';
import { API_URL, readState, authHeaders } from './helpers';

test.describe('Authentication', () => {
  test('login with test credentials', async () => {
    const state = readState();
    const ctx = await request.newContext({ baseURL: API_URL });
    const res = await ctx.post('/api/auth/login', {
      data: { email: state.email, password: state.password }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.token).toBeTruthy();
    expect(body.user.email).toBe(state.email);
    await ctx.dispose();
  });

  test('get profile with token', async () => {
    const state = readState();
    const ctx = await request.newContext({ baseURL: API_URL });
    const res = await ctx.get('/api/users/profile', {
      headers: authHeaders(state.token)
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.email).toBe(state.email);
    await ctx.dispose();
  });

  test('reject request without token', async () => {
    const ctx = await request.newContext({ baseURL: API_URL });
    const res = await ctx.get('/api/users/profile');
    expect(res.status()).toBe(401);
    await ctx.dispose();
  });
});
