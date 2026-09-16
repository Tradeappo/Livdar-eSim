import { SITE_URL, absolute } from '../lib/routes.js';
import { generateSitemaps } from './sitemap.js';

// Indexing is opened only when the site is deployed on its own domain. Preview
// deployments carry a different host, and a preview that gets indexed competes
// with production for the same queries. lib/seo.js closes the same door at page
// level from the same variable, so robots.txt and the page meta cannot disagree.
const INDEXABLE = process.env.NEXT_PUBLIC_ALLOW_INDEXING !== 'false';

export default async function robots() {
  if (!INDEXABLE) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }

  // robots.txt used to advertise a single /sitemap.xml that Next never
  // generates, because generateSitemaps publishes one file per market and
  // cluster. Listing the real files means a crawler is never sent to a 404, and
  // the list is built from the same function that creates the files, so it can
  // never drift.
  const sitemaps = (await generateSitemaps()).map((s) => absolute('/sitemap/' + s.id + '.xml'));

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
