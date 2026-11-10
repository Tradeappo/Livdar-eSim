// Client islands, server side.
//
// WHY ISLANDS. Next.js hydrates the whole page. The Worker renders the page with
// renderToStaticMarkup, which is the right call for crawlers (no hydration markers, less
// CPU, smaller HTML) but leaves nothing for React to attach to. Only four components in
// the Atlas tree actually need the browser — the tool, the calls to action, the language
// globe and the consent banner — so those four are hydrated on their own and the rest of
// the page stays plain HTML. This is the same boundary Next.js draws, because each of the
// four is a 'use client' module (or, for AtlasCtaPair, an export of one).
//
// HOW. cloudflare/build.mjs resolves imports of those modules, in the SERVER bundle only,
// to wrappers made by island() below. A wrapper:
//   1. renders the real component with renderToString — not renderToStaticMarkup — so
//      the markup carries the text separators hydration needs to match;
//   2. puts that markup inside <atlas-island>, a custom element styled display:contents,
//      so it adds no box and no layout. A custom element rather than a <div> because the
//      HTML parser closes an open <p> when it meets a <div>, and would silently move the
//      island out of its paragraph;
//   3. records the props in data-props, so the browser can render the same component with
//      the same props and React finds identical markup.
// The components themselves are not modified.
//
// PROPS THAT ARE THE PAGE MODEL are not copied. AtlasCtaPair takes the whole model and
// AtlasTool takes model.tool, which on the largest tools page is a 35-country table; a
// page with two CTAs and a tool would otherwise carry the model three times. Any prop
// that IS the model, or IS one of its top-level fields, is written as a reference, and
// render.jsx prints the model once in <script type="application/json" id="atlas-model">.

import { renderToString } from 'react-dom/server.browser';

let pageModel = null;
let modelReferenced = false;

/** Called by render.jsx before each page render. Rendering is synchronous, so a module
 *  variable is safe: no other page can be rendering on this isolate at the same time. */
export function beginIslands(model) {
  pageModel = model || null;
  modelReferenced = false;
}

/** Whether any island on the page referenced the model, i.e. whether to print it. */
export const islandsReferencedModel = () => modelReferenced;

function encode(value) {
  if (pageModel && value && typeof value === 'object') {
    if (value === pageModel) { modelReferenced = true; return { $atlasRef: '' }; }
    for (const key of Object.keys(pageModel)) {
      if (pageModel[key] === value) { modelReferenced = true; return { $atlasRef: key }; }
    }
  }
  return value;
}

export function island(name, Real) {
  function Island(props) {
    const data = {};
    for (const [key, value] of Object.entries(props)) {
      if (key === 'children') continue;
      data[key] = encode(value);
    }
    const html = renderToString(<Real {...props} />);
    return <atlas-island data-island={name} data-props={JSON.stringify(data)} dangerouslySetInnerHTML={{ __html: html }} />;
  }
  Island.displayName = 'Island(' + name + ')';
  return Island;
}

// The islands, by name. The client entry (cloudflare/src/client.jsx) holds the same list,
// and tests/atlas-cloudflare.test.mjs asserts the two agree.
export const ISLAND_NAMES = ['AtlasTool', 'AtlasCtaPair', 'LanguageGlobe', 'ConsentBanner'];
