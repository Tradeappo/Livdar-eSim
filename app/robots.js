import { SITE_URL, absolute } from '../lib/routes.js';
import { generateSitemaps } from './sitemap.js';
import { indexingAllowed } from '../lib/indexing.js';
import { atlasOrigin } from '../lib/atlas.js';

// Indexing is opened only when the site is deployed on its own domain. Preview
// deployments carry a different host, and a preview that gets indexed competes
// with production for the same queries. lib/seo.js closes the same door at page
// level from the same variable, so robots.txt and the page meta cannot disagree.
const INDEXABLE = indexingAllowed();

export default async function robots() {
  if (!INDEXABLE) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }

  // The index at /sitemap.xml is served by app/sitemap.xml/route.js and is
  // built from the same generateSitemaps function that creates the files below
  // it. Both the index and the individual files are listed, because some
  // crawlers follow only the first entry and an index costs nothing to add.
  const sitemaps = [absolute('/sitemap.xml')].concat(
    (await generateSitemaps()).map((s) => absolute('/sitemap/' + s.id + '.xml'))
  ).concat(atlasOrigin() ? [absolute('/sitemap-atlas.xml')] : []);

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/static/chunks/'],
      },
    ],
    sitemap: sitemaps,
    host: SITE_URL,
  };
}
