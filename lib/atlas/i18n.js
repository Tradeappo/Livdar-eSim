// Locales and the URL segments reserved for Livdar Atlas pages on livdar.com.
//
// Atlas pages live in this project next to the eSIM site, under their own
// first path segment per locale. None of these segments is used by the eSIM
// site in any locale (tests/atlas.test.mjs checks it against lib/i18n.js), and
// they must never change once a page under them is live.

import { SITE_URL } from '../routes.js';

export const SITE_ORIGIN = SITE_URL;

export const LOCALES = ['en', 'de', 'ro'];

export const SEGMENTS = {
  city: { en: 'cities', de: 'staedte', ro: 'orase' },
  airport: { en: 'airports', de: 'flughaefen', ro: 'aeroporturi' },
};

export const RESERVED_PREFIXES = LOCALES.flatMap((l) => Object.values(SEGMENTS).map((s) => '/' + l + '/' + s[l] + '/'));

export const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  ro: ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'],
};

// Month page slug per locale: /en/cities/lisbon/weather-in-may/
export function monthSlug(locale, m) {
  const name = slugify(MONTHS[locale][m], locale);
  if (locale === 'de') return 'wetter-im-' + name;
  if (locale === 'ro') return 'vremea-in-' + name;
  return 'weather-in-' + name;
}

export function parseMonthSlug(locale, slug) {
  for (let m = 0; m < 12; m++) if (monthSlug(locale, m) === slug) return m;
  return -1;
}

const DIACRITICS = { a: 'àáâãåāăąä', c: 'çćč', d: 'ďđ', e: 'èéêëēėęě', g: 'ğ', i: 'ìíîïīįı', l: 'łľ', n: 'ñńň', o: 'òóôõōőøö', r: 'řŕ', s: 'śšşș', t: 'ťţț', u: 'ùúûūůűųü', y: 'ýÿ', z: 'źżž' };

// German umlauts are transliterated the German way (ü -> ue) because these
// slugs are read by German speakers; every other diacritic is dropped.
export function slugify(input, locale) {
  let out = String(input || '').toLowerCase();
  if (locale === 'de') out = out.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue');
  out = out.replace(/ß/g, 'ss').replace(/æ/g, 'ae').replace(/œ/g, 'oe');
  for (const [plain, accented] of Object.entries(DIACRITICS)) for (const ch of accented) out = out.split(ch).join(plain);
  return out.normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function regionName(iso2, locale) {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(iso2);
  } catch {
    return iso2;
  }
}

export function currencyName(code, locale) {
  try {
    return new Intl.DisplayNames([locale], { type: 'currency' }).of(code);
  } catch {
    return code;
  }
}

export function languageName(code, locale) {
  try {
    return new Intl.DisplayNames([locale], { type: 'language' }).of(code);
  } catch {
    return code;
  }
}

export function formatNumber(n, locale, digits = 0) {
  return new Intl.NumberFormat(locale === 'en' ? 'en-GB' : locale, { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n);
}
