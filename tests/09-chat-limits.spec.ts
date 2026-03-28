import { test, expect, request } from '@playwright/test';
import { API_URL, readState, authHeaders } from './helpers';

test.describe('Chat & Subscription Limits', () => {
  test('subscriptions endpoint returns correct tiers', async () => {
    const ctx = await request.newContext({ baseURL: API_URL });
    const res = await ctx.get('/api/subscriptions');
    expect(res.status()).toBe(200);
    const subs = await res.json();

    // Should have Free, Premium, Pro (and hidden Ultimate)
    const titles = subs.map((s: any) => s.title);
    expect(titles).toContain('Free');
    expect(titles).toContain('Premium');
    expect(titles).toContain('Pro');
    // Basic should NOT exist
    expect(titles).not.toContain('Basic');

    // Verify updated tier values
    const free = subs.find((s: any) => s.title === 'Free');
    expect(free.summariesPerMonth).toBe(10);
    expect(free.price).toBe(0);

    const premium = subs.find((s: any) => s.title === 'Premium');
    expect(premium.summariesPerMonth).toBe(100);
    expect(premium.price).toBe(9.99);

    const pro = subs.find((s: any) => s.title === 'Pro');
    expect(pro.summariesPerMonth).toBe(500);
    expect(pro.price).toBe(29.99);
    expect(pro.aiInteraction).toBe(true);

    await ctx.dispose();
  });

  test('chat requires authentication', async () => {
    const ctx = await request.newContext({ baseURL: API_URL });
    const res = await ctx.post('/api/chat', {
      data: { summaryId: 1, message: 'test' }
    });
    expect(res.status()).toBe(401);
    await ctx.dispose();
  });

  test('CORS allows PATCH method', async () => {
    const ctx = await request.newContext({ baseURL: API_URL });
    const res = await ctx.fetch(`${API_URL}/api/users/digest-preferences`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://airecaps.com',
        'Access-Control-Request-Method': 'PATCH',
        'Access-Control-Request-Headers': 'Authorization,Content-Type'
      }
    });
    expect(res.status()).toBe(204);
    const allowedMethods = res.headers()['access-control-allow-methods'] || '';
    expect(allowedMethods).toContain('PATCH');
    await ctx.dispose();
  });
});
