// City tiers. One definition, used by the ingest, the inventory, the scoring
// and the tests, so a tier never means two different things.
//
// A tier is a statement about what data and demand a place can support, not
// about how many pages it gets. Tier one cities have a housing market, a
// salary market and a relocation audience; tier four places have climate and
// geography and little else that can be sourced.

export const TIERS = [
  { tier: 1, minPopulation: 1000000, note: 'metropolitan, supports every vertical when the sources exist' },
  { tier: 2, minPopulation: 200000, note: 'large city, supports living costs, rents, transport and safety' },
  { tier: 3, minPopulation: 50000, note: 'mid size, supports geography, climate and hub pages' },
  { tier: 4, minPopulation: 0, note: 'small, hub and climate only' },
];

export function tierOf(population) {
  for (const t of TIERS) if (population >= t.minPopulation) return t.tier;
  return 4;
}
