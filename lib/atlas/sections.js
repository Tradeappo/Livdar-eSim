// Which URL section a published Atlas page belongs to, and what that section is called.
//
// WHY A SECTION AND NOT A FAMILY. The crawl directory groups the pages it lists, and the
// grouping a reader can act on is the one the URL already shows: everything under
// /es/herramientas/ is one section even though it is four families (tools.calculator,
// tools.cost-calculator, tools.cost-comparison, tools.matcher), and /es/dias-festivos/ is one
// section covering both the country and the subdivision family. Grouping by family split
// those apart and produced headings for distinctions the URL does not make.
//
// WHY THE MAP IS DERIVED AND NOT WRITTEN DOWN. The section a segment belongs to is already
// decided, once, by ATLAS_SEGMENTS in atlas-urls.js, which is what builds the URLs in the
// first place. A second table listing the same relationship would be a second thing to keep
// in step, so this inverts the first one. A segment claimed by two sections would make the
// grouping arbitrary, so that throws here rather than rendering a page under whichever
// section happened to be last.
import { ATLAS_SEGMENTS } from './atlas-urls.js';
import { PACKS } from './content/lang/index.js';

const BY_LANGUAGE = (() => {
  const out = new Map();
  for (const [section, byLang] of Object.entries(ATLAS_SEGMENTS)) {
    for (const [lang, segment] of Object.entries(byLang)) {
      if (!out.has(lang)) out.set(lang, new Map());
      const seen = out.get(lang).get(segment);
      if (seen && seen !== section) {
        throw new Error(
          `the Atlas segment /${lang}/${segment}/ is claimed by both the ${seen} and the ` +
          `${section} section, so a page under it cannot be grouped`
        );
      }
      out.get(lang).set(segment, section);
    }
  }
  return out;
})();

/** The section key for a published Atlas path, or null if its segment is not one of ours. */
export function sectionOf(path) {
  const parts = String(path || '').split('/');
  if (parts.length < 4) return null;
  return BY_LANGUAGE.get(parts[1])?.get(parts[2]) || null;
}

/**
 * The heading for a section, in `locale`, from that language's own pack. Returns null rather
 * than a slug or an English fallback: a directory that renders a section it cannot name is
 * the bug this replaced, where every heading read "Livdar", and silence is easier to catch
 * in a test than a plausible looking wrong word.
 */
export function sectionHeading(locale, section) {
  return PACKS[locale]?.sections?.[section] || null;
}

export const sectionKeys = () => Object.keys(ATLAS_SEGMENTS);
