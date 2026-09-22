// Wikidata: localised city names (joined on the GeoNames id, P1566) and country
// facts. CC0. Items are resolved by label, not by hard coded item ids, so a
// renamed or merged item does not silently change a value.

import { sparql, readJson, writeJson, recordSource } from './lib.mjs';

const LANGS = ['en', 'de', 'ro'];

export async function labels(limit = Infinity) {
  const cities = readJson('entities/cities.json', []);
  const ids = cities.slice(0, limit).map((c) => String(c.id));
  const byGid = new Map();
  for (let i = 0; i < ids.length; i += 400) {
    const values = ids.slice(i, i + 400).map((g) => '"' + g + '"').join(' ');
    const rows = await sparql(`SELECT ?gid ?item ?en ?de ?ro WHERE {
      VALUES ?gid { ${values} }
      ?item wdt:P1566 ?gid .
      OPTIONAL { ?item rdfs:label ?en FILTER(LANG(?en) = "en") }
      OPTIONAL { ?item rdfs:label ?de FILTER(LANG(?de) = "de") }
      OPTIONAL { ?item rdfs:label ?ro FILTER(LANG(?ro) = "ro") }
    }`);
    rows.forEach((r) => {
      // One GeoNames id can be linked from several items (a city and its
      // municipality). Keep the first item that has an English label.
      if (byGid.has(r.gid) && byGid.get(r.gid).names.en) return;
      byGid.set(r.gid, { qid: r.item.split('/').pop(), names: Object.fromEntries(LANGS.filter((l) => r[l]).map((l) => [l, r[l]])) });
    });
    await new Promise((res) => setTimeout(res, 1000));
  }
  let named = 0;
  cities.forEach((c) => {
    const hit = byGid.get(String(c.id));
    if (hit) { c.qid = hit.qid; c.names = hit.names; named++; }
  });
  const hash = writeJson('entities/cities.json', cities);
  recordSource('wikidata-labels', { url: 'https://query.wikidata.org/sparql', rows: named, sha256: hash });
  return named;
}

export async function countries() {
  const rows = await sparql(`SELECT ?iso2 ?cur ?calling ?driveLabel ?plugLabel ?voltage ?emLabel ?lang WHERE {
    ?c wdt:P297 ?iso2 .
    FILTER NOT EXISTS { ?c wdt:P576 ?end }
    OPTIONAL { ?c wdt:P38 ?curItem . ?curItem wdt:P498 ?cur . FILTER NOT EXISTS { ?c p:P38 ?st . ?st ps:P38 ?curItem ; pq:P582 ?until } }
    OPTIONAL { ?c wdt:P474 ?calling }
    OPTIONAL { ?c wdt:P1622 ?drive . ?drive rdfs:label ?driveLabel FILTER(LANG(?driveLabel) = "en") }
    OPTIONAL { ?c wdt:P2853 ?plug . ?plug rdfs:label ?plugLabel FILTER(LANG(?plugLabel) = "en") }
    OPTIONAL { ?c wdt:P2884 ?voltage }
    OPTIONAL { ?c wdt:P2852 ?em . ?em rdfs:label ?emLabel FILTER(LANG(?emLabel) = "en") }
    OPTIONAL { ?c wdt:P37 ?langItem . ?langItem wdt:P218 ?lang }
  }`);
  const out = {};
  rows.forEach((r) => {
    const k = (out[r.iso2] = out[r.iso2] || { currencies: new Set(), calling: new Set(), drive: new Set(), plugs: new Set(), voltage: new Set(), emergency: new Set(), langs: new Set() });
    if (r.cur) k.currencies.add(r.cur);
    if (r.calling) k.calling.add(r.calling.replace(/\s+/g, ''));
    if (r.driveLabel) k.drive.add(/left/i.test(r.driveLabel) ? 'left' : /right/i.test(r.driveLabel) ? 'right' : '');
    const plug = r.plugLabel && r.plugLabel.match(/\bType ([A-O])\b/);
    if (plug) k.plugs.add(plug[1]);
    if (r.voltage) k.voltage.add(String(Math.round(Number(r.voltage))));
    if (r.emLabel && /^\d{2,4}$/.test(r.emLabel)) k.emergency.add(r.emLabel);
    if (r.lang) k.langs.add(r.lang);
  });
  // A value is kept only when Wikidata gives exactly one (or, for plugs and
  // languages, a set). Ambiguous single valued facts are dropped, not guessed.
  const one = (s) => (s.size === 1 ? [...s][0] || null : null);
  const result = {};
  Object.entries(out).forEach(([iso2, k]) => {
    result[iso2] = {
      currency: one(k.currencies),
      callingCode: one(k.calling) ? (one(k.calling).startsWith('+') ? one(k.calling) : '+' + one(k.calling)) : null,
      drivingSide: one(k.drive),
      plugTypes: [...k.plugs].sort(),
      voltage: one(k.voltage),
      emergencyNumber: k.emergency.has('112') && k.emergency.size > 1 ? '112' : one(k.emergency),
      officialLanguages: [...k.langs].sort(),
    };
  });
  const hash = writeJson('entities/countries.json', result);
  recordSource('wikidata-countries', { url: 'https://query.wikidata.org/sparql', rows: Object.keys(result).length, sha256: hash });
  return Object.keys(result).length;
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const what = process.argv[2] || 'all';
  (async () => {
    if (what === 'all' || what === 'countries') console.log('countries:', await countries());
    if (what === 'all' || what === 'labels') console.log('labelled cities:', await labels(Number(process.argv[3]) || Infinity));
  })();
}
