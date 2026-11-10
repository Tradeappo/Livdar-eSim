// A `process.env` for the Worker, injected by esbuild (--inject, see cloudflare/build.mjs).
//
// Several library modules read process.env at module scope: lib/routes.js takes
// NEXT_PUBLIC_SITE_URL, lib/analytics.js takes the GTM and Clarity ids, lib/indexing.js
// reads VERCEL_ENV. In a Worker `process` does not exist, so without this the bundle
// throws on its first import rather than on a request, and the Worker would be dead on
// deploy instead of wrong on one page.
//
// The values are deliberately the production ones for everything that ends up in the
// markup, because the whole point of the staging Worker is to emit the same canonical,
// the same hreflang and the same absolute URLs as livdar.com so the two can be diffed.
// The one thing that must NOT match is indexability, and that is not handled here: the
// Worker overrides robots itself and sends X-Robots-Tag on every response, so a
// misconfigured variable cannot open staging to a crawler.
//
// The tag container ids are left empty: a staging page must not report into production
// analytics, and an empty id makes the layout omit the script entirely, which is exactly
// what a local `next dev` without an .env does.
const env = {
  NEXT_PUBLIC_SITE_URL: 'https://livdar.com',
  NEXT_PUBLIC_GTM_ID: '',
  NEXT_PUBLIC_CLARITY_ID: '',
  NEXT_PUBLIC_ALLOW_INDEXING: 'false',
  VERCEL_ENV: '',
  NODE_ENV: 'production',
};

export const process = { env, platform: 'cloudflare', version: 'v22.0.0', argv: [], cwd: () => '/' };
export default process;
