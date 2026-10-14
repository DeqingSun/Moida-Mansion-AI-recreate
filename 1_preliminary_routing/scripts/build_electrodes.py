"""Build a candid static-drive routing candidate, exact overlap audit and browser data."""
import json,struct,csv,runpy,math
from pathlib import Path
from collections import Counter
from shapely import wkt
from shapely.geometry import LineString,box,Point
from shapely.ops import nearest_points,unary_union
from shapely.strtree import STRtree
ROOT=Path(__file__).resolve().parents[1];D=ROOT/'electrode-design';O=ROOT/'output'
source=json.loads((O/'segments.json').read_text())['segments'];inp=json.loads((D/'routing-input.json').read_text());W=inp['width'];M=inp['margin']
islands=inp['islands'];polys=[wkt.loads(r['geometry']) for r in islands];tree=STRtree(polys)
binary=(D/'router-output.bin').read_bytes();offset=0;traces=[];route_errors=[]
for i,rec in enumerate(islands):
 count=struct.unpack_from('i',binary,offset)[0];offset+=4
 vals=struct.unpack_from(f'{count}i',binary,offset);offset+=4*count
 if not count:traces.append(None);continue
 pts=[(v%W-M,v//W-M) for v in vals];start=nearest_points(polys[i],Point(pts[0]))[0];pts.insert(0,(start.x,start.y))
 # Collapse collinear vertices exactly, then include a tiny intentional overlap at the attachment.
 simplified=LineString(pts).simplify(0)
 stroke=simplified.buffer(.5,cap_style='round',join_style='round')
 pad=box(pts[-1][0]-3,pts[-1][1]-3,pts[-1][0]+3,pts[-1][1]+3)
 copper=unary_union([stroke,pad]);bad=[]
 for j in tree.query(copper.buffer(1)):
  if islands[j]['id']!=rec['id'] and copper.distance(polys[j])<1-1e-6:bad.append(islands[j]['id'])
 traces.append(dict(line=simplified,geometry=copper,pad=pad,length=simplified.length,points=list(simplified.coords),foreign_clearance_errors=sorted(set(bad))))
# Drop invalid paths rather than presenting shorts as working connections.
for i,t in enumerate(traces):
 if t and t['foreign_clearance_errors']:
  route_errors.append(dict(island=i,id=islands[i]['id'],reason='foreign-shape clearance',others=t['foreign_clearance_errors']));traces[i]=None
for i,t in enumerate(traces):
 if not t:continue
 for j in range(i):
  u=traces[j]
  if u and islands[i]['id']!=islands[j]['id'] and t['geometry'].distance(u['geometry'])<1-1e-6:
   route_errors.append(dict(island=i,id=islands[i]['id'],reason='trace clearance',other=islands[j]['id']));traces[i]=None;break
art=unary_union(polys)
trace_union=unary_union([t['geometry'] for t in traces if t])
# Rear common cutouts avoid routed front wires and keep all intended artwork covered.
rear=box(-80,-80,3080,2240).difference(trace_union.buffer(.25).difference(art))
# A rear-only tab beyond the active cavity. No vias/cross-layer electrical connections.
rear=unary_union([rear,LineString([(-70,-70),(-114,-114)]).buffer(3),box(-118,-118,-110,-110)])
rear_parts=list(rear.geoms) if rear.geom_type=='MultiPolygon' else [rear]
main=max(rear_parts,key=lambda p:p.area)

def path_of(g):
 parts=list(g.geoms) if g.geom_type=='MultiPolygon' else [g];out=[]
 for p in parts:
  if p.is_empty or p.geom_type!='Polygon':continue
  for ring in [p.exterior,*p.interiors]:
   pts=list(ring.coords);out.append('M'+' L'.join(f'{x:.5f},{y:.5f}' for x,y in pts[:-1])+' Z')
 return ' '.join(out)

def svg(body):return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-120 -120 3240 2400" width="162mm" height="120mm">'+body+'</svg>'
rows=[];electrodes=[];overlap_errors=[];observed_counts=Counter();totals=Counter()
for i,(p,rec,t) in enumerate(zip(polys,islands,traces)):
 totals[rec['id']]+=1
 # Connectivity to rear terminal must also hold; disconnected rear regions cannot be driven.
 rear_ok=main.intersection(p).area>=p.area-1e-6
 physical=bool(t) and rear_ok
 if physical:observed_counts[rec['id']]+=1
 copper=unary_union([p,t['geometry']]) if t else p
 optical=copper.intersection(rear).intersection(box(0,0,3000,2160))
 error=optical.symmetric_difference(p).area
 if error>1e-6:overlap_errors.append(dict(island=i,id=rec['id'],error_area_native_sq=error))
 electrodes.append(dict(id=rec['id'],bit=rec['bit'],island=rec['island'],shape=path_of(p),front=path_of(copper),routed=bool(t),rear_connected=rear_ok,physical=physical,trace=t['points'] if t else [],contact=t['points'][-1] if t else None,length_mm=t['length']*.05 if t else 0))
 rows.append(dict(id=rec['id'],game_bit=rec['bit'],island=rec['island'],front_net='SEG_'+rec['id'],rear_net='COM0',routed=bool(t),rear_connected=rear_ok,contact_x_mm=t['points'][-1][0]*.05 if t else '',contact_y_mm=t['points'][-1][1]*.05 if t else '',trace_length_mm=t['length']*.05 if t else ''))
full=sum(observed_counts[r['id']]==totals[r['id']] for r in source);partial=sum(0<observed_counts[r['id']]<totals[r['id']] for r in source)
report=dict(status='INCOMPLETE ROUTING — NOT FOR FABRICATION',architecture='Static drive: 631 logical front SEG nets, one rear COM. Multiple contacts of one ID must be tied on an external PCB.',canvas_mm=[150,108],glass_envelope_example_mm=[162,120],trace_width_mm=.05,trace_clearance_mm=.05,contact_size_mm=.3,source_segments=631,physical_islands=len(islands),routed_islands=sum(bool(t) for t in traces),electrically_reachable_islands=sum(e['physical'] for e in electrodes),complete_logical_segments=full,partial_logical_segments=partial,unreachable_logical_segments=631-full-partial,unrouted_islands=sum(not t for t in traces),rejected_paths=len(route_errors),rear_connected_components=len(rear_parts),optical_mismatch_islands=len(overlap_errors),max_optical_error_native_sq=max([x['error_area_native_sq'] for x in overlap_errors],default=0),limitations=['Routing is incomplete; isolated electrode shapes are not electrically driven.','No ITO resistance/capacitance, fringing fields, alignment tolerance, seal, connector or electro-optic material model.','Trace width and clearance are assumptions, not supplier-approved rules.','COM/SEG drive model is ideal static AC, not a multiplexed driver design.','Glass envelope is a working margin, not a released mechanical drawing.'])
payload=dict(report=report,segments=[dict(id=r['id'],bit=r['game_index'],paths=r['paths'],bbox=[r['x'],r['y'],r['width'],r['height']],total=totals[r['id']],connected=observed_counts[r['id']]) for r in source],islands=electrodes,rear=path_of(rear),rear_connected=path_of(main),route_errors=route_errors,overlap_errors=overlap_errors)
(D/'design.json').write_text(json.dumps(payload,separators=(',',':')))
(D/'validation.json').write_text(json.dumps(report,indent=2))
(D/'front-electrodes.svg').write_text(svg(''.join(f'<path id="{e["id"]}_island{e["island"]}" data-net="SEG_{e["id"]}" data-routed="{str(e["routed"]).lower()}" fill="#287fc2" fill-rule="evenodd" d="{e["front"]}"/>' for e in electrodes)))
(D/'rear-electrode.svg').write_text(svg(f'<path id="COM0" fill="#db7837" fill-rule="evenodd" d="{payload["rear"]}"/>'))
with (D/'contact-register.csv').open('w') as f:
 w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
print(json.dumps(report,indent=2))
