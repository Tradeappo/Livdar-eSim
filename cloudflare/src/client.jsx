// Client islands, browser side. See cloudflare/src/islands/server.jsx for the design.
//
// Every <atlas-island> on the page is hydrated with the REAL component and the props the
// server rendered it with, so React adopts the existing markup instead of replacing it:
// the calculator accepts input, the calls to action report their click before navigating,
// the language globe opens, and the consent banner reads and writes the same cookie as on
// the Next.js site. These are the repository's own components, unmodified.
//
// Hydration errors are reported, not swallowed. React recovers from a mismatch by
// re-rendering the island on the client, which looks fine and quietly costs the work the
// server did; onRecoverableError puts it in the console where the browser test and
// anyone opening DevTools will see it.

import { hydrateRoot } from 'react-dom/client';
import AtlasTool from '../../components/atlas/AtlasTool.jsx';
import { AtlasCtaPair } from '../../components/atlas/AtlasCta.jsx';
import LanguageGlobe from '../../components/LanguageGlobe.jsx';
import ConsentBanner from '../../components/ConsentBanner.jsx';

const COMPONENTS = { AtlasTool, AtlasCtaPair, LanguageGlobe, ConsentBanner };
export const CLIENT_ISLAND_NAMES = Object.keys(COMPONENTS);

function readModel() {
  const el = document.getElementById('atlas-model');
  if (!el) return null;
  try { return JSON.parse(el.textContent); } catch (error) {
    console.error('atlas: the page model JSON is unreadable', error);
    return null;
  }
}

function hydrateAll() {
  const model = readModel();
  const decode = (value) => {
    if (value && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, '$atlasRef')) {
      if (!model) throw new Error('an island references the page model and the page has none');
      return value.$atlasRef === '' ? model : model[value.$atlasRef];
    }
    return value;
  };
  const report = { hydrated: [], failed: [] };
  for (const el of document.querySelectorAll('atlas-island')) {
    const name = el.getAttribute('data-island');
    const Component = COMPONENTS[name];
    if (!Component) { report.failed.push(name + ': unknown island'); continue; }
    try {
      const raw = JSON.parse(el.getAttribute('data-props') || '{}');
      const props = {};
      for (const [key, value] of Object.entries(raw)) props[key] = decode(value);
      hydrateRoot(el, <Component {...props} />, {
        onRecoverableError(error) {
          console.error('atlas: hydration mismatch in ' + name, error);
          report.failed.push(name + ': hydration mismatch');
        },
      });
      report.hydrated.push(name);
    } catch (error) {
      console.error('atlas: could not hydrate ' + name, error);
      report.failed.push(name + ': ' + String(error && error.message || error));
    }
  }
  // Read by the browser test; harmless anywhere else.
  window.__atlasIslands = report;
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hydrateAll, { once: true });
else hydrateAll();
