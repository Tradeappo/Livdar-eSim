// Destination tiers and the origin by destination matrix.
//
//   node scripts/atlas/destinations.mjs
//   node scripts/atlas/destinations.mjs --write
//
// Nothing here is a preference. The tiers are quantiles of the measured
// scores, so they move when the data moves, and a destination that was not
// measured on enough surfaces is reported as unmeasured rather than placed at
// the bottom.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { allCountries, allCities, tiers, pairs, originsFor, topDestinationsFor } from '../../lib/atlas/destinations.js';

const ROOT = new URL('../../', import.meta.url);
const od = JSON.parse(readFileSync(new URL('data/atlas/probes/origin-destination-2026-09-24.json', ROOT), 'utf8'));

export function report() {
  const countries = tiers(allCountries());
  const cities = tiers(allCities());
  const all = pairs(od);

  const byOrigin = {};
  for (const origin of Object.keys(od.markets)) {
    const top = topDestinationsFor(origin, all, 6);
    byOrigin[origin] = {
      finding: od.markets[origin].finding,
      primarySurface: top.length ? top[0].surface : null,
      top: top.map((p) => ({ destination: p.destination, volume: p.volume, difficulty: p.difficulty, cpcUsd: p.cpcUsd, surface: p.surface, phrasing: p.phrasing })),
    };
  }

  // How many origin markets want each destination. This is what decides how
  // many languages a destination is worth building, which is a different
  // question from how big the destination is.
  const reach = {};
  for (const p of all) {
    if (!p.destination) continue;
    const r = (reach[p.destination] ||= { destination: p.destination, origins: [], totalVolume: 0 });
    if (!r.origins.includes(p.origin)) r.origins.push(p.origin);
    r.totalVolume += p.volume;
  }
  const byReach = Object.values(reach).sort((a, b) => b.origins.length - a.origins.length || b.totalVolume - a.totalVolume);

  const group = (t) => {
    const out = {};
    for (const d of t.destinations) (out[d.tier] ||= []).push({ id: d.id, overall: d.overall, strongest: d.strongestSurface, spread: d.spread, surfaces: d.measuredSurfaces, per: d.per });
    return out;
  };

  return {
    generatedAt: new Date().toISOString(),
    meaning: 'Destinations, which are where people want to go, scored separately from markets, which are who is searching. Tiers are quantiles of the measured scores rather than labels. The insufficient evidence tier is a statement about the measurement and not a low score.',
    countries: { cuts: countries.cuts, tiers: group(countries) },
    cities: { cuts: cities.cuts, tiers: group(cities) },
    byOrigin,
    byReach: byReach.slice(0, 25),
    pairsMeasured: all.length,
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = report();
  if (process.argv.includes('--write')) {
    const dir = new URL('reports/atlas/', ROOT);
    mkdirSync(dir, { recursive: true });
    writeFileSync(new URL('destinations.json', dir), JSON.stringify(r, null, 1) + '\n');
  }
  const brief = (t) => Object.fromEntries(Object.entries(t).map(([k, v]) => [k, v.length + ': ' + v.slice(0, 12).map((d) => d.id).join(', ')]));
  console.log(JSON.stringify({
    countryCuts: r.countries.cuts,
    countries: brief(r.countries.tiers),
    cityCuts: r.cities.cuts,
    cities: brief(r.cities.tiers),
    topByReach: r.byReach.slice(0, 10).map((x) => x.destination + ' (' + x.origins.length + ' origins, ' + x.totalVolume.toLocaleString() + ')'),
    pairsMeasured: r.pairsMeasured,
  }, null, 1));
}
