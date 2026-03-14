import { test, expect, request } from '@playwright/test';
import { API_URL, readState, authHeaders } from './helpers';

const TEST_CHANNEL = {
  id: 'UCDRIjKy6eZOvKtOELtTdeUA',
  title: 'Breaking Points',
  description: 'Breaking Points with Krystal and Saagar',
  thumbnails: { default: '', medium: '', high: '' }
};

test.describe.serial('Schedules', () => {
  let scheduleId: number;

  test('create schedule', async () => {
    const state = readState();
    const ctx = await request.newContext({ baseURL: API_URL });
    const startDateTime = new Date(Date.now() + 60000).toISOString();
    const res = await ctx.post('/api/schedules', {
      headers: authHeaders(state.token),
      data: {
        frequency: 'monthly',
        startDateTime,
        type: 'youtube',
        channelList: [TEST_CHANNEL]
      }
    });
    expect([200, 201]).toContain(res.status());
    const body = await res.json();
    scheduleId = body.id || body.schedule?.id;
    expect(scheduleId).toBeTruthy();
    await ctx.dispose();
  });

  test('list schedules includes new schedule', async () => {
    const state = readState();
    const ctx = await request.newContext({ baseURL: API_URL });
    const res = await ctx.get('/api/schedules', {
      headers: authHeaders(state.token)
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const schedules = Array.isArray(body) ? body : body.schedules || [];
    expect(schedules.some((s: any) => s.id === scheduleId)).toBeTruthy();
    await ctx.dispose();
  });

  test('delete schedule', async () => {
    const state = readState();
    const ctx = await request.newContext({ baseURL: API_URL });
    const res = await ctx.delete(`/api/schedules/${scheduleId}`, {
      headers: authHeaders(state.token)
    });
    expect([200, 204]).toContain(res.status());
    await ctx.dispose();
  });
});
