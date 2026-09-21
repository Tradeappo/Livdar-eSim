// Contextual internal links between published pages.
//
// Search Console (2026-09-21) reported 58 of the 91 sitemap URLs as
// "Discovered - currently not indexed": Google knows they exist, mostly from the
// sitemap, but has not prioritised crawling them. The live link graph explained
// part of it: guides had two internal links pointing at them (home and the
// guides hub), destinations three, and neither linked to the other. A page that
// only the sitemap vouches for is a page Google has little reason to fetch.
//
// Everything here is derived from the same registry that decides what is
// published, so these helpers can never produce a link to an unpublished page
// or to a page in another market. Titles and descriptions are the pages' own
// H1 and meta description: no new copy is written for the links.

import {
  destinationContent,
  guideContent,
  publishedDestinationIds,
  publishedGuideSlugs,
  publishedRegionIds,
  regionContent,
} from './content/index.js';
import { destinationsInRegion, flagFor, getDestination, getRegion, localizedName, regionName } from './destinations.js';
import { routes } from './routes.js';

function destinationLink(locale, destination) {
  const c = destinationContent(locale, destination.id);
  return {
    id: destination.id,
    title: localizedName(destination, locale),
    description: c && c.metaDescription ? c.metaDescription : '',
    flag: flagFor(destination),
    href: routes.destination(locale, destination),
  };
}

function guideLink(locale, slug) {
  const g = guideContent(locale, slug);
  return { id: slug, title: g.h1, description: g.metaDescription, href: routes.guide(locale, slug) };
}

// The region page for a destination, when that region is published in this
// market. Returns null otherwise so the caller can fall back to plain text.
export function regionLinkForDestination(locale, destinationId) {
  const destination = getDestination(destinationId);
  if (!destination) return null;
  if (!publishedRegionIds(locale).includes(destination.region)) return null;
  const region = getRegion(destination.region);
  if (!region) return null;
  return { id: region.id, title: regionName(region, locale), href: routes.region(locale, region.id) };
}

// Published destinations in this market other than the current one and the
// ones already shown as same-region neighbours. Order follows the registry,
// which is the research priority order.
export function otherDestinationLinks(locale, currentId, exclude = []) {
  const skip = new Set([currentId, ...exclude]);
  return publishedDestinationIds(locale)
    .filter((id) => !skip.has(id))
    .map(getDestination)
    .filter(Boolean)
    .map((d) => destinationLink(locale, d));
}

export function guideLinks(locale, excludeSlug = null) {
  return publishedGuideSlugs(locale)
    .filter((slug) => slug !== excludeSlug)
    .map((slug) => guideLink(locale, slug));
}

export function destinationLinks(locale) {
  return publishedDestinationIds(locale)
    .map(getDestination)
    .filter(Boolean)
    .map((d) => destinationLink(locale, d));
}

// The eSIM hub directory: published destinations grouped by their region, each
// described by its own meta description. This is what separates the hub from
// the home page, which carries the same marketplace but a generic grid.
export function hubDirectory(locale) {
  const published = new Set(publishedDestinationIds(locale));
  const publishedRegions = new Set(publishedRegionIds(locale));
  const groups = new Map();
  publishedDestinationIds(locale).forEach((id) => {
    const destination = getDestination(id);
    if (!destination) return;
    if (!groups.has(destination.region)) groups.set(destination.region, []);
    groups.get(destination.region).push(destinationLink(locale, destination));
  });
  return [...groups.entries()].map(([regionId, items]) => {
    const region = getRegion(regionId);
    const rc = regionContent(locale, regionId);
    return {
      id: regionId,
      title: region ? regionName(region, locale) : regionId,
      href: publishedRegions.has(regionId) ? routes.region(locale, regionId) : null,
      description: rc && rc.metaDescription ? rc.metaDescription : '',
      items,
      // Kept for tests: every listed item must be published in this market.
      _allPublished: items.every((i) => published.has(i.id)),
    };
  });
}

export function sameRegionIds(locale, destinationId) {
  const destination = getDestination(destinationId);
  if (!destination) return [];
  const published = publishedDestinationIds(locale);
  return destinationsInRegion(destination.region)
    .filter((d) => d.id !== destinationId && published.includes(d.id))
    .slice(0, 6)
    .map((d) => d.id);
}
