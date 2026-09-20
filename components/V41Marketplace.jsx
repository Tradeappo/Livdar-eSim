import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Script from 'next/script';
import { routes } from '../lib/routes.js';

// The supplied V41 file is the visual source of truth. It is intentionally
// read and rendered directly instead of being translated into another design
// system. That preserves its exact markup, CSS cascade, responsive rules,
// images, section order and browser behaviour.
const SOURCE = readFileSync(join(process.cwd(), 'source', 'livdar-esim-v41.source'), 'utf8');
const HEAD = SOURCE.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] || '';
const BODY = SOURCE.split(/<body[^>]*>/i)[1] || '';
const STYLES = [...HEAD.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((match) => match[1]).join('\n');
const INLINE_SCRIPTS = [...SOURCE.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]);
const MARKUP = BODY.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
const FOOTER = MARKUP.match(/<footer class="footer-card" id="guides">[\s\S]*?<\/footer>/i)?.[0] || '';
const MARKETPLACE_MARKUP = FOOTER ? MARKUP.replace(FOOTER, '') : MARKUP;

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
  const localeBoot = `try{localStorage.setItem("livdarLang",${JSON.stringify(locale)})}catch(e){};document.documentElement.lang=${JSON.stringify(locale)};`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <h1 className="sr-only">{h1}</h1>
      <div className="v41-marketplace" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: localize(MARKETPLACE_MARKUP, locale) }} />
      {children}
      {FOOTER ? <div className="v41-marketplace v41-marketplace-footer" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: localize(FOOTER, locale) }} /> : null}
      <Script src="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js" strategy="afterInteractive" />
      <Script id={`v41-locale-${locale}`} strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: localeBoot }} />
      {INLINE_SCRIPTS.map((code, index) => (
        <Script key={index} id={`v41-runtime-${index}`} strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: code }} />
      ))}
      <Script id="v41-dom-ready" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: 'document.dispatchEvent(new Event("DOMContentLoaded"));' }} />
    </>
  );
}
