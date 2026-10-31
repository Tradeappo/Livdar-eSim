// Links from an eSIM destination page to the Atlas pages about the same country, in the same
// language.
//
// WHY. Google crawls the eSIM destination pages far more often than any Atlas page, and the
// Atlas pages about the same country were not linked from them at all: /en/esim/japan/ carried
// two Atlas links, both in the shared navigation. A reader buying an eSIM for Japan is planning
// a trip to Japan, so the month-by-month climate of Tokyo and the cost of living in Japan are
// the next thing they want, not a detour.
//
// THE RULE, the same two as lib/atlas/atlas-links.js: a link only goes to a published page, and
// its anchor is that page's own heading. On top of that the page is about the destination's
// own country (iso2) and is in the destination page's language, never another one. The country
// pages come first (best time to visit, cost of living, salaries, holidays, rent), then the
// city weather pages, largest city first. The pages carry no per-city demand (the cohort builder
// measured the query pattern per market, not each city), and population is the measured fact
// closest to it: more people travel to Osaka than to Akashi. The block stops at MAX_LINKS so it stays
// a short list of the most useful pages rather than a dump of every city. A destination that
// is a part of a country (Bali, tagged `island`) gets no block: the pages of Indonesia as a
// whole are not about Bali.
import { publishedDestinationIds } from '../content/index.js';
import { getDestination } from '../destinations.js';
import { loadJsonBesideFunction } from './serve-pages.js';

export const MAX_LINKS = 8;
const COUNTRY_FAMILIES = ['weather.country-best-time', 'cost-of-living.country', 'work.country-salaries',
  'events.country-holidays', 'rents.country-inflation'];
const DESTINATION_LOCALES = ['en', 'de', 'ro'];

export const isPartOfCountry = (dest) => (dest.tags || []).includes('island');

/**
 * The links for every published destination in every eSIM language, from the published pages.
 * `population(cityId)` orders the city pages; the shard step passes the entity store's figure.
 */
export function destinationAtlasLinks(pages, population = () => 0) {
  const out = {};
  for (const locale of DESTINATION_LOCALES) {
    out[locale] = {};
    for (const id of publishedDestinationIds(locale)) {
      const dest = getDestination(id);
      if (!dest || !dest.iso2 || isPartOfCountry(dest)) continue;
      const iso = dest.iso2.toUpperCase();
      const mine = pages.filter((p) => p.locale === locale);
      const country = COUNTRY_FAMILIES.flatMap((f) => mine.filter((p) => p.family === f && String(p.entity).toUpperCase() === iso));
      const cities = mine.filter((p) => p.family === 'weather.city-month' && String(p.iso2 || '').toUpperCase() === iso)
        .sort((a, b) => (population(b.entity) || 0) - (population(a.entity) || 0) || a.path.localeCompare(b.path));
      const links = [...country, ...cities].slice(0, MAX_LINKS).map((p) => ({ href: p.path, title: p.h1 }));
      if (links.length) out[locale][id] = links;
    }
  }
  return out;
}

let cache = null;
/**
 * The links for one destination page, read from the small file the shard step writes. A missing
 * file gives no block rather than an error: the eSIM page is complete without it, and
 * tests/atlas-destination-links.test.mjs is what proves the file is built.
 */
export function atlasLinksForDestination(locale, destinationId) {
  if (!cache) {
    try { cache = loadJsonBesideFunction('data/atlas/cohorts/by-group/destination-links.json', 'Atlas destination links'); } catch { cache = {}; }
  }
  return cache[locale]?.[destinationId] || [];
}
