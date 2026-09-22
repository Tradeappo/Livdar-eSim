// JSON-LD for an Atlas page model. Shared by the React page and by QA, so what
// QA checks is what the page prints.

import { SITE_ORIGIN } from './i18n.js';

export function atlasSchema(model) {
  const graph = [];
  graph.push({
    '@type': 'WebPage',
    '@id': model.url + '#page',
    url: model.url,
    name: model.title,
    description: model.description,
    inLanguage: model.locale,
    isPartOf: { '@type': 'WebSite', name: 'Livdar', url: SITE_ORIGIN + '/' },
  });
  const crumbs = [{ name: 'Livdar', item: SITE_ORIGIN + '/' + model.locale + '/' }].concat(
    model.breadcrumbs.map((b, i) => ({ name: b.name, item: i === model.breadcrumbs.length - 1 ? model.url : b.href ? SITE_ORIGIN + b.href : undefined }))
  );
  graph.push({ '@type': 'BreadcrumbList', itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.item })) });
  if (model.faq && model.faq.length) {
    graph.push({ '@type': 'FAQPage', mainEntity: model.faq.map((q) => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a } })) });
  }
  if (model.schemaType && model.geo) {
    const place = { '@type': model.schemaType, name: model.placeName, geo: { '@type': 'GeoCoordinates', latitude: model.geo.lat, longitude: model.geo.lon } };
    if (model.iata) place.iataCode = model.iata;
    if (model.icao) place.icaoCode = model.icao;
    graph.push(place);
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

// Everything a reader sees in the main column, as text. The page component
// renders exactly these parts of the model, in this order.
export function modelText(model) {
  const parts = [model.h1];
  model.facts.forEach((f) => parts.push(f.label, f.value));
  model.sections.forEach((s) => { if (s.heading) parts.push(s.heading); parts.push(...s.paragraphs); });
  if (model.table) { parts.push(model.table.caption, ...model.table.head); model.table.rows.forEach((r) => parts.push(...r.cells)); }
  model.faq.forEach((q) => parts.push(q.q, q.a));
  model.links.forEach((x) => parts.push(x.text));
  model.sources.forEach((s) => parts.push(s.attribution));
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}
