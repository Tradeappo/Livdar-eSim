// The rest of the Pulse demand, across every market the holiday source can
// answer in.
//
//   node scripts/atlas/measure-pulse.mjs            report only
//   node scripts/atlas/measure-pulse.mjs --write    write the files and the plan
//
// The source was built on 2026-09-24 and covers 36 countries and 82 top level
// regions. Twenty five of those pairs had a keyword. That was not a statement
// about the demand, it was a statement about how far the first pass got: the
// first pass asked about the country each market lives in and stopped.
//
// This asks the other two questions. The first is which other countries a
// market asks about, and the answer is a lot of them: Japan searches for
// German public holidays a thousand times a month, the Netherlands searches
// for Spanish ones five hundred times, and Germany searches for Austrian,
// French, Swiss and Italian ones between two and five thousand times each.
// Nobody in those markets is planning a bank transfer, they are planning a
// trip or a delivery, and that is a Pulse question rather than a local one.
//
// The second is the region level, which is where the volume actually is. The
// German states were already half measured and the half that was missing
// contains Hamburg at twenty two thousand a month. The Swiss cantons and the
// Spanish autonomous communities had never been asked at all, and twelve of
// the nineteen Spanish ones carry more than five hundred searches a month.
//
// Every phrasing asked is recorded, including the ones that came back at zero,
// so that the next run does not spend units asking again.

import { readFileSync, writeFileSync } from 'node:fs';
import { writeMeasurement } from './measurement-file.mjs';
import { rootFrom } from '../../lib/atlas/repo-root.js';
import { MARKET_LANG, MARKET_COUNTRY } from '../../lib/atlas/keyword-country.js';
import { forSubdivision, splitEntity } from '../../lib/atlas/holidays.js';
import { measuredKeywords, resetCaches } from '../../lib/atlas/eligibility-pages.js';

const ROOT = rootFrom(import.meta.url);
export const CAPTURED_ON = '2026-09-25';

const C = 'events.country-holidays';
const S = 'events.subdivision-holidays';

// Every keyword asked, with the volume and difficulty that came back. A row
// with `volume: 0` is a finding and stays. A row with `volume: null` is a
// phrasing the provider had no row for at all, which is weaker evidence than a
// measured zero and is treated the same way: not demand.
export const ASKED = [
  // Germany asking about its own states. The seven that had no keyword.
  { family: S, entity: 'DE-HH', market: 'de-DE', keyword: 'feiertage hamburg 2026', volume: 22000, difficulty: 0, cpc: 90 },
  { family: S, entity: 'DE-HB', market: 'de-DE', keyword: 'feiertage bremen 2026', volume: 5500, difficulty: 0, cpc: 6 },
  { family: S, entity: 'DE-SL', market: 'de-DE', keyword: 'feiertage saarland 2026', volume: 3800, difficulty: 0, cpc: 5 },
  { family: S, entity: 'DE-ST', market: 'de-DE', keyword: 'feiertage sachsen-anhalt 2026', volume: 1100, difficulty: null, cpc: 4 },
  { family: S, entity: 'DE-SH', market: 'de-DE', keyword: 'feiertage schleswig-holstein 2026', volume: 700, difficulty: null, cpc: 5 },
  { family: S, entity: 'DE-RP', market: 'de-DE', keyword: 'feiertage rheinland-pfalz 2026', volume: 700, difficulty: 0, cpc: 4 },
  { family: S, entity: 'DE-MV', market: 'de-DE', keyword: 'feiertage mecklenburg-vorpommern 2026', volume: 150, difficulty: null, cpc: 3 },
  // Germany asking about the Swiss cantons, which share its language and are
  // where a German reader crossing the border actually needs the answer.
  { family: S, entity: 'CH-ZH', market: 'de-DE', keyword: 'feiertage zürich 2026', volume: 500, difficulty: null, cpc: null },
  { family: S, entity: 'CH-BE', market: 'de-DE', keyword: 'feiertage bern 2026', volume: 100, difficulty: null, cpc: null },
  { family: S, entity: 'CH-AG', market: 'de-DE', keyword: 'feiertage aargau 2026', volume: 100, difficulty: null, cpc: null },
  { family: S, entity: 'CH-LU', market: 'de-DE', keyword: 'feiertage luzern 2026', volume: 90, difficulty: null, cpc: null },
  { family: S, entity: 'CH-BS', market: 'de-DE', keyword: 'feiertage basel 2026', volume: 50, difficulty: null, cpc: null },
  // Germany asking about other countries.
  { family: C, entity: 'FR', market: 'de-DE', keyword: 'feiertage frankreich 2026', volume: 4600, difficulty: 0, cpc: 1 },
  { family: C, entity: 'AT', market: 'de-DE', keyword: 'feiertage österreich 2026', volume: 3800, difficulty: 0, cpc: 1 },
  { family: C, entity: 'CH', market: 'de-DE', keyword: 'feiertage schweiz 2026', volume: 2600, difficulty: 1, cpc: null },
  { family: C, entity: 'IT', market: 'de-DE', keyword: 'feiertage italien 2026', volume: 2600, difficulty: 0, cpc: 6 },
  { family: C, entity: 'ES', market: 'de-DE', keyword: 'feiertage spanien 2026', volume: 700, difficulty: null, cpc: 6 },
  { family: C, entity: 'CZ', market: 'de-DE', keyword: 'feiertage tschechien 2026', volume: 400, difficulty: null, cpc: 7 },
  // Asked and not planned: the German 2027 calendar is thirteen thousand a
  // month and the page for it is a second page about Germany, which this
  // family cannot carry because its entity is the country and not the year.
  { family: C, entity: 'DE', market: 'de-DE', keyword: 'feiertage 2027', volume: 13000, difficulty: 0, cpc: 5, note: 'a second year for a country that already has a page' },

  // Spain asking about its own autonomous communities. Twelve of the nineteen
  // had no keyword, and every one of those twelve carries demand.
  { family: S, entity: 'ES-CM', market: 'es-ES', keyword: 'festivos castilla la mancha 2026', volume: 3200, difficulty: 0, cpc: 2 },
  { family: S, entity: 'ES-AN', market: 'es-ES', keyword: 'festivos andalucia 2026', volume: 2500, difficulty: 1, cpc: null },
  { family: S, entity: 'ES-MC', market: 'es-ES', keyword: 'festivos murcia 2026', volume: 2400, difficulty: 0, cpc: null },
  { family: S, entity: 'ES-NC', market: 'es-ES', keyword: 'festivos navarra 2026', volume: 2100, difficulty: 0, cpc: 1 },
  { family: S, entity: 'ES-CL', market: 'es-ES', keyword: 'festivos castilla y leon 2026', volume: 2100, difficulty: 0, cpc: null },
  { family: S, entity: 'ES-CN', market: 'es-ES', keyword: 'festivos canarias 2026', volume: 1900, difficulty: 0, cpc: 2 },
  { family: S, entity: 'ES-AS', market: 'es-ES', keyword: 'festivos asturias 2026', volume: 1500, difficulty: 0, cpc: null },
  { family: S, entity: 'ES-EX', market: 'es-ES', keyword: 'festivos extremadura 2026', volume: 1300, difficulty: 0, cpc: null },
  { family: S, entity: 'ES-CB', market: 'es-ES', keyword: 'festivos cantabria 2026', volume: 1300, difficulty: 0, cpc: 1 },
  { family: S, entity: 'ES-AR', market: 'es-ES', keyword: 'festivos aragon 2026', volume: 1000, difficulty: null, cpc: null },
  { family: S, entity: 'ES-PV', market: 'es-ES', keyword: 'festivos pais vasco 2026', volume: 600, difficulty: null, cpc: null },
  { family: S, entity: 'ES-RI', market: 'es-ES', keyword: 'festivos la rioja 2026', volume: 500, difficulty: 0, cpc: null },
  { family: C, entity: 'FR', market: 'es-ES', keyword: 'dias festivos francia 2026', volume: 100, difficulty: null, cpc: null },
  { family: C, entity: 'MX', market: 'es-ES', keyword: 'dias festivos mexico 2026', volume: 30, difficulty: null, cpc: null },
  { family: C, entity: 'PT', market: 'es-ES', keyword: 'dias festivos portugal 2026', volume: 30, difficulty: null, cpc: null },
  { family: C, entity: 'IT', market: 'es-ES', keyword: 'dias festivos italia 2026', volume: 20, difficulty: null, cpc: null },

  // France. The country level demand is small in every direction except its
  // own, and the overseas departments in the source carry almost none.
  { family: S, entity: 'CH-GE', market: 'fr-FR', keyword: 'jours feries geneve 2026', volume: 100, difficulty: null, cpc: null },
  { family: C, entity: 'LU', market: 'fr-FR', keyword: 'jours feries luxembourg 2026', volume: 90, difficulty: null, cpc: null },
  { family: C, entity: 'BE', market: 'fr-FR', keyword: 'jours feries belgique 2026', volume: 70, difficulty: null, cpc: null },
  { family: C, entity: 'ES', market: 'fr-FR', keyword: 'jours feries espagne 2026', volume: 60, difficulty: null, cpc: null },
  { family: C, entity: 'DE', market: 'fr-FR', keyword: 'jours feries allemagne 2026', volume: 30, difficulty: null, cpc: null },
  { family: C, entity: 'CH', market: 'fr-FR', keyword: 'jours feries suisse 2026', volume: 20, difficulty: null, cpc: null },
  { family: C, entity: 'PT', market: 'fr-FR', keyword: 'jours feries portugal 2026', volume: 20, difficulty: null, cpc: null },
  { family: C, entity: 'IT', market: 'fr-FR', keyword: 'jours feries italie 2026', volume: 10, difficulty: null, cpc: null },
  { family: S, entity: 'FR-GP', market: 'fr-FR', keyword: 'jours feries guadeloupe 2026', volume: 10, difficulty: null, cpc: null },
  { family: S, entity: 'FR-MQ', market: 'fr-FR', keyword: 'jours feries martinique 2026', volume: 0, difficulty: null, cpc: null },
  { family: S, entity: 'FR-GY', market: 'fr-FR', keyword: 'jours feries guyane 2026', volume: 0, difficulty: null, cpc: null },
  { family: C, entity: 'FR', market: 'fr-FR', keyword: 'jours feries 2027', volume: 3200, difficulty: 2, cpc: 6, note: 'a second year for a country that already has a page' },

  // The United States asking about everywhere else. Small numbers and eleven
  // of them, which is the shape of an outbound travel market.
  { family: C, entity: 'DE', market: 'en-US', keyword: 'public holidays in germany 2026', volume: 150, difficulty: 39, cpc: null },
  { family: C, entity: 'ES', market: 'en-US', keyword: 'public holidays in spain 2026', volume: 100, difficulty: 35, cpc: null },
  { family: C, entity: 'MX', market: 'en-US', keyword: 'public holidays in mexico 2026', volume: 100, difficulty: 38, cpc: null },
  { family: C, entity: 'FR', market: 'en-US', keyword: 'public holidays in france 2026', volume: 70, difficulty: null, cpc: null },
  { family: C, entity: 'IT', market: 'en-US', keyword: 'public holidays in italy 2026', volume: 50, difficulty: null, cpc: null },
  { family: C, entity: 'PL', market: 'en-US', keyword: 'public holidays in poland 2026', volume: 50, difficulty: null, cpc: null },
  { family: C, entity: 'IE', market: 'en-US', keyword: 'public holidays in ireland 2026', volume: 20, difficulty: null, cpc: null },
  { family: C, entity: 'PT', market: 'en-US', keyword: 'public holidays in portugal 2026', volume: 20, difficulty: null, cpc: null },
  { family: C, entity: 'SE', market: 'en-US', keyword: 'public holidays in sweden 2026', volume: 20, difficulty: null, cpc: null },
  { family: C, entity: 'CH', market: 'en-US', keyword: 'public holidays in switzerland 2026', volume: 10, difficulty: null, cpc: null },
  { family: C, entity: 'NL', market: 'en-US', keyword: 'public holidays in netherlands 2026', volume: 10, difficulty: null, cpc: null },
  { family: C, entity: 'ZA', market: 'en-US', keyword: 'south africa public holidays 2027', volume: 0, difficulty: null, cpc: null },

  // Italy. Switzerland is the strongest, which is the Ticino border.
  { family: C, entity: 'CH', market: 'it-IT', keyword: 'giorni festivi svizzera 2026', volume: 200, difficulty: null, cpc: null },
  { family: C, entity: 'FR', market: 'it-IT', keyword: 'giorni festivi francia 2026', volume: 100, difficulty: null, cpc: 1 },
  { family: C, entity: 'DE', market: 'it-IT', keyword: 'giorni festivi germania 2026', volume: 40, difficulty: null, cpc: null },
  { family: C, entity: 'AT', market: 'it-IT', keyword: 'giorni festivi austria 2026', volume: 30, difficulty: null, cpc: null },
  { family: C, entity: 'ES', market: 'it-IT', keyword: 'giorni festivi spagna 2026', volume: 10, difficulty: null, cpc: null },
  { family: C, entity: 'PT', market: 'it-IT', keyword: 'giorni festivi portogallo 2026', volume: 10, difficulty: null, cpc: null },
  { family: S, entity: 'IT-LO', market: 'it-IT', keyword: 'giorni festivi lombardia 2026', volume: 10, difficulty: null, cpc: null },

  // The Netherlands asks about ten other countries, none of them at zero.
  { family: C, entity: 'ES', market: 'nl-NL', keyword: 'feestdagen spanje 2026', volume: 500, difficulty: null, cpc: 1 },
  { family: C, entity: 'FR', market: 'nl-NL', keyword: 'feestdagen frankrijk 2026', volume: 450, difficulty: null, cpc: 1 },
  { family: C, entity: 'IT', market: 'nl-NL', keyword: 'feestdagen italie 2026', volume: 300, difficulty: null, cpc: null },
  { family: C, entity: 'AT', market: 'nl-NL', keyword: 'feestdagen oostenrijk 2026', volume: 250, difficulty: null, cpc: null },
  { family: C, entity: 'PT', market: 'nl-NL', keyword: 'feestdagen portugal 2026', volume: 150, difficulty: null, cpc: null },
  { family: C, entity: 'PL', market: 'nl-NL', keyword: 'feestdagen polen 2026', volume: 150, difficulty: null, cpc: null },
  { family: C, entity: 'CH', market: 'nl-NL', keyword: 'feestdagen zwitserland 2026', volume: 100, difficulty: null, cpc: null },
  { family: C, entity: 'SE', market: 'nl-NL', keyword: 'feestdagen zweden 2026', volume: 100, difficulty: null, cpc: null },
  { family: C, entity: 'LU', market: 'nl-NL', keyword: 'feestdagen luxemburg 2026', volume: 90, difficulty: null, cpc: null },
  { family: C, entity: 'IE', market: 'nl-NL', keyword: 'feestdagen ierland 2026', volume: 70, difficulty: null, cpc: null },

  // Poland. The neighbours and the places Poles work in.
  { family: C, entity: 'NL', market: 'pl-PL', keyword: 'dni wolne w holandii 2026', volume: 250, difficulty: null, cpc: null },
  { family: C, entity: 'FR', market: 'pl-PL', keyword: 'dni wolne we francji 2026', volume: 200, difficulty: null, cpc: null },
  { family: C, entity: 'CZ', market: 'pl-PL', keyword: 'dni wolne w czechach 2026', volume: 150, difficulty: null, cpc: null },
  { family: C, entity: 'AT', market: 'pl-PL', keyword: 'dni wolne w austrii 2026', volume: 150, difficulty: null, cpc: null },
  { family: C, entity: 'IT', market: 'pl-PL', keyword: 'dni wolne we włoszech 2026', volume: 80, difficulty: null, cpc: null },
  { family: C, entity: 'SE', market: 'pl-PL', keyword: 'dni wolne w szwecji 2026', volume: 80, difficulty: null, cpc: null },
  { family: C, entity: 'ES', market: 'pl-PL', keyword: 'dni wolne w hiszpanii 2026', volume: 70, difficulty: null, cpc: null },
  { family: C, entity: 'LT', market: 'pl-PL', keyword: 'dni wolne na litwie 2026', volume: 50, difficulty: null, cpc: null },
  { family: C, entity: 'SK', market: 'pl-PL', keyword: 'dni wolne na słowacji 2026', volume: 30, difficulty: null, cpc: null },
  { family: C, entity: 'DE', market: 'pl-PL', keyword: 'święta w niemczech 2026', volume: 500, difficulty: 42, cpc: 3, note: 'Germany already has a Polish page on an earlier keyword' },

  // Brazil. Portugal first, which is the migration corridor, and Mexico
  // second, which is not.
  { family: C, entity: 'PT', market: 'pt-BR', keyword: 'feriados portugal 2026', volume: 350, difficulty: null, cpc: 1 },
  { family: C, entity: 'MX', market: 'pt-BR', keyword: 'feriados mexico 2026', volume: 200, difficulty: null, cpc: 0 },
  { family: C, entity: 'DE', market: 'pt-BR', keyword: 'feriados alemanha 2026', volume: 100, difficulty: null, cpc: null },
  { family: C, entity: 'IT', market: 'pt-BR', keyword: 'feriados italia 2026', volume: 80, difficulty: null, cpc: null },
  { family: C, entity: 'ES', market: 'pt-BR', keyword: 'feriados espanha 2026', volume: 80, difficulty: null, cpc: null },
  { family: C, entity: 'IE', market: 'pt-BR', keyword: 'feriados irlanda 2026', volume: 60, difficulty: null, cpc: null },
  { family: C, entity: 'NL', market: 'pt-BR', keyword: 'feriados holanda 2026', volume: 30, difficulty: null, cpc: null },
  { family: C, entity: 'FR', market: 'pt-BR', keyword: 'feriados franca 2026', volume: 20, difficulty: null, cpc: null },
  { family: C, entity: 'CH', market: 'pt-BR', keyword: 'feriados suica 2026', volume: 0, difficulty: null, cpc: null },

  // Japan, which had no Pulse page at all and asks about nine countries. The
  // phrasing is the country name and the word for a public holiday, with no
  // year, because that is what the market types.
  { family: C, entity: 'DE', market: 'ja-JP', keyword: 'ドイツ 祝日', volume: 1000, difficulty: 0, cpc: 1 },
  { family: C, entity: 'FR', market: 'ja-JP', keyword: 'フランス 祝日', volume: 600, difficulty: 0, cpc: 1 },
  { family: C, entity: 'IT', market: 'ja-JP', keyword: 'イタリア 祝日', volume: 450, difficulty: 0, cpc: 2 },
  { family: C, entity: 'ES', market: 'ja-JP', keyword: 'スペイン 祝日', volume: 250, difficulty: 0, cpc: 35 },
  { family: C, entity: 'MX', market: 'ja-JP', keyword: 'メキシコ 祝日', volume: 250, difficulty: 0, cpc: 15 },
  { family: C, entity: 'NL', market: 'ja-JP', keyword: 'オランダ 祝日', volume: 200, difficulty: 0, cpc: 15 },
  { family: C, entity: 'PL', market: 'ja-JP', keyword: 'ポーランド 祝日', volume: 100, difficulty: 0, cpc: 30 },
  { family: C, entity: 'CH', market: 'ja-JP', keyword: 'スイス 祝日', volume: 100, difficulty: 0, cpc: null },
  { family: C, entity: 'PT', market: 'ja-JP', keyword: 'ポルトガル 祝日', volume: 40, difficulty: null, cpc: null },

  // The United Kingdom was asked and is not planned. It is the one market in
  // this set with no Atlas language of its own: en-GB and en-US would produce
  // the same path, so the inventory gives the English pages to en-US and the
  // British volumes cannot be published without colliding with them. The
  // largest single number here, Irish bank holidays at sixteen hundred a
  // month, is the cost of that.
  { family: C, entity: 'IE', market: 'en-GB', keyword: 'irish bank holidays 2026', volume: 1600, difficulty: 0, cpc: 10, note: 'en-GB has no Atlas language of its own' },
  { family: C, entity: 'ES', market: 'en-GB', keyword: 'spanish bank holidays 2026', volume: 350, difficulty: null, cpc: 140, note: 'en-GB has no Atlas language of its own' },
  { family: C, entity: 'DE', market: 'en-GB', keyword: 'public holidays in germany 2026', volume: 250, difficulty: 38, cpc: null, note: 'en-GB has no Atlas language of its own' },
  { family: C, entity: 'FR', market: 'en-GB', keyword: 'public holidays in france 2026', volume: 250, difficulty: null, cpc: null, note: 'en-GB has no Atlas language of its own' },
];

// Markets the inventory publishes Atlas pages in. A measured row for a market
// outside this set is recorded and not planned, because the page would collide
// with another market's path rather than exist beside it.
const PUBLISHED = new Set(['en-US', 'de-DE', 'ja-JP', 'it-IT', 'es-ES', 'fr-FR', 'nl-NL', 'pl-PL', 'pt-BR']);
const COUNTRY_CODE = { 'en-US': 'us', 'en-GB': 'gb', 'de-DE': 'de', 'fr-FR': 'fr', 'es-ES': 'es', 'it-IT': 'it', 'pt-BR': 'br', 'nl-NL': 'nl', 'pl-PL': 'pl', 'ja-JP': 'jp' };

// Two regions that keep exactly the same days get one page between them. This
// is not a de-duplication of text, it is a cannibalisation rule: four German
// states in the north keep an identical calendar, and four pages listing the
// same twelve dates would compete with each other for the same query and split
// whatever authority any of them earned. The page with the most demand keeps
// it, the others are given up, and the volume given up is reported rather than
// quietly dropped.
//
// The signature is the sorted list of dates the region actually keeps, read
// from the source rather than from the page, so a copy change cannot alter
// which regions are considered the same.
export function calendarSignature(entity) {
  const split = splitEntity(entity);
  const d = split && forSubdivision(split.iso2, split.shortName);
  return d ? split.iso2 + '::' + d.days.map((h) => h.date).sort().join(',') : entity;
}

// The collapse runs over the new rows and the rows the plan already holds
// together, because the four identical German states did not all arrive in the
// same pass: Niedersachsen was planned in September and Hamburg, Bremen and
// Schleswig-Holstein were measured now, and a rule that only looked at the new
// ones would leave the oldest of the four in place and drop the largest.
export function collapseSubdivisions(newRows, planRows) {
  const all = [
    ...planRows.filter((r) => r.family === S).map((r) => ({ ...r, fromPlan: true })),
    ...newRows.filter((r) => r.family === S).map((r) => ({ ...r, fromPlan: false })),
  ];
  // The volume comes from the measurement store rather than from the list in
  // this file, because the rows being compared were measured in two different
  // passes. Reading only this file's list scored every earlier row at zero and
  // collapsed Nordrhein-Westfalen, at two hundred and two thousand a month,
  // onto Rheinland-Pfalz at seven hundred.
  const measured = measuredKeywords();
  const volumeOf = (row) => {
    const m = measured.get(row.family + '|' + row.entity + '|' + row.market);
    if (m) return m.volume;
    const hit = ASKED.find((a) => a.keyword === row.q && a.market === row.market);
    return hit ? hit.volume : 0;
  };
  const best = new Map();
  for (const row of all) {
    const key = row.market + '|' + calendarSignature(row.entity);
    const prev = best.get(key);
    if (!prev || volumeOf(row) > volumeOf(prev)) best.set(key, row);
  }
  const given = [];
  for (const row of all) {
    const key = row.market + '|' + calendarSignature(row.entity);
    if (best.get(key) !== row) given.push({ ...row, onto: best.get(key).entity, volume: volumeOf(row) });
  }
  return { keep: new Set([...best.values()]), givenUp: given };
}

export function run({ existing } = {}) {
  resetCaches();
  const have = existing || takenPairs();
  const best = new Map();
  const notPlanned = [];
  for (const a of ASKED) {
    const key = a.family + '|' + a.entity + '|' + a.market;
    if (!(a.volume > 0)) { notPlanned.push({ ...a, why: 'no measured demand' }); continue; }
    if (!PUBLISHED.has(a.market)) { notPlanned.push({ ...a, why: 'market not published' }); continue; }
    if (have.has(key)) { notPlanned.push({ ...a, why: 'the pair already has a keyword' }); continue; }
    const prev = best.get(key);
    if (!prev || a.volume > prev.volume) best.set(key, a);
  }
  let rows = [...best.values()].map((a) => ({
    q: a.keyword, family: a.family, vertical: 'events', priority: 'high',
    entity: a.entity, market: a.market, language: MARKET_LANG[a.market], country: MARKET_COUNTRY[a.market],
    measuredOn: CAPTURED_ON,
  }));
  const plan = JSON.parse(readFileSync(new URL('data/atlas/measurement-plan.json', ROOT), 'utf8'));
  const collapse = collapseSubdivisions(rows, plan.rows);
  const keptKeys = new Set([...collapse.keep].map((r) => r.family + '|' + r.entity + '|' + r.market));
  rows = rows.filter((r) => r.family !== S || keptKeys.has(r.family + '|' + r.entity + '|' + r.market));
  // Rows the plan already holds that lost the collapse. These are removed from
  // the plan when this runs with --write, because the plan is the build list
  // and a page that would cannibalise another should not be on it.
  const supersede = collapse.givenUp.filter((r) => r.fromPlan);
  const volume = rows.reduce((t, r) => t + (best.get(r.family + '|' + r.entity + '|' + r.market)?.volume || 0), 0);
  return {
    asked: ASKED.length,
    planned: rows.length,
    monthlySearchesPlanned: volume,
    // Regions that keep exactly the same days as a region with more demand.
    collapsedOnto: collapse.givenUp.map((r) => r.entity + ' onto ' + r.onto + ' (' + r.market + ', ' + r.volume + ' a month' + (r.fromPlan ? ', was already planned' : '') + ')'),
    volumeGivenUpToCollapse: collapse.givenUp.reduce((n, r) => n + r.volume, 0),
    supersededPlanRows: supersede.map((r) => r.family + '|' + r.entity + '|' + r.market),
    notPlanned: notPlanned.map((n) => n.market + ' "' + n.keyword + '": ' + n.why),
    byMarket: rows.reduce((acc, r) => ({ ...acc, [r.market]: (acc[r.market] || 0) + 1 }), {}),
    byFamily: rows.reduce((acc, r) => ({ ...acc, [r.family]: (acc[r.family] || 0) + 1 }), {}),
    rows,
  };
}

// The pairs that already have a keyword, read from the plan rather than listed
// here, so this cannot claim a pair the plan already covers.
export function takenPairs() {
  const plan = JSON.parse(readFileSync(new URL('data/atlas/measurement-plan.json', ROOT), 'utf8'));
  return new Set(plan.rows.filter((r) => r.family === C || r.family === S).map((r) => r.family + '|' + r.entity + '|' + r.market));
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = run();
  if (process.argv.includes('--write')) {
    const byMarket = {};
    for (const a of ASKED) (byMarket[a.market] ||= []).push(a);
    for (const [market, asked] of Object.entries(byMarket)) {
      writeMeasurement(new URL('data/atlas/measurements/ahrefs-pulse-' + market + '-' + CAPTURED_ON + '.json', ROOT), {
        provider: 'Ahrefs Keywords Explorer, overview',
        endpoint: 'keywords-explorer-overview',
        capturedOn: CAPTURED_ON,
        country: COUNTRY_CODE[market],
        market,
        select: 'keyword,volume,difficulty,cpc',
        unitsPerRow: 22,
        unitsTotal: asked.length * 22,
        families: [C, S],
        note: 'Public holiday demand in this market, for the countries and regions the holiday source covers. Constructed keywords rather than discovered ones: a holiday page is about a named place in a named year and there is no head term to subtract a place out of. Every phrasing asked is here, including the ones with no demand.',
        caution: 'A null volume means the provider returned no row for that phrase. That is weaker evidence than a measured zero, and neither is treated as demand.',
        keywords: asked.filter((a) => a.volume != null).map((a) => ({
          keyword: a.keyword, volume: a.volume, difficulty: a.difficulty, cpc: a.cpc,
          family: a.family, entity: a.entity, market: a.market,
        })),
        notReturned: asked.filter((a) => a.volume == null).map((a) => a.keyword),
      }, { overwrite: process.argv.includes('--overwrite') });
    }
    const planUrl = new URL('data/atlas/measurement-plan.json', ROOT);
    const plan = JSON.parse(readFileSync(planUrl, 'utf8'));
    const drop = new Set(r.supersededPlanRows);
    const before = plan.rows.length;
    plan.rows = plan.rows.filter((x) => !drop.has(x.family + '|' + x.entity + '|' + x.market));
    const have = new Set(plan.rows.map((x) => x.family + '|' + x.entity + '|' + x.market));
    const added = r.rows.filter((x) => !have.has(x.family + '|' + x.entity + '|' + x.market));
    plan.rows.push(...added);
    writeFileSync(planUrl, JSON.stringify(plan, null, 1) + '\n');
    console.error('plan rows removed by the collapse: ' + (before - (plan.rows.length - added.length)));
    console.error('new plan rows: ' + added.length);
  }
  const { rows, ...summary } = r;
  console.log(JSON.stringify(summary, null, 1));
}
