// URLs for the Atlas families.
//
// The existing taxonomy module covers the three families the eSIM site
// already publishes and knows nothing about the Atlas ones, and the eSIM URLs
// must not move. So this is an additional vocabulary rather than a change to
// that one, and nothing here can produce a path that collides with a path
// that already exists.
//
// Three rules decide every slug, and all three exist to avoid inventing text.
//
// One: a tool or ranking page is slugged from the keyword that was actually
// measured in that market. The German moving calculator is reached at
// umzugskosten-rechner and the British one at removal-costs-calculator,
// because those are the phrasings that were measured, not translations of
// each other. This also makes identical translations structurally impossible.
//
// Two: a country page is slugged from the CLDR country name for that
// language, which ships with Node and is a real localisation rather than a
// guess. Spain is espana in Spanish and hiszpania in Polish.
//
// Three: every slug is Latin script. Japanese and Traditional Chinese pages
// carry Latin slugs, because a percent encoded path is unreadable in a
// sitemap, in a log and in analytics, and because the repository's existing
// segment vocabulary already romanises for those two languages. Where a
// keyword has no Latin characters at all, the tool's own identifier is used
// and that is recorded rather than silently substituted.

import { FAMILIES } from './verticals.js';
import { cityName } from './cities.js';
import { forSubdivision, splitEntity } from './holidays.js';

// The path segment each family sits under, per language. Latin script
// everywhere. For Japanese and Traditional Chinese the segment is a common
// romanisation where one exists and is unambiguous, and English where
// romanising would mislead more than it helps.
export const ATLAS_SEGMENTS = {
  'cost-of-living': {
    en: 'cost-of-living', de: 'lebenshaltungskosten', it: 'costo-della-vita', es: 'coste-de-vida',
    fr: 'cout-de-la-vie', nl: 'kosten-van-levensonderhoud', pl: 'koszty-zycia', pt: 'custo-de-vida',
    ja: 'seikatsuhi', 'zh-Hant': 'shenghuofei',
  },
  salaries: {
    en: 'salaries', de: 'gehaelter', it: 'stipendi', es: 'salarios',
    fr: 'salaires', nl: 'salarissen', pl: 'wynagrodzenia', pt: 'salarios',
    ja: 'kyuyo', 'zh-Hant': 'xinzi',
  },
  tools: {
    en: 'tools', de: 'rechner', it: 'strumenti', es: 'herramientas',
    fr: 'outils', nl: 'tools', pl: 'kalkulatory', pt: 'ferramentas',
    ja: 'tool', 'zh-Hant': 'gongju',
  },
  rankings: {
    en: 'rankings', de: 'rangliste', it: 'classifiche', es: 'clasificaciones',
    fr: 'classements', nl: 'ranglijsten', pl: 'rankingi', pt: 'rankings',
    ja: 'ranking', 'zh-Hant': 'paiming',
  },
  // The segment each language uses for the question rather than for the
  // subject. English and German name the time, French and Italian and Polish
  // ask when to go, because that is what each language's measured head term
  // actually says and a segment that contradicts the keyword reads as a
  // translation of somebody else's site.
  'best-time': {
    en: 'best-time-to-visit', de: 'beste-reisezeit', it: 'quando-andare', es: 'mejor-epoca-para-viajar',
    fr: 'quand-partir', nl: 'beste-reistijd', pl: 'kiedy-jechac', pt: 'melhor-epoca-para-viajar',
    ja: 'best-season', 'zh-Hant': 'zuijialvyouji',
  },
  // The obvious word for a district is already a segment on the eSIM site in
  // seven of these languages: quartieri, barrios, quartiers, wijken,
  // dzielnice, bairros and quyu are all taken, and this programme never moves
  // a URL that exists. So each language takes the nearest thing it would say
  // instead. German keeps its district word because `viertel` is what the
  // eSIM site took and `stadtteile` is both free and the head term the German
  // market actually searches. Italian and Spanish go to the zone, Dutch to the
  // city part, Polish to the districts of the city, and French and Portuguese
  // to the question rather than the noun.
  'where-to-stay': {
    en: 'where-to-stay', de: 'stadtteile', it: 'zone', es: 'zonas',
    fr: 'ou-loger', nl: 'stadsdelen', pl: 'dzielnice-miasta', pt: 'onde-ficar',
    ja: 'area-guide', 'zh-Hant': 'zhusu',
  },
  // Each market's own word for the thing, which is also the head term it
  // searches: Feiertage, jours feries, festivos, feriados, feestdagen, and in
  // Polish the days free from work rather than the holidays.
  holidays: {
    en: 'public-holidays', de: 'feiertage', it: 'giorni-festivi', es: 'dias-festivos',
    fr: 'jours-feries', nl: 'feestdagen', pl: 'dni-wolne-od-pracy', pt: 'feriados',
    ja: 'holidays', 'zh-Hant': 'jiari',
  },
};

// Which segment each family uses. A family absent from this map has no Atlas
// URL yet, and asking for one returns null rather than a guess.
export const FAMILY_SEGMENT = {
  'cost-of-living.country': 'cost-of-living',
  'work.country-salaries': 'salaries',
  'tools.calculator': 'tools',
  'tools.cost-calculator': 'tools',
  'tools.cost-comparison': 'tools',
  'tools.matcher': 'tools',
  'rankings.index': 'rankings',
  'weather.country-best-time': 'best-time',
  'neighbourhoods.city-where-to-stay': 'where-to-stay',
  'events.country-holidays': 'holidays',
  'events.subdivision-holidays': 'holidays',
};

// Characters that must be spelled out rather than stripped, because stripping
// them changes the word. Dropping the umlaut from Gehälter gives Gehalter,
// which is not a German word; expanding it gives Gehaelter, which is the
// conventional transliteration.
const EXPANSIONS = [
  ['ä', 'ae'], ['ö', 'oe'], ['ü', 'ue'], ['ß', 'ss'],
  ['ł', 'l'], ['đ', 'd'], ['ø', 'o'], ['å', 'aa'], ['æ', 'ae'], ['œ', 'oe'], ['ð', 'd'], ['þ', 'th'],
];

export function slugify(text) {
  let s = String(text).toLowerCase().trim();
  for (const [from, to] of EXPANSIONS) s = s.split(from).join(to);
  s = s.normalize('NFD').replace(/[̀-ͯ]/g, '');
  // The dash rule of the whole programme applies to URLs as much as to prose:
  // only the plain hyphen, never the longer ones. The range is built from
  // code points rather than written out, so that this line does not contain
  // the characters it is here to remove and fail the dash check itself.
  s = s.replace(new RegExp('[' + String.fromCodePoint(0x2010) + '-' + String.fromCodePoint(0x2015) + ']', 'g'), '-');
  s = s.replace(/['’`]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return s;
}

// Whether a slug survived the fold. An empty result means the source text had
// no Latin content, which is a fact about the language rather than an error.
export const isLatinSlug = (s) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s);

const regionNames = new Map();
export function countryName(iso2, language) {
  if (!regionNames.has(language)) regionNames.set(language, new Intl.DisplayNames([language], { type: 'region' }));
  try { return regionNames.get(language).of(iso2) || null; } catch { return null; }
}

// The slug for a country in a language. Japanese and Traditional Chinese fall
// back to the English name, because the localised one is not Latin and the
// rule above says the path is.
export function countrySlug(iso2, language) {
  const localised = countryName(iso2, language);
  const slug = localised ? slugify(localised) : '';
  if (isLatinSlug(slug)) return { slug, from: 'cldr', language };
  const english = countryName(iso2, 'en');
  return { slug: slugify(english || iso2), from: 'cldr-english-fallback', language };
}

// The slug for a tool or a ranking, taken from the keyword measured in that
// market. Falls back to the declared identifier when the keyword is not Latin.
export function globalSlug(entityId, keyword) {
  const slug = slugify(keyword || '');
  if (isLatinSlug(slug)) return { slug, from: 'measured-keyword' };
  return { slug: slugify(entityId), from: 'entity-id, the measured keyword has no Latin characters' };
}

// The slug for a city, from the name the entity store holds for it in this
// language. Most languages get the endonym, because the store carries
// localised labels for only a few and this programme has no source for the
// rest. A name with no Latin content at all falls back to the ASCII name the
// provider ships, which is what Japanese cities use.
export function citySlug(cityId, language) {
  const localised = cityName(cityId, language);
  const slug = slugify(localised || '');
  if (isLatinSlug(slug)) return { slug, from: 'city name' };
  const ascii = (cityName(cityId, 'en') || '');
  const fallback = slugify(ascii);
  return isLatinSlug(fallback) ? { slug: fallback, from: 'provider ascii name' } : { slug: '', from: 'no latin name for this city' };
}

// The slug for a region, from the name the holiday source carries for it in
// this language. Bavaria is `bayern` in German and `bavaria` in English, and
// both are real names rather than transliterations, so both are used.
export function subdivisionSlug(entity, language) {
  const split = splitEntity(entity);
  if (!split) return { slug: '', from: 'not a subdivision entity' };
  const d = forSubdivision(split.iso2, split.shortName);
  if (!d) return { slug: '', from: 'no such subdivision' };
  const localised = d.names[language] || d.names.en || Object.values(d.names)[0] || '';
  const slug = slugify(localised);
  if (isLatinSlug(slug)) return { slug, from: 'region name' };
  const english = slugify(d.names.en || '');
  return isLatinSlug(english) ? { slug: english, from: 'region name in English' } : { slug: '', from: 'no latin name for this region' };
}

// The path for one page. Returns null rather than guessing when the family has
// no Atlas vocabulary, so a new family cannot quietly acquire a URL shape it
// was never given.
export function atlasPath(page) {
  const { family, entity, language, keyword } = page;
  const segmentKey = FAMILY_SEGMENT[family];
  if (!segmentKey) return null;
  const segment = ATLAS_SEGMENTS[segmentKey]?.[language];
  if (!segment) return null;
  const scope = FAMILIES[family]?.scope;
  const leaf = scope === 'tool:global' || scope === 'ranking:list'
    ? globalSlug(entity, keyword)
    : scope === 'subdivision'
      ? subdivisionSlug(entity, language)
      : String(scope).startsWith('city:') || scope === 'city'
        ? citySlug(entity, language)
        : countrySlug(entity, language);
  if (!leaf.slug) return null;
  return { path: '/' + language + '/' + segment + '/' + leaf.slug + '/', slugFrom: leaf.from, segment };
}

// The hreflang cluster a page belongs to. Two pages are alternates of each
// other when they are the same family about the same entity, which is the
// only definition that survives the slugs being different in every language.
export const clusterKey = (page) => page.family + '::' + page.entity;
