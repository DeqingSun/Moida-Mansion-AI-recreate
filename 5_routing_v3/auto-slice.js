'use strict';
(function(root){
const C=typeof module!=='undefined'?require('../2_refine_routing/vendor/clipper.js'):root.ClipperLib,SCALE=10000;
function contains(item,p){let inside=false;for(const ring of item.rings){const path=ring.map(q=>({X:Math.round(q[0]*SCALE),Y:Math.round(q[1]*SCALE)}));const hit=C.Clipper.PointInPolygon({X:Math.round(p[0]*SCALE),Y:Math.round(p[1]*SCALE)},path);if(hit===-1)return true;if(hit===1)inside=!inside;}return inside;}
function halfPlane(poly,n,limit){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=a[0]*n[0]+a[1]*n[1]-limit,db=b[0]*n[0]+b[1]*n[1]-limit;if(da<=0)out.push(a);if((da<0&&db>0)||(da>0&&db<0)){const f=da/(da-db);out.push([a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f]);}}return out;}
function interior(rings){const ys=[...new Set(rings.flat().map(q=>q[1]))].sort((a,b)=>a-b);for(let j=1;j<ys.length;j++){const y=(ys[j-1]+ys[j])/2,xs=[];for(const r of rings)for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length];if((a[1]>y)!==(b[1]>y))xs.push(a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]));}xs.sort((a,b)=>a-b);for(let i=1;i<xs.length;i+=2)if(xs[i]-xs[i-1]>1e-5)return [(xs[i]+xs[i-1])/2,y];}throw Error('Automatic slice would create a collapsed piece.');}
function partition(item,sites,gap){
 const toPath=ring=>ring.map(q=>({X:Math.round(q[0]*SCALE),Y:Math.round(q[1]*SCALE)})),pieces=[];
 for(const site of sites){const [x0,y0,x1,y1]=item.bounds;let cell=[[x0-1,y0-1],[x1+1,y0-1],[x1+1,y1+1],[x0-1,y1+1]];
  for(const other of sites){if(other===site)continue;const dx=other.point[0]-site.point[0],dy=other.point[1]-site.point[1],d=Math.hypot(dx,dy);if(d<=gap+1e-5)throw Error('Mesh points are too close for the automatic slice gap. Move them farther apart.');const n=[dx/d,dy/d],mid=[(other.point[0]+site.point[0])/2,(other.point[1]+site.point[1])/2];cell=halfPlane(cell,n,mid[0]*n[0]+mid[1]*n[1]-gap/2);if(cell.length<3)break;}
  if(cell.length<3)throw Error('No artwork remains around one mesh point after slicing.');
  const clip=new C.Clipper(),tree=new C.PolyTree();clip.StrictlySimple=true;clip.AddPaths(item.rings.map(toPath),C.PolyType.ptSubject,true);clip.AddPath(toPath(cell),C.PolyType.ptClip,true);clip.Execute(C.ClipType.ctIntersection,tree,C.PolyFillType.pftEvenOdd,C.PolyFillType.pftEvenOdd);
  const regions=C.JS.PolyTreeToExPolygons(tree);if(!regions.length)throw Error('Automatic slice removes an entire piece.');
  let anchorSurvives=false;
  regions.sort((a,b)=>Math.min(...a.outer.map(q=>q.X))-Math.min(...b.outer.map(q=>q.X))||Math.min(...a.outer.map(q=>q.Y))-Math.min(...b.outer.map(q=>q.Y)));
  regions.forEach((r,index)=>{const rings=[r.outer,...r.holes].map(path=>path.map(q=>[q.X/SCALE,q.Y/SCALE])),points=rings.flat(),bounds=points.reduce((b,q)=>[Math.min(b[0],q[0]),Math.min(b[1],q[1]),Math.max(b[2],q[0]),Math.max(b[3],q[1])],[Infinity,Infinity,-Infinity,-Infinity]);const piece={...item,id:`${item.id}_subS${site.t}C${site.b}_${index}`,sourceId:item.id,rings,bounds,point:interior(rings),autoPair:{t:site.t,b:site.b}};anchorSurvives ||= contains(piece,site.point);pieces.push(piece);});
  if(!anchorSurvives)throw Error('A slice would remove a mesh point’s contact area.');
 }
 return pieces;
}
function layout(base,p){return base.flatMap(item=>{const anchors=p.meshAnchors?.[item.id]||[];if(anchors.length<2)return [{...item,sourceId:item.id}];const sites=anchors.map(a=>({...a,point:p.nodes[`${a.t}:${a.b}`]||[3000*a.t/(p.cols+1),2160*a.b/(p.rows+1)]}));if(sites.some(s=>!contains(item,s.point)))throw Error('Saved slice anchor is outside its original island.');return partition(item,sites,(p.sliceGapMm??.1)*3000/p.widthMm);});}
const api={contains,partition,layout};root.AutoSlice=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
