// Candidate inventory.
//
// A candidate is a combination that the taxonomy allows: one family, one
// entity, one variant, one market. It is not a page. It becomes a page only
// after data, measurement, QA, scoring and the registry, and every one of
// those stages removes candidates.
//
// Nothing here is stored. Three hundred thousand rows of "this might exist"
// would be a liability in the repository and would drift from the datasets
// the moment either changed. The inventory is recomputed from the ingested
// entity store every time it is asked for, which is what makes the number
// verifiable rather than asserted.

import { MARKETS, enumerableMarkets, enumerableLanguages, ownerMarket } from './markets.js';
import { FAMILIES, SCOPES, familyIds } from './verticals.js';
import { allCities, allNeighbourhoods, loadAirports, loadCountries } from './store.js';
import { tierOf } from './tiers.js';
import { distanceKm } from './geo.js';

// Entity pools, computed once per process. The airport proximity flag is the
// data backed answer to "do people travel here", used by the families whose
// demand depends on a place being a destination rather than just populated.
let pools = null;

export function entityPools(force = false) {
  if (pools && !force) return pools;
  const cities = allCities();
  const airports = loadAirports();
  const byCity = new Map();
  for (const a of airports) {
    if (a.cityId == null) continue;
    const cur = byCity.get(a.cityId);
    if (!cur || a.cityKm < cur.cityKm) byCity.set(a.cityId, a);
  }
  // Nearest airport for every city, searched in a coordinate box.
  const grid = new Map();
  const key = (la, lo) => Math.round(la) + ':' + Math.round(lo);
  for (const a of airports) {
    const k = key(a.lat, a.lon);
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k).push(a);
  }
  const enriched = cities.map((c) => {
    let best = null;
    for (let dla = -2; dla <= 2; dla++) {
      for (let dlo = -2; dlo <= 2; dlo++) {
        for (const a of grid.get(key(c.lat + dla, c.lon + dlo)) || []) {
          const d = distanceKm(c, a);
          if (!best || d < best.km) best = { iata: a.iata, km: d };
        }
      }
    }
    return { ...c, tier: tierOf(c.population), airportKm: best ? Math.round(best.km * 10) / 10 : null, airportIata: best ? best.iata : null };
  });
  pools = {
    cities: enriched,
    neighbourhoods: allNeighbourhoods(),
    airports,
    countries: loadCountries(),
  };
  return pools;
}

export function resetPools() {
  pools = null;
}

// Entities selected by a scope rule.
export function scopeEntities(scopeId, p = entityPools()) {
  if (scopeId === 'city:pair') return cityPairs(p);
  const s = SCOPES[scopeId];
  if (!s) throw new Error('unknown scope: ' + scopeId);
  if (s.entity === 'country') return p.countries.map((c) => c.iso2);
  if (s.entity === 'neighbourhood') return p.neighbourhoods.map((n) => String(n.id));
  if (s.entity === 'airport') return p.airports.filter((a) => (s.linkedCity ? a.cityId != null : true)).map((a) => a.iata);
  return p.cities
    .filter((c) => c.tier <= s.tierMax)
    .filter((c) => (s.airportWithinKm ? c.airportKm != null && c.airportKm <= s.airportWithinKm : true))
    .map((c) => String(c.id));
}

// Comparison pairs are not a free product of the city list. A pair is worth a
// page when readers would really weigh the two against each other: the two
// biggest cities of a country, and each tier one city against the tier one
// city nearest to it in another country. That keeps the family real and stops
// it inflating the inventory with meaningless pairs.
export function cityPairs(p = entityPools()) {
  const t1 = p.cities.filter((c) => c.tier === 1);
  const out = new Set();
  const byCountry = new Map();
  for (const c of p.cities.filter((x) => x.tier <= 2)) {
    if (!byCountry.has(c.country)) byCountry.set(c.country, []);
    byCountry.get(c.country).push(c);
  }
  for (const list of byCountry.values()) {
    list.sort((a, b) => b.population - a.population);
    for (let i = 0; i < Math.min(list.length, 6); i++) {
      for (let j = i + 1; j < Math.min(list.length, 6); j++) out.add(list[i].id + '-' + list[j].id);
    }
  }
  for (const a of t1) {
    let best = null;
    for (const b of t1) {
      if (b.country === a.country) continue;
      const d = distanceKm(a, b);
      if (!best || d < best.km) best = { id: b.id, km: d };
    }
    if (best) out.add([a.id, best.id].sort((x, y) => x - y).join('-'));
  }
  return [...out].sort();
}

// The markets a family is enumerated in. The axis decides it: a language axis
// family exists once per language and is owned by the market that measures
// that language; an audience or origin axis family exists once per market,
// because the answer itself differs.
export function familyMarkets(family) {
  const f = FAMILIES[family];
  if (f.axis === 'language') return enumerableLanguages().map((l) => ownerMarket(l));
  return enumerableMarkets();
}

export function familyCount(family, p = entityPools()) {
  const f = FAMILIES[family];
  const entities = scopeEntities(f.scope, p).length;
  const markets = familyMarkets(family).length;
  return { family, vertical: f.vertical, axis: f.axis, scope: f.scope, entities, variants: f.variants, markets, candidates: entities * f.variants * markets };
}

export function inventory(p = entityPools()) {
  const rows = familyIds().map((f) => familyCount(f, p));
  const total = rows.reduce((t, r) => t + r.candidates, 0);
  const byVertical = {};
  for (const r of rows) byVertical[r.vertical] = (byVertical[r.vertical] || 0) + r.candidates;
  const byAxis = {};
  for (const r of rows) byAxis[r.axis] = (byAxis[r.axis] || 0) + r.candidates;
  const byMarket = {};
  for (const r of rows) for (const m of familyMarkets(r.family)) byMarket[m] = (byMarket[m] || 0) + r.entities * r.variants;
  return {
    entities: {
      cities: p.cities.length,
      citiesTier1: p.cities.filter((c) => c.tier === 1).length,
      citiesTier2: p.cities.filter((c) => c.tier === 2).length,
      citiesTier3: p.cities.filter((c) => c.tier === 3).length,
      neighbourhoods: p.neighbourhoods.length,
      airports: p.airports.length,
      countries: p.countries.length,
      cityPairs: cityPairs(p).length,
    },
    markets: { enumerable: enumerableMarkets().length, languages: enumerableLanguages().length, excluded: Object.keys(MARKETS).filter((m) => MARKETS[m].state === 'excluded') },
    rows: rows.sort((a, b) => b.candidates - a.candidates),
    byVertical: Object.fromEntries(Object.entries(byVertical).sort((a, b) => b[1] - a[1])),
    byAxis,
    byMarket,
    total,
    weatherShare: Math.round(((byVertical.weather || 0) / total) * 1000) / 10,
  };
}

// Enumeration is lazy on purpose: three hundred thousand keys are produced on
// demand by the script that needs them, never held in memory all at once by a
// request path.
export function* enumerateFamily(family, p = entityPools()) {
  const f = FAMILIES[family];
  const entities = scopeEntities(f.scope, p);
  for (const market of familyMarkets(family)) {
    for (const entity of entities) {
      if (f.variants === 1) yield { family, market, entity };
      else for (let v = 0; v < f.variants; v++) yield { family, market, entity, variant: v };
    }
  }
}
