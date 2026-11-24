// Vendor DXF owns all geometry. Match IDs directly to saved editor artwork;
// infer conductor membership and logical net names from vendor pad positions.
const fs=require('fs'),path=require('path'),C=require('../vendor/clipper.js'),P=require('../project.js');
require('../segments-data.js');
const dir=path.join(__dirname,'resistance-area');
const d=JSON.parse(fs.readFileSync(path.join(dir,'dxf-polygons.json')));
const raw=JSON.parse(fs.readFileSync(path.join(__dirname,'../restored/Moida-routing-final-two-fixes.json')));
const layout=P.layoutData(P.islandData(global.ROUTER_DATA),raw.cuts,raw.edaGeometry,raw.localGeometry);
const S=100000,paths=rings=>rings.map(r=>r.map(([x,y])=>({X:Math.round(x*S),Y:Math.round(y*S)})));
function inside(point,g){let n=0;const p={X:Math.round(point[0]*S),Y:Math.round(point[1]*S)};for(const r of paths(g.rings)){const hit=C.Clipper.PointInPolygon(p,r);if(hit===-1)return false;if(hit===1)n++}return n%2===1}
function intersection(a,b){const c=new C.Clipper(),out=[];c.AddPaths(paths(a.rings),C.PolyType.ptSubject,true);c.AddPaths(paths(b.rings),C.PolyType.ptClip,true);c.Execute(C.ClipType.ctIntersection,out,C.PolyFillType.pftEvenOdd,C.PolyFillType.pftEvenOdd);return Math.abs(out.reduce((a,r)=>a+C.Clipper.Area(r),0))/S/S}
const candidates=layout.segments.map(s=>{
 const rings=s.islands[0].rings.map(r=>r.map(([x,y])=>[x/20,-y/20])),ps=rings.flat();
 return {id:s.id,rings,bbox:[Math.min(...ps.map(p=>p[0])),Math.min(...ps.map(p=>p[1])),Math.max(...ps.map(p=>p[0])),Math.max(...ps.map(p=>p[1]))],point:s.islands[0].point.map((v,i)=>v/20*(i?-1:1))};
});
if(d.SEGMENT.length!==candidates.length)throw Error('Changed artwork count');
for(const s of d.SEGMENT){
 const hits=candidates.filter(t=>t.bbox.every((x,i)=>Math.abs(x-s.bbox[i])<.001)&&Math.abs(intersection(s,t)-s.area)<.001);
 if(hits.length!==1)throw Error('Unmatched island '+s.handle);const t=hits[0];let point=t.point;
 if(!inside(point,s)){
  point=null;const r=s.rings[0];
  for(let j=0;j<r.length&&!point;j++)for(const sign of [-1,1]){
   const a=r[j],b=r[(j+1)%r.length],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(!len)continue;
   const q=[(a[0]+b[0])/2-sign*dy/len*.002,(a[1]+b[1])/2+sign*dx/len*.002];if(inside(q,s)){point=q;break}
  }
  if(!point)throw Error('No interior point '+t.id);
 }
 Object.assign(s,{id:t.id,original_id:/^C\d+S\d+/.exec(t.id)[0],interior_point_mm:point});
}
let minCoverage=1;
for(const layer of ['TOP','BOTTOM'])for(const g of d[layer]){
 const isCom=layer==='BOTTOM',key=isCom?'com':'seg',assigned=d.SEGMENT.map((s,i)=>inside(s.interior_point_mm,g)?i:-1).filter(i=>i>=0);
 const tips=g.rings.flat().filter(p=>Math.abs(p[1]-g.bbox[1])<1e-6);
 const xmin=Math.min(...tips.map(p=>p[0])),xmax=Math.max(...tips.map(p=>p[0]));
 if(Math.abs(xmax-xmin-1)>1e-5||Math.abs(g.bbox[1]+114.3)>1e-5)throw Error('Unexpected bottom contact '+g.handle);
 const contactX=(xmin+xmax)/2,origin=isCom?10:46,index=Math.round((contactX-origin)/2);
 if(Math.abs(contactX-origin-2*index)>1e-5||index<0||index>=(isCom?16:48))throw Error('Unexpected contact pitch '+g.handle);
 const bounds=[xmin,-114.3,xmax,-111.3];
 for(const p of [[xmin,-111.3],[xmax,-111.3]])if(!g.rings.flat().some(q=>Math.hypot(p[0]-q[0],p[1]-q[1])<1e-6))throw Error('Contact length mismatch');
 Object.assign(g,{net:(isCom?'B-W':'T-N')+String(index+1).padStart(3,'0'),electrode:(isCom?'COM':'SEG')+index,index,contact_center_mm:[(xmin+xmax)/2,-112.8],contact_bounds_mm:bounds,segment_indices:assigned,segment_area_mm2:assigned.reduce((a,i)=>a+d.SEGMENT[i].area,0)});
 for(const i of assigned){const s=d.SEGMENT[i],cov=intersection(s,g)/s.area;minCoverage=Math.min(minCoverage,cov);if(cov<.9999)throw Error('Incomplete coverage '+s.id);s[key]=index;s[isCom?'com_net':'seg_net']=g.net}
}
for(const layer of ['TOP','BOTTOM']){if(new Set(d[layer].map(g=>g.index)).size!==d[layer].length)throw Error('Duplicate net');if(d[layer].reduce((a,g)=>a+g.segment_indices.length,0)!==780)throw Error('Membership total');}
d.binding_checks={verified_ids:d.SEGMENT.length,min_segment_coverage:minCoverage,total_segment_area_mm2:d.SEGMENT.reduce((a,s)=>a+s.area,0),contact_dimensions_mm:[1,3],source_clamp:'Outer bottom half of each pad (1 x 1.5 mm)'};
fs.writeFileSync(path.join(dir,'geometry.json'),JSON.stringify(d));console.log(d.binding_checks);console.log(d.BOTTOM.sort((a,b)=>a.index-b.index).map(g=>[g.electrode,g.contact_center_mm,g.segment_indices.length]));
