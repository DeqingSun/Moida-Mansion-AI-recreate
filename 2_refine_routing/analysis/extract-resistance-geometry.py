"""Extract filled final-DXF polygons, retaining holes and entity handles."""
import collections
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / '2_refine_routing/Moida-routing_to_vendor.dxf'
OUTPUT = ROOT / '2_refine_routing/analysis/resistance-area'


def signed_area(ring):
    return sum(a[0]*b[1]-b[0]*a[1] for a, b in zip(ring, ring[1:]+ring[:1]))/2


def extract():
    lines = SOURCE.read_text().splitlines()
    entities, current = [], []
    for i in range(0, len(lines)-1, 2):
        code, value = int(lines[i]), lines[i+1].strip()
        if code == 0 and current:
            entities.append(current)
            current = []
        current.append((code, value))
    if current:
        entities.append(current)
    layers = collections.defaultdict(list)
    for entity in entities:
        if entity[0] != (0, 'HATCH'):
            continue
        layer = next(value for code, value in entity if code == 8)
        if layer not in ('TOP', 'BOTTOM', 'SEGMENT'):
            continue
        rings, ring = [], None
        for code, value in entity:
            if code == 92:
                if ring is not None:
                    rings.append(ring)
                ring = []
            elif code == 10 and ring is not None:
                x = float(value)
            elif code == 20 and ring is not None:
                ring.append([x, float(value)])
        if ring:
            rings.append(ring)
        points = sum(rings, [])
        layers[layer].append(dict(
            handle=next(value for code, value in entity if code == 5),
            rings=rings,
            area=abs(signed_area(rings[0]))-sum(abs(signed_area(r)) for r in rings[1:]),
            bbox=[min(p[0] for p in points), min(p[1] for p in points),
                  max(p[0] for p in points), max(p[1] for p in points)],
        ))
    return dict(source=str(SOURCE.relative_to(ROOT)),
                source_sha256=hashlib.sha256(SOURCE.read_bytes()).hexdigest(), **layers)


if __name__ == '__main__':
    OUTPUT.mkdir(exist_ok=True)
    data = extract()
    (OUTPUT / 'dxf-polygons.json').write_text(json.dumps(data))
    print({key: len(data[key]) for key in ('TOP', 'BOTTOM', 'SEGMENT')})
