// Turning an exported Atlas page model into the HTML a crawler receives.
//
// THE POINT OF THIS FILE is that it renders the repository's OWN React components -
// components/atlas/AtlasPage.jsx, Header.jsx, Footer.jsx, JsonLd.jsx - with
// react-dom/server, rather than re-implementing them as string templates. A second
// implementation of the markup is a second thing to keep in step with the design, and
// the first time they drift the Cloudflare pages and the Vercel pages stop being the
// same pages. One template, rendered in both places.
//
// What this file DOES own is the document shell Next.js used to build from
// app/[lang]/layout.jsx and the metadata object: <html>, <head>, the canonical link, the
// hreflang cluster, the Open Graph and Twitter tags, the consent bootstrap and the skip
// link. Those are reproduced here from the same values lib/seo.js buildMetadata()
// produced at export time, which is why the exporter stores a `head` block per page
// instead of letting the Worker re-derive URLs.
//
// ROBOTS IS THE ONE DELIBERATE DIFFERENCE from production. Every page served here gets
// noindex, nofollow in the markup and X-Robots-Tag on the response, because the Worker
// answers on workers.dev and a staging copy that Google can index competes with
// livdar.com for its own queries. Nothing else about the head differs: the canonical
// still points at livdar.com, so even an indexed page would consolidate to production.

import { renderToStaticMarkup } from 'react-dom/server.browser';
import AtlasPage from '../../components/atlas/AtlasPage.jsx';
import HubPage from './pages/HubPage.jsx';
import DirectoryPage from './pages/DirectoryPage.jsx';
import { setLocales } from './shims/serve-pages.js';
import { ui } from '../../lib/content/index.js';
import { localeDir, getLocale } from '../../lib/i18n.js';
import { CONSENT_DEFAULT } from '../../lib/analytics.js';
import ConsentBanner from '../../components/ConsentBanner.jsx';
import { island, beginIslands, islandsReferencedModel } from './islands/server.jsx';
import { ASSETS } from './assets.generated.js';

// The consent banner lives in the layout in Next.js, not in any page, so no import of it
// is intercepted by the island plugin. It is wrapped here instead, by hand.
const ConsentIsland = island('ConsentBanner', ConsentBanner);

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// A </script> inside JSON would close the tag it sits in. JSON.stringify does not escape
// it, so this does, the same way Next.js does for its own inline JSON.
const jsonForScript = (value) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

/** The stylesheet and the islands script, content-addressed by cloudflare/build.mjs so
 *  each can be cached for a year: a new build is a new URL, never a stale file. */
export const STYLESHEETS = [ASSETS.css.path];
export const ISLANDS_SCRIPT = ASSETS.islands.path;

// The tag container and Clarity snippets, verbatim from app/[lang]/layout.jsx, where
// next/script prints them with strategy="afterInteractive". They are printed only when an
// id is passed, and the Worker passes ids only in production on livdar.com, so a staging
// page cannot report into production analytics.
const gtmSnippet = (id) => `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(id)});`;
const claritySnippet = (id) => `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",${JSON.stringify(id)});`;

function headHtml(record, { noindex }) {
  const h = record.head;
  const locale = record.locale;
  const out = [];
  out.push('<meta charSet="utf-8"/>'.replace('charSet', 'charset'));
  out.push('<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>');
  out.push('<title>' + esc(h.title) + '</title>');
  out.push('<meta name="description" content="' + esc(h.description) + '"/>');
  out.push('<meta name="application-name" content="Livdar"/>');
  out.push('<meta name="format-detection" content="telephone=no"/>');
  out.push('<meta name="theme-color" media="(prefers-color-scheme: light)" content="#fbfaf8"/>');
  out.push('<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0f1113"/>');
  // Canonical and hreflang, byte-identical to what Vercel serves: absolute livdar.com
  // URLs computed by the exporter from lib/seo.js. A staging copy that rewrote these to
  // its own host would be a second site claiming the same content.
  out.push('<link rel="canonical" href="' + esc(h.canonical) + '"/>');
  for (const [hreflang, href] of Object.entries(h.hreflang || {})) {
    out.push('<link rel="alternate" hreflang="' + esc(hreflang) + '" href="' + esc(href) + '"/>');
  }
  out.push('<meta name="robots" content="' + (noindex ? 'noindex, nofollow' : 'index, follow') + '"/>');
  const og = h.og || {};
  out.push('<meta property="og:title" content="' + esc(og.title) + '"/>');
  out.push('<meta property="og:description" content="' + esc(og.description) + '"/>');
  out.push('<meta property="og:url" content="' + esc(og.url) + '"/>');
  out.push('<meta property="og:site_name" content="' + esc(og.siteName) + '"/>');
  out.push('<meta property="og:locale" content="' + esc(og.locale) + '"/>');
  out.push('<meta property="og:type" content="' + esc(og.type) + '"/>');
  if (og.image) {
    out.push('<meta property="og:image" content="' + esc(og.image.url) + '"/>');
    out.push('<meta property="og:image:width" content="' + esc(og.image.width) + '"/>');
    out.push('<meta property="og:image:height" content="' + esc(og.image.height) + '"/>');
    out.push('<meta property="og:image:alt" content="' + esc(og.image.alt) + '"/>');
  }
  const tw = h.twitter || {};
  out.push('<meta name="twitter:card" content="' + esc(tw.card) + '"/>');
  out.push('<meta name="twitter:title" content="' + esc(tw.title) + '"/>');
  out.push('<meta name="twitter:description" content="' + esc(tw.description) + '"/>');
  if (tw.image) out.push('<meta name="twitter:image" content="' + esc(tw.image) + '"/>');
  // The preconnects and the web font, from app/[lang]/layout.jsx.
  out.push('<link rel="preconnect" href="https://fonts.googleapis.com"/>');
  out.push('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/>');
  out.push('<link rel="preconnect" href="https://images.unsplash.com" crossorigin="anonymous"/>');
  out.push('<link rel="dns-prefetch" href="https://images.unsplash.com"/>');
  out.push('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&amp;display=swap"/>');
  for (const href of STYLESHEETS) out.push('<link rel="stylesheet" href="' + esc(href) + '"/>');
  // Consent defaults are written before anything else can run, exactly as the layout does.
  const consentBoot = [
    'window.dataLayer=window.dataLayer||[];',
    'function gtag(){dataLayer.push(arguments);}',
    'gtag("consent","default",' + jsonForScript(CONSENT_DEFAULT) + ');',
    'gtag("set","ads_data_redaction",true);',
    'gtag("set","url_passthrough",true);',
  ].join('');
  out.push('<script>' + consentBoot + '</script>');
  void locale;
  return out.join('');
}

const BODIES = {
  data: (record) => <AtlasPage model={record.model} alternatePaths={record.alternatePaths} />,
  hub: (record) => <HubPage record={record} />,
  directory: (record) => <DirectoryPage record={record} />,
};

/**
 * The complete HTML document for one exported page record.
 *
 * `locales` comes from the dataset manifest and is pushed into the serve-pages shim
 * before rendering, because Header and Footer ask languagesServed() which languages
 * exist in order to decide which links to print. Passing it per render rather than
 * baking it in means a new language ships with a re-export, not a Worker deploy.
 */
export function renderDocument(record, { locales, noindex = true, gtmId = '', clarityId = '' } = {}) {
  setLocales(locales || []);
  const build = BODIES[record.kind];
  if (!build) throw new Error('Unknown Atlas page kind: ' + record.kind);
  const locale = getLocale(record.locale) ? record.locale : 'en';
  const t = ui(locale);
  // JSON-LD is NOT printed here. AtlasPage ends with <JsonLd data={atlasSchema(model)} />
  // and prints the graph at the end of <body>, which is where production prints it; a
  // copy in <head> as well would put two application/ld+json blocks on every data page
  // and make the staging markup differ from livdar.com for no gain. The exporter's
  // record.jsonld is the same graph, kept for QA to assert against without parsing HTML.
  beginIslands(record.kind === 'data' ? record.model : null);
  const body = renderToStaticMarkup(build(record));
  // The banner after the page, where the layout puts it.
  const consent = renderToStaticMarkup(<ConsentIsland strings={t} />);
  // The model, once, for the islands that take it or one of its fields as a prop.
  const modelJson = islandsReferencedModel()
    ? '<script type="application/json" id="atlas-model">' + jsonForScript(record.model) + '</script>'
    : '';
  const analytics = (gtmId ? '<script id="livdar-gtm">' + gtmSnippet(gtmId) + '</script>' : '')
    + (clarityId ? '<script id="livdar-clarity">' + claritySnippet(clarityId) + '</script>' : '');
  return '<!DOCTYPE html><html lang="' + esc(record.locale) + '" dir="' + esc(localeDir(locale)) + '">'
    + '<head>' + headHtml(record, { noindex }) + '</head>'
    + '<body><a class="skip" href="#main">' + esc(t.skipToContent) + '</a>'
    + body
    + consent
    + modelJson
    // type=module is deferred by definition: it runs after parsing, before
    // DOMContentLoaded, and never blocks the first paint of the server HTML.
    + '<script type="module" src="' + esc(ISLANDS_SCRIPT) + '"></script>'
    + analytics
    + '</body></html>';
}
