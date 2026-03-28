import { test, expect, request } from '@playwright/test';
import { API_URL, readState, authHeaders } from './helpers';

test.describe('Email Notification Preferences', () => {
  test('GET digest-preferences requires auth', async () => {
    const ctx = await request.newContext({ baseURL: API_URL });
    const res = await ctx.get('/api/users/digest-preferences');
    expect(res.status()).toBe(401);
    await ctx.dispose();
  });

  test('GET digest-preferences returns current setting', async () => {
    const state = readState();
    const ctx = await request.newContext({ baseURL: API_URL });
    const res = await ctx.get('/api/users/digest-preferences', {
      headers: authHeaders(state.token)
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('emailDigestEnabled');
    expect(typeof body.emailDigestEnabled).toBe('boolean');
    await ctx.dispose();
  });

  test('PATCH digest-preferences requires auth', async () => {
    const ctx = await request.newContext({ baseURL: API_URL });
    const res = await ctx.patch('/api/users/digest-preferences', {
      data: { emailDigestEnabled: true }
    });
    expect(res.status()).toBe(401);
    await ctx.dispose();
  });

  test('PATCH digest-preferences toggles setting', async () => {
    const state = readState();
    const ctx = await request.newContext({ baseURL: API_URL });

    // Get current value
    const getRes = await ctx.get('/api/users/digest-preferences', {
      headers: authHeaders(state.token)
    });
    const current = (await getRes.json()).emailDigestEnabled;

    // Toggle it
    const patchRes = await ctx.patch('/api/users/digest-preferences', {
      headers: authHeaders(state.token),
      data: { emailDigestEnabled: !current }
    });
    // 200 = success, 400 = email not verified (valid for test user)
    expect([200, 400]).toContain(patchRes.status());

    if (patchRes.status() === 200) {
      const body = await patchRes.json();
      expect(body.emailDigestEnabled).toBe(!current);

      // Toggle back to original
      await ctx.patch('/api/users/digest-preferences', {
        headers: authHeaders(state.token),
        data: { emailDigestEnabled: current }
      });
    }

    await ctx.dispose();
  });
});
