// How much rent an income can carry.
//
// The tool that was held back the longest for the wrong reason. It was waiting
// for a rent level, on the argument that a rent index cannot price a city, and
// that argument is true and answers a different question. What a reader types
// is how much rent they can afford, and that is a function of their income and
// of a rule, not of any rent.
//
// So the rule is the product here, and it is stated rather than applied
// silently. Thirty percent of gross pay is the share most landlords and lenders
// test against; thirty five is the point past which the rest of a household
// budget starts to give. Neither is a measurement, both are conventions, and a
// calculator that presented them as findings would be the dishonest version of
// this page.
//
// What it refuses is the second half of the question: whether the number it
// produces is enough anywhere in particular. That needs a rent level for a
// named city and no comparable one exists, so the tool returns the budget and
// says the gap out loud.

export const SHARES = [
  { share: 0.3, label: 'the share most landlords and lenders test against' },
  { share: 0.35, label: 'the ceiling past which the rest of a budget gives way' },
];

export const REFUSES = [
  'whether the budget is enough in a named city, which needs a rent level that is not published',
  'what a particular flat costs, for the same reason',
  'whether a landlord will accept the applicant, which is a credit decision and not an arithmetic one',
];

const round = (n) => Math.round(n);

// `income` is the household's monthly income, in whatever currency it is paid,
// because every number here is a proportion of it and a proportion is the same
// in every currency. `household` is used only to express the budget per person,
// which is the figure a shared flat is actually decided on.
export function rentBudget({ income, household = 1 } = {}) {
  if (!(income > 0)) return { ok: false, why: 'a monthly income above zero is needed' };
  if (!(household >= 1)) return { ok: false, why: 'a household of at least one person is needed' };
  const rows = SHARES.map((s) => ({
    share: s.share,
    percent: Math.round(s.share * 100),
    monthly: round(income * s.share),
    perPerson: round((income * s.share) / household),
    meaning: s.label,
  }));
  return {
    ok: true,
    income: round(income),
    household,
    rows,
    // The same figure the whole page turns on, named once so a caller does not
    // have to know which row is the conventional one.
    conventional: rows[0].monthly,
    ceiling: rows[rows.length - 1].monthly,
    basis: 'a stated share of monthly income, not a measured rent',
    refuses: REFUSES,
    attribution: 'Livdar, on a stated affordability convention. Rent movement for context comes from Eurostat.',
  };
}
