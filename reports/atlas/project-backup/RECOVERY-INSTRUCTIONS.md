# Recovery instructions, for an AI that has never seen this project

Read this whole file before running anything. It assumes you have the repository and
nothing else: no conversation history, no memory, no access to the person's earlier
sessions. Everything you need is in git.

---

## 1. Which repository, and where to put it

- Repository: **`Tradeappo/Livdar-eSim`** on GitHub.
- Clone it to **`/home/user/Livdar-eSim`**. This is not a preference: the pipeline scripts
  hard-code `ROOT = '/home/user/Livdar-eSim/'` (for example
  `scripts/atlas/scale/build-1m-candidate-manifest.py` line 38 and
  `scripts/atlas/scale/run-1m-pipeline.sh`, which does `cd /home/user/Livdar-eSim`). If you
  must clone elsewhere, symlink that path to your clone rather than editing every script.
- `npm install` once (Node 22 or 24). Python 3.11+ with `shapely` and `pyarrow` is needed
  for the geographic builders and the parquet write; the verification scripts need only the
  standard library.

## 2. Which branches matter

| branch | what it is | touch it? |
|---|---|---|
| `claude/seo-handoff-partial-data-7rs7zi` | **The offline inventory.** Every builder, every capture, every report, the 1M manifest parts and this backup. | Work here for anything offline. |
| `main` | **Production.** Vercel deploys every merge to https://livdar.com. Holds the three live cohorts and the code that serves them. Does NOT hold the 1M manifest parts. | Only through a pull request, and only when the owner explicitly asks for a production change. |
| `atlas/search-console` | Written by the `atlas-search-console` GitHub workflow: Search Console imports and URL Inspection evidence. PR #27. | Read only. |

On 2026-10-21 the working branch was 449 commits ahead of `main` and 26 behind. That is
expected: publication ports only what one cohort needs onto a clean branch from `main`
(see section 10). **Never merge the working branch into `main` wholesale**: it would ship
the entire offline inventory, all its captures and its scripts to production.

## 3. What to read first, in this order

1. `reports/atlas/project-backup/README.md` - the index of this backup.
2. `reports/atlas/project-backup/AUTHORITATIVE-STATE.json` - every current number,
   machine-readable, with what is SUPERSEDED and why.
3. `reports/atlas/project-backup/MASTER-HANDOFF.md` - the narrative: what this is, how it
   got here, what is true now.
4. `reports/atlas/project-backup/QUALITY-RULES.md` - the gates. Do not change one without
   reading why it exists.
5. `reports/atlas/project-backup/PIPELINE-RUNBOOK.md` - how to run anything.
6. `reports/atlas/project-backup/KNOWN-BUGS-AND-FIXES.md` - what broke before, so it does
   not break again.

Then, only as needed: `DATA-SOURCES.md`, `FAMILY-REGISTRY.md`, `TRANSPORT-MODEL.md`,
`AHREFS-RESEARCH-SUMMARY.md`, `NEXT-STEPS.md`.

## 4. The rules you are working under

These came from the owner and are not negotiable without the owner saying so:

- **No paid SEO or keyword tools.** No Ahrefs, Semrush, DataForSEO, Ubersuggest or any other
  paid subscription. Use only data already captured in the repo, official/open/licensed free
  datasets, free public APIs, and local processing.
- **Production changes only when explicitly asked.** Offline work is the default.
- **Real demand OR real utility.** A page qualifies on measured demand for it, or on clear
  standalone utility backed by real source data. Never fabricate demand, volumes or facts.
  **Unknown volume is `null`, never `0`**: in this repo `0` means "measured and found nothing".
- No translation-only pages, no city-name swaps, no stop-to-stop transport noise, no
  weakened duplicate, localisation or quality gates.
- **The 23,453 climate city-name-swap rows stay out.** (Cities that share one NASA POWER grid
  cell carry byte-identical normals; one page per cell per language.)
- No new cohort is published until the owner asks for it.

## 5. How to find the current FINAL number

The authoritative figure is the row count of the manifest **as recorded in git**, verified
against its own SHA-256. Do not read it from a markdown file; markdown files go stale.

```bash
cd /home/user/Livdar-eSim
python3 scripts/atlas/verify-1m-manifest.py --json /tmp/verify.json
# prints FINAL_DISTINCT_VALID; exit code 0 only if intact AND distinct AND no rejected row
```

On 2026-10-21 it printed **`FINAL_DISTINCT_VALID: 1002362`**. If you get a different
number, the manifest has been rebuilt since; trust the script, then check
`git log -- reports/livdar-expiry-freeze-2026-09-30/LIVDAR-1M-CANDIDATE-MANIFEST.parts/_parts-index.json`
to see which commit changed it and read that commit's message.

"Valid" means "survived every gate". It does **not** mean "can be served today". Only
26,685 rows belong to a family that has a page builder (`AUTHORITATIVE-STATE.json`,
`renderable_today`).

## 6. How to verify integrity

```bash
# 1. the manifest and the rejected file are byte-identical to what was committed
python3 scripts/atlas/verify-1m-manifest.py --json /tmp/verify.json
#    checks: rows == parts index, sha256 == parts index, every candidate_id and URL distinct,
#    no REJECTED_* status inside the manifest, rejected file intact

# 2. generated - removals = final
python3 - <<'PY'
import json
s = json.load(open('reports/livdar-expiry-freeze-2026-09-30/1M-SUMMARY.json'))
v = json.load(open('/tmp/verify.json'))
print(s['generated_before_any_gate'], '-', v['rejected_rows'], '=',
      s['generated_before_any_gate'] - v['rejected_rows'], 'vs FINAL', v['FINAL_DISTINCT_VALID'])
PY
#    on 2026-10-21: 1872381 - 870019 = 1002362 vs FINAL 1002362
```

**Do not trust `funnel_reconciles` in `1M-SUMMARY.json` from the 2026-10-19 run.** It reads
`false` because of a formula defect (the climate grid-cell rejections were missing from the
formula), not a data defect. The formula was fixed on 2026-10-21 and will read `true` on the
next builder run. The two-line check above is the real one.

## 7. How to start the pipeline

The full procedure is `PIPELINE-RUNBOOK.md`. The short version:

```bash
cd /home/user/Livdar-eSim
# refuse to start if another run is already executing (reads /proc, not pgrep)
python3 scripts/atlas/scale/assert-not-running.py run-1m-pipeline.sh || exit 1
python3 scripts/atlas/scale/assert-not-running.py build-1m-candidate-manifest.py || exit 1
cp reports/livdar-expiry-freeze-2026-09-30/1M-SUMMARY.json /tmp/1M-SUMMARY-before.json
nohup ./scripts/atlas/scale/run-1m-pipeline.sh --from-manifest > /tmp/pipeline.log 2>&1 &
```

Choose the mode from what changed (runbook, section 3):

| what changed | mode |
|---|---|
| only a gate in the builder, a report, or `page_copy.py` | `--from-manifest` (the fastest mode; no committed record times the builder, so time your own run) |
| a new geographic layer (parents, outdoor, regions, trails), POI corpus unchanged | `--from-aggregations` |
| the POI corpus, `poi-aggregations.py`, `place-poi-density.py` or `poi-parent-assign.py` | full run, no flag |
| a Wikidata capture (landmark, settlement, area, heritage) | `scripts/atlas/ingest/wikidata-layers-rebuild.sh --from build` (the layers exclude each other in a fixed order, so rebuild them together), then `--from-manifest` |
| the water layer, a transport input or the holidays | that one standalone builder (runbook 3.4), then `--from-manifest` |

## 8. How to avoid concurrent runs

- Always run `assert-not-running.py` for the orchestrator and the builder before starting.
  It reads `/proc/<pid>/cmdline` directly. **Do not use `pgrep -f` or `pkill -f`**: they match
  their own shell wrapper, which has reported "running" against itself and once killed its
  own shell (exit 144).
- **Never edit a shell script while it runs.** bash reads scripts incrementally by byte
  offset, so an edit mid-run makes it resume inside a different command and fail with a
  syntax error in a perfectly valid file. Check `assert-not-running.py <script>` before
  editing `run-1m-pipeline.sh`.
- One pipeline at a time. Two runs write the same output files and the last writer wins,
  with every artifact agreeing with a run that no longer exists.

## 9. How to avoid OOM

The container has had a 15 GB cgroup. The builder peaks near **12 GB** while it assembles
the parquet, so:

- run **nothing else heavy** alongside the builder or the geographic stages;
- never load a whole candidate file into a list of dicts when you can stream it; the
  rejection file, the same-language contests and the GTFS stop times are all streamed for
  this reason;
- in geographic code, **drop the polygon ring as you build the shapely geometry** (`del
  p['ring']`). Holding both is what OOM-killed `poi-parent-assign.py` at 11.1 GB and three
  other builders; use the shared loader in `scripts/atlas/scale/entity_identity.py`, which
  cannot hand out a ring;
- watch with `cat /sys/fs/cgroup/memory.current` (or `free -m`) while a stage runs.

Every stage that writes an entity store the builder reads is **fatal on failure**
(`verify-stage-output.sh`): if it dies, the run stops and nothing downstream is regenerated.
If a run stops, read `/tmp/pipe_*.log`, fix the cause, and re-run from the right mode. Do
not "continue anyway".

## 10. How to continue without regenerating everything

- **Nothing needs regenerating to keep working.** All 43 builder inputs are committed
  (`PIPELINE-RUNBOOK.md`, section 2), and the manifest parts are committed. Verify with
  section 6 and carry on.
- To add one new layer: write or run its candidate builder, which writes one
  `data/atlas/sources/<area>/_<name>-candidates.jsonl.gz`; wire that file into
  `build-1m-candidate-manifest.py` the way the existing `_settlement-candidates` and
  `_landmark-candidates` are wired; then run `--from-manifest`. The builder re-applies every
  gate to everything, so a new layer cannot bypass deduplication against the old ones.
- After any builder run, the orchestrator shards the outputs for git
  (`shard-manifest-for-git.py`). Commit the parts, the summary and the QA report together,
  with the new FINAL and the delta in the commit message, as every previous run did.

## 11. How to publish the next cohort, when the owner says so

The full checklist is `PIPELINE-RUNBOOK.md`, section 8, written from the cohort 003
launch on 2026-10-20. The parts that are easy to get wrong:

1. **A family can only be published if `lib/atlas/atlas-model.js` on `main` has a builder
   for it.** Today 14 families do. Most of the 1M inventory needs a builder first.
2. Select on a branch from the inventory, then **port only what that cohort needs onto a
   clean branch from `main`**: builder, copy packs, data store, the cohort files, URL
   vocabulary, edge list, routes, directory headings, CTA chain, registration. Nothing else.
3. `main`'s own gates are the authority: `node --test tests/*.test.mjs`,
   `node scripts/quality-gate.mjs`, `node scripts/atlas/cohort-qa.mjs --cohort NNN --write --ci`
   (it rebuilds every page from the builder and writes the manifest),
   `npm run build`, then `node scripts/atlas/verify-live-atlas.mjs <main checkout> http://localhost:<port>`
   against a local `next start`.
4. Each page carries its **own** target query and an honest demand basis
   (`demand.basis: 'utility'` with `volume: null` if no per-page measurement exists). The
   monitor splits pages into `DEMAND_PROVEN` and `UTILITY_PROVEN`.
5. PR to `main` → verify every page on the Vercel preview (previews are `noindex` on purpose)
   → merge → `verify-live-atlas.mjs <main checkout> https://livdar.com` → record live with
   `fetch-live-evidence.mjs` + `cohort-publish.mjs --cohort NNN --live --evidence ...` →
   IndexNow for the new URLs only → dispatch `atlas-search-console` with `submit_sitemap`
   and `inspect_urls`.

## 12. What not to do

- Do not read a FINAL figure from any markdown file other than as history. Run the verifier.
- Do not relax a gate to reach a number. Every past rise that came from relaxing something
  was found and reversed (the transit family fell 510,592 → 125,652; 23,453 climate pages were
  removed).
- Do not treat `local_volume`, `market_demand_evidence` or `primary_keyword_if_known` as
  per-page demand: they describe the family × market keyword cell.
- Do not write `0` for an unknown volume.
- Do not re-add the climate city-name-swap rows.
- Do not merge the working branch into `main`.
- Do not deploy, publish, or dispatch production workflows unless the owner asks.
- Do not buy or call a paid SEO API.
