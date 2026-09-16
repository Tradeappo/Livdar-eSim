// The sitemap index.
//
// generateSitemaps in app/sitemap.js publishes one file per market and cluster
// at /sitemap/<market>-<cluster>.xml. Next does not create an index above them,
// so /sitemap.xml returned 404 while robots.txt advertised it. A crawler that
// follows robots.txt to a 404 learns nothing about the site.
//
// This handler builds the index from the same generateSitemaps function that
// creates the files, so the index can never list a sitemap that does not exist
// and can never omit one that does.

import { generateSitemaps } from '../sitemap.js';
import { absolute } from '../../lib/routes.js';

const INDEXABLE = process.env.NEXT_PUBLIC_ALLOW_INDEXING !== 'false';

export const dynamic = 'force-static';

export async function GET() {
  const ids = await generateSitemaps();
  const lastModified = new Date().toISOString();

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    ids
      .map(
        (s) =>
          '  <sitemap>\n' +
          '    <loc>' +
          absolute('/sitemap/' + s.id + '.xml') +
          '</loc>\n' +
          '    <lastmod>' +
          lastModified +
          '</lastmod>\n' +
          '  </sitemap>\n'
      )
      .join('') +
    '</sitemapindex>\n';

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // A preview deployment must not hand a crawler a usable index even if it
      // somehow reaches this route, so the same flag that closes robots.txt and
      // the page meta closes this too.
      'X-Robots-Tag': INDEXABLE ? 'all' : 'noindex, nofollow',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
