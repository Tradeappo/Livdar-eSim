// Is Search Console actually connected?
//
//   node scripts/gsc-check.mjs
//   node scripts/gsc-check.mjs --ci      exit 1 when it is not granted
//
// "The workflow exists" is not an answer to that question, and until today it
// was the only answer available. The scheduled import has run once, at
// 10:24 on 2026-09-25, and it reported success. What it actually did was print
//
//   Error: GSC_PROPERTY is required, for example sc-domain:livdar.com.
//   Search Console credentials are not configured; skipping the import.
//
// in 0.03 seconds, because the step was written as `node scripts/gsc-report.mjs
// || echo ...`. A step that cannot fail cannot tell you anything.
//
// So this does the three things in order and reports each one separately,
// because they fail for different reasons and the remedies are not the same.
//
//   1. configured   the three names are present in the environment
//   2. authorised   Google issues an access token for the service account
//   3. granted      the property answers for that account
//
// A service account can be perfectly valid and have no access to the property,
// which reads as a 403 on step 3 and is fixed in Search Console rather than in
// Google Cloud. Distinguishing those two is the reason this is not one boolean.
//
// Authentication is Workload Identity Federation only: the job's OIDC token is
// exchanged for a short lived token of the service account. No private key is
// read, and a key that is still lying around in the environment is reported as
// ignored so nobody mistakes it for what made the run work.
//
// It prints no secret. The service account email is an identifier and is shown
// because it is the thing that has to be added as a user in Search Console.

import { getAccessToken, googleCredentialsFromEnv } from './lib/google-search-console.mjs';

export async function check(env = process.env, fetchImpl = fetch, read) {
  const out = { configured: false, authorised: false, granted: false, missing: [], property: env.GSC_PROPERTY || null, clientEmail: null, auth: null, staticKey: 'not used', why: null };

  const account = googleCredentialsFromEnv(env, read);
  if (account.ignored?.length) out.staticKey = 'ignored: ' + account.ignored.join(', ') + ' is set and is not read';
  if (!env.GSC_PROPERTY) out.missing.push('GSC_PROPERTY');
  if (!account.credentials) out.missing.push(...(account.missing || []));
  if (out.missing.length) {
    out.why = 'not configured: ' + out.missing.join(', ');
    return out;
  }
  out.configured = true;
  out.auth = account.source;
  out.clientEmail = account.principal;

  let token;
  try {
    token = await getAccessToken(account.credentials, fetchImpl, undefined, read);
    out.authorised = true;
  } catch (err) {
    out.why = 'the service account did not get a token: ' + err.message;
    return out;
  }

  // The cheapest call that proves the property is readable by this account.
  try {
    const site = encodeURIComponent(env.GSC_PROPERTY);
    const r = await fetchImpl('https://www.googleapis.com/webmasters/v3/sites/' + site, { headers: { authorization: 'Bearer ' + token } });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) {
      out.why = 'the property refused this account (' + r.status + '): ' + (body.error?.message || 'no message')
        + '. Add ' + out.clientEmail + ' as a user of ' + env.GSC_PROPERTY + ' in Search Console.';
      return out;
    }
    out.granted = true;
    out.permission = body.permissionLevel || null;
    out.why = 'connected';
  } catch (err) {
    out.why = 'the property could not be read: ' + err.message;
  }
  return out;
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = await check();
  console.log(JSON.stringify(r, null, 1));
  if (process.argv.includes('--ci') && !r.granted) process.exit(1);
}
