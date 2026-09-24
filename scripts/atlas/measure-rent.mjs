// The Stay surface, measured on the one rent question the source can answer.
//
//   node scripts/atlas/measure-rent.mjs            report only
//   node scripts/atlas/measure-rent.mjs --write    write the file and the plan
//
// Stay is the surface the brief asks for hardest and the one with the least
// data behind it. Everything a marketplace would supply is blocked: no
// inventory is licensed, the rent level Eurostat publishes does not exist, and
// every candidate source for asking rents forbids the scrape that would produce
// it. So the surface had no page at all.
//
// What is built is the harmonised rent index: an index of rents paid against
// 2015 and its annual change, for thirty six countries. Two markets ask about
// exactly that every year, because both cap the annual increase by a published
// figure, and the numbers are the largest in this whole round of measurement
// outside the holiday calendars: `huurverhoging 2026` is four thousand four
// hundred a month at difficulty zero, and `irl 2026`, which is the name of the
// French reference index itself, is four thousand three hundred.
//
// Five pages, one per market, each about the country that market lives in. A
// Dutch page about Spanish rent inflation was asked for and does not exist as a
// search, which is the expected shape: a rent rise is a domestic question.

import { readFileSync, writeFileSync } from 'node:fs';
import { writeMeasurement } from './measurement-file.mjs';
import { rootFrom } from '../../lib/atlas/repo-root.js';
import { MARKET_LANG, MARKET_COUNTRY } from '../../lib/atlas/keyword-country.js';

const ROOT = rootFrom(import.meta.url);
export const CAPTURED_ON = '2026-09-25';
const FAMILY = 'rents.country-inflation';

export const ASKED = [
  { entity: 'NL', market: 'nl-NL', keyword: 'huurverhoging 2026', volume: 4400, difficulty: 0, cpc: 8, plan: true },
  { entity: 'FR', market: 'fr-FR', keyword: 'irl 2026', volume: 4300, difficulty: 18, cpc: 1, plan: true },
  { entity: 'ES', market: 'es-ES', keyword: 'subida del alquiler 2026', volume: 250, difficulty: null, cpc: null, plan: true },
  { entity: 'DE', market: 'de-DE', keyword: 'mietpreisentwicklung', volume: 150, difficulty: 5, cpc: 15, plan: true },
  { entity: 'IT', market: 'it-IT', keyword: 'adeguamento istat affitto', volume: 150, difficulty: 0, cpc: 1, plan: true },
  // Stronger or equal phrasings that were not planned, and why.
  { entity: 'NL', market: 'nl-NL', keyword: 'huurverhoging', volume: 1300, difficulty: 12, cpc: 10, plan: false, why: 'the same question as the planned keyword, without the year the page is about' },
  { entity: 'NL', market: 'nl-NL', keyword: 'huurprijzen 2026', volume: 100, difficulty: null, cpc: null, plan: false, why: 'asks for a price level, which this source does not publish' },
  { entity: 'FR', market: 'fr-FR', keyword: 'augmentation loyer 2026', volume: 2700, difficulty: 26, cpc: 1, plan: false, why: 'the same question as the planned keyword, which is the name of the index itself' },
  { entity: 'FR', market: 'fr-FR', keyword: 'indice de reference des loyers', volume: 600, difficulty: 45, cpc: 1, plan: false, why: 'the same index, spelled out, at a fifth of the volume and two and a half times the difficulty' },
  { entity: 'DE', market: 'de-DE', keyword: 'mieten steigen', volume: 100, difficulty: 25, cpc: 2, plan: false, why: 'the same question in fewer searches' },
  { entity: 'DE', market: 'de-DE', keyword: 'mieterhöhung 2026', volume: 70, difficulty: null, cpc: null, plan: false, why: 'the increase a landlord may ask for, which is tenancy law rather than the index' },
  { entity: 'DE', market: 'de-DE', keyword: 'mietpreise 2026', volume: 10, difficulty: null, cpc: null, plan: false, why: 'asks for a price level, which this source does not publish' },
  { entity: 'IT', market: 'it-IT', keyword: 'aumento affitti 2026', volume: 0, difficulty: null, cpc: null, plan: false, why: 'no measured demand' },
  { entity: 'PL', market: 'pl-PL', keyword: 'wzrost czynszu 2026', volume: 0, difficulty: null, cpc: null, plan: false, why: 'no measured demand, so Poland has no Stay page' },
  { entity: 'ES', market: 'es-ES', keyword: 'precio del alquiler 2026', volume: null, difficulty: null, cpc: null, plan: false, why: 'no row returned, and it asks for a price level in any case' },
];

const COUNTRY_CODE = { 'nl-NL': 'nl', 'fr-FR': 'fr', 'es-ES': 'es', 'de-DE': 'de', 'it-IT': 'it', 'pl-PL': 'pl' };

export function run() {
  const rows = ASKED.filter((a) => a.plan && a.volume > 0).map((a) => ({
    q: a.keyword, family: FAMILY, vertical: 'rents', priority: 'high',
    entity: a.entity, market: a.market, language: MARKET_LANG[a.market], country: MARKET_COUNTRY[a.market],
    measuredOn: CAPTURED_ON,
  }));
  return {
    asked: ASKED.length,
    planned: rows.length,
    monthlySearchesPlanned: ASKED.filter((a) => a.plan && a.volume > 0).reduce((t, a) => t + a.volume, 0),
    notPlanned: ASKED.filter((a) => !a.plan).map((a) => a.market + ' "' + a.keyword + '" (' + a.volume + '): ' + a.why),
    rows,
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = run();
  if (process.argv.includes('--write')) {
    const byMarket = {};
    for (const a of ASKED) (byMarket[a.market] ||= []).push(a);
    for (const [market, asked] of Object.entries(byMarket)) {
      writeMeasurement(new URL('data/atlas/measurements/ahrefs-rent-' + market + '-' + CAPTURED_ON + '.json', ROOT), {
        provider: 'Ahrefs Keywords Explorer, overview',
        endpoint: 'keywords-explorer-overview',
        capturedOn: CAPTURED_ON,
        country: COUNTRY_CODE[market],
        market,
        select: 'keyword,volume,difficulty,cpc,parent_topic',
        unitsPerRow: 23,
        unitsTotal: asked.length * 23,
        families: [FAMILY],
        note: 'Rent movement demand, asked in the words each market uses for its own regulated increase. The French keyword is the name of the reference index and the Dutch one is the name of the annual rise, which is why both are large and both are answered by the same published series.',
        caution: 'Several phrasings with demand ask for a rent level rather than a rent movement. They are recorded and not planned, because no comparable level exists for these countries and answering a price question with an index would be answering a different question.',
        keywords: asked.filter((a) => a.volume != null).map((a) => ({
          keyword: a.keyword, volume: a.volume, difficulty: a.difficulty, cpc: a.cpc,
          family: FAMILY, entity: a.entity, market: a.market,
          ...(a.plan ? {} : { notPlanned: a.why }),
        })),
        notReturned: asked.filter((a) => a.volume == null).map((a) => a.keyword),
      }, { overwrite: process.argv.includes('--overwrite') });
    }
    const planUrl = new URL('data/atlas/measurement-plan.json', ROOT);
    const plan = JSON.parse(readFileSync(planUrl, 'utf8'));
    const have = new Set(plan.rows.map((x) => x.family + '|' + x.entity + '|' + x.market));
    const added = r.rows.filter((x) => !have.has(x.family + '|' + x.entity + '|' + x.market));
    plan.rows.push(...added);
    writeFileSync(planUrl, JSON.stringify(plan, null, 1) + '\n');
    console.error('new plan rows: ' + added.length);
  }
  const { rows, ...summary } = r;
  console.log(JSON.stringify(summary, null, 1));
}
