import { test, expect, request } from '@playwright/test';
import { API_URL, TRANSCRIPT_URL, FE_URL, readState, authHeaders } from './helpers';

// Note: API /health returns { status: "ok" }
//       Transcript /health returns { status: "healthy" } (staging only)
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

  test('Transcript service health', async () => {
    // Skip if TRANSCRIPT_URL is not set (production uses native transcription)
    if (!TRANSCRIPT_URL || TRANSCRIPT_URL === API_URL) {
      test.skip();
      return;
    }
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

  // TODO: Native transcription is currently broken in production due to
  // youtube-transcript ESM/CommonJS conflict. Skipping until API is fixed.
  // See: ReferenceError: exports is not defined in ES module scope
  test.skip('Native transcription works', async () => {
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
    expect(body.summary).not.toContain('Failed to fetch');
    await ctx.dispose();
  });
});
