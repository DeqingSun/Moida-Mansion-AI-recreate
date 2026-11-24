"""Reconcile and export numeric results. Does not edit glass or PCB geometry."""
import collections
import csv
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE/'resistance-area'
geometry = json.loads((OUT/'geometry.json').read_text())
full = json.loads((OUT/'full-terminal-grid-0.025mm.json').read_text())
fine = json.loads((OUT/'full-terminal-grid-0.02mm.json').read_text())
assert full['source_sha256'] == fine['source_sha256'] == geometry['source_sha256']
assert len(full['nets']) == 64
assert len(fine['nets']) == 9
segments = geometry['SEGMENT']
assert len(segments) == 780 and len({s['id'] for s in segments}) == 780
islands = [dict(island=s['id'], original_segment=s['original_id'], com=f'COM{s["com"]}',
                seg=f'SEG{s["seg"]}', area_mm2=s['area'],
                point_x_mm=s['interior_point_mm'][0], point_y_mm=s['interior_point_mm'][1],
                dxf_handle=s['handle']) for s in segments]
cells = []
for com in range(16):
    for seg in range(48):
        ss = [s for s in segments if s['com'] == com and s['seg'] == seg]
        cells.append(dict(com=f'COM{com}', seg=f'SEG{seg}', islands=len(ss),
                          area_mm2=sum(s['area'] for s in ss)))
electrodes = []
for row in full['nets']:
    g = next(g for key in ['TOP', 'BOTTOM'] for g in geometry[key] if g['net'] == row['net'])
    first, last = row['terminals']
    field = 'com' if row['electrode'].startswith('COM') else 'seg'
    electrodes.append(dict(electrode=row['electrode'], dxf_net=row['net'],
                           islands=len(g['segment_indices']),
                           addressed_cells=sum(c['islands'] > 0 and c[field] == row['electrode'] for c in cells),
                           area_mm2=g['segment_area_mm2'],
                           first_island=first['id'], R_first_ohm=first['resistance_ohm'],
                           last_island=last['id'], R_last_ohm=last['resistance_ohm'],
                           first_path_mm=first['route_distance_mm'], last_path_mm=last['route_distance_mm'],
                           first_squares=first['squares'], last_squares=last['squares']))
total = sum(s['area_mm2'] for s in islands)
assert abs(sum(c['area_mm2'] for c in cells)-total) < 1e-7
for prefix, count in [('COM', 16), ('SEG', 48)]:
    es = [g for g in electrodes if g['electrode'].startswith(prefix)]
    assert len(es) == count
    assert sum(g['islands'] for g in es) == 780
    assert abs(sum(g['area_mm2'] for g in es)-total) < 1e-7
    for g in es:
        assigned = [s for s in islands if s[prefix.lower()] == g['electrode']]
        assert abs(sum(s['area_mm2'] for s in assigned)-g['area_mm2']) < 1e-7
        assert g['first_island'] in {s['island'] for s in assigned}
        assert g['last_island'] in {s['island'] for s in assigned}
assert all(row['lost_conductor_area_mm2'] == 0 for row in full['nets'])
changes = []
for row in fine['nets']:
    old = next(g for g in full['nets'] if g['net'] == row['net'])
    for a, b in zip(old['terminals'], row['terminals']):
        assert a['id'] == b['id']
        changes.append(dict(electrode=row['electrode'], terminal=a['role'], island=a['id'],
                            R_25um_ohm=a['resistance_ohm'], R_20um_ohm=b['resistance_ohm'],
                            change_pct=100*(b['resistance_ohm']/a['resistance_ohm']-1)))
original = collections.defaultdict(float)
for s in islands:
    original[s['original_segment']] += s['area_mm2']
original_rows = [dict(original_segment=k, area_mm2=v) for k, v in original.items()]
def write_csv(name, rows):
    with (OUT/name).open('w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
for name, rows in [('electrodes.csv', electrodes), ('island-areas.csv', islands),
                   ('cell-areas.csv', cells), ('original-segment-areas.csv', original_rows),
                   ('mesh-verification.csv', changes)]:
    write_csv(name, rows)
result = dict(source=geometry['source'], source_sha256=geometry['source_sha256'],
              sheet_ohm_per_square=30, resistance_grid_mm=.025,
              electrode_count=64, island_count=780, original_segment_count=len(original),
              addressed_cells=sum(c['islands'] > 0 for c in cells),
              total_area_mm2=total, max_mesh_change_pct=max(abs(c['change_pct']) for c in changes),
              max_linear_residual=max(t['residual'] for g in full['nets'] for t in g['terminals']),
              electrodes=electrodes, islands=islands, cells=cells,
              original_segments=original_rows, mesh_verification=changes)
(OUT/'results.json').write_text(json.dumps(result, indent=2))
print({k: v for k, v in result.items() if not isinstance(v, list)})
for prefix in ['COM', 'SEG']:
    es = [g for g in electrodes if g['electrode'].startswith(prefix)]
    print(prefix, 'first R range kOhm', min(g['R_first_ohm']/1000 for g in es), max(g['R_first_ohm']/1000 for g in es),
          'last R range kOhm', min(g['R_last_ohm']/1000 for g in es), max(g['R_last_ohm']/1000 for g in es))
