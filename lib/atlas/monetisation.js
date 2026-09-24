// What a page is worth, as opposed to how many people see it.
//
// The measurement on 2026-09-24 made the case better than an argument could.
// Concerts in Chicago is 13,000 searches a month at a cost per click of three
// cents. Hotels near Madison Square Garden is 3,000 searches a month at
// difficulty 2 with a cost per click of one dollar forty. The second has less
// than a quarter of the volume and roughly fifteen times the value per visit,
// and a ranking that reads volume alone puts them the wrong way round.
//
// Cost per click is not revenue. It is the clearest public signal of what
// somebody else is already willing to pay for that click, and it is available
// for every keyword, which is why it is the anchor here.

export const TRANSACTIONS = {
  'stay-booking': { label: 'Hotel or short stay booking', model: 'commission', maturity: 'available', cpcAnchorUsd: 1.4, evidence: 'hotels near madison square garden, cpc 140 cents' },
  'rental-lead': { label: 'Long stay or room rental lead', model: 'lead or listing fee', maturity: 'available', cpcAnchorUsd: 1.1, evidence: 'short term rentals lisbon cpc 110, pet friendly apartments austin cpc 250' },
  'student-housing': { label: 'Student accommodation', model: 'lead', maturity: 'available', cpcAnchorUsd: 1.6, evidence: 'student accommodation london, cpc 160 cents' },
  'coliving': { label: 'Coliving placement', model: 'commission', maturity: 'available', cpcAnchorUsd: 0.8, evidence: 'coliving lisbon cpc 80, coliving madrid 2,900 a month' },
  'coworking-booking': { label: 'Coworking day pass or membership', model: 'commission', maturity: 'available', cpcAnchorUsd: 3.5, evidence: 'coworking barcelona cpc 300, coworking berlin cpc 400, coworking in bali cpc 400' },
  'moving-service': { label: 'Removals and moving services', model: 'lead', maturity: 'available', cpcAnchorUsd: 5.0, evidence: 'moving cost calculator, cpc 500 cents, the highest measured anywhere in this research' },
  'property-lead': { label: 'Property purchase lead', model: 'lead', maturity: 'later', cpcAnchorUsd: 0.5, evidence: 'property affordability calculator cpc 50' },
  'esim-sale': { label: 'eSIM', model: 'direct sale', maturity: 'live', cpcAnchorUsd: null, evidence: 'the existing Livdar product, 833 measured keywords across 18 markets' },
  'insurance': { label: 'Health and travel insurance', model: 'commission', maturity: 'later', cpcAnchorUsd: null, evidence: 'globalhealth.insurance holds 11 percent of the German set and 13 percent of the French one' },
  'banking-referral': { label: 'Account opening referral', model: 'referral', maturity: 'later', cpcAnchorUsd: null, evidence: 'wise.com present in every market competitor set' },
  'ticket': { label: 'Event ticket', model: 'affiliate', maturity: 'later', cpcAnchorUsd: 0.2, evidence: 'f1 las vegas tickets 6,000 a month at difficulty 69, cpc 20' },
  'experience-booking': { label: 'Tour, lesson or experience', model: 'commission', maturity: 'later', cpcAnchorUsd: 0.5, evidence: 'sailing in croatia cpc 50, paddle boarding miami cpc 50, diving in tenerife cpc 35' },
  'sport-rental': { label: 'Equipment rental', model: 'commission', maturity: 'later', cpcAnchorUsd: 0.3, evidence: 'kayaking in dubai cpc 30, surf spots in portugal cpc 20' },
  'job-listing': { label: 'Job or employer listing', model: 'listing fee', maturity: 'later', cpcAnchorUsd: 0.8, evidence: 'remote jobs europe cpc 80' },
  'relocation-service': { label: 'Relocation and visa services', model: 'lead', maturity: 'later', cpcAnchorUsd: 0.9, evidence: 'relocation checklist cpc 90' },
  'promoted-listing': { label: 'Promoted local business', model: 'listing fee', maturity: 'later', cpcAnchorUsd: 0.4, evidence: 'malls in dubai cpc 60, best gyms in dubai cpc 35' },
  'premium-tool': { label: 'Paid tool or subscription', model: 'subscription', maturity: 'later', cpcAnchorUsd: null, evidence: 'no external anchor; the value is retention rather than a click' },
  none: { label: 'No transaction behind it', model: null, maturity: 'n/a', cpcAnchorUsd: 0, evidence: 'recorded so the cost is visible rather than assumed away' },
};

export const TRANSACTION_IDS = Object.keys(TRANSACTIONS);

// A family declares what it leads to. This turns the declaration into a
// number the ranking can use, on the same nought to one scale as the other
// priors, anchored on the highest cost per click in the set rather than on a
// round number somebody liked.
const MAX_ANCHOR = Math.max(...Object.values(TRANSACTIONS).map((t) => t.cpcAnchorUsd || 0));

export function monetisationScore(transactionIds = []) {
  if (!transactionIds.length) return 0;
  let best = 0;
  for (const id of transactionIds) {
    const t = TRANSACTIONS[id];
    if (!t) throw new Error('unknown transaction: ' + id);
    const anchor = t.cpcAnchorUsd == null ? 0.3 : t.cpcAnchorUsd / MAX_ANCHOR;
    // Something Livdar can bill today is worth more than something it might
    // bill later, and the discount is stated rather than folded into a prior.
    const maturity = t.maturity === 'live' ? 1 : t.maturity === 'available' ? 0.8 : t.maturity === 'later' ? 0.45 : 0;
    best = Math.max(best, anchor * maturity);
  }
  return Math.round(Math.min(1, best) * 100) / 100;
}

// The map the brief asked for, read the other way: which surfaces feed which
// transaction. Useful for spotting a transaction with only one way into it.
export function byTransaction(families) {
  const out = {};
  for (const [id, f] of Object.entries(families)) {
    for (const t of f.leadsTo || ['none']) {
      if (!out[t]) out[t] = [];
      out[t].push(id);
    }
  }
  return out;
}
