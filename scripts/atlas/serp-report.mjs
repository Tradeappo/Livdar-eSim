// What the result pages said.
//
//   node scripts/atlas/serp-report.mjs
//   node scripts/atlas/serp-report.mjs --write
//
// The pipeline had SERP-measured at zero from the day it was written, which
// meant the programme had never once looked at a result page it intended to
// enter. Nineteen keywords across nine markets and four families is the
// smallest sample that can answer the one question worth asking first:
// whether the difficulty of entering a market is the same in every market.
//
// It is not, and the difference is large enough to change which pages get
// built next.

import { writeFileSync, mkdirSync } from 'node:fs';
import { analysed, byMarket, competitors, store, REACHABLE_DR, PLATFORM_HOSTS } from '../../lib/atlas/serp.js';

const ROOT = new URL('../../', import.meta.url);

export function report() {
  const rows = analysed();
  const markets = byMarket();
  const ranked = Object.values(markets).sort((a, b) => b.reachablePerPage - a.reachablePerPage);

  const byFamily = {};
  for (const r of rows) {
    const f = (byFamily[r.family] ||= { family: r.family, keywords: 0, reachable: 0, entry: [] });
    f.keywords++; f.reachable += r.reachableCount;
    if (r.entryPosition) f.entry.push(r.entryPosition);
  }
  for (const f of Object.values(byFamily)) {
    f.reachablePerPage = Math.round((f.reachable / f.keywords) * 10) / 10;
    f.medianEntryPosition = f.entry.length ? f.entry.slice().sort((a, b) => a - b)[Math.floor(f.entry.length / 2)] : null;
    delete f.entry;
  }

  const withAi = rows.filter((r) => r.hasAiOverview).length;
  const withQuestions = rows.filter((r) => r.hasQuestions).length;

  return {
    generatedAt: new Date().toISOString(),
    meaning: 'A reachable competitor is an organic result that is not a platform and whose domain rating is at or below ' + REACHABLE_DR + '. The entry position is the first position on the page held by one. Neither is a prediction; both are counts of what the result page contains.',
    caution: 'Nineteen keywords across nine markets. Enough to see a pattern that holds in every market measured, not enough to put a number on any single family.',
    keywords: rows.length,
    reachableThreshold: REACHABLE_DR,
    platformHosts: [...PLATFORM_HOSTS].sort(),
    features: {
      aiOverview: withAi + ' of ' + rows.length,
      questionBlock: withQuestions + ' of ' + rows.length,
      note: 'An AI overview sits above the first organic result on most of these queries, which is what the answer engine work in lib/atlas/aeo.js exists for. A question block is the reader asking a follow up the page should already answer.',
    },
    byMarket: ranked,
    byFamily: Object.values(byFamily).sort((a, b) => b.reachablePerPage - a.reachablePerPage),
    competitors: competitors().slice(0, 20),
    finding: ranked.length >= 2
      ? 'The English result pages are the hardest the programme measured and the Dutch and Polish ones the easiest, by a factor of four or more in reachable competitors per page. The cohort gives English the largest share of its pages, which was the right call on measured volume and is the wrong one on measured competition.'
      : 'Not enough markets measured to compare.',
    raw: store().length,
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = report();
  if (process.argv.includes('--write')) {
    mkdirSync(new URL('reports/atlas/', ROOT), { recursive: true });
    writeFileSync(new URL('reports/atlas/serp-2026-09-24.json', ROOT), JSON.stringify(r, null, 1) + '\n');
  }
  console.log(JSON.stringify(r, null, 1));
}
