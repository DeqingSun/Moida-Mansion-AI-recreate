"""Export closed, millimeter DXF polylines. Placeholder width: 30 mm each."""
from pathlib import Path
import ezdxf
from ezdxf import units
from collections import Counter
import cv2
import numpy as np
from PIL import Image
import xml.etree.ElementTree as ET
import sys

root=Path(__file__).resolve().parent
out=root/'solidworks-dxf'; out.mkdir(exist_ok=True)
names=['mode-stairs','view-magnifier','deny-left-arrow','approve-right-arrow','moida-mansion','moida','mansion']
if len(sys.argv)>1:
    names=sys.argv[1:]
for name in names:
    svg=root/f'{name}.svg'
    if svg.exists():
        pts=ET.parse(svg).getroot().find('{http://www.w3.org/2000/svg}polygon').attrib['points']
        raw=np.array([[float(v) for v in p.split(',')] for p in pts.split()],dtype='float32')
        loops=[cv2.approxPolyDP(raw.reshape(-1,1,2),.15,True).reshape(-1,2)]
    else:
        alpha=np.array(Image.open(root/f'{name}.png'))[:,:,3]
        contours,_=cv2.findContours((alpha>=128).astype('uint8'),cv2.RETR_TREE,cv2.CHAIN_APPROX_SIMPLE)
        tolerance=1.5 if name in {'moida-mansion','moida','mansion'} else .25
        loops=[cv2.approxPolyDP(c,tolerance,True).reshape(-1,2).astype(float) for c in contours if abs(cv2.contourArea(c))>=2]
    points=np.vstack(loops); low=points.min(axis=0); high=points.max(axis=0)
    scale=30/(high[0]-low[0]); center=(low+high)/2
    doc=ezdxf.new('R2000')
    doc.units=units.MM
    doc.header['$MEASUREMENT']=1
    model=doc.modelspace()
    fallback=ezdxf.new('R12')
    fallback_model=fallback.modelspace()
    expected=[]
    for loop in loops:
        coords=(loop-center)*scale; coords[:,1]*=-1
        assert len(coords)>=3 and np.isfinite(coords).all()
        coords=np.round(coords,8)
        expected.append(coords)
        model.add_lwpolyline(coords,close=True)
        for start,end in zip(coords,np.roll(coords,-1,axis=0)):
            fallback_model.add_line(tuple(start),tuple(end))
    doc.saveas(out/f'{name}.dxf')
    compat=out/'r12-lines'; compat.mkdir(exist_ok=True)
    fallback.saveas(compat/f'{name}-r12.dxf')
    # Reopen serialized files and audit the actual output, including closure
    # and dimensions. Verify fallback LINE endpoints form closed loops too.
    reopened=ezdxf.readfile(out/f'{name}.dxf')
    report=reopened.audit()
    assert not report.errors and not report.fixes
    entities=list(reopened.modelspace())
    assert len(entities)==len(expected) and reopened.units==units.MM
    for entity,coords in zip(entities,expected):
        assert entity.closed and np.allclose(np.array(entity.get_points('xy')),coords,atol=1e-8)
    fallback_read=ezdxf.readfile(compat/f'{name}-r12.dxf')
    report=fallback_read.audit(); assert not report.errors and not report.fixes
    endpoints=Counter()
    for entity in fallback_read.modelspace():
        for v in [entity.dxf.start,entity.dxf.end]:
            endpoints[(v.x,v.y,v.z)]+=1
    assert all(count==2 for count in endpoints.values())
    print(f'{name}: {len(loops)} closed contours, {sum(map(len,loops))} vertices, width 30 mm')
(out/'README.txt').write_text(
    'Regenerated with ezdxf using complete R2000 document structure. All primary files use millimeters and a placeholder overall width of 30 mm each. Scale to your intended size in SolidWorks. Geometry is centered on the origin, viewed from the front. Closed polylines include internal holes. Curves are approximated by short line segments. All files were reopened and audited with ezdxf; polyline closure and coordinate preservation were verified. Lettering uses 1.5-pixel contour simplification: 510 vertices for the stacked title, 254 for MOIDA, and 256 for MANSION. SolidWorks import has not been tested here. The r12-lines folder contains older-format alternatives using only LINE entities; explicitly choose millimeters during import for those files. Use a shallow blind cut to preserve enclosed islands.\n')
