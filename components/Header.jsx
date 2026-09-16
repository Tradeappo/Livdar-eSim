import LanguageGlobe from './LanguageGlobe.jsx';
import { ui } from '../lib/content/index.js';
import { routes } from '../lib/routes.js';
import { LOCALES, isLive } from '../lib/i18n.js';

// Language options are built per page. Where the current page exists in another
// language, the globe points at that exact page. Where it does not, it points at
// that language's eSIM hub. There is no path through this component that can
// produce a link to a page that was never published.

export default function Header({ locale, alternatePaths = {} }) {
  const t = ui(locale);
  const options = LOCALES.filter((l) => isLive(l.code)).map((l) => ({
    code: l.code,
    name: l.name,
    endonym: l.endonym,
    href: alternatePaths[l.code] || routes.esimHub(l.code),
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
