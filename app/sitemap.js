// Sitemap index, split by market and by cluster.
//
// Every entry is generated from the same source that drives generateStaticParams
// (lib/resolve.js and the content registry), so the sitemap cannot list a page
// that was never built and cannot omit a page that was. Nothing unpublished and
// nothing noindex can appear here, because nothing unpublished has a route.

import { REGIONS } from '../lib/destinations.js';
import { contentLocales, publishedDestinationIds, publishedGuideSlugs, publishedRegionIds, legalContent, LEGAL_KINDS } from '../lib/content/index.js';
import { routes, absolute } from '../lib/routes.js';
import {
  homeAlternates,
  hubAlternates,
  destinationAlternates,
  guideAlternates,
  regionAlternates,
  compatibilityAlternates,
  legalAlternates,
} from '../lib/seo.js';
import { lastModifiedFor } from '../lib/content-freshness.js';
import { loadDataset as loadAtlas } from '../lib/atlas/data.js';
import { atlasSitemapIds, atlasSitemapEntries } from '../lib/atlas/sitemap.js';
import { atlasAlternates } from '../lib/atlas/serve.js';
import { buildModel as buildAtlasModel } from '../lib/atlas/model.js';
import { parseKey as parseAtlasKey } from '../lib/atlas/taxonomy.js';
import { sitemapIds as atlasPageSitemapIds, sitemapEntries as atlasPageSitemapEntries, isPagesSitemap } from '../lib/atlas/sitemap-pages.js';

const REGION_IDS = REGIONS.filter((r) => r.id !== 'global').map((r) => r.id);

// Next.js appends ".xml" itself, so the ids stay extension free.
export async function generateSitemaps() {
  const ids = [];
  contentLocales().forEach((locale) => {
    ids.push({ id: locale + '-core' });
    if (publishedDestinationIds(locale).length) ids.push({ id: locale + '-destinations' });
    if (publishedRegionIds(locale).length) ids.push({ id: locale + '-regions' });
    if (publishedGuideSlugs(locale).length) ids.push({ id: locale + '-guides' });
  });
  // Livdar Atlas: published pages only, one file per locale and page family.
  // The data page families are split by language and surface instead, so a
  // crawl log answers the surface question without a join.
  return ids.concat(atlasSitemapIds(loadAtlas())).concat(atlasPageSitemapIds());
}

function entry(path, alternates, priority, changeFrequency, family = 'core') {
  return {
    url: absolute(path),
    lastModified: lastModifiedFor(family),
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
    entry(routes.compatibility(locale), compatibilityAlternates(), 0.6, 'monthly'),
    ...LEGAL_KINDS.filter((k) => legalContent(locale, k)).map((k) =>
      entry(routes[k](locale), legalAlternates(k), 0.2, 'yearly')
    ),
  ];
}

function destinationEntries(locale) {
  return publishedDestinationIds(locale).map((id) =>
    entry(routes.destination(locale, id), destinationAlternates(id), 0.8, 'weekly', 'destinations')
  );
}

function regionEntries(locale) {
  return publishedRegionIds(locale).map((id) => entry(routes.region(locale, id), regionAlternates(id), 0.6, 'monthly', 'regions'));
}

function guideEntries(locale) {
  return publishedGuideSlugs(locale).map((slug) =>
    entry(routes.guide(locale, slug), guideAlternates(slug), 0.6, 'monthly', 'guides')
  );
}

export default async function sitemap({ id }) {
  const raw = String(id || '');
  if (isPagesSitemap(raw)) {
    return atlasPageSitemapEntries(raw, { absolute, lastModified: lastModifiedFor('atlas') });
  }
  if (raw.startsWith('atlas-')) {
    const ds = loadAtlas();
    const isLive = (k) => ds.registry.entries[k] && ds.registry.entries[k].state === 'published';
    return atlasSitemapEntries(ds, raw, (key) => {
      const model = buildAtlasModel(ds, parseAtlasKey(key), isLive);
      return model ? atlasAlternates(ds, model).languages : undefined;
    });
  }
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
