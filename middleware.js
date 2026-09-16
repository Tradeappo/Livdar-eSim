import { NextResponse } from 'next/server';
import { LOCALES, DEFAULT_LOCALE } from './lib/i18n.js';

// Kept deliberately light. It imports only the locale table, never the content
// registry, so the edge bundle stays small.

const LIVE = LOCALES.filter((l) => l.live).map((l) => l.code);
const ALL = LOCALES.map((l) => l.code);

// Accept-Language negotiation. Exact match wins, then the base language, then
// the default market. No IP based guessing: a German speaker in a Bucharest
// airport still wants the German page.
function negotiate(header) {
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

export function middleware(request) {
  const { pathname, search } = request.nextUrl;

  if (pathname === '/' || pathname === '') {
    const locale = negotiate(request.headers.get('accept-language'));
    const url = request.nextUrl.clone();
    url.pathname = '/' + locale + '/';
    // 307 on purpose. The root is content negotiated, so it must not be cached
    // as a permanent redirect to one market.
    return NextResponse.redirect(url, 307);
  }

  // A locale that exists in the infrastructure but has no published market yet
  // must never render a 404. It lands on the nearest live market instead.
  const first = pathname.split('/').filter(Boolean)[0];
  if (first && ALL.includes(first) && !LIVE.includes(first)) {
    const locale = negotiate(request.headers.get('accept-language'));
    const url = request.nextUrl.clone();
    url.pathname = '/' + locale + '/';
    url.search = search;
    return NextResponse.redirect(url, 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|robots.txt|sitemap|.*\\..*).*)'],
};
