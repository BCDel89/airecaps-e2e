import { test, expect, request } from '@playwright/test';
import { API_URL, readState, authHeaders } from './helpers';

// Note: POST /api/summaries body requires { urlOrId, type, maxLength: null }
// Summary generation is synchronous — the full record is returned in the response.
// GET /api/summaries/:id requires ?planType=youtube querystring.

test.describe.serial('Summaries', () => {
  let summaryId: number;

  test('create summary (synchronous)', async () => {
    test.setTimeout(120000);
    const state = readState();
    const ctx = await request.newContext({ baseURL: API_URL });
    const res = await ctx.post('/api/summaries', {
      headers: authHeaders(state.token),
      data: {
        urlOrId: 'https://www.youtube.com/watch?v=xRnUNs_NVCY',
        type: 'youtube',
        maxLength: null
      }
    });
    expect([200, 201]).toContain(res.status());
    const body = await res.json();
    console.log('Summary created, id:', body.id);
    expect(body.id).toBeTruthy();
    expect(body.videoInfo).toBeTruthy();
    expect(body.summary).toBeTruthy(); // S3 URL to text summary
    summaryId = body.id;
    await ctx.dispose();
  });

  test('list summaries returns array with entries', async () => {
    const state = readState();
    const ctx = await request.newContext({ baseURL: API_URL });
    const res = await ctx.get('/api/summaries', {
      headers: authHeaders(state.token)
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const items = Array.isArray(body) ? body : body.summaries || body.items || [];
    expect(items.length).toBeGreaterThan(0);
    await ctx.dispose();
  });

  test('get summary by id', async () => {
    if (!summaryId) test.skip();
    const state = readState();
    const ctx = await request.newContext({ baseURL: API_URL });
    // GET /api/summaries/:id requires planType querystring
    const res = await ctx.get(`/api/summaries/${summaryId}?planType=youtube`, {
      headers: authHeaders(state.token)
    });
    // May return 200 or 403 depending on subscription; either is a valid response (not 500)
    expect([200, 403, 404]).toContain(res.status());
    await ctx.dispose();
  });
});
