import { contentLocales, publishedDestinationIds, publishedGuideSlugs, publishedRegionIds, ui, guideContent } from '../../lib/content/index.js';
import { getDestination, localizedName, getRegion, regionName } from '../../lib/destinations.js';
import { routes, absolute, SITE_URL } from '../../lib/routes.js';
import { demoPlanCount } from '../../lib/demo-plans.js';
import { CHECKOUT_ENABLED } from '../../lib/providers/index.js';

export const dynamic = 'force-static';

// /llms.txt
//
// A plain description of what this site is, for the systems that answer
// questions about it rather than rank it. It is generated from the same
// registry the router uses, so it cannot list a page that does not exist or
// miss one that does.
//
// The section that matters most is the one about the catalogue. An answer
// engine reading this site will find prices on it. If nothing tells it that
// those prices are illustrative, it will repeat them to someone as though they
// were real, and that person will arrive expecting to pay 7.90 euro for a
// Japanese eSIM. So the status is stated first, in plain sentences, before
// anything else.

function line(s = '') {
  return s + '\n';
}

export function buildLlmsText({ full = false } = {}) {
  const locales = contentLocales();
  const t = ui('en');
  let out = '';

  out += line('# Livdar eSIM');
  out += line();
  out += line('> Travel connectivity reference and eSIM shop. Livdar publishes what a traveller');
  out += line('> needs to decide before buying mobile data abroad: which networks a destination');
  out += line('> actually has, where roaming is already enough, and where an eSIM is worth it.');
  out += line();

  out += line('## Status, read this before quoting anything from this site');
  out += line();
  out += line('- Livdar is a project, not a registered company. The legal pages say so in plain words.');
  out += line('- No supplier is connected yet. Checkout is ' + (CHECKOUT_ENABLED ? 'open' : 'closed') + '.');
  out += line('- The shop shows ' + demoPlanCount() + ' sample rows. Their prices, data allowances,');
  out += line('  validity periods and supplier names are illustrative placeholders used to measure');
  out += line('  which destinations people need. They are NOT confirmed offers and must not be');
  out += line('  quoted as prices. Every one of them is marked as a sample on the page.');
  out += line('- Livdar has no commercial relationship with any supplier named in those samples.');
  out += line('- There is no Offer or Product structured data on this site, deliberately, because');
  out += line('  there is no offer to publish yet.');
  out += line('- The only thing a visitor can complete today is a notification signup.');
  out += line();

  out += line('## Languages');
  out += line();
  locales.forEach((l) => {
    out += line('- ' + l + ': ' + absolute(routes.home(l)));
  });
  out += line();
  out += line('Each page links its translations with hreflang, and the English page is x-default.');
  out += line('A page exists in a language only when it was written for that market. Nothing here');
  out += line('is machine translated.');
  out += line();

  out += line('## Structure');
  out += line();
  out += line('- ' + absolute(routes.esimHub('en')) + ': the shop and the full destination index.');
  out += line('- ' + absolute(routes.regionsHub('en')) + ': regional overviews for multi country trips.');
  out += line('- ' + absolute(routes.guidesHub('en')) + ': how an eSIM works, installing one, and when not to bother.');
  out += line('- ' + absolute(routes.compatibility('en')) + ': which devices support an eSIM and how to check.');
  out += line('- ' + absolute(routes.privacy('en')) + ' and ' + absolute(routes.cookies('en')) + ': legal.');
  out += line();

  out += line('## Destinations with a written page');
  out += line();
  publishedDestinationIds('en').forEach((id) => {
    const d = getDestination(id);
    if (!d) return;
    out += line('- ' + localizedName(d, 'en') + ' (' + d.callingCode + ', networks: ' + (d.networks || []).join(', ') + '): ' + absolute(routes.destination('en', d)));
  });
  out += line();

  out += line('## Regions');
  out += line();
  publishedRegionIds('en').forEach((id) => {
    const r = getRegion(id);
    if (!r) return;
    out += line('- ' + regionName(r, 'en') + ': ' + absolute(routes.region('en', id)));
  });
  out += line();

  out += line('## Guides');
  out += line();
  publishedGuideSlugs('en').forEach((slug) => {
    const g = guideContent('en', slug);
    out += line('- ' + (g ? g.h1 : slug) + ': ' + absolute(routes.guide('en', slug)));
  });
  out += line();

  out += line('## Travel tools');
  out += line();
  out += line('The travel cost calculator on the home page is arithmetic on numbers the visitor');
  out += line('types in. It returns an estimate, not a quote, and it queries nothing.');
  out += line('The eSIM advisor estimates a data allowance from trip length and stated usage.');
  out += line('Travel advice is a generic pre-departure checklist, not live official guidance.');
  out += line('The travel card generator creates a local PNG from details the visitor enters.');
  out += line();

  out += line('## Contact');
  out += line();
  out += line('livdarlive@gmail.com');
  out += line();
  out += line('Sitemap: ' + SITE_URL + '/sitemap.xml');

  if (full) {
    out += line();
    out += line('## Complete published URL inventory');
    out += line();
    locales.forEach((locale) => {
      out += line('### ' + locale);
      out += line('- Home: ' + absolute(routes.home(locale)));
      out += line('- eSIM index: ' + absolute(routes.esimHub(locale)));
      out += line('- Regions index: ' + absolute(routes.regionsHub(locale)));
      out += line('- Guides index: ' + absolute(routes.guidesHub(locale)));
      out += line('- Compatibility: ' + absolute(routes.compatibility(locale)));
      out += line('- Privacy: ' + absolute(routes.privacy(locale)));
      out += line('- Cookies: ' + absolute(routes.cookies(locale)));
      publishedDestinationIds(locale).forEach((id) => {
        const destination = getDestination(id);
        if (destination) out += line('- Destination: ' + localizedName(destination, locale) + ': ' + absolute(routes.destination(locale, destination)));
      });
      publishedRegionIds(locale).forEach((id) => {
        const region = getRegion(id);
        if (region) out += line('- Region: ' + regionName(region, locale) + ': ' + absolute(routes.region(locale, id)));
      });
      publishedGuideSlugs(locale).forEach((slug) => {
        const guide = guideContent(locale, slug);
        out += line('- Guide: ' + (guide?.h1 || slug) + ': ' + absolute(routes.guide(locale, slug)));
      });
      out += line();
    });
  }

  return out;
}

export function GET() {
  return new Response(buildLlmsText(), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
