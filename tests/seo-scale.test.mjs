import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLlmsText } from '../app/llms.txt/route.js';
import { expectedPublishedUrls } from '../scripts/publication.mjs';
import { CONTENT_LAST_MODIFIED, lastModifiedFor } from '../lib/content-freshness.js';

test('llms files disclose the sample catalogue and full inventory covers every published URL', () => {
  const compact = buildLlmsText();
  const full = buildLlmsText({ full: true });
  const inventory = full.split('## Complete published URL inventory')[1] || '';
  const urls = new Set(inventory.match(/https:\/\/livdar\.com[^\s)]+/g) || []);

  assert.match(compact, /illustrative placeholders/);
  assert.match(compact, /must not be\s+quoted as prices/);
  assert.match(full, /Complete published URL inventory/);
  assert.equal(urls.size, expectedPublishedUrls());
});

test('sitemap freshness is version controlled and valid', () => {
  Object.values(CONTENT_LAST_MODIFIED).forEach((value) => assert.ok(Number.isFinite(Date.parse(value))));
  assert.equal(lastModifiedFor('unknown').toISOString(), CONTENT_LAST_MODIFIED.core);
});
