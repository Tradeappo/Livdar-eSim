// The Atlas block on eSIM destination pages: same language, same country, published pages only,
// anchors are the target's own heading, at most MAX_LINKS, and the route reads a small file
// rather than a page shard.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { pages } from '../lib/atlas/serve-pages.js';
import { MAX_LINKS, atlasLinksForDestination, isPartOfCountry } from '../lib/atlas/destination-links.js';
import { publishedDestinationIds } from '../lib/content/index.js';
import { getDestination } from '../lib/destinations.js';

const FILE = new URL('../data/atlas/cohorts/by-group/destination-links.json', import.meta.url);
const byPath = new Map(pages().map((p) => [p.path, p]));

test('the shard step writes the destination links, and the file stays small', () => {
  const doc = JSON.parse(readFileSync(FILE, 'utf8'));
  assert.ok(Object.keys(doc.en || {}).length >= 10, 'English destinations with links: ' + Object.keys(doc.en || {}).length);
  assert.ok(statSync(FILE).size < 100_000, 'destination-links.json is ' + statSync(FILE).size + ' bytes');
});

test('every link is a published page in the same language, about the same country', () => {
  let n = 0;
  for (const locale of ['en', 'de', 'ro']) {
    for (const id of publishedDestinationIds(locale)) {
      const dest = getDestination(id);
      const links = atlasLinksForDestination(locale, id);
      if (isPartOfCountry(dest)) { assert.equal(links.length, 0, id + ' is part of a country'); continue; }
      assert.ok(links.length <= MAX_LINKS, locale + ' ' + id + ' has ' + links.length);
      assert.equal(new Set(links.map((l) => l.href)).size, links.length, locale + ' ' + id + ' repeats a link');
      for (const l of links) {
        n++;
        const p = byPath.get(l.href);
        assert.ok(p, l.href + ' is not published');
        assert.equal(p.locale, locale, l.href + ' is in another language');
        assert.equal(l.title, p.h1, l.href + ' anchor is not its heading');
        const iso = String(p.iso2 || p.entity).toUpperCase();
        assert.equal(iso, dest.iso2.toUpperCase(), l.href + ' is not about ' + dest.iso2);
      }
    }
  }
  assert.ok(n >= 100, 'only ' + n + ' links checked');
});

test('the destination route does not load an Atlas page shard', () => {
  const src = readFileSync(new URL('../lib/atlas/destination-links.js', import.meta.url), 'utf8');
  const runtime = src.slice(src.indexOf('let cache'));
  assert.doesNotMatch(runtime, /pages\(|pagesForGroup/);
});
