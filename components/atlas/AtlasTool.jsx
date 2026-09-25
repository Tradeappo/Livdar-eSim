'use client';

// The tool, on the tool page.
//
// Every one of these pages described a calculator and contained a worked example
// of it, which is a screenshot of a tool rather than a tool. The logic already
// existed and ran on the server; this runs the same functions in the browser
// against the same data, so a reader can type their own numbers in and the two
// halves cannot drift apart into two answers.
//
// The imports below are deliberate: rent-affordability and moving-cost are pure
// arithmetic with no data behind them, so the real implementation runs here
// unchanged. The comparison and filter modes need a table, and the table arrives
// in the spec from the server, already on the page's own scale, because mixing
// the European index at 100 with the American ratio at 1 in one picker would let
// a reader get an answer three orders of magnitude out.
//
// Measurement is part of the tool and not an afterthought. tool_view fires when
// the tool is actually on screen rather than when the page loads, tool_start
// fires once on the first input, and tool_complete fires when a result exists.
// None of the three carries what the reader typed: an income is personal data
// and a band is enough to answer every question worth asking of it.

import { useEffect, useMemo, useRef, useState } from 'react';
import { pushEvent, EVENTS } from '../../lib/analytics.js';
import { bandOf, startAt } from '../../lib/atlas/tool-inputs.js';
import { stateForShare, stateForRatio, fillForShare, gradientFor } from '../../lib/atlas/tool-verdict.js';
import AtlasScoreCard from './AtlasScoreCard.jsx';
import { rentBudget } from '../../lib/atlas/tools/rent-affordability.js';
import { estimate as movingEstimate } from '../../lib/atlas/tools/moving-cost.js';

const nf = (language, digits = 0) => new Intl.NumberFormat(language, { maximumFractionDigits: digits });


export default function AtlasTool({ spec, labels, dims }) {
  const language = spec.language || 'en';
  const fmt = useMemo(() => nf(language), [language]);
  const fmt1 = useMemo(() => nf(language, 1), [language]);
  const box = useRef(null);
  const started = useRef(false);
  const viewed = useRef(false);
  const completed = useRef(null);

  const send = (event, extra) => pushEvent(event, { ...dims, tool_type: spec.mode, tool_id: spec.id, ...extra });

  // Seen, rather than loaded. A tool below the fold that nobody scrolls to has
  // not been viewed, and counting it as one would make every later rate wrong.
  useEffect(() => {
    if (!box.current || typeof IntersectionObserver !== 'function') return undefined;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting && !viewed.current) {
          viewed.current = true;
          send(EVENTS.toolView);
          io.disconnect();
        }
      }
    }, { threshold: 0.4 });
    io.observe(box.current);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const touch = (field) => {
    if (started.current) return;
    started.current = true;
    send(EVENTS.toolStart, { tool_field: field });
  };

  // A completion the reader did not cause is not a completion. Every mode has a
  // valid default state, so without this gate tool_complete fired on mount,
  // before tool_start, on every tool page load: the completion rate would have
  // read as one and measured nothing.
  const complete = (signature, extra) => {
    if (!started.current) return;
    if (completed.current === signature) return;
    completed.current = signature;
    send(EVENTS.toolComplete, extra);
  };

  const t = (k) => (labels && labels[k]) || k;
  // The verdict word, from the same labels bag, so the card carries no vocabulary
  // of its own and the language audit can see every string it shows.
  const verdictOf = (state) => (state ? t('verdict.' + state) : null);

  if (spec.mode === 'share') return <Share {...{ spec, t, verdictOf, fmt, box, touch, complete }} />;
  if (spec.mode === 'move') return <Move {...{ spec, t, fmt, box, touch, complete }} />;
  if (spec.mode === 'ratio') return <Ratio {...{ spec, t, verdictOf, fmt, fmt1, box, touch, complete }} />;
  if (spec.mode === 'earn') return <Earn {...{ spec, t, fmt, box, touch, complete }} />;
  if (spec.mode === 'filter') return <Filter {...{ spec, t, fmt, fmt1, box, touch, complete }} />;
  if (spec.mode === 'stay') return <Stay {...{ spec, t, fmt1, box, touch, complete }} />;
  return null;
}

function Frame({ box, id, title, children }) {
  return (
    <section className="atlas-tool" id={id} ref={box} aria-label={title}>
      {children}
    </section>
  );
}

function Share({ spec, t, verdictOf, fmt, box, touch, complete }) {
  const [income, setIncome] = useState('');
  const [household, setHousehold] = useState('1');
  // The rent the reader is looking at. rent-affordability.js refuses to say
  // whether a budget is enough in a named city, because no comparable rent level
  // is published, and that refusal does not apply to a number the reader supplies
  // themselves: it is their figure, not a claim of ours. It is what makes the
  // verdict real rather than decorative, because thirty per cent of any income is
  // affordable by construction and a card that only ever says so says nothing.
  const [rent, setRent] = useState('');

  const r = rentBudget({ income: Number(income), household: Number(household) || 1 });
  const share = r.ok && Number(rent) > 0 ? Number(rent) / Number(income) : null;
  const state = r.ok ? (share === null ? 'comfortable' : stateForShare(share)) : null;
  const left = r.ok && Number(rent) > 0 ? Number(income) - Number(rent) : null;

  useEffect(() => {
    if (!r.ok) return;
    complete('share|' + bandOf(income) + '|' + household + '|' + (state || ''), {
      income_band: bandOf(income),
      household_size: Number(household) || 1,
      rent_band: bandOf(rent),
      // The verdict, which is the answer the reader got. A band and a state, never
      // the figures behind them.
      verdict: state,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r.ok, income, household, rent, state]);

  const atThirty = r.ok ? r.rows[0] : null;
  const atThirtyFive = r.ok ? r.rows[1] : null;
  // How far the rent sits from the share most landlords test against. Negative is
  // under it, which is the good side.
  const gap = atThirty && Number(rent) > 0 ? Number(rent) - atThirty.monthly : null;

  return (
    <Frame box={box} id={spec.id} title={t('calculate')}>
      <AtlasScoreCard
        eyebrow={t('eyebrow')}
        title={spec.title || t('calculate')}
        state={r.ok ? state : 'resting'}
        gradient={r.ok ? gradientFor(state) : undefined}
        score={share !== null ? Math.round(share * 100) + '%' : (atThirty ? fmt.format(atThirty.monthly) : '--')}
        verdict={r.ok ? verdictOf(state) : null}
        orb={share !== null ? Math.round(share * 100) + '%' : '30%'}
        orbFill={share !== null ? fillForShare(share) : 30}
        // The card is the same height in every state, including before anything is
        // entered, so the controls under it never move while a thumb is on them.
        // That is why the resting state shows the same rows with a dash in them
        // rather than showing nothing.
        headline={r.ok && left !== null
          ? { label: t('leftAfterRent'), value: (left < 0 ? '-' : '') + fmt.format(Math.abs(left)) }
          : { label: r.ok ? t('at30') : t('leftAfterRent'), value: atThirty ? fmt.format(atThirty.monthly) : '--' }}
        kpis={[
          { value: atThirty ? fmt.format(atThirty.monthly) : '--', label: t('at30') },
          { value: atThirtyFive ? fmt.format(atThirtyFive.monthly) : '--', label: t('at35') },
          // The third tile used to repeat the thirty per cent budget the reader had
          // just read one tile to the left. It now says something the card does not
          // say anywhere else: the gap to the comfortable line, or the budget per
          // person where the household is more than one.
          Number(household) > 1
            ? { value: atThirty ? fmt.format(atThirty.perPerson) : '--', label: t('perPerson') }
            : (gap !== null
              ? { value: (gap < 0 ? '-' : '+') + fmt.format(Math.abs(gap)), label: gap <= 0 ? t('underComfortable') : t('overComfortable') }
              : { value: '30%', label: t('shareOfIncome') }),
        ]}
        note={r.ok ? null : t('enterIncome')}
      />
      <div className="atlas-tool-controls">
        <div className="atlas-tool-inputs">
          <label>
            <span>{t('income')}</span>
            <input type="number" inputMode="numeric" min="0" step="50" value={income}
              onChange={(e) => { touch('income'); setIncome(e.target.value); }} />
          </label>
          <label>
            <span>{t('rentYouPay')}</span>
            <input type="number" inputMode="numeric" min="0" step="50" value={rent}
              onChange={(e) => { touch('rent'); setRent(e.target.value); }} />
          </label>
          <label>
            <span>{t('household size')}</span>
            <input type="number" inputMode="numeric" min="1" max="12" step="1" value={household}
              onChange={(e) => { touch('household'); setHousehold(e.target.value); }} />
          </label>
        </div>
      </div>
    </Frame>
  );
}

function Move({ spec, t, fmt, box, touch, complete }) {
  const [size, setSize] = useState(spec.sizes[2] ? spec.sizes[2].id : spec.sizes[0].id);
  const [km, setKm] = useState('');
  const [transport, setTransport] = useState(spec.transports[0].id);
  // The implementation's own input names, which are `moveSize` and not `size`, and
  // its own result shape, which is a range and three scenarios and never a single
  // number. The first version of this component guessed both and the tool rendered
  // three working inputs above an output that never appeared: it reported
  // `unknown move size: undefined` internally and said nothing.
  const r = Number(km) > 0 ? movingEstimate({ moveSize: size, distanceKm: Number(km), transport }) : null;
  const likely = r && r.ok ? r.scenarios.likely.total : null;
  useEffect(() => {
    if (likely) complete('move|' + size + '|' + transport, { move_size: size, transport, distance_band: bandOf(km) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [likely, size, transport, km]);
  const chosen = spec.transports.find((x) => x.id === transport);
  return (
    <Frame box={box} id={spec.id} title={t('calculate')}>
      <div className="atlas-tool-inputs">
        <label>
          <span>{t('home size')}</span>
          <select value={size} onChange={(e) => { touch('size'); setSize(e.target.value); }}>
            {spec.sizes.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
        <label>
          <span>{t('distance')}</span>
          <input type="number" inputMode="numeric" min="0" step="10" value={km}
            onChange={(e) => { touch('distance'); setKm(e.target.value); }} />
        </label>
        <label>
          <span>{t('style')}</span>
          <select value={transport} onChange={(e) => { touch('transport'); setTransport(e.target.value); }}>
            {spec.transports.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
      </div>
      {r && r.ok ? (
        <div className="atlas-tool-out" role="status">
          <p><strong>{fmt.format(likely)}</strong>{spec.currency ? ' ' + spec.currency : ''}</p>
          <p className="muted">{fmt.format(r.range.low) + ' to ' + fmt.format(r.range.high)}</p>
        </div>
      ) : null}
      {r && !r.ok ? (
        // A refusal is part of the tool. A sea container is not offered under
        // eight hundred kilometres, and saying so is more use than an empty box.
        <div className="atlas-tool-out" role="status">
          <p className="muted">{chosen ? chosen.label + ': ' + chosen.minKm + ' km to ' + chosen.maxKm + ' km' : t('nothingFits')}</p>
        </div>
      ) : null}
    </Frame>
  );
}

// Two places on one scale, and an amount. The arithmetic is a ratio of two
// published price levels and nothing else, which is why it can be done here.
function Ratio({ spec, t, verdictOf, fmt, fmt1, box, touch, complete }) {
  // Open on the country the page was written for, and on its nearest neighbour
  // in the ordering, so the first thing the reader sees is a comparison they can
  // judge rather than Afghanistan against Algeria. Where the reader's own country
  // is not in the table - the earnings series is European and the market may not
  // be - the middle of the distribution stands in, because the alphabetically
  // first row is a country nobody chose and a number nobody recognises.
  const homeAt = startAt(spec.rows, spec.home);
  const [a, setA] = useState(spec.rows[homeAt].iso2);
  const [b, setB] = useState(spec.rows[(homeAt + 1) % spec.rows.length].iso2);
  const [amount, setAmount] = useState('2000');
  const rowA = spec.rows.find((r) => r.iso2 === a);
  const rowB = spec.rows.find((r) => r.iso2 === b);
  const ok = rowA && rowB && Number(amount) > 0 && rowA.value > 0;
  // The same arithmetic as before, unchanged and still the server's: a ratio of two
  // published price levels and nothing else.
  const equivalent = ok ? (Number(amount) * rowB.value) / rowA.value : null;
  const ratio = ok ? rowB.value / rowA.value : null;
  const pct = ok ? Math.round((ratio - 1) * 100) : null;
  const state = ok ? stateForRatio(ratio) : null;
  useEffect(() => {
    if (ok) complete('ratio|' + a + '|' + b, { from_country: a, to_country: b, amount_band: bandOf(amount), verdict: state });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ok, a, b, amount, state]);

  return (
    <Frame box={box} id={spec.id} title={t('calculate')}>
      <AtlasScoreCard
        eyebrow={t('eyebrowCompare')}
        title={spec.title || t('calculate')}
        state={ok ? state : 'resting'}
        gradient={ok ? gradientFor(state) : undefined}
        score={ok ? fmt.format(Math.round(equivalent)) : '--'}
        verdict={ok ? (pct === 0 ? t('same') : fmt1.format(Math.abs(pct)) + '% ' + (pct > 0 ? t('dearer') : t('cheaper'))) : null}
        orb={ok ? (pct > 0 ? '+' : '') + pct + '%' : null}
        // A ratio of one is half the circle, so cheaper reads as less than half and
        // dearer as more, which is the same direction the colour moves in.
        orbFill={ok ? Math.max(4, Math.min(100, Math.round((ratio / 2) * 100))) : 0}
        headline={ok ? { label: t('buysThere'), value: rowB.name } : null}
        kpis={ok ? [
          { value: fmt1.format(rowA.value), label: t('priceLevelHere') },
          { value: fmt1.format(rowB.value), label: t('priceLevelThere') },
          { value: (pct > 0 ? '+' : '') + fmt1.format(pct) + '%', label: t('difference') },
        ] : []}
      />
      <div className="atlas-tool-controls">
        <div className="atlas-tool-inputs">
          <label>
            <span>{t('country a')}</span>
            <select value={a} onChange={(e) => { touch('country a'); setA(e.target.value); }}>
              {spec.rows.map((r) => <option key={r.iso2} value={r.iso2}>{r.name}</option>)}
            </select>
          </label>
          <label>
            <span>{t('country b')}</span>
            <select value={b} onChange={(e) => { touch('country b'); setB(e.target.value); }}>
              {spec.rows.map((r) => <option key={r.iso2} value={r.iso2}>{r.name}</option>)}
            </select>
          </label>
          <label>
            <span>{t('amount')}</span>
            <input type="number" inputMode="numeric" min="0" step="100" value={amount}
              onChange={(e) => { touch('amount'); setAmount(e.target.value); }} />
          </label>
        </div>
      </div>
    </Frame>
  );
}

function Earn({ spec, t, fmt, box, touch, complete }) {
  const [iso, setIso] = useState(spec.rows[startAt(spec.rows, spec.home)].iso2);
  const row = spec.rows.find((r) => r.iso2 === iso);
  useEffect(() => {
    if (row) complete('earn|' + iso, { country: iso });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iso]);
  return (
    <Frame box={box} id={spec.id} title={t('calculate')}>
      <div className="atlas-tool-inputs">
        <label>
          <span>{t('country')}</span>
          <select value={iso} onChange={(e) => { touch('country'); setIso(e.target.value); }}>
            {spec.rows.map((r) => <option key={r.iso2} value={r.iso2}>{r.name}</option>)}
          </select>
        </label>
      </div>
      {row ? (
        <div className="atlas-tool-out" role="status">
          <p><strong>{fmt.format(row.gross)}</strong>{row.currency ? ' ' + row.currency : ''} <span className="muted">{t('gross') + ' · ' + t('perMonth')}</span></p>
          {row.net != null ? <p><strong>{fmt.format(row.net)}</strong>{row.currency ? ' ' + row.currency : ''} <span className="muted">{t('net') + ' · ' + t('perMonth')}</span></p> : null}
        </div>
      ) : null}
    </Frame>
  );
}

function Filter({ spec, t, fmt, fmt1, box, touch, complete }) {
  const mid = Math.round(spec.rows[Math.floor(spec.rows.length / 2)].value);
  const [maxLevel, setMaxLevel] = useState(String(mid));
  const [minMonths, setMinMonths] = useState('6');
  const matches = spec.rows.filter((r) => r.value <= Number(maxLevel) && (r.comfortable == null || r.comfortable >= Number(minMonths)));
  useEffect(() => {
    complete('filter|' + maxLevel + '|' + minMonths, { max_price_level: Number(maxLevel), min_comfortable_months: Number(minMonths), matches: matches.length });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxLevel, minMonths]);
  return (
    <Frame box={box} id={spec.id} title={t('calculate')}>
      <div className="atlas-tool-inputs">
        <label>
          <span>{t('maxPriceLevel')}</span>
          <input type="number" inputMode="numeric" min="0" step="5" value={maxLevel}
            onChange={(e) => { touch('maxPriceLevel'); setMaxLevel(e.target.value); }} />
        </label>
        <label>
          <span>{t('comfortableMonths')}</span>
          <input type="number" inputMode="numeric" min="0" max="12" step="1" value={minMonths}
            onChange={(e) => { touch('comfortableMonths'); setMinMonths(e.target.value); }} />
        </label>
      </div>
      <div className="atlas-tool-out" role="status">
        {matches.length ? (
          <>
            <p className="muted">{matches.length + ' ' + t('matches')}</p>
            <ul className="atlas-tool-list">
              {matches.slice(0, 12).map((r) => (
                <li key={r.iso2}>
                  <span>{r.name}</span>
                  <span className="muted">{fmt1.format(r.value)}{r.comfortable != null ? ' · ' + r.comfortable + '/12' : ''}{r.net != null ? ' · ' + fmt.format(r.net) : ''}</span>
                </li>
              ))}
            </ul>
          </>
        ) : <p>{t('nothingFits')}</p>}
      </div>
    </Frame>
  );
}

function Stay({ spec, t, fmt1, box, touch, complete }) {
  const [cityId, setCityId] = useState(spec.cities[0].cityId);
  const city = spec.cities.find((c) => c.cityId === cityId);
  useEffect(() => {
    if (city) complete('stay|' + cityId, { city: cityId, districts: city.districts.length });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityId]);
  return (
    <Frame box={box} id={spec.id} title={t('calculate')}>
      <div className="atlas-tool-inputs">
        <label>
          <span>{t('city')}</span>
          <select value={cityId} onChange={(e) => { touch('city'); setCityId(e.target.value); }}>
            {spec.cities.map((c) => <option key={c.cityId} value={c.cityId}>{c.name}</option>)}
          </select>
        </label>
      </div>
      {city ? (
        <div className="atlas-tool-out" role="status">
          <ul className="atlas-tool-list">
            {city.districts.map((d) => (
              <li key={d.name}><span>{d.name}</span><span className="muted">{fmt1.format(d.km) + ' ' + t('km')}</span></li>
            ))}
          </ul>
        </div>
      ) : null}
    </Frame>
  );
}
