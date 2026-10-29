// Crawl directory for the published Atlas cohort.
//
// This is intentionally a real HTML directory, not a hidden SEO page. Every
// published Atlas page in the current market is linked from here, grouped by
// the section its URL already sits under, and every site footer links back
// here. That gives Google a stable crawl path that does not depend on sitemap
// discovery alone.

import { notFound } from 'next/navigation';
import '../../atlas.css';
import Header from '../../../components/Header.jsx';
import Footer from '../../../components/Footer.jsx';
import { buildMetadata } from '../../../lib/seo.js';
import { pages, languagesServed } from '../../../lib/atlas/serve-pages.js';
import { sectionOf, sectionHeading, sectionKeys } from '../../../lib/atlas/sections.js';
import { isPublished } from '../../../lib/markets.js';
import { getLocale } from '../../../lib/i18n.js';
import { hubsFor, TEXT as HUB_TEXT } from '../../../lib/atlas/country-hubs.js';

export const dynamicParams = false;
export const revalidate = 86400;

function pathFor(lang) {
  return '/' + lang + '/atlas/';
}

function alternatePaths() {
  const out = {};
  for (const lang of languagesServed()) out[lang] = pathFor(lang);
  return out;
}

function metadataAlternates() {
  const out = alternatePaths();
  if (out.en) out['x-default'] = out.en;
  return out;
}

export function generateStaticParams() {
  return languagesServed().map((lang) => ({ lang }));
}

export async function generateMetadata({ params }) {
  const { lang } = await params;
  if (!languagesServed().includes(lang)) {
    return { title: 'Not found', robots: { index: false, follow: false } };
  }
  return buildMetadata({
    title: 'Livdar Atlas',
    description: 'Livdar Atlas',
    path: pathFor(lang),
    locale: lang,
    alternates: metadataAlternates(),
    robots: { index: true, follow: true },
  });
}

export default async function AtlasDirectoryPage({ params }) {
  const { lang } = await params;
  // A locale with no published pages has no directory. generateStaticParams already
  // excludes it, so this only fires if the two ever disagree, and a 404 is the honest
  // answer. Returning null rendered an empty page under a 200, which is worse than
  // missing: a crawler reads it as a real page with nothing on it.
  if (!languagesServed().includes(lang)) notFound();
  const all = pages().filter((p) => p.locale === lang);
  if (!all.length) notFound();

  // A city weather page whose country has a hub is listed on that hub, and the hub is listed
  // here, instead of all of them here: 1,251 city links on one page passed almost nothing to
  // each. Every other page, and every city of a country with no hub, is still listed directly,
  // so no published page loses its link from the directory.
  const hubs = hubsFor(lang).slice().sort((a, b) => a.name.localeCompare(b.name, lang));
  const onHub = new Set(hubs.flatMap((h) => h.cities.map((p) => p.path)));

  // Grouped by URL section, in the order the vocabulary declares them, so the directory
  // reads the same way in every language instead of re-sorting itself per alphabet.
  const bySection = new Map();
  for (const page of all) {
    if (onHub.has(page.path)) continue;
    const key = sectionOf(page.path);
    if (!key) continue;
    if (!bySection.has(key)) bySection.set(key, []);
    bySection.get(key).push(page);
  }
  const sections = sectionKeys()
    .filter((key) => bySection.has(key))
    .map((key) => ({
      key,
      heading: sectionHeading(lang, key),
      rows: bySection.get(key).sort((a, b) => a.h1.localeCompare(b.h1, lang)),
    }));

  // The breadcrumb root. /es/ and its six siblings redirect to /en/, because those locales
  // publish Atlas pages and no eSIM market, so linking "Livdar" there put a redirect in the
  // first link of every directory. Where the market exists the crumb links to it; where it
  // does not, the directory IS the root of the Atlas in that language and the crumb says so
  // without pretending to be a link.
  const home = isPublished(lang) ? '/' + lang + '/' : null;

  const others = languagesServed()
    .filter((l) => l !== lang)
    .map((l) => ({ lang: l, href: pathFor(l), endonym: getLocale(l)?.endonym || l }));

  return (
    <>
      <Header locale={lang} alternatePaths={alternatePaths()} />
      <main id="main" className="atlas">
        <div className="wrap atlas-wrap">
          <nav className="atlas-crumbs" aria-label="Breadcrumb">
            {home ? <a href={home}>Livdar</a> : <span>Livdar</span>}
            {' / '}
            <span>Atlas</span>
          </nav>
          <h1>Livdar Atlas</h1>
          {/* The directories link to each other, and that is what makes the seven
              Atlas-only languages reachable at all. Their own pages link up to their
              directory, and the directory lists them back, but nothing outside that island
              reached it: only /en/atlas/ and /de/atlas/ are linked from a locale whose
              footer a crawler arrives at. hreflang already annotates the set, and an
              annotation is a hint; this is a link. */}
          {others.length ? (
            <nav className="atlas-languages" aria-label="Atlas languages">
              <ul className="atlas-links">
                {others.map((o) => (
                  <li key={o.lang}>
                    <a href={o.href} hrefLang={o.lang}>{o.endonym}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
          {hubs.length ? (
            <section className="atlas-section">
              <h2>{HUB_TEXT[lang].directory}</h2>
              <ul className="atlas-links">
                {hubs.map((h) => (
                  <li key={h.path}>
                    <a href={h.path}>{h.name}</a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {sections.map((section) => (
            <section className="atlas-section" key={section.key}>
              <h2>{section.heading}</h2>
              <ul className="atlas-links">
                {section.rows.map((page) => (
                  <li key={page.path}>
                    <a href={page.path}>{page.h1}</a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <Footer locale={lang} />
    </>
  );
}
