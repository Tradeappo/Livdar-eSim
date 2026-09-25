import { writeFile } from 'node:fs/promises';
import operations from '../data/seo-operations.json' with { type: 'json' };
import {
  compareTotals,
  dateRange,
  getAccessToken,
  googleCredentialsFromEnv,
  querySearchAnalytics,
  summarizeTotal,
  topOpportunities,
} from './lib/google-search-console.mjs';

const property = process.env.GSC_PROPERTY;
if (!property) throw new Error('GSC_PROPERTY is required, for example sc-domain:livdar.com.');

const account = googleCredentialsFromEnv();
if (!account.credentials) {
  throw new Error('Search Console credentials are missing: ' + account.missing.join(', ') + '. Nothing was imported.');
}
const accessToken = await getAccessToken(account.credentials);
const report = {
  generatedAt: new Date().toISOString(),
  property,
  note: 'Search Console data is finalized and ends three days before generation.',
  windows: {},
};

for (const days of operations.searchConsole.windowsDays) {
  const range = dateRange(days);
  const request = (period, dimensions = []) => querySearchAnalytics({
    accessToken,
    property,
    ...period,
    dimensions,
  });

  const [currentTotalRows, previousTotalRows, pages, queries, countries, devices] = await Promise.all([
    request(range.current),
    request(range.previous),
    request(range.current, ['page']),
    request(range.current, ['query']),
    request(range.current, ['country']),
    request(range.current, ['device']),
  ]);

  report.windows[days] = {
    range,
    totals: compareTotals(
      summarizeTotal(currentTotalRows),
      summarizeTotal(previousTotalRows),
      operations.searchConsole.alerts
    ),
    opportunities: {
      pages: topOpportunities(pages),
      queries: topOpportunities(queries),
    },
    topCountries: countries.slice(0, 25),
    devices,
  };
}

const output = JSON.stringify(report, null, 2) + '\n';
const outIndex = process.argv.indexOf('--out');
if (outIndex >= 0) {
  const path = process.argv[outIndex + 1];
  if (!path) throw new Error('--out requires a file path.');
  await writeFile(path, output, 'utf8');
  console.log(`Search Console report written to ${path}`);
} else {
  process.stdout.write(output);
}
