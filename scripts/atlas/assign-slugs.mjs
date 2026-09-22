// Assigns URL slugs once and pins them in data/slugs.json. An existing slug is
// never changed, even if the name it came from changes later: a live URL does
// not move. New collisions are resolved by appending the region code, then the
// country code, then the GeoNames id.
//
//   node scripts/assign-slugs.mjs            all cities and travel airports
//   node scripts/assign-slugs.mjs --lot lot-001

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { LOCALES, slugify } from '../../lib/atlas/i18n.js';

const data = (p) => new URL('../../data/atlas/' + p, import.meta.url);
const read = (p, fb) => (existsSync(data(p)) ? JSON.parse(readFileSync(data(p), 'utf8')) : fb);

export function assign(cities, airports, slugs, only) {
  const used = Object.fromEntries(LOCALES.map((l) => [l, new Set()]));
  Object.values(slugs.cities).forEach((s) => LOCALES.forEach((l) => s[l] && used[l].add('c/' + s[l])));
  Object.values(slugs.airports).forEach((s) => LOCALES.forEach((l) => s[l] && used[l].add('a/' + s[l])));
  let added = 0;
  // Larger cities first, so the plain name goes to the city most people mean.
  cities.slice().sort((a, b) => b.population - a.population).forEach((c) => {
    if (only && !only.cities.has(String(c.id))) return;
    const id = String(c.id);
    if (slugs.cities[id]) return;
    if (!c.names || !c.names.en) return;
    const entry = {};
    for (const l of LOCALES) {
      const base = slugify(c.names[l] || c.names.en, l);
      if (!base) continue;
      const tries = [base, base + '-' + slugify(c.admin1 || ''), base + '-' + c.iso2.toLowerCase(), base + '-' + id].filter((s) => !s.endsWith('-'));
      const pick = tries.find((s) => !used[l].has('c/' + s));
      used[l].add('c/' + pick);
      entry[l] = pick;
    }
    slugs.cities[id] = entry;
    added++;
  });
  airports.forEach((a) => {
    if (only && !only.airports.has(a.iata)) return;
    if (slugs.airports[a.iata]) return;
    const entry = {};
    for (const l of LOCALES) {
      const base = slugify(a.iata + ' ' + (a.municipality || a.name), l);
      const pick = used[l].has('a/' + base) ? slugify(a.iata + ' ' + a.name, l) : base;
      used[l].add('a/' + pick);
      entry[l] = pick;
    }
    slugs.airports[a.iata] = entry;
    added++;
  });
  return added;
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const slugs = read('slugs.json', { cities: {}, airports: {} });
  const args = process.argv.slice(2);
  let only = null;
  if (args[0] === '--lot') {
    const lot = read('lots/' + args[1] + '.json', null);
    only = { cities: new Set((lot.cities || []).map(String)), airports: new Set(lot.airports || []) };
  }
  const n = assign(read('entities/cities.json', []), read('entities/airports.json', []), slugs, only);
  writeFileSync(data('slugs.json'), JSON.stringify(slugs, null, 1) + '\n');
  console.log('slugs added:', n);
}
