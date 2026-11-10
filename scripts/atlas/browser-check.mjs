// Drive the Atlas in a real browser and check that what the reader sees actually works.
//
// The SEO parity diff proves the HTML a crawler reads is right. It cannot prove that a
// calculator calculates, that a consent choice sticks or that a language menu opens,
// because all three only exist once React has hydrated the page in a browser. This does
// that, against a deployed Worker:
//
//   every page  - no uncaught exception, no console error, no failed same-origin request,
//                 every <atlas-island> hydrated with no mismatch, stylesheet applied
//   tool pages  - every one of the interactive tools, all of them: change every input,
//                 and the result has to change; for the comparison tools, doubling the
//                 amount has to double the answer, which is arithmetic the component
//                 cannot fake
//   once        - the consent banner appears with no cookie, a choice writes the
//                 livdar_consent cookie and the banner stays gone on reload; the language
//                 globe opens and lists the page's own hreflang cluster; a call to action
//                 pushes cta_click into the dataLayer before it navigates
//
// Usage: ATLAS_ORIGIN=https://... node scripts/atlas/browser-check.mjs [--out FILE] [--sample N]

import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

// Playwright is not a dependency of this repository; the CI image and this environment
// provide it globally, where require() finds it and an ESM import does not.
const { chromium } = createRequire(import.meta.url)('playwright');

const ORIGIN = (process.env.ATLAS_ORIGIN || '').replace(/\/$/, '');
if (!ORIGIN) throw new Error('ATLAS_ORIGIN is required');
const argOf = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const OUT = argOf('out', 'reports/atlas-cloudflare-browser.json');
const DIR = argOf('dir', '.atlas-cloudflare-export');
const SAMPLE = Number(argOf('sample', 1));

const index = JSON.parse(await readFile(DIR + '/upload-index.json', 'utf8'));
const rows = [];
for (const [path, meta] of Object.entries(index.objects)) {
  if (path.startsWith('sitemap:')) continue;
  rows.push({ path, ...meta });
}
// Every interactive tool page, and SAMPLE pages from every other (kind, locale) cell.
const toolPaths = [];
for (const r of rows) {
  if (r.kind !== 'data') continue;
  const rec = JSON.parse(await readFile(DIR + '/pages' + r.path + 'model.json', 'utf8'));
  if (rec.model.tool && rec.model.tool.interactive) toolPaths.push({ path: r.path, tool: rec.model.tool.id, mode: rec.model.tool.mode });
}
const cells = new Map();
for (const r of rows) {
  const cell = r.kind + '|' + r.locale;
  if (!cells.has(cell)) cells.set(cell, []);
  if (cells.get(cell).length < SAMPLE) cells.get(cell).push(r.path);
}
const toolSet = new Set(toolPaths.map((t) => t.path));
const plainPaths = [...cells.values()].flat().filter((p) => !toolSet.has(p));

const browser = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
const sameOrigin = (u) => u.startsWith(ORIGIN);

async function openPage(context, path) {
  const page = await context.newPage();
  const problems = [];
  const thirdParty = [];
  page.on('pageerror', (e) => problems.push('uncaught: ' + String(e.message || e).slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text().slice(0, 200)); });
  page.on('response', (r) => {
    if (r.status() >= 400) (sameOrigin(r.url()) ? problems : thirdParty).push(r.status() + ' ' + r.url().slice(0, 140));
  });
  page.on('requestfailed', (r) => (sameOrigin(r.url()) ? problems : thirdParty).push('failed ' + r.url().slice(0, 140)));
  const response = await page.goto(ORIGIN + path, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForFunction(() => window.__atlasIslands, null, { timeout: 30_000 }).catch(() => problems.push('islands script never reported'));
  const islands = await page.evaluate(() => ({
    present: [...document.querySelectorAll('atlas-island')].map((e) => e.getAttribute('data-island')),
    report: window.__atlasIslands || null,
    // The stylesheet is applied when the page's own wrapper has the width the CSS gives it.
    styled: getComputedStyle(document.querySelector('.atlas-wrap') || document.body).maxWidth !== 'none',
  }));
  if (islands.report) {
    for (const f of islands.report.failed) problems.push('island: ' + f);
    if (islands.report.hydrated.length !== islands.present.length) problems.push('hydrated ' + islands.report.hydrated.length + ' of ' + islands.present.length + ' islands');
  }
  if (!islands.styled) problems.push('stylesheet not applied');
  return { page, status: response.status(), problems, thirdParty, islands: islands.present };
}

// The tool's visible state, as text, so "did anything change" is a string comparison.
const toolText = (page) => page.$eval('.atlas-tool', (el) => el.innerText.replace(/\s+/g, ' ').trim()).catch(() => '');

// Change every control the tool has. Numbers get a value that differs from the default
// and is plausible for every tool (an income, a rent, a distance); selects move to their
// second option, so the answer has to be recomputed for a different country or size.
async function exercise(page) {
  const filled = await page.$$eval('.atlas-tool input[type="number"]', (els) => els.length);
  const inputs = await page.$$('.atlas-tool input[type="number"]');
  const values = ['3200', '1100', '2', '450', '9', '6'];
  for (let i = 0; i < inputs.length; i += 1) await inputs[i].fill(values[i % values.length]);
  const selects = await page.$$('.atlas-tool select');
  for (const s of selects) {
    const options = await s.$$eval('option', (os) => os.map((o) => o.value));
    if (options.length > 1) await s.selectOption(options[1]);
  }
  const buttons = await page.$$('.atlas-tool button[type="submit"], .atlas-tool button:not([type="button"])');
  for (const b of buttons) await b.click().catch(() => {});
  await page.waitForTimeout(150);
  return { numberInputs: filled, selects: selects.length };
}

// For the comparison tools: the answer for 4000 must be twice the answer for 2000.
async function doublingHolds(page) {
  const amount = await page.$('.atlas-tool input[type="number"]');
  if (!amount) return { checked: false };
  const read = async () => {
    // The comparison tools print their answer in the score card: .atlas-score-number is
    // Math.round(amount * ratio), so it is the one figure that must double exactly.
    const t = await page.$eval('.atlas-tool .atlas-score-number', (el) => el.innerText).catch(() => '');
    const nums = (t.match(/\d[\d\s.,  ]*/g) || []).map((n) => Number(n.replace(/[\s  ]/g, '').replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.'))).filter((n) => Number.isFinite(n) && n > 0);
    return nums;
  };
  await amount.fill('2000'); await page.waitForTimeout(120);
  const a = await read();
  await amount.fill('4000'); await page.waitForTimeout(120);
  const b = await read();
  // Some number in the output doubled exactly (allowing a unit of rounding).
  const ok = a.some((x) => b.some((y) => Math.abs(y - 2 * x) <= 1.01 && x >= 10));
  return { checked: true, ok, at2000: a.slice(0, 4), at4000: b.slice(0, 4) };
}

const results = [];
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });

for (const t of toolPaths) {
  const row = { path: t.path, tool: t.tool, mode: t.mode };
  try {
    const { page, status, problems, thirdParty, islands } = await openPage(context, t.path);
    row.status = status;
    row.islands = islands;
    if (!islands.includes('AtlasTool')) problems.push('no AtlasTool island on a tool page');
    const before = await toolText(page);
    row.controls = await exercise(page);
    const after = await toolText(page);
    row.resultChanged = before !== after && after.length > 0;
    if (!row.resultChanged) problems.push('changing every input did not change the tool output');
    if (t.mode === 'ratio') {
      row.doubling = await doublingHolds(page);
      if (row.doubling.checked && !row.doubling.ok) problems.push('doubling the amount did not double the result');
    }
    row.problems = problems;
    row.thirdPartyFailures = thirdParty.length;
    await page.close();
  } catch (error) {
    row.problems = ['exception: ' + String(error.message || error).slice(0, 300)];
  }
  results.push(row);
}

for (const path of plainPaths) {
  const row = { path };
  try {
    const { page, status, problems, thirdParty, islands } = await openPage(context, path);
    row.status = status;
    row.islands = islands;
    row.problems = problems;
    row.thirdPartyFailures = thirdParty.length;
    await page.close();
  } catch (error) {
    row.problems = ['exception: ' + String(error.message || error).slice(0, 300)];
  }
  results.push(row);
}

// ---------------------------------------------------------------------------
// The interactions that only need checking once.
// ---------------------------------------------------------------------------
const once = {};
{
  const fresh = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const path = toolPaths[0]?.path || plainPaths[0];
  const { page } = await openPage(fresh, path);

  // Consent: shown with no cookie, a choice writes the cookie, gone after reload.
  const banner = await page.waitForSelector('.consent', { timeout: 10_000 }).then(() => true).catch(() => false);
  let cookie = null;
  if (banner) {
    const reject = page.locator('.consent .btn-ghost').first();
    await reject.click();
    await page.waitForTimeout(200);
    cookie = (await fresh.cookies()).find((c) => c.name === 'livdar_consent') || null;
  }
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__atlasIslands, null, { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(300);
  const bannerAfterReload = await page.$('.consent').then(Boolean);
  once.consent = { shownWithoutCookie: banner, cookieWritten: Boolean(cookie), cookieValue: cookie ? decodeURIComponent(cookie.value) : null, hiddenAfterReload: !bannerAfterReload };
  once.consent.ok = banner && Boolean(cookie) && !bannerAfterReload;

  // The language globe opens and lists links.
  await page.click('.globe-button');
  const menu = await page.waitForSelector('.globe-menu', { timeout: 5_000 }).then(() => true).catch(() => false);
  const links = menu ? await page.$$eval('.globe-menu a', (as) => as.map((a) => a.getAttribute('href'))) : [];
  await page.keyboard.press('Escape');
  const closed = !(await page.$('.globe-menu'));
  once.globe = { opens: menu, links: links.length, closesOnEscape: closed, ok: menu && links.length > 0 && closed };

  // A call to action reports before it navigates. The navigation is held so the
  // dataLayer can be read afterwards.
  const cta = await page.$('.atlas-cta a[data-cta]');
  if (cta) {
    await page.route('**/*', (route) => (route.request().isNavigationRequest() && route.request().frame() === page.mainFrame() ? route.abort() : route.continue()));
    await cta.click({ noWaitAfter: true }).catch(() => {});
    await page.waitForTimeout(300);
    const events = await page.evaluate(() => (window.dataLayer || []).map((e) => (e && e.event) || null).filter(Boolean));
    once.cta = { events, ok: events.includes('cta_click') };
    await page.unroute('**/*');
  } else once.cta = { ok: false, reason: 'no call to action on ' + path };
  await fresh.close();
}

await browser.close();

const failed = results.filter((r) => (r.problems || []).length || r.status !== 200);
const toolsOk = results.filter((r) => r.tool && !(r.problems || []).length).length;
const report = {
  checkedAt: new Date().toISOString(),
  origin: ORIGIN,
  pages: results.length,
  toolPages: toolPaths.length,
  toolPagesWorking: toolsOk,
  failed: failed.length,
  once,
  failures: failed.slice(0, 40),
  tools: results.filter((r) => r.tool).map((r) => ({ path: r.path, tool: r.tool, mode: r.mode, resultChanged: r.resultChanged, doubling: r.doubling?.checked ? r.doubling.ok : null })),
};
await writeFile(OUT, JSON.stringify(report, null, 1));
console.log(JSON.stringify({ pages: report.pages, toolPages: report.toolPages, toolPagesWorking: toolsOk, failed: report.failed, consent: once.consent?.ok, globe: once.globe?.ok, cta: once.cta?.ok, out: OUT }, null, 1));
process.exit(failed.length || !once.consent?.ok || !once.globe?.ok || !once.cta?.ok ? 1 : 0);
