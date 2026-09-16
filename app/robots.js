import { SITE_URL } from '../lib/routes.js';

// Indexing is opened only when the site is deployed on its own domain. Preview
// deployments carry a different host, and a preview that gets indexed competes
// with production for the same queries.
const INDEXABLE = process.env.NEXT_PUBLIC_ALLOW_INDEXING !== 'false';

export default function robots() {
  if (!INDEXABLE) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/static/chunks/'],
      },
    ],
    sitemap: SITE_URL + '/sitemap.xml',
    host: SITE_URL,
  };
}
