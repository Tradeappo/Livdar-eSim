import { ui, legalContent } from '../lib/content/index.js';
import { routes } from '../lib/routes.js';
import { DESTINATION_COUNT } from '../lib/destinations.js';
import { publishedMarkets, isPublished } from '../lib/markets.js';
import { languagesServed } from '../lib/atlas/serve-pages.js';

// Every link here is conditional on the surface existing in this locale, and that rule was
// learned twice. First from /privacy/ and /cookies/, linked unconditionally, which put two
// links to a 404 on all eighty five pages. Then from the eSIM columns and the Atlas link:
// seven locales publish Atlas pages and no eSIM market, so this footer pointed at /es/,
// /es/esim/, /es/regiones/, /es/guias/, /es/guias/how-esim-works/, /es/guias/esim-vs-roaming/
// and /es/compatibilidad/ from all 328 Atlas pages in those languages, every one a 307; and
// ro publishes the eSIM site and no Atlas pages, so the Atlas link was a 404 on all 32 of
// them. Those are 2,656 link instances a crawler had to follow to learn nothing.
export default function Footer({ locale }) {
  const t = ui(locale);
  const langs = publishedMarkets().length;
  const esim = isPublished(locale);
  const atlas = languagesServed().includes(locale);
  const root = esim ? routes.home(locale) : atlas ? '/' + locale + '/atlas/' : null;

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-cols">
          <div>
            {root ? (
              <a className="brand" href={root}>
                <span className="brand-mark" aria-hidden="true" />
                <span>Livdar</span>
                {esim ? <span className="brand-sub">eSIM</span> : null}
              </a>
            ) : (
              <span className="brand">
                <span className="brand-mark" aria-hidden="true" />
                <span>Livdar</span>
              </span>
            )}
            {esim ? (
              <p className="footer-note" style={{ marginTop: 12 }}>
                {DESTINATION_COUNT} {t.destinationsCount}, {langs} {t.languagesCount}.
              </p>
            ) : null}
          </div>
          {esim || atlas ? (
            <div>
              <h4>{t.footerProduct}</h4>
              <ul>
                {esim ? <li><a href={routes.esimHub(locale)}>{t.nav.esim}</a></li> : null}
                {esim ? <li><a href={routes.regionsHub(locale)}>{t.nav.regions}</a></li> : null}
                {esim ? <li><a href={routes.compatibility(locale)}>{t.nav.compatibility}</a></li> : null}
                {atlas ? <li><a href={'/' + locale + '/atlas/'}>Atlas</a></li> : null}
              </ul>
            </div>
          ) : null}
          {esim ? (
            <div>
              <h4>{t.nav.guides}</h4>
              <ul>
                <li><a href={routes.guidesHub(locale)}>{t.nav.guides}</a></li>
                <li><a href={routes.guide(locale, 'how-esim-works')}>{t.howItWorks}</a></li>
                <li><a href={routes.guide(locale, 'esim-vs-roaming')}>{t.compareOptions}</a></li>
              </ul>
            </div>
          ) : null}
          {/* Linked only where the page exists. The footer used to point at
              /privacy/ and /cookies/ unconditionally, which put two links to a
              404 on all eighty five pages. */}
          {legalContent(locale, 'privacy') || legalContent(locale, 'cookies') ? (
            <div>
              <h4>{t.footerLegal}</h4>
              <ul>
                {legalContent(locale, 'privacy') ? (
                  <li><a href={routes.privacy(locale)}>{t.privacy}</a></li>
                ) : null}
                {legalContent(locale, 'cookies') ? (
                  <li><a href={routes.cookies(locale)}>{t.cookies}</a></li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </div>
        <p className="footer-note">
          Livdar eSIM is in an early phase. Plans are not on sale yet and nothing on this site takes
          payment. Coverage notes describe the networks that operate in each country, not the
          coverage of any particular plan.
        </p>
      </div>
    </footer>
  );
}
