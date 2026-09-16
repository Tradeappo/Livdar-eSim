// Similarity check.
//
// The rule this project is built on is that every language is a separate market
// and every page is written for that market. That rule is worth nothing if it is
// only a good intention, so it is measured here and the build depends on it.
//
// What is measured:
//   1. Exact duplicate editorial text between any two pages.
//   2. Shingle overlap (five word windows, Jaccard) between every pair.
//   3. Title and meta description template reuse, after the page subject is
//      masked out, so "eSIM X: the honest guide" repeated eight times is caught
//      even though the eight strings are all different.
//   4. Section order reuse, which is what makes a set of pages feel stamped out.
//   5. FAQ question reuse across pages in the same market.
//   6. Opening sentence reuse, because the intro is what a reader judges first.
//   7. Editorial weight, so no page is published thin.
//
// Cross market pairs are measured with the same numbers. Two different languages
// naturally overlap near zero, so a high score across markets means one page was
// copied and lightly edited, which is exactly what needs to fail.

import { DESTINATIONS, localizedName, regionName, REGIONS } from '../lib/destinations.js';
import {
  contentLocales,
  publishedDestinationIds,
  publishedGuideSlugs,
  destinationContent,
  guideContent,
  homeContent,
  editorialWordCount,
} from '../lib/content/index.js';

// Thresholds. Deliberately strict, because the cost of being wrong here is a
// site that Google treats as doorway pages.
const LIMITS = {
  shingleFail: 0.34,
  shingleWarn: 0.22,
  templateMaxSameLocale: 1,     // a title or meta template may appear once
  sectionOrderMaxSameLocale: 2, // at most two pages in a market may share an order
  faqQuestionMaxSameLocale: 2,
  minEditorialWords: 320,
  titleMaxChars: 70,
  metaMinChars: 90,
  metaMaxChars: 175,
};

const SHINGLE = 5;

function words(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function shingles(text) {
  const w = words(text);
  const set = new Set();
  if (w.length < SHINGLE) {
    if (w.length) set.add(w.join(' '));
    return set;
  }
  for (let i = 0; i + SHINGLE <= w.length; i += 1) set.add(w.slice(i, i + SHINGLE).join(' '));
  return set;
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let shared = 0;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const item of small) if (large.has(item)) shared += 1;
  return shared / (a.size + b.size - shared);
}

// Template masking. Removes the page subject and every proper noun looking token
// so that what is left is the shape of the sentence rather than its subject.
function template(text, subjects) {
  let out = ' ' + String(text || '') + ' ';
  subjects.filter(Boolean).forEach((s) => {
    const safe = String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(safe, 'gi'), ' SUBJECT ');
  });
  return out
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\d+/g, ' NUM ')
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .join(' ');
}

function bodyText(content) {
  const parts = [];
  (content.intro || []).forEach((p) => parts.push(p));
  const order = content.sectionOrder || Object.keys(content.sections || {});
  order.forEach((key) => {
    const s = (content.sections || {})[key];
    if (!s) return;
    if (s.heading) parts.push(s.heading);
    (s.body || []).forEach((p) => parts.push(p));
    (s.list || []).forEach((p) => parts.push(p));
  });
  (content.faq || []).forEach((f) => { parts.push(f.q); parts.push(f.a); });
  return parts.join('\n');
}

function firstSentence(content) {
  const intro = (content.intro || [])[0] || '';
  const cut = intro.search(/[.!?]/);
  return (cut > 0 ? intro.slice(0, cut) : intro).trim();
}

function collect() {
  const pages = [];

  contentLocales().forEach((locale) => {
    const home = homeContent(locale);
    if (home) {
      pages.push({
        key: locale + ' / home',
        locale,
        type: 'home',
        subject: 'Livdar',
        title: home.title,
        metaDescription: home.metaDescription,
        sectionOrder: Object.keys(home.sections || {}),
        faq: (home.faq || []).map((f) => f.q),
        first: home.heroLead || '',
        text: [
          home.heroTitle,
          home.heroLead,
          ...Object.values(home.sections || {}).flatMap((s) => [
            s.heading,
            ...(s.items || []).flatMap((i) => [i.title, i.body]),
            ...(s.steps || []).flatMap((i) => [i.title, i.body]),
          ]),
          ...(home.faq || []).flatMap((f) => [f.q, f.a]),
        ].filter(Boolean).join('\n'),
        wordCount: null,
      });
    }

    publishedDestinationIds(locale).forEach((id) => {
      const content = destinationContent(locale, id);
      const dest = DESTINATIONS.find((d) => d.id === id);
      const subject = dest ? localizedName(dest, locale) : id;
      pages.push({
        key: locale + ' / destination / ' + id,
        locale,
        type: 'destination',
        subject,
        altSubject: dest ? dest.names.en : id,
        title: content.title,
        metaDescription: content.metaDescription,
        angle: content.angle,
        sectionOrder: content.sectionOrder || Object.keys(content.sections || {}),
        faq: (content.faq || []).map((f) => f.q),
        first: firstSentence(content),
        text: bodyText(content),
        wordCount: editorialWordCount(content),
      });
    });

    publishedGuideSlugs(locale).forEach((slug) => {
      const content = guideContent(locale, slug);
      pages.push({
        key: locale + ' / guide / ' + slug,
        locale,
        type: 'guide',
        subject: content.h1,
        title: content.title,
        metaDescription: content.metaDescription,
        sectionOrder: content.sectionOrder || Object.keys(content.sections || {}),
        faq: (content.faq || []).map((f) => f.q),
        first: firstSentence(content),
        text: bodyText(content),
        wordCount: editorialWordCount(content),
      });
    });
  });

  return pages;
}

function tally(list) {
  const map = new Map();
  list.forEach(({ value, key }) => {
    if (!value) return;
    if (!map.has(value)) map.set(value, []);
    map.get(value).push(key);
  });
  return map;
}

export function runSimilarityCheck({ quiet = false } = {}) {
  const pages = collect();
  const failures = [];
  const warnings = [];

  pages.forEach((p) => { p.shingles = shingles(p.text); });

  // 1 and 2: pairwise text overlap.
  for (let i = 0; i < pages.length; i += 1) {
    for (let j = i + 1; j < pages.length; j += 1) {
      const a = pages[i];
      const b = pages[j];
      if (a.text && a.text === b.text) {
        failures.push('IDENTICAL TEXT: ' + a.key + '  ==  ' + b.key);
        continue;
      }
      const score = jaccard(a.shingles, b.shingles);
      if (score >= LIMITS.shingleFail) {
        failures.push(
          'OVERLAP ' + score.toFixed(3) + ' (limit ' + LIMITS.shingleFail + '): ' + a.key + '  vs  ' + b.key
        );
      } else if (score >= LIMITS.shingleWarn) {
        warnings.push('overlap ' + score.toFixed(3) + ': ' + a.key + '  vs  ' + b.key);
      }
    }
  }

  // 3: title and meta templates, per market.
  contentLocales().forEach((locale) => {
    const inMarket = pages.filter((p) => p.locale === locale);

    const titles = tally(inMarket.map((p) => ({
      value: template(p.title, [p.subject, p.altSubject]),
      key: p.key,
    })));
    titles.forEach((keys, value) => {
      if (keys.length > LIMITS.templateMaxSameLocale) {
        failures.push('TITLE TEMPLATE used ' + keys.length + ' times in ' + locale + ': "' + value + '"\n    ' + keys.join('\n    '));
      }
    });

    const metas = tally(inMarket.map((p) => ({
      value: template(p.metaDescription, [p.subject, p.altSubject]),
      key: p.key,
    })));
    metas.forEach((keys, value) => {
      if (keys.length > LIMITS.templateMaxSameLocale) {
        failures.push('META TEMPLATE used ' + keys.length + ' times in ' + locale + ': "' + value.slice(0, 90) + '"\n    ' + keys.join('\n    '));
      }
    });

    // 4: section order.
    const orders = tally(inMarket.map((p) => ({ value: (p.sectionOrder || []).join('>'), key: p.key })));
    orders.forEach((keys, value) => {
      if (keys.length > LIMITS.sectionOrderMaxSameLocale) {
        failures.push('SECTION ORDER shared by ' + keys.length + ' pages in ' + locale + ': ' + value + '\n    ' + keys.join('\n    '));
      }
    });

    // 5: FAQ questions.
    const questions = [];
    inMarket.forEach((p) => (p.faq || []).forEach((q) => questions.push({ value: template(q, [p.subject, p.altSubject]), key: p.key })));
    tally(questions).forEach((keys, value) => {
      if (keys.length > LIMITS.faqQuestionMaxSameLocale) {
        failures.push('FAQ QUESTION reused ' + keys.length + ' times in ' + locale + ': "' + value + '"\n    ' + keys.join('\n    '));
      }
    });

    // 6: opening sentence.
    const firsts = tally(inMarket.map((p) => ({ value: template(p.first, [p.subject, p.altSubject]), key: p.key })));
    firsts.forEach((keys, value) => {
      if (value && keys.length > 1) {
        failures.push('OPENING SENTENCE reused in ' + locale + ': "' + value + '"\n    ' + keys.join('\n    '));
      }
    });

    // Angles must be distinct: the angle is the reason the page exists.
    const angles = tally(inMarket.filter((p) => p.angle).map((p) => ({ value: template(p.angle, [p.subject, p.altSubject]), key: p.key })));
    angles.forEach((keys, value) => {
      if (keys.length > 1) {
        failures.push('ANGLE reused in ' + locale + ': "' + value + '"\n    ' + keys.join('\n    '));
      }
    });
  });

  // 7: weight and metadata hygiene.
  pages.forEach((p) => {
    if (p.wordCount !== null && p.wordCount < LIMITS.minEditorialWords) {
      failures.push('THIN PAGE ' + p.key + ': ' + p.wordCount + ' editorial words, minimum ' + LIMITS.minEditorialWords);
    }
    if ((p.title || '').length > LIMITS.titleMaxChars) {
      warnings.push('title ' + (p.title || '').length + ' chars: ' + p.key);
    }
    const metaLen = (p.metaDescription || '').length;
    if (metaLen < LIMITS.metaMinChars || metaLen > LIMITS.metaMaxChars) {
      warnings.push('meta ' + metaLen + ' chars: ' + p.key);
    }
  });

  if (!quiet) {
    const pairs = (pages.length * (pages.length - 1)) / 2;
    console.log('Similarity check: ' + pages.length + ' pages, ' + pairs + ' pairs compared.');
    if (warnings.length) {
      console.log('  ' + warnings.length + ' warning(s):');
      warnings.forEach((w) => console.log('    ' + w));
    }
    if (failures.length) {
      console.error('SIMILARITY CHECK FAILED: ' + failures.length + ' problem(s)');
      failures.forEach((f) => console.error('  ' + f));
    } else {
      console.log('  No duplicate, near duplicate or stamped out pages.');
    }
  }

  return { pages: pages.length, failures, warnings };
}

const invokedDirectly = process.argv[1] && process.argv[1].endsWith('similarity-check.mjs');
if (invokedDirectly) {
  const { failures } = runSimilarityCheck();
  process.exit(failures.length ? 1 : 0);
}
