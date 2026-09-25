import test from 'node:test';
import assert from 'node:assert/strict';
import {
  compareTotals,
  googleCredentialsFromEnv,
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

test('Google credentials come only from workload identity federation', () => {
  assert.ok(googleCredentialsFromEnv({}).missing[0].startsWith('GOOGLE_APPLICATION_CREDENTIALS'));
  const key = googleCredentialsFromEnv({ GOOGLE_APPLICATION_CREDENTIALS: 'k.json' }, () => JSON.stringify({ type: 'service_account' }));
  assert.equal(key.credentials, null);
  const wif = googleCredentialsFromEnv({ GOOGLE_APPLICATION_CREDENTIALS: 'w.json' }, () => JSON.stringify({
    type: 'external_account',
    service_account_impersonation_url: 'https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/a%40b.iam.gserviceaccount.com:generateAccessToken',
  }));
  assert.equal(wif.principal, 'a@b.iam.gserviceaccount.com');
});
