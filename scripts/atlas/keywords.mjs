// Keyword manifest and cost dry run.
//
//   node scripts/atlas/keywords.mjs manifest                 build and cost it
//   node scripts/atlas/keywords.mjs manifest --limit 20000   a slice of it
//   node scripts/atlas/keywords.mjs measure --provider mock  run a provider
//
// The manifest is built before any money is spent: the deduplicated list, the
// keyword count, the task count, the exact cost at the provider published
// rate, and the cap it is checked against. Nothing calls a paid provider
// until the manifest exists and the cap allows it.

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { MARKETS, enumerableMarkets } from '../../lib/atlas/markets.js';
import { FAMILIES } from '../../lib/atlas/verticals.js';
import { entityPools, scopeEntities, familyMarkets } from '../../lib/atlas/inventory.js';
import { phrasingsFor, expand, coverage } from '../../lib/atlas/keywords/phrasings.js';
import { MONTH_NAMES } from '../../lib/atlas/segments.js';
import { providerFor, DataForSEOProvider, AhrefsProvider } from '../../lib/atlas/keywords/providers.js';

const OUT = new URL('../../data/atlas/', import.meta.url);

// Entity labels. GeoNames carries the endonym, which is the right label for
// the local market and a usable one elsewhere until the Wikidata label pass
// fills in the rest. Entities without a label for a language are counted and
// reported rather than measured with an English name pretending to be local.
function labels(pool) {
  const byId = new Map(pool.cities.map((c) => [String(c.id), c]));
  const byIata = new Map(pool.airports.map((a) => [a.iata, a]));
  const byIso = new Map(pool.countries.map((c) => [c.iso2, c]));
  return { byId, byIata, byIso };
}

export function keywordsForFamily(family, language, market, pool, L, limit) {
  const f = FAMILIES[family];
  const templates = phrasingsFor(family, language);
  if (!templates.length) return { rows: [], unlabelled: 0, noPhrasings: true };
  const entities = scopeEntities(f.scope, pool);
  const rows = [];
  let unlabelled = 0;
  for (const entity of entities) {
    let slots = null;
    if (f.scope.startsWith('city')) {
      const c = L.byId.get(entity);
      if (!c) { unlabelled++; continue; }
      slots = { city: c.name, country: c.country };
    } else if (f.scope.startsWith('airport')) {
      const a = L.byIata.get(entity);
      if (!a) { unlabelled++; continue; }
      slots = { airport: a.name.replace(/ (International )?Airport$/i, ''), iata: a.iata, city: a.municipality || a.name };
    } else if (f.scope === 'country') {
      const c = L.byIso.get(entity);
      if (!c) { unlabelled++; continue; }
      slots = { country: c.name };
    } else continue;
    const variants = f.variants === 12 ? MONTH_NAMES[language].map((m, i) => ({ month: m, v: i })) : [{ v: 0 }];
    for (const variant of variants) {
      for (const t of templates) {
        rows.push({ q: expand(t, { ...slots, month: variant.month }), family, market, language, entity, variant: variant.v });
        if (limit && rows.length >= limit) return { rows, unlabelled, noPhrasings: false };
      }
    }
  }
  return { rows, unlabelled, noPhrasings: false };
}

export function buildManifest({ limit = null, families = Object.keys(FAMILIES) } = {}) {
  const pool = entityPools();
  const L = labels(pool);
  const byMarket = {};
  const perFamily = [];
  const seen = new Set();
  let duplicates = 0;
  for (const family of families) {
    for (const market of familyMarkets(family)) {
      if (!market) continue;
      const language = MARKETS[market].language;
      const { rows, unlabelled, noPhrasings } = keywordsForFamily(family, language, market, pool, L, limit);
      if (noPhrasings) { perFamily.push({ family, market, keywords: 0, status: 'no phrasings written for ' + language }); continue; }
      let unique = 0;
      for (const r of rows) {
        const k = MARKETS[market].region.toLowerCase() + '|' + r.q;
        if (seen.has(k)) { duplicates++; continue; }
        seen.add(k);
        unique++;
        byMarket[market] = (byMarket[market] || 0) + 1;
      }
      perFamily.push({ family, market, language, keywords: unique, unlabelledEntities: unlabelled, status: 'ready' });
    }
  }
  const total = seen.size;
  const dfs = new DataForSEOProvider().estimate(total);
  const ahrefs = new AhrefsProvider().estimate(total);
  const cov = coverage(families, [...new Set(Object.values(MARKETS).filter((m) => m.state !== 'excluded').map((m) => m.language))]);
  return {
    builtAt: new Date().toISOString(),
    dryRun: true,
    limitPerFamilyMarket: limit,
    deduplicatedKeywords: total,
    duplicatesRemoved: duplicates,
    byMarket,
    perFamily: perFamily.sort((a, b) => b.keywords - a.keywords),
    phrasingCoverage: { written: cov.covered, missing: cov.missing.length, missingPairs: cov.missing.slice(0, 40) },
    cost: {
      dataforseo: { tasks: dfs.amount, keywordsPerTask: dfs.perTask, usd: dfs.usd, queue: 'standard', endpoint: 'google_ads/search_volume' },
      ahrefsIfUsedForBulk: { units: ahrefs.amount, note: 'Not the plan. Ahrefs is kept for phrasing discovery, SERP checks and validating the highest value lots.' },
    },
    capUsd: process.env.DATAFORSEO_COST_CAP_USD ? Number(process.env.DATAFORSEO_COST_CAP_USD) : null,
    credentialsPresent: Boolean(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD),
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const cmd = process.argv[2] || 'manifest';
  const li = process.argv.indexOf('--limit');
  const limit = li > 0 ? Number(process.argv[li + 1]) : null;
  if (cmd === 'manifest') {
    const m = buildManifest({ limit });
    mkdirSync(OUT, { recursive: true });
    const text = JSON.stringify(m, null, 1) + '\n';
    writeFileSync(new URL('keyword-manifest.json', OUT), text);
    console.log(JSON.stringify({
      deduplicatedKeywords: m.deduplicatedKeywords,
      duplicatesRemoved: m.duplicatesRemoved,
      tasks: m.cost.dataforseo.tasks,
      usd: m.cost.dataforseo.usd,
      capUsd: m.capUsd,
      credentialsPresent: m.credentialsPresent,
      phrasingCoverage: m.phrasingCoverage.written + ' written, ' + m.phrasingCoverage.missing + ' missing',
      sha256: createHash('sha256').update(text).digest('hex').slice(0, 16),
    }, null, 1));
    if (!m.credentialsPresent) console.log('\nBlocked: DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD are not set, so no bulk measurement can run.');
    if (m.capUsd == null) console.log('Blocked: DATAFORSEO_COST_CAP_USD is not set, so no spend is authorised.');
  } else if (cmd === 'measure') {
    const pi = process.argv.indexOf('--provider');
    const id = pi > 0 ? process.argv[pi + 1] : process.env.KEYWORD_PROVIDER || 'mock';
    const manifestUrl = new URL('keyword-manifest.json', OUT);
    if (!existsSync(manifestUrl)) throw new Error('build the manifest first');
    const provider = providerFor(id);
    if (id === 'dataforseo' && !provider.credentials) {
      console.log(JSON.stringify({ blocked: 'credentials', need: ['DATAFORSEO_LOGIN', 'DATAFORSEO_PASSWORD', 'DATAFORSEO_COST_CAP_USD'] }, null, 1));
      process.exitCode = 2;
    } else {
      console.log(JSON.stringify({ provider: id, note: 'measurement run is wired and waits on the manifest slice given to it' }, null, 1));
    }
  }
}
