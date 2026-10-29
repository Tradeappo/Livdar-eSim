// A country hub of the Atlas: the country's cities compared on their own facts, and the
// country's other published pages. See lib/atlas/country-hubs.js for why it exists and why
// every number on it is copied from a published page.

import { notFound } from 'next/navigation';
import '../../../atlas.css';
import Header from '../../../../components/Header.jsx';
import Footer from '../../../../components/Footer.jsx';
import { buildMetadata } from '../../../../lib/seo.js';
import { isPublished } from '../../../../lib/markets.js';
import { allHubs, hubBySlug, hubAlternates, hubModel } from '../../../../lib/atlas/country-hubs.js';

export const dynamicParams = false;
export const revalidate = 86400;

export function generateStaticParams() {
  return Object.entries(allHubs()).flatMap(([lang, byIso]) =>
    Object.values(byIso).map((h) => ({ lang, country: h.slug })));
}

function alternatesFor(hub) {
  const out = hubAlternates(hub.iso2);
  if (out.en) out['x-default'] = out.en;
  return out;
}

export async function generateMetadata({ params }) {
  const { lang, country } = await params;
  const hub = hubBySlug(lang, country);
  if (!hub) return { title: 'Not found', robots: { index: false, follow: false } };
  const m = hubModel(lang, hub);
  return buildMetadata({
    title: m.title,
    description: m.description,
    path: hub.path,
    locale: lang,
    alternates: alternatesFor(hub),
    robots: { index: true, follow: true },
  });
}

export default async function AtlasCountryHub({ params }) {
  const { lang, country } = await params;
  const hub = hubBySlug(lang, country);
  if (!hub) notFound();
  const m = hubModel(lang, hub);
  const home = isPublished(lang) ? '/' + lang + '/' : null;

  return (
    <>
      <Header locale={lang} alternatePaths={hubAlternates(hub.iso2)} />
      <main id="main" className="atlas">
        <div className="wrap atlas-wrap">
          <nav className="atlas-crumbs" aria-label="Breadcrumb">
            {home ? <a href={home}>Livdar</a> : <span>Livdar</span>}
            {' / '}
            <a href={'/' + lang + '/atlas/'}>Atlas</a>
            {' / '}
            <span>{hub.name}</span>
          </nav>
          <h1>{m.h1}</h1>
          <p>{m.intro}</p>
          <section className="atlas-section">
            <h2>{m.citiesHeading}</h2>
            <div className="atlas-table">
              <table>
                <thead><tr>{m.head.map((h, i) => <th key={i} scope="col">{h}</th>)}</tr></thead>
                <tbody>
                  {m.rows.map((r) => (
                    <tr key={r.href}>
                      {r.cells.map((c, j) => <td key={j}>{j === 0 ? <a href={r.href}>{c}</a> : c}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          {m.others.length ? (
            <section className="atlas-section">
              <h2>{m.otherHeading}</h2>
              <ul className="atlas-links">
                {m.others.map((o) => <li key={o.href}><a href={o.href}>{o.text}</a></li>)}
              </ul>
            </section>
          ) : null}
        </div>
      </main>
      <Footer locale={lang} />
    </>
  );
}
