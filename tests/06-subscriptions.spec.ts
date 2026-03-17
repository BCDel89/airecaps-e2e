import { test, expect, request } from '@playwright/test';
import { API_URL, readState, authHeaders } from './helpers';

test.describe('Subscriptions', () => {
  test('list available subscriptions', async () => {
    const ctx = await request.newContext();
    const res = await ctx.get(`${API_URL}/api/subscriptions`);
    expect(res.status()).toBe(200);
    
    const subscriptions = await res.json();
    expect(Array.isArray(subscriptions)).toBe(true);
    expect(subscriptions.length).toBeGreaterThan(0);
    
    // Verify subscription structure
    const sub = subscriptions[0];
    expect(sub).toHaveProperty('id');
    expect(sub).toHaveProperty('title');
    expect(sub).toHaveProperty('price');
  });

  test('create payment intent for Basic plan', async () => {
    const { token } = readState();
    const ctx = await request.newContext();
    
    // Get Basic plan
    const subsRes = await ctx.get(`${API_URL}/api/subscriptions`);
    const subscriptions = await subsRes.json();
    const basicPlan = subscriptions.find((s: any) => s.id === 'youtube-basic');
    expect(basicPlan).toBeDefined();
    
    // Create payment intent
    const res = await ctx.post(`${API_URL}/api/subscriptions/create-stripe-payment-intent`, {
      headers: authHeaders(token),
      data: {
        subscriptionId: basicPlan.id,
        currency: "USD"
      }
    });
    
    expect(res.status()).toBe(200);
    const intent = await res.json();
    expect(intent).toHaveProperty('paymentIntent');
    expect(intent.paymentIntent).toContain('pi_');
  });
});
