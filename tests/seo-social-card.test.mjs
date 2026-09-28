// The social card.
//
// Ahrefs reported "Open Graph tags incomplete" on 583 URLs. Every page carried
// og:title, og:description, og:url, og:site_name, og:locale and og:type, and no
// og:image. The Twitter card was worse than merely incomplete: it declared
// `summary_large_image`, which promises an image, and supplied none, so a
// shared Livdar link rendered as a bare text stub.
//
// These hold the parts that are easy to get wrong later: the URL has to be
// absolute, the file has to exist at the path the metadata claims, and the
// Twitter card type and the presence of an image have to stay in step.

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { buildMetadata } from '../lib/seo.js';
import { SITE_URL } from '../lib/routes.js';

const ROOT = new URL('../', import.meta.url);
const meta = () => buildMetadata({
  title: 'T', description: 'D', path: '/en/cost-of-living/germany/', locale: 'en', alternates: {},
});

test('every page declares an Open Graph image', () => {
  const m = meta();
  assert.ok(Array.isArray(m.openGraph.images) && m.openGraph.images.length === 1, 'exactly one og:image');
  const img = m.openGraph.images[0];
  assert.equal(img.width, 1200);
  assert.equal(img.height, 630);
  assert.ok(img.alt && img.alt.length > 20, 'the image carries alt text');
});

test('the image URL is absolute, because a relative one is ignored', () => {
  const url = meta().openGraph.images[0].url;
  assert.ok(url.startsWith('https://'), 'og:image is absolute, got ' + url);
  assert.ok(url.startsWith(SITE_URL), 'og:image is on this site, got ' + url);
});

test('the file exists where the metadata says it does', () => {
  // A 404 og:image is worse than none: consumers cache the failure.
  const url = meta().openGraph.images[0].url;
  const path = url.slice(SITE_URL.length);
  const file = new URL('public' + path, ROOT);
  assert.ok(existsSync(file), 'no file at public' + path);
  assert.ok(statSync(file).size > 10000, 'the card is suspiciously small');
});

test('the Twitter card type and the image stay in step', () => {
  // `summary_large_image` without an image is the bug this file exists for.
  const m = meta();
  assert.equal(m.twitter.card, 'summary_large_image');
  assert.ok(Array.isArray(m.twitter.images) && m.twitter.images.length === 1);
  assert.equal(m.twitter.images[0], m.openGraph.images[0].url);
});

test('nothing that was already there was lost', () => {
  const m = meta();
  assert.equal(m.openGraph.title, 'T');
  assert.equal(m.openGraph.description, 'D');
  assert.equal(m.openGraph.siteName, 'Livdar');
  assert.equal(m.openGraph.locale, 'en');
  assert.equal(m.openGraph.type, 'website');
  assert.equal(m.openGraph.url, SITE_URL + '/en/cost-of-living/germany/');
  assert.equal(m.alternates.canonical, SITE_URL + '/en/cost-of-living/germany/');
  assert.deepEqual(m.robots, { index: true, follow: true });
});

test('a caller may override the image without breaking the shape', () => {
  // Kept open so a surface can earn its own card later without this changing.
  const custom = { url: SITE_URL + '/img/other.png', width: 1200, height: 630, alt: 'other' };
  const m = buildMetadata({ title: 'T', description: 'D', path: '/en/', locale: 'en', alternates: {}, image: custom });
  assert.equal(m.openGraph.images[0].url, custom.url);
  assert.equal(m.twitter.images[0], custom.url);
});
