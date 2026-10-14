"""Optional: pip install shapely. Exact polygon checks with SVG nonzero fill."""
import json,re,csv
from pathlib import Path
from shapely.geometry import LineString
from shapely.ops import unary_union,polygonize
ROOT=Path(__file__).resolve().parents[1];out=ROOT/'output';data=json.loads((out/'segments.json').read_text())['segments']
def winding(point,ring):
 x,y=point; n=0
 for (ax,ay),(bx,by) in zip(ring,ring[1:]+ring[:1]):
  cross=(bx-ax)*(y-ay)-(x-ax)*(by-ay)
  if ay<=y<by and cross>0:n+=1
  elif by<=y<ay and cross<0:n-=1
 return n
def shape(paths):
 shapes=[]
 for path in paths:
  rings=[]
  for sub in re.findall('M(.*?)Z',path):
   nums=list(map(float,re.findall(r'-?\d+(?:\.\d+)?',sub)));rings.append(list(zip(nums[::2],nums[1::2])))
  faces=list(polygonize(unary_union([LineString(r+[r[0]]) for r in rings])))
  shapes.append(unary_union([f for f in faces if sum(winding(f.representative_point().coords[0],r) for r in rings)!=0]))
 return unary_union(shapes)
geoms=[shape(r['paths']) for r in data]; pairs=[];nearest=None
with (out/'island-register.csv').open('w') as f:
 w=csv.writer(f);w.writerow(['id','filled_islands','area_native_sq','routing_review'])
 for r,g in zip(data,geoms):
  n=len(g.geoms) if g.geom_type=='MultiPolygon' else 1
  w.writerow([r['id'],n,g.area,'disconnected pieces must switch together' if n>1 else ''])
for i,a in enumerate(geoms):
 for j in range(i+1,len(geoms)):
  b=geoms[j]; ax,ay,axx,ayy=a.bounds;bx,by,bxx,byy=b.bounds
  # All distances below 4 native units = 0.2mm at proposed 150mm width.
  if max(ax-bxx,bx-axx,ay-byy,by-ayy)>4:continue
  d=a.distance(b)
  if nearest is None or d<nearest['gap_native']:nearest=dict(a=data[i]['id'],b=data[j]['id'],gap_native=d,gap_mm_at_150=d*.05)
  if d<4:pairs.append(dict(a=data[i]['id'],b=data[j]['id'],gap_native=d,gap_mm_at_150=d*.05,overlap_native_sq=a.intersection(b).area))
with (out/'close-segment-pairs.csv').open('w') as f:
 w=csv.DictWriter(f,fieldnames=['a','b','gap_native','gap_mm_at_150','overlap_native_sq']);w.writeheader();w.writerows(sorted(pairs,key=lambda p:p['gap_native']))
report=dict(method='Polygonized source paths with SVG nonzero winding rule; union within logical IDs; pairwise geometric distance. No electrode routing or minimum stroke-width check.',nearest_pair=nearest,positive_area_overlap_pairs=sum(p['overlap_native_sq']>1e-8 for p in pairs),touching_pairs=sum(p['gap_native']==0 for p in pairs),pairs_below_0_05mm_at_150=sum(p['gap_mm_at_150']<.05 for p in pairs),pairs_below_0_1mm_at_150=sum(p['gap_mm_at_150']<.1 for p in pairs),pairs_below_0_2mm_at_150=len(pairs),logical_ids_with_disconnected_filled_islands=sum(g.geom_type=='MultiPolygon' and len(g.geoms)>1 for g in geoms),filled_islands=sum(len(g.geoms) if g.geom_type=='MultiPolygon' else 1 for g in geoms))
(out/'geometry-check.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
