import Script from 'next/script';
import { routes } from '../lib/routes.js';
import { V41_FOOTER, V41_MARKETPLACE_MARKUP, V41_VERSION } from '../lib/v41-source.js';

// The supplied V41 file is the visual source of truth. It is intentionally
// read and rendered directly instead of being translated into another design
// system. That preserves its exact markup, CSS cascade, responsive rules,
// images, section order and browser behaviour.
function localize(markup, locale) {
  return markup
    .replace('<html lang="en">', `<html lang="${locale}">`)
    .replace('<a data-i18n="allDestinations" href="#">', `<a data-i18n="allDestinations" href="${routes.esimHub(locale)}">`)
    .replace('<a data-i18n="footerPlans" href="#">', `<a data-i18n="footerPlans" href="${routes.esimHub(locale)}">`)
    .replace('<a data-i18n="navDestinations" href="#">', `<a data-i18n="navDestinations" href="${routes.esimHub(locale)}#destinations">`)
    .replace('<a data-i18n="navRegions" href="#">', `<a data-i18n="navRegions" href="${routes.regionsHub(locale)}">`)
    .replace('<a data-i18n="navHow" href="#">', `<a data-i18n="navHow" href="${routes.guide(locale, 'how-esim-works')}">`)
    .replace('<a data-i18n="compatibility" href="#">', `<a data-i18n="compatibility" href="${routes.compatibility(locale)}">`)
    .replace('<a data-i18n="navGuides" href="#">', `<a data-i18n="navGuides" href="${routes.guidesHub(locale)}">`)
    .replace('<a data-i18n="privacy" href="#">', `<a data-i18n="privacy" href="${routes.privacy(locale)}">`)
    .replace('<a data-i18n="cookies" href="#">', `<a data-i18n="cookies" href="${routes.cookies(locale)}">`);
}

export default function V41Marketplace({ locale, h1, children }) {
  return (
    <>
      <link rel="stylesheet" href={`/v41.css?v=${V41_VERSION}`} />
      <h1 className="sr-only">{h1}</h1>
      <div className="v41-marketplace" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: localize(V41_MARKETPLACE_MARKUP, locale) }} />
      {children}
      {V41_FOOTER ? <div className="v41-marketplace v41-marketplace-footer" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: localize(V41_FOOTER, locale) }} /> : null}
      <Script src="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js" strategy="afterInteractive" />
      <Script id={`v41-runtime-${locale}`} src={`/v41-runtime.js?v=${V41_VERSION}`} data-locale={locale} strategy="afterInteractive" />
    </>
  );
}
