#!/usr/bin/env python3
"""Fetch UK entry-requirement policy per destination from the gov.uk content API.

Section 11 requires authoritative sources. This is the UK Foreign Office's own published
travel advice, served as JSON, under the Open Government Licence v3, and each record
carries the date the FCDO last reviewed it. The nationality is explicit in the text: the
advice is written for holders of a full British citizen passport.

What a cell carries: visa requirement, passport validity rule, the official authority to
check with, the source URL and the review date. What it does NOT carry: any legal
guarantee, and nothing undated.

Writes data/atlas/sources/visa/govuk-entry-requirements.jsonl.gz. Generates no pages.
"""
import gzip, html, json, os, re, sys, time, urllib.request

ROOT = '/home/user/Livdar-eSim/'
OUT = ROOT + 'data/atlas/sources/visa/govuk-entry-requirements.jsonl.gz'
API = 'https://www.gov.uk/api/content'
UA = 'LivdarAtlas/1.0 (offline research; contact via repo)'


def get(path, tries=3):
    for i in range(tries):
        try:
            req = urllib.request.Request(API + path, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r)
        except Exception as e:
            if i == tries - 1:
                raise
            time.sleep(3 * (i + 1))


def text(h):
    t = re.sub(r'(?s)<[^>]+>', ' ', h or '')
    return re.sub(r'\s+', ' ', html.unescape(t)).strip()


def classify(body):
    """Read the requirement off the FCDO's own wording. Conservative: anything the text
    does not say plainly comes back as unclear, never guessed."""
    b = body.lower()
    if re.search(r'you (?:must|will need to) (?:have|get|obtain|apply for) a visa', b):
        return 'visa_required'
    if re.search(r'you do not need a visa|visa[- ]free|without a visa', b):
        return 'visa_not_required_for_some_visits'
    if re.search(r'visa on arrival', b):
        return 'visa_on_arrival'
    if re.search(r'e-?visa|electronic (?:travel )?(?:visa|authorisation|authorization)', b):
        return 'evisa_or_electronic_authorisation'
    return 'stated_in_source_but_not_machine_classified'


def main():
    idx = get('/foreign-travel-advice')
    kids = idx['links']['children']
    print(f'destinations published by the FCDO: {len(kids):,}', file=sys.stderr)
    rows, miss = [], 0
    for i, k in enumerate(kids, 1):
        bp = k['base_path']
        try:
            d = get(bp)
        except Exception as e:
            print(f'  {bp}: FAILED {e}', file=sys.stderr)
            miss += 1
            continue
        det = d.get('details', {})
        part = next((p for p in (det.get('parts') or [])
                     if 'ntry requirement' in (p.get('title') or '')), None)
        if not part:
            miss += 1
            continue
        body = text(part.get('body'))
        if len(body) < 200:
            miss += 1
            continue
        rows.append({
            'nationality': 'GB',
            'nationality_basis': "holders of a full 'British citizen' passport, as the "
                                 'FCDO states at the top of every entry requirements page',
            'destination_name': (det.get('country') or {}).get('name') or k['title'].replace(
                ' travel advice', ''),
            'destination_slug': bp.rsplit('/', 1)[-1],
            'requirement_class': classify(body),
            'passport_validity_months': (lambda m: int(m.group(1)) if m else None)(
                re.search(r'at least (\d+) months?', body)),
            'blank_pages_required': (lambda m: int(m.group(1)) if m else None)(
                re.search(r'at least (\d+) blank pages?', body)),
            'policy_text': body[:4000],
            'official_source_url': 'https://www.gov.uk' + bp,
            'authority': 'UK Foreign, Commonwealth and Development Office',
            'reviewed_at': det.get('reviewed_at'),
            'updated_at': d.get('public_updated_at'),
            'licence': 'Open Government Licence v3.0',
            'disclaimer': 'policy information as published by the FCDO on the stated review '
                          'date; not legal advice and not a guarantee of entry',
        })
        if i % 25 == 0:
            print(f'  {i}/{len(kids)} fetched', file=sys.stderr)
        time.sleep(0.25)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with gzip.open(OUT, 'wt', encoding='utf-8') as fh:
        for r in rows:
            fh.write(json.dumps(r, ensure_ascii=False) + '\n')
    import collections
    cl = collections.Counter(r['requirement_class'] for r in rows)
    pv = collections.Counter(r['passport_validity_months'] for r in rows)
    summary = {
        'measured_at': time.strftime('%Y-%m-%d'),
        'authority': 'UK Foreign, Commonwealth and Development Office',
        'licence': 'Open Government Licence v3.0',
        'nationality': 'GB',
        'destinations_published': len(kids),
        'cells_captured': len(rows),
        'cells_missing_an_entry_requirements_section': miss,
        'requirement_class_distribution': dict(cl.most_common()),
        'passport_validity_months_distribution': {str(k): v for k, v in pv.most_common()},
        'freshness': 'each cell carries the FCDO reviewed_at and public_updated_at dates',
        'scope_note': 'ONE nationality. The full nationality axis needs one authoritative '
                      'source per nationality, which is the bound on this family, not the '
                      'destination count.',
    }
    with open(ROOT + 'data/atlas/measurements/visa-govuk-2026-10-07.json', 'w',
              encoding='utf-8') as fh:
        json.dump(summary, fh, ensure_ascii=False, indent=1)
    print(f'\nCELLS {len(rows):,} of {len(kids):,} destinations  (no section: {miss})')
    print('requirement classes:', dict(cl.most_common()))


if __name__ == '__main__':
    main()
