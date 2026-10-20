# Known bugs, their fixes, and the risks still open

Each entry gives the symptom, the cause, the fix and where it is recorded (commit hash on
`claude/seo-handoff-partial-data-7rs7zi` unless stated). The pattern behind most of them is
worth stating once: **the dangerous failures here reported success.** A stage that wrote
nothing, a query that returned HTTP 200 with zero rows, a resume that reused a stale file, a
gate that was never applied. Every fix below either made such a failure loud or removed the
code path that produced it.

---

## 1. Inventory size and units

| # | symptom | cause | fix | record |
|---|---|---|---|---|
| 1 | Transit was 510,592 of 972,910 FINAL (52.5%), pairing bus stops with their neighbours | pairs keyed on `stn:<stop id>` instead of the settlement | stops resolved to settlements as read; aggregated on settlements. 510,592 → 125,652, FINAL → 586,511 | `b17675e`, `TRANSIT-UNIT-CORRECTION-2026-10-10.md` |
| 2 | 80 New Jersey towns had 80 climate pages with one set of numbers; Paris equals 173 communes | NASA POWER is gridded (~55 km); 64,418 cities share 21,260 distinct vectors | one page per (language, family, grid cell); 31,555 rejected, net -23,453 | `d129626`, `1M-NEW-MODEL-SCOPING-2026-10-16.md` |
| 3 | 1,125 of 2,465 Wikidata-gate rejections were Via Alpina / Mare a Mare stages | trail stages share a parent route's QID | for `trail`, require QID AND name; +773 rows | `ebb74c5` |
| 4 | 2,147 outdoor pages (29%) gave the feature itself as its parent ("Amrum ... inside Amrum") | the parent layer holds lake/island polygons of its own | a parent whose name folds to the entity's name or any of its 11 article titles is the same thing | `62d8980` |
| 5 | 3,179 administrative areas paged under the landmark contract on two facts and a parent | container classes left in the landmark directory; the area pass then lost them as "already paged" | 102,207 container ids RESERVED from the landmark builder; areas need all three tests | `1M-REACHED-2026-10-19.md` |
| 6 | 5,573 real pages silently discarded | five country families resolved to one URL (surface + last segment dropped the vertical); exact dedupe kept the first | URL disambiguated with the family prefix where a segment is ambiguous | `5d58a38` |
| 7 | 748 duplicate aggregation URLs; POI of different towns merged | name-only join (the gazetteer has 1,051 cross-country and 640 within-country shared names) | `entity_identity.py`: `city_key`, `city_label`, `city_slug`; duplicates 748 → 0 | `d83b30a`, `2a2347b` |
| 8 | 986 title collisions (Woodstock, Woodstock) | admin1 was a bare code | GeoNames admin1/admin2 tables; titles qualified only where ambiguous; 986 → 4 | `f1b2804` |
| 9 | 10,317 exact duplicate Wikidata titles | same name, same country ("Akademisches Gymnasium, AT") | a per-row tiered locator only where a name collides (adding the parent everywhere was WORSE: titles > 65 chars 115,054 → 209,721) | `8488ead` |
| 10 | weather best-time: 29,210 rows rejected as SERP_FEATURE_SUPPRESSED | two mislabelled duplicate rows in `08-SERP-EVIDENCE.csv` closed the family (`serp_by_fam` takes the first row) | resampled on the right intent; admitted per (language, city) on measured volume | `b29df4f` |
| 11 | en-AU took 477 Mexican cities; es-MX had 0 rows | ownership by the higher family demand_score, measured for another entity | home market first, then entity-specific demand | `4d7448c` |
| 12 | 7,028 domestic Dutch transit pages against a measurement that refused them | refusal recorded, never applied | `PAIR_DOMESTIC_REFUSED['NL']`; cross-border kept | `gtfs-pair-candidates.py` |
| 13 | reverse-direction pairs identical except word order | both directions emitted | a direction survives only if its facts differ from its reverse | `gtfs-pair-candidates.py` |
| 14 | `funnel_reconciles: false` in the 2026-10-19 summary while the files reconcile exactly | formula omitted the 31,555 grid-cell rejections appended after `raw_total` | formula now sums every `ROW_GROUPS` rejection group (2026-10-21); flag reads true from the next run | this backup, `build-1m-candidate-manifest.py` |
| 15 | 326 rejected rows never written to the rejected file | a new gate's list missing from `ROW_GROUPS` | one list drives both the rejected file and the counts | builder comment at `ROW_GROUPS` |
| 16 | 0 of 302,063 rows carried a locale fact; 15,398 factless destination rows; later 68,216 of 186,121 destination rows had none | `locale_facts` set by one builder only, then not by the Wikidata builders | set in every builder via `entity_identity.locale_facts_for_row`; 704 remain at 1M | `78277ba`, `8488ead` |
| 17 | destination axis reported as zero | the report matched the word "destination" in the wrong column | counted the way QA counts (home country vs row country) | `18d2436` |
| 18 | no destination country ever produced a POI page | every POI shape began `if not COUNTRY_MKT.get(country): continue` | destination rows allowed without a home market | `fe07ce7` |

## 2. Silent failures in capture and parsing

| # | symptom | cause | fix | record |
|---|---|---|---|---|
| 19 | the register census reported no register with 500 items | `entity_of` refused `.../prop/direct/P649`, returning None, read as zero | `property_of()` in `wd_sparql.py`; NRHP found at 71,267 readable items | `a8d7ca2`, `1M-REACHED-2026-10-19.md` |
| 20 | 18,938 heritage rows refused for a missing register id | facts fetched with `--profile landmark`, which has no `REGISTER_IDS` | heritage directories use `--profile heritage` (`wikidata-layers-rebuild.sh`) | `wikidata-layers-rebuild.sh` |
| 21 | a class capture wrote zero items and reported success | `GROUP_CONCAT` omitted from bindings by one endpoint, HTTP 200 | query reshaped; three silent wrong answers documented | `61cab4c` |
| 22 | the `?c wdt:P279* root . ?x wdt:P31 ?c` shape times out everywhere | too large an aggregate | reverse it: test a KNOWN class set against the roots in VALUES batches; latitude partitions for big aggregates | `1M-REACHED-2026-10-19.md` |
| 23 | the generic administrative root admits airbases, barracks, castles | the subclass graph leaks | test per root (numbered roots: 48 classes; generic: 1,227); use P131 container evidence | `wikidata-class-level-test.py`, `wikidata-admin-tail-route.py` |
| 24 | an enrichment file "grew all night" and stayed at 598 readable rows | appending after a truncated gzip member makes appended rows unreadable | resume keeps what it read and refuses to append to a file that ends mid-member | `38790d9` |
| 25 | the gap table shipped 11 of 16 rows | silent truncation | fixed and checked by `verify-artifacts-agree.py` | `ee9398a` |

## 3. Memory (OOM) and orchestration

| # | symptom | cause | fix | record |
|---|---|---|---|---|
| 26 | `poi-parent-assign.py` OOM-killed at 11.1 GB | every polygon ring held twice (floats + shapely) | drop the ring as the geometry is built; 2.7 GB | `a66c3a5` |
| 27 | the same OOM in four of five geographic builders (10.3 to 10.8 GB) | same cause, copied | one parent loader in `entity_identity.py` that cannot hand out a ring | `9f6e495`, `00aae6b` |
| 28 | the builder OOM-killed at 11.8 GB, twice | concatenating nine row lists allocates a tenth; the contest list held 73,303 dicts | stream the rejected file and the contests | `18a1a72`, builder comments |
| 29 | GTFS national harvest about 600 MB per 100 s toward the 15 GB cgroup | stop-keyed aggregate | collapse to settlements first; stream `stop_times` per trip | `d74e940` |
| 30 | a run reached the builder with four-day-stale outdoor features | an OOM-killed stage printed "see the log" and the runner carried on | every entity-store stage is FATAL via `verify-stage-output.sh` (exit code, file exists, row floor, freshness marker) | `00aae6b` |
| 31 | QA and reports described a manifest that no longer existed | a failed manifest stage did not stop the run | the manifest stage is fatal | `5d58a38` |
| 32 | `--from-manifest` reused an aggregation built by older code | resume flags know about inputs, not code | the rule: reuse only when neither inputs nor the writing script changed; Wikidata candidates always rebuilt | `run-1m-pipeline.sh` header |
| 33 | `syntax error near unexpected token 'do'` in a valid script | the runner was edited while running; bash reads by byte offset | `assert-not-running.py` before any edit | `assert-not-running.py` |
| 34 | a guard reported "running" against itself; `pkill -f` killed its own shell (exit 144) | `pgrep -f` matches the wrapper's command line | read `/proc/<pid>/cmdline` and exclude self and parent | `assert-not-running.py` |
| 35 | the manifest crossed 97 MiB against GitHub's 100 MiB limit | single file | `shard-manifest-for-git.py`: parts with per-part and total SHA-256 | `7f5b8c5` |

## 4. Production serving (Atlas, on `main`)

| # | symptom | cause | fix | record |
|---|---|---|---|---|
| 36 | 497 Atlas pages returned 404 | manifests not on the file-tracing list; `notFound()` got cached | tracing include; missing manifest now throws instead of 404 | `lib/atlas/serve-pages.js` |
| 37 | 25,845 server errors over 12 days on the Atlas pages during ISR revalidation | the bundled module looked for the manifest under `.next/` | `process.cwd()` first, module-relative second; verified live on 2026-10-20 (475 of 475 regenerations fresh, 0 errors) | `8c8bc80`, `serve-pages.js` |
| 38 | 79 URLs "unknown to Google, not in sitemap" | Google's read was stale; all 500 were in the sitemap | verified 500/500 in 75 child sitemaps; sitemap resubmission added to the workflow (PR #40) | 2026-10-20 checks |
| 39 | cohort 003 pages would have redirected | new segments missing from the edge list (`atlas-edge.js`) | segments added; a test compares the edge list to the vocabulary | PR #38 |
| 40 | x-default missing on all 500 pages | metadata and switcher shared one map | two maps (`hreflangMapFor`, `alternatePathsFor`) | `serve-pages.js` |

## 5. Cohort 003 (2026-10-20), found by `main`'s gates

| # | symptom | cause | fix |
|---|---|---|---|
| 41 | every page in a market carried the same keyword (`wetter rom` on all German pages) | manifest keyword fields are family x market, not per page | each page carries its own query; `volume: null`; `demand.basis: 'utility'` |
| 42 | 784 of 797 non-English pages named cities in English ("Wetter in Munich"); 71 of 74 Japanese pages in Latin script | `cityName` falls back to the GeoNames primary name | `localCityName` reads GeoNames alternate names; a Japanese page with no Japanese name is refused |
| 43 | the same tool CTA on every page of a language | no CTA chain for the family | `countrySibling` first step |
| 44 | the monitor required an Ahrefs volume on every page | written when every page was demand-measured | `DEMAND_PROVEN` / `UTILITY_PROVEN` split; neither still fails; null not 0 |
| 45 | URL Inspection stops at 60 minutes | one access token with a 3,600 s lifetime | **open**: re-mint the token mid-run (NEXT-STEPS) |

## 6. Open risks and limitations

1. **The renderer is the constraint.** 975,677 of 1,002,362 rows have no page builder.
2. **Simulated titles.** QA on the manifest measures English title skeletons: 143,673 titles over
   65 characters, 134,037 metas over 165, 436 exact duplicate titles, 6,906 duplicate H1s within a
   market, 8,740 names needing a disambiguator. Real copy is written per market at cohort time and
   cohort QA must reach 0.
3. **Per-page demand is mostly unmeasured.** 285,729 rows are DEMAND_PROVEN; the rest rest on
   utility or aggregation. Without paid tools, new per-entity demand can only come from the
   Wikimedia clickstream and, once pages are live, Search Console.
4. **Licence and feed blocks.** 76,291 rows need a licence; 17,131 need a listings feed.
5. **Partial sources.** The rail graph is partial (mean degree 1.66); 1,623 GTFS feeds are held;
   Wikidata coverage drives the landmark and settlement layers.
6. **Hard-coded paths.** Scripts assume `/home/user/Livdar-eSim/`.
7. **Indexation is crawl-limited.** Of the old 500, 199 of 200 crawled pages are indexed and 189
   are discovered-not-crawled (2026-10-20); Italian (4 of 51) and Dutch (1 of 21) lag. Publishing
   far more pages before crawl demand grows risks diluting it.
8. **ODbL share-alike** applies to derived databases from OSM.
9. **The 2026-10-19 summary's `funnel_reconciles: false`** stays in the committed file until the
   next builder run.
