// Which URLs to inspect or request next in Search Console, and which to leave
// alone. Reads data/indexing-requests.json (what was observed in the Search
// Console UI) and the live URL list. It never talks to Google itself.
//
//   node scripts/indexing-queue.mjs [YYYY-MM-DD]

import { readFileSync } from 'node:fs';
import { enumeratePages } from './page-audit.mjs';

const log = JSON.parse(readFileSync(new URL('../data/indexing-requests.json', import.meta.url), 'utf8'));

export function indexingQueue(today = new Date().toISOString().slice(0, 10)) {
  const published = new Set(enumeratePages().filter((p) => p.type !== 'unresolved').map((p) => p.path));
  const lastSent = {};
  log.observations.filter((o) => o.request === 'sent').forEach((o) => { lastSent[o.path] = o.date; });
  const days = (a, b) => Math.floor((Date.parse(b) - Date.parse(a)) / 86400000);
  const due = [];
  const waiting = [];
  const notPublished = [];
  log.priority.forEach((path) => {
    if (!published.has(path)) return notPublished.push(path);
    if (lastSent[path] && days(lastSent[path], today) < log.minDaysBetweenRequests) return waiting.push({ path, sent: lastSent[path] });
    due.push(path);
  });
  return { today, quota: log.dailyQuotaObserved, requestToday: due.slice(0, log.dailyQuotaObserved), laterDays: due.slice(log.dailyQuotaObserved), waiting, notPublished, sentSoFar: Object.keys(lastSent).length };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  console.log(JSON.stringify(indexingQueue(process.argv[2]), null, 2));
}
