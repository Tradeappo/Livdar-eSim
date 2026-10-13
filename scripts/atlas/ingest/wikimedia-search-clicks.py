#!/usr/bin/env python3
"""Search-referred readership per Wikipedia article, per language. Free, official, measured.

WHY THIS AND NOT PAGEVIEWS. Wikimedia publishes two things about an article. Pageviews count
everyone who opened it, including people who arrived from another article, from a social post
or from a bookmark. The CLICKSTREAM goes further and names the referrer class, and one of its
classes is `other-search`: a reader who arrived from a search engine. That is not a proxy for
search demand and not an estimate of it. It is a count of people who searched, saw a result
and clicked it, for this place, in this language, last month.

WHAT IT REPLACES. Two gates in the manifest ask the same question of a city and answer it from
a paid keyword corpus that cannot be bought again:

  the per-market tier cap    is this city looked for at all in this market
  dest_evidence()            does this language community seek THIS destination

Both are questions about a place and a language, which is exactly what this file measures. It
is read for nothing else. In particular it can never establish that a FAMILY intent exists in
a market - that a German speaker read about Cluj-Napoca says nothing about whether anyone wants
a cost-of-living page - so it only ever admits a city into a family x market cell whose intent
the keyword corpus already proved. That distinction is the line between evidence and excuse.

THE SOURCE'S OWN FLOOR. The clickstream omits any (referrer, article) pair with fewer than 10
clicks in the month, for reader privacy. An article absent from the file is therefore not
unmeasured; it is measured as under ten search clicks, which is an answer. Treating absence as
a gap rather than as a low reading is the one misreading that would turn this file into a way
of admitting everything.

THE STATISTIC is the MEDIAN of the monthly counts across the captured months, not the sum and
not the peak: a place that trended once is not a place with standing demand, and a median says
so where a total would not. A month in which the article is absent counts as zero in that
median for the same reason.

Each dump is streamed through gzip and aggregated as it arrives; nothing is kept on disk but
the per-article totals, because enwiki alone is 456 MiB a month and the container has four
gigabytes.

Usage: wikimedia-search-clicks.py [--months 2026-09,2026-08,2026-07] [--langs en,de,...]
"""
import collections, glob, gzip, json, os, shutil, subprocess, sys, tempfile, time

ROOT = '/home/user/Livdar-eSim/'
OUTDIR = ROOT + 'data/atlas/sources/wikimedia/'
LANGS = ['de', 'en', 'es', 'fr', 'it', 'ja', 'nl', 'pl', 'pt', 'tr', 'zh']
MONTHS = ['2026-09', '2026-08', '2026-07']
UA = ('LivdarInventory/1.0 (https://livdar.com; offline page-inventory research; '
      'contact via repository)')
BASE = 'https://dumps.wikimedia.org/other/clickstream/'

# awk rather than Python for the aggregation: enwiki is about 30 million lines a month and the
# work per line is one comparison and one addition, which awk does at C speed and with a
# smaller per-key overhead than a Python dict of several million strings.
AWK = r'''BEGIN{FS="\t"} $1=="other-search"{s[$2]+=$4} END{for(a in s) printf "%s\t%d\n", a, s[a]}'''


def fetch_month(lang, month, dest, tries=4):
    """Stream one dump through gzip and awk into a sorted per-article total file.

    A transfer that dies mid-stream is this script failing, not the dump being short, and the
    two must not be conflated: a truncated gzip would silently produce a partial table that
    still looks like a complete answer. So the pipeline's exit status is checked for every
    stage, and a failed attempt discards its output entirely before retrying.
    """
    url = '%s%s/clickstream-%swiki-%s.tsv.gz' % (BASE, month, lang, month)
    for i in range(tries):
        tmp = dest + '.part'
        cmd = ('set -o pipefail; curl -sS --max-time 1800 -A %s %s | gzip -dc | '
               'awk %s | LC_ALL=C sort -t"\t" -k1,1 > %s'
               % (_q(UA), _q(url), _q(AWK), _q(tmp)))
        r = subprocess.run(['bash', '-c', cmd], capture_output=True, text=True)
        if r.returncode == 0 and os.path.getsize(tmp) > 0:
            os.replace(tmp, dest)
            return True
        if os.path.exists(tmp):
            os.remove(tmp)
        # 404 means this language has no dump for this month, which is a fact about the dump
        # and not a failure to retry
        if 'curl: (22)' in (r.stderr or '') or '404' in (r.stderr or ''):
            return False
        print('    %s %s attempt %d failed: %s' % (lang, month, i + 1,
                                                   (r.stderr or '').strip()[:160]), flush=True)
        time.sleep(5 * (i + 1))
    return False


def _q(s):
    return "'" + str(s).replace("'", "'\\''") + "'"


def merge_median(files, n_months, out_path):
    """Median monthly total per article across the captured months.

    The files are sorted by article, so this is a streaming k-way merge and never holds more
    than one article's readings in memory. An article missing from a month contributes a zero
    to that month, which is what the source's own ten-click floor means.
    """
    import heapq
    handles = [open(f, encoding='utf-8') for f in files]
    streams = []
    for h in handles:
        def gen(h=h):
            for line in h:
                a, _, v = line.rstrip('\n').partition('\t')
                yield a, int(v)
        streams.append(gen())
    rows = 0
    with gzip.open(out_path, 'wt', encoding='utf-8') as fh:
        fh.write('article\tmedian_monthly_search_clicks\tmonths_present\n')
        cur, vals = None, []
        for article, v in heapq.merge(*streams, key=lambda t: t[0]):
            if article != cur:
                if cur is not None:
                    rows += _emit(fh, cur, vals, n_months)
                cur, vals = article, []
            vals.append(v)
        if cur is not None:
            rows += _emit(fh, cur, vals, n_months)
    for h in handles:
        h.close()
    return rows


def _emit(fh, article, vals, n_months):
    present = len(vals)
    full = sorted(vals + [0] * max(0, n_months - present))
    med = full[len(full) // 2]
    if med <= 0:
        # an article present in fewer than half the months has a median of zero, and a zero
        # carries no information the absence of the row does not already carry
        return 0
    fh.write('%s\t%d\t%d\n' % (article, med, present))
    return 1


def main():
    months, langs = MONTHS, LANGS
    for i, a in enumerate(sys.argv):
        if a == '--months': months = sys.argv[i + 1].split(',')
        if a == '--langs': langs = sys.argv[i + 1].split(',')
    os.makedirs(OUTDIR, exist_ok=True)
    work = tempfile.mkdtemp(prefix='livdar-cs-')
    summary = {}
    try:
        for lang in langs:
            parts, got = [], []
            for m in months:
                p = os.path.join(work, '%s-%s.tsv' % (lang, m))
                print('  %s %s ...' % (lang, m), flush=True)
                if fetch_month(lang, m, p):
                    parts.append(p); got.append(m)
                else:
                    print('    %s %s unavailable' % (lang, m), flush=True)
            if not parts:
                print('  %s: NO MONTHS CAPTURED' % lang, flush=True)
                summary[lang] = {'months': [], 'articles': 0}
                continue
            out = OUTDIR + 'search-clicks.%s.tsv.gz' % lang
            n = merge_median(parts, len(got), out)
            summary[lang] = {'months': got, 'articles': n}
            print('  %s: %d articles with a positive median over %d months'
                  % (lang, n, len(got)), flush=True)
            for p in parts:
                os.remove(p)
    finally:
        shutil.rmtree(work, ignore_errors=True)

    prov = {
        'source': 'Wikimedia clickstream, referrer class other-search',
        'url': BASE,
        'licence': 'CC0 1.0, public domain dedication',
        'attribution': 'Wikimedia Foundation, https://wikimedia.org/',
        'fetched_on': time.strftime('%Y-%m-%d'),
        'months_requested': months,
        'per_language': summary,
        'statistic': 'median of the monthly search-referred click totals; a month in which the '
                     'article is absent counts as zero',
        'source_floor': 'the dump omits any (referrer, article) pair under 10 clicks in the '
                        'month, for reader privacy. An absent article is MEASURED as under '
                        'ten, not unmeasured.',
        'why': 'A count of people who searched, saw a result and clicked it, for this place, '
               'in this language. Read only to answer whether a CITY is sought in a language; '
               'never to establish that a FAMILY intent exists in a market.',
        'known_limit': 'zhwiki is one Wikipedia for Traditional and Simplified Chinese and '
                       'cannot be split, so a zh reading is evidence for zh-Hant only together '
                       'with the Taiwanese market demand measured separately.',
    }
    json.dump(prov, open(OUTDIR + 'search-clicks.provenance.json', 'w', encoding='utf-8'),
              indent=1, ensure_ascii=False)
    print('wrote', OUTDIR + 'search-clicks.<lang>.tsv.gz')
    return 0 if all(v['articles'] for v in summary.values()) else 1


if __name__ == '__main__':
    sys.exit(main())
