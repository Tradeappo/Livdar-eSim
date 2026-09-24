// Turning measured salary phrasings into measurable pages.
//
//   node scripts/atlas/measure-salary.mjs            report only
//   node scripts/atlas/measure-salary.mjs --write    write plan and files
//
// The Work surface had twenty three eligible pages and every one of them was
// already inside cohort 001, which is why the second cohort could not carry
// Work at all. The source was never the constraint: Eurostat covers thirty
// five countries with gross and net monthly earnings, and only twenty five
// country and market pairs had ever been given a keyword.
//
// The head terms are not translations of each other and that is the point.
// German and Dutch compound the whole question into one noun. The Romance
// markets put the adjective after the noun. Polish uses a prepositional phrase
// that inflects the country, so `niemczech` appears and `niemcy` never does.
// Japanese asks about annual income rather than about salary, and its results
// are dominated by age and occupation rather than by place.
//
// Three traps this family has that the cost of living family does not:
//
//   The market's own country is the head of its own list, at ten to thirty
//   times the volume of anything else. That is a real page and it is kept, but
//   it means a cohort drawn on volume alone would be nine pages about nine
//   countries asking about themselves.
//
//   `average salary in georgia` is Atlanta, not Tbilisi, exactly as it is for
//   cost of living, and the shared ambiguity table already refuses it.
//
//   Occupations and employers look like places to a subtraction rule.
//   `zarobki w biedronce` is a supermarket, `stipendio medio serie b` is a
//   football division and `durchschnittsgehalt arzt` is a doctor. None of them
//   resolves to a country, so all of them are refused, which is the rule doing
//   its job rather than an oversight.

import { readFileSync, writeFileSync } from 'node:fs';
import { writeMeasurement } from './measurement-file.mjs';
import { sourceCoverage, resetCaches } from '../../lib/atlas/eligibility-pages.js';
import { rootFrom } from '../../lib/atlas/repo-root.js';
import { countryFrom, MARKET_LANG, MARKET_COUNTRY } from '../../lib/atlas/keyword-country.js';

const ROOT = rootFrom(import.meta.url);
export const FAMILY = 'work.country-salaries';
export const VERTICAL = 'work';
export const PROBE = 'data/atlas/probes/salary-2026-09-24.json';

export const HEADS = {
  'en-US': ['what is the average salary in', 'average salary in', 'average salary'],
  'de-DE': ['durchschnittsgehalt'],
  'fr-FR': ['salaire moyen'],
  'it-IT': ['stipendio medio'],
  'es-ES': ['salario medio'],
  'pt-BR': ['salario medio', 'salrio mdio'],
  'nl-NL': ['gemiddeld salaris'],
  'pl-PL': ['srednie zarobki w', 'zarobki w'],
  'ja-JP': ['平均年収'],
};

// Articles and prepositions, plus the words that qualify the figure rather
// than the place: net, gross, monthly, annual and the year. A keyword that
// differs from another only by one of these is the same page, and the
// duplicate rule then keeps whichever of them is searched more.
export const FILLERS = {
  'en-US': ['the', 'in', 'a', 'is', 'what', 'whats', "what's"],
  'de-DE': ['in', 'im', 'der', 'die', 'das', 'den', 'netto', 'brutto', 'median', 'pro', 'monat', 'jahr'],
  'fr-FR': ['en', 'au', 'aux', 'a', 'la', 'le', 'les', 'du', 'de', 'des', 'net', 'brut', 'quel', 'est'],
  'it-IT': ['in', 'a', 'al', 'ai', 'negli', 'nei', 'nel', 'nella', 'il', 'la', 'le', 'lo', 'gli', 'netto', 'lordo'],
  'es-ES': ['en', 'el', 'la', 'los', 'las', 'de', 'neto', 'bruto', 'anual', 'mensual', 'cual', 'cuanto', 'es'],
  'pt-BR': ['em', 'no', 'na', 'nos', 'nas', 'o', 'a', 'os', 'as', 'de', 'do', 'da', 'liquido', 'bruto', 'qual'],
  'nl-NL': ['in', 'de', 'het', 'van', 'netto', 'bruto', 'wat', 'is', 'een'],
  'pl-PL': ['w', 'we', 'na', 'netto', 'brutto'],
  'ja-JP': [],
};

// A year written into the keyword is the same page as the keyword without it,
// and next year it is a different string. Stripping it before resolution keeps
// `salario medio espana 2025` and `salario medio espana` from becoming two
// pages about Spain.
const YEAR = /\b(19|20)\d{2}\b/g;

export const countryOf = (keyword, market, isoList) =>
  countryFrom(String(keyword).replace(YEAR, ' '), market, isoList, { heads: HEADS, fillers: FILLERS });

export function run({ probe = PROBE } = {}) {
  resetCaches();
  const covered = sourceCoverage()['salary-data-verified'];
  const isoList = [...covered];
  const j = JSON.parse(readFileSync(new URL(probe, ROOT), 'utf8'));
  const files = {};
  const rows = [];
  const skipped = { notACountry: 0, zeroVolume: 0, duplicate: 0 };
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
        // The stronger keyword wins; on a tie the shorter one, so the page
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
      note: 'Discovered from the market head term for earnings and resolved to a country by subtraction. Occupations, employers, football divisions, ages and cities all fail to resolve and are refused, which is why a probe of four hundred rows yields far fewer pages than rows.',
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
    totalVolume: Object.values(files).flatMap((f) => f.keywords).reduce((t, k) => t + k.volume, 0),
    files,
    rows,
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = run();
  if (process.argv.includes('--write')) {
    // `ahrefs-salary-<market>` was already taken by an earlier run. The name
    // says what this file is rather than which family it feeds, so the two
    // cannot collide again.
    for (const [market, f] of Object.entries(r.files)) {
      writeMeasurement(new URL('data/atlas/measurements/ahrefs-salary-demand-' + market + '-2026-09-24.json', ROOT), f, { overwrite: process.argv.includes('--overwrite') });
    }
    const planUrl = new URL('data/atlas/measurement-plan.json', ROOT);
    const plan = JSON.parse(readFileSync(planUrl, 'utf8'));
    const have = new Set(plan.rows.map((x) => x.family + '|' + x.entity + '|' + x.market));
    const added = r.rows.filter((x) => !have.has(x.family + '|' + x.entity + '|' + x.market));
    plan.rows.push(...added);
    writeFileSync(planUrl, JSON.stringify(plan, null, 1) + '\n');
    console.error('new plan rows: ' + added.length + ' (of ' + r.rows.length + ' resolved)');
  }
  const { files, rows, ...summary } = r;
  console.log(JSON.stringify(summary, null, 1));
}
