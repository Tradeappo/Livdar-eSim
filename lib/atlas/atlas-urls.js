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
    : countrySlug(entity, language);
  if (!leaf.slug) return null;
  return { path: '/' + language + '/' + segment + '/' + leaf.slug + '/', slugFrom: leaf.from, segment };
}

// The hreflang cluster a page belongs to. Two pages are alternates of each
// other when they are the same family about the same entity, which is the
// only definition that survives the slugs being different in every language.
export const clusterKey = (page) => page.family + '::' + page.entity;
