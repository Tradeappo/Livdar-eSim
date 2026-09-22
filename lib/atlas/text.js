// Text rules for everything the public sees.
//
// One rule dominates: no en dash and no em dash, in any language, in any
// public element. Source data does not respect it, so the rule is enforced at
// two points: ingest normalises the dashes out of entity names, and the QA
// gate refuses any generated page that still contains one. The normalisation
// is recorded, never silent, so a name that changed can always be traced back
// to its identifier.
//
// The forbidden characters are built from code points so this file can
// describe them without containing them.

const FORBIDDEN_CODE_POINTS = [0x2010, 0x2011, 0x2012, 0x2013, 0x2014, 0x2015, 0x2212, 0xfe58, 0xfe63, 0xff0d];
const FORBIDDEN = FORBIDDEN_CODE_POINTS.map((c) => String.fromCodePoint(c));
const FORBIDDEN_RE = new RegExp('[' + FORBIDDEN.join('') + ']', 'g');

export const HYPHEN = String.fromCodePoint(0x2d);

export function hasForbiddenDash(text) {
  FORBIDDEN_RE.lastIndex = 0;
  return FORBIDDEN_RE.test(String(text == null ? '' : text));
}

// A dash between words becomes a plain hyphen. A dash used as a sentence
// separator, which is what an em dash usually is, becomes a comma followed by
// a space, because a hyphen standing in for punctuation is the other half of
// the same rule.
export function normalizeDashes(text) {
  if (text == null) return text;
  let out = String(text);
  out = out.replace(new RegExp('\\s*[' + String.fromCodePoint(0x2014) + String.fromCodePoint(0x2015) + ']\\s*', 'g'), ', ');
  out = out.replace(FORBIDDEN_RE, HYPHEN);
  return out.replace(/\s+/g, ' ').trim();
}

// Walks any structure and reports where a forbidden dash survives. Used by
// the QA gate, which refuses the page rather than fixing it: a page whose
// text still contains one means a generator wrote it, and the generator is
// what needs the fix.
export function findForbiddenDashes(value, path = '') {
  const hits = [];
  const visit = (v, p) => {
    if (typeof v === 'string') { if (hasForbiddenDash(v)) hits.push({ path: p, text: v.slice(0, 120) }); return; }
    if (Array.isArray(v)) { v.forEach((x, i) => visit(x, p + '[' + i + ']')); return; }
    if (v && typeof v === 'object') { for (const [k, x] of Object.entries(v)) visit(x, p ? p + '.' + k : k); }
  };
  visit(value, path);
  return hits;
}

// The other half of the writing rule: a hyphen standing in for punctuation
// between two clauses. A hyphen inside a word, a name or an identifier is
// fine; a hyphen surrounded by spaces between two clauses is not.
export function findHyphenAsPunctuation(text) {
  const re = new RegExp('(?<=[a-z0-9\\)\\]])\\s' + HYPHEN + '\\s(?=[a-zA-Z])', 'g');
  return (String(text || '').match(re) || []).length;
}
