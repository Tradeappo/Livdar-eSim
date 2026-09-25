import { readFileSync } from 'node:fs';

const READONLY_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const CLOUD_PLATFORM_SCOPE = 'https://www.googleapis.com/auth/cloud-platform';

// How the scripts authenticate to Google: Application Default Credentials of
// the external_account kind, which is what Workload Identity Federation writes.
//
// In GitHub Actions, google-github-actions/auth exchanges the job's OIDC token
// for nothing at all; it only writes a credentials file that says where to get
// that token, which pool to present it to and which service account to
// impersonate, and points GOOGLE_APPLICATION_CREDENTIALS at it. No private key
// exists anywhere: not in the repository, not in a secret, not in the file.
//
// A service account key file is refused on purpose rather than accepted as a
// fallback. The old path read GSC_PRIVATE_KEY or GOOGLE_SERVICE_ACCOUNT_JSON and
// signed a JWT; keeping it "just in case" is how a static key comes back, so the
// refusal names it instead.
//
// It returns what is missing rather than throwing, because the caller has to be
// able to say which part is absent and one that throws can only say that
// something is.
export function googleCredentialsFromEnv(env = process.env, read = (f) => readFileSync(f, 'utf8')) {
  const legacy = ['GSC_PRIVATE_KEY', 'GOOGLE_SERVICE_ACCOUNT_JSON'].filter((k) => env[k]);
  const path = env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!path) {
    return {
      credentials: null, source: null, principal: null,
      missing: ['GOOGLE_APPLICATION_CREDENTIALS (written by google-github-actions/auth through Workload Identity Federation)'],
      ignored: legacy,
    };
  }
  let config;
  try {
    config = JSON.parse(read(path));
  } catch (err) {
    return { credentials: null, source: null, principal: null, missing: ['a readable credentials file at GOOGLE_APPLICATION_CREDENTIALS: ' + err.message], ignored: legacy };
  }
  if (config.type !== 'external_account') {
    return {
      credentials: null, source: null, principal: null,
      missing: ['external_account credentials: GOOGLE_APPLICATION_CREDENTIALS holds "' + (config.type || 'unknown') + '", and static service account keys are refused'],
      ignored: legacy,
    };
  }
  const principal = decodeURIComponent((String(config.service_account_impersonation_url || '').match(/serviceAccounts\/([^:]+):generateAccessToken/) || [])[1] || '') || null;
  return { credentials: config, source: 'workload identity federation', principal, missing: [], ignored: legacy };
}

async function subjectToken(source, fetchImpl, read) {
  let raw;
  if (source.file) {
    raw = read(source.file);
  } else if (source.url) {
    const r = await fetchImpl(source.url, { headers: source.headers || {} });
    if (!r.ok) throw new Error('the OIDC token request failed (' + r.status + ')');
    raw = await r.text();
  } else {
    throw new Error('the credentials file names neither a file nor a url for the subject token');
  }
  const format = source.format || { type: 'text' };
  if (format.type === 'json') {
    const value = JSON.parse(raw)[format.subject_token_field_name];
    if (!value) throw new Error('the OIDC response has no ' + format.subject_token_field_name);
    return value;
  }
  return String(raw).trim();
}

// OIDC token -> Security Token Service -> short lived access token for the
// service account, minted for the scope the caller is about to use. Search
// Console reads webmasters.readonly and the GA4 Data API reads
// analytics.readonly, and a token minted for the wrong one fails with a message
// that names neither.
export async function getAccessToken(credentials, fetchImpl = fetch, scope = READONLY_SCOPE, read = (f) => readFileSync(f, 'utf8')) {
  if (!credentials || credentials.type !== 'external_account') {
    throw new Error('Google auth needs external_account (Workload Identity Federation) credentials; none were given.');
  }
  const token = await subjectToken(credentials.credential_source || {}, fetchImpl, read);
  const sts = await fetchImpl(credentials.token_url || 'https://sts.googleapis.com/v1/token', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      grantType: 'urn:ietf:params:oauth:grant-type:token-exchange',
      audience: credentials.audience,
      scope: credentials.service_account_impersonation_url ? CLOUD_PLATFORM_SCOPE : scope,
      requestedTokenType: 'urn:ietf:params:oauth:token-type:access_token',
      subjectToken: token,
      subjectTokenType: credentials.subject_token_type,
    }),
  });
  const stsBody = await sts.json().catch(() => ({}));
  if (!sts.ok || !stsBody.access_token) {
    throw new Error('the Security Token Service refused the federated token (' + sts.status + '): ' + (stsBody.error_description || stsBody.error || 'no message'));
  }
  if (!credentials.service_account_impersonation_url) return stsBody.access_token;

  const imp = await fetchImpl(credentials.service_account_impersonation_url, {
    method: 'POST',
    headers: { authorization: 'Bearer ' + stsBody.access_token, 'content-type': 'application/json' },
    body: JSON.stringify({ scope: [scope], lifetime: '3600s' }),
  });
  const impBody = await imp.json().catch(() => ({}));
  if (!imp.ok || !impBody.accessToken) {
    throw new Error('impersonating the service account failed (' + imp.status + '): ' + (impBody.error?.message || 'no message')
      + '. The federated identity needs roles/iam.workloadIdentityUser on it.');
  }
  return impBody.accessToken;
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
