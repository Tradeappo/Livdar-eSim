import { readFileSync, existsSync } from 'node:fs';
import { enumeratePages } from './page-audit.mjs';
import { buildBaseline } from './seo-baseline.mjs';

const root = new URL('../', import.meta.url);
const taxonomy = JSON.parse(readFileSync(new URL('data/programmatic-taxonomy.json', root), 'utf8'));
const operations = JSON.parse(readFileSync(new URL('data/seo-operations.json', root), 'utf8'));
const pages = enumeratePages().filter((page) => page.type !== 'unresolved');
const baseline = buildBaseline();

const required = [
  'app/llms.txt/route.js',
  'app/llms-full.txt/route.js',
  'app/api/programmatic/eligibility/route.js',
  'data/competitor-validation-2026-09-20.json',
  'data/seo-operations.json',
  'docs/seo-scale-runbook.md',
];

const report = {
  generatedAt: new Date().toISOString(),
  indexableUrlCount: pages.length,
  locales: baseline.locales,
  byType: baseline.byType,
  canonicalCount: Object.values(baseline.pages).filter((page) => Boolean(page.canonical)).length,
  hreflangClusterCount: Object.values(baseline.pages).filter((page) => page.hreflangLangs.length > 0).length,
  programmatic: {
    generationEnabled: taxonomy.generationEnabled,
    modeledCapacity: taxonomy.scaleTargets,
    families: taxonomy.families.length,
    hardGates: taxonomy.hardGates,
  },
  operations: {
    automationMode: operations.make.allowedAction,
    publishingEnabled: operations.make.publishing,
    searchConsoleWindows: operations.searchConsole.windowsDays,
  },
  requiredFiles: Object.fromEntries(required.map((file) => [file, existsSync(new URL(file, root))])),
};

report.ok = report.indexableUrlCount === 91
  && report.canonicalCount === 91
  && report.hreflangClusterCount === 91
  && report.programmatic.generationEnabled === false
  && report.operations.publishingEnabled === false
  && Object.values(report.requiredFiles).every(Boolean);

console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exitCode = 1;
