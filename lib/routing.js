// What the middleware decides, separated from how it says it.
//
// The middleware itself is four lines of framework glue now. Everything that can
// be wrong lives here, because the bug that made seven of the nine Atlas
// languages unreachable in production was an ordering bug between two rules, and
// an ordering bug is only testable if the rules can be called from a test.
// `next/server` cannot be imported outside the framework, so while the decision
// lived in middleware.js nothing could exercise it.

import { LOCALES, DEFAULT_LOCALE } from './i18n.js';
import { isAtlasPath } from './atlas/atlas-edge.js';

const LIVE = LOCALES.filter((l) => l.live).map((l) => l.code);
const ALL = LOCALES.map((l) => l.code);

// Accept-Language negotiation. Exact match wins, then the base language, then
// the default market. No IP based guessing: a German speaker in a Bucharest
// airport still wants the German page.
export function negotiate(header) {
  if (!header) return DEFAULT_LOCALE;
  const wanted = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      return { tag: tag.trim(), q: q ? parseFloat(q.split('=')[1]) || 0 : 1 };
    })
    .filter((x) => x.tag)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of wanted) {
    const exact = LIVE.find((code) => code.toLowerCase() === tag.toLowerCase());
    if (exact) return exact;
  }
  for (const { tag } of wanted) {
    const base = tag.split('-')[0].toLowerCase();
    const hit = LIVE.find((code) => code.split('-')[0].toLowerCase() === base);
    if (hit) return hit;
  }
  return DEFAULT_LOCALE;
}

// One of three answers, each with the reason on it, so a log line or a test can
// say which rule fired rather than only what happened.
export function decide(pathname, acceptLanguage) {
  if (pathname === '/' || pathname === '') {
    return {
      action: 'redirect',
      pathname: '/' + negotiate(acceptLanguage) + '/',
      // 307 on purpose. The root is content negotiated, so it must not be cached
      // as a permanent redirect to one market.
      status: 307,
      keepSearch: false,
      why: 'the root is content negotiated',
    };
  }

  // The Atlas publishes in nine languages and the eSIM site publishes in three.
  // Seven of the nine are locales with no eSIM market, so without this rule
  // every Atlas page in Spanish, French, Italian, Japanese, Dutch, Polish and
  // Portuguese answered 307 to the English home page: built, prerendered, in the
  // sitemap and unreachable. It comes first because the page exists, and an
  // existing page is the answer to the request.
  if (isAtlasPath(pathname)) {
    return { action: 'pass', why: 'an Atlas page is served in its own language whatever the eSIM site publishes' };
  }

  // A locale that exists in the infrastructure but has no published market yet
  // must never render a 404. It lands on the nearest live market instead.
  const first = pathname.split('/').filter(Boolean)[0];
  if (first && ALL.includes(first) && !LIVE.includes(first)) {
    return {
      action: 'redirect',
      pathname: '/' + negotiate(acceptLanguage) + '/',
      status: 307,
      keepSearch: true,
      why: 'the locale exists in the infrastructure and has no published eSIM market',
    };
  }

  return { action: 'pass', why: 'a live market, or a path the locale rules do not own' };
}
