import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import {
  compareTotals,
  createServiceAccountJwt,
  dateRange,
  topOpportunities,
} from '../scripts/lib/google-search-console.mjs';

test('Search Console date windows do not overlap', () => {
  const range = dateRange(7, new Date('2026-09-17T00:00:00.000Z'));
  assert.deepEqual(range, {
    current: { startDate: '2026-09-11', endDate: '2026-09-17' },
    previous: { startDate: '2026-09-04', endDate: '2026-09-10' },
  });
});

test('Search Console alerts respect thresholds and minimum impressions', () => {
  const thresholds = { clickDropPercent: 30, impressionDropPercent: 35, ctrDropPercent: 25, positionLoss: 3, minimumImpressions: 100 };
  const result = compareTotals(
    { clicks: 60, impressions: 600, ctr: 0.1, position: 9 },
    { clicks: 100, impressions: 1000, ctr: 0.1, position: 5 },
    thresholds
  );
  assert.deepEqual(result.alerts, ['click-drop', 'impression-drop', 'position-loss']);
});

test('opportunities prioritize high-impression queries near page one', () => {
  const result = topOpportunities([
    { keys: ['weak'], impressions: 200, clicks: 2, ctr: 0.01, position: 11 },
    { keys: ['already top'], impressions: 500, clicks: 100, ctr: 0.2, position: 2 },
    { keys: ['thin data'], impressions: 10, clicks: 0, ctr: 0, position: 8 },
  ]);
  assert.deepEqual(result.map((row) => row.key), ['weak']);
});

test('service account JWT is a signed three-part token', () => {
  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const jwt = createServiceAccountJwt({
    client_email: 'search-console@example.iam.gserviceaccount.com',
    private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }),
  }, 1_700_000_000);
  assert.equal(jwt.split('.').length, 3);
});
