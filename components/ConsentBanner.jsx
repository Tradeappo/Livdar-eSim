'use client';

import { useEffect, useState } from 'react';
import { readConsent, writeConsent, applyConsent } from '../lib/analytics.js';

// Consent gate. The default state is written before the tag container loads,
// in the layout, so nothing can fire ahead of a decision. This component only
// records the decision and pushes the update.

export default function ConsentBanner({ strings }) {
  const [state, setState] = useState('loading');
  const [stats, setStats] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const stored = readConsent();
    if (stored) {
      applyConsent(stored);
      setState('hidden');
    } else {
      setState('ask');
    }
  }, []);

  const decide = (choice) => {
    writeConsent(choice);
    applyConsent(choice);
    setState('hidden');
  };

  if (state === 'loading' || state === 'hidden') return null;

  return (
    <div className="consent" role="dialog" aria-label={strings.consentTitle}>
      <h2>{strings.consentTitle}</h2>
      <p>{strings.consentBody}</p>

      {state === 'prefs' ? (
        <div className="consent-prefs">
          <label className="consent-row">
            <input type="checkbox" checked readOnly disabled />
            <div>
              <strong>{strings.consentFunctional}</strong>
              <span>{strings.consentFunctionalNote}</span>
            </div>
          </label>
          <label className="consent-row">
            <input type="checkbox" checked={stats} onChange={(e) => setStats(e.target.checked)} />
            <div><strong>{strings.consentStats}</strong></div>
          </label>
          <label className="consent-row">
            <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
            <div><strong>{strings.consentMarketing}</strong></div>
          </label>
        </div>
      ) : null}

      <div className="consent-actions">
        {state === 'prefs' ? (
          <button type="button" className="btn btn-primary" onClick={() => decide({ statistics: stats, marketing })}>
            {strings.consentSave}
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={() => decide({ statistics: true, marketing: true })}>
            {strings.consentAccept}
          </button>
        )}
        <button type="button" className="btn btn-ghost" onClick={() => decide({ statistics: false, marketing: false })}>
          {strings.consentReject}
        </button>
        {state === 'ask' ? (
          <button type="button" className="btn btn-ghost" onClick={() => setState('prefs')}>
            {strings.consentSettings}
          </button>
        ) : null}
      </div>
    </div>
  );
}
