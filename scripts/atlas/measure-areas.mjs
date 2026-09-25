// Turning measured district phrasings into measurable Areas pages.
//
//   node scripts/atlas/measure-areas.mjs            report only
//   node scripts/atlas/measure-areas.mjs --write    write plan and files
//
// Areas is the surface the product is named for and it had no pages at all,
// because it had no source. It has one now, and this is the demand side of it.
//
// The resolution is by subtraction, as it is for every other family here, with
// one difference that matters: a country has a CLDR name in every language and
// a city does not. There is no table anywhere that says a Pole writes Wroclaw
// as `wroclawia` in this construction, or that an Italian calls Naples
// `napoli` and a Spaniard calls New York `nueva york`. So the table below is
// written from what the markets actually returned, which is the only honest
// source for it, and a remainder that is not in it is refused rather than
// guessed at.
//
// What gets refused is most of the probe, and deliberately:
//
//   A city the source has no districts for. `dzielnice warszawy` is seventeen
//   thousand a month and Warsaw has exactly one district in the entity store,
//   so there is no page to publish against it. That gap is the finding, not a
//   bug, and it is reported rather than filled.
//
//   A different question about the same city. `peores barrios de madrid`,
//   `mejores bairros de sao paulo` and `marseille quartiers a eviter` ask
//   which district is worst or best. Answering would need rent, crime or noise
//   data and this programme has none, so the leftover keeps the qualifier, no
//   city matches it, and the row is refused.
//
//   A map rather than a list. `berlin stadtteile karte` and `barrios de madrid
//   mapa` want a picture. The same mechanism refuses them.

import { readFileSync, writeFileSync } from 'node:fs';
import { writeMeasurement } from './measurement-file.mjs';
import { rootFrom } from '../../lib/atlas/repo-root.js';
import { fold, stripHead, MARKET_LANG, MARKET_COUNTRY } from '../../lib/atlas/keyword-country.js';
import { store as hoodStore } from '../../lib/atlas/neighbourhoods.js';

const ROOT = rootFrom(import.meta.url);
export const FAMILY = 'neighbourhoods.city-where-to-stay';
export const VERTICAL = 'neighbourhoods';
export const PROBE = 'data/atlas/probes/areas-2026-09-24.json';

// Both word orders where the market uses both. German and Dutch and Polish and
// Italian put the city on either side and the two are different keywords with
// different volumes, so both are stripped and the stronger one wins the page.
export const HEADS = {
  'en-US': ['where to stay in'],
  'de-DE': ['stadtteile'],
  'fr-FR': ['quartiers de', 'quartiers'],
  'es-ES': ['barrios de'],
  'it-IT': ['quartieri di', 'quartieri'],
  'pt-BR': ['bairros de'],
  'nl-NL': ['wijken in', 'wijken van', 'wijken'],
  'pl-PL': ['dzielnice w', 'dzielnice'],
  'ja-JP': ['どこに泊まる', 'エリアガイド'],
};

// Articles and prepositions only. A qualifier that changes the question is not
// here on purpose: `peores`, `mejores`, `melhores`, `leukste`, `niebezpieczne`
// and `karte` all survive into the remainder and take the row out with them.
export const FILLERS = {
  'en-US': ['the', 'in'],
  'de-DE': ['in', 'von', 'der', 'die', 'das'],
  'fr-FR': ['de', 'du', 'des', 'les', 'le', 'la'],
  'es-ES': ['de', 'del', 'la', 'el', 'los', 'las', 'en'],
  'it-IT': ['di', 'del', 'della', 'a', 'il', 'la', 'le', 'i'],
  'pt-BR': ['de', 'do', 'da', 'em', 'no', 'na'],
  'nl-NL': ['in', 'van', 'de', 'het'],
  'pl-PL': ['w', 'we'],
  'ja-JP': [],
};

// How each market writes each city in this construction, read off the probe
// rather than derived. Polish is in the genitive because that is the only form
// that appears after `dzielnice`.
//
// Cities the source has no districts for are in the table too, and on purpose.
// Leaving them out would make them indistinguishable from a keyword that is
// not a city at all, and the difference matters: `dzielnice warszawy` is
// seventeen thousand searches a month against a city with one district in the
// entity store. That is a coverage gap to report, not noise to drop.
export const CITY_NAMES = {
  'en-US': { rome: 3169070, milan: 3173435, lisbon: 2267057, tokyo: 1850147, paris: 2988507, london: 2643743, amsterdam: 2759794, barcelona: 3128760, chicago: 4887398, madrid: 3117735, montreal: 6077243, bangkok: 1609350, 'new york': 5128581, nyc: 5128581, singapore: 1880252, vienna: 2761369, prague: 3067696, berlin: 2950159, zurich: 2657896, stockholm: 2673730, budapest: 3054643, hamburg: 2911298, toronto: 6167865, vancouver: 6173331, melbourne: 2158177, philadelphia: 4560349, honolulu: 5856195, havana: 3553478, 'sao paulo': 3448439, shanghai: 1796236, kyiv: 703448, turin: 3165524, naples: 3172394, graz: 2778067, vilnius: 593116, doha: 290030, marseille: 2995469, lyon: 2996944, cologne: 2886242 },
  'de-DE': { 'munchen': 2867714, frankfurt: 2925533, berlin: 2950159, hamburg: 2911298, 'koln': 2886242, london: 2643743, 'new york': 5128581, paris: 2988507, wien: 2761369, prag: 3067696, amsterdam: 2759794, barcelona: 3128760, madrid: 3117735, budapest: 3054643, tokio: 1850147, stockholm: 2673730, 'zurich': 2657896, toronto: 6167865, chicago: 4887398 },
  'fr-FR': { rome: 3169070, 'new york': 5128581, londres: 2643743, barcelone: 3128760, paris: 2988507, lyon: 2996944, tokyo: 1850147, marseille: 2995469, madrid: 3117735, amsterdam: 2759794, berlin: 2950159, vienne: 2761369, prague: 3067696, budapest: 3054643, naples: 3172394, turin: 3165524, montreal: 6077243, bangkok: 1609350 },
  'es-ES': { sevilla: 2510911, valencia: 2509954, roma: 3169070, lisboa: 2267057, madrid: 3117735, barcelona: 3128760, 'nueva york': 5128581, 'new york': 5128581, londres: 2643743, paris: 2988507, tokio: 1850147, amsterdam: 2759794, berlin: 2950159, viena: 2761369, praga: 3067696, budapest: 3054643, 'napoles': 3172394, 'turin': 3165524, estocolmo: 2673730, bangkok: 1609350, 'la habana': 3553478, 'sao paulo': 3448439 },
  'it-IT': { roma: 3169070, milano: 3173435, firenze: 3176959, palermo: 2523920, bologna: 3181928, lisbona: 2267057, napoli: 3172394, 'new york': 5128581, torino: 3165524, parigi: 2988507, londra: 2643743, tokyo: 1850147, madrid: 3117735, barcellona: 3128760, amsterdam: 2759794, berlino: 2950159, vienna: 2761369, praga: 3067696, budapest: 3054643, stoccolma: 2673730, bangkok: 1609350, 'l’avana': 3553478 },
  'pt-BR': { curitiba: 3464975, salvador: 3450554, fortaleza: 3399415, 'sao paulo': 3448439, 'nova york': 5128581, londres: 2643743, paris: 2988507, madrid: 3117735, barcelona: 3128760, amsterdam: 2759794, berlim: 2950159, viena: 2761369, praga: 3067696, toquio: 1850147, bangkok: 1609350, havana: 3553478 },
  'nl-NL': { rotterdam: 2747891, lissabon: 2267057, amsterdam: 2759794, londen: 2643743, parijs: 2988507, 'new york': 5128581, barcelona: 3128760, berlijn: 2950159, madrid: 3117735, wenen: 2761369, praag: 3067696, boedapest: 3054643, tokio: 1850147, stockholm: 2673730, hamburg: 2911298 },
  'pl-PL': { 'warszawy': 756135, 'warszawie': 756135, 'krakowa': 3094802, 'poznania': 3088171, 'lodzi': 3093133, 'rzymu': 3169070, 'wroclawia': 3081368, 'gdanska': 3099434, 'nowego jorku': 5128581, 'paryza': 2988507, 'londynu': 2643743, 'berlina': 2950159, 'wiednia': 2761369, 'pragi': 3067696, 'budapesztu': 3054643, 'amsterdamu': 2759794, 'barcelony': 3128760, 'madrytu': 3117735, 'tokio': 1850147 },
  'ja-JP': {},
};

const YEAR = /\b(19|20)\d{2}\b/g;

export function cityOf(keyword, market, covered) {
  const table = CITY_NAMES[market];
  if (!table) return { reason: 'unknown market' };
  const hit = stripHead(fold(String(keyword).replace(YEAR, ' ')), HEADS[market] || []);
  if (!hit) return { reason: 'no head term' };
  let rest = hit.rest;
  const stop = new Set((FILLERS[market] || []).map(fold));
  rest = rest.split(/\s+/).filter((t) => t && !stop.has(t)).join(' ').trim();
  if (!rest) return { reason: 'head term alone, no city' };
  const id = table[rest];
  if (id == null) return { reason: 'not a city this market names here: ' + rest };
  return covered.has(String(id)) ? { cityId: id, how: 'market name table' } : { reason: 'no district data for city ' + id };
}

export function run({ probe = PROBE } = {}) {
  const covered = new Set(Object.keys(hoodStore().store || {}));
  const j = JSON.parse(readFileSync(new URL(probe, ROOT), 'utf8'));
  const files = {};
  const rows = [];
  const skipped = { notACity: 0, noDistrictData: 0, zeroVolume: 0, duplicate: 0 };
  const wanted = new Map();

  for (const [market, block] of Object.entries(j.markets || {})) {
    const kept = [];
    for (const r of block.rows || []) {
      const c = cityOf(r.keyword, market, covered);
      if (!c.cityId) {
        if ((c.reason || '').startsWith('no district data')) {
          skipped.noDistrictData++;
          // What the market asked for and the source could not answer. This is
          // the gap worth reporting, so it is counted by keyword rather than
          // thrown away.
          wanted.set(r.keyword, (wanted.get(r.keyword) || 0) + r.volume);
        } else skipped.notACity++;
        continue;
      }
      if (!(r.volume > 0)) { skipped.zeroVolume++; continue; }
      const prev = kept.find((k) => k.cityId === c.cityId);
      if (prev) {
        skipped.duplicate++;
        const better = r.volume > prev.volume || (r.volume === prev.volume && r.keyword.length < prev.keyword.length);
        if (better) { prev.keyword = r.keyword; prev.volume = r.volume; prev.difficulty = r.difficulty ?? null; }
        continue;
      }
      kept.push({ keyword: r.keyword, volume: r.volume, difficulty: r.difficulty ?? null, cityId: c.cityId });
    }
    if (!kept.length) continue;
    files[market] = {
      country: block.country,
      select: 'keyword,volume,difficulty',
      unitsPerRow: j.unitsPerRow ?? 21,
      unitsTotal: (block.rows || []).length * (j.unitsPerRow ?? 21),
      family: FAMILY,
      market,
      note: 'Discovered from the market head term for city districts and resolved to a city by subtraction against the names that market actually used. A remainder that is not one of those names is refused, which is what keeps a map request, a best and worst question and a city with no district data out.',
      keywords: kept.map(({ cityId, ...k }) => k),
    };
    for (const k of kept) {
      rows.push({
        q: k.keyword, family: FAMILY, vertical: VERTICAL, priority: 'high',
        entity: k.cityId, market, language: MARKET_LANG[market], country: MARKET_COUNTRY[market],
        measuredOn: j.capturedOn || '2026-09-24',
      });
    }
  }

  return {
    family: FAMILY,
    probe,
    pairs: rows.length,
    byMarket: Object.fromEntries(Object.entries(files).map(([m, f]) => [m, f.keywords.length])),
    cities: new Set(rows.map((r) => r.entity)).size,
    skipped,
    // The demand the source cannot serve, largest first. Warsaw alone is
    // seventeen thousand a month.
    unservedDemand: [...wanted.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([k, v]) => k + ': ' + v),
    totalVolume: Object.values(files).flatMap((f) => f.keywords).reduce((t, k) => t + k.volume, 0),
    files,
    rows,
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = run();
  if (process.argv.includes('--write')) {
    for (const [market, f] of Object.entries(r.files)) {
      writeMeasurement(new URL('data/atlas/measurements/ahrefs-areas-' + market + '-2026-09-24.json', ROOT), f, { overwrite: process.argv.includes('--overwrite') });
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
