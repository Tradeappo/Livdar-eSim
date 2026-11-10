// The country hub, rendered from its exported model.
//
// A line-for-line port of the body of app/[lang]/atlas/[country]/page.jsx. The route
// file cannot be imported directly because it calls notFound(), hubBySlug() and
// hubModel(), all of which need either next/navigation or the cohort manifests. The
// decisions those made are already made: the exporter ran hubModel() and wrote the
// result, so this renders it and nothing else.
//
// tests/atlas-cloudflare-parity.test.mjs asserts this tree matches the route's.

import Header from '../../../components/Header.jsx';
import Footer from '../../../components/Footer.jsx';

export default function HubPage({ record }) {
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
            <a href={'/' + lang + '/atlas/'}>Atlas</a>
            {' / '}
            <span>{m.name}</span>
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
