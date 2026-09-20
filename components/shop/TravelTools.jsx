'use client';

import { useEffect, useRef, useState } from 'react';
import { pushEvent, EVENTS, baseParams } from '../../lib/analytics.js';
import { adviceFor, estimateTrip, recommendData } from '../../lib/travel-tools.js';

const TOOLS = ['cost', 'advisor', 'advice', 'card'];
const ICONS = { cost: '🧮', advisor: '🧭', advice: '📍', card: '↗' };

function Field({ label, value, onChange, min = 0, step = 1, id, text = false }) {
  return (
    <div className="tool-field">
      <div style={{ minWidth: 0, flex: 1 }}>
        <label className="tool-field-label" htmlFor={id}>{label}</label>
        <input id={id} type={text ? 'text' : 'number'} inputMode={text ? undefined : 'numeric'} min={text ? undefined : min} step={text ? undefined : step} value={value} onChange={(event) => onChange(text ? event.target.value : Math.max(min, Number(event.target.value) || 0))} />
      </div>
      {!text ? <div className="tool-stepper"><button type="button" aria-label={label + ' minus'} onClick={() => onChange(Math.max(min, value - step))}>-</button><button type="button" aria-label={label + ' plus'} onClick={() => onChange(value + step)}>+</button></div> : null}
    </div>
  );
}

function PanelHead({ icon, title, sub }) {
  return <div className="tools-panel-head"><span className="tools-tab-icon" aria-hidden="true">{icon}</span><div><h3>{title}</h3><p>{sub}</p></div></div>;
}

function drawCard(canvas, card, strings) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#ff5d78');
  gradient.addColorStop(0.52, '#884dff');
  gradient.addColorStop(1, '#2ab8ff');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(255,255,255,.09)';
  ctx.beginPath();
  ctx.arc(width * 0.83, height * 0.16, width * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = '700 34px Arial';
  ctx.fillText('LIVDAR TRIP DROP', 70, 82);
  let titleSize = 104;
  while (titleSize > 54) {
    ctx.font = '900 ' + titleSize + 'px Arial';
    if (ctx.measureText(card.destination || 'Japan').width <= width - 140) break;
    titleSize -= 4;
  }
  ctx.fillText(card.destination || 'Japan', 70, 310);
  ctx.font = '700 44px Arial';
  ctx.fillText('✈  ✦  📍', 70, 402);
  ctx.font = '700 36px Arial';
  ctx.fillText('📅 ' + card.days + ' ' + strings.dayLabel, 70, height - 174);
  ctx.fillText('€' + Number(card.budget).toLocaleString(), width * 0.42, height - 174);
  ctx.fillText('📶 ' + card.data, width * 0.71, height - 174);
  ctx.font = '500 24px Arial';
  ctx.fillStyle = 'rgba(255,255,255,.82)';
  ctx.fillText('livdar.com', 70, height - 55);
  ctx.textAlign = 'right';
  ctx.fillText('#mytrip', width - 70, height - 55);
  ctx.textAlign = 'left';
}

export default function TravelTools({ locale, strings }) {
  const t = strings.tools;
  const [tab, setTab] = useState('cost');
  const [days, setDays] = useState(7);
  const [stay, setStay] = useState(85);
  const [food, setFood] = useState(35);
  const [transport, setTransport] = useState(15);
  const [esim, setEsim] = useState(0);
  const [activities, setActivities] = useState(false);
  const [costResult, setCostResult] = useState(null);
  const [advisor, setAdvisor] = useState({ days: 7, usage: 'medium', hotspot: false });
  const [dataResult, setDataResult] = useState(null);
  const [adviceDestination, setAdviceDestination] = useState('Japan');
  const [adviceResult, setAdviceResult] = useState([]);
  const [card, setCard] = useState({ destination: 'Japan', days: 7, budget: 1240, data: '10 GB' });
  const canvasRef = useRef(null);

  const track = (label) => pushEvent(EVENTS.ctaClick, Object.assign(baseParams({ locale, market: locale, cluster: 'tools' }), { cta_label: label, cta_position: 'travel_tools' }));
  const selectTab = (next) => { setTab(next); track('travel_tool_open:' + next); };
  const calculate = () => { setCostResult(estimateTrip({ days, stay, food, transport, esim, activities })); track('travel_cost_calculate'); };
  const recommend = () => { setDataResult(recommendData(advisor)); track('esim_advisor_recommend'); };
  const showAdvice = () => { setAdviceResult(adviceFor(adviceDestination, t.advice.items.map((item) => item.body))); track('travel_advice_show'); };
  const renderCard = () => { drawCard(canvasRef.current, card, t.card); track('travel_card_generate'); };

  useEffect(() => { if (tab === 'card') drawCard(canvasRef.current, card, t.card); }, [tab, card, t.card]);

  const downloadCard = () => {
    drawCard(canvasRef.current, card, t.card);
    const link = document.createElement('a');
    link.download = 'livdar-trip-card.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    track('travel_card_download');
  };

  const shareCard = async () => {
    try {
      drawCard(canvasRef.current, card, t.card);
      const blob = await new Promise((resolve) => canvasRef.current.toBlob(resolve, 'image/png'));
      if (!blob) return;
      const file = new File([blob], 'livdar-trip-card.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: t.card.shareTitle, files: [file] });
        track('travel_card_share');
        return;
      }
      downloadCard();
    } catch (error) {
      if (error?.name !== 'AbortError') downloadCard();
    }
  };

  return (
    <section className="tools-shell" aria-labelledby="tools-heading">
      <div className="tools-head"><h2 id="tools-heading">{t.title}</h2><p>{t.sub}</p></div>
      <div className="tools-tabs" role="tablist" aria-label={t.title}>
        {TOOLS.map((key) => <button key={key} id={'tool-tab-' + key} type="button" role="tab" className="tools-tab" aria-selected={tab === key} aria-controls={'tool-panel-' + key} onClick={() => selectTab(key)}><span className="tools-tab-icon" aria-hidden="true">{ICONS[key]}</span>{t.tabs[key]}</button>)}
      </div>

      {tab === 'cost' ? <div className="tools-panel" id="tool-panel-cost" role="tabpanel" aria-labelledby="tool-tab-cost">
        <PanelHead icon={ICONS.cost} title={t.cost.title} sub={t.cost.sub} />
        <div className="tools-grid">
          <Field id="tool-days" label={t.cost.days} value={days} onChange={setDays} min={1} />
          <Field id="tool-stay" label={t.cost.stay} value={stay} onChange={setStay} step={5} />
          <Field id="tool-food" label={t.cost.food} value={food} onChange={setFood} step={5} />
          <Field id="tool-transport" label={t.cost.transport} value={transport} onChange={setTransport} step={5} />
          <Field id="tool-esim" label={t.cost.esim} value={esim} onChange={setEsim} />
          <label className="tool-field tool-switch"><span><strong className="tool-field-label">{t.cost.activities}</strong><small>{t.cost.activitiesSub}</small></span><input type="checkbox" checked={activities} onChange={(event) => setActivities(event.target.checked)} /></label>
        </div>
        <button type="button" className="tool-cta" onClick={calculate}>{t.cost.cta}</button>
        {costResult ? <div className="tool-result" aria-live="polite"><strong>{t.cost.resultTitle}</strong><div className="tool-result-row"><span>{t.cost.perDay}</span><span>€{costResult.perDay.toLocaleString()}</span></div><div className="tool-result-row tool-result-total"><span>{t.cost.total.replace('{days}', String(costResult.days))}</span><span>€{costResult.total.toLocaleString()}</span></div><p className="tool-note">{t.cost.note}</p></div> : null}
      </div> : null}

      {tab === 'advisor' ? <div className="tools-panel" id="tool-panel-advisor" role="tabpanel" aria-labelledby="tool-tab-advisor">
        <PanelHead icon={ICONS.advisor} title={t.advisor.title} sub={t.advisor.sub} />
        <div className="tools-grid">
          <Field id="advisor-days" label={t.advisor.days} value={advisor.days} min={1} onChange={(value) => setAdvisor({ ...advisor, days: value })} />
          <label className="tool-field"><span style={{ flex: 1 }}><span className="tool-field-label">{t.advisor.usage}</span><select value={advisor.usage} onChange={(event) => setAdvisor({ ...advisor, usage: event.target.value })}>{Object.entries(t.advisor.usageOptions).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></span></label>
          <label className="tool-field tool-switch"><span><strong className="tool-field-label">{t.advisor.hotspot}</strong><small>{t.advisor.hotspotSub}</small></span><input type="checkbox" checked={advisor.hotspot} onChange={(event) => setAdvisor({ ...advisor, hotspot: event.target.checked })} /></label>
        </div>
        <button type="button" className="tool-cta" onClick={recommend}>{t.advisor.cta}</button>
        {dataResult ? <div className="tool-result" aria-live="polite"><strong>{t.advisor.resultTitle}</strong><span className="tool-big-result">{dataResult === 'unlimited' ? t.advisor.unlimited : dataResult + ' GB'}</span><p className="tool-note">{t.advisor.resultNote}</p></div> : null}
      </div> : null}

      {tab === 'advice' ? <div className="tools-panel" id="tool-panel-advice" role="tabpanel" aria-labelledby="tool-tab-advice">
        <PanelHead icon={ICONS.advice} title={t.advice.title} sub={t.advice.sub} />
        <Field id="advice-destination" label={t.advice.destination} value={adviceDestination} onChange={setAdviceDestination} text />
        <button type="button" className="tool-cta" onClick={showAdvice}>{t.advice.cta}</button>
        {adviceResult.length ? <div className="tool-advice-list" aria-live="polite">{t.advice.items.map((item, index) => <article key={item.title}><strong>{item.title}</strong><p>{adviceResult[index]}</p></article>)}</div> : null}
      </div> : null}

      {tab === 'card' ? <div className="tools-panel" id="tool-panel-card" role="tabpanel" aria-labelledby="tool-tab-card">
        <PanelHead icon={ICONS.card} title={t.card.title} sub={t.card.sub} />
        <div className="tool-card-layout"><div><div className="tools-grid">
          <Field id="card-destination" label={t.card.destination} value={card.destination} onChange={(value) => setCard({ ...card, destination: value })} text />
          <Field id="card-days" label={t.card.days} value={card.days} min={1} onChange={(value) => setCard({ ...card, days: value })} />
          <Field id="card-budget" label={t.card.budget} value={card.budget} step={50} onChange={(value) => setCard({ ...card, budget: value })} />
          <Field id="card-data" label={t.card.data} value={card.data} onChange={(value) => setCard({ ...card, data: value })} text />
        </div><div className="tool-card-actions"><button type="button" className="tool-cta" onClick={renderCard}>{t.card.generate}</button><button type="button" className="tool-secondary" onClick={downloadCard}>{t.card.download}</button><button type="button" className="tool-secondary" onClick={shareCard}>{t.card.share}</button></div></div><div className="tool-card-preview"><canvas ref={canvasRef} width="1080" height="1080" aria-label={t.card.title} /></div></div>
      </div> : null}
    </section>
  );
}
