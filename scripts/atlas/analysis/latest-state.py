# Latest known URL Inspection state of every live Atlas URL, from all saved inspection files.
#   python3 -I latest-state.py <live-production.json> <scratch dir> [extra.json ...]
import json, sys, os, collections
def state(r):
    if r.get('verdict') == 'PASS': return 'INDEXED'
    if r.get('lastCrawlTime'): return 'CRAWLED_NOT_INDEXED'
    if r.get('sitemap') or r.get('referringUrls'): return 'DISCOVERED'
    return 'UNKNOWN'
live = json.load(open(sys.argv[1]))['rows']
coh = {r['path']: (r.get('cohort') or 'cohort-00x-old') for r in live}
S = sys.argv[2]
files = ['ui24.json','tracka25.json','tracka27.json','tracka28.json','tracka30.json','tgt1103.json','src1103.json','src1104.json',
         'c004s25.json','c004s26.json','c004s27.json','c004s28.json','c004s29.json','c004s30.json','c004s31.json','c004s1103.json',
         'hub-T0.json','c004s1105.json','hub1105.json','src1105.json'] + sys.argv[3:]
latest = {}
for f in files:
    p = f if os.path.isabs(f) else os.path.join(S, f)
    if not os.path.exists(p): continue
    for r in json.load(open(p)).get('rows', []):
        if r.get('error') or r['path'] not in coh: continue
        at = r.get('inspected_at') or ''
        if r['path'] not in latest or at >= latest[r['path']][0]:
            latest[r['path']] = (at, state(r), r.get('lastCrawlTime'))
groups = collections.OrderedDict()
for path, c in coh.items():
    c = {'cohort-003': 'Cohort 003', 'cohort-004': 'Cohort 004', 'country-hubs': 'Hub-uri'}.get(c, 'Cohort 001+002')
    g = groups.setdefault(c, collections.Counter())
    g['live'] += 1
    if path not in latest: g['fără date'] += 1; continue
    at, st, _ = latest[path]
    day = at[:10]
    g[st] += 1
    g['data ' + day] += 1
print(json.dumps(groups, indent=1, ensure_ascii=False))
