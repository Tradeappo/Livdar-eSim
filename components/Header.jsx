import LanguageGlobe from './LanguageGlobe.jsx';
import { ui } from '../lib/content/index.js';
import { routes } from '../lib/routes.js';
import { publishedMarkets, isPublished } from '../lib/markets.js';
import { languagesServed } from '../lib/atlas/serve-pages.js';

// Language options are built per page from the published market list, not from
// a hand maintained array. A market appears here the moment its content is
// complete and disappears the moment it is not, so the selector cannot offer a
// language whose pages do not exist.
//
// Where the current page exists in another language, the globe points at that
// exact page. Where it does not, it points at that language's eSIM hub. There is
// no path through this component that can produce a link to a page that was
// never published.
//
// THE SAME RULE NOW APPLIES TO THE NAVIGATION ITSELF. Seven locales publish Atlas pages and
// no eSIM market, and this header rendered the eSIM nav on all of them: /es/, /es/esim/,
// /es/regiones/, /es/guias/ and /es/compatibilidad/ were five links to a 307 on every one of
// the 328 Atlas pages in those languages, and ui() falls back to English for them, so they
// were five English labels on a Spanish page as well. A locale is offered the eSIM site only
// where the eSIM site exists in it; otherwise the header carries the one surface that does,
// which is that language's Atlas directory.

export default function Header({ locale, alternatePaths = {}, section = null }) {
  const t = ui(locale);
  const esim = isPublished(locale);
  const atlas = languagesServed().includes(locale);
  // The root of the site in this language: the eSIM home where there is one, the Atlas
  // directory where the Atlas is all that is published, and nothing to link to otherwise.
  const root = esim ? routes.home(locale) : atlas ? '/' + locale + '/atlas/' : null;
  const options = publishedMarkets().map((m) => ({
    code: m.code,
    name: m.name,
    endonym: m.endonym,
    href: alternatePaths[m.code] || routes.esimHub(m.code),
  }));

  // aria-current is what tells a screen reader which of five links is the page
  // it is already on, and it is what the underline in the stylesheet hangs off,
  // so the visible state and the announced state cannot drift apart.
  const current = (key) => (section === key ? 'page' : undefined);

  return (
    <header className="site-header">
      <div className="wrap header-row">
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
        <nav className="main-nav" aria-label="Main">
          {esim ? (
            <>
              <a href={routes.esimHub(locale)} aria-current={current('esim')}>{t.nav.esim}</a>
              <a href={routes.regionsHub(locale)} aria-current={current('regions')}>{t.nav.regions}</a>
              <a href={routes.guidesHub(locale)} aria-current={current('guides')}>{t.nav.guides}</a>
              <a href={routes.compatibility(locale)} aria-current={current('compatibility')}>{t.nav.compatibility}</a>
            </>
          ) : null}
          {atlas ? <a href={'/' + locale + '/atlas/'} aria-current={current('atlas')}>Atlas</a> : null}
        </nav>
        <div className="header-tools">
          <LanguageGlobe current={locale} options={options} label={t.languageSwitch} />
        </div>
      </div>
    </header>
  );
}
