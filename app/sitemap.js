// Sitemap index, split by market and by cluster.
//
// Every entry is generated from the same source that drives generateStaticParams
// (lib/resolve.js and the content registry), so the sitemap cannot list a page
// that was never built and cannot omit a page that was. Nothing unpublished and
// nothing noindex can appear here, because nothing unpublished has a route.

import { REGIONS } from '../lib/destinations.js';
import { contentLocales, publishedDestinationIds, publishedGuideSlugs } from '../lib/content/index.js';
import { routes, absolute } from '../lib/routes.js';
import {
  homeAlternates,
  hubAlternates,
  destinationAlternates,
  guideAlternates,
  regionAlternates,
} from '../lib/seo.js';

const LAST_MODIFIED = new Date();

const REGION_IDS = REGIONS.filter((r) => r.id !== 'global').map((r) => r.id);

// Next.js appends ".xml" itself, so the ids stay extension free.
export async function generateSitemaps() {
  const ids = [];
  contentLocales().forEach((locale) => {
    ids.push({ id: locale + '-core' });
    if (publishedDestinationIds(locale).length) ids.push({ id: locale + '-destinations' });
    ids.push({ id: locale + '-regions' });
    if (publishedGuideSlugs(locale).length) ids.push({ id: locale + '-guides' });
  });
  return ids;
}

function entry(path, alternates, priority, changeFrequency) {
  return {
    url: absolute(path),
    lastModified: LAST_MODIFIED,
    changeFrequency,
    priority,
    alternates: alternates ? { languages: alternates } : undefined,
  };
}

function coreEntries(locale) {
  return [
    entry(routes.home(locale), homeAlternates(), 1.0, 'weekly'),
    entry(routes.esimHub(locale), hubAlternates('esim'), 0.9, 'weekly'),
    entry(routes.regionsHub(locale), hubAlternates('regions'), 0.7, 'monthly'),
    entry(routes.guidesHub(locale), hubAlternates('guides'), 0.7, 'monthly'),
    entry(routes.compatibility(locale), null, 0.6, 'monthly'),
  ];
}

function destinationEntries(locale) {
  return publishedDestinationIds(locale).map((id) =>
    entry(routes.destination(locale, id), destinationAlternates(id), 0.8, 'weekly')
  );
}

function regionEntries(locale) {
  return REGION_IDS.map((id) => entry(routes.region(locale, id), regionAlternates(id), 0.6, 'monthly'));
}

function guideEntries(locale) {
  return publishedGuideSlugs(locale).map((slug) =>
    entry(routes.guide(locale, slug), guideAlternates(slug), 0.6, 'monthly')
  );
}

export default async function sitemap({ id }) {
  const raw = String(id || '');
  const cut = raw.lastIndexOf('-');
  if (cut < 1) return [];
  const locale = raw.slice(0, cut);
  const kind = raw.slice(cut + 1);

  if (!contentLocales().includes(locale)) return [];

  if (kind === 'core') return coreEntries(locale);
  if (kind === 'destinations') return destinationEntries(locale);
  if (kind === 'regions') return regionEntries(locale);
  if (kind === 'guides') return guideEntries(locale);
  return [];
}
