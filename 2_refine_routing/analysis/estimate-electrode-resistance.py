"""ITO sheet network, ideal visible islands, finite-resistance routing geometry.

For each electrode solve the driving-point resistance of every island with the
connector grounded. Other islands are floating. Each visible island is made
equipotential, so the output excludes voltage spreading inside visible islands.
No capacitance, driver impedance, zebra or PCB resistance is included.
"""
import argparse
import gc
import importlib.util
import json
import math
import time
from pathlib import Path

import numpy as np
from scipy import ndimage, sparse
from scipy.sparse.csgraph import dijkstra
from scipy.sparse.linalg import splu

HERE = Path(__file__).resolve().parent
OUT = HERE / 'resistance-area'


def raster(rings, origin, shape, step):
    """Sample polygon interiors at cell centers, with holes, without PIL rounding."""
    x0, y0 = origin
    result = np.zeros(shape, dtype=bool)
    for ri, ring in enumerate(rings):
        p = np.asarray(ring, dtype=float)
        a, b = p, np.roll(p, -1, axis=0)
        r0 = max(0, math.ceil((p[:, 1].min()-y0)/step-.5))
        r1 = min(shape[0], math.ceil((p[:, 1].max()-y0)/step-.5))
        for iy in range(r0, r1):
            yy = y0+(iy+.5)*step
            hit = ((a[:, 1] <= yy) & (b[:, 1] > yy)) | ((b[:, 1] <= yy) & (a[:, 1] > yy))
            aa, bb = a[hit], b[hit]
            xs = np.sort(aa[:, 0]+(yy-aa[:, 1])*(bb[:, 0]-aa[:, 0])/(bb[:, 1]-aa[:, 1]))
            if len(xs) % 2:
                raise ValueError('Odd scanline intersections')
            for left, right in xs.reshape(-1, 2):
                c0 = max(0, math.ceil((left-x0)/step-.5))
                c1 = min(shape[1], math.ceil((right-x0)/step-.5))
                result[iy, c0:c1] = ri == 0
    return result


def make_mesh(g, segments, step):
    x0, y0, x1, y1 = g['bbox']
    x0 = math.floor(x0/step)*step-2*step
    y0 = math.floor(y0/step)*step-2*step
    shape = (math.ceil((y1-y0)/step)+3, math.ceil((x1-x0)/step)+3)
    conductor = raster(g['rings'], (x0, y0), shape, step)
    if g.get('contact_bounds_mm'):
        cx0, cy0, cx1, cy1 = g['contact_bounds_mm']
        xs = (x0+(np.arange(shape[1])+.5)*step)[None, :]
        ys = (y0+(np.arange(shape[0])+.5)*step)[:, None]
        source = conductor & (xs >= cx0) & (xs <= cx1) & (ys >= cy0) & (ys < (cy0+cy1)/2)
    elif g['electrode'].startswith('COM'):
        source = conductor & ((x0+(np.arange(shape[1])+.5)*step)[None, :] < g['bbox'][0]+1.6)
    else:
        source = conductor & ((y0+(np.arange(shape[0])+.5)*step)[:, None] < g['bbox'][1]+1.6)
    labels, _ = ndimage.label(conductor)
    grounded_labels = np.unique(labels[source])
    connected = np.isin(labels, grounded_labels[grounded_labels != 0])
    lost_area = float(np.count_nonzero(conductor & ~connected)*step**2)
    conductor &= connected
    del labels, connected
    islands = np.zeros(shape, dtype=np.int16)
    coverage = []
    for j, i in enumerate(g['segment_indices']):
        s = segments[i]
        sx0, sy0, sx1, sy1 = s['bbox']
        c0 = max(0, math.floor((sx0-x0)/step)-1)
        c1 = min(shape[1], math.ceil((sx1-x0)/step)+1)
        r0 = max(0, math.floor((sy0-y0)/step)-1)
        r1 = min(shape[0], math.ceil((sy1-y0)/step)+1)
        mask = raster(s['rings'], (x0+c0*step, y0+r0*step), (r1-r0, c1-c0), step)
        mask &= conductor[r0:r1, c0:c1]
        if not mask.any():
            raise ValueError(f'Island disconnected at this mesh: {g["net"]} {s["id"]}')
        if np.any(islands[r0:r1, c0:c1][mask]):
            raise ValueError('Raster islands overlap')
        islands[r0:r1, c0:c1][mask] = j+1
        coverage.append(float(mask.sum()*step**2/s['area']))
    return conductor, source, islands, lost_area, coverage


def condensed_matrix(conductor, source, islands, k):
    routing = conductor & ~source & (islands == 0)
    nroute = int(routing.sum())
    ids = np.full(conductor.shape, -2, dtype=np.int32)
    ids[routing] = np.arange(nroute, dtype=np.int32)
    mask = islands > 0
    ids[mask] = nroute+islands[mask].astype(np.int32)-1
    ids[source] = -1
    n = nroute+k
    diag = np.zeros(n)
    rr, cc, vv = [], [], []
    for a, b in [(ids[:, :-1], ids[:, 1:]), (ids[:-1, :], ids[1:, :])]:
        ok = (a != -2) & (b != -2) & (a != b)
        aa, bb = a[ok], b[ok]
        diag += np.bincount(aa[aa >= 0], minlength=n)
        diag += np.bincount(bb[bb >= 0], minlength=n)
        both = (aa >= 0) & (bb >= 0)
        aa, bb = aa[both], bb[both]
        rr.extend([aa, bb]); cc.extend([bb, aa]); vv.extend([-np.ones(len(aa)), -np.ones(len(aa))])
    rr.append(np.arange(n)); cc.append(np.arange(n)); vv.append(diag)
    matrix = sparse.coo_matrix((np.concatenate(vv), (np.concatenate(rr), np.concatenate(cc))), shape=(n, n)).tocsc()
    return matrix, nroute


def resistance_values(matrix, nroute, k):
    lu = splu(matrix)
    result = np.empty(k)
    residual = 0.
    for start in range(0, k, 8):
        ns = np.arange(start, min(k, start+8))
        rhs = np.zeros((matrix.shape[0], len(ns)))
        rhs[nroute+ns, np.arange(len(ns))] = 1.
        volts = lu.solve(rhs)
        result[ns] = volts[nroute+ns, np.arange(len(ns))]
        residual = max(residual, float(np.abs(matrix@volts-rhs).max()))
    return result, residual


def full_terminal_resistance(conductor, source, target):
    """One volt on target, zero on contact; all other ITO retains sheet resistance."""
    unknown = conductor & ~source & ~target
    ys, xs = np.nonzero(unknown)
    n = len(ys)
    ids = np.full(conductor.shape, -1, dtype=np.int32)
    ids[ys, xs] = np.arange(n, dtype=np.int32)
    diag, rhs = np.zeros(n), np.zeros(n)
    rr, cc, vv = [], [], []
    for dy, dx in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
        ny, nx = ys+dy, xs+dx
        valid = conductor[ny, nx]
        diag += valid
        rhs += target[ny, nx]
        other = ids[ny, nx]
        ok = valid & (other >= 0)
        rr.append(np.flatnonzero(ok)); cc.append(other[ok]); vv.append(-np.ones(ok.sum()))
    rr.append(np.arange(n)); cc.append(np.arange(n)); vv.append(diag)
    matrix = sparse.coo_matrix((np.concatenate(vv), (np.concatenate(rr), np.concatenate(cc))), shape=(n, n)).tocsc()
    lu = splu(matrix)
    volts = lu.solve(rhs)
    residual = float(np.abs(matrix@volts-rhs).max())
    sy, sx = np.nonzero(source)
    current = 0.
    for dy, dx in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
        ny, nx = sy+dy, sx+dx
        other = ids[ny, nx]
        ok = other >= 0
        current += float(volts[other[ok]].sum())+int(target[ny, nx].sum())
    if not current > 0:
        raise ValueError('Nonpositive terminal conductance')
    return 1/current, residual, n


def distances(conductor, source, islands, step, k):
    ids = np.full(conductor.shape, -1, dtype=np.int32)
    ids[conductor & ~source] = np.arange(1, np.count_nonzero(conductor & ~source)+1, dtype=np.int32)
    ids[source] = 0
    rr, cc, dd = [], [], []
    pairs = [(ids[:, :-1], ids[:, 1:], step), (ids[:-1, :], ids[1:, :], step),
             (ids[:-1, :-1], ids[1:, 1:], step*math.sqrt(2)),
             (ids[:-1, 1:], ids[1:, :-1], step*math.sqrt(2))]
    for a, b, length in pairs:
        valid = (a >= 0) & (b >= 0) & (a != b)
        aa, bb = a[valid], b[valid]
        rr.extend([aa, bb]); cc.extend([bb, aa]); dd.extend([np.full(len(aa), length), np.full(len(aa), length)])
    graph = sparse.coo_matrix((np.concatenate(dd), (np.concatenate(rr), np.concatenate(cc))), shape=(int(ids.max())+1,)*2).tocsr()
    ds = dijkstra(graph, directed=True, indices=0)
    minimum = np.full(k+1, np.inf)
    mask = islands > 0
    np.minimum.at(minimum, islands[mask], ds[ids[mask]])
    return minimum[1:]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--step', type=float, default=.025)
    ap.add_argument('--nets', nargs='*')
    ap.add_argument('--no-distance', action='store_true')
    args = ap.parse_args()
    data = json.loads((OUT/'geometry.json').read_text())
    result = dict(source_sha256=data['source_sha256'], grid_mm=args.step,
                  sheet_ohm_per_square=30,
                  model='2D sheet routing; each visible island equipotential and floating except tested island. Ideal source on outer bottom half (1.5 mm) of the vendor contact. Excludes island-internal spreading, contact, PCB and driver resistance.',
                  nets=[])
    dest = OUT / f'resistance-grid-{args.step:g}mm.json'
    for layer in ['BOTTOM', 'TOP']:
        for g in sorted(data[layer], key=lambda g: g['index']):
            if args.nets and g['net'] not in args.nets and g['electrode'] not in args.nets:
                continue
            start = time.time()
            mesh = make_mesh(g, data['SEGMENT'], args.step)
            conductor, source, islands, lost_area, coverage = mesh
            matrix, nroute = condensed_matrix(conductor, source, islands, len(g['segment_indices']))
            squares, residual = resistance_values(matrix, nroute, len(g['segment_indices']))
            ds = [None]*len(squares) if args.no_distance else distances(conductor, source, islands, args.step, len(squares))
            values = [dict(id=data['SEGMENT'][i]['id'], squares=float(r), resistance_ohm=float(30*r),
                           route_distance_mm=None if dist is None else float(dist))
                      for i, r, dist in zip(g['segment_indices'], squares, ds)]
            row = dict(net=g['net'], electrode=g['electrode'], area_mm2=g['segment_area_mm2'],
                       islands=values, conductor_nodes=int(conductor.sum()), routing_nodes=nroute,
                       lost_conductor_area_mm2=lost_area,
                       min_island_raster_area_ratio=min(coverage), max_island_raster_area_ratio=max(coverage),
                       linear_residual=residual, elapsed_s=time.time()-start)
            result['nets'].append(row)
            dest.write_text(json.dumps(result, indent=2))
            print(f'{g["electrode"]:5} {len(values):3} islands, {nroute:7} routing nodes, R {squares.min()*30/1000:6.2f}–{squares.max()*30/1000:6.2f} kOhm, lost {lost_area:.6f} mm2, {time.time()-start:.1f}s', flush=True)
            del matrix, mesh, conductor, source, islands
            gc.collect()


if __name__ == '__main__':
    main()
