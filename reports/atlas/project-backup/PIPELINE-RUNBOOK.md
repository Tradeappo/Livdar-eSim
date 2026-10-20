# Pipeline runbook

How the 1,002,362-row inventory is produced, how to resume it, how to validate it, and how
a slice of it becomes published pages. Every command here exists in the repo as of
2026-10-21. Read `RECOVERY-INSTRUCTIONS.md` first for the rules and the safety checks.

---

## 1. The shape

```
 CAPTURE (network, slow, resumable)        scripts/atlas/ingest/*
   OSM extracts, Wikidata, Wikimedia clickstream, GeoNames, NASA POWER, GTFS,
   holidays, registers  ->  data/atlas/sources/<area>/*.jsonl.gz  (+ provenance json)
                 |
 CANDIDATE BUILDERS (local, deterministic)  scripts/atlas/scale/*-candidates.py, *-aggregations.py
   one entity store per layer  ->  data/atlas/sources/<area>/_<name>-candidates.jsonl.gz
                 |
 THE BUILDER (every gate, once, over everything)
   scripts/atlas/scale/build-1m-candidate-manifest.py
   ->  reports/livdar-expiry-freeze-2026-09-30/LIVDAR-1M-CANDIDATE-MANIFEST.{csv.gz,parquet}
       LIVDAR-1M-REJECTED-CANDIDATES.csv.gz, 1M-SUMMARY.json
                 |
 SHARD FOR GIT   scripts/atlas/scale/shard-manifest-for-git.py  ->  *.parts/part-0N.csv.gz
                 |
 QA AND REPORTS  qa-1m-manifest.py, verify-artifacts-agree.py, export-partitions.py, ...
                 |
 PUBLICATION (per cohort, on a branch from main, only when the owner asks)  section 8
```

The builder is the only place gates are applied. A candidate builder may pre-filter its own
layer, but the manifest re-applies uniqueness, deduplication, localisation, cannibalisation,
parent survival and the rest to every row from every layer together, which is what stops a
new layer duplicating an old one.

## 2. The builder's inputs, all committed

`build-1m-candidate-manifest.py` reads 43 paths. On 2026-10-21 every one of them was present
and tracked in git, so **a fresh clone can re-run the builder without capturing anything**.

| area | file(s) | written by |
|---|---|---|
| entity pools | `data/atlas/entities/cities/*.json` (64 shards), `data/atlas/sources/venues/by-country/*.json` | `scripts/atlas/ingest/geonames*.{mjs,py}`, `venues.mjs` |
| POI | `data/atlas/sources/osm-poi/poi-*.jsonl.gz` (39), `_aggregations.jsonl.gz` | `osm-poi-extract.py`; `scale/poi-aggregations.py` |
| places and parents | `osm-parents/_region-aggregations.jsonl.gz`, `_outdoor-aggregations.jsonl.gz` | `scale/region-aggregations.py`, `scale/outdoor-aggregations.py` |
| outdoor | `osm-outdoor/_feature-candidates.jsonl.gz` | `scale/outdoor-feature-candidates.py` |
| trails | `osm-trails/_trail-candidates.jsonl.gz` | `scale/trail-candidates.py` |
| transport | `transport/_gtfs-pair-candidates`, `_gtfs-hub-candidates`, `_manifest-candidates`, `_airport-parking-candidates` (`.jsonl.gz`) | `scale/gtfs-pair-candidates.py`, `gtfs-hub-candidates.py`, `transport-visa-manifest-adapter.py`, `airport-parking-candidates.py` |
| Wikidata entity layers | `wikidata/_candidates`, `_landmark-candidates`, `_landmark-area-candidates`, `_settlement-candidates`, `_area-candidates`, `_area-admin-tail-candidates`, `_heritage-register-candidates`, `_water-feature-candidates` | `scale/wikidata-candidates.py`, `landmark-candidates.py`, `landmark-area-list-candidates.py`, `settlement-candidates.py`, `area-candidates.py` (both area files), `heritage-register-candidates.py`, `water-feature-candidates.py` |
| heritage registers | `heritage/_listed-candidates.jsonl.gz` | `scale/heritage-listed-candidates.py` |
| pulse | `events/_pulse-candidates.jsonl.gz` | `scale/pulse-candidates.py` |
| climate | `climate/city-grid-cells.json` | `ingest/build-climate-grid-cells.py` |
| names and demand | `geonames/altnames-by-language.jsonl.gz`, `geonames/city-sitelinks.jsonl.gz` | `ingest/geonames-altnames-materialise.py`, `ingest/city-sitelinks-materialise.py` |
| market contests | `data/atlas/measurements/same-language-contests.jsonl.gz` | written by the builder itself, read by `market-url-experiment.py` |
| measurements | `data/atlas/measurements/findings/`, `destination-harvest/` | the Ahrefs and open-SERP measurement runs, now frozen |
| family and keyword master | `reports/livdar-master-seo-universe-2026-09-30/FAMILY-MASTER.csv`, `CELL-GATE.csv`, `CROSS-LANGUAGE-REACH.csv`; `reports/livdar-final-research-freeze-2026-09-30/LIVDAR-MASTER-KEYWORDS-FINAL.csv`; `reports/scale-universe-2026-09-29/entity-graph.jsonl.gz` | frozen research outputs |
| freeze inputs | `08-SERP-EVIDENCE.csv`, `1M-FEED-REQUIREMENTS.csv`, `1M-PUBLICATION-MAPPING.csv`, `1M-TIER-CAP-DROP.json`, the previous `1M-SUMMARY.json` | frozen research outputs; the summary is read to compare runs |
| live state | `reports/atlas/live-production.json` | the live crawl record (now 1,500 rows) |

Only three outputs are NOT in git: the 112 MB CSV monolith, the 210 MB parquet and the
70 MB rejected CSV. They are over GitHub's 100 MB file limit. The parts in git carry the
same rows (`_parts-index.json` explains how to reassemble them byte for byte).

## 3. Running it

### 3.1 Before any run

```bash
cd /home/user/Livdar-eSim
git status --short                       # know what is uncommitted before you start
python3 scripts/atlas/scale/assert-not-running.py run-1m-pipeline.sh || exit 1
python3 scripts/atlas/scale/assert-not-running.py build-1m-candidate-manifest.py || exit 1
cp reports/livdar-expiry-freeze-2026-09-30/1M-SUMMARY.json /tmp/1M-SUMMARY-before.json
free -m                                  # the builder peaks near 12 GB; run nothing else heavy
```

### 3.2 Choosing the mode

The orchestrator's own rule (`run-1m-pipeline.sh` header): **reuse an artifact only when
neither its inputs nor the script that writes it has changed.**

| what changed since the last run | command |
|---|---|
| a gate in the builder, a report script, `page_copy.py`, `content_uniqueness.py` | `./scripts/atlas/scale/run-1m-pipeline.sh --from-manifest` |
| a new parent, outdoor, region or trail layer; POI corpus unchanged | `./scripts/atlas/scale/run-1m-pipeline.sh --from-aggregations` |
| the POI corpus, or `poi-aggregations.py`, `place-poi-density.py`, `poi-parent-assign.py` | `./scripts/atlas/scale/run-1m-pipeline.sh` (full) |
| the place layers were not re-captured | add `--skip-places` to a full run |
| a Wikidata capture (landmark, settlement, area, heritage) | `scripts/atlas/ingest/wikidata-layers-rebuild.sh --from build` (section 3.4), then `--from-manifest` |
| a GTFS feed set | `scale/gtfs-pair-candidates.py` and `scale/gtfs-hub-candidates.py`, then `--from-manifest` |

Run it detached and follow the log:

```bash
nohup ./scripts/atlas/scale/run-1m-pipeline.sh --from-manifest > /tmp/pipeline.log 2>&1 &
tail -f /tmp/pipeline.log          # each stage logs to /tmp/pipe_<stage>.log as well
```

### 3.3 The full-run stage order, and why it is fixed

1. `ingest/osm-run-place-layers.sh` - named places with polygons (skippable).
2. `ingest/pulse-materialise.py` - one holiday vocabulary.
3. `scale/poi-parent-assign.py` - **FATAL**. Every POI to its containment parent. Everything
   after asks "what is inside this geography".
4. `scale/place-poi-density.py` - **FATAL**. Each named POI to exactly one place. Must precede
   the aggregation, whose place gate reads it.
5. `scale/poi-aggregations.py` - **FATAL**. City and area list shapes. The largest
   contributor.
6. `scale/outdoor-feature-candidates.py` - **FATAL** entity store.
7. `scale/outdoor-aggregations.py` - **FATAL** entity store.
8. `scale/region-aggregations.py` - **FATAL** entity store.
9. `scale/trail-candidates.py` - **FATAL** entity store.
10. `scale/wikidata-candidates.py` - after the aggregation, because its parents are the city
    lists the aggregation accepted. Rebuilt even on `--from-manifest` (a stale one produced
    orphans 59 → 142 once).
11. `scale/calibrate-search-demand-floor.py` - reads the PREVIOUS manifest on purpose, and
    excludes rows already admitted by the free signal, so the floor cannot walk downward.
12. **`scale/build-1m-candidate-manifest.py`** - every gate. A failure stops the run.
13. `scale/shard-manifest-for-git.py` - immediately, so the parts cannot describe another run.
14. `scale/verify-search-demand-admissions.py /tmp/1M-SUMMARY-before.json` - checks every row
    the free demand signal admitted against its constraints.
15. `scale/qa-1m-manifest.py`, `export-partitions.py`, `build-family-locale-matrix.py`,
    `build-1m-gap-analysis.py`, `market-url-experiment.py`, `hreflang-canonical-design.py`,
    `market-url-report.py`, `npm run dashcheck`, `verify-artifacts-agree.py`,
    `family-acceptance-test.py`, `build-final-deliverable.py`, `final-brief-report.py`.

### 3.4 The Wikidata entity layers have their own orchestrator

The layers added after 2026-10-13 are **not** called by `run-1m-pipeline.sh`. They are rebuilt
by **`scripts/atlas/ingest/wikidata-layers-rebuild.sh [--from demand|language|facts|build]`**,
in an order that is not a preference: each builder excludes the items the builders before it
already paged, because the manifest's one-page-per-item rule is keyed on (language, SURFACE,
item) and never fires between two surfaces. Run them out of order and one castle gets a
landmark page and a heritage page.

1. demand: `ingest/build-entity-search-demand.py` (sitelinks x clickstream; must be first)
2. language: `scale/landmark-choose-language.py` per directory (one page language per entity)
3. facts: `ingest/wikidata-landmark-facts.py`, three languages in parallel (four starts the
   504s); heritage directories MUST use `--profile heritage` or every register id is lost
4. `scale/landmark-candidates.py` (widest contract, first)
5. `scale/settlement-candidates.py` (excludes landmark rows)
6. `scale/area-candidates.py`, then `ingest/wikidata-admin-tail-route.py` and
   `scale/area-candidates.py --src data/atlas/sources/wikidata/landmark --tag admin-tail`
   (writes `_area-admin-tail-candidates.jsonl.gz`)
7. `scale/heritage-register-candidates.py` (excludes landmark and settlement)
8. `scale/landmark-area-list-candidates.py` (the list pages in front of the entity pages)

`water-feature-candidates.py`, the transport builders (`gtfs-pair-candidates.py`,
`gtfs-hub-candidates.py`, `transport-visa-manifest-adapter.py`, `airport-parking-candidates.py`)
and `pulse-candidates.py` are standalone: run the one whose input changed. After any of these,
run `run-1m-pipeline.sh --from-manifest`.

`verify-stage-output.sh` makes a stage fatal when it exits non-zero, when its output file
is missing, when the file was not rewritten in this run (an attempt-marker timestamp), or
when it holds fewer rows than its floor. The floors are about a third of the real counts:
they catch a stub, not a small honest output.

## 4. Re-capturing from zero

Only needed if a source must be refreshed. Captures are network-bound and resumable; each
writes provenance next to its data. The main entry points:

| source | command | notes |
|---|---|---|
| OSM, one market | `scripts/atlas/ingest/osm-run-market.sh <country> <ISO>` | extracts from download.openstreetmap.fr (Geofabrik is blocked by the network policy) |
| OSM, US | `scripts/atlas/ingest/osm-run-us.sh` | four regions |
| OSM, no extract | `scripts/atlas/ingest/osm-overpass-market.py TW TW` | |
| OSM layers | `osm-parents-run.sh`, `osm-outdoor-run.sh`, `osm-trail-run.sh`, `osm-run-places.sh`, `osm-geo-layers-run.sh` | |
| large file | `scripts/atlas/ingest/parallel-get.sh <url> <out> 8` | |
| GeoNames | `geonames-cities-materialise.py`, `geonames-altnames-materialise.py` | CC BY 4.0 |
| Wikidata cities | `wikidata-city-sitelinks.py`, `wikidata-city-sitelinks-via-municipality.py` | CC0 |
| Wikimedia demand | `wikimedia-search-clicks.py`, then `build-city-search-demand.py`, `build-entity-search-demand.py` | clickstream, CC0 |
| Wikidata entity layers | `wikidata-landmark-capture.py`, `wikidata-settlement-capture.py`, `wikidata-class-tail-census.py`, `wikidata-class-tail-capture.py`, `wikidata-class-level-test.py`, `wikidata-admin-tail-route.py`, `wikidata-containment-chain.py`, `wikidata-heritage-register-capture.py`, `wikidata-register-census.py`, `wikidata-water-and-protected.py` (+ `-units`, `-sitelinks`), `wikidata-landmark-facts.py` | through `wd_sparql.py`; qlever.dev and query.wikidata.org were checked to agree |
| climate | `nasa-power-materialise.py`, `climate-normals.mjs`, `build-climate-grid-cells.py` | 64,418 cities |
| holidays | `holidays-materialise.py`, `pulse-materialise.py` | |
| GTFS | `gtfs-feed-registry.py`, `transport-licence-register.py`, `gtfs-harvest.py`, `gtfs-national-harvest.py` | only feeds with a stated open licence |
| rail, air | `wikidata-rail-graph.py`, `transport-graph.py`, `ourairports.mjs` | |
| heritage | `heritage-england-materialise.py` | OGL v3 |

Rate limits are respected in each script; a capture that returns fewer rows than its
endpoint count records itself as short rather than rounding the gap away.

## 5. Resuming where it stopped

1. Verify the committed state (`RECOVERY-INSTRUCTIONS.md`, sections 5 and 6).
2. `git log -5` on the working branch and read the last commit message: every run commits
   its FINAL, the delta and what it changed.
3. Read `NEXT-STEPS.md` for the queue.
4. Choose the smallest mode that covers what changed (section 3.2). Nothing upstream needs
   regenerating to continue.

## 6. Validating a run

After any builder run, all of these must hold before you commit:

```bash
python3 scripts/atlas/verify-1m-manifest.py --json /tmp/verify.json        # intact, distinct, FINAL
python3 - <<'PY'                                                          # generated - rejected = final
import json
s=json.load(open('reports/livdar-expiry-freeze-2026-09-30/1M-SUMMARY.json')); v=json.load(open('/tmp/verify.json'))
assert s['generated_before_any_gate']-v['rejected_rows']==v['FINAL_DISTINCT_VALID']==s['FINAL_DISTINCT_CANDIDATES'], 'does not reconcile'
assert s['funnel_reconciles'] is True, 'builder formula says no'   # true from the first run after 2026-10-21
print('reconciles')
PY
python3 scripts/atlas/scale/qa-1m-manifest.py                # duplicates, orphans, dashes, titles
python3 scripts/atlas/scale/verify-artifacts-agree.py        # every report describes the same run
python3 scripts/atlas/classify-demand-basis.py               # DEMAND_PROVEN / UTILITY_PROVEN / AGGREGATION
npm run -s dashcheck                                         # 0 en dash, 0 em dash, repository wide
```

Then commit the parts, `1M-SUMMARY.json`, `1M-QA-REPORT.json` and the changed builders
together, with `FINAL a -> b, net +/-n, because ...` in the message.

## 7. Committing large outputs

- Never `git add` the monoliths (`*.csv.gz` monolith, `*.parquet`); they exceed 100 MB.
  `shard-manifest-for-git.py` writes the parts and removes stale ones; commit the parts.
- `.gitignore` already excludes crawl bodies and rebuildable bulk; check `git status` before
  adding a directory wholesale.

## 8. From offline inventory to a published cohort

Only when the owner asks. This is the procedure that published cohort 003 (1,000
`weather.city-month` pages, 2026-10-20, PR #38), including what went wrong the first time.

**A. Can the family be rendered?** `grep -n "BUILDERS = {" -A 20 lib/atlas/atlas-model.js` on
`main`. If the family is not there, building the model builder, its copy packs in all nine
languages (`lib/atlas/content/lang/*.js`) and its data reader is the first task. Today 14
families are renderable; 26,685 manifest rows sit in them.

**B. Select on the working branch.** `scripts/atlas/build-cohort-003.mjs --write` is the template:
it reads the manifest rows of one family, builds each page, applies the near-duplicate gate
at the repo's own `NEAR_DUPLICATE_AT` (0.8, `lib/atlas/similarity-scale.js`), allocates across
languages (floor 40, ceiling 200, largest remainder) because a global sort on
`publication_priority` put 969 of 1,000 in Japanese, ranks a city with an English page in the
cohort first inside each other language (complete hreflang cluster with x-default), and
writes `data/atlas/cohorts/cohort-NNN.json`. Each page must carry **its own** target query, and
`demand: {basis, perPageVolume, patternEvidence}` stating what is and is not measured.

**C. Port to a clean branch from `main`**, nothing else:

| piece | where |
|---|---|
| model builder | `lib/atlas/atlas-model.js` (`BUILDERS`) |
| copy packs | `lib/atlas/content/lang/{en,de,fr,es,it,pt,nl,pl,ja}.js`, including a `sections` heading for the directory |
| data store + its readers | e.g. `lib/atlas/climate-store.js`, `lib/atlas/eligibility-pages.js` |
| URL vocabulary | `ATLAS_SEGMENTS` and `FAMILY_SEGMENT` in `lib/atlas/atlas-urls.js` |
| edge list | `ATLAS_SEGMENTS_FLAT` in `lib/atlas/atlas-edge.js` (or the middleware redirects every page) |
| routes | `app/[lang]/<segment>/[[...path]]/page.jsx`, one per segment |
| links and CTA | `WANTS` in `lib/atlas/atlas-links.js`; a chain in `CHAINS` in `lib/atlas/atlas-cta.js` whose first step differs page to page |
| names | `lib/atlas/cities.js` `localCityName` (GeoNames alternate names) where the family names cities |
| registration | `'NNN'` in `MANIFESTS` (`lib/atlas/serve-pages.js`); `LOT_OF` in `scripts/atlas/cohort-register.mjs` |
| cohort files | `data/atlas/cohorts/cohort-NNN.json` |

**D. Run `main`'s gates** on the publish branch:

```bash
node scripts/atlas/cohort-qa.mjs --cohort NNN --write --ci     # rebuilds every page, writes cohort-NNN-pages.json
node scripts/atlas/cohort-register.mjs --cohort NNN --write    # approved
node scripts/atlas/cohort-publish.mjs --cohort NNN --write     # published (recorded in the merge)
node --test tests/*.test.mjs                                   # all must pass
node scripts/quality-gate.mjs && node scripts/atlas/qa.mjs --preview --ci \
  && node scripts/atlas/links.mjs --ci && node scripts/atlas/reconcile.mjs --check
npm run build                                                  # every path must prerender
PORT=3117 npx next start -p 3117 &
node scripts/atlas/verify-live-atlas.mjs "$PWD" http://localhost:3117 /tmp/verify-local.json
```

`verify-live-atlas.mjs` checks every page of every registered cohort: HTTP 200, self
canonical, no noindex, hreflang equal to what serving emits (`alternatesFor`, which joins a
family x entity cluster across cohorts), every model internal link present, and membership
in a child sitemap.

**E. Release.** PR to `main`; verify on the Vercel preview (protected: get a share link,
follow its redirect chain with a cookie jar, pass `--headers 'cookie: _vercel_jwt=...'`;
expect noindex only, by design in `lib/indexing.js`); merge; wait for the production
deployment to be READY; `verify-live-atlas.mjs <main checkout> https://livdar.com`.

**F. Record and announce.**

```bash
node scripts/atlas/fetch-live-evidence.mjs NNN /tmp/live-NNN.json
#   wrap into data/atlas/launches/evidence-<date>.json with productionDeployment and commit
node scripts/atlas/cohort-publish.mjs --cohort NNN --live --write --evidence data/atlas/launches/evidence-<date>.json
#   append the cohort's rows to reports/atlas/live-production.json (URL Inspection reads it)
INDEXNOW_KEY=$(curl -s https://livdar.com/indexnow-key.txt) INDEXNOW_CONFIRM_LIVE=true \
  node scripts/indexnow-submit.mjs --submit --paths "<comma separated new paths>"
```

Then dispatch the `atlas-search-console` workflow on `main` with `submit_sitemap: true` and
`inspect_urls: true`. The workflow's federation only issues tokens on `main`, and an
inspection run stops at 60 minutes when its access token expires (about 550 URLs per run).
