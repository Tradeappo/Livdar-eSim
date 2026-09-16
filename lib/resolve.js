// Route resolver.
//
// Path segments are localised, so the file system cannot describe them. One
// catch all route hands the segments here and this module decides what the page
// is. It only ever resolves to something that has content behind it, which is
// what keeps unpublished markets out of the tree.

import { segment } from './i18n.js';
import { DESTINATIONS, REGIONS, findDestinationBySlug, destinationSlug } from './destinations.js';
import { publishedDestinationIds, publishedGuideSlugs, guideContent } from './content/index.js';

export function resolvePath(locale, slugParts) {
  const parts = (slugParts || []).filter(Boolean);
  if (!parts.length) return { type: 'home', locale };

  const first = parts[0];

  if (first === segment('esim', locale)) {
    if (parts.length === 1) return { type: 'esimHub', locale };
    if (parts.length === 2) {
      const dest = findDestinationBySlug(parts[1], locale);
      if (!dest) return null;
      if (!publishedDestinationIds(locale).includes(dest.id)) return null;
      return { type: 'destination', locale, destination: dest };
    }
    return null;
  }

  if (first === segment('regions', locale)) {
    if (parts.length === 1) return { type: 'regionsHub', locale };
    if (parts.length === 2) {
      const region = REGIONS.find((r) => r.id === parts[1]);
      if (!region) return null;
      return { type: 'region', locale, region };
    }
    return null;
  }

  if (first === segment('guides', locale)) {
    if (parts.length === 1) return { type: 'guidesHub', locale };
    if (parts.length === 2) {
      const guide = guideContent(locale, parts[1]);
      if (!guide) return null;
      return { type: 'guide', locale, slug: parts[1], guide };
    }
    return null;
  }

  if (first === segment('compatibility', locale) && parts.length === 1) {
    return { type: 'compatibility', locale };
  }

  return null;
}

// Every path this locale publishes. Drives generateStaticParams and the sitemap
// from the same source, so the two can never disagree.
export function allPathsForLocale(locale) {
  const out = [];
  out.push([segment('esim', locale)]);
  publishedDestinationIds(locale).forEach((id) => {
    const dest = DESTINATIONS.find((d) => d.id === id);
    if (dest) out.push([segment('esim', locale), destinationSlug(dest, locale)]);
  });
  out.push([segment('regions', locale)]);
  REGIONS.filter((r) => r.id !== 'global').forEach((r) => out.push([segment('regions', locale), r.id]));
  out.push([segment('guides', locale)]);
  publishedGuideSlugs(locale).forEach((slug) => out.push([segment('guides', locale), slug]));
  out.push([segment('compatibility', locale)]);
  return out;
}
