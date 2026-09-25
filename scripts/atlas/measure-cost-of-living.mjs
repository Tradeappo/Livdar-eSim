// Turning measured cost of living phrasings into measurable pages.
//
//   node scripts/atlas/measure-cost-of-living.mjs            report only
//   node scripts/atlas/measure-cost-of-living.mjs --write    write plan and files
//
// The binding constraint on this family was never the data. The source covers
// 199 countries and only about two hundred country and market pairs had ever
// been measured, so nine tenths of what is already ingested was invisible to
// the eligibility resolver for want of a keyword. This reads the discovery
// probe and closes that gap.
//
// The country is resolved by subtraction, as in the best time family: remove
// the market's head term, remove the articles and prepositions around it, and
// what remains has to name exactly one country. Searching for a country name
// inside the keyword instead would accept `cost of living in georgia`, which
// in the United States is a state, and `costo della vita a praga`, which is a
// city.
//
// Three things make this harder than the best time case and each has its own
// answer:
//
//   The table is CLDR rather than hand written, because 199 countries in nine
//   languages is not a table anybody should type. `plain()` already returns
//   the local name for every country the store knows.
//
//   Polish inflects, so the locative is the only form that ever appears and it
//   never equals the nominative. A stem match handles the regular cases and an
//   alias table handles the rest; where two countries both match the stem, the
//   resolver refuses rather than guessing, which is why `austrii` needs an
//   alias (it stems to both Austria and Australia).
//
//   Markets search colloquially. A German asking about `england` and an
//   Italian about `inghilterra` are asking about the country this programme
//   has data for, which is the United Kingdom, and cohort 001 already targets
//   it that way.
//
// The resolver was validated before it was used: run against the 204 country
// and market pairs already in the measurement plan, it reproduced all 204 and
// mis-assigned none. That property matters more than coverage here, because a
// wrong mapping publishes a page about the wrong country.

import { readFileSync, writeFileSync } from 'node:fs';
import { sourceCoverage, resetCaches } from '../../lib/atlas/eligibility-pages.js';
import { rootFrom } from '../../lib/atlas/repo-root.js';
import {
  fold, namesFor, stemMatch, countryFrom, ALIASES, AMBIGUOUS, MARKET_LANG, MARKET_COUNTRY,
} from '../../lib/atlas/keyword-country.js';

const ROOT = rootFrom(import.meta.url);
export const FAMILY = 'cost-of-living.country';
export const VERTICAL = 'cost-of-living';

// The country table, the inflections and the per market traps moved to
// lib/atlas/keyword-country.js when the salary family needed exactly the same
// ones. They are properties of the language, not of this family, and two
// copies of the Polish locative table would have drifted apart.
export { fold, namesFor, stemMatch, ALIASES, AMBIGUOUS, MARKET_LANG, MARKET_COUNTRY };

export const HEADS = {
  'en-US': ['cost of living in', 'cost of living'],
  'de-DE': ['lebenshaltungskosten'],
  'fr-FR': ['cout de la vie'],
  'it-IT': ['costo della vita'],
  'es-ES': ['coste de vida', 'costo de vida'],
  'pt-BR': ['custo de vida'],
  'nl-NL': ['kosten van levensonderhoud', 'kosten levensonderhoud', 'levensonderhoud'],
  'pl-PL': ['koszty zycia', 'koszt zycia'],
  'ja-JP': ['\u751f\u6d3b\u8cbb'],
};

// Articles and prepositions only. Nothing here could narrow a country to a
// place inside it, which is what keeps `cost of living in new york` out.
export const FILLERS = {
  'en-US': ['the', 'in', 'a'],
  'de-DE': ['in', 'im', 'der', 'die', 'das', 'den'],
  'fr-FR': ['en', 'au', 'aux', 'a', 'la', 'le', 'les', 'du', 'de', 'des'],
  'it-IT': ['in', 'a', 'al', 'ai', 'negli', 'nei', 'nel', 'nella', 'il', 'la', 'le', 'lo', 'gli'],
  'es-ES': ['en', 'el', 'la', 'los', 'las', 'de'],
  'pt-BR': ['em', 'no', 'na', 'nos', 'nas', 'o', 'a', 'os', 'as', 'de', 'do', 'da'],
  'nl-NL': ['in', 'de', 'het', 'van'],
  'pl-PL': ['w', 'we', 'na'],
  'ja-JP': [],
};

export const countryOf = (keyword, market, isoList) =>
  countryFrom(keyword, market, isoList, { heads: HEADS, fillers: FILLERS });

export function run({ probe = 'data/atlas/probes/cost-of-living-2026-09-24.json' } = {}) {
  resetCaches();
  const covered = sourceCoverage()['cost-of-living-verified'];
  const isoList = [...covered];
  const j = JSON.parse(readFileSync(new URL(probe, ROOT), 'utf8'));
  const files = {};
  const rows = [];
  const skipped = { notACountry: 0, zeroVolume: 0, duplicate: 0, noSubjectForm: 0 };
  const byMethod = {};

  for (const [market, block] of Object.entries(j.markets || {})) {
    const kept = [];
    for (const r of block.rows || []) {
      const c = countryOf(r.keyword, market, isoList);
      if (!c.iso2) { skipped.notACountry++; continue; }
      if (!(r.volume > 0)) { skipped.zeroVolume++; continue; }
      byMethod[c.how] = (byMethod[c.how] || 0) + 1;
      const prev = kept.find((k) => k.iso2 === c.iso2);
      if (prev) {
        skipped.duplicate++;
        // The stronger keyword wins; on a tie the shorter one, so a page
        // targets the head phrase rather than a question wrapped around it.
        const better = r.volume > prev.volume || (r.volume === prev.volume && r.keyword.length < prev.keyword.length);
        if (better) { prev.keyword = r.keyword; prev.volume = r.volume; prev.difficulty = r.difficulty ?? null; }
        continue;
      }
      kept.push({ keyword: r.keyword, volume: r.volume, difficulty: r.difficulty ?? null, iso2: c.iso2 });
    }
    if (!kept.length) continue;
    files[market] = {
      country: block.country,
      select: 'keyword,volume,difficulty',
      unitsPerRow: j.unitsPerRow ?? 21,
      unitsTotal: (block.rows || []).length * (j.unitsPerRow ?? 21),
      family: FAMILY,
      market,
      note: 'Discovered from the market head term and resolved to a country by subtraction. A keyword whose remainder is not exactly one country is refused, which is what keeps a United States state, a Brazilian city and an Italian island out of a country family.',
      keywords: kept.map(({ iso2, ...k }) => k),
    };
    for (const k of kept) {
      rows.push({
        q: k.keyword, family: FAMILY, vertical: VERTICAL, priority: 'high',
        entity: k.iso2, market, language: MARKET_LANG[market], country: MARKET_COUNTRY[market],
        measuredOn: j.capturedOn || '2026-09-24',
      });
    }
  }

  const entities = new Set(rows.map((r) => r.entity));
  return {
    family: FAMILY,
    probe,
    pairs: rows.length,
    byMarket: Object.fromEntries(Object.entries(files).map(([m, f]) => [m, f.keywords.length])),
    entities: entities.size,
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
      writeFileSync(new URL('data/atlas/measurements/ahrefs-col-' + market + '-2026-09-24.json', ROOT), JSON.stringify(f, null, 1) + '\n');
    }
    const planUrl = new URL('data/atlas/measurement-plan.json', ROOT);
    const plan = JSON.parse(readFileSync(planUrl, 'utf8'));
    // Rows already in the plan for this family are kept: they were measured
    // earlier, some of them in markets this probe did not reach, and cohort 001
    // is already built on them. Only genuinely new pairs are added.
    const have = new Set(plan.rows.map((x) => x.family + '|' + x.entity + '|' + x.market));
    const added = r.rows.filter((x) => !have.has(x.family + '|' + x.entity + '|' + x.market));
    plan.rows.push(...added);
    writeFileSync(planUrl, JSON.stringify(plan, null, 1) + '\n');
    console.error('new plan rows: ' + added.length + ' (of ' + r.rows.length + ' resolved)');
  }
  const { files, rows, ...summary } = r;
  console.log(JSON.stringify(summary, null, 1));
}
