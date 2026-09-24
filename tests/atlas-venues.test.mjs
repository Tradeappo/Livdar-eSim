import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { run, CAPACITY_RANGE, MAX_CITY_KM, CLASSES, distanceKm, nearestCity, cityGrid, normaliseDashes } from '../scripts/atlas/ingest/venues.mjs';
import { SOURCES } from '../lib/atlas/sources/registry.js';

const STORE = new URL('../data/atlas/sources/venues/by-country/', import.meta.url);
const SUMMARY = new URL('../data/atlas/sources/venues/normalized.json', import.meta.url);

test('the venue store exists, is sharded, and every row is placed', () => {
  assert.ok(existsSync(SUMMARY), 'the venue source has not been ingested');
  const summary = JSON.parse(readFileSync(SUMMARY, 'utf8'));
  assert.ok(summary.kept > 5000, 'only ' + summary.kept + ' venues kept');
  assert.ok(summary.cities > 1000);

  // Sharded by country rather than one file, because the scale rules forbid
  // a store that has to be loaded whole to read one country.
  const shards = readdirSync(STORE).filter((f) => f.endsWith('.json'));
  assert.ok(shards.length >= 10, 'only ' + shards.length + ' country shards');
  let total = 0;
  for (const f of shards) {
    const j = JSON.parse(readFileSync(new URL(f, STORE), 'utf8'));
    assert.equal(j.iso2, f.replace('.json', ''));
    assert.equal(j.venues, j.rows.length);
    total += j.rows.length;
    for (const v of j.rows) {
      assert.ok(v.id.startsWith('Q'), v.id + ' is not a Wikidata id');
      assert.ok(v.name && v.name.length, v.id + ' has no name');
      assert.ok(typeof v.lat === 'number' && typeof v.lon === 'number', v.id + ' is not placed');
      assert.ok(v.cityId && v.cityName, v.id + ' has no city');
      assert.ok(v.cityKm <= MAX_CITY_KM, v.id + ' is ' + v.cityKm + 'km from its city');
      assert.ok(v.types.length, v.id + ' has no type');
      for (const t of v.types) assert.ok(Object.values(CLASSES).includes(t), v.id + ' has type ' + t);
    }
  }
  assert.equal(total, summary.kept);
});

test('every venue carries provenance and the confidence the source deserves', () => {
  const shards = readdirSync(STORE).filter((f) => f.endsWith('.json'));
  for (const f of shards) {
    const j = JSON.parse(readFileSync(new URL(f, STORE), 'utf8'));
    for (const v of j.rows) {
      const p = v.provenance;
      assert.ok(p, v.id + ' has no provenance');
      assert.equal(p.source, 'Wikidata');
      assert.equal(p.sourceRef, v.id);
      assert.ok(p.licence.includes('CC0'), v.id + ' has licence ' + p.licence);
      assert.ok(p.observedAt && p.ingestedAt);
      // Community edited data cannot claim to be official. Every capacity on
      // this source is `declared`, the lowest confidence that publishes, and
      // a page whose whole purpose is an authoritative figure must not use
      // it. If this ever loosens, that guard is gone.
      assert.equal(p.confidence, 'declared', v.id + ' claims confidence ' + p.confidence);
      if (v.capacity != null) assert.equal(v.capacityConfidence, 'declared');
      assert.ok(p.note.includes('Community edited'), v.id + ' no longer says the source is community edited');
    }
  }
});

test('the gates threw away real rows rather than passing everything', () => {
  const r = run();
  assert.ok(r.rejected.impossibleCapacity > 0, 'the capacity range caught nothing, so it is not doing anything');
  assert.ok(r.rejected.noCity > 0, 'the distance gate caught nothing');
  assert.ok(r.kept < r.seen, 'nothing was rejected at all');
  // The rejected samples are kept so the gate can be checked by eye rather
  // than trusted. One of them is a stadium that was never built.
  assert.ok(r.rejectedSamples.length, 'no sample of what was rejected');
  for (const s of r.rejectedSamples) {
    assert.ok(s.capacity < CAPACITY_RANGE.min || s.capacity > CAPACITY_RANGE.max, s.name + ' was rejected and is inside the range');
  }
});

test('distance and city matching are correct rather than approximately correct', () => {
  // Madrid to Barcelona is about 505km in a straight line.
  const madrid = { lat: 40.4168, lon: -3.7038 };
  const barcelona = { lat: 41.3874, lon: 2.1686 };
  const km = distanceKm(madrid, barcelona);
  assert.ok(km > 480 && km < 530, 'Madrid to Barcelona came out as ' + Math.round(km) + 'km');
  assert.equal(Math.round(distanceKm(madrid, madrid)), 0);

  // The grid must not match a city in a different country, however close.
  const grid = cityGrid([
    { id: 1, name: 'Near but foreign', lat: 40.42, lon: -3.70, iso2: 'PT' },
    { id: 2, name: 'Right country', lat: 40.50, lon: -3.80, iso2: 'ES' },
  ]);
  const hit = nearestCity(grid, { lat: 40.4168, lon: -3.7038, iso2: 'ES' });
  assert.equal(hit.city.id, 2, 'the match crossed a border to a nearer city');
});

test('a long dash in a source name is normalised and the change is recorded', () => {
  const en = String.fromCodePoint(0x2013);
  const a = normaliseDashes('Samford Stadium' + en + 'Hitchcock Field');
  assert.equal(a.changed, true);
  assert.equal(a.text.includes(en), false);
  assert.equal(a.text, 'Samford Stadium-Hitchcock Field');
  assert.equal(normaliseDashes('Wembley Stadium').changed, false);

  // The flag has to survive into the store, or the change is silent.
  const us = JSON.parse(readFileSync(new URL('US.json', STORE), 'utf8'));
  const flagged = us.rows.filter((v) => v.dashNormalised);
  assert.ok(flagged.length > 0, 'no name was normalised, so the flag is never exercised');
  for (const v of us.rows) assert.equal(typeof v.dashNormalised, 'boolean', v.id + ' has no dash flag');
});

test('the registry says the source is built and says what it costs in confidence', () => {
  const s = SOURCES['venue-data-verified'];
  assert.equal(s.state, 'built');
  assert.equal(s.commercialReuse, true);
  assert.ok(s.ingest && s.store, 'the registry does not say how it was built or where it lives');
  assert.ok(/community edited/i.test(s.note), 'the registry no longer records the confidence cost');
  // It unlocks a family that still needs a source nobody has, and saying so
  // is the point: building this did not make that family publishable.
  assert.deepEqual(s.unlocks, ['stay.near-venue']);
});
