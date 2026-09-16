import LanguageGlobe from './LanguageGlobe.jsx';
import { ui } from '../lib/content/index.js';
import { routes } from '../lib/routes.js';
import { publishedMarkets } from '../lib/markets.js';

// Language options are built per page from the published market list, not from
// a hand maintained array. A market appears here the moment its content is
// complete and disappears the moment it is not, so the selector cannot offer a
// language whose pages do not exist.
//
// Where the current page exists in another language, the globe points at that
// exact page. Where it does not, it points at that language's eSIM hub. There is
// no path through this component that can produce a link to a page that was
// never published.

export default function Header({ locale, alternatePaths = {} }) {
  const t = ui(locale);
  const options = publishedMarkets().map((m) => ({
    code: m.code,
    name: m.name,
    endonym: m.endonym,
    href: alternatePaths[m.code] || routes.esimHub(m.code),
  }));

  return (
    <header className="site-header">
      <div className="wrap header-row">
        <a className="brand" href={routes.home(locale)}>
          <span className="brand-mark" aria-hidden="true" />
          <span>Livdar</span>
          <span className="brand-sub">eSIM</span>
        </a>
        <nav className="main-nav" aria-label="Main">
          <a href={routes.esimHub(locale)}>{t.nav.esim}</a>
          <a href={routes.regionsHub(locale)}>{t.nav.regions}</a>
          <a href={routes.guidesHub(locale)}>{t.nav.guides}</a>
          <a href={routes.compatibility(locale)}>{t.nav.compatibility}</a>
        </nav>
        <div className="header-tools">
          <LanguageGlobe current={locale} options={options} label={t.languageSwitch} />
        </div>
      </div>
    </header>
  );
}
