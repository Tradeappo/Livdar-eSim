// Keyword data providers.
//
// Four implementations behind one interface, so the measurement stage does
// not care where a number came from and a run can be replayed offline.
//
//   AhrefsProvider      precise, expensive, used for phrasing discovery,
//                       SERP checks and validating the highest value lots
//   DataForSEOProvider  the bulk instrument: Google Ads search volume in the
//                       standard queue, a thousand keywords to a task
//   ImportedCsvProvider a file somebody already paid for
//   MockProvider        deterministic, for tests, no network, no cost
//
// Every provider reports its own cost so the cap is enforced against real
// numbers rather than an estimate that drifts.

import { createHash } from 'node:crypto';
import { measurement, confidenceFor } from './model.js';

export class KeywordProvider {
  constructor(opts = {}) { this.opts = opts; this.spent = 0; }
  get id() { throw new Error('a provider needs an id'); }
  // Cost of measuring `n` keywords, in the provider own unit.
  estimate() { throw new Error('not implemented'); }
  async measure() { throw new Error('not implemented'); }
}

// Ahrefs charges per row and the workspace has a hard monthly allowance, so
// the provider refuses a batch that would exceed what is left rather than
// discovering it halfway through.
export class AhrefsProvider extends KeywordProvider {
  get id() { return 'ahrefs'; }
  static UNITS_PER_ROW = 11;
  estimate(n) { return { unit: 'ahrefs units', amount: n * AhrefsProvider.UNITS_PER_ROW, usd: null }; }
  async measure(keywords, { country, call }) {
    // `call` is injected: the MCP client in production, a stub in tests.
    if (!call) throw new Error('AhrefsProvider needs a call function');
    const at = new Date().toISOString();
    const rows = await call({ keywords, country });
    return rows.map((r) => measurement({
      query: r.keyword, country, volume: r.volume, cpc: r.cpc, difficulty: r.difficulty,
      provider: this.id, measuredAt: at,
      checksum: createHash('sha256').update(JSON.stringify(r)).digest('hex').slice(0, 16),
      cost: AhrefsProvider.UNITS_PER_ROW,
      confidence: confidenceFor({ provider: this.id, volume: r.volume }),
    }));
  }
}

// DataForSEO Google Ads search volume, standard queue. The queue is the cheap
// tier: results arrive later, which is exactly right for a measurement run
// that nothing is waiting on.
export class DataForSEOProvider extends KeywordProvider {
  get id() { return 'dataforseo'; }
  static MAX_PER_TASK = 1000;
  static USD_PER_TASK = 0.05;
  get credentials() {
    const login = process.env.DATAFORSEO_LOGIN;
    const password = process.env.DATAFORSEO_PASSWORD;
    return login && password ? { login, password } : null;
  }
  estimate(n) {
    const tasks = Math.ceil(n / DataForSEOProvider.MAX_PER_TASK);
    return { unit: 'tasks', amount: tasks, usd: Math.round(tasks * DataForSEOProvider.USD_PER_TASK * 100) / 100, keywords: n, perTask: DataForSEOProvider.MAX_PER_TASK };
  }
  async measure(keywords, { country, language, capUsd, post }) {
    if (!this.credentials) {
      const e = new Error('DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD are not set');
      e.blocker = 'credentials';
      throw e;
    }
    const est = this.estimate(keywords.length);
    if (capUsd != null && est.usd > capUsd) {
      const e = new Error('estimated ' + est.usd + ' USD exceeds the cap of ' + capUsd + ' USD');
      e.blocker = 'cost-cap';
      throw e;
    }
    const at = new Date().toISOString();
    const out = [];
    for (let i = 0; i < keywords.length; i += DataForSEOProvider.MAX_PER_TASK) {
      const batch = keywords.slice(i, i + DataForSEOProvider.MAX_PER_TASK);
      const rows = await post(batch, { country, language, credentials: this.credentials });
      this.spent += DataForSEOProvider.USD_PER_TASK;
      for (const r of rows) {
        out.push(measurement({
          query: r.keyword, country, language, volume: r.search_volume,
          cpc: r.cpc == null ? null : Math.round(r.cpc * 100),
          competition: r.competition_index == null ? null : r.competition_index / 100,
          trendPct: r.monthly_searches ? trendFrom(r.monthly_searches) : null,
          provider: this.id, measuredAt: at,
          checksum: createHash('sha256').update(JSON.stringify(r)).digest('hex').slice(0, 16),
          cost: DataForSEOProvider.USD_PER_TASK / batch.length,
          confidence: confidenceFor({ provider: this.id, volume: r.search_volume, rows: r.monthly_searches ? r.monthly_searches.length : null }),
        }));
      }
    }
    return out;
  }
}

// Twelve monthly points to one direction, as a percentage change between the
// first and last quarter of the series.
export function trendFrom(monthly) {
  if (!monthly || monthly.length < 6) return null;
  const s = monthly.slice().sort((a, b) => (a.year - b.year) || (a.month - b.month)).map((m) => m.search_volume || 0);
  const head = s.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const tail = s.slice(-3).reduce((a, b) => a + b, 0) / 3;
  if (!head) return null;
  return Math.round(((tail - head) / head) * 100);
}

export class ImportedCsvProvider extends KeywordProvider {
  get id() { return 'csv'; }
  estimate() { return { unit: 'none', amount: 0, usd: 0 }; }
  async measure(keywords, { rows }) {
    const at = new Date().toISOString();
    const byQuery = new Map(rows.map((r) => [String(r.keyword).toLowerCase(), r]));
    return keywords.map((k) => byQuery.get(k.toLowerCase())).filter(Boolean).map((r) => measurement({
      query: r.keyword, country: r.country, language: r.language, volume: r.volume, cpc: r.cpc, difficulty: r.difficulty,
      provider: this.id, measuredAt: at, cost: 0,
      confidence: confidenceFor({ provider: this.id, volume: r.volume }),
    }));
  }
}

// Deterministic: the same keyword always gets the same number, so a test can
// assert on the funnel without pretending to have measured anything.
export class MockProvider extends KeywordProvider {
  get id() { return 'mock'; }
  estimate() { return { unit: 'none', amount: 0, usd: 0 }; }
  async measure(keywords, { country = 'us' } = {}) {
    const at = '2026-01-01T00:00:00.000Z';
    return keywords.map((k) => {
      const h = createHash('sha256').update(k).digest();
      return measurement({
        query: k, country, volume: h[0] * 10, cpc: h[1], difficulty: h[2] % 100,
        provider: this.id, measuredAt: at, cost: 0, confidence: 0.3,
      });
    });
  }
}

export function providerFor(id, opts) {
  const map = { ahrefs: AhrefsProvider, dataforseo: DataForSEOProvider, csv: ImportedCsvProvider, mock: MockProvider };
  if (!map[id]) throw new Error('unknown keyword provider: ' + id);
  return new map[id](opts);
}
