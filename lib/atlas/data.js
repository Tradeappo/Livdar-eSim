// Livdar Atlas data snapshot. Imported statically so the Next build traces it
// and every function bundle carries the same data. Ingest scripts rewrite these
// files; nothing here touches the network.
//
// Scale note: the accessors below (cityById, climate, registry) are the only
// way the rest of lib/atlas reads data. When the snapshot outgrows a function
// bundle, these become per-shard dynamic imports or a KV lookup and nothing
// else changes.

import sources from '../../data/atlas/sources.json' with { type: 'json' };
import manifest from '../../data/atlas/manifest.json' with { type: 'json' };
import cities from '../../data/atlas/entities/cities.json' with { type: 'json' };
import countries from '../../data/atlas/entities/countries.json' with { type: 'json' };
import airports from '../../data/atlas/entities/airports.json' with { type: 'json' };
import climate from '../../data/atlas/entities/climate.json' with { type: 'json' };
import slugs from '../../data/atlas/slugs.json' with { type: 'json' };
import demand from '../../data/atlas/demand.json' with { type: 'json' };
import registry from '../../data/atlas/registry.json' with { type: 'json' };
import { DESTINATIONS } from '../destinations.js';
import { publishedDestinationIds } from '../content/index.js';
import { routes } from '../routes.js';

// Links from Atlas pages to the eSIM destination page of the same country, only
// for destination pages that are published in that locale. Bali is a region of
// Indonesia, not a country page, so it is never the country link.
function esimLinks() {
  const out = {};
  ['en', 'de', 'ro'].forEach((l) => {
    out[l] = {};
    publishedDestinationIds(l).forEach((id) => {
      const d = DESTINATIONS.find((x) => x.id === id);
      if (d && d.iso2 && id !== 'bali') out[l][d.iso2] = routes.destination(l, id);
    });
  });
  return out;
}

let current = null;

export function loadDataset() {
  if (!current) current = buildIndex({ manifest, cities, countries, airports, climate, slugs, demand, registry, sourceList: sources.sources, esimLinks: esimLinks() });
  return current;
}

// Tests swap the dataset for a fixture; production code never calls this.
export function setDataset(raw) {
  current = raw ? buildIndex(raw) : null;
  return current;
}

function buildIndex(raw) {
  const cityById = new Map(raw.cities.map((c) => [String(c.id), c]));
  const airportByIata = new Map(raw.airports.filter((a) => a.iata).map((a) => [a.iata, a]));
  const reverse = (table) => {
    const byLocale = {};
    Object.entries(table || {}).forEach(([id, s]) => Object.entries(s).forEach(([l, v]) => {
      byLocale[l] = byLocale[l] || new Map();
      byLocale[l].set(v, id);
    }));
    return byLocale;
  };
  return {
    ...raw,
    esimLinks: raw.esimLinks || {},
    cityById,
    airportByIata,
    citySlugIndex: reverse(raw.slugs.cities),
    airportSlugIndex: reverse(raw.slugs.airports),
  };
}
