#!/bin/bash
# Commit newly materialised Wikidata files as the workers produce them.
#
# The partitioned workers write one file per class and country, 264 pairs in all, arriving
# over hours. Anything left only in this container dies with it, and hand-committing every
# batch is both tedious and easy to forget, so this commits on a timer.
#
# Deliberately narrow and safe:
#   - adds ONE path, data/atlas/sources/wikidata, so it can never pick up an unrelated
#     edit in progress elsewhere in the tree
#   - skips a cycle if git is already holding the index lock, rather than fighting another
#     commit for it
#   - commits only when that path actually changed, so it creates no empty commits
#   - exits on its own after the deadline, so it cannot outlive the work it serves
set -u
cd /home/user/Livdar-eSim || exit 1
BRANCH=claude/seo-handoff-partial-data-7rs7zi
DEADLINE=$(( $(date +%s) + 14400 ))
while [ "$(date +%s)" -lt "$DEADLINE" ]; do
  sleep 420
  [ -f .git/index.lock ] && continue
  git add data/atlas/sources/wikidata 2>/dev/null || continue
  if git diff --cached --quiet -- data/atlas/sources/wikidata; then continue; fi
  n=$(git diff --cached --name-only -- data/atlas/sources/wikidata | wc -l)
  classes=$(git diff --cached --name-only -- data/atlas/sources/wikidata \
            | sed 's#.*/wd-##;s#-[A-Z][A-Z]*\.jsonl\.gz##' | sort -u | tr '\n' ' ')
  git commit -q -m "Materialise $n more Wikidata files: $classes

Written by the partitioned workers in scripts/atlas/ingest/wikidata-materialise.py, one
file per class and country, committed on a timer by autocommit-wikidata.sh so the corpus
does not live only in a container that will be reclaimed.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Qw7uomTd4wHyxgLydx6Cg9" \
    && git push -q -u origin "$BRANCH" 2>/dev/null \
    && echo "[$(date +%T)] committed and pushed $n files: $classes"
done
echo "[$(date +%T)] autocommit deadline reached"
