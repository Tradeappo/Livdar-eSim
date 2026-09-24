// The Sport surface, measured for the first time.
//
//   node scripts/atlas/measure-sport.mjs            report only
//   node scripts/atlas/measure-sport.mjs --write    write the file and the plan
//
// Sport had two families, both of which need the route extract, and every host
// that serves one is refused by this environment's egress policy. So the
// surface carried nothing at all, and the brief is explicit that a surface with
// no page cannot be part of an experiment about which surface earns the
// strongest signal.
//
// What exists is the climate normals: fifty five cities, twenty years, monthly
// mean temperature, rain, humidity and wind. That answers when an activity is
// comfortable and not where to do it, and the keywords say that when is a real
// question rather than a substitute for one: `trekking vicino milano` is three
// hundred and fifty a month at difficulty zero and `東京 ハイキング` is five
// hundred, both against pages that are mostly route lists with no season in
// them at all.
//
// Two keywords with demand were refused on intent rather than on volume, and
// they are the ones worth reading first. `natation paris` and `zwemmen in
// amsterdam` both carry a hundred and fifty searches a month, and in both
// cities no month reaches the air temperature this page uses for outdoor
// swimming: what those readers want is an indoor pool, which is a facility and
// not a season. Answering them with a climate table would be answering a
// different question loudly.

import { readFileSync, writeFileSync } from 'node:fs';
import { writeMeasurement } from './measurement-file.mjs';
import { rootFrom } from '../../lib/atlas/repo-root.js';
import { MARKET_LANG, MARKET_COUNTRY } from '../../lib/atlas/keyword-country.js';

const ROOT = rootFrom(import.meta.url);
export const CAPTURED_ON = '2026-09-25';
const FAMILY = 'sport.city-season';

// The cities, by the id the climate source holds them under.
const CITY = {
  tokyo: '1850147', osaka: '1853909', sapporo: '2128295', amsterdam: '2759794',
  paris: '2988507', nice: '2990440', lyon: '2996944', madrid: '3117735',
  barcelona: '3128760', rome: '3169070', milan: '3173435', miami: '4164138',
  newYork: '5128581', sanFrancisco: '5391959',
};

export const ASKED = [
  // English. The hiking keyword is the strongest and the swimming one is the
  // only swimming page in the set, because Miami is the only city measured here
  // whose air stays inside the band all year.
  { city: CITY.sanFrancisco, activity: 'hiking', market: 'en-US', keyword: 'hiking near san francisco', volume: 200, difficulty: 5, cpc: 2, plan: true },
  { city: CITY.miami, activity: 'swimming', market: 'en-US', keyword: 'swimming in miami', volume: 90, difficulty: 36, cpc: 25, plan: true },
  { city: CITY.newYork, activity: 'running', market: 'en-US', keyword: 'running in new york', volume: 80, difficulty: 1, cpc: null, plan: true },
  { city: CITY.sanFrancisco, activity: 'running', market: 'en-US', keyword: 'running in san francisco', volume: 40, difficulty: 0, cpc: 70, plan: true },
  { city: CITY.miami, activity: 'running', market: 'en-US', keyword: 'running in miami', volume: 40, difficulty: 0, cpc: 70, plan: true },
  { city: CITY.newYork, activity: 'cycling', market: 'en-US', keyword: 'cycling in new york', volume: 20, difficulty: 21, cpc: 50, plan: true },
  { city: CITY.newYork, activity: 'hiking', market: 'en-US', keyword: 'hiking near new york', volume: 10, difficulty: 11, cpc: 4, plan: true },

  // Spanish. Hiking carries this market and the head term is the activity
  // followed by the city with no preposition, which is how it was measured.
  { city: CITY.barcelona, activity: 'hiking', market: 'es-ES', keyword: 'senderismo barcelona', volume: 450, difficulty: 0, cpc: 6, plan: true },
  { city: CITY.madrid, activity: 'hiking', market: 'es-ES', keyword: 'rutas de senderismo madrid', volume: 250, difficulty: 2, cpc: 2, plan: true },
  { city: CITY.madrid, activity: 'running', market: 'es-ES', keyword: 'correr en madrid', volume: 30, difficulty: 0, cpc: 35, plan: true },
  { city: CITY.barcelona, activity: 'running', market: 'es-ES', keyword: 'correr en barcelona', volume: 20, difficulty: 62, cpc: null, plan: true },
  { city: CITY.barcelona, activity: 'cycling', market: 'es-ES', keyword: 'ciclismo en barcelona', volume: 0, difficulty: null, cpc: null, plan: false, why: 'no measured demand' },
  { city: CITY.barcelona, activity: 'swimming', market: 'es-ES', keyword: 'nadar en barcelona', volume: 0, difficulty: null, cpc: null, plan: false, why: 'no measured demand' },

  // French. Two cities and three activities, and the swimming keyword refused.
  { city: CITY.nice, activity: 'hiking', market: 'fr-FR', keyword: 'randonnee nice', volume: 150, difficulty: 31, cpc: 15, plan: true },
  { city: CITY.paris, activity: 'cycling', market: 'fr-FR', keyword: 'velo a paris', volume: 100, difficulty: 45, cpc: 45, plan: true },
  { city: CITY.paris, activity: 'running', market: 'fr-FR', keyword: 'courir a paris', volume: 90, difficulty: 65, cpc: 3, plan: true },
  { city: CITY.lyon, activity: 'running', market: 'fr-FR', keyword: 'courir a lyon', volume: 80, difficulty: 0, cpc: 2, plan: true },
  { city: CITY.lyon, activity: 'hiking', market: 'fr-FR', keyword: 'randonnee pres de lyon', volume: 50, difficulty: 0, cpc: 15, plan: true },
  { city: CITY.paris, activity: 'swimming', market: 'fr-FR', keyword: 'natation paris', volume: 150, difficulty: 8, cpc: 50, plan: false, why: 'refused on intent: no month in Paris reaches the outdoor band, so this is a search for an indoor pool' },

  // Italian. Hiking again, under two different words, each measured in the city
  // the market uses it for.
  { city: CITY.milan, activity: 'hiking', market: 'it-IT', keyword: 'trekking vicino milano', volume: 350, difficulty: 0, cpc: 5, plan: true },
  { city: CITY.rome, activity: 'hiking', market: 'it-IT', keyword: 'escursioni vicino roma', volume: 200, difficulty: 0, cpc: 25, plan: true },
  { city: CITY.milan, activity: 'running', market: 'it-IT', keyword: 'correre a milano', volume: 50, difficulty: 0, cpc: null, plan: true },
  { city: CITY.milan, activity: 'cycling', market: 'it-IT', keyword: 'bici a milano', volume: 30, difficulty: 7, cpc: 10, plan: true },
  { city: CITY.rome, activity: 'running', market: 'it-IT', keyword: 'correre a roma', volume: 30, difficulty: 0, cpc: null, plan: true },
  { city: CITY.rome, activity: 'swimming', market: 'it-IT', keyword: 'nuotare a roma', volume: 0, difficulty: null, cpc: null, plan: false, why: 'no measured demand' },

  // Dutch. One city, three activities planned and the swimming one refused for
  // the same reason as the French.
  { city: CITY.amsterdam, activity: 'hiking', market: 'nl-NL', keyword: 'wandelen in amsterdam', volume: 150, difficulty: 2, cpc: 15, plan: true },
  { city: CITY.amsterdam, activity: 'cycling', market: 'nl-NL', keyword: 'fietsen in amsterdam', volume: 100, difficulty: 6, cpc: 35, plan: true },
  { city: CITY.amsterdam, activity: 'running', market: 'nl-NL', keyword: 'hardlopen in amsterdam', volume: 10, difficulty: 1, cpc: 90, plan: true },
  { city: CITY.amsterdam, activity: 'swimming', market: 'nl-NL', keyword: 'zwemmen in amsterdam', volume: 150, difficulty: 4, cpc: 30, plan: false, why: 'refused on intent: no month in Amsterdam reaches the outdoor band, so this is a search for an indoor pool' },

  // Japanese. Three cities, and the largest single number in the surface.
  { city: CITY.tokyo, activity: 'hiking', market: 'ja-JP', keyword: '東京 ハイキング', volume: 500, difficulty: 0, cpc: 1, plan: true },
  { city: CITY.tokyo, activity: 'cycling', market: 'ja-JP', keyword: '東京 サイクリング', volume: 400, difficulty: 0, cpc: 4, plan: true },
  { city: CITY.tokyo, activity: 'running', market: 'ja-JP', keyword: '東京 ランニング', volume: 70, difficulty: 0, cpc: 4, plan: true },
  { city: CITY.osaka, activity: 'running', market: 'ja-JP', keyword: '大阪 ランニング', volume: 60, difficulty: null, cpc: null, plan: true },
  { city: CITY.sapporo, activity: 'hiking', market: 'ja-JP', keyword: '札幌 ハイキング', volume: 60, difficulty: 0, cpc: null, plan: true },
  { city: CITY.tokyo, activity: 'swimming', market: 'ja-JP', keyword: '沖縄 シュノーケリング', volume: 2500, difficulty: 44, cpc: 15, plan: false, why: 'refused: snorkelling is decided by water clarity and sea temperature and this source holds neither, and the city in the keyword is Naha rather than Tokyo' },
];

const COUNTRY_CODE = { 'en-US': 'us', 'de-DE': 'de', 'fr-FR': 'fr', 'es-ES': 'es', 'it-IT': 'it', 'pt-BR': 'br', 'nl-NL': 'nl', 'pl-PL': 'pl', 'ja-JP': 'jp' };

export function run() {
  const rows = [];
  const refused = [];
  for (const a of ASKED) {
    if (!a.plan || !(a.volume > 0)) { refused.push(a.market + ' "' + a.keyword + '" (' + a.volume + '): ' + (a.why || 'no measured demand')); continue; }
    rows.push({
      q: a.keyword, family: FAMILY, vertical: 'sport', priority: 'high',
      entity: a.city + ':' + a.activity, market: a.market,
      language: MARKET_LANG[a.market], country: MARKET_COUNTRY[a.market],
      measuredOn: CAPTURED_ON,
    });
  }
  const volume = ASKED.filter((a) => a.plan && a.volume > 0).reduce((t, a) => t + a.volume, 0);
  return {
    asked: ASKED.length,
    planned: rows.length,
    monthlySearchesPlanned: volume,
    notPlanned: refused,
    byMarket: rows.reduce((acc, r) => ({ ...acc, [r.market]: (acc[r.market] || 0) + 1 }), {}),
    byActivity: ASKED.filter((a) => a.plan).reduce((acc, a) => ({ ...acc, [a.activity]: (acc[a.activity] || 0) + 1 }), {}),
    rows,
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = run();
  if (process.argv.includes('--write')) {
    const byMarket = {};
    for (const a of ASKED) (byMarket[a.market] ||= []).push(a);
    for (const [market, asked] of Object.entries(byMarket)) {
      writeMeasurement(new URL('data/atlas/measurements/ahrefs-sport-' + market + '-' + CAPTURED_ON + '.json', ROOT), {
        provider: 'Ahrefs Keywords Explorer, overview',
        endpoint: 'keywords-explorer-overview',
        capturedOn: CAPTURED_ON,
        country: COUNTRY_CODE[market],
        market,
        select: 'keyword,volume,difficulty,cpc',
        unitsPerRow: 22,
        unitsTotal: asked.length * 22,
        families: [FAMILY],
        note: 'City and activity demand for the Sport surface, asked only for the cities the climate normals cover. The phrasing is the market own: the Spanish market puts the activity before the city with no preposition, the Italian market asks for what is near the city rather than in it, and the Japanese market puts the city first.',
        caution: 'Three keywords with real demand were not planned because the page this source can build would answer a different question: outdoor swimming in a city whose air never reaches the band is an indoor pool search, and snorkelling is decided by the sea.',
        keywords: asked.filter((a) => a.volume != null).map((a) => ({
          keyword: a.keyword, volume: a.volume, difficulty: a.difficulty, cpc: a.cpc,
          family: FAMILY, entity: a.city + ':' + a.activity, market: a.market,
          ...(a.plan ? {} : { notPlanned: a.why || 'no measured demand' }),
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
