import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

// Parse the supplied artifact once and expose its original parts. The visual
// source remains untouched; CSS and runtime are served as cacheable assets so
// they are not duplicated into every page's HTML and RSC payload.
export const V41_SOURCE = readFileSync(join(process.cwd(), 'source', 'livdar-esim-v41.source'), 'utf8');
export const V41_VERSION = createHash('sha256').update(V41_SOURCE).digest('hex').slice(0, 12);
// Decorative background photographs in the V41 artifact were inlined as base64
// data URIs: one ~29 KB JPEG repeated 12 times (7 in the stylesheet, 5 in the
// body markup). Inlined, that image is duplicated into /v41.css AND into every
// page's HTML and its RSC payload, ~393 KB on the homepage alone. scripts/
// extract-v41-images.mjs writes each unique image to public/img/v41/<hash>.<ext>
// at build time; here the data URIs are rewritten to point at that cacheable
// asset, so the browser and CDN fetch it once. The visual source file is left
// untouched: this is the same treatment the CSS and runtime already receive.
const V41_IMAGE_EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/svg+xml': 'svg' };
function deinlineV41Images(s) {
  return s.replace(/data:(image\/[a-z+]+);base64,([A-Za-z0-9+/=]+)/g, (_match, mime, b64) => {
    const hash = createHash('sha256').update(b64).digest('hex').slice(0, 16);
    return '/img/v41/' + hash + '.' + (V41_IMAGE_EXT[mime] || 'bin');
  });
}

const head = deinlineV41Images(V41_SOURCE.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] || '');
const body = deinlineV41Images(V41_SOURCE.split(/<body[^>]*>/i)[1] || '');

export const V41_STYLES = [...head.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((match) => match[1]).join('\n');
export const V41_INLINE_SCRIPTS = [...V41_SOURCE.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]);
export const V41_MARKUP = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
export const V41_FOOTER = V41_MARKUP.match(/<footer class="footer-card" id="guides">[\s\S]*?<\/footer>/i)?.[0] || '';
export const V41_MARKETPLACE_MARKUP = V41_FOOTER ? V41_MARKUP.replace(V41_FOOTER, '') : V41_MARKUP;

// Non-visual delivery and accessibility attributes are applied at render time
// instead of changing the supplied V41 artifact. This keeps the artifact as an
// auditable visual source of truth while fixing semantics that do not affect its
// CSS cascade, layout or runtime behaviour.
const V41_CONTROL_LABEL_KEYS = {
  costDestination: 'destination',
  costDays: 'days',
  costStay: 'accommodation',
  costFood: 'food',
  costTransport: 'transport',
  costEsim: 'esimTotal',
  costCurrency: 'currency',
  advisorCountry: 'destination',
  advisorDays: 'days',
  advisorUsage: 'usage',
  adviceDestination: 'destination',
  cardDestination: 'destination',
  cardDays: 'days',
  cardBudget: 'budget',
  cardData: 'esimData',
};

const V41_CONTROL_LABELS = {
  en: {
    destination: 'Destination', days: 'Days', accommodation: 'Accommodation per day',
    food: 'Food per day', transport: 'Transport per day', esimTotal: 'eSIM total',
    currency: 'Currency', usage: 'Estimated usage', budget: 'Budget', esimData: 'eSIM data',
  },
  de: {
    destination: 'Reiseziel', days: 'Tage', accommodation: 'Unterkunft pro Tag',
    food: 'Verpflegung pro Tag', transport: 'Transport pro Tag', esimTotal: 'eSIM gesamt',
    currency: 'Währung', usage: 'Geschätzte Nutzung', budget: 'Budget', esimData: 'eSIM Daten',
  },
  ro: {
    destination: 'Destinație', days: 'Zile', accommodation: 'Cazare pe zi',
    food: 'Mâncare pe zi', transport: 'Transport pe zi', esimTotal: 'Total eSIM',
    currency: 'Monedă', usage: 'Utilizare estimată', budget: 'Buget', esimData: 'Date eSIM',
  },
};

export function enhanceV41Markup(markup, locale = 'en') {
  let delivered = markup
    // The React shell owns the single main landmark so the hidden H1, V41
    // marketplace and authored SEO sections all belong to the same landmark.
    .replace('<main>', '<div data-v41-main="true">')
    .replace('</main>', '</div>')
    // Region photography is supplementary to the adjacent visible region name.
    // Empty alt text avoids announcing the same label twice to screen readers.
    .replace(
      /(<article class="region-card"><img)(\s)/g,
      '$1 alt="" aria-hidden="true" decoding="async" loading="lazy" fetchpriority="low" width="700" height="467"$2'
    )
    // The drawer title names the selected destination, so its hero is decorative.
    .replace(
      '<img id="dImg"/>',
      '<img id="dImg" alt="" aria-hidden="true" decoding="async" width="1000" height="750"/>'
    )
    .replace('<div aria-label="Travel tools" class="tool-dock">', '<div aria-label="Travel tools" class="tool-dock" role="group">')
    .replace('<div aria-label="Travel calculator views" class="tool-tabs">', '<div aria-label="Travel calculator views" class="tool-tabs" role="group">')
    // Preserve the styled native elements and correct only their semantic
    // outline. ARIA levels do not alter V41 selectors or typography.
    .replaceAll('<h3 data-i18n="costTitle">', '<h3 role="heading" aria-level="2" data-i18n="costTitle">')
    .replaceAll('<h3 data-i18n="advisorTitle">', '<h3 role="heading" aria-level="2" data-i18n="advisorTitle">')
    .replaceAll('<h3 data-i18n="adviceTitle">', '<h3 role="heading" aria-level="2" data-i18n="adviceTitle">')
    .replaceAll('<h3 data-i18n="cardTitle">', '<h3 role="heading" aria-level="2" data-i18n="cardTitle">')
    .replaceAll('<h4 data-i18n="step', '<h4 role="heading" aria-level="3" data-i18n="step')
    .replaceAll('<h4 data-i18n="footer', '<h4 role="heading" aria-level="2" data-i18n="footer')
    .replace('<h4 id="tripCardTitle">', '<h4 id="tripCardTitle" role="heading" aria-level="3">');

  const labels = V41_CONTROL_LABELS[locale] || V41_CONTROL_LABELS.en;
  for (const [controlId, labelKey] of Object.entries(V41_CONTROL_LABEL_KEYS)) {
    delivered = delivered.replace(
      new RegExp('(<(?:input|select))([^>]*\\bid="' + controlId + '")'),
      `$1 aria-label="${labels[labelKey]}"$2`
    );
  }

  return delivered;
}

// The plan cards are generated by the original V41 runtime. Add browser loading
// hints to those generated images without rewriting the cards or their styling.
export function enhanceV41RuntimeSource(source) {
  return source
    .replaceAll(
      '<img src="${p.img}" alt="${p.name}">',
      '<img src="${p.img}" alt="${p.name}" width="700" height="972" decoding="async" loading="${i === 0 ? \'eager\' : \'lazy\'}" fetchpriority="${i === 0 ? \'high\' : \'low\'}">'
    )
    .replace(
      'b.type="button";\n    b.dataset.lang=code;',
      'b.type="button";\n    b.setAttribute("role","menuitem");\n    b.dataset.lang=code;'
    );
}
