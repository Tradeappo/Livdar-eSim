import { ui, legalContent } from '../lib/content/index.js';
import { routes } from '../lib/routes.js';
import { DESTINATION_COUNT } from '../lib/destinations.js';
import { publishedMarkets } from '../lib/markets.js';

export default function Footer({ locale }) {
  const t = ui(locale);
  const langs = publishedMarkets().length;

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-cols">
          <div>
            <a className="brand" href={routes.home(locale)}>
              <span className="brand-mark" aria-hidden="true" />
              <span>Livdar</span>
              <span className="brand-sub">eSIM</span>
            </a>
            <p className="footer-note" style={{ marginTop: 12 }}>
              {DESTINATION_COUNT} {t.destinationsCount}, {langs} {t.languagesCount}.
            </p>
          </div>
          <div>
            <h4>{t.footerProduct}</h4>
            <ul>
              <li><a href={routes.esimHub(locale)}>{t.nav.esim}</a></li>
              <li><a href={routes.regionsHub(locale)}>{t.nav.regions}</a></li>
              <li><a href={routes.compatibility(locale)}>{t.nav.compatibility}</a></li>
            </ul>
          </div>
          <div>
            <h4>{t.nav.guides}</h4>
            <ul>
              <li><a href={routes.guidesHub(locale)}>{t.nav.guides}</a></li>
              <li><a href={routes.guide(locale, 'how-esim-works')}>{t.howItWorks}</a></li>
              <li><a href={routes.guide(locale, 'esim-vs-roaming')}>{t.compareOptions}</a></li>
            </ul>
          </div>
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
