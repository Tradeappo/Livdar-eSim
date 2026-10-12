// Crawl directory for the published Atlas cohort.
//
// This is intentionally a real HTML directory, not a hidden SEO page. Every
// published Atlas page in the current market is linked from here, grouped by
// family, and every site footer links back here. That gives Google a stable
// crawl path that does not depend on sitemap discovery alone.

import '../../atlas.css';
import Header from '../../../components/Header.jsx';
import Footer from '../../../components/Footer.jsx';
import { buildMetadata } from '../../../lib/seo.js';
import { pages, languagesServed } from '../../../lib/atlas/serve-pages.js';

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

function familyLabel(rows, family) {
  return family
    .replace(/[.-]+/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

export default async function AtlasDirectoryPage({ params }) {
  const { lang } = await params;
  const all = pages().filter((p) => p.locale === lang);
  if (!all.length) return null;

  const byFamily = new Map();
  for (const page of all) {
    if (!byFamily.has(page.family)) byFamily.set(page.family, []);
    byFamily.get(page.family).push(page);
  }
  for (const rows of byFamily.values()) rows.sort((a, b) => a.h1.localeCompare(b.h1, lang));

  return (
    <>
      <Header locale={lang} alternatePaths={alternatePaths()} />
      <main id="main" className="atlas">
        <div className="wrap atlas-wrap">
          <nav className="atlas-crumbs" aria-label="Breadcrumb">
            <a href={'/' + lang + '/'}>Livdar</a>
            {' / '}
            <span>Atlas</span>
          </nav>
          <h1>Livdar Atlas</h1>
          {[...byFamily.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([family, rows]) => (
              <section className="atlas-section" key={family}>
                <h2>{familyLabel(all, family)}</h2>
                <ul className="atlas-links">
                  {rows.map((page) => (
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
