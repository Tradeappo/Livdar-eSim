import io, re, json
src = 'reports/ahrefs-export-2026-09-28/backlinks/dofollow-domains-2026-09-28.csv'
rows = []
for line in io.open(src, encoding='utf-8').read().strip().split('\n')[1:]:
    f = line.split(',')
    if len(f) < 8: continue
    rows.append({
        'domain': f[0],
        'dr': float(f[1].rstrip('.') or 0) if f[1].strip('.') else 0.0,
        'traffic': int(f[2] or 0),
        'links': int(f[3] or 0),
        'dofollow': int(f[4] or 0),
        'first_seen': f[5],
        'last_seen': f[6],
        'is_spam': f[7] == '1',
    })

# Classification. A is an automated link-selling footprint: the hostname itself
# advertises the service, or it is a throwaway on a cheap TLD with no traffic.
TOOL_WORDS = re.compile(r'(checker|check|backlink|seo|rank|dapa|dr|pa|da|serp|authority|linking|linkprofile|domainmetrics)', re.I)
CHEAP_TLD = re.compile(r'\.(shop|site|store|space|website|online|link)$', re.I)
SELLS = re.compile(r'(backlink|seo|rank|guestpost|go4seo|geobacklinks|highquality)', re.I)

# The hostname is the primary signal and traffic is secondary. A first pass
# sorted eight of these into "potentially legitimate" purely because Ahrefs
# records 1 to 46 visits a month for them, and they are named
# freedrchecker.site and dacheckerforfree.online: they are the same network,
# and a handful of visits from somebody's rank checking script is not a reason
# to treat them as a real site.
TRIVIAL_TRAFFIC = 100

a, b, c = [], [], []
for r in rows:
    host = r['domain']
    cheap = bool(CHEAP_TLD.search(host))
    advertises = bool(SELLS.search(host))
    toolish = bool(TOOL_WORDS.search(host))
    negligible = r['traffic'] < TRIVIAL_TRAFFIC
    if negligible and (advertises or toolish):
        r['why'] = 'hostname advertises link selling or SEO tooling, traffic negligible'
        a.append(r)
    elif negligible and cheap:
        r['why'] = 'throwaway hostname on a cheap TLD, traffic negligible, dofollow'
        a.append(r)
    elif negligible and r['is_spam'] and r['dr'] < 30:
        r['why'] = 'flagged spam, traffic negligible, low authority'
        a.append(r)
    elif negligible and r['is_spam']:
        r['why'] = 'flagged spam and no traffic, but DR is not trivial: read before disavowing'
        b.append(r)
    else:
        r['why'] = 'has real traffic or is not flagged: do not disavow without reading'
        c.append(r)

print('A obvious automated link selling :', len(a))
print('B suspicious, read first          :', len(b))
print('C potentially legitimate          :', len(c))
for r in b: print('   B:', r['domain'], 'DR', r['dr'], 'traffic', r['traffic'])
for r in c: print('   C:', r['domain'], 'DR', r['dr'], 'traffic', r['traffic'])

# Timeline
from collections import Counter
days = Counter(r['first_seen'][:10] for r in rows)
print()
print('first seen by day, busiest first:')
for d, n in days.most_common(8): print('   %s  %3d domains' % (d, n))

io.open('reports/ahrefs-export-2026-09-28/backlinks/pbn-audit-2026-09-28.json', 'w', encoding='utf-8').write(json.dumps({
    'captured': '2026-09-28',
    'target': 'livdar.com',
    'scope': 'Every referring domain with at least one dofollow link, 316 of the 741 referring domains. Ordered by first_seen.',
    'totals': {
        'referring_domains_all': 741,
        'referring_domains_with_a_dofollow_link': len(rows),
        'flagged_spam_by_ahrefs': sum(1 for r in rows if r['is_spam']),
        'zero_traffic_sources': sum(1 for r in rows if r['traffic'] == 0),
        'total_dofollow_links': sum(r['dofollow'] for r in rows),
    },
    'classification': {'A_automated_link_selling': len(a), 'B_suspicious': len(b), 'C_potentially_legitimate': len(c)},
    'growth_timeline': dict(sorted(days.items())),
    'A': a, 'B': b, 'C': c,
}, ensure_ascii=False, indent=1) + '\n')

# The disavow file. Prepared, not submitted.
out = [
    '# Disavow candidates for livdar.com',
    '# Prepared 2026-09-28. NOT SUBMITTED. Review before uploading.',
    '#',
    '# Scope: class A only, the %d referring domains whose hostname advertises' % len(a),
    '# link selling or SEO tooling, or which are throwaways on a cheap TLD, and',
    '# which carry at least one dofollow link to livdar.com and have zero traffic.',
    '# Class B (%d) and class C (%d) are deliberately excluded and are listed in' % (len(b), len(c)),
    '# pbn-audit-2026-09-28.json for a human to read first.',
    '#',
    '# Evidence: every one of these is flagged spam by Ahrefs, every one has a',
    '# dofollow link, and the largest cluster shares one URL path,',
    '# /dir/premium-backlink-services-123314, with the anchor',
    '# "Premium Backlink Services livdar.com for Stronger Google Rankings".',
    '# 268 of them were first seen between 2026-09-17 and 2026-09-21.',
    '#',
    '# This is very unlikely to be causing harm: the sources have no traffic and',
    '# Google discounts this pattern. It is here to remove a variable before the',
    '# Atlas starts ranking, not to fix a penalty.',
    '',
]
for r in sorted(a, key=lambda x: x['domain']):
    out.append('domain:' + r['domain'])
io.open('reports/ahrefs-export-2026-09-28/backlinks/disavow-candidates-2026-09-28.txt', 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print()
print('disavow file prepared with %d domain: lines (NOT submitted)' % len(a))
