// Page level QA. Runs on the page model, which is exactly what the page component renders, so it checks what a crawler and a reader get.
// crawler and a reader actually get.

import { FAMILIES, resolvePath } from './taxonomy.js';
import { RESERVED_PREFIXES, SITE_ORIGIN } from './i18n.js';
import { atlasSchema, modelText } from './schema.js';

export function wordCount(text) {
  return (text.match(/[\p{L}\p{N}]+/gu) || []).length;
}

const BROKEN = [/undefined/, /\bNaN\b/, /\bnull\b/, /Infinity/, /\[object/, / ,/, / \./, /\s{2,}/, /\.\./];

export function pageQa(ds, model) {
  const failures = [];
  const text = modelText(model);
  const words = wordCount(text);
  const fam = FAMILIES[model.family];

  if (!model.title || model.title.length > 75) failures.push('title-length');
  if (!model.description || model.description.length < 70 || model.description.length > 160) failures.push('description-length');
  if (!model.h1) failures.push('h1-missing');
  if (words < fam.minimumWords) failures.push('thin-content:' + words);
  if (model.facts.length < 3) failures.push('too-few-facts');
  if (!model.url.startsWith(SITE_ORIGIN + '/') || !RESERVED_PREFIXES.some((p) => model.path.startsWith(p))) failures.push('path-outside-reserved-prefix');
  if (/[\u2013\u2014]/.test(text + model.title + model.description)) failures.push('dash');
  BROKEN.forEach((re) => { if (re.test(text) || re.test(model.title) || re.test(model.description)) failures.push('broken-text:' + re.source); });

  // JSON-LD must parse and FAQ entries must be visible on the page.
  try {
    const parsed = JSON.parse(JSON.stringify(atlasSchema(model)));
    const faq = parsed['@graph'].find((g) => g['@type'] === 'FAQPage');
    if (faq) faq.mainEntity.forEach((q) => { if (!text.includes(q.name)) failures.push('faq-not-visible'); });
    if (parsed['@graph'].some((g) => g['@type'] === 'Offer' || g['@type'] === 'Product')) failures.push('offer-schema');
  } catch {
    failures.push('jsonld-invalid');
  }

  // Plausibility ranges. A value outside them means an ingest or unit error,
  // never something to publish.
  const prose = model.sections.flatMap((x) => x.paragraphs).concat(model.faq.map((q) => q.a)).join(' ');
  const temps = [...prose.matchAll(/(-?\d+) °C/g)].map((m) => Number(m[1]));
  if (temps.some((t) => t < -70 || t > 60)) failures.push('implausible-temperature');
  const kms = [...prose.matchAll(/([\d.,]+) km/g)].map((m) => Number(m[1].replace(/[.,](?=\d{3})/g, '').replace(',', '.')));
  if (kms.some((k) => k > 20000)) failures.push('implausible-distance');

  // Internal links into the reserved prefixes must resolve to a page.
  const hrefs = model.links.map((x) => x.href).concat(model.breadcrumbs.map((b) => b.href).filter(Boolean)).concat(model.table ? model.table.rows.map((r) => r.href).filter(Boolean) : []);
  // A section hub is a real page whenever its locale has a published page in
  // it, and it is the one Atlas URL that resolvePath does not describe,
  // because it addresses no entity.
  const isSectionHub = (h) => RESERVED_PREFIXES.includes(h);
  hrefs.filter((h) => RESERVED_PREFIXES.some((p) => h.startsWith(p))).forEach((h) => {
    if (isSectionHub(h)) return;
    if (!resolvePath(ds, h)) failures.push('dead-internal-link:' + h);
  });

  return { failures: [...new Set(failures)], metrics: { words, facts: model.facts.length, links: model.links.length } };
}

// Data fingerprint: the facts that make a page what it is. Two published pages
// with the same fingerprint are duplicates in substance whatever their wording.
export function fingerprint(model) {
  return model.family + '|' + model.facts.map((f) => f.value).join('|');
}
