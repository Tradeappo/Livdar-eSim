// Whether one place gets a page of its own.
//
// A city has thousands of cafes. Almost none of them are searched by name,
// and a page for each is the fastest way to build a hundred thousand URLs
// nobody asked for and Google will not keep. The research says so plainly and
// says it twice, in two different surfaces.
//
// AllTrails: Angels Landing is searched 82,000 times a month and its page
// takes 3,968 visits. The trails nobody names live on the city by activity
// hub, and that hub takes ten times more than any single trail page.
//
// Fever: Arte Museum Las Vegas is searched 34,000 times a month and its page
// earns. A concert on a Tuesday does not have a name and does not earn.
//
// Coworker: the individual venue pages take between 28 and 100 visits each,
// which is the shape that looks like scale and is not.
//
// So the rule is one rule with two levels. The hub always exists. The
// individual page exists when the thing itself is searched, is described well
// enough to say something true, and would not be a near copy of its
// neighbours.

export const LEVELS = ['category-hub', 'neighbourhood-hub', 'individual'];

// Every threshold here is a starting position, not a finding. There is no
// measured Livdar POI data yet, so these are written down to be argued with
// and replaced by measurement, which is what `source` records.
export const GATE = {
  // Searched by its own name, in the market's own language.
  minNamedVolume: 50,
  // Enough structured fields to write a page that is not a stub.
  minFieldCompleteness: 0.7,
  // Enough independent description to avoid the template reading through.
  minDistinctFacts: 6,
  // A place inside a neighbourhood that is itself searched inherits some
  // demand, so the bar is lower there.
  neighbourhoodVolumeCredit: 0.5,
  source: 'declared, pending Livdar own POI measurement',
};

export const CATEGORY_HUB_RULE = {
  rule: 'A category hub exists for every category in every city above the family tier, whether or not any individual place in it qualifies.',
  why: 'The hub is what the research shows earning. Restaurants in Soho takes 5,905 visits; no single Soho restaurant page would take a fraction of that.',
};

export function gateIndividual(poi, gate = GATE) {
  const reasons = [];
  const volume = Number(poi.namedVolume) || 0;
  const credited = volume + (poi.neighbourhoodVolume ? poi.neighbourhoodVolume * gate.neighbourhoodVolumeCredit : 0);
  if (credited < gate.minNamedVolume) reasons.push('searched ' + Math.round(credited) + ' times a month against a floor of ' + gate.minNamedVolume);
  const completeness = Number(poi.fieldCompleteness);
  if (!(completeness >= gate.minFieldCompleteness)) reasons.push('only ' + Math.round((completeness || 0) * 100) + ' percent of fields are present');
  const facts = Number(poi.distinctFacts) || 0;
  if (facts < gate.minDistinctFacts) reasons.push('only ' + facts + ' distinct facts, so the page would be a template');
  if (poi.licence === 'unclear' || !poi.licence) reasons.push('no licence recorded for the source data');
  return { pass: reasons.length === 0, level: reasons.length === 0 ? 'individual' : 'category-hub', reasons };
}

// What a city actually produces once the gate is applied. The two numbers
// that matter are how many hubs exist, which is deterministic, and how many
// individual pages survive, which is not.
export function cityYield({ categories, neighbourhoods, poisPerCategory, passRate }) {
  const categoryHubs = categories;
  const neighbourhoodHubs = categories * neighbourhoods;
  const individuals = Math.round(categories * poisPerCategory * passRate);
  return {
    categoryHubs,
    neighbourhoodHubs,
    individuals,
    total: categoryHubs + neighbourhoodHubs + individuals,
    note: 'Hubs are deterministic and individuals are earned. If the pass rate is unknown the individual figure is a projection and must be reported as one.',
  };
}

// The categories worth a hub. Short, and every one of them appeared in the
// research rather than in a brainstorm.
export const POI_CATEGORIES = [
  { id: 'restaurants', evidence: 'restaurants in soho, 6,100 a month, page takes 5,905' },
  { id: 'cafes', evidence: 'category present across every city guide competitor; the named neighbourhood phrasing measured zero in English and has to be measured locally' },
  { id: 'bars', evidence: 'rooftop bars in barcelona, measured but small in English' },
  { id: 'coworking', evidence: 'coworking barcelona 2,100 at a three dollar cost per click, coworking berlin 600 at four dollars' },
  { id: 'gyms', evidence: 'best gyms in dubai, 100 a month at difficulty 0' },
  { id: 'spas-wellness', evidence: 'best spas in london, 1,000 a month, page takes 4,128' },
  { id: 'museums-galleries', evidence: 'top museums in london, 14,000 a month, page takes 2,171' },
  { id: 'malls-shopping', evidence: 'malls in dubai, 250 a month at a sixty cent cost per click' },
  { id: 'parks-beaches', evidence: 'present in every city guide competitor and in the AllTrails place by activity shape' },
  { id: 'nightlife', evidence: 'category hub across competitors; the individual venue level is left to the gate' },
];
