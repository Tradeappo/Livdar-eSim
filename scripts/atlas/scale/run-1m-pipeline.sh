#!/bin/bash
# Rebuild the candidate inventory end to end, from materialised sources to the QA report.
#
# Every stage is idempotent and reads only files on disk, so this can be re-run after any
# ingest finishes and the numbers move to match. Nothing here touches production, nothing
# publishes, and no stage calls a paid API: the Ahrefs and SERP measurements are already
# recorded in data/atlas/measurements/ and reports/.../08b-SERP-EVIDENCE-*.csv and are
# read, never re-bought.
#
#   ingest   scripts/atlas/ingest/osm-run-market.sh <country> <ISO>      one OSM market
#            scripts/atlas/ingest/osm-run-us.sh                          the four US regions
#            scripts/atlas/ingest/osm-overpass-market.py TW TW           a market with no extract
#            scripts/atlas/ingest/parallel-get.sh <url> <out> 8          a large file, fast
#            scripts/atlas/ingest/wikidata-materialise.py                24 classes x 11 countries
#            scripts/atlas/ingest/holidays-materialise.py                four holiday providers
#   normalise scripts/atlas/ingest/pulse-materialise.py                  one holiday vocabulary
#            scripts/atlas/ingest/osm-run-place-layers.sh                named places with polygons
#   generate this script
#
# The order of the generate stages is not arbitrary and is not alphabetical:
#   poi-parent-assign      must precede everything that asks what is inside a geography
#   place-poi-density      must precede poi-aggregations, whose place gate reads its output
#   outdoor-feature-*      before outdoor-aggregations, which lists what the features pass
#   region-aggregations    after parent-assign, and it also reads the cities and the climate
#   trail-candidates       after the parents exist, for the containment parent on each route
#   wikidata-candidates    after poi-aggregations, because its parents are the city lists that
#                          aggregation accepted
#   the manifest           last of the generate stages, and a failure here stops the run
#
# Usage: run-1m-pipeline.sh [--skip-places|--from-aggregations|--from-manifest]
#
# --from-aggregations keeps the POI aggregation and the density file already on disk and runs
# everything after them. Those two stages read five million POI and take about half an hour
# between them, and nothing in the outdoor, region, trail or Wikidata stages feeds back into
# them, so when a GEOGRAPHIC layer has landed but the POI corpus has not changed this skips
# the half hour and produces the same inputs. It refuses to run if either file is missing.
#
# WHAT NEITHER RESUME FLAG CAN KNOW is that the CODE behind the artifact it reuses has changed.
# Both say "the sources have not moved", and both are silent about the builder. On 2026-10-06
# poi-aggregations.py was changed so that a country with no home market can produce a row at
# all, which is the difference between 45 destination countries holding no POI page and holding
# some; resuming from the aggregation on disk would have reused the pre-fix file, reported the
# old numbers, and agreed with itself perfectly while describing code that no longer existed.
# That is the same failure the fatal-stage policy and verify-stage-output.sh were added for,
# arriving through the one door they do not watch.
#
# So the rule, which the flags cannot enforce and a reader has to: reuse an artifact only when
# neither its INPUTS nor the script that writes it has changed. Changed poi-aggregations.py,
# place-poi-density.py or poi-parent-assign.py means a full run. Changed a gate in the manifest,
# a report, or page_copy.py means --from-manifest is enough, because that flag re-runs all three.
#
# --from-manifest starts at the manifest and reuses the aggregation and Wikidata candidate
# files already on disk. Those two stages read 5 million POI and take about nine minutes,
# and they do not depend on any of the gate logic downstream of them, so when only a gate or
# a report has changed, re-running them produces byte-identical inputs at a nine-minute
# cost. The full run remains the default, because reusing an intermediate is only safe when
# the sources behind it have not moved.
set -u
cd /home/user/Livdar-eSim || exit 1
log() { echo "[$(date +%T)] == $*"; }

MODE="${1:-}"

if [ "$MODE" != "--from-manifest" ] && [ "$MODE" != "--from-aggregations" ]; then
if [ "$MODE" != "--skip-places" ]; then
  log "place layers (named neighbourhoods with polygons where OSM has them)"
  ./scripts/atlas/ingest/osm-run-place-layers.sh || echo "  place layers: partial"
fi

log "normalise holidays into one Pulse vocabulary"
python3 scripts/atlas/ingest/pulse-materialise.py > /tmp/pipe_pulse.log 2>&1 \
  && tail -3 /tmp/pipe_pulse.log || echo "  pulse: FAILED, see /tmp/pipe_pulse.log"

log "POI to containment parent, so every later stage can ask what is INSIDE a geography"
# FATAL. Every stage after this one asks what is inside a geography, so a stale or missing
# answer here silently corrupts all of them. On 2026-10-05 this stage was OOM-killed, the runner
# printed "see the log" and carried on, and the run reached the manifest with containment parents
# that predated three captured countries. See verify-stage-output.sh for the four checks and why
# each is needed.
touch /tmp/.assign_attempt_marker
python3 scripts/atlas/scale/poi-parent-assign.py > /tmp/pipe_assign.log 2>&1
AC=$?
tail -4 /tmp/pipe_assign.log
if ! ./scripts/atlas/scale/verify-stage-output.sh "poi-parent-assign" "$AC" \
     data/atlas/sources/osm-poi/_parent-assignment.jsonl.gz 100000 /tmp/.assign_attempt_marker; then
  echo "  STOPPING. Nothing downstream is regenerated, so every artifact on disk still describes"
  echo "  the previous run rather than a half-built one. The last 20 lines of its log:"
  tail -20 /tmp/pipe_assign.log
  exit 1
fi

log "exclusive POI density per place, which decides which unnamed places are real"
# Every named POI to EXACTLY ONE place. This has to run BEFORE poi-aggregations, because the
# place gate reads its output to recover places that carry no polygon, no population, no Wikidata
# item and no Wikipedia article but do hold twenty or more named POI nothing else can claim.
# FATAL: poi-aggregations reads this to decide which unnamed places are real, so an empty or
# stale density file silently changes which places exist.
touch /tmp/.density_attempt_marker
python3 scripts/atlas/scale/place-poi-density.py > /tmp/pipe_density.log 2>&1
DC=$?
grep -E "EXCLUSIVE|recoverable|written" /tmp/pipe_density.log
if ! ./scripts/atlas/scale/verify-stage-output.sh "place-poi-density" "$DC" \
     data/atlas/sources/places/poi-density.jsonl.gz 10000 /tmp/.density_attempt_marker; then
  echo "  STOPPING; nothing downstream is regenerated."; tail -20 /tmp/pipe_density.log; exit 1
fi

log "POI aggregations (city and area shapes, gated on measured demand)"
# FATAL: this is the single largest contributor to the manifest, 214,953 rows of the 302,063 in
# the 2026-10-02 build. A manifest built without it is not a smaller manifest, it is a different
# inventory.
touch /tmp/.agg_attempt_marker
python3 scripts/atlas/scale/poi-aggregations.py > /tmp/pipe_agg.log 2>&1
GC=$?
grep -E "^(POI read|aggregation candidates|  by shape)" /tmp/pipe_agg.log || tail -3 /tmp/pipe_agg.log
if ! ./scripts/atlas/scale/verify-stage-output.sh "poi-aggregations" "$GC" \
     data/atlas/sources/osm-poi/_aggregations.jsonl.gz 50000 /tmp/.agg_attempt_marker; then
  echo "  STOPPING; nothing downstream is regenerated."; tail -20 /tmp/pipe_agg.log; exit 1
fi

else
  if [ "$MODE" = "--from-aggregations" ]; then
    log "resuming after the POI aggregation; its output and the density file on disk are reused"
    for need in data/atlas/sources/osm-poi/_aggregations.jsonl.gz \
                data/atlas/sources/places/poi-density.jsonl.gz; do
      [ -f "$need" ] || { echo "  MISSING $need, cannot resume; run without --from-aggregations"; exit 1; }
      echo "  reusing $need  ($(stat -c '%y' "$need" | cut -d. -f1))"
    done
    log "POI to containment parent, refreshed because a new parent layer changes every answer"
    # FATAL here too, and for a sharper reason: --from-aggregations exists to be run after a new
    # geographic layer lands, so this is exactly the path where a stale parent assignment does
    # the most damage.
    touch /tmp/.assign_attempt_marker
    python3 scripts/atlas/scale/poi-parent-assign.py > /tmp/pipe_assign.log 2>&1
    AC=$?
    tail -4 /tmp/pipe_assign.log
    if ! ./scripts/atlas/scale/verify-stage-output.sh "poi-parent-assign" "$AC" \
         data/atlas/sources/osm-poi/_parent-assignment.jsonl.gz 100000 /tmp/.assign_attempt_marker; then
      echo "  STOPPING; nothing downstream is regenerated. The last 20 lines of its log:"
      tail -20 /tmp/pipe_assign.log
      exit 1
    fi
  fi
fi

if [ "$MODE" != "--from-manifest" ]; then
# Each minimum row count below is about a THIRD of what that store actually holds, measured on
# 2026-10-06: features 37,437, outdoor lists 1,227, regions 1,778, trails 18,952. The check is
# there to catch a stage that wrote nothing or wrote a stub, NOT to assert a count. A threshold
# above the real output turns a working stage into a hard stop, which the first version of this
# patch did by demanding 2,000 rows of outdoor lists from a file that legitimately holds 1,227.
# ---- the four ENTITY STORE builders are FATAL from 2026-10-06 ---------------------------------
# They were the last stages that could fail silently, and one of them did. On 2026-10-06
# outdoor-feature-candidates.py was OOM-killed, the runner printed "features: see the log",
# carried on, and the manifest read _feature-candidates.jsonl.gz from 2026-10-02: four days
# stale, predating the Turkey, Australia, Mexico, Swiss, Portuguese, Moroccan, Egyptian, Emirati,
# Cambodian, Malaysian, Irish and Philippine captures. Every run that day had used
# --from-manifest, which skips this stage, so nothing had rebuilt it and nothing had noticed.
#
# The distinction that matters: these four write ENTITY STORES the manifest reads, so a stale one
# silently changes which pages exist. The report stages further down are downstream of the
# manifest, and a failed report is visible as a missing report rather than as a wrong inventory.
log "outdoor feature candidates: peaks, lakes, beaches and the rest, with their own attributes"
touch /tmp/.pipe_feat_attempt_marker
python3 scripts/atlas/scale/outdoor-feature-candidates.py > /tmp/pipe_feat.log 2>&1
SC=$?
tail -6 /tmp/pipe_feat.log
if ! ./scripts/atlas/scale/verify-stage-output.sh "outdoor-feature-candidates" "$SC" \
     data/atlas/sources/osm-outdoor/_feature-candidates.jsonl.gz 10000 /tmp/.pipe_feat_attempt_marker; then
  echo "  STOPPING. features is an entity store the manifest reads, so a stale one silently"
  echo "  changes which pages exist. Nothing downstream is regenerated."
  tail -20 /tmp/pipe_feat.log
  exit 1
fi

log "outdoor region lists: one feature class inside one named geography, containment only"
touch /tmp/.pipe_outagg_attempt_marker
python3 scripts/atlas/scale/outdoor-aggregations.py > /tmp/pipe_outagg.log 2>&1
SC=$?
tail -6 /tmp/pipe_outagg.log
if ! ./scripts/atlas/scale/verify-stage-output.sh "outdoor-aggregations" "$SC" \
     data/atlas/sources/osm-parents/_outdoor-aggregations.jsonl.gz 400 /tmp/.pipe_outagg_attempt_marker; then
  echo "  STOPPING. outdoor lists is an entity store the manifest reads, so a stale one silently"
  echo "  changes which pages exist. Nothing downstream is regenerated."
  tail -20 /tmp/pipe_outagg.log
  exit 1
fi

log "region families: what to see, the towns, and when to go"
touch /tmp/.pipe_region_attempt_marker
python3 scripts/atlas/scale/region-aggregations.py > /tmp/pipe_region.log 2>&1
SC=$?
tail -6 /tmp/pipe_region.log
if ! ./scripts/atlas/scale/verify-stage-output.sh "region-aggregations" "$SC" \
     data/atlas/sources/osm-parents/_region-aggregations.jsonl.gz 500 /tmp/.pipe_region_attempt_marker; then
  echo "  STOPPING. regions is an entity store the manifest reads, so a stale one silently"
  echo "  changes which pages exist. Nothing downstream is regenerated."
  tail -20 /tmp/pipe_region.log
  exit 1
fi

log "trail candidates, measured from route member geometry"
touch /tmp/.pipe_trail_attempt_marker
python3 scripts/atlas/scale/trail-candidates.py > /tmp/pipe_trail.log 2>&1
SC=$?
tail -6 /tmp/pipe_trail.log
if ! ./scripts/atlas/scale/verify-stage-output.sh "trail-candidates" "$SC" \
     data/atlas/sources/osm-trails/_trail-candidates.jsonl.gz 5000 /tmp/.pipe_trail_attempt_marker; then
  echo "  STOPPING. trails is an entity store the manifest reads, so a stale one silently"
  echo "  changes which pages exist. Nothing downstream is regenerated."
  tail -20 /tmp/pipe_trail.log
  exit 1
fi

log "Wikidata candidates, deduped against the OSM corpus"
python3 scripts/atlas/scale/wikidata-candidates.py > /tmp/pipe_wd.log 2>&1
grep -E "^(Wikidata candidates|  by shape)" /tmp/pipe_wd.log || tail -3 /tmp/pipe_wd.log

elif [ "$MODE" = "--from-manifest" ]; then
  log "resuming at the manifest; the aggregation file on disk is reused"
  need=data/atlas/sources/osm-poi/_aggregations.jsonl.gz
  [ -f "$need" ] || { echo "  MISSING $need, cannot resume; run without --from-manifest"; exit 1; }
  echo "  reusing $need  ($(stat -c '%y' "$need" | cut -d. -f1))"
  # The Wikidata candidates are REBUILT even on a resume, because they are not independent of
  # the aggregation: each notable entity resolves its parent against the city list pages the
  # aggregation accepted, so reusing a candidate file built against an older aggregation points
  # those parents at pages that no longer exist. That is exactly what happened: orphans rose
  # from 59 to 142, almost all of them museum and theatre pages whose parent city list had
  # stopped being accepted when the city identity fix changed which cities exist. Rebuilding
  # costs a couple of minutes against the aggregation's nine, so the resume still pays.
  log "Wikidata candidates rebuilt against the current aggregation (they depend on it)"
  python3 scripts/atlas/scale/wikidata-candidates.py > /tmp/pipe_wd.log 2>&1
  grep -E "^(Wikidata candidates|  by shape|Wikidata files read)" /tmp/pipe_wd.log || tail -3 /tmp/pipe_wd.log
fi

log "candidate manifest, with every quality gate"
# This stage is the one every later stage reads. When it failed once, the pipeline carried
# on and produced a QA report, partitions and a deliverable describing the PREVIOUS
# manifest, which is worse than producing nothing: every artifact agreed with every other
# and all of them described data that no longer existed. So a failure here stops the run.
if ! python3 scripts/atlas/scale/build-1m-candidate-manifest.py > /tmp/pipe_manifest.log 2>&1; then
  echo "  MANIFEST FAILED, stopping. Nothing downstream is regenerated, so the artifacts on"
  echo "  disk still describe the previous run rather than a half-built one. Error:"
  tail -12 /tmp/pipe_manifest.log
  exit 1
fi
grep -E "path segments claimed|uniqueness and SERP gate|after exact|after semantic|FINAL_DISTINCT" /tmp/pipe_manifest.log \
  || tail -5 /tmp/pipe_manifest.log

log "shard the two authoritative CSV records into parts a git remote will accept"
# Immediately after the manifest, and before anything else reads it, so the parts can never
# describe a different run from the monolith they were split out of. The manifest crossed
# 97 MiB at 963,470 rows against a 100 MiB hard blob limit; see shard-manifest-for-git.py.
python3 scripts/atlas/scale/shard-manifest-for-git.py 2>&1 | tail -10

log "QA: titles, duplicates, uniqueness reasons, orphans, dashes"
python3 scripts/atlas/scale/qa-1m-manifest.py > /tmp/pipe_qa.log 2>&1
tail -22 /tmp/pipe_qa.log

log "partitioned export by market and by family"
python3 scripts/atlas/scale/export-partitions.py > /tmp/pipe_part.log 2>&1 \
  && tail -3 /tmp/pipe_part.log || echo "  partitions: see /tmp/pipe_part.log"

log "family by locale matrix and template similarity"
python3 scripts/atlas/scale/build-family-locale-matrix.py > /tmp/pipe_matrix.log 2>&1 \
  && tail -8 /tmp/pipe_matrix.log || echo "  matrix: see /tmp/pipe_matrix.log"

log "gap analysis against the one million target"
python3 scripts/atlas/scale/build-1m-gap-analysis.py > /tmp/pipe_gap.log 2>&1 \
  && tail -6 /tmp/pipe_gap.log || echo "  gap analysis: see /tmp/pipe_gap.log"

log "market-scoped URL experiment, OFFLINE: en-AU and es-MX against their language siblings"
# Reads the contests the manifest recorded and decides, per candidate, whether a market-scoped
# page would be a page a reader needs. It writes two files into reports/ and changes no route,
# sitemap, redirect or template. In the pipeline so the artifact cannot go stale against the
# manifest it describes.
python3 scripts/atlas/scale/market-url-experiment.py > /tmp/pipe_mexp.log 2>&1 \
  && grep -E "net_new_valid_pages_total|raw_candidates|justified_separate" /tmp/pipe_mexp.log \
  || echo "  market-url experiment: see /tmp/pipe_mexp.log"

log "hreflang and canonical design, OFFLINE: generated, checked for reciprocity, not deployed"
python3 scripts/atlas/scale/hreflang-canonical-design.py > /tmp/pipe_hreflang.log 2>&1 \
  && grep -E "verdict|pages_in_the_plan|market_pages_justified" /tmp/pipe_hreflang.log \
  || echo "  hreflang design: see /tmp/pipe_hreflang.log"

log "the market-URL report, generated from those two artifacts"
python3 scripts/atlas/scale/market-url-report.py 2>&1 | tail -2

log "market-scoped URL experiment, OFFLINE: en-AU and es-MX against their language siblings"
# Reads the contests the manifest recorded and decides, per candidate, whether a market-scoped
# page would be a page a reader needs. It writes two files into reports/ and changes no route,
# sitemap, redirect or template. In the pipeline so the artifact cannot go stale against the
# manifest it describes.
python3 scripts/atlas/scale/market-url-experiment.py > /tmp/pipe_mexp.log 2>&1 \
  && grep -E "net_new_valid_pages_total|raw_candidates|justified_separate" /tmp/pipe_mexp.log \
  || echo "  market-url experiment: see /tmp/pipe_mexp.log"

log "hreflang and canonical design, OFFLINE: generated, checked for reciprocity, not deployed"
python3 scripts/atlas/scale/hreflang-canonical-design.py > /tmp/pipe_hreflang.log 2>&1 \
  && grep -E "verdict|pages_in_the_plan|market_pages_justified" /tmp/pipe_hreflang.log \
  || echo "  hreflang design: see /tmp/pipe_hreflang.log"

log "the market-URL report, generated from those two artifacts"
python3 scripts/atlas/scale/market-url-report.py 2>&1 | tail -2

log "long dash check across the repository"
npm run -s dashcheck 2>&1 | tail -5 || echo "  dashcheck reported findings"

log "do the artifacts agree with each other"
python3 scripts/atlas/scale/verify-artifacts-agree.py 2>&1 | tail -14 \
  || echo "  ARTIFACTS DISAGREE: see the lines above; the report below is not trustworthy"

log "family acceptance test: ten conditions and the content contract, per family"
python3 scripts/atlas/scale/family-acceptance-test.py > /tmp/pipe_accept.log 2>&1 \
  && tail -12 /tmp/pipe_accept.log || echo "  acceptance: see /tmp/pipe_accept.log"

log "final deliverable report"
python3 scripts/atlas/scale/build-final-deliverable.py 2>&1 | tail -3

log "the report in the shape the brief asks for, generated from the artifacts"
python3 scripts/atlas/scale/final-brief-report.py 2>&1 | tail -4

log "pipeline complete"
