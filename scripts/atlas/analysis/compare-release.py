# Compare a post-release inspection with its baseline.
#   python3 -I compare-release.py <baseline.json> <now.json> <deploy-iso>
# Counts, per group: hubs Google visited after the deploy, pages visited for the first time
# (a lastCrawlTime now, none at baseline), pages that entered and left the index.
import json, sys, collections

def state(r):
    if r.get('verdict') == 'PASS': return 'INDEXED'
    if r.get('lastCrawlTime'): return 'CRAWLED_NOT_INDEXED'
    if r.get('sitemap') or r.get('referringUrls'): return 'DISCOVERED'
    return 'UNKNOWN'

base = {r['path']: r for r in json.load(open(sys.argv[1]))['rows'] if not r.get('error')}
now = {r['path']: r for r in json.load(open(sys.argv[2]))['rows'] if not r.get('error')}
deploy = sys.argv[3]
both = [p for p in now if p in base]
is_hub = lambda p: p.count('/') == 4 and p.split('/')[2] == 'atlas'
hubs = [p for p in both if is_hub(p)]
pages = [p for p in both if not is_hub(p)]
out = {
    'inspected': len(now), 'compared': len(both),
    'hubs': len(hubs),
    'hubs_visited_after_deploy': sorted(p for p in hubs if (now[p].get('lastCrawlTime') or '') > deploy),
    'hub_states': dict(collections.Counter(state(now[p]) for p in hubs)),
    'pages': len(pages),
    'first_visits': sorted(p for p in pages if now[p].get('lastCrawlTime') and not base[p].get('lastCrawlTime')),
    'recrawled_after_deploy': sum(1 for p in pages if base[p].get('lastCrawlTime') and (now[p].get('lastCrawlTime') or '') > max(deploy, base[p]['lastCrawlTime'])),
    'entered_index': sorted(p for p in pages if state(now[p]) == 'INDEXED' and state(base[p]) != 'INDEXED'),
    'left_index': sorted(p for p in pages if state(base[p]) == 'INDEXED' and state(now[p]) != 'INDEXED'),
    'states_now': dict(collections.Counter(state(now[p]) for p in pages)),
    'states_base': dict(collections.Counter(state(base[p]) for p in pages)),
}
for k in ['hubs_visited_after_deploy', 'first_visits', 'entered_index', 'left_index']:
    out[k + '_count'] = len(out[k])
print(json.dumps(out, indent=1, ensure_ascii=False))
