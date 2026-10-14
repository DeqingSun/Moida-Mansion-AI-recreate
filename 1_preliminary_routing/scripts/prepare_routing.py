import sys,json,struct,runpy
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
from shapely.geometry import Polygon
ROOT=Path(__file__).resolve().parents[1]; out=ROOT/'electrode-design';out.mkdir(exist_ok=True)
r=runpy.run_path(str(ROOT/'scripts/check_geometry.py'));geoms=r['geoms'];data=r['data']
M=120;W=3000+M*2+1;H=2160+M*2+1

def raster(geom,draw,fill):
 for p in geom.geoms if geom.geom_type=='MultiPolygon' else [geom]:
  if p.is_empty:continue
  draw.polygon([(x+M,y+M) for x,y in p.exterior.coords],fill=fill)
  for ring in p.interiors:draw.polygon([(x+M,y+M) for x,y in ring.coords],fill=0)
img=Image.new('L',(W,H));draw=ImageDraw.Draw(img)
# Buffer all obstacles separately; do not erase other shapes with interior holes.
from shapely.ops import unary_union
from shapely import contains_xy
obstacles=unary_union([g.buffer(1.5) for g in geoms])
blocked=np.zeros((H,W),dtype=np.uint8)
for y in range(0,H,32):
 yy,xx=np.mgrid[y:min(y+32,H),0:W]
 blocked[y:y+32]=contains_xy(obstacles,xx-M,yy-M)
goal=np.zeros((H,W),dtype=np.uint8)
for x in range(10,W-10,10):goal[10,x]=goal[H-11,x]=1
for y in range(20,H-20,10):goal[y,10]=goal[y,W-11]=1
# Grid boundary outside contact rectangle is blocked.
blocked[:10,:]=1;blocked[-10:,:]=1;blocked[:,:10]=1;blocked[:,-10:]=1
islands=[];seeds=[]
for rec,g in zip(data,geoms):
 parts=list(g.geoms) if g.geom_type=='MultiPolygon' else [g]
 for k,p in enumerate(parts):
  # Available seed grid points in a narrow ring outside target shape.
  x0,y0,x1,y1=p.buffer(4).bounds;x0=max(0,int(x0)+M);y0=max(0,int(y0)+M);x1=min(W,int(x1)+M+2);y1=min(H,int(y1)+M+2)
  yy,xx=np.mgrid[y0:y1,x0:x1]
  from shapely import contains_xy
  mask=contains_xy(p.buffer(3.0),xx-M,yy-M)&(~blocked[y0:y1,x0:x1].astype(bool))
  sy,sx=np.nonzero(mask);seed=((sy+y0)*W+sx+x0).astype(np.int32)
  seeds.append(seed);islands.append(dict(id=rec['id'],bit=rec['game_index'],island=k,geometry=p.wkt))
with (out/'router-input.bin').open('wb') as f:
 f.write(struct.pack('iii',W,H,len(seeds)));f.write(blocked.tobytes());f.write(goal.tobytes())
 for a in seeds:f.write(struct.pack('i',len(a)));f.write(a.tobytes())
(out/'routing-input.json').write_text(json.dumps(dict(margin=M,width=W,height=H,trace_width=1.0,clearance=1.0,islands=islands)))
print('Prepared',len(islands),'islands; blocked',float(blocked.mean()),flush=True)
