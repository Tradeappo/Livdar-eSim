#!/usr/bin/env python3
"""Classify every Mobility Database GTFS feed into ALLOW or HOLD on licence grounds.

The brief is explicit: "Do not ingest feeds without sufficient licence clarity." So this
does not guess. A feed is ALLOWED only when its stated licence URL matches a licence
family that is published, well known, and permits commercial reuse and derived works.
Everything else is HELD with the reason recorded, including feeds whose terms may well
be permissive but are bespoke pages this has not read.

Writes reports/.../TRANSPORT-SOURCE-REGISTER.csv and a JSON summary. Ingests nothing.
"""
import csv, collections, json, os, re, sys

ROOT = '/home/user/Livdar-eSim/'
T = ROOT + 'data/atlas/sources/transport/'
OUT = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/'

# Licence families that are published, stable, and permit commercial reuse and derivatives.
# Each entry is (regex, licence name, share-alike?, attribution?).
ALLOW = [
    (r'creativecommons\.org/publicdomain/zero', 'CC0 1.0', False, False),
    (r'creativecommons\.org/licenses/by/4\.0', 'CC BY 4.0', False, True),
    (r'creativecommons\.org/licenses/by/3\.0', 'CC BY 3.0', False, True),
    (r'creativecommons\.org/licenses/by-sa/4\.0', 'CC BY-SA 4.0', True, True),
    (r'creativecommons\.org/licenses/by-sa/3\.0', 'CC BY-SA 3.0', True, True),
    (r'opendatacommons\.org/licenses/odbl', 'ODbL 1.0', True, True),
    (r'opendatacommons\.org/licenses/by', 'ODC-BY 1.0', False, True),
    (r'opendatacommons\.org/licenses/pddl', 'ODC PDDL', False, False),
    (r'openstreetmap\.org/copyright', 'ODbL 1.0 (OSM)', True, True),
    (r'nationalarchives\.gov\.uk/doc/open-government-licence', 'UK OGL v3', False, True),
    (r'etalab\.gouv\.fr/licence-ouverte', 'Licence Ouverte 2.0 (Etalab)', False, True),
    (r'Licence-Ouverte-Open-Licence-ETALAB', 'Licence Ouverte (Etalab)', False, True),
    (r'opendefinition\.org/licenses/cc-by', 'CC BY (Open Definition)', False, True),
    (r'opendefinition\.org/licenses/odc-by', 'ODC-BY', False, True),
    # Read on 2026-10-07 because one page established clarity for many feeds at once.
    # Spain's national access point, 111 feeds: "Las presentes condiciones generales definidas
    # en esta licencia permiten la reutilizacion de los documentos sometidos a ellas para fines
    # COMERCIALES y no comerciales". Commercial reuse is granted in the licence text itself.
    (r'nap\.transportes\.gob\.es/licencia-datos', 'Licencia de datos abiertos MITRAMS (ES NAP)',
     False, True),
    # Trafiklab Sweden, 59 feeds: "Data from the GTFS Regional API is available under the
    # CC0 1.0 Universal (CC0 1.0) Public Domain Dedication license."
    (r'trafiklab\.se/api/gtfs-datasets', 'CC0 1.0 (Trafiklab)', False, False),
    # NVBW Baden-Wuerttemberg, 12 feeds: "Dieser Datensatz wird bereitgestellt unter der Lizenz
    # Datenlizenz Deutschland - Namensnennung - Version 2.0", a published German open data
    # licence permitting commercial use with attribution.
    (r'nvbw\.de/open-data', 'Datenlizenz Deutschland Namensnennung 2.0', False, True),
]
# Read and DELIBERATELY NOT allowed:
#   bctransit.com/open-data/terms-of-use, 33 feeds. "BC Transit grants you a limited, REVOCABLE
#   and non-exclusive license". A revocable grant is not a basis on which to build a durable
#   page inventory, so these stay held even though the present terms permit redistribution.
# Share-alike licences are allowed but flagged: a derived page must carry attribution and,
# for ODbL, the derived DATABASE obligations have to be honoured. Recorded, not waved through.

def classify(url):
    u = (url or '').strip()
    if not u:
        return ('HOLD', '', False, False, 'no licence stated at all')
    for rx, name, sa, attr in ALLOW:
        if re.search(rx, u, re.I):
            return ('ALLOW', name, sa, attr, '')
    host = u.split('//')[-1].split('/')[0].lower()
    return ('HOLD', '', False, False,
            f'bespoke or unread terms at {host}; not classified, so not ingested')


def main():
    rows = list(csv.DictReader(open(T + 'mdb-sources.csv', encoding='utf-8')))
    out, counts, held_host = [], collections.Counter(), collections.Counter()
    for r in rows:
        if r['data_type'] != 'gtfs':
            continue
        status = (r.get('status') or '').strip()
        if status in ('deprecated', 'inactive'):
            counts['skipped_deprecated_or_inactive'] += 1
            continue
        dd = (r.get('urls.direct_download') or '').strip()
        auth = (r.get('urls.authentication_type') or '').strip()
        verdict, name, sa, attr, why = classify(r.get('urls.license'))
        if not dd:
            verdict, why = 'HOLD', 'no direct download url'
        elif auth not in ('', '0'):
            verdict, why = 'HOLD', f'requires authentication (type {auth})'
        counts[verdict] += 1
        if verdict == 'HOLD':
            held_host[why[:60]] += 1
        out.append({
            'mdb_source_id': r['mdb_source_id'],
            'provider': r['provider'],
            'country': r['location.country_code'],
            'subdivision': r.get('location.subdivision_name') or '',
            'municipality': r.get('location.municipality') or '',
            'is_official': r.get('is_official') or '',
            'licence_url': (r.get('urls.license') or '').strip(),
            'licence_family': name,
            'share_alike': 'yes' if sa else ('no' if verdict == 'ALLOW' else ''),
            'attribution_required': 'yes' if attr else ('no' if verdict == 'ALLOW' else ''),
            'commercial_reuse': 'permitted' if verdict == 'ALLOW' else 'not established',
            'derived_pages': 'permitted' if verdict == 'ALLOW' else 'not established',
            'download_url': dd,
            'verdict': verdict,
            'hold_reason': why,
        })
    os.makedirs(OUT, exist_ok=True)
    p = OUT + 'TRANSPORT-SOURCE-REGISTER.csv'
    with open(p, 'w', newline='', encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=list(out[0].keys()))
        w.writeheader()
        for r in out:
            w.writerow(r)
    allow = [r for r in out if r['verdict'] == 'ALLOW']
    fam = collections.Counter(r['licence_family'] for r in allow)
    cc = collections.Counter(r['country'] for r in allow)
    summary = {
        'measured_at': '2026-10-07',
        'catalogue': 'Mobility Database sources.csv',
        'gtfs_feeds_considered': counts['ALLOW'] + counts['HOLD'],
        'skipped_deprecated_or_inactive': counts['skipped_deprecated_or_inactive'],
        'ALLOW': counts['ALLOW'],
        'HOLD': counts['HOLD'],
        'allow_by_licence_family': dict(fam.most_common()),
        'allow_by_country': dict(cc.most_common(40)),
        'hold_reasons': dict(held_host.most_common(20)),
        'rule': 'A feed is ALLOWED only when its stated licence URL matches a published, well '
                'known licence family permitting commercial reuse and derivative works. '
                'Bespoke or unread terms are HELD, not ingested, even where they may well be '
                'permissive. Share-alike families are allowed and flagged so the attribution '
                'and derived-database obligations travel with the data.',
    }
    with open(ROOT + 'data/atlas/measurements/transport-licence-register-2026-10-07.json',
              'w', encoding='utf-8') as fh:
        json.dump(summary, fh, ensure_ascii=False, indent=1)
    print(f'rows written: {len(out)}')
    print(f'ALLOW {counts["ALLOW"]}   HOLD {counts["HOLD"]}   '
          f'skipped {counts["skipped_deprecated_or_inactive"]}')
    print('\nALLOW by licence family:')
    for k, v in fam.most_common():
        print(f'  {v:>4}  {k}')
    print('\nALLOW by country:')
    for k, v in cc.most_common(18):
        print(f'  {v:>4}  {k}')
    print('\ntop HOLD reasons:')
    for k, v in held_host.most_common(8):
        print(f'  {v:>4}  {k}')
    print(f'\nwrote {p}')


if __name__ == '__main__':
    main()
