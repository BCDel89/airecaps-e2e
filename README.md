# airecaps-e2e

Playwright E2E tests for the AI Recaps staging environment.

## What It Tests

Three services:
- **API** (`api-recaps-staging.100-85-168-42.sslip.io`) — auth, schedules, summaries, YouTube channel search
- **Transcript** (`transcript-staging.100-85-168-42.sslip.io`) — health check
- **Frontend** (`ai-recaps-staging.100-85-168-42.sslip.io`) — serves 200

### Test Suites

| File | Tests |
|------|-------|
| `01-health.spec.ts` | Health endpoints for all 3 services |
| `02-auth.spec.ts` | Register, login, profile, 401 on missing token |
| `03-channels.spec.ts` | YouTube channel search |
| `04-schedules.spec.ts` | Create → list → delete schedule (serial) |
| `05-summaries.spec.ts` | Create summary, list summaries, get by ID (serial) |

## Quick Start

```bash
# Install dependencies
npm install
npx playwright install --with-deps

# Copy env (or just use defaults — staging URLs are already in config)
cp .env.example .env

# Run all tests
npm test

# View HTML report
npm run report
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `API_URL` | `http://api-recaps-staging.100-85-168-42.sslip.io` | API base URL |
| `TRANSCRIPT_URL` | `http://transcript-staging.100-85-168-42.sslip.io` | Transcript service URL |
| `FE_URL` | `http://ai-recaps-staging.100-85-168-42.sslip.io` | Frontend URL |

## How It Works

On every test run, `global-setup.ts` registers a fresh test user with a timestamped email (`e2e-<timestamp>@airecaps-test.local`). Auth state (token, email, password) is saved to `.auth/state.json` and used by all tests.

## API Notes

- `POST /api/summaries` requires body: `{ urlOrId, type: "youtube", maxLength: null }` — summary generation is **synchronous**
- `GET /api/summaries/:id` requires `?planType=youtube` querystring
- `POST /api/schedules` requires `{ frequency, startDateTime, type: "youtube", channelList: [...] }`

## Adding New Tests

1. Create a new `tests/NN-name.spec.ts` file
2. Import helpers: `import { API_URL, readState, authHeaders } from './helpers'`
3. Use `readState()` to get the authenticated user's token
4. Tests run sequentially (workers: 1) — use `test.describe.serial()` for dependent tests

## CI

```yaml
- run: npm ci
- run: npx playwright install --with-deps
- run: npm test
- uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report/
```
