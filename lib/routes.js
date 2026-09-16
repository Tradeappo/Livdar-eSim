import { segment, DEFAULT_LOCALE } from './i18n.js';
import { destinationSlug, getDestination } from './destinations.js';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://livdar.com').replace(/\/$/, '');

const join = (...parts) => '/' + parts.filter(Boolean).join('/') + '/';

export const routes = {
  home: (locale) => join(locale),
  esimHub: (locale) => join(locale, segment('esim', locale)),
  destination: (locale, destinationOrId) => {
    const dest = typeof destinationOrId === 'string' ? getDestination(destinationOrId) : destinationOrId;
    if (!dest) return join(locale, segment('esim', locale));
    return join(locale, segment('esim', locale), destinationSlug(dest, locale));
  },
  regionsHub: (locale) => join(locale, segment('regions', locale)),
  region: (locale, regionId) => join(locale, segment('regions', locale), regionId),
  guidesHub: (locale) => join(locale, segment('guides', locale)),
  guide: (locale, slug) => join(locale, segment('guides', locale), slug),
  compareHub: (locale) => join(locale, segment('compare', locale)),
  compatibility: (locale) => join(locale, segment('compatibility', locale)),
  privacy: (locale) => join(locale, segment('privacy', locale)),
  cookies: (locale) => join(locale, segment('cookies', locale)),
};

export const absolute = (path) => SITE_URL + path;

export const defaultPath = () => routes.home(DEFAULT_LOCALE);
