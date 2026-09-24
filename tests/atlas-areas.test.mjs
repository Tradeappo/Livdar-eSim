import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { build as buildSource, fold as foldHubs, MAX_KM, MIN_CITY_POP, MIN_NEIGHBOURHOODS, MIN_CENTRAL, CENTRAL_KM } from '../scripts/atlas/ingest/neighbourhood-facts.mjs';
import { cityOf, run as measureAreas, CITY_NAMES } from '../scripts/atlas/measure-areas.mjs';
import { forCity, store as hoodStore, cityIds } from '../lib/atlas/neighbourhoods.js';
import { build, words, PACKS } from '../lib/atlas/atlas-model.js';
import { distanceKm } from '../lib/atlas/geo.js';
import { FAMILIES } from '../lib/atlas/verticals.js';

const LANGS = ['en', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'ja'];
const FAMILY = 'neighbourhoods.city-where-to-stay';
const page = (entity, language, market, keyword) => build({ family: FAMILY, surface: 'areas', entity, language, market, keyword });

test('every city in the source clears the gates the source claims', () => {
  const s = hoodStore();
  assert.equal(s.gates.maxKm, MAX_KM);
  assert.ok(cityIds().length >= 20, 'only ' + cityIds().length + ' cities');
  for (const id of cityIds()) {
    const d = forCity(id);
    assert.ok(d.count >= MIN_NEIGHBOURHOODS, d.cityName + ' has only ' + d.count + ' places');
    assert.ok(d.central.length >= MIN_CENTRAL, d.cityName + ' has only ' + d.central.length + ' places within ' + CENTRAL_KM + ' km');
    assert.ok(d.population >= MIN_CITY_POP, d.cityName + ' is below the population floor');
    // Nothing on the list is further out than the source says it reaches, and
    // the nearest first order is the order the page prints.
    assert.ok(d.spanKm <= MAX_KM, d.cityName + ' reaches ' + d.spanKm + ' km');
    for (let i = 1; i < d.byDistance.length; i++) {
      assert.ok(d.byDistance[i].distanceKm >= d.byDistance[i - 1].distanceKm, d.cityName + ' is not sorted by distance');
    }
  }
});

test('no two hubs compete for the same city', () => {
  // New York had five: Queens, Brooklyn, The Bronx and Manhattan each
  // collected the districts nearest them and New York City kept eight. Five
  // pages about one place compete with each other and none of them is the
  // page anybody wanted, so a qualifying city within reach of a larger one is
  // folded into it.
  const rows = cityIds().map((id) => forCity(id));
  for (const a of rows) {
    for (const b of rows) {
      if (a.cityId === b.cityId || a.iso2 !== b.iso2) continue;
      const apart = distanceKm({ lat: a.byDistance[0].lat, lon: a.byDistance[0].lon }, { lat: b.byDistance[0].lat, lon: b.byDistance[0].lon });
      if (apart <= MAX_KM) {
        assert.fail(a.cityName + ' and ' + b.cityName + ' are both hubs within ' + Math.round(apart) + ' km of each other');
      }
    }
  }
  // And the fold is what does it, rather than luck: it has to return a parent
  // other than itself for a city inside another one.
  const folded = foldHubs([
    { id: 1, country: 'US', population: 8000000, lat: 40.71, lon: -74.01 },
    { id: 2, country: 'US', population: 2700000, lat: 40.69, lon: -73.99 },
  ]);
  assert.equal(folded.get(2), 1);
  assert.equal(folded.get(1), 1);
});

test('the page is built in every language and no two cities read alike', () => {
  const ids = cityIds().slice(0, 6);
  const minWords = FAMILIES[FAMILY].minWords;
  const seen = new Set();
  for (const l of LANGS) {
    assert.ok(PACKS[l].areas, l + ' has no areas copy');
    for (const id of ids) {
      const m = page(id, l, 'en-US', 'x');
      assert.ok(!m.refused, l + '/' + id + ' refused: ' + m.refused);
      const w = words(m);
      assert.ok(w.count >= minWords, l + '/' + m.entityName + ' is ' + w.count + ' ' + w.unit + ', under the ' + minWords + ' floor');
      // Two cities in one language must not produce the same body, and the
      // same city in two languages must not either.
      const body = m.paragraphs.join(' ');
      assert.ok(!seen.has(body), 'two pages share a body: ' + l + '/' + m.entityName);
      seen.add(body);
      // The page must never imply a ranking it cannot support.
      assert.ok(body.includes(PACKS[l].areas.caution), l + ' drops the caution that says this is not a ranking');
    }
  }
});

test('the page names real districts and counts them correctly', () => {
  const id = cityIds().find((x) => forCity(x).cityName === 'Berlin');
  assert.ok(id, 'Berlin is not in the source');
  const d = forCity(id);
  const m = page(id, 'de', 'de-DE', 'stadtteile berlin');
  assert.equal(m.path, '/de/stadtteile/berlin/');
  // The table is the evidence for the prose, so its length and its first row
  // have to agree with the data rather than with each other.
  assert.equal(m.table.rows.length, Math.min(50, d.count));
  assert.equal(m.table.rows[0].cells[0], d.nearest.name);
  const names = new Set(d.byDistance.map((n) => n.name));
  for (const r of m.table.rows) assert.ok(names.has(r.cells[0]), r.cells[0] + ' is not a district of this city');
  // A district with no recorded population says so rather than printing a zero.
  const noPop = d.byDistance.slice(0, 50).findIndex((n) => n.population == null);
  if (noPop >= 0) assert.equal(m.table.rows[noPop].cells[3], PACKS.de.areas.table.unknown);
});

test('the resolver refuses a different question about the same city', () => {
  const covered = new Set(cityIds());
  // A map, not a list.
  assert.equal(cityOf('barrios de madrid mapa', 'es-ES', covered).cityId, undefined);
  assert.equal(cityOf('berlin stadtteile karte', 'de-DE', covered).cityId, undefined);
  // Which district is worst or best. Answering would need rent, crime or
  // noise data and none of the three exists here.
  assert.equal(cityOf('peores barrios de madrid', 'es-ES', covered).cityId, undefined);
  assert.equal(cityOf('mejores barrios de madrid', 'es-ES', covered).cityId, undefined);
  assert.equal(cityOf('melhores bairros de sao paulo', 'pt-BR', covered).cityId, undefined);
  assert.equal(cityOf('marseille quartiers à éviter', 'fr-FR', covered).cityId, undefined);
  // And the plain question still resolves, so the refusals above are the
  // qualifier being caught rather than the market being broken.
  assert.equal(cityOf('barrios de madrid', 'es-ES', covered).cityId, 3117735);
  assert.equal(cityOf('stadtteile berlin', 'de-DE', covered).cityId, 2950159);
});

test('a city with demand and no district data is reported rather than dropped', () => {
  // The head term is stripped at a word boundary. A plain substring test
  // matched `dzielnice w` inside `dzielnice warszawy`, left `arszawy`, and
  // silently turned the largest Areas keyword measured anywhere, seventeen
  // thousand a month, into a row that was not a city.
  const covered = new Set(cityIds());
  const warsaw = cityOf('dzielnice warszawy', 'pl-PL', covered);
  assert.equal(warsaw.cityId, undefined);
  assert.match(warsaw.reason, /no district data for city 756135/);
  assert.equal(CITY_NAMES['pl-PL'].warszawy, 756135);

  const r = measureAreas();
  assert.ok(r.unservedDemand.some((x) => x.startsWith('dzielnice warszawy: 17000')), 'the Warsaw gap is not reported');
  assert.ok(r.skipped.noDistrictData > 20, 'only ' + r.skipped.noDistrictData + ' rows were refused for want of district data');
  // Every pair that was planned resolved to a city the source actually covers.
  for (const row of r.rows) assert.ok(covered.has(String(row.entity)), row.entity + ' was planned without district data');
});
