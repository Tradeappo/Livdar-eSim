import { createSign } from 'node:crypto';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const READONLY_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

// The credentials, from whichever shape the environment holds them in.
//
// Two shapes exist because two things were built against two different
// assumptions and neither noticed the other. This script has always read
// GOOGLE_SERVICE_ACCOUNT_JSON; .github/workflows/atlas-search-console.yml has
// always passed GSC_CLIENT_EMAIL and GSC_PRIVATE_KEY. So even with every secret
// set the import could not have worked, and the `|| echo` behind it meant the
// run went green anyway. Reading both shapes is the smaller half of the fix;
// the workflow no longer swallowing the failure is the larger one.
//
// It returns what is missing rather than throwing, because the caller has to be
// able to say which credential is absent and one that throws can only say that
// something is.
export function serviceAccountFromEnv(env = process.env) {
  if (env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return { credentials: parseServiceAccount(env.GOOGLE_SERVICE_ACCOUNT_JSON), shape: 'GOOGLE_SERVICE_ACCOUNT_JSON' };
  }
  const missing = ['GSC_CLIENT_EMAIL', 'GSC_PRIVATE_KEY'].filter((k) => !env[k]);
  if (missing.length) {
    return { credentials: null, shape: null, missing: missing.concat(['GOOGLE_SERVICE_ACCOUNT_JSON (or the two above)']) };
  }
  return {
    credentials: {
      client_email: env.GSC_CLIENT_EMAIL,
      // A private key in an environment variable arrives with its newlines
      // escaped more often than not, and a key with literal backslash n in it
      // fails to sign with an error that names neither the key nor the newline.
      private_key: String(env.GSC_PRIVATE_KEY).replace(/\\n/g, '\n'),
    },
    shape: 'GSC_CLIENT_EMAIL and GSC_PRIVATE_KEY',
  };
}

export function parseServiceAccount(raw) {
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is required.');
  let credentials;
  try {
    credentials = JSON.parse(raw);
  } catch {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON must be valid JSON.');
  }
  if (!credentials.client_email || !credentials.private_key) {
    throw new Error('The service account JSON must include client_email and private_key.');
  }
  return credentials;
}

export function createServiceAccountJwt(credentials, nowSeconds = Math.floor(Date.now() / 1000), scope = READONLY_SCOPE) {
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64url(JSON.stringify({
    iss: credentials.client_email,
    scope,
    aud: TOKEN_URL,
    iat: nowSeconds,
    exp: nowSeconds + 3600,
  }));
  const unsigned = `${header}.${claim}`;
  const signature = createSign('RSA-SHA256').update(unsigned).sign(credentials.private_key, 'base64url');
  return `${unsigned}.${signature}`;
}

// The scope is a parameter because two APIs now share this path: Search Console
// reads webmasters.readonly and the GA4 Data API reads analytics.readonly, and a
// token minted for the wrong one fails with a message that names neither.
export async function getAccessToken(credentials, fetchImpl = fetch, scope = READONLY_SCOPE) {
  const response = await fetchImpl(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: createServiceAccountJwt(credentials, Math.floor(Date.now() / 1000), scope),
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.access_token) {
    throw new Error(`Google OAuth failed (${response.status}): ${body.error_description || body.error || 'unknown error'}`);
  }
  return body.access_token;
}

export async function querySearchAnalytics({ accessToken, property, startDate, endDate, dimensions = [], rowLimit = 25000, fetchImpl = fetch }) {
  const site = encodeURIComponent(property);
  const response = await fetchImpl(`https://www.googleapis.com/webmasters/v3/sites/${site}/searchAnalytics/query`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ startDate, endDate, dimensions, rowLimit, dataState: 'final' }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Search Console query failed (${response.status}): ${body.error?.message || 'unknown error'}`);
  }
  return body.rows || [];
}

export function dateRange(days, endDate = new Date(Date.now() - 3 * 86400000)) {
  const iso = (date) => date.toISOString().slice(0, 10);
  const end = new Date(endDate);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - days + 1);
  const previousEnd = new Date(start);
  previousEnd.setUTCDate(previousEnd.getUTCDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setUTCDate(previousStart.getUTCDate() - days + 1);
  return {
    current: { startDate: iso(start), endDate: iso(end) },
    previous: { startDate: iso(previousStart), endDate: iso(previousEnd) },
  };
}

function percentChange(current, previous) {
  if (!previous) return current ? null : 0;
  return ((current - previous) / previous) * 100;
}

export function summarizeTotal(rows) {
  const row = rows[0] || {};
  return {
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: row.ctr || 0,
    position: row.position || 0,
  };
}

export function compareTotals(current, previous, thresholds) {
  const changes = {
    clicksPercent: percentChange(current.clicks, previous.clicks),
    impressionsPercent: percentChange(current.impressions, previous.impressions),
    ctrPercent: percentChange(current.ctr, previous.ctr),
    positionDelta: current.position && previous.position ? current.position - previous.position : 0,
  };
  const enoughData = previous.impressions >= thresholds.minimumImpressions;
  const alerts = [];
  if (enoughData && changes.clicksPercent !== null && changes.clicksPercent <= -thresholds.clickDropPercent) alerts.push('click-drop');
  if (enoughData && changes.impressionsPercent !== null && changes.impressionsPercent <= -thresholds.impressionDropPercent) alerts.push('impression-drop');
  if (enoughData && changes.ctrPercent !== null && changes.ctrPercent <= -thresholds.ctrDropPercent) alerts.push('ctr-drop');
  if (enoughData && changes.positionDelta >= thresholds.positionLoss) alerts.push('position-loss');
  return { current, previous, changes, alerts };
}

export function topOpportunities(rows, limit = 25) {
  return rows
    .filter((row) => row.impressions >= 20 && row.position >= 4 && row.position <= 20)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, limit)
    .map((row) => ({
      key: row.keys?.[0] || '',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0,
    }));
}
