// Turning measured best time phrasings into measurable pages.
//
//   node scripts/atlas/measure-best-time.mjs            report only
//   node scripts/atlas/measure-best-time.mjs --write    write plan and files
//
// The probe this reads asked each market for the phrase its own speakers use
// rather than a translation of the English one, because the word order and the
// grammar differ in ways that change the answer. German compounds and accepts
// both orders, and the two are not the same keyword: `beste reisezeit thailand`
// is 8,800 a month at difficulty 1 while `thailand beste reisezeit` is 7,300 at
// difficulty 42. French and Italian and Spanish and Portuguese use a
// prepositional phrase whose preposition depends on the country. Polish
// inflects the country itself, so the string that appears is `tajlandii` and
// never `tajlandia`. Japanese puts the destination first with no particle.
//
// The country is resolved by subtraction rather than by search, and that is the
// part worth explaining. Searching for a country name inside a keyword accepts
// `best time to visit mexico city`, which is a city page wearing a country
// name. So the market's head term is removed, the leftover articles and
// prepositions are removed, and what remains has to be a country name exactly.
// `mexico city` leaves `mexico city`, which is not a country and is refused.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const ROOT = new URL('../../', import.meta.url);
export const FAMILY = 'weather.country-best-time';
export const VERTICAL = 'weather';

// Only the countries the climate source actually covers. A measured keyword for
// a country with no cities in the store is demand we cannot answer, and
// recording it as a measurement would make the page look eligible when the data
// behind it does not exist.
export function climateCountries() {
  const u = new URL('data/atlas/sources/climate/normals.json', ROOT);
  if (!existsSync(u)) return new Set();
  const s = JSON.parse(readFileSync(u, 'utf8'));
  return new Set(Object.values(s.cities || {}).map((c) => c.iso2).filter(Boolean));
}

// The head term each market was asked with, removed before the country is read.
export const HEADS = {
  'en-US': ['best time to visit', 'best time to go to', 'best time to travel to', 'when is the best time to visit'],
  'de-DE': ['beste reisezeit'],
  'fr-FR': ['quand partir'],
  'it-IT': ['quando andare'],
  'es-ES': ['mejor epoca para viajar', 'cual es la mejor epoca para viajar', 'cuando es la mejor epoca para viajar'],
  'pt-BR': ['melhor epoca para viajar', 'qual a melhor epoca para viajar', 'qual melhor epoca para viajar'],
  'nl-NL': ['beste reistijd'],
  'pl-PL': ['kiedy jechac do'],
  'ja-JP': ['ベストシーズン'],
};

// What may sit between the head term and the country without changing which
// country it is. Everything here is an article or a preposition; nothing here
// is a word that could narrow a country to a place inside it.
export const FILLERS = {
  'en-US': ['the', 'to', 'in', 'is', 'when'],
  'de-DE': ['in', 'im', 'die', 'der', 'das'],
  'fr-FR': ['en', 'au', 'aux', 'a', 'la', 'le', 'les', "l'", 'du', 'de', 'des'],
  'it-IT': ['in', 'a', 'al', 'ai', 'alle', 'agli', 'nelle', 'nel', 'il', 'la', 'le', 'lo'],
  'es-ES': ['a', 'al', 'el', 'la', 'los', 'las', 'para', 'en'],
  'pt-BR': ['para', 'o', 'a', 'os', 'as', 'ao', 'aos', 'no', 'na', 'em'],
  'nl-NL': ['naar', 'de', 'het'],
  'pl-PL': ['do', 'w'],
  'ja-JP': [],
};

// Country names as each market writes them, including the inflected form that
// actually appears. Polish is listed in the genitive because that is the form
// that follows `do`, and the nominative never appears in these keywords.
export const NAMES = {
  'en-US': { GR: ['greece'], AE: ['united arab emirates', 'uae'], TR: ['turkey', 'turkiye'], TH: ['thailand'], VN: ['vietnam'], ID: ['indonesia'], JP: ['japan'], PT: ['portugal'], ES: ['spain'], IT: ['italy'], MA: ['morocco'], GB: ['united kingdom', 'britain', 'great britain'], CH: ['switzerland'], NL: ['netherlands'], FR: ['france'], CZ: ['czech republic', 'czechia'], NO: ['norway'], HR: ['croatia'], IS: ['iceland'], MX: ['mexico'], CR: ['costa rica'], PE: ['peru'], US: ['united states', 'usa'] },
  'de-DE': { GR: ['griechenland'], AE: ['vereinigte arabische emirate'], TR: ['turkei'], TH: ['thailand'], VN: ['vietnam'], ID: ['indonesien'], JP: ['japan'], PT: ['portugal'], ES: ['spanien'], IT: ['italien'], MA: ['marokko'], GB: ['grossbritannien', 'vereinigtes konigreich'], CH: ['schweiz'], NL: ['niederlande'], FR: ['frankreich'], CZ: ['tschechien'], NO: ['norwegen'], HR: ['kroatien'], IS: ['island'], MX: ['mexiko'], CR: ['costa rica'], PE: ['peru'], US: ['usa'] },
  'fr-FR': { GR: ['grece'], AE: ['emirats arabes unis', 'emirats'], TR: ['turquie'], TH: ['thailande'], VN: ['vietnam'], ID: ['indonesie'], JP: ['japon'], PT: ['portugal'], ES: ['espagne'], IT: ['italie'], MA: ['maroc'], GB: ['royaume-uni', 'royaume uni'], CH: ['suisse'], NL: ['pays-bas', 'pays bas'], FR: ['france'], CZ: ['tchequie', 'republique tcheque'], NO: ['norvege'], HR: ['croatie'], IS: ['islande'], MX: ['mexique'], CR: ['costa rica'], PE: ['perou'], US: ['etats-unis', 'etats unis'] },
  'it-IT': { GR: ['grecia'], AE: ['emirati arabi uniti', 'emirati arabi'], TR: ['turchia'], TH: ['thailandia'], VN: ['vietnam'], ID: ['indonesia'], JP: ['giappone'], PT: ['portogallo'], ES: ['spagna'], IT: ['italia'], MA: ['marocco'], GB: ['regno unito'], CH: ['svizzera'], NL: ['paesi bassi'], FR: ['francia'], CZ: ['repubblica ceca'], NO: ['norvegia'], HR: ['croazia'], IS: ['islanda'], MX: ['messico'], CR: ['costa rica'], PE: ['peru'], US: ['stati uniti'] },
  'es-ES': { GR: ['grecia'], AE: ['emiratos arabes unidos', 'emiratos'], TR: ['turquia'], TH: ['tailandia'], VN: ['vietnam'], ID: ['indonesia'], JP: ['japon'], PT: ['portugal'], ES: ['espana'], IT: ['italia'], MA: ['marruecos'], GB: ['reino unido'], CH: ['suiza'], NL: ['paises bajos'], FR: ['francia'], CZ: ['republica checa'], NO: ['noruega'], HR: ['croacia'], IS: ['islandia'], MX: ['mexico'], CR: ['costa rica'], PE: ['peru'], US: ['estados unidos'] },
  'pt-BR': { GR: ['grecia'], AE: ['emirados arabes unidos'], TR: ['turquia'], TH: ['tailandia'], VN: ['vietna'], ID: ['indonesia'], JP: ['japao'], PT: ['portugal'], ES: ['espanha'], IT: ['italia'], MA: ['marrocos'], GB: ['reino unido'], CH: ['suica'], NL: ['paises baixos'], FR: ['franca'], CZ: ['republica checa'], NO: ['noruega'], HR: ['croacia'], IS: ['islandia'], MX: ['mexico'], CR: ['costa rica'], PE: ['peru'], US: ['estados unidos'] },
  'nl-NL': { GR: ['griekenland'], AE: ['verenigde arabische emiraten'], TR: ['turkije'], TH: ['thailand'], VN: ['vietnam'], ID: ['indonesie'], JP: ['japan'], PT: ['portugal'], ES: ['spanje'], IT: ['italie'], MA: ['marokko'], GB: ['verenigd koninkrijk'], CH: ['zwitserland'], NL: ['nederland'], FR: ['frankrijk'], CZ: ['tsjechie'], NO: ['noorwegen'], HR: ['kroatie'], IS: ['ijsland'], MX: ['mexico'], CR: ['costa rica'], PE: ['peru'], US: ['verenigde staten'] },
  'pl-PL': { GR: ['grecji'], AE: ['zjednoczonych emiratow arabskich'], TR: ['turcji'], TH: ['tajlandii'], VN: ['wietnamu'], ID: ['indonezji'], JP: ['japonii'], PT: ['portugalii'], ES: ['hiszpanii'], IT: ['wloch'], MA: ['maroka'], GB: ['wielkiej brytanii'], CH: ['szwajcarii'], NL: ['holandii'], FR: ['francji'], CZ: ['czech'], NO: ['norwegii'], HR: ['chorwacji'], IS: ['islandii'], MX: ['meksyku'], CR: ['kostaryki'], PE: ['peru'], US: ['usa'] },
  'ja-JP': { GR: ['ギリシャ'], AE: ['アラブ首長国連邦'], TR: ['トルコ'], TH: ['タイ'], VN: ['ベトナム'], ID: ['インドネシア'], JP: ['日本'], PT: ['ポルトガル'], ES: ['スペイン'], IT: ['イタリア'], MA: ['モロッコ'], GB: ['イギリス'], CH: ['スイス'], NL: ['オランダ'], FR: ['フランス'], CZ: ['チェコ'], NO: ['ノルウェー'], HR: ['クロアチア'], IS: ['アイスランド'], MX: ['メキシコ'], CR: ['コスタリカ'], PE: ['ペルー'], US: ['アメリカ'] },
};

export const MARKET_COUNTRY = { 'en-US': 'us', 'de-DE': 'de', 'fr-FR': 'fr', 'it-IT': 'it', 'es-ES': 'es', 'pt-BR': 'br', 'nl-NL': 'nl', 'pl-PL': 'pl', 'ja-JP': 'jp' };
export const MARKET_LANG = { 'en-US': 'en', 'de-DE': 'de', 'fr-FR': 'fr', 'it-IT': 'it', 'es-ES': 'es', 'pt-BR': 'pt', 'nl-NL': 'nl', 'pl-PL': 'pl', 'ja-JP': 'ja' };

// Diacritics are stripped for comparison only. The keyword itself is stored
// exactly as the provider returned it, because the join back onto a future
// measurement is an exact string match and a stripped accent would fail it
// silently.
export const fold = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/ß/g, 'ss').toLowerCase().trim();

// The subtraction. Returns the iso2 the keyword is about, or the reason it is
// not about exactly one country.
export function countryOf(keyword, market) {
  const heads = (HEADS[market] || []).slice().sort((a, b) => b.length - a.length);
  let rest = fold(keyword);
  const head = heads.find((h) => rest.includes(fold(h)));
  if (!head) return { reason: 'no head term' };
  rest = rest.replace(fold(head), ' ');
  const fillers = new Set((FILLERS[market] || []).map(fold));
  rest = rest.split(/\s+/).filter((t) => t && !fillers.has(t)).join(' ').trim();
  if (!rest) return { reason: 'head term alone, no destination' };
  const table = NAMES[market] || {};
  for (const [iso2, names] of Object.entries(table)) {
    if (names.some((n) => fold(n) === rest)) return { iso2 };
  }
  return { reason: 'not a country: ' + rest };
}

export function run({ probe = 'data/atlas/probes/best-time-2026-09-24.json' } = {}) {
  const j = JSON.parse(readFileSync(new URL(probe, ROOT), 'utf8'));
  const covered = climateCountries();
  const files = {};
  const rows = [];
  const skipped = { notACountry: 0, noClimate: 0, zeroVolume: 0, duplicate: 0 };
  const noClimate = new Set();

  for (const [market, block] of Object.entries(j.markets || {})) {
    const kept = [];
    const seen = new Set();
    for (const r of block.rows || []) {
      const c = countryOf(r.keyword, market);
      if (!c.iso2) { skipped.notACountry++; continue; }
      if (!covered.has(c.iso2)) { skipped.noClimate++; noClimate.add(c.iso2); continue; }
      if (!(r.volume > 0)) { skipped.zeroVolume++; continue; }
      // Both German word orders are real keywords and both are kept, but a
      // page is one page, so the plan carries the stronger of the two.
      const prev = kept.find((k) => k.iso2 === c.iso2);
      if (prev) {
        skipped.duplicate++;
        if (r.volume > prev.volume) { prev.keyword = r.keyword; prev.volume = r.volume; prev.difficulty = r.difficulty ?? null; }
        continue;
      }
      if (seen.has(r.keyword)) continue;
      seen.add(r.keyword);
      kept.push({ keyword: r.keyword, volume: r.volume, difficulty: r.difficulty ?? null, iso2: c.iso2 });
    }
    if (!kept.length) continue;
    files[market] = {
      country: block.country,
      select: 'keyword,volume,difficulty',
      unitsPerRow: 21,
      unitsTotal: (block.rows || []).length * 21,
      family: FAMILY,
      market,
      note: 'Phrase match on the head term this market actually uses, then the country resolved by removing that head term and the articles around it. A keyword whose remainder is not exactly a country name is refused, which is what keeps a city page out of a country family.',
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

  const byMarket = Object.fromEntries(Object.entries(files).map(([m, f]) => [m, f.keywords.length]));
  const entities = new Set(rows.map((r) => r.entity));
  return {
    family: FAMILY,
    probe,
    pages: rows.length,
    byMarket,
    entities: entities.size,
    countriesWithClimateButNoDemand: [...covered].filter((c) => !entities.has(c)).sort(),
    demandWithoutClimate: [...noClimate].sort(),
    // `notACountry` counts two different things on purpose, because separating
    // them would imply a precision this does not have: a keyword about a city,
    // a region or a landmark, and a keyword about a country that is simply not
    // in the table above. The table holds only the countries the climate source
    // covers, so a Maldives or Sri Lanka keyword lands here rather than in
    // `demandWithoutClimate`, which counts only countries that were resolved
    // and then found to have no measured cities.
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
      writeFileSync(new URL('data/atlas/measurements/ahrefs-best-time-' + market + '-2026-09-24.json', ROOT), JSON.stringify(f, null, 1) + '\n');
    }
    const planUrl = new URL('data/atlas/measurement-plan.json', ROOT);
    const plan = JSON.parse(readFileSync(planUrl, 'utf8'));
    const have = new Set(plan.rows.map((x) => x.family + '|' + x.entity + '|' + x.market));
    const added = r.rows.filter((x) => !have.has(x.family + '|' + x.entity + '|' + x.market));
    plan.rows.push(...added);
    writeFileSync(planUrl, JSON.stringify(plan, null, 1) + '\n');
    console.error('plan rows added: ' + added.length);
  }
  const { files, rows, ...summary } = r;
  console.log(JSON.stringify(summary, null, 1));
}
