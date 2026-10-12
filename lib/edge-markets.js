// Which markets the eSIM site publishes, in a form the edge can import.
//
// WHY THIS IS A LITERAL AND NOT A COMPUTED LIST. lib/markets.js answers the same question
// properly: a market is published when its content is complete, computed from the content
// tree rather than from a flag somebody set by hand. The middleware cannot call it. It runs
// on every request and importing markets.js pulls in lib/content/index.js and the whole
// authored content tree behind it, which is exactly the weight the edge bundle is kept small
// to avoid, for the same reason lib/atlas/atlas-edge.js exists.
//
// WHY IT IS NOT THE `live` FLAG EITHER. lib/routing.js used to read LOCALES[].live, while
// lib/i18n.js states in its own header that `live` "is not consulted by routing, hreflang,
// the sitemap or the language selector" and lib/markets.js explains that the flag was
// replaced because it "described an intention rather than a fact" and rots: a locale could
// be flagged live before its pages existed, or stay flagged after they went. Routing reading
// it meant the one consumer that decides whether a URL answers at all was reading the one
// source that is allowed to be wrong.
//
// So the edge gets a literal, and a test makes the literal unable to drift:
// tests/atlas-middleware.test.mjs asserts this set equals publishedMarkets() exactly and
// fails on a difference of one entry. Adding a market is still adding its content; this file
// is the one line that has to follow, and CI says so rather than production.
export const PUBLISHED_ESIM_MARKETS = new Set(['de', 'en', 'ro']);

export const publishesEsim = (locale) => PUBLISHED_ESIM_MARKETS.has(locale);
