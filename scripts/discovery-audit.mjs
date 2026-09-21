import { expectedPublishedUrls } from './publication.mjs';
import { existsSync } from 'node:fs';
import { enumeratePages } from './page-audit.mjs';
import { buildLlmsText } from '../app/llms.txt/route.js';
import { CONTENT_LAST_MODIFIED } from '../lib/content-freshness.js';

const root = new URL('../', import.meta.url);
const pages = enumeratePages().filter((page) => page.type !== 'unresolved');
const inventory = buildLlmsText({ full: true }).split('## Complete published URL inventory')[1] || '';
const llmsUrls = new Set(inventory.match(/https:\/\/livdar\.com[^\s)]+/g) || []);
const requiredOperations = [
  'app/indexnow-key.txt/route.js',
  'scripts/indexnow-submit.mjs',
  'scripts/gsc-report.mjs',
  'scripts/lib/google-search-console.mjs',
];

// The expected count comes from the publication registry, so adding a page
// means approving it there, and a page that appears without approval fails.
const expected = expectedPublishedUrls();

const report = {
  expectedPublishedUrls: expected,
  publishedUrls: pages.length,
  llmsInventoryUrls: llmsUrls.size,
  freshnessFamilies: Object.keys(CONTENT_LAST_MODIFIED).sort(),
  operations: Object.fromEntries(requiredOperations.map((path) => [path, existsSync(new URL(path, root))])),
};
report.ok = report.publishedUrls === expected
  && report.llmsInventoryUrls === expected
  && Object.values(report.operations).every(Boolean)
  && Object.values(CONTENT_LAST_MODIFIED).every((date) => Number.isFinite(Date.parse(date)));

console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exitCode = 1;
