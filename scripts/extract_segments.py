#!/usr/bin/env python3
"""Rebuild exact logical LCD artwork from the archived public browser asset."""
import ast, re, json, csv, hashlib, collections
from pathlib import Path
import xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT/'output'; OUT.mkdir(exist_ok=True)
s=(ROOT/'source/moida.js').read_text()
svg=ast.literal_eval(re.search(r'p\.innerHTML=("(?:[^"\\]|\\.)*")',s)[1])
(ROOT/'source/panel.svg').write_text(svg)
ns={'s':'http://www.w3.org/2000/svg'}; root=ET.fromstring(svg)
ids=[''.join(map(chr,a)) for a in json.loads(re.search(r'segIds_721420499=(\[\[.*?\]\])',s)[1])]
defs=list(root.find('s:defs',ns)); assert len(ids)==len(defs)==631
records=[]; groups=[]
for index,g in enumerate(defs):
 sid=g.attrib['id'].removeprefix('def_'); assert sid==ids[index]
 paths=[p.attrib['d'] for p in g]; coords=[]
 for p in paths:
  assert set(re.findall('[A-Za-z]',p))<=set('MLZ')
  nums=list(map(float,re.findall(r'-?\d+(?:\.\d+)?',p))); coords+=list(zip(nums[::2],nums[1::2]))
 x0=min(x for x,y in coords);x1=max(x for x,y in coords);y0=min(y for x,y in coords);y1=max(y for x,y in coords)
 records.append(dict(id=sid,game_index=index+1,source_bank=sid[:3],x=x0,y=y0,width=x1-x0,height=y1-y0,center_x=(x0+x1)/2,center_y=(y0+y1)/2,path_count=len(paths),contour_count=sum(p.count('M') for p in paths),paths=paths))
 groups.append(f'<g id="{sid}"><title>{sid}</title>'+''.join(f'<path d="{p}"/>' for p in paths)+'</g>')
body='\n'.join(groups)
head='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3000 2160"'
(OUT/'segments.svg').write_text(head+' width="3000" height="2160" fill="#000" stroke="none">\n'+body+'\n</svg>')
(OUT/'segments-150mm.svg').write_text(head+' width="150mm" height="108mm" fill="#000" stroke="none">\n'+body+'\n</svg>')
(OUT/'segments.json').write_text(json.dumps(dict(viewBox=[0,0,3000,2160],origin='top-left; x right, y down',example_width_mm=150,mm_per_unit=0.05,segments=records),indent=2))
fields=[k for k in records[0] if k!='paths']
with (OUT/'segment-register.csv').open('w') as f:
 writer=csv.DictWriter(f,fieldnames=fields);writer.writeheader();writer.writerows({k:v for k,v in r.items() if k!='paths'} for r in records)
# DXF closed polylines; each logical ID gets its own layer. Cartesian mm, lower-left origin.
dxf=['0','SECTION','2','HEADER','9','$INSUNITS','70','4','0','ENDSEC','0','SECTION','2','ENTITIES']
for r in records:
 for p in r['paths']:
  for contour in re.findall(r'M(.*?)Z',p):
   a=list(map(float,re.findall(r'-?\d+(?:\.\d+)?',contour))); pts=list(zip(a[::2],a[1::2]));dxf+=['0','LWPOLYLINE','100','AcDbEntity','8',r['id'],'100','AcDbPolyline','90',str(len(pts)),'70','1']
   for x,y in pts:dxf+=['10',f'{x*.05:.6f}','20',f'{(2160-y)*.05:.6f}']
dxf+=['0','ENDSEC','0','EOF'];(OUT/'segments-150mm.dxf').write_text('\n'.join(dxf)+'\n')
manifest=dict(asset_url='https://html-classic.itch.zone/html/11926521/moida.js',sha256=hashlib.sha256(s.encode()).hexdigest(),segment_count=len(records),path_count=sum(r['path_count'] for r in records),contour_count=sum(r['contour_count'] for r in records),banks=dict(collections.Counter(r['source_bank'] for r in records)),multiple_path_groups=sum(r['path_count']>1 for r in records),bounds=[min(r['x'] for r in records),min(r['y'] for r in records),max(r['x']+r['width'] for r in records),max(r['y']+r['height'] for r in records)])
(OUT/'validation.json').write_text(json.dumps(manifest,indent=2))
template=(ROOT/'scripts/viewer-template.html').read_text();(OUT/'segment-explorer.html').write_text(template.replace('__SVG__',head+' id="panel">'+body+'</svg>').replace('__DATA__',json.dumps(records)))
print(json.dumps(manifest,indent=2))
