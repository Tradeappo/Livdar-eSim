#!/usr/bin/env python3
"""
Monthly climate normals for every city in the gazetteer, from NASA POWER.

Why this exists. The climate surface was built on 267 cities, because the only climate file on
disk was fetched by hand: the note in it says "fetched through a browser because the sandbox
has no network route to the host". That is no longer true, and it was worth re-testing rather
than inheriting. The POWER climatology endpoint answers for any coordinate on earth, returns
the provider's own 2001-2020 monthly normals, and is in the public domain.

What it gives per city: seven parameters for each of twelve months, so eighty four distinct
numbers. That is a real per-month fact set, not one annual figure restated twelve times, which
matters because a city-month page has to differ from the same city's other eleven months and
from every other city's January. Berlin in January is -0.73C and in July 20.47C.

    T2M, T2M_MAX, T2M_MIN   mean, mean daily high, mean daily low, in C
    PRECTOTCORR             precipitation, mm/day, corrected
    RH2M                    relative humidity at 2m, percent
    WS2M                    wind speed at 2m, m/s
    ALLSKY_SFC_SW_DWN       shortwave down at the surface, kWh/m2/day: the sunshine proxy

Resumable, because 31,715 requests do not fit in one sitting and a container can go away. The
ids already written are read back on start and skipped, so re-running costs only what is left.
Nothing here decides whether a page gets built: this materialises a source, and the demand and
usefulness gates downstream decide what it is worth.

Usage: nasa-power-materialise.py [--limit N] [--workers N] [--finalise]
"""
import collections, gzip, json, os, queue, random, sys, threading, time, urllib.request

ROOT = '/home/user/Livdar-eSim/'
OUT = ROOT + 'data/atlas/sources/climate/power/'
sys.path.insert(0, ROOT + 'scripts/atlas/scale')
import entity_identity                                            # noqa: E402

PARAMS = 'T2M,T2M_MAX,T2M_MIN,PRECTOTCORR,RH2M,WS2M,ALLSKY_SFC_SW_DWN'
URL = ('https://power.larc.nasa.gov/api/temporal/climatology/point'
       '?parameters=' + PARAMS + '&community=RE&format=JSON'
       '&latitude={lat:.4f}&longitude={lon:.4f}')
MONTHS = ('JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
          'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC')
# POWER asks callers not to hammer the point endpoint. One request per second per worker with
# six workers is well inside what it serves without complaint, and every 429 or 503 backs off.
PER_WORKER_DELAY = 1.0
MAX_ATTEMPTS = 5

limit = None
workers = 6
for i, a in enumerate(sys.argv[1:]):
    if a == '--limit':
        limit = int(sys.argv[i + 2])
    elif a == '--workers':
        workers = int(sys.argv[i + 2])

os.makedirs(OUT, exist_ok=True)

# ---- what is already on disk ------------------------------------------------
# Both forms are read: the run appends plain JSONL because a 31,715 request fetch has to be
# resumable and you cannot append to a gzip member safely, and --finalise then compresses the
# shards to match every other source in data/atlas/sources. A half-finalised directory is read
# correctly by this loop, which is the state a container going away in the middle would leave.
def _read_shards():
    for f in sorted(os.listdir(OUT)):
        if f.endswith('.jsonl'):
            yield open(OUT + f, encoding='utf-8')
        elif f.endswith('.jsonl.gz'):
            yield gzip.open(OUT + f, 'rt', encoding='utf-8')


done = set()
for fh in _read_shards():
    with fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                done.add(str(json.loads(line)['city_id']))
            except Exception:
                continue
print(f'cities already materialised: {len(done):,}', file=sys.stderr)

if '--finalise' in sys.argv:
    # gzip each plain shard into the form the rest of the pipeline reads, then drop the plain
    # one. Written through a .tmp and os.replace so an interrupted finalise cannot leave a
    # truncated .gz that every later reader would silently stop early on.
    n = 0
    for f in sorted(os.listdir(OUT)):
        if not f.endswith('.jsonl'):
            continue
        src, dst = OUT + f, OUT + f + '.gz'
        rows = [l for l in open(src, encoding='utf-8') if l.strip()]
        with gzip.open(dst + '.tmp', 'wt', encoding='utf-8') as g:
            g.writelines(rows)
        os.replace(dst + '.tmp', dst)
        os.remove(src)
        n += 1
        print(f'  {f} -> {f}.gz  ({len(rows):,} cities)', file=sys.stderr)
    print(f'finalised {n} shards holding {len(done):,} cities', file=sys.stderr)
    sys.exit(0)

GAZ = entity_identity.load_gazetteer()
coords = {}
import glob
for f in sorted(glob.glob(ROOT + 'data/atlas/entities/cities/*.json')):
    try:
        d = json.load(open(f, encoding='utf-8'))
    except Exception:
        continue
    lst = d if isinstance(d, list) else (d.get('cities') or list(d.values())[0])
    for c in lst:
        if c and c.get('id') and c.get('lat') is not None:
            coords[str(c['id'])] = (float(c['lat']), float(c['lon']))

# The eleven market countries first, largest city first within them, then the rest of the world
# on the same rule. 10,815 of the 31,715 cities sit in a market country, and those are the ones
# the generator can already build a page for today; the other 20,900 are destinations, which the
# brief treats as legitimate because the searcher's market is not the page's subject. Ordering
# rather than filtering, so the useful head lands in the first minutes and nothing is excluded
# by a decision this script has no business making.
MARKET_COUNTRIES = {'US', 'DE', 'FR', 'IT', 'ES', 'NL', 'PL', 'BR', 'GB', 'JP', 'TW'}
todo = [cid for cid in sorted(
            GAZ.by_id,
            key=lambda x: (GAZ.by_id[x]['country'] not in MARKET_COUNTRIES,
                           -(GAZ.by_id[x]['population'] or 0)))
        if cid not in done and cid in coords]
if limit:
    todo = todo[:limit]
print(f'cities to fetch: {len(todo):,} of {len(GAZ.by_id):,} in the gazetteer', file=sys.stderr)

q = queue.Queue()
for cid in todo:
    q.put(cid)

locks = collections.defaultdict(threading.Lock)
counts = collections.Counter()
cl = threading.Lock()
t0 = time.time()


def bump(k, n=1):
    with cl:
        counts[k] += n


def fetch(cid):
    lat, lon = coords[cid]
    url = URL.format(lat=lat, lon=lon)
    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            with urllib.request.urlopen(url, timeout=60) as r:
                payload = json.loads(r.read().decode('utf-8'))
            break
        except Exception as e:
            code = getattr(e, 'code', None)
            if attempt == MAX_ATTEMPTS:
                bump(f'failed_after_{MAX_ATTEMPTS}_attempts')
                bump(f'last_error_{code or type(e).__name__}')
                return None
            # a rate limit or a gateway wobble is worth waiting out; anything else probably is
            # not, but one retry costs a second and a lost city costs a page
            time.sleep(min(60, (2 ** attempt) + random.random() * 2))
    par = (payload.get('properties') or {}).get('parameter') or {}
    if 'T2M' not in par:
        bump('response_had_no_T2M')
        return None
    months = {}
    fill = (payload.get('header') or {}).get('fill_value')
    for m in MONTHS:
        row = {}
        for k, series in par.items():
            v = series.get(m)
            if v is None or (fill is not None and v == fill):
                continue
            row[k] = v
        if row:
            months[m] = row
    if len(months) < 12:
        bump('fewer_than_twelve_months')
        if not months:
            return None
    c = GAZ.by_id[cid]
    return {
        'city_id': cid, 'name': c['name'], 'country': c['country'],
        'admin1': c['admin1'], 'population': c['population'],
        'lat': lat, 'lon': lon,
        'elevation_m': (((payload.get('geometry') or {}).get('coordinates') or [None, None, None])[2]),
        'period': '2001-2020', 'source': 'nasa_power_climatology',
        'months': months,
        'annual': {k: series.get('ANN') for k, series in par.items() if series.get('ANN') is not None},
    }


def worker():
    while True:
        try:
            cid = q.get_nowait()
        except queue.Empty:
            return
        rec = fetch(cid)
        if rec:
            path = OUT + f"power-{rec['country'] or 'XX'}.jsonl"
            with locks[path]:
                with open(path, 'a', encoding='utf-8') as fh:
                    fh.write(json.dumps(rec, ensure_ascii=False) + '\n')
            bump('written')
        n = counts['written'] + counts['failed_after_5_attempts']
        if n and n % 250 == 0:
            el = time.time() - t0
            print(f'  {n:,} done in {el/60:.1f} min, {n/max(el,1):.1f}/s, '
                  f'{q.qsize():,} left', file=sys.stderr, flush=True)
        time.sleep(PER_WORKER_DELAY)


threads = [threading.Thread(target=worker, daemon=True) for _ in range(workers)]
for t in threads:
    t.start()
for t in threads:
    t.join()

print('\ncounts:', file=sys.stderr)
for k, v in counts.most_common():
    print(f'    {k:40} {v:>8,}', file=sys.stderr)

prov = {
    'source': 'NASA POWER climatology (point)',
    'endpoint': 'https://power.larc.nasa.gov/api/temporal/climatology/point',
    'parameters': PARAMS.split(','),
    'period': '2001-2020',
    'licence': 'NASA POWER data are freely available and in the public domain, '
               'attribution requested',
    'attribution': 'Data from NASA POWER (https://power.larc.nasa.gov)',
    'capturedOn': time.strftime('%Y-%m-%d'),
    'cities_written_this_run': counts['written'],
    'note': ('The earlier climate file on disk was captured by hand with a note saying the '
             'sandbox had no route to this host. It has one now, which is why this exists: '
             'the limit on the climate surface was never the data, it was the fetch.'),
}
with open(OUT + '_provenance.json', 'w', encoding='utf-8') as fh:
    json.dump(prov, fh, indent=1, ensure_ascii=False)
print('\nprovenance written to ' + OUT + '_provenance.json', file=sys.stderr)
