// Which URLs this may ever submit.
//
// Two sources, because the site has two. `enumeratePages` resolves the eSIM
// era pages out of the entity dataset, and the Atlas cohort manifests carry
// the 500 data pages. The Atlas was missing from this list entirely, so
// nothing under a cohort segment could be submitted at all.
//
// The guard used to be `length !== 91`, a tripwire on a number that was true
// the day it was written. The eSIM site grew to 115 pages and the tripwire
// fired on its own growth, so IndexNow has been refusing every submission,
// including the ones it was meant to allow. What is worth guarding is not the
// count but the origin: a submission may only name a canonical URL this site
// actually publishes, on this host, and IndexNow takes at most 10,000 in a
// request. That holds whatever either surface grows to.

import { enumeratePages } from './page-audit.mjs';
import { absolute, SITE_URL } from '../lib/routes.js';
import { pages as atlasPages } from '../lib/atlas/serve-pages.js';

const INDEXNOW_BATCH_LIMIT = 10000;

const key = process.env.INDEXNOW_KEY || '';
if (!/^[A-Za-z0-9-]{8,128}$/.test(key)) {
  throw new Error('INDEXNOW_KEY must contain 8-128 letters, numbers or dashes.');
}

const origin = new URL(SITE_URL).origin;
const host = new URL(origin).host;
const esim = enumeratePages()
  .filter((page) => page.type !== 'unresolved')
  .map((page) => absolute(page.path));
const atlas = atlasPages().map((page) => absolute(page.path));
const published = [...new Set([...esim, ...atlas])];

if (!published.length) {
  throw new Error('Refusing IndexNow submission: no published URLs resolved from either surface.');
}
const offHost = published.filter((url) => new URL(url).host !== host);
if (offHost.length) {
  throw new Error(`Refusing IndexNow submission: ${offHost.length} URL(s) are not on ${host}, first ${offHost[0]}.`);
}

const pathIndex = process.argv.indexOf('--paths');
const requestedPaths = pathIndex >= 0 ? process.argv[pathIndex + 1]?.split(',') : null;
if (pathIndex >= 0 && (!requestedPaths || requestedPaths.some((path) => !path))) {
  throw new Error('--paths requires comma-separated published paths.');
}
const allowed = new Set(published);
const urlList = requestedPaths
  ? [...new Set(requestedPaths.map((path) => new URL(path, origin).href))]
  : published;
const unknown = urlList.filter((url) => !allowed.has(url));
if (unknown.length) {
  throw new Error(`IndexNow only accepts canonical URLs from the published registry. ${unknown.length} not published, first ${unknown[0]}.`);
}
if (urlList.length > INDEXNOW_BATCH_LIMIT) {
  throw new Error(`IndexNow takes at most ${INDEXNOW_BATCH_LIMIT} URLs in a request, asked for ${urlList.length}.`);
}

const payload = {
  host,
  key,
  keyLocation: `${origin}/indexnow-key.txt`,
  urlList,
};

if (!process.argv.includes('--submit')) {
  console.log(JSON.stringify({
    mode: 'dry-run',
    endpoint: 'https://api.indexnow.org/indexnow',
    host,
    keyLocation: payload.keyLocation,
    urlList,
  }, null, 2));
  process.exit(0);
}

if (process.env.INDEXNOW_CONFIRM_LIVE !== 'true') {
  throw new Error('Set INDEXNOW_CONFIRM_LIVE=true only after confirming the current production deployment and changed URLs.');
}
if (!requestedPaths) {
  throw new Error('Live submission requires --paths with the changed published URLs.');
}
const keyResponse = await fetch(payload.keyLocation);
if (!keyResponse.ok || (await keyResponse.text()).trim() !== key) {
  throw new Error('The IndexNow key is not verifiable on the live canonical domain.');
}

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
});

if (![200, 202].includes(response.status)) {
  const body = await response.text();
  throw new Error(`IndexNow rejected the submission (${response.status}): ${body || response.statusText}`);
}

console.log(`IndexNow accepted ${urlList.length} URLs with status ${response.status}.`);
