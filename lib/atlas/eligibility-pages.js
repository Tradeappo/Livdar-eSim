// Eligibility, resolved per page rather than per family.
//
// Until now eligibility was a family property, and that was enough to answer
// "which families could we build". It cannot answer "do we have 250 pages",
// which is the question that matters now, because a family being eligible
// says nothing about whether any particular country in it has data or any
// particular keyword was measured.
//
// `cost-of-living.country` is the worked example. The family is eligible. It
// has 2,490 candidates, 249 countries times 10 languages. The source covers
// 199 of those countries, and 36 keywords were measured, in one language. So
// the family is eligible and the number of eligible pages is 36, not 2,490,
// and only a per page resolver can see the difference.
//
// A page is eligible when all four hold at once:
//
//   1. every source the family needs is built
//   2. that source actually covers this entity, not just the family
//   3. a keyword for this entity in this market was measured with volume
//   4. no quality gate fails on the values the page would use
//
// Anything less is source-ready, and source-ready is not publishable.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { FAMILIES, familyIds, priorityOf } from './verticals.js';
import { surfaceOfVertical } from './surfaces.js';
import { familyMarkets } from './inventory.js';
import { MARKETS } from './markets.js';
import { TOOLS } from './tools-queue.js';
import { RANKINGS, rankingReady } from './rankings.js';
import { serpMeasuredKeys } from './serp.js';
import { rootFrom } from './repo-root.js';

const ROOT = rootFrom(import.meta.url);
const readIf = (rel) => {
  const u = new URL(rel, ROOT);
  return existsSync(u) ? JSON.parse(readFileSync(u, 'utf8')) : null;
};

// Which entities each built source actually covers. This is the step the
// family level view skips: a source is not a boolean, it is a set of
// entities, and a page for an entity outside that set cannot be built however
// ready the family looks.
let coverageCache = null;
export function sourceCoverage() {
  if (coverageCache) return coverageCache;
  const cov = {};
  const col = readIf('data/atlas/sources/cost-of-living/normalized.json');
  if (col) cov['cost-of-living-verified'] = new Set(Object.keys(col.countries));
  const rent = readIf('data/atlas/sources/rent/normalized.json');
  if (rent) cov['rent-index-verified'] = new Set(Object.keys(rent.countries));
  const sal = readIf('data/atlas/sources/salary/normalized.json');
  if (sal) cov['salary-data-verified'] = new Set(Object.keys(sal.countries));
  // Climate normals cover the cities that were actually fetched, and the
  // countries those cities are in. This is the distinction the whole per page
  // resolver exists for: `nasa-power-daily` is marked universal below because
  // the older weather pages are built per city from whatever that store holds,
  // but a country best time page is only honest for a country with measured
  // cities in it, and there are 23 of those rather than 249.
  const climate = readIf('data/atlas/sources/climate/normals.json');
  if (climate) {
    const rows = Object.values(climate.cities || {});
    cov['climate-normals-verified'] = new Set([
      ...rows.map((c) => c.iso2).filter(Boolean),
      ...rows.map((c) => String(c.cityId)),
    ]);
  }
  // The neighbourhood source covers the cities it actually linked districts
  // to, which is 95 of the 31,715 in the entity store. A city outside that set
  // has no districts to name, and an Areas page for it would be a heading over
  // an empty list.
  const hoods = readIf('data/atlas/sources/neighbourhoods/facts.json');
  if (hoods) cov['neighbourhood-facts-verified'] = new Set(Object.keys(hoods.store || {}));
  // Sources that are universal by nature rather than by dataset. Geonames,
  // airports and the computed ones cover every entity the entity store holds,
  // so they never restrict a page.
  for (const id of ['geonames-cities', 'wikidata-cities', 'wikidata-labels', 'ourairports', 'nasa-power-daily', 'computed-solar', 'computed-distance', 'iana-tz', 'ahrefs-keywords']) cov[id] = 'all';
  coverageCache = cov;
  return cov;
}

export function builtSources() {
  const s = readIf('data/atlas/sources.json');
  return new Set((s?.sources || []).filter((x) => (x.status || x.state || 'built') === 'built').map((x) => x.id));
}

// Measured keywords, indexed by the thing a page is about. A measurement row
// carries the entity it was measured for, so this is a lookup by family,
// entity and market rather than a family level flag.
// Which market a measurement file belongs to. The three earliest files predate
// the convention and carry only the Ahrefs country code, so it is derived
// rather than assumed: without this, an en-US file would silently supply
// volumes to every market.
const COUNTRY_TO_MARKET = { us: 'en-US', gb: 'en-GB', de: 'de-DE', fr: 'fr-FR', es: 'es-ES', it: 'it-IT', br: 'pt-BR', nl: 'nl-NL', pl: 'pl-PL', jp: 'ja-JP', tw: 'zh-Hant-TW' };

let measuredCache = null;
export function measuredKeywords() {
  if (measuredCache) return measuredCache;
  const byKey = new Map();
  const plan = readIf('data/atlas/measurement-plan.json');
  const volumes = new Map();
  // Volumes live in the measurement files; the plan carries the family and
  // entity mapping. Joining them is what turns a keyword into a page fact.
  //
  // The join key is market and keyword together, never the keyword alone.
  // "salary calculator" is 148,000 a month in the United States and 277,000 in
  // the United Kingdom, and a keyword-only index would hand one market the
  // other's number.
  const dir = new URL('data/atlas/measurements/', ROOT);
  if (existsSync(dir)) {
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
      const j = JSON.parse(readFileSync(new URL(f, dir), 'utf8'));
      const fileMarket = j.market || COUNTRY_TO_MARKET[j.country] || null;
      for (const k of j.keywords || []) {
        const mk = k.market || fileMarket;
        if (!mk) continue;
        volumes.set(mk + '|' + String(k.keyword).toLowerCase(), k);
      }
    }
  }
  for (const row of plan?.rows || []) {
    if (!row.family || !row.entity) continue;
    const m = volumes.get((row.market || 'en-US') + '|' + String(row.q).toLowerCase());
    if (!m || !(m.volume > 0)) continue;
    const key = row.family + '|' + row.entity + '|' + (row.market || 'en-US');
    const prev = byKey.get(key);
    if (!prev || m.volume > prev.volume) byKey.set(key, { keyword: row.q, volume: m.volume, difficulty: m.difficulty ?? null, cpc: m.cpc ?? null, market: row.market || 'en-US' });
  }
  measuredCache = byKey;
  return byKey;
}

export function resetCaches() { coverageCache = null; measuredCache = null; measureCache = null; }

// Scopes that are not one page per geographic entity. A calculator uses the
// whole dataset rather than one country, so asking whether the source covers
// its entity is the wrong question. But it is not no question either: the
// family's own sources say almost nothing about whether the tool works, since
// every tool family declares the same one. The rent affordability calculator
// and the moving cost calculator both sit in `tools.calculator`, and one of
// them can be built today while the other needs a rent level that does not
// exist anywhere. So for a global scope page the coverage check is replaced
// by a buildability check against the thing itself.
const GLOBAL_SCOPES = new Set(['tool:global', 'ranking:list']);

// Countries carrying each measure. A ranking that cannot reach the population
// its title claims is refused rather than published short.
let measureCache = null;
function entitiesWithMeasure(measure) {
  if (!measureCache) {
    measureCache = new Map();
    const col = readIf('data/atlas/sources/cost-of-living/normalized.json');
    for (const [iso2, c] of Object.entries(col?.countries || {})) {
      for (const m of Object.keys(c.measures || {})) {
        if (!measureCache.has(m)) measureCache.set(m, new Set());
        measureCache.get(m).add(iso2);
      }
    }
  }
  return measureCache.get(measure) || new Set();
}

// Whether a global scope entity is a real, buildable thing. An entity that is
// not in the tools queue or the rankings list at all is a typo in the
// measurement plan, and is refused for that reason rather than passed through.
export function globalEntityState(family, entity, built) {
  const scope = FAMILIES[family].scope;
  if (scope === 'ranking:list') {
    const r = RANKINGS.find((x) => x.id === entity && x.family === family);
    if (!r) return { ok: false, reason: 'no such ranking in this family' };
    const ready = rankingReady(r, { builtSources: built, entitiesWithMeasure });
    return ready.ready
      ? { ok: true, detail: ready.entities + ' countries in the list' }
      : { ok: false, reason: ready.reason, missing: ready.missing, entities: ready.entities };
  }
  const t = TOOLS.find((x) => x.id === entity && x.family === family);
  if (!t) return { ok: false, reason: 'no such tool in this family' };
  const missing = t.sources.filter((s) => !s.startsWith('none') && !built.has(s));
  return missing.length
    ? { ok: false, reason: 'the tool needs sources that are not built', missing }
    : { ok: true, detail: t.name };
}

// The entities a family's scope resolves to that a given source covers.
function entitiesFor(family, sources, coverage) {
  if (GLOBAL_SCOPES.has(FAMILIES[family].scope)) return null;
  let entities = null;
  for (const s of sources) {
    const c = coverage[s];
    if (c === 'all' || c === undefined) continue;
    entities = entities === null ? new Set(c) : new Set([...entities].filter((e) => c.has(e)));
  }
  return entities;
}

// Every eligible page, resolved. The output is pages, not counts, so the
// cohort builder picks from real rows with real provenance behind them.
export function eligiblePages({ families = familyIds() } = {}) {
  const built = builtSources();
  const coverage = sourceCoverage();
  const measured = measuredKeywords();
  const serp = serpMeasuredKeys();
  const pages = [];
  const familyState = {};

  for (const id of families) {
    const f = FAMILIES[id];
    const needed = f.requiredSources || [];
    const missing = needed.filter((s) => !built.has(s));
    const markets = familyMarkets(id);
    if (missing.length) {
      familyState[id] = { state: 'blocked', missing, eligiblePages: 0 };
      continue;
    }
    const covered = entitiesFor(id, needed, coverage);
    const isGlobal = GLOBAL_SCOPES.has(f.scope);
    const globalCheck = new Map();
    let count = 0;
    const refused = [];
    for (const market of markets) {
      for (const [key, m] of measured) {
        const [fam, entity, mk] = key.split('|');
        if (fam !== id || mk !== market) continue;
        if (covered && !covered.has(entity)) continue;
        if (isGlobal) {
          if (!globalCheck.has(entity)) globalCheck.set(entity, globalEntityState(id, entity, built));
          const g = globalCheck.get(entity);
          if (!g.ok) { refused.push({ entity, market, reason: g.reason, missing: g.missing }); continue; }
        }
        pages.push({
          // Whether the result page this page would enter has been looked
          // at. It is not a condition of eligibility: a page with a built
          // source and measured demand is publishable whether or not
          // somebody has read its SERP. It is recorded because a cohort that
          // cannot say which of its pages were checked cannot explain its
          // own results afterwards.
          serpMeasured: serp.has(id + '|' + entity + '|' + market),
          family: id,
          surface: surfaceOfVertical(f.vertical),
          vertical: f.vertical,
          priority: priorityOf(id),
          entity,
          market,
          language: MARKETS[market]?.language || market.split('-')[0],
          keyword: m.keyword,
          volume: m.volume,
          difficulty: m.difficulty,
          cpcUsd: m.cpc == null ? null : m.cpc / 100,
          sources: needed,
          axis: f.axis,
        });
        count++;
      }
    }
    familyState[id] = {
      state: count > 0 ? 'eligible' : 'source-ready',
      missing: [],
      coveredEntities: covered ? covered.size : null,
      eligiblePages: count,
      // Measured demand that exists and still cannot be published, kept
      // visible rather than subtracted silently. Every row here is a page the
      // programme wants and a named reason it does not have one.
      ...(refused.length ? { refusedPages: refused.length, refusedReasons: [...new Set(refused.map((r) => r.reason))] } : {}),
    };
  }
  return { pages: pages.sort((a, b) => b.volume - a.volume), familyState };
}

export function summary(result) {
  const { pages, familyState } = result;
  const byFamily = {};
  const bySurface = {};
  const byMarket = {};
  const byPriority = { high: 0, medium: 0, low: 0 };
  for (const p of pages) {
    byFamily[p.family] = (byFamily[p.family] || 0) + 1;
    bySurface[p.surface] = (bySurface[p.surface] || 0) + 1;
    byMarket[p.market] = (byMarket[p.market] || 0) + 1;
    byPriority[p.priority] += 1;
  }
  return {
    eligiblePages: pages.length,
    families: Object.values(familyState).filter((f) => f.state === 'eligible').length,
    sourceReadyFamilies: Object.values(familyState).filter((f) => f.state === 'source-ready').length,
    blockedFamilies: Object.values(familyState).filter((f) => f.state === 'blocked').length,
    byFamily, bySurface, byMarket, byPriority,
    destinations: new Set(pages.map((p) => p.entity)).size,
    serpMeasured: pages.filter((p) => p.serpMeasured).length,
    markets: Object.keys(byMarket).length,
    highShare: pages.length ? Math.round((byPriority.high / pages.length) * 1000) / 10 : 0,
  };
}
