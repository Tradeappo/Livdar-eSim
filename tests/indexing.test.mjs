import test from 'node:test';
import assert from 'node:assert/strict';
import { indexingAllowed } from '../lib/indexing.js';

test('Vercel previews stay noindex even with a broad allow flag', () => {
  assert.equal(indexingAllowed({ VERCEL_ENV: 'preview', NEXT_PUBLIC_ALLOW_INDEXING: 'true' }), false);
});

test('production can be explicitly opened or closed', () => {
  assert.equal(indexingAllowed({ VERCEL_ENV: 'production', NEXT_PUBLIC_ALLOW_INDEXING: 'true' }), true);
  assert.equal(indexingAllowed({ VERCEL_ENV: 'production', NEXT_PUBLIC_ALLOW_INDEXING: 'false' }), false);
});
