// The Atlas crawl directory, rendered from its exported model.
//
// A port of the body of app/[lang]/atlas/page.jsx. The grouping it used to do at render
// time (filter the 6,500 pages by locale, drop the ones a country hub already lists,
// bucket the rest by URL section, sort each bucket by h1 in the locale's collation) is
// done once by the exporter, because doing it in a Worker would mean shipping the whole
// catalogue to the edge to render one page. The order is therefore the order the export
// computed with the same Intl collator, not a re-sort here.

import Header from '../../../components/Header.jsx';
import Footer from '../../../components/Footer.jsx';

export default function DirectoryPage({ record }) {
  const m = record.model;
  const lang = record.locale;
  return (
    <>
      <Header locale={lang} alternatePaths={record.alternatePaths} />
      <main id="main" className="atlas">
        <div className="wrap atlas-wrap">
          <nav className="atlas-crumbs" aria-label="Breadcrumb">
            {m.home ? <a href={m.home}>Livdar</a> : <span>Livdar</span>}
            {' / '}
            <span>Atlas</span>
          </nav>
          <h1>Livdar Atlas</h1>
          {m.others.length ? (
            <nav className="atlas-languages" aria-label="Atlas languages">
              <ul className="atlas-links">
                {m.others.map((o) => (
                  <li key={o.lang}>
                    <a href={o.href} hrefLang={o.lang}>{o.endonym}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
          {m.hubs.length ? (
            <section className="atlas-section">
              <h2>{m.hubsHeading}</h2>
              <ul className="atlas-links">
                {m.hubs.map((h) => (
                  <li key={h.path}><a href={h.path}>{h.name}</a></li>
                ))}
              </ul>
            </section>
          ) : null}
          {m.sections.map((section) => (
            <section className="atlas-section" key={section.key}>
              <h2>{section.heading}</h2>
              <ul className="atlas-links">
                {section.rows.map((page) => (
                  <li key={page.path}><a href={page.path}>{page.h1}</a></li>
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
