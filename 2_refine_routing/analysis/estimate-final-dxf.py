import json,collections
from pathlib import Path
f=Path('2_refine_routing/exports/Moida-routing-AutoCAD-complete.dxf');s=f.read_text().splitlines();p=[(int(s[i]),s[i+1].strip()) for i in range(0,len(s)-1,2)];ents=[];cur=[]
for c,v in p:
 if c==0:
  if cur:ents.append(cur)
  cur=[]
 cur.append((c,v))
def area(r):return sum(a[0]*b[1]-b[0]*a[1]for a,b in zip(r,r[1:]+r[:1]))/2
out=collections.defaultdict(list)
for e in ents:
 if e[0]!=(0,'HATCH'):continue
 layer=next(v for c,v in e if c==8);rings=[];r=None
 for c,v in e:
  if c==92:
   if r is not None:rings.append(r)
   r=[]
  elif c==10 and r is not None:x=float(v)
  elif c==20 and r is not None:r.append([x,float(v)])
 if r:rings.append(r)
 pts=sum(rings,[]);out[layer].append({'rings':rings,'area':abs(area(rings[0]))-sum(abs(area(r))for r in rings[1:]),'bbox':[min(x for x,y in pts),min(y for x,y in pts),max(x for x,y in pts),max(y for x,y in pts)]})
print({k:len(v)for k,v in out.items()})

Path('/tmp/final-dxf-polygons.json').write_text(json.dumps(out))

# Independent 2-D sheet-resistor first-moment model, other electrode ideal-clamped.
# L*tau = Rsheet*C. This is an RC delay metric, not a full multiplex waveform model.
import subprocess,sys,hashlib
import numpy as np
from PIL import Image,ImageDraw
from scipy import ndimage,sparse
from scipy.sparse.linalg import spsolve
subprocess.run(['node','2_refine_routing/analysis/extract-final-dxf.cjs','/tmp/final-dxf-polygons.json','/tmp/final-dxf-extracted.json'],check=True,stdout=subprocess.DEVNULL)
data=json.load(open('/tmp/final-dxf-extracted.json'))
step=float(sys.argv[1]) if len(sys.argv)>1 else .05
wanted=sys.argv[2:] or ['B-W001','B-W005','B-W006','B-W016','T-N034']
results=[]
for layer in ['TOP','BOTTOM']:
 for g in data[layer]:
  if g['net'] not in wanted:continue
  x0,y0,x1,y1=g['bbox'];x0-=step*2;y0-=step*2;shape=(int((y1-y0)/step)+4,int((x1-x0)/step)+4)
  def mask(rings):
   im=Image.new('1',(shape[1],shape[0]));d=ImageDraw.Draw(im)
   for r in sorted(rings,key=lambda r:abs(area(r)),reverse=True):
    # All input components have an outer ring first; Clipper overlap loops may be disjoint.
    sign=area(max(rings,key=lambda r:abs(area(r))))
    d.polygon([((x-x0)/step,(y-y0)/step)for x,y in r],fill=int(area(r)*sign>0))
   return np.asarray(im).copy()
  conductor=mask(g['rings']);cap=mask(g['overlapRings'])&conductor
  yy,xx=np.indices(shape);source=conductor&((x0+xx*step < -11.4) if layer=='BOTTOM' else (y0+yy*step < -114.4))
  labels,n=ndimage.label(conductor);keep=np.unique(labels[source]);connected=np.isin(labels,keep[keep!=0]);lost=int(np.sum(conductor&~connected));conductor&=connected;cap&=connected
  unknown=conductor&~source;ys,xs=np.nonzero(unknown);N=len(ys);ids=np.full(shape,-1,dtype=np.int32);ids[ys,xs]=np.arange(N)
  rows=[];cols=[];vals=[];diag=np.zeros(N)
  for dy,dx in [(0,1),(0,-1),(1,0),(-1,0)]:
   ny,nx=ys+dy,xs+dx;valid=conductor[ny,nx];diag+=valid
   other=ids[ny,nx];ok=valid&(other>=0);rows.append(np.flatnonzero(ok));cols.append(other[ok]);vals.append(np.full(ok.sum(),-1.))
  rows.append(np.arange(N));cols.append(np.arange(N));vals.append(diag)
  A=sparse.coo_matrix((np.concatenate(vals),(np.concatenate(rows),np.concatenate(cols))),shape=(N,N)).tocsc()
  rhs=30*10e-12*step**2*cap[ys,xs]
  print('solving',g['net'],'grid',step,'nodes',N,'lost pixels',lost,flush=True)
  tau=spsolve(A,rhs);on=tau[cap[ys,xs]]
  result={'net':g['net'],'grid_mm':step,'overlap_mm2':g['overlapArea'],'cap_nF_at_10pFmm2':g['overlapArea']*.01,'mean_delay_max_us':float(on.max()*1e6),'mean_delay_p50_us':float(np.median(on)*1e6),'nodes':N,'lost_conductor_pixels':lost,'raster_cap_area_mm2':float(cap.sum()*step**2)}
  results.append(result);print(result,flush=True)
output=Path(f'2_refine_routing/analysis/final-dxf-rc-{step:g}mm.json');output.write_text(json.dumps({'source_sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'sheet_ohm_per_square':30,'capacitance_pF_per_mm2':10,'model':'Independent electrode, other layer ideal-clamped; 2D resistor grid first moment; ideal source at pad. Not RMS waveform simulation.','results':results},indent=2))
