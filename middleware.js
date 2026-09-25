import { NextResponse } from 'next/server';
import { decide } from './lib/routing.js';

// Framework glue only. Every rule lives in lib/routing.js, which imports the
// locale table and a flat list of Atlas languages and segments and nothing else,
// so the edge bundle stays small and the decision stays testable: `next/server`
// cannot be imported outside the framework, and while the rules lived here no
// test could reach them.

export function middleware(request) {
  const { pathname, search } = request.nextUrl;
  const d = decide(pathname, request.headers.get('accept-language'));
  if (d.action === 'pass') return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = d.pathname;
  if (d.keepSearch) url.search = search;
  return NextResponse.redirect(url, d.status);
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|robots.txt|sitemap|.*\\..*).*)'],
};
