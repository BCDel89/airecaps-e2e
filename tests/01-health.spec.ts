import { test, expect, request } from '@playwright/test';
import { API_URL, FE_URL, readState, authHeaders } from './helpers';

// Note: API /health returns { status: "ok" }
//       In production, transcription is native to the API

test.describe('Health Checks', () => {
  test('API health', async () => {
    const ctx = await request.newContext();
    const res = await ctx.get(`${API_URL}/health`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBeTruthy(); // "ok"
    await ctx.dispose();
  });

  test.skip('Transcript service health (deprecated - native transcription)', async () => {
    // Transcription is now native to the API, no separate service
  });

  test('Frontend serves 200', async () => {
    const ctx = await request.newContext();
    const res = await ctx.get(FE_URL);
    expect(res.status()).toBe(200);
    await ctx.dispose();
  });

  test('Native transcription works', async () => {
    test.setTimeout(120000);
    const state = readState();
    const ctx = await request.newContext({ baseURL: API_URL });
    const res = await ctx.post('/api/summaries', {
      headers: authHeaders(state.token),
      data: {
        urlOrId: 'https://www.youtube.com/watch?v=UyyjU8fzEYU',
        type: 'youtube',
        maxLength: null
      }
    });
    expect([200, 201]).toContain(res.status());
    const body = await res.json();
    expect(body.id).toBeTruthy();
    expect(body.summary).toBeTruthy();
    await ctx.dispose();
  });
});
