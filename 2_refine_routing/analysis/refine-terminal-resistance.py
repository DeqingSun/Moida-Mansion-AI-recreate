"""Full-sheet terminal resistances for route-nearest and route-farthest islands."""
import argparse
import gc
import importlib.util
import json
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('sheet_model', HERE/'estimate-electrode-resistance.py')
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

ap = argparse.ArgumentParser()
ap.add_argument('--step', type=float, default=.025)
ap.add_argument('--nets', nargs='*')
args = ap.parse_args()
data = json.loads((m.OUT/'geometry.json').read_text())
coarse = json.loads((m.OUT/'resistance-grid-0.025mm.json').read_text())
coarse = {g['net']: g for g in coarse['nets']}
result = dict(source_sha256=data['source_sha256'], grid_mm=args.step,
              sheet_ohm_per_square=30,
              model='Full 2D sheet. Ideal 0V clamp on outer bottom half (1.5 mm) of the vendor contact and ideal 1V clamp on the entire tested visible island. Other islands keep their finite sheet resistance and float. R=1/terminal current. Excludes zebra, PCB, and driver resistance.',
              nets=[])
out = m.OUT/f'full-terminal-grid-{args.step:g}mm.json'
for layer in ['BOTTOM', 'TOP']:
    for g in sorted(data[layer], key=lambda g: g['index']):
        if args.nets and g['net'] not in args.nets and g['electrode'] not in args.nets:
            continue
        start = time.time()
        vals = coarse[g['net']]['islands']
        near = min(vals, key=lambda r: (r['route_distance_mm'], r['id']))
        far = max(vals, key=lambda r: (r['route_distance_mm'], r['id']))
        conductor, source, islands, lost, coverage = m.make_mesh(g, data['SEGMENT'], args.step)
        ids = [data['SEGMENT'][i]['id'] for i in g['segment_indices']]
        row = dict(net=g['net'], electrode=g['electrode'], terminals=[], lost_conductor_area_mm2=lost)
        for role, val in [('first', near), ('last', far)]:
            target = islands == ids.index(val['id'])+1
            squares, residual, nodes = m.full_terminal_resistance(conductor, source, target)
            if args.step == .025 and squares < val['squares']-1e-4:
                raise ValueError('Full sheet violates Rayleigh lower bound')
            row['terminals'].append(dict(role=role, id=val['id'], squares=squares,
                                          resistance_ohm=30*squares,
                                          route_distance_mm=val['route_distance_mm'],
                                          condensed_resistance_ohm=val['resistance_ohm'],
                                          nodes=nodes, residual=residual))
        result['nets'].append(row)
        out.write_text(json.dumps(result, indent=2))
        print(g['electrode'], [(r['role'], r['id'], round(r['resistance_ohm']/1000, 3)) for r in row['terminals']], f'{time.time()-start:.1f}s', flush=True)
        del conductor, source, islands
        gc.collect()
