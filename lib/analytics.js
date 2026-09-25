// One dataLayer, one tag manager, no second GA4 snippet anywhere. Every event
// carries the same base parameters so a report can be cut by market, language,
// destination or cluster without extra work later.

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || '';
export const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || '';

export const CONSENT_COOKIE = 'livdar_consent';
export const CONSENT_VERSION = 1;

// The commercial funnel, in the order a visitor walks it. Every step is
// measured separately, because the question we need answered before a supplier
// exists is not how many people looked, it is how close to buying they got.
//
//   view_destination -> view_plan -> select_plan -> begin_checkout
//                                                -> checkout_intent
//                                                -> notify_signup
//
// begin_checkout fires when the visitor asks to continue. checkout_intent fires
// when they are shown that activation is not available yet, which is the point
// where a real shop would have taken money. The gap between the two is the
// clearest number this site can produce right now.
export const EVENTS = {
  search: 'search',
  viewDestination: 'view_destination',
  viewPlan: 'view_plan',
  selectPlan: 'select_plan',
  beginCheckout: 'begin_checkout',
  checkoutIntent: 'checkout_intent',
  checkAvailability: 'check_availability',
  notifySignup: 'notify_signup',
  ctaClick: 'cta_click',
  languageChange: 'language_change',
  // The Atlas half. A data page's funnel is not the shop's funnel: nobody buys
  // anything on a page about the cost of living in Japan, and the question that
  // page has to answer is whether it moved the reader at all.
  //
  //   tool_view -> tool_start -> tool_complete
  //   cta_click -> internal_cta_click or outbound_click
  //
  // tool_view fires when the tool is on screen rather than when the page loads,
  // because a tool below the fold that nobody scrolled to has not been viewed
  // and counting it would make every rate after it wrong.
  toolView: 'tool_view',
  toolStart: 'tool_start',
  toolComplete: 'tool_complete',
  internalCtaClick: 'internal_cta_click',
  outboundClick: 'outbound_click',
};

// Which of those carry commercial meaning. Marked as key events in GA4; the
// rest stay ordinary events so the conversion rate is not inflated by clicks
// that mean nothing.
export const KEY_EVENTS = [
  EVENTS.selectPlan,
  EVENTS.beginCheckout,
  EVENTS.checkoutIntent,
  EVENTS.notifySignup,
  // A reader who finished a calculation asked a real question and got a real
  // answer, which is the closest thing to an intent signal a data page produces.
  // Starting one is not: half of those are a stray tap on a number field.
  EVENTS.toolComplete,
];

// Deliberately not key events, and listed so that nobody promotes them by
// accident. A call to action click is the thing the experiment is measuring, not
// the thing it is trying to achieve, and marking five hundred pages' worth of
// them as conversions would make the conversion rate a measure of how many
// buttons there are.
export const ORDINARY_EVENTS = [
  EVENTS.ctaClick,
  EVENTS.internalCtaClick,
  EVENTS.outboundClick,
  EVENTS.toolView,
  EVENTS.toolStart,
  EVENTS.languageChange,
  EVENTS.search,
  EVENTS.viewDestination,
  EVENTS.viewPlan,
  EVENTS.checkAvailability,
];

export function pushEvent(name, params) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(Object.assign({ event: name }, params || {}));
}

export function baseParams({ locale, market, destination, region, cluster, planType }) {
  return {
    language: locale || null,
    market: market || locale || null,
    destination: destination || null,
    region: region || null,
    content_cluster: cluster || null,
    plan_type: planType || null,
  };
}

// The dimensions every Atlas event carries.
//
// The set is the one a five hundred page experiment has to be able to cut by:
// which cohort the page belongs to, which surface and family it is, the language
// and the market it was written for, the entity it is about, and the path, so a
// report never has to parse a URL to learn that `zonas` is the Spanish Areas
// segment.
//
// One naming decision is worth stating because it is not obvious and it cost a
// measurement. GA4 collects `language` automatically from the browser and drops
// a custom event parameter of the same name: the eSIM pages push `language` and
// `market` with the same value and only `market` arrives. So the page's own
// language travels as `page_language`, and `language` is pushed alongside it for
// the container's existing mapping rather than instead of it.
export function atlasParams(model) {
  if (!model) return {};
  return {
    language: model.locale || null,
    page_language: model.locale || null,
    market: model.market || null,
    cohort: model.cohort || null,
    surface: model.surface || null,
    family: model.family || null,
    entity: model.entity == null ? null : String(model.entity),
    destination: model.destination == null ? (model.entity == null ? null : String(model.entity)) : String(model.destination),
    page_path: model.path || null,
    content_cluster: model.family || null,
  };
}

// A call to action click, with what it is and where it goes. `cta_position` is
// one of the four places a call to action can sit, and it is the field that
// answers the only question worth asking about placement.
export const CTA_POSITIONS = ['hero', 'mid', 'bottom', 'tool'];

export function ctaParams(cta, position) {
  if (!cta) return {};
  return {
    cta_type: cta.ctaType || null,
    cta_label: cta.label || null,
    cta_destination: cta.href || null,
    cta_kind: cta.kind || null,
    cta_position: position || cta.position || null,
    destination_entity: cta.destination == null ? null : String(cta.destination),
    destination_family: cta.destinationFamily || null,
    destination_surface: cta.destinationSurface || null,
  };
}

// Google Consent Mode v2. Defaults are denied and they are written before the
// container loads, so nothing can fire ahead of a choice.
export const CONSENT_DEFAULT = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'granted',
  personalization_storage: 'denied',
  security_storage: 'granted',
  wait_for_update: 500,
};

export function consentUpdateFrom(choice) {
  const stats = choice && choice.statistics ? 'granted' : 'denied';
  const marketing = choice && choice.marketing ? 'granted' : 'denied';
  return {
    analytics_storage: stats,
    ad_storage: marketing,
    ad_user_data: marketing,
    ad_personalization: marketing,
    personalization_storage: marketing,
    functionality_storage: 'granted',
    security_storage: 'granted',
  };
}

export function readConsent() {
  if (typeof document === 'undefined') return null;
  try {
    const match = document.cookie.split('; ').find((row) => row.startsWith(CONSENT_COOKIE + '='));
    if (!match) return null;
    const parsed = JSON.parse(decodeURIComponent(match.split('=').slice(1).join('=')));
    if (!parsed || parsed.v !== CONSENT_VERSION) return null;
    return parsed;
  } catch (err) {
    return null;
  }
}

export function writeConsent(choice) {
  if (typeof document === 'undefined') return;
  const value = { v: CONSENT_VERSION, statistics: !!choice.statistics, marketing: !!choice.marketing, ts: Date.now() };
  try {
    document.cookie =
      CONSENT_COOKIE + '=' + encodeURIComponent(JSON.stringify(value)) + '; path=/; max-age=15552000; samesite=lax';
  } catch (err) {
    /* storage blocked, the banner will simply ask again */
  }
}

export function applyConsent(choice) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  const update = consentUpdateFrom(choice);

  // This MUST go through gtag, not through a plain dataLayer.push of an array.
  //
  // Consent Mode reads a consent command from the Arguments object that gtag
  // pushes. A plain array with the same three items looks identical in the
  // dataLayer and is silently ignored. The defaults in the boot script were
  // already correct because they call gtag; only the update was a raw array,
  // and the two halves disagreeing is what made this survive review.
  //
  // What it cost: consent was collected, written to the cookie and the banner
  // dismissed, so every visible sign said it had worked, while Google's
  // internal state stayed denied. Measured on the live deployment, the
  // dataLayer showed analytics_storage granted while google_tag_data.ics still
  // read false, and GA4 received nothing at all. Not a reduced number, nothing.
  // Any amount of clicking Accept would never have produced a single hit.
  if (typeof window.gtag !== 'function') {
    // The boot script defines this; the fallback is for the case where it was
    // blocked, so consent still reaches the dataLayer in the right shape.
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
  }
  window.gtag('consent', 'update', update);
  window.dataLayer.push({
    event: 'livdar_consent_update',
    consent_statistics: update.analytics_storage,
    consent_marketing: update.ad_storage,
  });
}
