(function(root,factory){if(typeof module==='object'&&module.exports){module.exports=factory(require('./vendor/clipper.js'),require('./project.js'));module.exports.withProject=p=>factory(require('./vendor/clipper.js'),p);}else root.RouterGeometry=factory(root.ClipperLib,root.RouterProject)})(typeof globalThis!=='undefined'?globalThis:this,function(C,P){
'use strict';
const SCALE=1000,EPS_AREA=1/(SCALE*SCALE),ARC=2,PT=C.PolyType,FT=C.PolyFillType.pftNonZero,CT=C.ClipType;
const point=p=>({X:Math.round(p[0]*SCALE),Y:Math.round(p[1]*SCALE)});
function ring(r){return r.map(point)}
function island(i){return i.rings.map(ring)}
function segment(s){return s.islands.flatMap(island)}
function bool(a,b,type,tree=false){const c=new C.Clipper();c.StrictlySimple=true;if(a.length)c.AddPaths(a,PT.ptSubject,true);if(b.length)c.AddPaths(b,PT.ptClip,true);const out=tree?new C.PolyTree():[];c.Execute(type,out,FT,FT);return out}
function union(paths){return bool(paths,[],CT.ctUnion)}
function area(paths){return Math.abs(paths.reduce((sum,p)=>sum+C.Clipper.Area(p),0))/(SCALE*SCALE)}
function bounds(paths){let a=[Infinity,Infinity,-Infinity,-Infinity];for(const p of paths)for(const q of p){a[0]=Math.min(a[0],q.X/SCALE);a[1]=Math.min(a[1],q.Y/SCALE);a[2]=Math.max(a[2],q.X/SCALE);a[3]=Math.max(a[3],q.Y/SCALE)}return a}
function meets(a,b,margin=0){return a[0]<=b[2]+margin&&a[2]+margin>=b[0]&&a[1]<=b[3]+margin&&a[3]+margin>=b[1]}
function offset(paths,d){if(!paths.length)return [];const co=new C.ClipperOffset(2,ARC);co.AddPaths(paths,C.JoinType.jtRound,C.EndType.etClosedPolygon);let out=[];co.Execute(out,d*SCALE);return out}
function trace(t,widthMm){const co=new C.ClipperOffset(2,ARC),r=t.points.map(point);co.AddPath(r,C.JoinType.jtRound,C.EndType.etOpenRound);const out=[];co.Execute(out,t.widthMm/(widthMm/3000)*SCALE/2);return out}
function pad(port,p){const h=p.settings.padSizeMm/(p.settings.widthMm/3000)/2;return [ring([[port.x-h,port.y-h],[port.x+h,port.y-h],[port.x+h,port.y+h],[port.x-h,port.y+h]])]}
function svgPath(paths){return paths.map(r=>'M'+r.map(q=>`${q.X/SCALE},${q.Y/SCALE}`).join(' L')+' Z').join(' ')}
function exPaths(ex){return [ex.outer,...ex.holes]}
function contains(paths,p){let winding=0;for(const r of paths){let k=C.Clipper.PointInPolygon(point(p),r);if(k===-1)return true;if(k===1)winding+=C.Clipper.Orientation(r)?1:-1}return winding!==0}
// Assign only features touched by this trace; inspect every island for competing traces.
// Subtract a physical-width cut, preserving holes and choosing an interior scanline point.
function sliceShape(s,points,width){
 const cut=trace({points,widthMm:width},3000);
 const original=segment(s);
 if(area(bool(original,cut,CT.ctIntersection))<=EPS_AREA)throw Error('The cut does not remove any island area.');
 const pieces=C.JS.PolyTreeToExPolygons(bool(original,cut,CT.ctDifference,true));
 if(!pieces.length)throw Error('The cut removes the entire island. Leave some island area.');
 return pieces.map(ex=>{const paths=exPaths(ex),b=bounds(paths),rings=paths.map(r=>r.map(q=>[q.X/SCALE,q.Y/SCALE]));
 const ys=[...new Set(rings.flatMap(r=>r.map(p=>p[1])))].sort((a,b)=>a-b);let inside=null;
 for(let k=1;k<ys.length&&!inside;k++){const y=(ys[k-1]+ys[k])/2,xs=[];for(const r of rings)for(let i=0;i<r.length;i++){const a=r[i],z=r[(i+1)%r.length];if((a[1]>y)!==(z[1]>y))xs.push(a[0]+(y-a[1])*(z[0]-a[0])/(z[1]-a[1]))}xs.sort((a,b)=>a-b);for(let i=1;i<xs.length;i+=2)if(xs[i]-xs[i-1]>.002){inside=[(xs[i-1]+xs[i])/2,y];break}}
 if(!inside)throw Error('Cut creates a piece too small for the geometry precision. Use a different gap.');
 return {rings,bounds:b,point:inside};
 }).sort((a,b)=>a.bounds[0]-b.bounds[0]||a.bounds[1]-b.bounds[1]);
}
function autoAssignTouched(project,data,changedTrace,options={}){
 const layer=changedTrace.layer,net=changedTrace.net;
 const shape=t=>{const paths=trace(t,project.settings.widthMm);return {paths,bounds:bounds(paths)}};
 const incoming=shape(changedTrace),others=project.traces.filter(t=>t.id!==changedTrace.id&&t.layer===layer&&t.net!==net).map(shape);
 const distance2=(p,a,b)=>{const dx=b.X-a.X,dy=b.Y-a.Y,length=dx*dx+dy*dy;const k=length?Math.max(0,Math.min(1,((p.X-a.X)*dx+(p.Y-a.Y)*dy)/length)):0;return (p.X-a.X-k*dx)**2+(p.Y-a.Y-k*dy)**2};
 const touches=(a,paths,b)=>{
  if(!meets(a.bounds,b,.001))return false;
  if(area(bool(a.paths,paths,CT.ctIntersection))>EPS_AREA)return true;
  // Check boundaries directly: tiny polygon offsets can round away at this precision.
  for(const r of a.paths)for(const q of paths)for(let i=0;i<r.length;i++)for(let j=0;j<q.length;j++){
   const x=r[i],y=r[(i+1)%r.length],u=q[j],v=q[(j+1)%q.length];
   if(Math.max(x.X,y.X)+1<Math.min(u.X,v.X)||Math.max(u.X,v.X)+1<Math.min(x.X,y.X)||Math.max(x.Y,y.Y)+1<Math.min(u.Y,v.Y)||Math.max(u.Y,v.Y)+1<Math.min(x.Y,y.Y))continue;
   if(Math.min(distance2(x,u,v),distance2(y,u,v),distance2(u,x,y),distance2(v,x,y))<=1)return true;
  }
  return false;
 };
 const result={segments:[],pads:[],blockedSegments:[],blockedPads:[]};
 function assign(id,paths,kind){if(kind==='pads'&&options.preservePadNets)return;const b=bounds(paths);if(!touches(incoming,paths,b))return;
  if(others.some(t=>touches(t,paths,b))){result[kind==='segments'?'blockedSegments':'blockedPads'].push(id);return}
  const old=kind==='segments'?project.assignments[id][layer]:project.pads[id];
  if(old!==net){if(kind==='segments')project.assignments[id][layer]=net;else project.pads[id]=net;result[kind].push(id)}
 }
 for(const s of data.segments)assign(s.id,segment(s),'segments');
 for(const p of P.PORTS)if(p.layer===layer)assign(p.id,pad(p,project),'pads');
 return result;
}
// A connection is geometric, not just an edge pad bearing the same name.
function addRoutedTrace(project,data,t){
 const before=build(project,data).netMap[t.layer],source=t.net,stroke=trace(t,project.settings.widthMm),sb=bounds(stroke);
 const touching=paths=>meets(sb,bounds(paths),.001)&&area(bool(offset(stroke,.001),paths,CT.ctIntersection))>EPS_AREA;
 const anchored=name=>{const n=before.get(name);if(!n)return false;const conductors=[...data.segments.filter(s=>project.assignments[s.id][t.layer]===name).flatMap(segment),...project.traces.filter(r=>r.layer===t.layer&&r.net===name).flatMap(r=>trace(r,project.settings.widthMm))];return conductors.length>0&&n.powered.length>0&&area(bool(conductors,n.powered,CT.ctIntersection))>EPS_AREA};
 const oldAnchored=new Map([...before.keys()].map(n=>[n,anchored(n)]));
 const pads=P.PORTS.filter(p=>p.layer===t.layer&&project.pads[p.id]&&touching(pad(p,project)));
 const destinations=new Set(pads.map(p=>project.pads[p.id]));const adopted=[];let conflict=false;
 let target=source;
 if(destinations.size===1){const dest=[...destinations][0];if(dest!==source){if(oldAnchored.get(source))conflict=true;else target=dest}}
 else if(destinations.size>1)conflict=true;
 const foreign=new Set();for(const r of project.traces)if(r.layer===t.layer&&r.net!==target&&touching(trace(r,project.settings.widthMm)))foreign.add(r.net);
 for(const s of data.segments){const n=project.assignments[s.id][t.layer];if(n&&n!==target&&touching(segment(s)))foreign.add(n)}
 project.traces.push(t);
 if(!conflict&&target!==source){P.renameNet(project,t.layer,source,target,{merge:true,preservePads:true});adopted.push(source+' → '+target)}
 const reachesPad=!conflict&&(destinations.size===1||oldAnchored.get(target));
 if(reachesPad)for(const name of foreign)if(name!==source||target===source){if(oldAnchored.get(name)){conflict=true;continue}P.renameNet(project,t.layer,name,target,{merge:true,preservePads:true});adopted.push(name+' → '+target)}
 const result=autoAssignTouched(project,data,t,{preservePadNets:true});return {...result,adopted,connectionConflict:conflict};
}
// Rebuild from geometry on each layer; old net labels never participate.
function reassignFromConnectors(project,data){
 const result={connected:0,floating:0,conflicts:[]};
 project.pads=Object.fromEntries(P.PORTS.map(p=>[p.id,p.id]));
 for(const layer of P.LAYERS){
 const features=[...P.PORTS.filter(p=>p.layer===layer).map(p=>({kind:'pad',id:p.id,paths:pad(p,project)})),...data.segments.map(s=>({kind:'island',id:s.id,paths:segment(s)})),...project.traces.filter(t=>t.layer===layer).map(t=>({kind:'trace',id:t.id,trace:t,paths:trace(t,project.settings.widthMm)}))];
 const parent=features.map((_,i)=>i),root=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i]}return i};
 features.forEach((f,i)=>{f.index=i;f.bounds=bounds(f.paths)});
 const sorted=features.slice().sort((a,b)=>a.bounds[0]-b.bounds[0]);
 for(let i=0;i<sorted.length;i++){const a=sorted[i];let expanded;for(let j=i+1;j<sorted.length;j++){const b=sorted[j];if(b.bounds[0]>a.bounds[2]+.001)break;if(root(a.index)===root(b.index)||!meets(a.bounds,b.bounds,.001))continue;expanded??=offset(a.paths,.001);if(area(bool(expanded,b.paths,CT.ctIntersection))>EPS_AREA)parent[root(b.index)]=root(a.index)}}
 const groups=new Map();features.forEach(f=>{const r=root(f.index);if(!groups.has(r))groups.set(r,[]);groups.get(r).push(f)});
 let floating=0,conflict=0;
 for(const group of groups.values()){const pads=group.filter(f=>f.kind==='pad').map(f=>f.id),conductors=group.filter(f=>f.kind!=='pad');if(!conductors.length)continue;
 const net=pads.length===1?pads[0]:pads.length?'CONFLICT_'+layer+'_'+(++conflict):'FLOAT_'+layer+'_'+(++floating);
 if(pads.length>1)result.conflicts.push({layer,pads,net});else if(pads.length===1)result.connected+=conductors.length;else result.floating+=conductors.length;
 for(const f of conductors)if(f.kind==='trace')f.trace.net=net;else project.assignments[f.id][layer]=net;
 }
 }return result;
}

function build(project,data){const netMap={top:new Map(),bottom:new Map()},byId=new Map(data.segments.map(s=>[s.id,s]));function add(layer,name,paths,feature){if(!name)return;let n=netMap[layer].get(name);if(!n){n={name,layer,raw:[],features:[],pads:[]};netMap[layer].set(name,n)}n.raw.push(...paths);n.features.push(feature);if(feature.type==='pad')n.pads.push(feature.id)}for(const s of data.segments)for(const layer of P.LAYERS){const n=project.assignments[s.id]?.[layer];if(n)add(layer,n,segment(s),{type:'segment',id:s.id})}for(const t of project.traces)add(t.layer,t.net,trace(t,project.settings.widthMm),{type:'trace',id:t.id});for(const [id,name]of Object.entries(project.pads)){const p=P.PORT_BY_ID.get(id);if(p)add(p.layer,name,pad(p,project),{type:'pad',id})}for(const layer of P.LAYERS)for(const n of netMap[layer].values()){const tree=bool(n.raw,[],CT.ctUnion,true);n.components=C.JS.PolyTreeToExPolygons(tree).map(e=>({paths:exPaths(e),bounds:bounds(exPaths(e)),pads:[]}));for(const id of n.pads){const pt=P.PORT_BY_ID.get(id);for(const comp of n.components)if(contains(comp.paths,[pt.x,pt.y]))comp.pads.push(id)}n.paths=n.components.flatMap(c=>c.paths);n.bounds=bounds(n.paths);n.powered=n.components.filter(c=>c.pads.length).flatMap(c=>c.paths)}return {netMap,byId}}
function assignmentStats(project,data){
 let assignedIslands=0;const groups=new Map(),crosses=new Set(),pads={top:new Map(),bottom:new Map()};
 for(const port of P.PORTS){const net=project.pads[port.id];if(!net)continue;const ids=pads[port.layer].get(net)||[];ids.push(port.id);pads[port.layer].set(net,ids)}
 for(const s of data.segments){const a=project.assignments[s.id]||{},id=s.parentId||s.id,t=pads.top.get(a.top),b=pads.bottom.get(a.bottom),assigned=t?.length===1&&b?.length===1;groups.set(id,(groups.get(id)??true)&&assigned);if(assigned){assignedIslands++;crosses.add(t[0]+'|'+b[0])}}
 return {assigned:assignedIslands,assignedCrosses:crosses.size,totalCrosses:P.PORTS.filter(p=>p.layer==='top').length*P.PORTS.filter(p=>p.layer==='bottom').length,assignedOriginalSegments:[...groups.values()].filter(Boolean).length,totalOriginalSegments:groups.size};
}
function check(project,data,progress=()=>{}){const start=Date.now(),issues=[];let seq=0;const add=(code,message,props={})=>{issues.push({id:++seq,code,message,severity:'error',...props})};const pairs=new Map();for(const s of data.segments){let a=project.assignments[s.id]||{};const missing=P.LAYERS.filter(l=>!a[l]);if(missing.length)add('unassigned',`${s.id}: missing ${missing.join(' and ')} net.`,{segments:[s.id],bbox:s.bounds});else{let key=JSON.stringify([a.top,a.bottom]);if(!pairs.has(key))pairs.set(key,[]);pairs.get(key).push(s.id)}}for(const [key,ids]of pairs)if(new Set(ids.map(id=>{const s=data.segments.find(s=>s.id===id);return s.parentId||s.id})).size>1){let [top,bottom]=JSON.parse(key);add('duplicate-pair',`${ids.length} segments share top ${top} / bottom ${bottom}.`,{segments:ids,nets:[top,bottom],bbox:data.segments.find(s=>s.id===ids[0]).bounds})}
progress('Building conductor components');const {netMap,byId}=build(project,data);const connected={};let connectedBoth=0,connectedIslands=0;
for(const s of data.segments){connected[s.id]={};for(const layer of P.LAYERS){const name=project.assignments[s.id]?.[layer];if(!name){connected[s.id][layer]={total:s.islands.length,connected:0};continue}const n=netMap[layer].get(name);let missing=[];for(let i=0;i<s.islands.length;i++){// Each island is one connected filled polygon already included in its net union.
// Test its interior point against pad-connected components; subtracting the
// original polygon from a rounded union can create spurious microscopic slivers.
if(!n?.powered.length||!contains(n.powered,s.islands[i].point))missing.push(i)}connected[s.id][layer]={total:s.islands.length,connected:s.islands.length-missing.length};connectedIslands+=s.islands.length-missing.length;if(missing.length)add('unconnected',`${s.id} ${layer} net ${name}: ${missing.length}/${s.islands.length} islands have no continuous path to an assigned edge pad.`,{segments:[s.id],layer,net:name,islands:missing,bbox:s.bounds,geometry:missing.map(i=>svgPath(island(s.islands[i]))).join(' ')})}if(P.LAYERS.every(l=>connected[s.id][l].connected===s.islands.length))connectedBoth++}
progress('Checking same-layer shorts and clearances');const gap=project.settings.clearanceMm/(project.settings.widthMm/3000);let shortCount=0,clearCount=0;
for(const layer of P.LAYERS){const nets=[...netMap[layer].values()].sort((a,b)=>a.bounds[0]-b.bounds[0]);for(let i=0;i<nets.length;i++){const a=nets[i];let expanded=null,contact=null;for(let j=i+1;j<nets.length;j++){const b=nets[j];if(b.bounds[0]>a.bounds[2]+Math.max(gap,.001))break;if(!meets(a.bounds,b.bounds,Math.max(gap,.001)))continue;let intersection=meets(a.bounds,b.bounds)?bool(a.paths,b.paths,CT.ctIntersection):[];if(area(intersection)>EPS_AREA){shortCount++;add('short',`${layer}: nets ${a.name} and ${b.name} overlap.`,{layer,nets:[a.name,b.name],bbox:bounds(intersection),geometry:svgPath(intersection)});continue}if(!contact)contact=offset(a.paths,.001);const touching=bool(contact,b.paths,CT.ctIntersection);if(area(touching)>EPS_AREA){shortCount++;add('short',`${layer}: nets ${a.name} and ${b.name} touch or are within 0.001 source units.`,{layer,nets:[a.name,b.name],bbox:bounds(touching),geometry:svgPath(touching)});continue}if(gap>0){if(!expanded)expanded=offset(a.paths,gap);const clash=bool(expanded,b.paths,CT.ctIntersection);if(area(clash)>EPS_AREA){clearCount++;add('clearance',`${layer}: nets ${a.name} and ${b.name} violate ${project.settings.clearanceMm} mm clearance.`,{layer,nets:[a.name,b.name],bbox:bounds(clash),geometry:svgPath(clash)})}}}}
 for(const n of nets)for(const comp of n.components)if(!comp.pads.length&&!n.features.some(f=>f.type==='segment'&&byId.get(f.id).islands.some(i=>meets(comp.bounds,i.bounds)&&contains(comp.paths,i.point))))add('floating-trace',`${layer} net ${n.name} has a conductor component without an edge pad.`,{layer,net:n.name,bbox:comp.bounds,geometry:svgPath(comp.paths),severity:'warning'});
}
progress('Checking top/bottom overlap inside the display');const top=union([...netMap.top.values()].flatMap(n=>n.paths)),bottom=union([...netMap.bottom.values()].flatMap(n=>n.paths)),art=union([...data.segments.flatMap(segment),...(project.wantedOverlaps||[]).map(b=>ring([[b[0],b[1]],[b[2],b[1]],[b[2],b[3]],[b[0],b[3]]]))]);const overlap=bool(top,bottom,CT.ctIntersection),unwanted=bool(bool(overlap,art,CT.ctDifference),[ring([[0,0],[3000,0],[3000,2160],[0,2160]])],CT.ctIntersection);let outsideArea=0;if(area(unwanted)>EPS_AREA){const pieces=C.JS.PolyTreeToExPolygons(bool(unwanted,[],CT.ctUnion,true));for(const ex of pieces){const paths=exPaths(ex),pieceArea=area(paths);if(pieceArea*(project.settings.widthMm/3000)**2<.0001)continue;outsideArea+=pieceArea;add('unwanted-overlap',`Top/bottom overlap inside the display, outside a segment: ${(area(paths)*(project.settings.widthMm/3000)**2).toFixed(5)} mm².`,{bbox:bounds(paths),geometry:svgPath(paths)})}}
// Opposite-layer separation is checked only outside intended display overlaps.
const crossGap=.1/(project.settings.widthMm/3000),display=[ring([[0,0],[3000,0],[3000,2160],[0,2160]])];
const near=bool(bool(bool(offset(top,crossGap),bottom,CT.ctIntersection),art,CT.ctDifference),display,CT.ctIntersection);
const crossClearance=area(near)*(project.settings.widthMm/3000)**2;
if(crossClearance>.0001)add('cross-clearance','Opposite-layer conductors violate 0.10 mm separation outside intended overlap areas.',{geometry:svgPath(near),bbox:bounds(near)});
const errorCount=issues.filter(i=>i.severity==='error').length;
return {checkedAt:new Date().toISOString(),durationMs:Date.now()-start,ok:errorCount===0,summary:{...assignmentStats(project,data),segments:data.segments.length,connectedBoth,connectedIslandSides:connectedIslands,totalIslandSides:data.segments.reduce((n,s)=>n+2*s.islands.length,0),usedPads:Object.keys(project.pads).length,topNets:netMap.top.size,bottomNets:netMap.bottom.size,traces:project.traces.length,errors:errorCount,warnings:issues.length-errorCount,shorts:shortCount,crossClearanceMm2:crossClearance,clearanceViolations:clearCount,unwantedOverlapMm2:outsideArea*(project.settings.widthMm/3000)**2},connected,issues,precision:{coordinateUnit:1/SCALE,arcToleranceNative:ARC/SCALE,touchToleranceNative:.001,unwantedOverlapMinMm2:.0001},scope:'Geometric checks only. No fringing, material response, ITO resistance, contact assembly, manufacturing tolerances or minimum neck-width analysis.'};}
function exportSVG(project,data,layer){const {netMap}=build(project,data),mm=project.settings.widthMm/3000;const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));let all=[...netMap[layer].values()].flatMap(n=>n.paths),b=all.length?bounds(all):[-150,-150,3150,2310];b=[Math.min(-150,b[0]-10),Math.min(-150,b[1]-10),Math.max(3150,b[2]+10),Math.max(2310,b[3]+10)];return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${b[0]} ${b[1]} ${b[2]-b[0]} ${b[3]-b[1]}" width="${(b[2]-b[0])*mm}mm" height="${(b[3]-b[1])*mm}mm"><title>${esc(project.name)} — ${layer}, registered front view</title><desc>Draft conductor geometry. Source canvas origin 0,0; original canvas ${project.settings.widthMm} x ${project.settings.widthMm*.72} mm. Validate before fabrication.</desc>${[...netMap[layer].values()].map(n=>`<path id="${layer}_${esc(n.name)}" data-net="${esc(n.name)}" fill="black" fill-rule="nonzero" d="${svgPath(n.paths)}"/>`).join('')}</svg>`}
return {assignmentStats,reassignFromConnectors,sliceShape,SCALE,EPS_AREA,CT,ring,island,segment,bool,union,area,bounds,meets,offset,trace,pad,svgPath,contains,autoAssignTouched,addRoutedTrace,build,check,exportSVG};
});
