import { test, expect, request } from '@playwright/test';
import { API_URL, readState, authHeaders } from './helpers';

test.describe('YouTube Channel Search', () => {
  test('search for channels', async () => {
    const state = readState();
    const ctx = await request.newContext({ baseURL: API_URL });
    const res = await ctx.get('/api/youtube/channels?query=breaking+points', {
      headers: authHeaders(state.token)
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body) || body.items || body.channels || body.results).toBeTruthy();
    await ctx.dispose();
  });
});
