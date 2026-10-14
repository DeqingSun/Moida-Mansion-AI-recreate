"""Create the offline routing editor package and normalized original polygon data."""
from pathlib import Path
import json,shutil,runpy
from shapely.geometry.polygon import orient
ROOT=Path(__file__).resolve().parents[1];out=ROOT/'output/router';out.mkdir(exist_ok=True)
a=runpy.run_path(str(ROOT/'scripts/check_geometry.py'))
segments=[]
for rec,g in zip(a['data'],a['geoms']):
 islands=[]
 for p in list(g.geoms) if g.geom_type=='MultiPolygon' else [g]:
  p=orient(p,sign=1);rings=[list(p.exterior.coords)[:-1]]+[list(r.coords)[:-1] for r in p.interiors]
  islands.append(dict(rings=rings,point=list(p.representative_point().coords)[0],bounds=list(p.bounds)))
 segments.append(dict(id=rec['id'],bit=rec['game_index'],paths=rec['paths'],bounds=[rec['x'],rec['y'],rec['x']+rec['width'],rec['y']+rec['height']],islands=islands))
validation=json.loads((ROOT/'output/validation.json').read_text())
data=dict(version=1,sourceHash=validation['sha256'],width=3000,height=2160,segments=segments)
(out/'segments-data.js').write_text('globalThis.ROUTER_DATA='+json.dumps(data,separators=(',',':'))+';\n')
(out/'segments-data.json').write_text(json.dumps(data,separators=(',',':')))
for p in (ROOT/'routing-editor').rglob('*'):
 if p.is_file():
  dest=out/p.relative_to(ROOT/'routing-editor');dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy(p,dest)
print('Packaged',len(segments),'segments and',sum(len(s['islands']) for s in segments),'islands into',out)
