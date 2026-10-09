#!/usr/bin/env python3
"""Directional soft-obstacle router. Requires numpy and shapely; no source edits.
Example: python3 scripts/route_orthogonal.py --passes 10 --seed 17
All conflicts remain visible: this is an optimization experiment, not a mask release.
"""
import argparse, json, math, random, subprocess, time
from collections import Counter
from pathlib import Path
import numpy as np
from shapely.geometry import Polygon
from shapely import contains_xy

ROOT=Path(__file__).resolve().parents[1]

def run(args):
 start=time.time(); rng=random.Random(args.seed)
 data=json.loads((ROOT/'output/router/segments-data.json').read_text()); segs=data['segments']
 out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
 step=args.grid; margin=160; nx=math.ceil((3000+2*margin)/step)+1; ny=math.ceil((2160+2*margin)/step)+1; size=nx*ny
 def cellpoints(points):
  cells=[]
  for a,b in zip(points,points[1:]):
   n=max(2,math.ceil(math.dist(a,b)/(step/2))+1);t=np.linspace(0,1,n)
   x=np.rint((a[0]+(b[0]-a[0])*t+margin)/step).astype(int);y=np.rint((a[1]+(b[1]-a[1])*t+margin)/step).astype(int)
   cells.append(y*nx+x)
  base=np.unique(np.concatenate(cells));radius=max(0,math.ceil((args.trace_mm/(args.width_mm/3000)/2)/step-.5))
  if radius:base=np.unique(np.concatenate([base+dy*nx+dx for dx in range(-radius,radius+1) for dy in range(-radius,radius+1)]))
  return base[(base>=0)&(base<size)]
 def polygoncells(island):
  poly=Polygon(island['rings'][0],island['rings'][1:]);x0,y0,x1,y1=poly.bounds
  xx=np.arange(max(0,math.floor((x0+margin)/step)),min(nx,math.ceil((x1+margin)/step)+1));yy=np.arange(max(0,math.floor((y0+margin)/step)),min(ny,math.ceil((y1+margin)/step)+1));x,y=np.meshgrid(xx,yy)
  ids=(y*nx+x)[contains_xy(poly,x*step-margin,y*step-margin)]
  return np.unique(np.append(ids,round((island['point'][1]+margin)/step)*nx+round((island['point'][0]+margin)/step)))
 # Closest available column/row pair to the area-weighted center. Same-layer
 # sharing is allowed, but two distinct logical segments never share a pair.
 assignments={};used=set();slots={};islands=[]
 for s in segs:
  ps=[Polygon(i['rings'][0],i['rings'][1:]) for i in s['islands']];area=sum(p.area for p in ps)
  x=sum(p.centroid.x*p.area for p in ps)/area;y=sum(p.centroid.y*p.area for p in ps)/area
  cs=sorted(range(1,257),key=lambda c:abs(3000*c/257-x))[:16];rs=sorted(range(1,257),key=lambda r:abs(2160*r/257-y))[:16]
  c,r=min(((c,r) for c in cs for r in rs if (c,r) not in used),key=lambda cr:(3000*cr[0]/257-x)**2+(2160*cr[1]/257-y)**2)
  used.add((c,r));slots[s['id']]=(c,r);assignments[s['id']]={'top':f'COL{c:03}','bottom':f'ROW{r:03}'}
  for j,i in enumerate(s['islands']):islands.append((s['id'],j,i,polygoncells(i)))
 total=[np.zeros(size,dtype=np.int32) for _ in range(2)];own=[{} for _ in range(2)];art=np.zeros(size,dtype=bool)
 def alter(layer,net,cells,delta):
  total[layer][cells]+=delta;counter=own[layer].setdefault(net,Counter())
  for k in cells:
   k=int(k);counter[k]+=delta
   if not counter[k]:del counter[k]
 for sid,j,i,cells in islands:
  art[cells]=True
  for l,layer in enumerate(['top','bottom']):alter(l,assignments[sid][layer],cells,1)
 def candidate(points):
  clean=[points[0]]
  for p in points[1:]:
   if p!=clean[-1]:clean.append(p)
  return {'points':clean,'cells':cellpoints(clean),'length':sum(math.dist(a,b) for a,b in zip(clean,clean[1:]))}
 routes=[]
 for sid,j,i,cells in islands:
  x,y=i['point'];c,r=slots[sid]
  for l,layer in enumerate(['top','bottom']):
   candidates=[]
   for side in (['N','S'] if l==0 else ['W','E']):
    axis=3000*c/257 if l==0 else 2160*r/257;end=(-72 if side=='N' else 2232) if l==0 else (-122 if side=='W' else 3122)
    for delta in [0,-step*2,step*2,-step*6,step*6,-step*14,step*14]:
     track=axis+delta
     if l==0:pts=[[x,y],[track,y],[track,end],[axis,end]]
     else:pts=[[x,y],[x,track],[end,track],[end,axis]]
     cand=candidate(pts);cand['pad']=f'{"T" if l==0 else "B"}-{side}{c if l==0 else r:03}';candidates.append(cand)
   base=min(candidates[::7],key=lambda q:q['length'])
   routes.append({'id':f'{sid}-{j}-{layer}','layer':l,'net':assignments[sid][layer],'candidates':candidates,'selected':base})
 def project():
  pads={};traces=[]
  for r in routes:
   q=r['selected'];pads[q['pad']]=r['net'];traces.append({'id':r['id'],'layer':['top','bottom'][r['layer']],'net':r['net'],'widthMm':args.trace_mm,'points':q['points']})
  return {'format':'moida-lcd-routing','version':2,'sourceHash':data['sourceHash'],'name':'Orthogonal routing experiment','settings':{'widthMm':args.width_mm,'padSizeMm':args.pad_mm,'clearanceMm':args.clearance_mm,'gridMm':step*args.width_mm/3000},'assignments':assignments,'pads':pads,'traces':traces}
 (out/'baseline.moida-routing.json').write_text(json.dumps(project()))
 for r in routes:alter(r['layer'],r['net'],r['selected']['cells'],1)
 def cost(r,q):
  l=r['layer'];cells=q['cells'];mine=own[l].get(r['net'],{})
  foreign=total[l][cells]-np.fromiter((mine.get(int(k),0) for k in cells),dtype=np.int32,count=len(cells))
  other=total[1-l][cells]*(~art[cells]);return args.short_weight*int(np.count_nonzero(foreign))+args.cross_weight*int(np.count_nonzero(other))+q['length']*.002
 history=[]
 for iteration in range(args.passes):
  order=list(range(len(routes)));rng.shuffle(order);changes=0;gain=0
  for idx in order:
   r=routes[idx];old=r['selected'];alter(r['layer'],r['net'],old['cells'],-1);oldcost=cost(r,old)
   best=min(r['candidates'],key=lambda q:cost(r,q));newcost=cost(r,best)
   if newcost<oldcost-1e-8:r['selected']=best;changes+=1;gain+=oldcost-newcost
   alter(r['layer'],r['net'],r['selected']['cells'],1)
  history.append({'pass':iteration+1,'changed_routes':changes,'surrogate_cost_reduction':gain});print(json.dumps(history[-1]),flush=True)
  if not changes:break
 (out/'optimized.moida-routing.json').write_text(json.dumps(project()))
 meta={'algorithm':'Seeded coordinate descent over 14 directional Manhattan candidates per island per layer; fixed spatial column/row assignment with unique ordered pairs.','seed':args.seed,'grid_native':step,'short_weight':args.short_weight,'cross_weight':args.cross_weight,'passes':history,'segments':len(segs),'islands':len(islands),'routes':len(routes),'seconds_search':round(time.time()-start,2),'limitations':['Finite candidate search, not a proof of optimality or impossibility.','Search uses coarse raster cells; exact polygon validation is authoritative.','Same-layer shorts and forbidden cross-layer overlaps may remain; not fabrication-ready.','Separate edge contacts with the same net require external PCB connections.','Column/row assignment is fixed during the path search.']}
 (out/'search.json').write_text(json.dumps(meta,indent=2))
 subprocess.run([args.node,str(ROOT/'scripts/audit_orthogonal.cjs'),str(out.resolve())],check=True)
 print('Results:',out.resolve(),flush=True)

if __name__=='__main__':
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--output',default=str(ROOT/'output/orthogonal-routing'));p.add_argument('--passes',type=int,default=10);p.add_argument('--seed',type=int,default=17);p.add_argument('--grid',type=float,default=3);p.add_argument('--width-mm',type=float,default=150);p.add_argument('--trace-mm',type=float,default=.05);p.add_argument('--pad-mm',type=float,default=.3);p.add_argument('--clearance-mm',type=float,default=.05);p.add_argument('--short-weight',type=float,default=100);p.add_argument('--cross-weight',type=float,default=1000);p.add_argument('--node',default='node');args=p.parse_args()
 if args.grid<1 or args.passes<0 or args.width_mm<30 or not .005<=args.trace_mm<=10:p.error('Invalid grid, passes, screen width, or trace width')
 run(args)
