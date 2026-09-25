// Turning measured public holiday phrasings into measurable Pulse pages.
//
//   node scripts/atlas/measure-holidays.mjs            report only
//   node scripts/atlas/measure-holidays.mjs --write    write plan and files
//
// Two things make this family's resolution different from every other one
// here, and both come from the same fact: a person asking about public
// holidays is usually asking about the country they are already in.
//
// The head term stands alone. `feiertage 2026` is 90,000 a month in Germany
// and means Germany; `jours feries 2026` is 181,000 in France and means
// France. Every other family in this programme refuses a keyword with no
// destination left in it, because there the remainder is genuinely missing.
// Here it is implied by the market, and refusing it would throw away the
// largest terms measured anywhere. So the implication is written down, per
// market, and it applies only where the market's own country is the one the
// source covers.
//
// The year is in the keyword and not in the URL. Every measured term carries
// one, and the page carries the year in its content so that it accumulates
// rather than restarting each January.
//
// What is refused is most of the probe, and the refusals are the finding:
//
//   A region rather than a country. `feiertage nrw 2026` is 202,000 a month
//   and `festivos madrid 2026` is 48,000. The source carries both regions,
//   the country page does not answer either, and the subdivision family that
//   would is not built.
//
//   A month rather than a year. `jours feries mai 2026` and `feriados abril
//   2026` are narrower questions than this page answers.
//
//   A country the source cannot reach. Every Brazilian row falls here, and
//   `feriados 2026` alone is 705,000 searches a month against a file that
//   stops in 2025.

import { readFileSync, writeFileSync } from 'node:fs';
import { writeMeasurement } from './measurement-file.mjs';
import { rootFrom } from '../../lib/atlas/repo-root.js';
import { countryFrom, fold, stripHead, MARKET_LANG, MARKET_COUNTRY } from '../../lib/atlas/keyword-country.js';
import { countries as holidayCountries } from '../../lib/atlas/holidays.js';

const ROOT = rootFrom(import.meta.url);
export const FAMILY = 'events.country-holidays';
export const VERTICAL = 'events';
export const PROBE = 'data/atlas/probes/holidays-2026-09-24.json';

export const HEADS = {
  'de-DE': ['gesetzliche feiertage', 'feiertage'],
  'fr-FR': ['jours feries'],
  'es-ES': ['dias festivos', 'festivos nacionales', 'festivos'],
  'it-IT': ['giorni festivi'],
  'nl-NL': ['nationale feestdagen', 'officiele feestdagen', 'feestdagen'],
  'pl-PL': ['dni wolne od pracy', 'dni wolne'],
  'pt-BR': ['feriados nacionais', 'feriados'],
  'en-US': ['public holidays in', 'public holidays'],
};

// Articles and prepositions, and nothing that narrows the question. A month
// name is not here: `feiertage mai 2026` is a different page and is refused.
export const FILLERS = {
  'de-DE': ['in', 'im', 'der', 'die', 'das', 'den'],
  'fr-FR': ['en', 'au', 'aux', 'a', 'la', 'le', 'les', 'du', 'de', 'des'],
  'es-ES': ['en', 'el', 'la', 'los', 'las', 'de'],
  'it-IT': ['in', 'a', 'al', 'ai', 'il', 'la', 'le', 'lo', 'gli'],
  'nl-NL': ['in', 'de', 'het', 'van'],
  'pl-PL': ['w', 'we', 'na'],
  'pt-BR': ['em', 'no', 'na', 'nos', 'nas', 'o', 'a', 'os', 'as', 'de', 'do', 'da'],
  'en-US': ['the', 'in'],
};

// What an unqualified head term means in each market. Only the market's own
// country, and only where naming it is what the searcher meant: an unqualified
// `feiertage` in Germany is not a question about Austria.
export const SELF = {
  'de-DE': 'DE', 'fr-FR': 'FR', 'es-ES': 'ES', 'it-IT': 'IT',
  'nl-NL': 'NL', 'pl-PL': 'PL', 'pt-BR': 'BR', 'en-US': 'US',
};

// Names the markets use here that the country table does not carry.
export const EXTRA = {
  'nl-NL': { duitse: 'DE', belgie: 'BE' },
  'pl-PL': { niemcy: 'DE' },
};

const YEAR = /\b(19|20)\d{2}\b/g;

export function countryOf(keyword, market, isoList, { covered = null } = {}) {
  const cleaned = String(keyword).replace(YEAR, ' ').replace(/\s+/g, ' ').trim();
  const hit = stripHead(fold(cleaned), HEADS[market] || []);
  if (!hit) return { reason: 'no head term' };
  const stop = new Set((FILLERS[market] || []).map(fold));
  const rest = hit.rest.split(/\s+/).filter((t) => t && !stop.has(t)).join(' ').trim();
  if (!rest) {
    const self = SELF[market];
    if (!self) return { reason: 'head term alone and no country implied in this market' };
    return { iso2: self, how: 'implied by the market' };
  }
  const extra = (EXTRA[market] || {})[rest];
  if (extra) return { iso2: extra, how: 'market name' };
  return countryFrom(cleaned, market, isoList, { heads: HEADS, fillers: FILLERS });
}

export function run({ probe = PROBE } = {}) {
  const covered = new Set(holidayCountries());
  // Resolution runs against every country there is and coverage is checked
  // afterwards, so that a Brazilian row resolves to Brazil and is refused for
  // the real reason rather than counted as not a country at all.
  const isoList = [...covered];
  const j = JSON.parse(readFileSync(new URL(probe, ROOT), 'utf8'));
  const files = {};
  const rows = [];
  const skipped = { notACountry: 0, outsideCoverage: 0, duplicate: 0, zeroVolume: 0 };
  const unserved = new Map();
  const byMethod = {};

  for (const [market, block] of Object.entries(j.markets || {})) {
    const kept = [];
    for (const r of block.rows || []) {
      const c = countryOf(r.keyword, market, isoList, { covered });
      if (!c.iso2) {
        // A row that resolves nowhere and a row that resolves to a country
        // with no data are different failures and are counted separately.
        if ((c.reason || '').startsWith('outside coverage')) {
          skipped.outsideCoverage++;
          unserved.set(r.keyword, r.volume);
        } else skipped.notACountry++;
        continue;
      }
      if (!covered.has(c.iso2)) {
        skipped.outsideCoverage++;
        unserved.set(r.keyword, r.volume);
        continue;
      }
      if (!(r.volume > 0)) { skipped.zeroVolume++; continue; }
      byMethod[c.how] = (byMethod[c.how] || 0) + 1;
      const prev = kept.find((k) => k.iso2 === c.iso2);
      if (prev) {
        skipped.duplicate++;
        const better = r.volume > prev.volume || (r.volume === prev.volume && r.keyword.length < prev.keyword.length);
        if (better) { prev.keyword = r.keyword; prev.volume = r.volume; prev.difficulty = r.difficulty ?? null; }
        continue;
      }
      kept.push({ keyword: r.keyword, volume: r.volume, difficulty: r.difficulty ?? null, iso2: c.iso2 });
    }
    if (!kept.length) continue;
    files[market] = {
      country: block.country,
      market,
      select: 'keyword,volume,difficulty',
      unitsPerRow: j.unitsPerRow ?? 21,
      unitsTotal: (block.rows || []).length * (j.unitsPerRow ?? 21),
      family: FAMILY,
      note: 'Discovered from the market head term for a public holiday. An unqualified head term resolves to the market own country, which is what the searcher means and what carries the largest volumes. A region, a month, or a country the source cannot reach is refused.',
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

  return {
    family: FAMILY,
    probe,
    pairs: rows.length,
    byMarket: Object.fromEntries(Object.entries(files).map(([m, f]) => [m, f.keywords.length])),
    entities: new Set(rows.map((r) => r.entity)).size,
    resolvedBy: byMethod,
    skipped,
    unservedDemand: [...unserved.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => k + ': ' + v),
    unservedVolume: [...unserved.values()].reduce((a, b) => a + b, 0),
    totalVolume: Object.values(files).flatMap((f) => f.keywords).reduce((t, k) => t + k.volume, 0),
    files,
    rows,
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = run();
  if (process.argv.includes('--write')) {
    for (const [market, f] of Object.entries(r.files)) {
      writeMeasurement(new URL('data/atlas/measurements/ahrefs-holidays-' + market + '-2026-09-24.json', ROOT), f, { overwrite: process.argv.includes('--overwrite') });
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
