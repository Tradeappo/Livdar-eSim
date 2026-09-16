// Livdar i18n core.
// The locale table describes what the infrastructure supports: slugs, script
// direction, endonym, currency. It deliberately does NOT decide what is
// published. That is computed from whether the content exists, in
// lib/content/index.js, and read through lib/markets.js. The `live` field below
// is kept only as a record of intent for the roadmap and is not consulted by
// routing, hreflang, the sitemap or the language selector.
//
// Every market is its own market. A locale is "live" only when it has authored
// editorial content that passed the quality gate. Everything else stays in the
// infrastructure but is not linked, not in the sitemap and not indexable.

export const LOCALES = [
  { code: 'en', hreflang: 'en', name: 'English', endonym: 'English', dir: 'ltr', live: true, currency: 'EUR' },
  { code: 'de', hreflang: 'de', name: 'German', endonym: 'Deutsch', dir: 'ltr', live: true, currency: 'EUR' },
  { code: 'ro', hreflang: 'ro', name: 'Romanian', endonym: 'Romana', dir: 'ltr', live: true, currency: 'RON' },
  { code: 'fr', hreflang: 'fr', name: 'French', endonym: 'Francais', dir: 'ltr', live: false, currency: 'EUR' },
  { code: 'it', hreflang: 'it', name: 'Italian', endonym: 'Italiano', dir: 'ltr', live: false, currency: 'EUR' },
  { code: 'es', hreflang: 'es', name: 'Spanish', endonym: 'Espanol', dir: 'ltr', live: false, currency: 'EUR' },
  { code: 'nl', hreflang: 'nl', name: 'Dutch', endonym: 'Nederlands', dir: 'ltr', live: false, currency: 'EUR' },
  { code: 'pl', hreflang: 'pl', name: 'Polish', endonym: 'Polski', dir: 'ltr', live: false, currency: 'PLN' },
  { code: 'pt', hreflang: 'pt', name: 'Portuguese', endonym: 'Portugues', dir: 'ltr', live: false, currency: 'EUR' },
  { code: 'ja', hreflang: 'ja', name: 'Japanese', endonym: '日本語', dir: 'ltr', live: false, currency: 'JPY' },
  { code: 'ko', hreflang: 'ko', name: 'Korean', endonym: '한국어', dir: 'ltr', live: false, currency: 'KRW' },
  { code: 'id', hreflang: 'id', name: 'Indonesian', endonym: 'Bahasa Indonesia', dir: 'ltr', live: false, currency: 'IDR' },
  { code: 'tr', hreflang: 'tr', name: 'Turkish', endonym: 'Turkce', dir: 'ltr', live: false, currency: 'TRY' },
  { code: 'ru', hreflang: 'ru', name: 'Russian', endonym: 'Русский', dir: 'ltr', live: false, currency: 'EUR' },
  { code: 'ar', hreflang: 'ar', name: 'Arabic', endonym: 'العربية', dir: 'rtl', live: false, currency: 'AED' },
  { code: 'zh-Hant', hreflang: 'zh-Hant', name: 'Chinese (Traditional)', endonym: '繁體中文', dir: 'ltr', live: false, currency: 'TWD' },
  { code: 'zh-Hans', hreflang: 'zh-Hans', name: 'Chinese (Simplified)', endonym: '简体中文', dir: 'ltr', live: false, currency: 'CNY' },
];

export const DEFAULT_LOCALE = 'en';

// Locales that use a non-Latin script keep the romanised slug. Percent encoded
// URLs read badly in the SERP and in shares, and every one of those markets is
// used to Latin slugs on travel sites.
export const LATIN_SLUG_LOCALES = ['en', 'de', 'fr', 'it', 'es', 'nl', 'pl', 'pt', 'ro', 'id', 'tr'];

export const liveLocales = () => LOCALES.filter((l) => l.live);
export const allLocaleCodes = () => LOCALES.map((l) => l.code);
export const liveLocaleCodes = () => liveLocales().map((l) => l.code);
export const getLocale = (code) => LOCALES.find((l) => l.code === code) || null;
export const isLive = (code) => Boolean(getLocale(code) && getLocale(code).live);

// The path segment that carries the product. Each market words it the way that
// market searches, so the URL matches the query instead of translating it.
export const SEGMENTS = {
  privacy: {
    en: 'privacy', de: 'datenschutz', ro: 'confidentialitate', fr: 'confidentialite', it: 'privacy',
    es: 'privacidad', nl: 'privacy', pl: 'prywatnosc', pt: 'privacidade', ja: 'privacy',
    ko: 'privacy', id: 'privasi', tr: 'gizlilik', ru: 'privacy', ar: 'privacy',
    'zh-Hant': 'privacy', 'zh-Hans': 'privacy',
  },
  cookies: {
    en: 'cookies', de: 'cookies', ro: 'cookie-uri', fr: 'cookies', it: 'cookie',
    es: 'cookies', nl: 'cookies', pl: 'pliki-cookie', pt: 'cookies', ja: 'cookies',
    ko: 'cookies', id: 'cookies', tr: 'cerezler', ru: 'cookies', ar: 'cookies',
    'zh-Hant': 'cookies', 'zh-Hans': 'cookies',
  },
  esim: {
    en: 'esim', de: 'esim', ro: 'esim', fr: 'esim', it: 'esim', es: 'esim',
    nl: 'esim', pl: 'esim', pt: 'esim', ja: 'esim', ko: 'esim', id: 'esim',
    tr: 'esim', ru: 'esim', ar: 'esim', 'zh-Hant': 'esim', 'zh-Hans': 'esim',
  },
  guides: {
    en: 'guides', de: 'ratgeber', ro: 'ghiduri', fr: 'guides', it: 'guide',
    es: 'guias', nl: 'gidsen', pl: 'poradniki', pt: 'guias', ja: 'guides',
    ko: 'guides', id: 'panduan', tr: 'rehber', ru: 'guides', ar: 'guides',
    'zh-Hant': 'guides', 'zh-Hans': 'guides',
  },
  regions: {
    en: 'regions', de: 'regionen', ro: 'regiuni', fr: 'regions', it: 'regioni',
    es: 'regiones', nl: 'regios', pl: 'regiony', pt: 'regioes', ja: 'regions',
    ko: 'regions', id: 'wilayah', tr: 'bolgeler', ru: 'regions', ar: 'regions',
    'zh-Hant': 'regions', 'zh-Hans': 'regions',
  },
  compare: {
    en: 'compare', de: 'vergleich', ro: 'comparatii', fr: 'comparatif',
    it: 'confronto', es: 'comparativa', nl: 'vergelijken', pl: 'porownanie',
    pt: 'comparacao', ja: 'compare', ko: 'compare', id: 'perbandingan',
    tr: 'karsilastirma', ru: 'compare', ar: 'compare', 'zh-Hant': 'compare',
    'zh-Hans': 'compare',
  },
  compatibility: {
    en: 'compatibility', de: 'kompatibilitaet', ro: 'compatibilitate',
    fr: 'compatibilite', it: 'compatibilita', es: 'compatibilidad',
    nl: 'compatibiliteit', pl: 'kompatybilnosc', pt: 'compatibilidade',
    ja: 'compatibility', ko: 'compatibility', id: 'kompatibilitas',
    tr: 'uyumluluk', ru: 'compatibility', ar: 'compatibility',
    'zh-Hant': 'compatibility', 'zh-Hans': 'compatibility',
  },
};

export const segment = (key, locale) => {
  const table = SEGMENTS[key];
  if (!table) return key;
  return table[locale] || table[DEFAULT_LOCALE];
};

const DIACRITICS = {
  a: 'àáâãäåăąā',
  e: 'èéêëęēě',
  i: 'ìíîïıī',
  o: 'òóôõöøōő',
  u: 'ùúûüūűů',
  c: 'çćč',
  n: 'ñńň',
  s: 'śšşș',
  t: 'ţțť',
  z: 'źżž',
  l: 'ł',
  d: 'ďđ',
  r: 'ř',
  y: 'ýÿ',
  g: 'ğ',
};

export function slugify(input) {
  let out = String(input || '').toLowerCase();
  out = out.replace(/ß/g, 'ss').replace(/æ/g, 'ae').replace(/œ/g, 'oe');
  for (const [plain, accented] of Object.entries(DIACRITICS)) {
    for (const ch of accented) out = out.split(ch).join(plain);
  }
  out = out.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return out;
}

export function localeDir(code) {
  const l = getLocale(code);
  return l && l.dir === 'rtl' ? 'rtl' : 'ltr';
}
