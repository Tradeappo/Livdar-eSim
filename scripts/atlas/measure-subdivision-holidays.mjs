// Turning measured regional holiday phrasings into measurable Pulse pages.
//
//   node scripts/atlas/measure-subdivision-holidays.mjs            report only
//   node scripts/atlas/measure-subdivision-holidays.mjs --write    write it
//
// This is where the demand is. `feiertage nrw 2026` is 202,000 searches a
// month against 90,000 for the whole of Germany, and `festivos madrid 2026`
// is 48,000 against 10,000 for Spain. Both markets ask by region first
// because in both the days are set by the region, so the national answer is
// the wrong one for most readers and they know it.
//
// The region table is not hand written. The source carries each region's name
// in every language it has, so the table is built from the source and only
// the abbreviations a market uses in place of a name are written down.
//
// A city is not a region, and this is the refusal that matters. `feiertage
// muenchen`, `festivos barcelona` and `feiertage leipzig` all resolve to
// nothing here, because the holidays that apply in Munich are Bavaria's and
// the source says so at the level of Bavaria. Answering a city query with a
// state page would be answering a different question.

import { readFileSync, writeFileSync } from 'node:fs';
import { writeMeasurement } from './measurement-file.mjs';
import { rootFrom } from '../../lib/atlas/repo-root.js';
import { fold, stripHead, MARKET_LANG, MARKET_COUNTRY } from '../../lib/atlas/keyword-country.js';
import { store as holidayStore } from '../../lib/atlas/holidays.js';
import { HEADS, FILLERS } from './measure-holidays.mjs';

const ROOT = rootFrom(import.meta.url);
export const FAMILY = 'events.subdivision-holidays';
export const VERTICAL = 'events';
export const PROBE = 'data/atlas/probes/holidays-2026-09-24.json';

export { HEADS, FILLERS };

// What each market writes instead of the region's name. Germans abbreviate
// their states and almost nobody spells Nordrhein-Westfalen out.
export const ABBREVIATIONS = {
  'de-DE': {
    nrw: 'DE-NW', bw: 'DE-BW', rlp: 'DE-RP', 'baden wuerttemberg': 'DE-BW',
    'mecklenburg vorpommern': 'DE-MV', 'sachsen anhalt': 'DE-ST', 'schleswig holstein': 'DE-SH',
    'rheinland pfalz': 'DE-RP', 'nordrhein westfalen': 'DE-NW',
  },
  'es-ES': { 'comunidad valenciana': 'ES-VC', cataluna: 'ES-CT', madrid: 'ES-MD', 'pais vasco': 'ES-PV', 'castilla la mancha': 'ES-CM', baleares: 'ES-IB', canarias: 'ES-CN', navarra: 'ES-NC', murcia: 'ES-MC' },
  'it-IT': {},
  'fr-FR': {},
  'nl-NL': {},
  'pl-PL': {},
  'pt-BR': {},
  'en-US': {},
};

// Built from the source rather than typed: every region name the provider
// carries, in every language it carries it in, folded for comparison.
export function regionTable(language) {
  const out = new Map();
  for (const [iso2, c] of Object.entries(holidayStore().store || {})) {
    for (const s of c.subdivisions || []) {
      const entity = iso2 + '-' + s.shortName;
      for (const [lang, name] of Object.entries(s.names)) {
        if (lang !== language && lang !== 'en') continue;
        const key = fold(name).replace(/-/g, ' ');
        // A name that two regions share in one language is not a name this
        // resolver can use, so it is removed rather than assigned to whichever
        // came first.
        if (out.has(key) && out.get(key) !== entity) out.set(key, null);
        else if (!out.has(key)) out.set(key, entity);
      }
    }
  }
  return out;
}

const YEAR = /\b(19|20)\d{2}\b/g;

export function regionOf(keyword, market) {
  const language = MARKET_LANG[market];
  if (!language) return { reason: 'unknown market' };
  const cleaned = String(keyword).replace(YEAR, ' ').replace(/\s+/g, ' ').trim();
  const hit = stripHead(fold(cleaned), HEADS[market] || []);
  if (!hit) return { reason: 'no head term' };
  const stop = new Set((FILLERS[market] || []).map(fold));
  const rest = hit.rest.split(/\s+/).filter((t) => t && !stop.has(t)).join(' ').replace(/-/g, ' ').trim();
  if (!rest) return { reason: 'head term alone, no region' };
  const abbr = (ABBREVIATIONS[market] || {})[rest];
  if (abbr) return { entity: abbr, how: 'market abbreviation' };
  const table = regionTable(language);
  const hitRegion = table.get(rest);
  if (hitRegion === null) return { reason: 'two regions share this name: ' + rest };
  if (!hitRegion) return { reason: 'not a region: ' + rest };
  return { entity: hitRegion, how: 'source name' };
}

export function run({ probe = PROBE } = {}) {
  const j = JSON.parse(readFileSync(new URL(probe, ROOT), 'utf8'));
  const files = {};
  const rows = [];
  const skipped = { notARegion: 0, duplicate: 0, zeroVolume: 0 };
  const byMethod = {};

  for (const [market, block] of Object.entries(j.markets || {})) {
    const kept = [];
    for (const r of block.rows || []) {
      const c = regionOf(r.keyword, market);
      if (!c.entity) { skipped.notARegion++; continue; }
      if (!(r.volume > 0)) { skipped.zeroVolume++; continue; }
      byMethod[c.how] = (byMethod[c.how] || 0) + 1;
      const prev = kept.find((k) => k.entity === c.entity);
      if (prev) {
        skipped.duplicate++;
        const better = r.volume > prev.volume || (r.volume === prev.volume && r.keyword.length < prev.keyword.length);
        if (better) { prev.keyword = r.keyword; prev.volume = r.volume; prev.difficulty = r.difficulty ?? null; }
        continue;
      }
      kept.push({ keyword: r.keyword, volume: r.volume, difficulty: r.difficulty ?? null, entity: c.entity });
    }
    if (!kept.length) continue;
    files[market] = {
      country: block.country,
      market,
      select: 'keyword,volume,difficulty',
      unitsPerRow: j.unitsPerRow ?? 21,
      unitsTotal: (block.rows || []).length * (j.unitsPerRow ?? 21),
      family: FAMILY,
      note: 'Discovered from the same probe as the country family and resolved to a region by subtraction, against the region names the source itself carries plus the abbreviations each market uses. A city is refused: the holidays that apply in Munich are Bavaria’s and the source records them at that level.',
      keywords: kept.map(({ entity, ...k }) => k),
    };
    for (const k of kept) {
      rows.push({
        q: k.keyword, family: FAMILY, vertical: VERTICAL, priority: 'high',
        entity: k.entity, market, language: MARKET_LANG[market], country: MARKET_COUNTRY[market],
        measuredOn: j.capturedOn || '2026-09-24',
      });
    }
  }

  return {
    family: FAMILY,
    probe,
    pairs: rows.length,
    byMarket: Object.fromEntries(Object.entries(files).map(([m, f]) => [m, f.keywords.length])),
    entities: new Set(rows.map((r) => r.entity)).size,
    resolvedBy: byMethod,
    skipped,
    totalVolume: Object.values(files).flatMap((f) => f.keywords).reduce((t, k) => t + k.volume, 0),
    files,
    rows,
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = run();
  if (process.argv.includes('--write')) {
    for (const [market, f] of Object.entries(r.files)) {
      writeMeasurement(new URL('data/atlas/measurements/ahrefs-region-holidays-' + market + '-2026-09-24.json', ROOT), f, { overwrite: process.argv.includes('--overwrite') });
    }
    const planUrl = new URL('data/atlas/measurement-plan.json', ROOT);
    const plan = JSON.parse(readFileSync(planUrl, 'utf8'));
    const have = new Set(plan.rows.map((x) => x.family + '|' + x.entity + '|' + x.market));
    const added = r.rows.filter((x) => !have.has(x.family + '|' + x.entity + '|' + x.market));
    plan.rows.push(...added);
    writeFileSync(planUrl, JSON.stringify(plan, null, 1) + '\n');
    console.error('new plan rows: ' + added.length);
  }
  const { files, rows, ...summary } = r;
  console.log(JSON.stringify(summary, null, 1));
}
