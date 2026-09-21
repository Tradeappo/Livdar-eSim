import { enumeratePages } from './page-audit.mjs';
import { absolute, SITE_URL } from '../lib/routes.js';

const key = process.env.INDEXNOW_KEY || '';
if (!/^[A-Za-z0-9-]{8,128}$/.test(key)) {
  throw new Error('INDEXNOW_KEY must contain 8-128 letters, numbers or dashes.');
}

const origin = new URL(SITE_URL).origin;
const host = new URL(origin).host;
const published = enumeratePages()
  .filter((page) => page.type !== 'unresolved')
  .map((page) => absolute(page.path));

if (published.length !== 91 || published.some((url) => new URL(url).host !== host)) {
  throw new Error(`Refusing IndexNow submission: expected 91 ${host} URLs, found ${published.length}.`);
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
if (urlList.some((url) => !allowed.has(url))) {
  throw new Error('IndexNow only accepts canonical URLs from the published registry.');
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
