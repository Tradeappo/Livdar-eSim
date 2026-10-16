#!/usr/bin/env python3
"""Group cities by the NASA POWER grid cell whose numbers they actually carry.

THE DEFECT THIS EXISTS TO MAKE VISIBLE. NASA POWER climatology is a GRIDDED product: the
point endpoint answers for the grid cell containing the coordinate, and that cell is about
half a degree, roughly 55km across at mid latitudes. So every city inside one cell gets
byte-identical normals. Measured over the 64,418 cities captured: only 21,260 DISTINCT
twelve-month vectors exist, and 53,277 cities share theirs with at least one other city.
Paris carries the same numbers as 173 other communes; Shenzhen as 219 other places.

What that did to the inventory, measured on the 2026-10-16 manifest: of the 50,118
weather.city-month rows, 30,847 share their whole twelve-month table with another city in
the SAME language, across 8,270 groups. In 6,260 of those groups the locale_facts are
byte-identical too, so the pages differ in the city name and in nothing else. Every one of
them was labelled duplicate_risk LOW, because the manifest's data_signature includes the
city's identity, so a signature comparison could never see it.

A reader who opens two of those pages gets the same answer twice. That is the city-name swap
this project refuses, and it was already shipped.

WHAT THIS FILE PROVIDES, and what it deliberately does not decide. It writes the grouping:
which cities carry the same numbers, and which of them is the PRINCIPAL city of that cell.
The principal is the most populous, with the lowest GeoNames id breaking a tie, because
population is in the capture, is not a judgement, and gives the right answer in every case
checked: Paris over Alfortville, Shenzhen over Longgang, Boston over Acton. The manifest
applies the rule; this file only makes the fact available and auditable.

NOTHING IS INFERRED. The grouping key is a hash of the twelve-month vector exactly as NASA
POWER returned it, so two cities are grouped when their DATA is identical rather than when
their coordinates look close.

Usage: build-climate-grid-cells.py
Reads  data/atlas/sources/climate/power/power-*.jsonl
Writes data/atlas/sources/climate/city-grid-cells.json
"""
import collections, glob, hashlib, json, os, sys, time

ROOT = '/home/user/Livdar-eSim/'
SRC = ROOT + 'data/atlas/sources/climate/power/'
OUT = ROOT + 'data/atlas/sources/climate/city-grid-cells.json'


def main():
    cells = collections.defaultdict(list)
    n = 0
    for f in sorted(glob.glob(SRC + 'power-*.jsonl')):
        for line in open(f, encoding='utf-8'):
            line = line.strip()
            if not line:
                continue
            try:
                d = json.loads(line)
            except ValueError:
                continue
            months = d.get('months') or {}
            if not months:
                continue
            n += 1
            key = hashlib.md5(
                json.dumps(months, sort_keys=True).encode('utf-8')).hexdigest()[:16]
            cells[key].append({
                'city_id': str(d['city_id']),
                'name': d.get('name'),
                'country': d.get('country'),
                'population': d.get('population') or 0,
            })

    city_cell, principal, members = {}, {}, {}
    shared = 0
    for key, lst in cells.items():
        # most populous wins, lowest GeoNames id breaks a tie: both are in the capture and
        # neither is a judgement this file is making
        lst.sort(key=lambda c: (-c['population'], int(c['city_id'])))
        principal[key] = lst[0]['city_id']
        members[key] = [c['city_id'] for c in lst]
        if len(lst) > 1:
            shared += len(lst)
        for c in lst:
            city_cell[c['city_id']] = key

    out = {
        'what': 'cities grouped by the NASA POWER grid cell whose twelve-month normals they '
                'carry, keyed on a hash of the vector itself rather than on coordinates',
        'why': 'NASA POWER climatology is gridded at about half a degree, so every city in a '
               'cell carries byte-identical normals and a per-city climate page repeats the '
               'same answer under a different name',
        'source': 'data/atlas/sources/climate/power/power-<CC>.jsonl',
        'licence': 'NASA POWER data are in the public domain, attribution requested',
        'attribution': 'Data from NASA POWER (https://power.larc.nasa.gov)',
        'built_on': time.strftime('%Y-%m-%d'),
        'cities': n,
        'distinct_cells': len(cells),
        'cities_sharing_a_cell_with_another_city': shared,
        'principal_rule': 'the most populous city in the cell, lowest GeoNames id breaking a tie',
        'city_to_cell': city_cell,
        'cell_principal': principal,
        'cell_members': members,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(out, open(OUT, 'w', encoding='utf-8'), sort_keys=True)
    print('cities %d, distinct cells %d, cities sharing a cell %d'
          % (n, len(cells), shared))
    big = sorted(cells.items(), key=lambda kv: -len(kv[1]))[:3]
    for k, lst in big:
        print('   cell %s: %d cities, principal %s (%s)'
              % (k, len(lst), lst[0]['name'], lst[0]['country']))
    print('wrote %s' % OUT)


if __name__ == '__main__':
    sys.exit(main() or 0)
