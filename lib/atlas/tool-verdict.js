// The verdict a calculator reaches, and the colour that carries it.
//
// Extracted from the affordability card in the V164 reference, which does one
// thing this codebase was not doing: it puts the answer in the background of the
// card rather than in the colour of a number. A reader glancing at a green block
// has the answer before reading a digit, and that is the whole point of a
// calculator on a page somebody landed on from a search result.
//
// Four states, and they are not decoration. Each threshold is the published rule
// the tool is built on rather than a number chosen to make four bands:
//
//   comfortable   at or under 30 per cent of income, the share most landlords
//                 and lenders test against
//   healthy       at or under 35 per cent, the ceiling past which the rest of a
//                 household budget starts to give
//   tight         at or under half of income
//   unaffordable  more than half
//
// The gradients are the reference's own, kept to the character so the card looks
// like the design it came from. They live here rather than in CSS because the
// state is computed and a class per state would mean the rule existing twice.

export const STATES = ['comfortable', 'healthy', 'tight', 'unaffordable'];

// The reference's palette, unchanged. `comfortable` is its resting green, and the
// three others are the ones its updateBudget switches to.
export const GRADIENTS = {
  comfortable: 'linear-gradient(135deg,#1eab62,#4dcc70 58%,#8ce676)',
  healthy: 'linear-gradient(135deg,#1fa85c,#91e875)',
  tight: 'linear-gradient(135deg,#ff8c2e,#ff624d)',
  unaffordable: 'linear-gradient(135deg,#c72d48,#ff5e68)',
};

// Where each band ends, as a share of income. The first two are the published
// conventions in lib/atlas/tools/rent-affordability.js; the third is half.
export const BANDS = [
  { state: 'comfortable', upTo: 0.30 },
  { state: 'healthy', upTo: 0.35 },
  { state: 'tight', upTo: 0.50 },
  { state: 'unaffordable', upTo: Infinity },
];

// The state for a cost against an income. Returns null rather than a state when
// there is nothing to judge, so a card can open in a resting colour instead of
// implying a verdict about numbers nobody has entered.
export function stateForShare(share) {
  // Number.isFinite rather than a comparison, because `null >= 0` is true in
  // JavaScript and an empty input would otherwise read as a comfortable nought.
  if (!Number.isFinite(share) || share < 0) return null;
  return (BANDS.find((b) => share <= b.upTo) || BANDS[BANDS.length - 1]).state;
}

// How full the orb is: the share of income the cost takes, capped, because a rent
// of twice an income is not a fuller circle than a rent of one and a half.
export const fillForShare = (share) => (Number.isFinite(share) && share >= 0 ? Math.min(100, Math.round(share * 100)) : 0);

// A comparison rather than an affordability: cheaper is the good news and dearer
// is not, so the same four states carry it. The thresholds are the same
// proportions read the other way round, which keeps one scale in the reader's
// head across the two kinds of calculator.
export function stateForRatio(ratio) {
  if (!Number.isFinite(ratio) || ratio <= 0) return null;
  // Meaningfully cheaper, about the same either way, noticeably dearer, and much
  // dearer. The middle band is deliberately wide: a place that costs one per cent
  // more than home has not become a problem, and the first version of this turned
  // orange there.
  if (ratio <= 0.85) return 'comfortable';
  if (ratio <= 1.15) return 'healthy';
  if (ratio <= 1.50) return 'tight';
  return 'unaffordable';
}

export const gradientFor = (state) => GRADIENTS[state] || GRADIENTS.comfortable;
