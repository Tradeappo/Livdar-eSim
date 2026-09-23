// Demand measurement against the existing candidate inventory.
//
//   node scripts/atlas/measure.mjs plan --market en-US --limit 600
//   node scripts/atlas/measure.mjs ingest <response.json> --market en-US --provider ahrefs
//   node scripts/atlas/measure.mjs status
//
// This does not build a new inventory. It takes the families and entities the
// inventory already enumerates, expands the phrasings that already exist, and
// attaches real numbers to them. Nothing here invents a candidate.
//
// The plan step writes a list of keywords and the mapping back to the family
// and entity each one came from, so an ingested response can be attributed
// without guessing. The ingest step normalises whatever a provider returned
// into the one measurement shape and writes it to the measurement store with
// its provider, date, cost and checksum.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { MARKETS } from '../../lib/atlas/markets.js';
import { FAMILIES, priorityOf, familyPrior } from '../../lib/atlas/verticals.js';
import { entityPools, scopeEntities } from '../../lib/atlas/inventory.js';
import { phrasingsFor, expand } from '../../lib/atlas/keywords/phrasings.js';
import { measurement, confidenceFor } from '../../lib/atlas/keywords/model.js';

const DATA = new URL('../../data/atlas/', import.meta.url);
const STORE = new URL('measurements.json', DATA);
const PLAN = new URL('measurement-plan.json', DATA);

// Entities are taken in the order the inventory already ranks them: the
// largest first, because a head term for a big city is what tells us whether
// the pattern has demand at all. The tail is measured only once the head has
// justified it.
export function planKeywords({ market, limit = 600, families = null, entityCap = null, perFamily = null }) {
  const m = MARKETS[market];
  if (!m) throw new Error('unknown market ' + market);
  const pool = entityPools();
  const cities = pool.cities.slice().sort((a, b) => b.population - a.population);
  // Countries are ranked by the population the city store actually records for
  // them, so the sample spends its budget on places people live in and travel
  // to rather than walking the alphabet into Antarctica.
  const weight = new Map();
  for (const c of pool.cities) weight.set(c.country, (weight.get(c.country) || 0) + c.population);
  const countries = pool.countries
    .filter((c) => (weight.get(c.iso2) || 0) > 0)
    .sort((a, b) => (weight.get(b.iso2) || 0) - (weight.get(a.iso2) || 0));
  const byId = new Map(pool.cities.map((c) => [String(c.id), c]));
  const rows = [];
  const seen = new Set();
  const list = (families || Object.keys(FAMILIES))
    .filter((f) => phrasingsFor(f, m.language).length)
    .sort((a, b) => familyPrior(b) - familyPrior(a));

  for (const family of list) {
    const f = FAMILIES[family];
    let takenForFamily = 0;
    const templates = phrasingsFor(family, m.language);
    const scope = f.scope;
    let entities = [];
    if (scope === 'country') entities = countries.slice(0, entityCap || 60).map((c) => ({ id: c.iso2, slots: { country: c.name } }));
    else if (scope.startsWith('city')) {
      const allowed = new Set(scopeEntities(scope, pool));
      entities = cities.filter((c) => allowed.has(String(c.id))).slice(0, entityCap || 40)
        .map((c) => ({ id: String(c.id), slots: { city: c.name, country: c.country } }));
    } else continue;

    for (const e of entities) {
      for (const t of templates) {
        const q = expand(t, { ...e.slots, homeCountry: regionName(m), homeCity: '' });
        if (!q || q.length < 4 || q.includes('{')) continue;
        const key = q.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        rows.push({ q, family, vertical: f.vertical, priority: priorityOf(family), entity: e.id, market, language: m.language, country: m.region.toLowerCase() });
        takenForFamily++;
        if (rows.length >= limit) return rows;
        if (perFamily && takenForFamily >= perFamily) break;
      }
      if (perFamily && takenForFamily >= perFamily) break;
    }
  }
  return rows;
}

const REGION_NAMES = { US: 'the US', GB: 'the UK', DE: 'Germany', IT: 'Italy', ES: 'Spain', FR: 'France', NL: 'the Netherlands', PL: 'Poland', BR: 'Brazil', JP: 'Japan', TW: 'Taiwan' };
const regionName = (m) => REGION_NAMES[m.region] || m.region;

export function loadStore() {
  if (!existsSync(STORE)) return { note: 'Normalised demand measurements. Every row names the provider, the date, the cost and the checksum of the response it came from.', rows: [] };
  return JSON.parse(readFileSync(STORE, 'utf8'));
}

export function saveStore(store) {
  mkdirSync(DATA, { recursive: true });
  writeFileSync(STORE, JSON.stringify(store, null, 1) + '\n');
}

// Ahrefs returns one object per keyword. Attribution back to the family and
// entity comes from the plan, matched on the lower cased keyword, so a
// provider that reorders or drops rows cannot corrupt the mapping.
export function ingestAhrefs(response, plan, { unitsPerRow = 10 } = {}) {
  const byQuery = new Map(plan.map((r) => [r.q.toLowerCase(), r]));
  const at = new Date().toISOString();
  const out = [];
  for (const k of response.keywords || []) {
    const src = byQuery.get(String(k.keyword).toLowerCase());
    if (!src) continue;
    const intents = k.intents || {};
    out.push({
      ...measurement({
        query: k.keyword, country: src.country, language: src.language, market: src.market,
        entity: src.entity, family: src.family,
        intent: intents.transactional ? 'transactional' : intents.commercial ? 'commercial' : intents.local ? 'local' : 'informational',
        volume: k.volume == null ? 0 : k.volume,
        cpc: k.cpc, difficulty: k.difficulty,
        provider: 'ahrefs', measuredAt: at,
        checksum: createHash('sha256').update(JSON.stringify(k)).digest('hex').slice(0, 16),
        cost: unitsPerRow,
        confidence: confidenceFor({ provider: 'ahrefs', volume: k.volume, market: src.market }),
      }),
      vertical: src.vertical,
      priority: src.priority,
      serpFeatures: k.serp_features || [],
      parentTopic: k.parent_topic || null,
      trafficPotential: k.traffic_potential == null ? null : k.traffic_potential,
      globalVolume: k.global_volume == null ? null : k.global_volume,
    });
  }
  return out;
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const cmd = process.argv[2];
  const arg = (name, def) => { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : def; };
  if (cmd === 'plan') {
    const market = arg('market', 'en-US');
    const limit = Number(arg('limit', 600));
    const fams = arg('families', null);
    const rows = planKeywords({ market, limit, families: fams ? fams.split(',') : null, entityCap: arg('entities', null) ? Number(arg('entities')) : null, perFamily: arg('perFamily', null) ? Number(arg('perFamily')) : null });
    writeFileSync(PLAN, JSON.stringify({ market, builtAt: new Date().toISOString(), rows }, null, 1) + '\n');
    const byFamily = {};
    for (const r of rows) byFamily[r.family] = (byFamily[r.family] || 0) + 1;
    console.log(JSON.stringify({ market, keywords: rows.length, families: Object.keys(byFamily).length, byFamily, unitsAtTenPerRow: rows.length * 10 }, null, 1));
    writeFileSync(new URL('measurement-plan-keywords.txt', DATA), rows.map((r) => r.q).join('\n') + '\n');
  } else if (cmd === 'ingest') {
    const file = process.argv[3];
    const plan = JSON.parse(readFileSync(PLAN, 'utf8')).rows;
    const response = JSON.parse(readFileSync(file, 'utf8'));
    const rows = ingestAhrefs(response, plan);
    const store = loadStore();
    const have = new Set(store.rows.map((r) => r.provider + '|' + r.country + '|' + r.query));
    let added = 0;
    for (const r of rows) {
      const k = r.provider + '|' + r.country + '|' + r.query;
      if (have.has(k)) continue;
      have.add(k);
      store.rows.push(r);
      added++;
    }
    saveStore(store);
    console.log(JSON.stringify({ returned: (response.keywords || []).length, attributed: rows.length, added, total: store.rows.length, unitsSpent: added * 10 }, null, 1));
  } else {
    const store = loadStore();
    const byMarket = {}; const byVertical = {}; let withVolume = 0; let units = 0;
    for (const r of store.rows) {
      byMarket[r.market] = (byMarket[r.market] || 0) + 1;
      byVertical[r.vertical] = (byVertical[r.vertical] || 0) + 1;
      if (r.volume > 0) withVolume++;
      units += r.cost || 0;
    }
    console.log(JSON.stringify({ rows: store.rows.length, withVolume, unitsSpent: units, byMarket, byVertical }, null, 1));
  }
}
