// The Atlas vocabulary, small enough to import at the edge.
//
// The middleware runs on every request and imports only the locale table on
// purpose, so the edge bundle stays small. It cannot import the Atlas URL
// vocabulary, because that pulls in the family table, the entity store, the
// holiday source and the city index behind it.
//
// It has to know two things all the same, and this file is those two things as
// plain literals: which languages the Atlas publishes in, and which path
// segments belong to it. Without them the middleware treats an Atlas language
// as a market with no content and redirects it to the nearest live one, which
// is what happened to seven of the nine languages the first time the Atlas went
// to production: the pages were built, prerendered and in the sitemap, and every
// request for them answered 307 to the English home page.
//
// Duplication is the cost of a small edge bundle and it is paid for with a test:
// tests/atlas-middleware.test.mjs compares both sets against the real vocabulary
// in lib/atlas/atlas-urls.js and the languages the cohort manifests are written
// in, and fails if either drifts by one entry.

export const ATLAS_LANGUAGES = new Set([
  'de', 'en', 'es', 'fr', 'it', 'ja', 'nl', 'pl', 'pt', 'zh-Hant',
]);

// Every segment any Atlas language uses, flattened. A path is an Atlas path when
// its first segment is one of the languages above and its second is one of
// these, which is the cheapest test that cannot match an eSIM path: none of
// these words is an eSIM segment, and a test asserts that too.
export const ATLAS_SEGMENTS_FLAT = new Set([
  // cost of living
  'cost-of-living', 'lebenshaltungskosten', 'costo-della-vita', 'coste-de-vida',
  'cout-de-la-vie', 'kosten-van-levensonderhoud', 'koszty-zycia', 'custo-de-vida',
  'seikatsuhi', 'shenghuofei',
  // salaries
  'salaries', 'gehaelter', 'stipendi', 'salarios', 'salaires', 'salarissen',
  'wynagrodzenia', 'kyuyo', 'xinzi',
  // tools
  'tools', 'rechner', 'strumenti', 'herramientas', 'outils', 'kalkulatory',
  'ferramentas', 'tool', 'gongju',
  // rankings
  'rankings', 'rangliste', 'classifiche', 'clasificaciones', 'classements',
  'ranglijsten', 'rankingi', 'ranking', 'paiming',
  // best time to visit
  'best-time-to-visit', 'beste-reisezeit', 'quando-andare', 'mejor-epoca-para-viajar',
  'quand-partir', 'beste-reistijd', 'kiedy-jechac', 'melhor-epoca-para-viajar',
  'best-season', 'zuijialvyouji',
  // where to stay
  'where-to-stay', 'stadtteile', 'zone', 'zonas', 'ou-loger', 'stadsdelen',
  'dzielnice-miasta', 'onde-ficar', 'area-guide', 'zhusu',
  // public holidays
  'public-holidays', 'feiertage', 'giorni-festivi', 'dias-festivos', 'jours-feries',
  'feestdagen', 'dni-wolne-od-pracy', 'feriados', 'holidays', 'jiari',
  // rent increase
  'rent-increase', 'mietpreisentwicklung', 'aumento-affitti', 'subida-del-alquiler',
  'augmentation-des-loyers', 'huurverhoging', 'wzrost-czynszu', 'aumento-de-rendas',
  'rent-trend', 'zujin',
  // sport
  'sport', 'deporte', 'desporto', 'yundong',
]);

// Whether a pathname is an Atlas page rather than an eSIM page. Called from the
// middleware, so it takes the pathname and does no allocation beyond the split.
export function isAtlasPath(pathname) {
  const parts = String(pathname || '').split('/');
  // ['', lang, segment, ...]
  return parts.length > 3 && ATLAS_LANGUAGES.has(parts[1]) && ATLAS_SEGMENTS_FLAT.has(parts[2]);
}
