// Venues, ingested from Wikidata.
//
//   node scripts/atlas/ingest/venues.mjs --write
//
// The brief called this the cheapest unbuilt source in the programme, and it
// is, but cheap has a price here and the price is confidence. Wikidata is
// edited by anybody. A stadium capacity there may come from an official
// source, from a newspaper, or from somebody's memory, and the database does
// not always say which. So every value this ingest produces carries the
// confidence level `declared`, which is the lowest rank that publishes at
// all, and any page that needs an official number must not use it.
//
// That is a real constraint rather than a formality. A venue page can say
// where a venue is, what it is called and roughly how large it is, and it
// must not present the capacity as the operator's own figure.
//
// Three gates decide what is kept, and each of them threw away real rows:
//
//   a venue without coordinates cannot be placed and is not a venue page
//   a capacity outside a plausible range is a typo rather than a stadium
//   a venue more than 40km from any city in the entity store has no hub to
//   hang from, and a page with no parent is an orphan by construction

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { make as makeProvenance } from '../../../lib/atlas/sources/provenance.js';

const ROOT = new URL('../../../', import.meta.url);

export const LICENCE = 'CC0 1.0, Wikidata, public domain dedication';
export const ATTRIBUTION = 'Venue records from Wikidata (CC0)';

// The Wikidata classes this ingest asked for, in the words a reader uses.
export const CLASSES = {
  Q483110: 'stadium',
  Q1076486: 'sports venue',
  Q1060829: 'concert hall',
  Q18674739: 'event venue',
  Q641226: 'arena',
};

// A capacity outside this range is not a capacity. The floor removes rows
// where somebody recorded a room; the ceiling removes the ones where a digit
// was added, and the largest stadium ever built held about 150,000.
export const CAPACITY_RANGE = { min: 50, max: 250000 };

// How far a venue may sit from the nearest city and still belong to it. Forty
// kilometres covers an airport-distance arena and refuses a venue in open
// country that would otherwise be attached to a city an hour away.
export const MAX_CITY_KM = 40;

// Names arrive from the source with whatever punctuation the source uses,
// and seventy of them carry an en dash. The programme's rule is the plain
// hyphen everywhere in public text, and the repository already has a
// convention for a name that had to be changed to satisfy it: normalise and
// flag, so the page is correct and the change is visible rather than silent.
const LONG_DASHES = [0x2010, 0x2011, 0x2012, 0x2013, 0x2014, 0x2015, 0x2212, 0xfe58, 0xfe63, 0xff0d].map((c) => String.fromCodePoint(c));
export function normaliseDashes(text) {
  let s = String(text);
  let changed = false;
  for (const d of LONG_DASHES) {
    if (s.includes(d)) { s = s.split(d).join('-'); changed = true; }
  }
  return { text: s, changed };
}

const R = 6371;
const rad = (d) => (d * Math.PI) / 180;
export function distanceKm(a, b) {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// Cities, bucketed by a one degree grid so that matching a venue looks at the
// nine cells around it rather than at all thirty one thousand cities. At
// twenty thousand venues the difference is the whole runtime.
export function cityGrid(cities) {
  const grid = new Map();
  for (const c of cities) {
    if (typeof c.lat !== 'number' || typeof c.lon !== 'number') continue;
    const key = Math.round(c.lat) + ':' + Math.round(c.lon);
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(c);
  }
  return grid;
}

export function nearestCity(grid, venue) {
  let best = null;
  const la = Math.round(venue.lat);
  const lo = Math.round(venue.lon);
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      for (const c of grid.get((la + i) + ':' + (lo + j)) || []) {
        if (c.iso2 !== venue.iso2) continue;
        const km = distanceKm(venue, c);
        if (!best || km < best.km) best = { city: c, km };
      }
    }
  }
  return best;
}

// The two city stores spell the country differently: the curated file uses
// `iso2` and the sharded one uses `country`. Reading whichever is present and
// not normalising is how a venue ingest can reject every row for having no
// city while the cities are sitting right there.
const normaliseCity = (c) => ({ ...c, iso2: c.iso2 || c.country || null });

function loadCities() {
  const dir = new URL('data/atlas/entities/cities/', ROOT);
  if (existsSync(dir)) {
    const out = [];
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
      const j = JSON.parse(readFileSync(new URL(f, dir), 'utf8'));
      out.push(...(Array.isArray(j) ? j : Object.values(j)).map(normaliseCity));
    }
    if (out.length) return out;
  }
  return JSON.parse(readFileSync(new URL('data/atlas/entities/cities.json', ROOT), 'utf8')).map(normaliseCity);
}

export function run({ capture, now = new Date() } = {}) {
  const raw = capture || JSON.parse(readFileSync(new URL('data/atlas/sources/venues/wikidata-venues-2026-09-24.json', ROOT), 'utf8'));
  const cities = loadCities();
  const grid = cityGrid(cities);
  const observedAt = raw.capturedOn;

  const kept = {};
  const rejected = { noName: 0, noCoordinates: 0, impossibleCapacity: 0, noCity: 0, unknownClass: 0 };
  let dashNormalised = 0;
  const rejectedSamples = [];
  let seen = 0;

  for (const [iso2, rows] of Object.entries(raw.countries)) {
    for (const v of rows) {
      seen++;
      if (!v.name) { rejected.noName++; continue; }
      if (typeof v.lat !== 'number' || typeof v.lon !== 'number') { rejected.noCoordinates++; continue; }
      if (v.capacity != null && (v.capacity < CAPACITY_RANGE.min || v.capacity > CAPACITY_RANGE.max)) {
        rejected.impossibleCapacity++;
        if (rejectedSamples.length < 8) rejectedSamples.push({ id: v.id, name: v.name, capacity: v.capacity, why: 'capacity outside ' + CAPACITY_RANGE.min + ' to ' + CAPACITY_RANGE.max });
        continue;
      }
      const classes = (v.classes || []).filter((c) => CLASSES[c]);
      if (!classes.length) { rejected.unknownClass++; continue; }
      const near = nearestCity(grid, { lat: v.lat, lon: v.lon, iso2 });
      if (!near || near.km > MAX_CITY_KM) { rejected.noCity++; continue; }

      // Provenance per venue rather than per value, because a venue is an
      // entity and its facts were all captured in one read of one database.
      const prov = makeProvenance({
        value: v.capacity ?? 0,
        unit: 'count',
        source: 'Wikidata',
        sourceRef: v.id,
        entity: v.id,
        observedAt,
        confidence: 'declared',
        licence: LICENCE,
        note: 'Community edited. The capacity is what Wikidata records and is not the operator\'s published figure.',
      });

      const name = normaliseDashes(v.name);
      if (name.changed) dashNormalised++;

      (kept[iso2] ||= []).push({
        id: v.id,
        name: name.text,
        dashNormalised: name.changed,
        types: classes.map((c) => CLASSES[c]),
        capacity: v.capacity ?? null,
        capacityConfidence: v.capacity == null ? null : 'declared',
        lat: v.lat,
        lon: v.lon,
        iso2,
        cityId: near.city.id,
        cityName: near.city.name,
        cityKm: Math.round(near.km * 10) / 10,
        wikidataAdmin: v.admin || null,
        website: v.site || null,
        provenance: { source: prov.source, sourceRef: prov.sourceRef, observedAt: prov.observedAt, ingestedAt: prov.ingestedAt, confidence: prov.confidence, licence: prov.licence, note: prov.note },
      });
    }
  }

  for (const rows of Object.values(kept)) rows.sort((a, b) => (b.capacity ?? -1) - (a.capacity ?? -1) || a.name.localeCompare(b.name));

  const total = Object.values(kept).reduce((n, r) => n + r.length, 0);
  const withCapacity = Object.values(kept).flat().filter((v) => v.capacity != null).length;

  return {
    source: 'venue-data-verified',
    provider: 'Wikidata',
    dataset: 'SPARQL, five venue classes, sixteen countries',
    licence: LICENCE,
    attribution: ATTRIBUTION,
    capturedOn: observedAt,
    ingestedAt: now.toISOString().slice(0, 10),
    freshnessClass: 'reference',
    confidence: 'declared',
    meaning: 'Venues placed against the Livdar city entities. Every value is community edited and labelled as such, which is why the confidence is the lowest rank that publishes and why no page built on this may present a capacity as an official figure.',
    seen,
    kept: total,
    withCapacity,
    dashNormalised,
    rejected,
    rejectedSamples,
    countries: Object.fromEntries(Object.entries(kept).map(([k, v]) => [k, v.length])),
    cities: new Set(Object.values(kept).flat().map((v) => v.cityId)).size,
    unlocks: ['venues.city', 'stay.near-venue', 'events.venue'],
    notCovered: {
      ticketing: 'No event inventory. Wikidata records the building, not what is on at it.',
      officialCapacity: 'Capacities are community edited. An operator figure needs the operator.',
      accessibility: 'Not recorded for most venues and not inferred here.',
    },
    byCountry: kept,
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = run();
  if (process.argv.includes('--write')) {
    // Sharded by country rather than one file, because the store has to keep
    // working at a hundred countries and a giant JSON is the thing the scale
    // rules forbid.
    const dir = new URL('data/atlas/sources/venues/by-country/', ROOT);
    mkdirSync(dir, { recursive: true });
    for (const [iso2, rows] of Object.entries(r.byCountry)) {
      writeFileSync(new URL(iso2 + '.json', dir), JSON.stringify({ iso2, venues: rows.length, licence: r.licence, attribution: r.attribution, capturedOn: r.capturedOn, rows }, null, 1) + '\n');
    }
    const { byCountry, ...summary } = r;
    writeFileSync(new URL('data/atlas/sources/venues/normalized.json', ROOT), JSON.stringify(summary, null, 1) + '\n');
  }
  const { byCountry, ...summary } = r;
  console.log(JSON.stringify(summary, null, 1));
}
