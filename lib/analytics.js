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
};

// Which of those carry commercial meaning. Marked as key events in GA4; the
// rest stay ordinary events so the conversion rate is not inflated by clicks
// that mean nothing.
export const KEY_EVENTS = [
  EVENTS.selectPlan,
  EVENTS.beginCheckout,
  EVENTS.checkoutIntent,
  EVENTS.notifySignup,
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
  window.dataLayer.push(['consent', 'update', update]);
  window.dataLayer.push({
    event: 'livdar_consent_update',
    consent_statistics: update.analytics_storage,
    consent_marketing: update.ad_storage,
  });
}
