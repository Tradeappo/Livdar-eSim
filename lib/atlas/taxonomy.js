// Page families, URL patterns and the count of possible combinations.
//
// "Possible" means an entity from a real list times a variant times a locale.
// It is a ceiling, never a page count: a combination becomes a page only after
// the gates in lib/eligibility.mjs pass and the registry approves it.

import { LOCALES, SEGMENTS, SITE_ORIGIN, monthSlug, parseMonthSlug } from './i18n.js';

export const FAMILIES = {
  'city-guide': {
    entity: 'city',
    variants: 1,
    // Minimum measured monthly searches in the locale's own markets for the
    // entity and family. Below it the page is not published.
    minimumMonthlyVolume: 200,
    requiredData: [['geonames-cities', 'wikidata-cities'], 'country-facts-verified'],
    minimumWords: 280,
  },
  'city-month': {
    entity: 'city',
    variants: 12,
    minimumMonthlyVolume: 100,
    requiredData: [['geonames-cities', 'wikidata-cities'], 'nasa-power-daily'],
    minimumWords: 250,
  },
  airport: {
    entity: 'airport',
    variants: 1,
    minimumMonthlyVolume: 200,
    requiredData: ['ourairports', ['geonames-cities', 'wikidata-cities']],
    minimumWords: 250,
  },
};

export function citySlug(ds, cityId, locale) {
  const s = ds.slugs.cities[String(cityId)];
  return s ? s[locale] || null : null;
}

export function airportSlug(ds, iata, locale) {
  const s = ds.slugs.airports[iata];
  return s ? s[locale] || null : null;
}

export function pathFor(ds, page) {
  const { family, locale } = page;
  if (family === 'city-guide' || family === 'city-month') {
    const slug = citySlug(ds, page.entity, locale);
    if (!slug) return null;
    const base = '/' + locale + '/' + SEGMENTS.city[locale] + '/' + slug + '/';
    return family === 'city-guide' ? base : base + monthSlug(locale, page.month) + '/';
  }
  if (family === 'airport') {
    const slug = airportSlug(ds, page.entity, locale);
    return slug ? '/' + locale + '/' + SEGMENTS.airport[locale] + '/' + slug + '/' : null;
  }
  return null;
}

export const absolute = (path) => SITE_ORIGIN + path;

export function pageKey(page) {
  return [page.family, page.locale, page.entity].concat(page.family === 'city-month' ? [String(page.month + 1).padStart(2, '0')] : []).join(':');
}

export function parseKey(key) {
  const [family, locale, entity, month] = key.split(':');
  return { family, locale, entity, month: month ? Number(month) - 1 : undefined };
}

// Reverse routing: from a request path to a page. Slug lookups go through the
// pinned slug table, so a page answers on exactly one path per locale.
export function resolvePath(ds, path) {
  const parts = path.split('/').filter(Boolean);
  const [locale, seg, slug, sub] = parts;
  if (!LOCALES.includes(locale) || parts.length < 3 || parts.length > 4) return null;
  if (seg === SEGMENTS.city[locale]) {
    const id = ds.citySlugIndex[locale] && ds.citySlugIndex[locale].get(slug);
    if (!id) return null;
    if (!sub) return { family: 'city-guide', locale, entity: id };
    const month = parseMonthSlug(locale, sub);
    return month >= 0 ? { family: 'city-month', locale, entity: id, month } : null;
  }
  if (seg === SEGMENTS.airport[locale] && !sub) {
    const iata = ds.airportSlugIndex[locale] && ds.airportSlugIndex[locale].get(slug);
    return iata ? { family: 'airport', locale, entity: iata } : null;
  }
  return null;
}

// Airports that serve travellers: scheduled service, an IATA code, large or
// medium. Everything else in OurAirports (heliports, strips, closed fields) is
// out of the taxonomy.
export function travelAirports(ds) {
  return ds.airports.filter((a) => a.iata && a.scheduled && (a.type === 'large_airport' || a.type === 'medium_airport'));
}

export function enumerate(ds, family) {
  const f = FAMILIES[family];
  const out = [];
  const entities = f.entity === 'city' ? ds.cities.map((c) => String(c.id)) : travelAirports(ds).map((a) => a.iata);
  for (const locale of LOCALES) {
    for (const entity of entities) {
      if (f.variants === 12) for (let m = 0; m < 12; m++) out.push({ family, locale, entity, month: m });
      else out.push({ family, locale, entity });
    }
  }
  return out;
}

// Ceiling per family: entity list size x variants x locales. Reported with the
// entity counts it came from so nobody mistakes it for pages.
export function possibleCounts(ds) {
  const cities = ds.cities.length;
  const airports = travelAirports(ds).length;
  const rows = Object.entries(FAMILIES).map(([key, f]) => {
    const entities = f.entity === 'city' ? cities : airports;
    return { family: key, entities, variants: f.variants, locales: LOCALES.length, possible: entities * f.variants * LOCALES.length };
  });
  return { entities: { cities, airports }, rows, total: rows.reduce((t, r) => t + r.possible, 0) };
}
