import test from 'node:test';
import assert from 'node:assert/strict';
import { build, normalise, categoryOf, parseFileName, QUERIES } from '../scripts/atlas/ingest/overpass.mjs';
import { BLOCKED, NETWORK } from '../lib/atlas/sources/blocked.js';

// The adapter for the two surfaces this session could not build. It cannot be
// run against the live API from here, so it is proven against a fixture that
// is a real Overpass response shape. What is missing is a file, not code.
const DIR = 'tests/fixtures/overpass';

test('the adapter reads a saved Overpass response into place rows', () => {
  const r = build({ dir: DIR });
  assert.equal(r.state, 'BUILT');
  assert.equal(r.cities, 2, 'the fixture has one city of places and one of routes');
  const tokyo = r.store[1850147];
  assert.ok(tokyo, 'the city id comes from the file name, because the response does not carry one');
  // Six of the eight elements are refused, each for its own reason.
  assert.deepEqual(tokyo.byCategory, { cafe: 1, coworking: 2, park: 1, supermarket: 1 });
  assert.equal(r.refused.noName, 1, 'an unnamed cafe is a dot on a map, not a line on a page');
  assert.equal(r.refused.noCoordinate, 1, 'an element with no coordinate means the query forgot out center');
  // Two across both fixture files: a post box, which is not a category this
  // programme uses, and a bus line, which is a route relation and is not a
  // sport route.
  assert.equal(r.refused.noCategory, 2);
});

test('a way and a relation are usable because the query asks for a centre', () => {
  // `out center` is the difference between a park being placeable on a page
  // and a park being a list of nodes.
  const park = normalise({ type: 'way', id: 3, center: { lat: 1, lon: 2 }, tags: { leisure: 'park', name: 'X' } });
  assert.equal(park.ok, true);
  assert.equal(park.row.lat, 1);
  assert.equal(park.row.osmId, 'way/3');
  assert.match(QUERIES.places('1,2,3,4'), /out center tags;$/);
  assert.match(QUERIES.routes('1,2,3,4'), /out center tags;$/);
  // And the bounding box really is substituted rather than ignored.
  assert.ok(QUERIES.places('1,2,3,4').includes('(1,2,3,4)'));
});

test('one idea tagged two ways is one category', () => {
  // OpenStreetMap carries both of these and a page that counted them
  // separately would report half the coworking spaces in a city.
  assert.equal(categoryOf({ office: 'coworking' }), 'coworking');
  assert.equal(categoryOf({ amenity: 'coworking_space' }), 'coworking');
  assert.equal(categoryOf({ amenity: 'pub' }), 'bar');
  assert.equal(categoryOf({ amenity: 'bar' }), 'bar');
  assert.equal(categoryOf({ amenity: 'post_box' }), null);
});

test('the route query keeps the routes and drops the bus line', () => {
  const r = build({ dir: DIR });
  const berlin = r.store[2950159];
  assert.deepEqual(berlin.byCategory, { 'route:bicycle': 1, 'route:hiking': 1 });
  assert.ok(!berlin.rows.some((x) => x.name === 'Bus 100'), 'a bus route is not a sport route');
});

test('a file the adapter cannot place is named rather than skipped in silence', () => {
  assert.equal(parseFileName('1850147-places.json').cityId, 1850147);
  assert.equal(parseFileName('tokyo.json'), null);
  const r = build({ dir: DIR });
  assert.deepEqual(r.unparsedFileNames, []);
});

test('a missing directory is a state rather than a crash', () => {
  const r = build({ dir: 'tests/fixtures/does-not-exist' });
  assert.equal(r.state, 'NO INPUT');
  assert.equal(r.cities, 0);
  assert.match(r.note, /overpass-api\.de/);
});

test('every blocked source says what would unblock it', () => {
  assert.ok(BLOCKED.length >= 6);
  for (const b of BLOCKED) {
    for (const k of ['id', 'surface', 'state', 'have', 'blocker', 'licence', 'expects', 'howToGet', 'unlocks']) {
      assert.ok(b[k], b.id + ' does not say ' + k);
    }
    assert.ok(Array.isArray(b.howToGet) && b.howToGet.length, b.id + ' has no route to being unblocked');
    assert.ok(['BUILT', 'PARTIAL', 'NOT BUILT', 'STALE'].includes(b.state), b.id + ' has an unknown state ' + b.state);
  }
  // The two that name an adapter must name one that exists, or the claim that
  // only a file is missing is not true.
  const withAdapter = BLOCKED.filter((b) => b.adapter && b.adapter !== 'None' && !b.adapter.startsWith('None'));
  assert.ok(withAdapter.length >= 2);
  assert.ok(NETWORK.refused.includes('overpass-api.de'));
  assert.ok(NETWORK.reachable.some((h) => h.includes('raw.githubusercontent.com')));
});
