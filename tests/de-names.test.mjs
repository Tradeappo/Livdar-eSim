import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DESTINATIONS, REGIONS, PINNED_SLUGS, destinationSlug, findDestinationBySlug } from '../lib/destinations.js';
import { MAP } from '../scripts/fix-german-umlauts.mjs';

// German display names must be spelled with umlauts. The words in the umlaut
// table are the transliterated spellings that must never reach a German page.
test('German destination and region names carry no transliterated spelling', () => {
  const names = [...DESTINATIONS.map((d) => d.names.de), ...REGIONS.map((r) => r.names.de)].filter(Boolean);
  const bad = names.filter((n) => n.split(/[^A-Za-zÄÖÜäöüß]+/).some((w) => MAP[w]));
  assert.deepEqual(bad, []);
  assert.equal(REGIONS.find((r) => r.id === 'southeast-asia').names.de, 'Südostasien');
  assert.equal(REGIONS.find((r) => r.id === 'south-america').names.de, 'Südamerika');
});

// The URLs went live with the transliterated slugs. Fixing the display name
// must not move them.
test('German destination slugs stay on the published spelling', () => {
  const expected = {
    turkey: 'tuerkei', 'united-kingdom': 'grossbritannien', austria: 'oesterreich', romania: 'rumaenien',
    denmark: 'daenemark', 'south-korea': 'suedkorea', egypt: 'aegypten', 'south-africa': 'suedafrika', ethiopia: 'aethiopien',
  };
  Object.entries(expected).forEach(([id, slug]) => {
    const d = DESTINATIONS.find((x) => x.id === id);
    assert.equal(destinationSlug(d, 'de'), slug, id);
    assert.equal(findDestinationBySlug(slug, 'de').id, id);
  });
  Object.keys(PINNED_SLUGS.de).forEach((id) => assert.ok(DESTINATIONS.some((d) => d.id === id), id));
});
