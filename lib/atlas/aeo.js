// Answer engines.
//
// A page that ranks and a page that gets quoted are not the same page. An
// answer engine lifts a fact, a table, a comparison or a definition, and it
// lifts it from a page that states the thing plainly, dates it, and says where
// it came from. A page that buries the answer under six hundred words of
// preamble ranks fine and gets quoted never.
//
// This module does not chase any particular engine's ranking. It says what a
// family has to contain to be quotable at all, which is the part that is under
// Livdar's control and which does not change when an engine changes.
//
// The blocks are deliberately few. A family that claims all of them is a
// family nobody has thought about.

export const BLOCKS = {
  'direct-answer': {
    what: 'A single sentence at the top that answers the question the title asks, with the number in it',
    when: 'Any family whose title is a question with one answer',
  },
  'fact-table': {
    what: 'A table of measured values with units, each row citing its source and its date',
    when: 'Cost, rent, salary, tax, price and speed families',
  },
  comparison: {
    what: 'Two named things side by side on the same measures, with the difference stated as a number',
    when: 'Anything with versus in the intent',
  },
  definition: {
    what: 'What an entity is, in one paragraph, with its identifiers',
    when: 'Hub pages for a city, country, neighbourhood or venue',
  },
  steps: {
    what: 'An ordered procedure with what is needed at each step',
    when: 'Visa, residency, banking, registration and permit families',
  },
  eligibility: {
    what: 'Whether the reader qualifies, given their nationality or situation, stated as a rule rather than as prose',
    when: 'Audience axis families where the answer differs by who is asking',
  },
  'dated-list': {
    what: 'A list of things with dates, ordered, with the generation time stated',
    when: 'Event and temporal families',
  },
  faq: {
    what: 'Questions people actually ask, answered',
    when: 'Only where the questions were measured. A family that lists this without measured questions is writing filler.',
    guard: 'requires measured questions',
  },
};

export const BLOCK_IDS = Object.keys(BLOCKS);

// Schema that is valid for a shape, not schema sprayed at everything.
export const SCHEMA_FOR = {
  'fact-table': ['Dataset'],
  comparison: ['Dataset'],
  definition: ['Place', 'City', 'Country'],
  steps: ['HowTo'],
  'dated-list': ['Event', 'ItemList'],
  faq: ['FAQPage'],
  'direct-answer': [],
  eligibility: [],
};

// How quotable a family is, and why. The score is the honest part: a family
// with a measured number, a source and a date is quotable; one with an
// opinion is not, however well written.
export function quotability(family) {
  const blocks = family.aeo || [];
  const reasons = [];
  let score = 0;
  if (blocks.includes('direct-answer')) { score += 0.3; reasons.push('answers in one sentence'); }
  if (blocks.includes('fact-table') || blocks.includes('comparison')) { score += 0.3; reasons.push('carries measured values with units'); }
  if (blocks.includes('steps') || blocks.includes('eligibility')) { score += 0.2; reasons.push('carries a procedure or a rule'); }
  if (blocks.includes('definition')) { score += 0.1; reasons.push('defines its entity'); }
  if (blocks.includes('dated-list')) { score += 0.1; reasons.push('carries dated items'); }
  // A source requirement is what separates a quotable page from a confident
  // one, so a family with no verified source cannot score full marks whatever
  // blocks it declares.
  const sourced = (family.requiredSources || []).length > 0;
  if (!sourced) { score *= 0.5; reasons.push('no verified source, so the numbers cannot be cited'); }
  return { score: Math.round(Math.min(1, score) * 100) / 100, reasons };
}

export function validateBlocks(family) {
  const errors = [];
  for (const b of family.aeo || []) {
    if (!BLOCKS[b]) errors.push('unknown block: ' + b);
    if (b === 'faq' && !family.measuredQuestions) errors.push('faq declared without measured questions');
  }
  if ((family.aeo || []).length > 5) errors.push('declares ' + family.aeo.length + ' blocks, which means nobody chose');
  return errors;
}
