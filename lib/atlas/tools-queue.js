// The tools, specified and put in an order.
//
// Tools carry the best opportunity score in the programme and until now they
// existed only as a family with a list of ids. That is not enough to build
// from: a calculator needs to know what the reader types in, what data it
// computes against, what it is worth, and how hard it is to make. Without
// those four things a build queue is a wish list.
//
// The ordering rule is explicit and it is not volume. A tool earns its place
// by being reachable, worth something, and cheap enough to ship. The head
// terms are in the list at full size and near the bottom of the queue, which
// is the honest position: tax calculator at 351,000 a month and difficulty 74
// is not a launch target for a site with no authority, and pretending
// otherwise would put the largest number first and the shippable work last.

export const COMPLEXITY = { trivial: 1, small: 2, medium: 3, large: 4, research: 5 };

// Every demand figure is measured, in en-US on 2026-09-24, and every one that
// is not is marked. cpcUsd is what somebody else pays for that click.
export const TOOLS = [
  {
    id: 'moving-cost', name: 'Moving cost calculator', family: 'tools.calculator',
    volume: 2500, difficulty: 41, cpcUsd: 5.0,
    markets: ['all eleven, unmeasured outside en-US'],
    competitor: 'removals companies and comparison sites, none of them a relocation product',
    inputs: ['origin city', 'destination city', 'home size', 'date'],
    sources: ['none, the estimate is a model over distance, volume and route'],
    leadsTo: ['moving-service'],
    complexity: 'small',
    note: 'The highest cost per click measured anywhere in this research, and the only top tool that needs no licensed dataset. That combination is why it is first.',
  },
  {
    id: 'where-should-i-live', name: 'Where should I live', family: 'tools.matcher',
    volume: 1500, difficulty: 1, cpcUsd: 0.1,
    markets: ['all eleven, unmeasured outside en-US'],
    competitor: 'quiz sites with no data behind the answer',
    inputs: ['budget', 'climate', 'language', 'work situation', 'priorities'],
    sources: ['cost-of-living-verified', 'rent-index-verified'],
    leadsTo: ['premium-tool', 'stay-booking', 'relocation-service'],
    complexity: 'medium',
    note: 'The best ratio of demand to difficulty in the entire programme, 1,500 a month at difficulty 1. It is also the planner in its page form and it walks the same graph paths, so it is worth more than its own traffic.',
  },
  {
    id: 'commute', name: 'Commute calculator', family: 'tools.calculator',
    volume: 350, difficulty: 9, cpcUsd: 2.0,
    markets: ['all eleven, unmeasured outside en-US'],
    competitor: 'mapping products, which answer the route and not the cost or the choice',
    inputs: ['home area', 'work area', 'mode'],
    sources: ['transit-fares-verified'],
    leadsTo: ['rental-lead', 'stay-booking'],
    complexity: 'medium',
    note: 'Two dollars a click at difficulty 9. It is the tool that connects Areas to Stay, which no competitor in the set does.',
  },
  {
    id: 'rent-affordability', name: 'Rent affordability', family: 'tools.calculator',
    volume: 3600, difficulty: 31, cpcUsd: 0.3,
    markets: ['all eleven, unmeasured outside en-US'],
    competitor: 'US rental portals, almost entirely domestic',
    inputs: ['income', 'city', 'household size'],
    sources: ['rent-index-verified'],
    leadsTo: ['rental-lead'],
    complexity: 'small',
    note: 'The largest winnable volume of the calculators. Every competitor answers it for one country, and the cross border version is the gap.',
  },
  {
    id: 'cost-of-living-comparison', name: 'Cost of living comparison', family: 'tools.cost-comparison',
    volume: 49000, difficulty: null, cpcUsd: 0.45,
    markets: ['all eleven'],
    competitor: 'numbeo, whose comparison page takes 24,427 visits, ten times its next best page',
    inputs: ['city a', 'city b', 'income'],
    sources: ['cost-of-living-verified'],
    leadsTo: ['relocation-service', 'stay-booking'],
    complexity: 'medium',
    note: 'Measured on 23 September as the single biggest page in the competitive set. Difficulty is not recorded for the head term; the pair pages underneath it are where a new site enters.',
  },
  {
    id: 'relocation-budget', name: 'Relocation budget', family: 'tools.calculator',
    volume: 150, difficulty: 12, cpcUsd: 0.9,
    markets: ['all eleven, unmeasured outside en-US'],
    competitor: 'relocation agencies, gated behind a contact form',
    inputs: ['origin', 'destination', 'household', 'timeline'],
    sources: ['cost-of-living-verified', 'rent-index-verified'],
    leadsTo: ['relocation-service', 'moving-service'],
    complexity: 'medium',
    note: 'Small volume, high intent, and the natural end of the Move funnel.',
  },
  {
    id: 'net-salary', name: 'Net salary calculator', family: 'tools.calculator',
    volume: 2300, difficulty: 59, cpcUsd: 1.6,
    markets: ['all eleven, and the answer differs by market, so this is an audience axis tool'],
    competitor: 'national payroll sites, one country each',
    inputs: ['gross salary', 'country', 'status'],
    sources: ['tax-rules-verified'],
    leadsTo: ['relocation-service', 'premium-tool'],
    complexity: 'large',
    note: 'Difficulty 59 and a tax source that does not exist. The cross border version, what this salary is worth after tax in that country, is the differentiated one and it needs the hardest source in the programme.',
  },
  {
    id: 'travel-budget', name: 'Travel budget', family: 'tools.calculator',
    volume: 150, difficulty: 9, cpcUsd: 0.7,
    markets: ['all eleven, unmeasured outside en-US'],
    competitor: 'travel blogs with static tables',
    inputs: ['destination', 'nights', 'style'],
    sources: ['cost-of-living-verified'],
    leadsTo: ['stay-booking'],
    complexity: 'small',
  },
  {
    id: 'neighbourhood-matcher', name: 'Neighbourhood matcher', family: 'tools.matcher',
    volume: null, difficulty: null, cpcUsd: null,
    markets: ['all eleven'],
    competitor: 'none found that uses data rather than editorial',
    inputs: ['city', 'budget', 'persona', 'commute anchor'],
    sources: ['neighbourhood-facts-verified', 'rent-index-verified'],
    leadsTo: ['rental-lead', 'stay-booking'],
    complexity: 'medium',
    note: 'No measured demand for the tool itself. It is here because it is the persona axis made interactive, and because the neighbourhood pages it sits on do have measured demand in every market.',
  },
  {
    id: 'city-comparison', name: 'City comparison', family: 'tools.cost-comparison',
    volume: null, difficulty: null, cpcUsd: null,
    markets: ['all eleven'],
    competitor: 'expatistan and livingcost, both of which rank on exactly this shape',
    inputs: ['city a', 'city b'],
    sources: ['cost-of-living-verified', 'rent-index-verified'],
    leadsTo: ['relocation-service'],
    complexity: 'small',
  },
  {
    id: 'country-comparison', name: 'Country comparison', family: 'tools.cost-comparison',
    volume: null, difficulty: null, cpcUsd: null,
    markets: ['all eleven'],
    competitor: 'livingcost, whose British pages are sixteen of its top twenty',
    inputs: ['country a', 'country b'],
    sources: ['cost-of-living-verified', 'tax-rules-verified'],
    leadsTo: ['relocation-service'],
    complexity: 'small',
  },
  {
    id: 'event-trip-planner', name: 'Event trip planner', family: 'tools.matcher',
    volume: null, difficulty: null, cpcUsd: 1.4,
    markets: ['all eleven'],
    competitor: 'none, and hotels near a named venue is 3,000 a month at difficulty 2',
    inputs: ['event', 'budget', 'nights'],
    sources: ['events-verified', 'venue-data-verified', 'stay-inventory-verified'],
    leadsTo: ['stay-booking', 'ticket'],
    complexity: 'large',
    note: 'The tool form of stay.near-venue, which carries the best combination of volume, difficulty and value measured anywhere. Three missing sources is what keeps it out of the top of the queue.',
  },
  {
    id: 'visa-eligibility', name: 'Visa eligibility', family: 'tools.calculator',
    volume: 10, difficulty: null, cpcUsd: null,
    markets: ['all eleven, and the answer differs by nationality, so this is an audience axis tool'],
    competitor: 'immigration firms, gated',
    inputs: ['nationality', 'destination', 'purpose', 'income'],
    sources: ['visa-rules-verified'],
    leadsTo: ['relocation-service'],
    complexity: 'large',
    note: 'Ten searches a month for the tool and 3,300 for the UAE golden visa, 2,900 for the Spanish nomad visa. Nobody searches for the tool; they search for the answer it gives. It is kept for product role and it should be built into the visa pages rather than as a destination of its own.',
  },
  {
    id: 'property-affordability', name: 'Property affordability', family: 'tools.calculator',
    volume: 50, difficulty: 63, cpcUsd: 0.5,
    markets: ['all eleven, unmeasured outside en-US'],
    competitor: 'mortgage lenders, domestic',
    inputs: ['income', 'deposit', 'country'],
    sources: ['property-price-verified'],
    leadsTo: ['property-lead'],
    complexity: 'medium',
  },
  {
    id: 'destination-matcher', name: 'Remote work destination matcher', family: 'tools.matcher',
    volume: null, difficulty: null, cpcUsd: null,
    markets: ['all eleven'],
    competitor: 'nomads.com, whose city profiles take between 10 and 47 visits each',
    inputs: ['budget', 'timezone', 'climate', 'visa status'],
    sources: ['cost-of-living-verified', 'visa-rules-verified', 'connectivity-data-verified'],
    leadsTo: ['premium-tool', 'relocation-service'],
    complexity: 'medium',
    note: 'The competitor is explicit negative evidence, which is a reason to build the tool and not the thousand city pages behind it.',
  },
  {
    id: 'where-should-i-stay', name: 'Where should I stay', family: 'tools.matcher',
    volume: null, difficulty: null, cpcUsd: 0.3,
    markets: ['all eleven'],
    competitor: 'booking sites answer availability, not which area',
    inputs: ['city', 'trip purpose', 'budget', 'anchor'],
    sources: ['neighbourhood-facts-verified', 'stay-inventory-verified'],
    leadsTo: ['stay-booking'],
    complexity: 'medium',
    note: 'Best areas to stay in Rome is 700 a month at difficulty 3, which is the page this tool sits on.',
  },
  {
    id: 'relocation-checklist', name: 'Relocation checklist', family: 'tools.calculator',
    volume: 150, difficulty: 12, cpcUsd: 0.9,
    markets: ['all eleven, and the steps differ by nationality and destination'],
    competitor: 'blog posts with static lists',
    inputs: ['origin', 'destination', 'date', 'household'],
    sources: ['visa-rules-verified', 'country-facts-verified'],
    leadsTo: ['relocation-service', 'moving-service'],
    complexity: 'small',
  },
  {
    id: 'salary-calculator', name: 'Salary calculator', family: 'tools.calculator',
    volume: 148000, difficulty: 69, cpcUsd: 0.4,
    markets: ['all eleven'],
    competitor: 'payscale, glassdoor, national payroll sites',
    inputs: ['role', 'city', 'experience'],
    sources: ['salary-data-verified'],
    leadsTo: ['job-listing', 'premium-tool'],
    complexity: 'large',
    note: 'Recorded at full size and explicitly not a launch target. Difficulty 69 against incumbents who own this term.',
  },
  {
    id: 'income-tax', name: 'Tax calculator', family: 'tools.calculator',
    volume: 351000, difficulty: 74, cpcUsd: 0.9,
    markets: ['all eleven'],
    competitor: 'national tax authorities and accounting software',
    inputs: ['income', 'country', 'status'],
    sources: ['tax-rules-verified'],
    leadsTo: ['premium-tool'],
    complexity: 'research',
    note: 'The largest number in the research and the least winnable. It is in the list so that nobody proposes it later as if it were new.',
  },
];

const demandScore = (v) => (v == null ? 0.25 : Math.min(1, Math.log10(v + 1) / 5));
const winnability = (d) => (d == null ? 0.6 : Math.max(0, 1 - d / 100));
const valueScore = (c) => (c == null ? 0.2 : Math.min(1, c / 5));
const buildScore = (c) => 1 - (COMPLEXITY[c] - 1) / 5;
const sourcesReady = (t, blocked) => t.sources.every((s) => s.startsWith('none') || !blocked.has(s));

// The queue. Shippability is a real term rather than a footnote: a tool that
// needs three sources nobody has is not a first build however good it is.
export function queue(blockedSources = new Set()) {
  return TOOLS.map((t) => {
    const ready = sourcesReady(t, blockedSources);
    const score = demandScore(t.volume) * 0.3 + winnability(t.difficulty) * 0.2 + valueScore(t.cpcUsd) * 0.25 + buildScore(t.complexity) * 0.25;
    return {
      ...t,
      sourcesReady: ready,
      missingSources: t.sources.filter((s) => !s.startsWith('none') && blockedSources.has(s)),
      score: Math.round(score * 1000) / 1000,
      // Ready to build now beats a better tool that cannot be built yet, and
      // the penalty is stated rather than hidden inside the score.
      queueScore: Math.round(score * (ready ? 1 : 0.45) * 1000) / 1000,
    };
  }).sort((a, b) => b.queueScore - a.queueScore);
}

export function buildable(blockedSources = new Set()) {
  return queue(blockedSources).filter((t) => t.sourcesReady);
}
