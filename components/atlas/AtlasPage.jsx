// Renders an Atlas page model. This component is the only piece the new design
// replaces: the model (content, URLs, canonical, links, schema) stays the same.

import Header from '../Header.jsx';
import Footer from '../Footer.jsx';
import JsonLd from '../JsonLd.jsx';
import { atlasSchema } from '../../lib/atlas/schema.js';

const L = {
  questions: { en: 'Questions', de: 'Fragen', ro: 'Întrebări' },
  related: { en: 'Related pages', de: 'Weitere Seiten', ro: 'Pagini înrudite' },
  sources: { en: 'Sources', de: 'Quellen', ro: 'Surse' },
  crumbs: { en: 'Breadcrumb', de: 'Brotkrumen', ro: 'Navigare' },
};

export default function AtlasPage({ model, alternatePaths }) {
  const l = model.locale;
  // The eSIM families carry their labels in the table above; the Atlas data
  // families carry theirs on the model, because they exist in nine languages
  // and a table here would be a second place for the same nine strings to
  // drift apart. A model with labels wins; anything else falls back.
  const t = (key) => model.labels?.[key] || L[key]?.[l] || L[key]?.en;
  return (
    <>
      <Header locale={l} alternatePaths={alternatePaths} />
      <main id="main" className="atlas">
        <div className="wrap atlas-wrap">
          <nav className="atlas-crumbs" aria-label={t('crumbs')}>
            <a href={'/' + l + '/'}>Livdar</a>
            {model.breadcrumbs.map((b, i) => (
              <span key={i}>
                {' / '}
                {b.href && i < model.breadcrumbs.length - 1 ? <a href={b.href}>{b.name}</a> : <span>{b.name}</span>}
              </span>
            ))}
          </nav>
          <h1>{model.h1}</h1>
          {model.facts.length ? (
            <dl className="atlas-facts">
              {model.facts.map((f, i) => (
                <div key={i}><dt>{f.label}</dt><dd>{f.value}</dd></div>
              ))}
            </dl>
          ) : null}
          {model.sections.map((s, si) => (
            <section key={s.id || si} className="atlas-section">
              {s.heading ? <h2>{s.heading}</h2> : null}
              {s.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            </section>
          ))}
          {model.table ? (
            <section className="atlas-section">
              <h2>{model.table.caption}</h2>
              <div className="atlas-table">
                <table>
                  <thead><tr>{model.table.head.map((h, i) => <th key={i} scope="col">{h}</th>)}</tr></thead>
                  <tbody>
                    {model.table.rows.map((r, i) => (
                      <tr key={i} className={r.current ? 'current' : undefined} aria-current={r.current ? 'true' : undefined}>
                        {r.cells.map((c, j) => <td key={j}>{j === 0 && r.href ? <a href={r.href}>{c}</a> : c}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
          {model.faq.length ? (
            <section className="atlas-section">
              <h2>{t('questions')}</h2>
              {model.faq.map((q, i) => (
                <details key={i} open><summary>{q.q}</summary><p>{q.a}</p></details>
              ))}
            </section>
          ) : null}
          {model.links.length ? (
            <section className="atlas-section">
              <h2>{t('related')}</h2>
              <ul className="atlas-links">{model.links.map((x, i) => <li key={i}><a href={x.href}>{x.text}</a></li>)}</ul>
            </section>
          ) : null}
          {model.sources.length ? (
            <section className="atlas-section atlas-sources">
              <h2>{t('sources')}</h2>
              <ul>{model.sources.map((s, i) => <li key={i}>{s.attribution}{s.retrievedAt ? ' (' + s.retrievedAt.slice(0, 10) + ')' : ''}</li>)}</ul>
            </section>
          ) : null}
        </div>
      </main>
      <Footer locale={l} />
      <JsonLd data={atlasSchema(model)} />
    </>
  );
}
