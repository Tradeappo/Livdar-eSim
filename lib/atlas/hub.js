// Section hub pages (/en/cities/, /de/staedte/ ...). They list published pages
// only, grouped by city, so every published page has at least one crawlable
// link from a stable URL besides the sitemap.

import { SEGMENTS, SITE_ORIGIN, MONTHS, regionName } from './i18n.js';
import { parseKey, pathFor } from './taxonomy.js';

const TEXT = {
  city: {
    en: { title: 'City travel data: weather by month and essentials', h1: 'Cities', intro: 'Month by month climate averages and practical travel facts for cities, built from open data sources and updated when the sources change. Each page states where its numbers come from.' },
    de: { title: 'Städte: Wetter nach Monat und Reiseinfos', h1: 'Städte', intro: 'Klimamittel Monat für Monat und praktische Reiseinfos für Städte, aus offenen Datenquellen und aktualisiert, wenn sich die Quellen ändern. Jede Seite nennt die Herkunft ihrer Zahlen.' },
    ro: { title: 'Orașe: vremea pe luni și informații de călătorie', h1: 'Orașe', intro: 'Medii climatice lună de lună și informații practice de călătorie pentru orașe, din surse de date deschise, actualizate când se schimbă sursele. Fiecare pagină spune de unde provin cifrele.' },
  },
  airport: {
    en: { title: 'Airports: location, distance to the city and time zone', h1: 'Airports', intro: 'Airports with scheduled flights: codes, straight-line distance to the city centre, local time and other airports nearby, from open data.' },
    de: { title: 'Flughäfen: Lage, Entfernung zur Stadt und Zeitzone', h1: 'Flughäfen', intro: 'Flughäfen mit Linienverkehr: Codes, Luftlinie ins Zentrum, Ortszeit und andere Flughäfen in der Nähe, aus offenen Daten.' },
    ro: { title: 'Aeroporturi: locație, distanța până în oraș și fus orar', h1: 'Aeroporturi', intro: 'Aeroporturi cu zboruri regulate: coduri, distanța în linie dreaptă până în centru, ora locală și alte aeroporturi din apropiere, din date deschise.' },
  },
};

export function hubModel(ds, locale, kind, isLive) {
  const pages = Object.keys(ds.registry.entries).filter(isLive).map(parseKey).filter((p) => p.locale === locale && (kind === 'city' ? p.family !== 'airport' : p.family === 'airport'));
  if (!pages.length) return null;
  const t = TEXT[kind][locale];
  const groups = new Map();
  pages.forEach((p) => {
    const g = groups.get(p.entity) || [];
    g.push(p);
    groups.set(p.entity, g);
  });
  const sections = [];
  const links = [];
  [...groups.entries()].forEach(([entity, list]) => {
    const c = kind === 'city' ? ds.cityById.get(String(entity)) : ds.airportByIata.get(entity);
    if (!c) return;
    const name = kind === 'city' ? (c.names && c.names[locale]) || c.name : c.name + ' (' + c.iata + ')';
    list.sort((a, b) => (a.month ?? -1) - (b.month ?? -1)).forEach((p) => {
      const label = p.family === 'city-month' ? name + ': ' + MONTHS[locale][p.month] : name;
      links.push({ href: pathFor(ds, p), text: label });
    });
  });
  const path = '/' + locale + '/' + SEGMENTS[kind][locale] + '/';
  sections.push({ id: 'intro', paragraphs: [t.intro] });
  return {
    key: 'hub:' + locale + ':' + kind, family: 'hub', locale, path, url: SITE_ORIGIN + path,
    alternates: [{ locale, path, key: 'hub' }],
    title: t.title, h1: t.h1, description: t.intro.slice(0, 158),
    breadcrumbs: [{ name: t.h1 }], sections, facts: [], faq: [], links,
    sources: [], schemaType: null,
  };
}

export { regionName };
