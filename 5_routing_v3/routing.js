'use strict';
(function(root){
const C=typeof module!=='undefined'?require('../2_refine_routing/vendor/clipper.js'):root.ClipperLib;
const S=typeof module!=='undefined'?require('./auto-slice.js'):root.AutoSlice;
const scale=1000,copy=x=>JSON.parse(JSON.stringify(x)),dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const paths=rings=>rings.map(r=>r.map(p=>({X:Math.round(p[0]*scale),Y:Math.round(p[1]*scale)})));
function boolean(a,b,op){const c=new C.Clipper(),tree=new C.PolyTree();c.AddPaths(a,C.PolyType.ptSubject,true);c.AddPaths(b,C.PolyType.ptClip,true);c.Execute(op,tree,C.PolyFillType.pftEvenOdd,C.PolyFillType.pftNonZero);return tree;}
function offset(ps,amount,open=false){const o=new C.ClipperOffset(2,.01*scale),out=[];o.AddPaths(ps,C.JoinType.jtRound,open?C.EndType.etOpenRound:C.EndType.etClosedPolygon);o.Execute(out,amount*scale);return out;}
function regions(tree){return C.JS.PolyTreeToExPolygons(tree).map(r=>[r.outer,...r.holes].map(p=>p.map(q=>[q.X/scale,q.Y/scale])));}
const area=rings=>Math.abs(rings.reduce((sum,r)=>sum+C.Clipper.Area(paths([r])[0]),0))/(scale*scale);
function shape(item,rings){const q=rings.flat();return {...item,rings,bounds:[Math.min(...q.map(p=>p[0])),Math.min(...q.map(p=>p[1])),Math.max(...q.map(p=>p[0])),Math.max(...q.map(p=>p[1]))]};}
function pd(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],f=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));return dist(p,[a[0]+f*dx,a[1]+f*dy]);}
function sd(a,b,c,d){const cross=(p,q,r)=>(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]);if(cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0)return 0;return Math.min(pd(a,c,d),pd(b,c,d),pd(c,a,b),pd(d,a,b));}
function inside(item,p){let on=false;for(const r of item.rings)for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])on=!on;}return on;}
function collides(item,a,b,r){const z=item.bounds;if(Math.max(a[0],b[0])+r<z[0]||Math.min(a[0],b[0])-r>z[2]||Math.max(a[1],b[1])+r<z[1]||Math.min(a[1],b[1])-r>z[3])return false;if(inside(item,a)||inside(item,b))return true;for(const ring of item.rings)for(let i=0;i<ring.length;i++)if(sd(a,b,ring[i],ring[(i+1)%ring.length])<r-1e-5)return true;return false;}
function net(p,id,layer){return p.assignments[id]?.[layer==='SEG'?'t':'b']??(p.detachedAssignments?.[id]?`floating:${p.detachedAssignments[id].group}:${layer}`:undefined);}
function common(p,a,b){return ['SEG','COM'].filter(l=>net(p,a,l)!==undefined&&net(p,a,l)===net(p,b,l));}
function checkMeta(p,items,r){if(!['SEG','COM'].includes(r.layer)||!common(p,r.from,r.to).includes(r.layer)||net(p,r.from,r.layer)!==r.net||r.from===r.to)throw Error('Endpoints must be different assigned pieces sharing the selected net.');for(const [label,v,min,max]of [['Trace width',r.widthMm,.02,2],['Same-layer clearance',r.clearanceMm,.01,2],['Maximum inward movement',r.pushMm,0,10],['SEG ↔ COM trace clearance',r.crossClearanceMm??0,0,2]])if(!Number.isFinite(v)||v<min||v>max)throw Error(`${label}: ${Number.isFinite(v)?v+' mm':'missing or invalid number'}. Enter a value from ${min} to ${max} mm.`);if(!Array.isArray(r.points)||r.points.length<2||r.points.length>2048||r.points.some(q=>!Array.isArray(q)||q.length!==2||q.some(n=>!Number.isFinite(n))))throw Error('Invalid trace path.');const a=items.find(i=>i.id===r.from),b=items.find(i=>i.id===r.to);if(!a||!b||!S.contains(a,r.points[0])||!S.contains(b,r.points.at(-1)))throw Error('Trace endpoint has lost its artwork contact.');}
// Split at every artwork boundary, including holes and concave re-entry.
// Inside same-net artwork only the physical trace width is checked.
function spans(a,b,artwork){const dx=b[0]-a[0],dy=b[1]-a[1],ts=[0,1];for(const item of artwork){const z=item.bounds;if(Math.max(a[0],b[0])<z[0]||Math.min(a[0],b[0])>z[2]||Math.max(a[1],b[1])<z[1]||Math.min(a[1],b[1])>z[3])continue;for(const ring of item.rings)for(let j=0;j<ring.length;j++){const c=ring[j],d=ring[(j+1)%ring.length],ex=d[0]-c[0],ey=d[1]-c[1],den=dx*ey-dy*ex;if(Math.abs(den)<1e-10)continue;const t=((c[0]-a[0])*ey-(c[1]-a[1])*ex)/den,u=((c[0]-a[0])*dy-(c[1]-a[1])*dx)/den;if(t>0&&t<1&&u>=0&&u<=1)ts.push(t);}}ts.sort((x,y)=>x-y);const out=[];for(let j=1;j<ts.length;j++){if(ts[j]-ts[j-1]<1e-9)continue;const point=t=>[a[0]+t*dx,a[1]+t*dy],mid=point((ts[j]+ts[j-1])/2);const insideIds=artwork.filter(i=>inside(i,mid)).map(i=>i.id);out.push({a:point(ts[j-1]),b:point(ts[j]),inside:insideIds.length>0,insideIds});}return out;}
function checker(p,items,r,previous,traceOnly=false){const unit=3000/p.widthMm,half=r.widthMm/2*unit,own=items.filter(i=>net(p,i.id,r.layer)===r.net),obstacles=items.filter(i=>net(p,i.id,r.layer)!==r.net);const oldPaths=previous.map(old=>({old,parts:old.points.slice(1).flatMap((b,j)=>spans(old.points[j],b,items.filter(i=>net(p,i.id,old.layer)===old.net)))}));return (a,b)=>{if([a,b].some(q=>q[0]<half||q[0]>3000-half||q[1]<half||q[1]>2160-half))return false;for(const part of spans(a,b,own)){const radius=half+(part.inside?0:r.clearanceMm*unit);if(!traceOnly)for(const i of obstacles)if(collides(i,part.a,part.b,radius))return false;for(const {old,parts} of oldPaths){const sameLayer=old.layer===r.layer,crossGap=Math.max(r.crossClearanceMm??0,old.crossClearanceMm??0);if(sameLayer?old.net===r.net:crossGap===0)continue;for(const other of parts){if(!sameLayer&&(part.inside||other.inside))continue;const clearance=sameLayer?Math.max(part.inside?0:r.clearanceMm,other.inside?0:old.clearanceMm):(part.inside&&other.inside?0:crossGap);const gap=(r.widthMm/2+old.widthMm/2+clearance)*unit;if(sd(part.a,part.b,other.a,other.b)<gap-1e-5)return false;}}}return true;};}
function applyOneRaw(p,items,r,previous){checkMeta(p,items,r);const unit=3000/p.widthMm,margin=(r.widthMm/2+r.clearanceMm)*unit;
 let changed=[];
 const own=items.filter(i=>net(p,i.id,r.layer)===r.net),parts=r.points.slice(1).flatMap((b,j)=>spans(r.points[j],b,own)).map(part=>({...part,radius:(r.widthMm/2+(part.inside?0:r.clearanceMm))*unit}));
 const corridor=r.pushMm>0?parts.flatMap(part=>offset(paths([[part.a,part.b]]),part.radius+.03,true)):[];
 const next=items.map(item=>{if(net(p,item.id,r.layer)===r.net||!parts.some(part=>collides(item,part.a,part.b,part.radius)))return item;
 if(!r.pushMm)throw Error('Trace violates artwork clearance.');
 const original=paths(item.rings),core=offset(original,-r.pushMm*unit);
 // An empty erosion core means the entire piece is within the allowed depth.
 // The remaining-area, topology, and contact checks below still protect it.
 if(core.length&&regions(boolean(core,corridor,C.ClipType.ctIntersection)).length)throw Error(`Passage at ${item.id} needs more inward movement than the ${r.pushMm} mm push limit.`);
 const out=regions(boolean(original,corridor,C.ClipType.ctDifference));
 const assigned=p.assignments[item.id],label=item.id+(assigned?` (S${assigned.t}/C${assigned.b})`:'');
 if(!out.length)throw Error(`Push would erase ${label}. Move the path outside this artwork.`);
 // Keep the largest component. The total area limit below counts both the
 // corridor cut and every discarded fragment, so only small scraps can vanish.
 if(out.length>1){out.sort((a,b)=>area(b)-area(a));out.splice(1);}
 if(out[0].length!==item.rings.length)throw Error(`Push would change the holes in ${label} (${item.rings.length-1} → ${out[0].length-1}). Move the path away from the hole boundary.`);
 const removed=100*(1-area(out[0])/area(item.rings));
 if(removed>20+1e-9)throw Error(`Push would excessively shrink ${label}: remove ${removed.toFixed(1)}% of its area (maximum 20%). The inward-depth limit does not override this area limit.`);
 const result=shape(item,out[0]);
 for(const trace of [...(p.routes||[]),...previous])for(const [id,q]of [[trace.from,trace.points[0]],[trace.to,trace.points.at(-1)]])if(id===item.id&&!S.contains(result,q))throw Error(`Push would remove a trace contact on ${label}; that fragment cannot be discarded.`);
 for(const a of p.meshAnchors?.[item.sourceId]||[]){const q=p.nodes[`${a.t}:${a.b}`]||[3000*a.t/(p.cols+1),2160*a.b/(p.rows+1)];if(S.contains(item,q)&&!S.contains(result,q))throw Error('Push would remove a mesh contact.');}
 changed.push(item.id);return result;});
 const clear=checker(p,next,r,previous);for(let j=1;j<r.points.length;j++)if(!clear(r.points[j-1],r.points[j]))throw Error('Trace fails clearance or screen boundary check.');
 return {items:next,changed};
}
// Reuse exact results only when every input in the trace's influence area matches.
// Wide bounds include both trace radii and the largest supported clearance.
let fullValidation=false;
const pushCache=new Map(),clearCache=new Map();
function remember(cache,key,value){if(cache.size>=256)cache.delete(cache.keys().next().value);cache.set(key,value);return value;}
function localContext(p,items,r,previous){
 const pad=Math.max(6,r.widthMm+2*Math.max(r.clearanceMm,r.crossClearanceMm||0))*3000/p.widthMm;
 const xs=r.points.map(q=>q[0]),ys=r.points.map(q=>q[1]),box=[Math.min(...xs)-pad,Math.min(...ys)-pad,Math.max(...xs)+pad,Math.max(...ys)+pad];
 const meets=b=>b[0]<=box[2]&&b[2]>=box[0]&&b[1]<=box[3]&&b[3]>=box[1];
 const nearby=items.filter(i=>meets(i.bounds)),ids=new Set(nearby.map(i=>i.id)),sources=new Set(nearby.map(i=>i.sourceId));
 const traces=previous.filter(t=>{const x=t.points.map(q=>q[0]),y=t.points.map(q=>q[1]);return meets([Math.min(...x),Math.min(...y),Math.max(...x),Math.max(...y)]);});
 const assignments=Object.fromEntries(Object.entries(p.assignments).filter(([id])=>ids.has(id)));
 const meshAnchors=Object.fromEntries(Object.entries(p.meshAnchors||{}).filter(([id])=>sources.has(id)));
 const nodes={};for(const sites of Object.values(meshAnchors))for(const a of sites){const k=`${a.t}:${a.b}`;if(p.nodes[k])nodes[k]=p.nodes[k];}
 const contacts=(p.routes||[]).filter(t=>ids.has(t.from)||ids.has(t.to)).map(t=>({from:t.from,to:t.to,points:[t.points[0],t.points.at(-1)]}));
 const key=JSON.stringify([p.widthMm,p.cols,p.rows,assignments,p.detachedAssignments,meshAnchors,nodes,contacts,nearby,r,traces]);
 return {nearby,traces,key};
}
function applyOne(p,items,r,previous){
 if(fullValidation)return applyOneRaw(p,items,r,previous);
 checkMeta(p,items,r);
 const local=localContext(p,items,r,previous);let result=pushCache.get(local.key);
 if(!result){const checked=applyOneRaw(p,local.nearby,r,local.traces);result=remember(pushCache,local.key,{changed:checked.changed,items:checked.items.filter(i=>checked.changed.includes(i.id))});}
 const replacements=new Map(result.items.map(i=>[i.id,i]));return {changed:[...result.changed],items:items.map(i=>replacements.has(i.id)?copy(replacements.get(i.id)):i)};
}
function checkFinal(p,items,r,previous){
 checkMeta(p,items,r);
 const local=fullValidation?{nearby:items,traces:previous,key:null}:localContext(p,items,r,previous);
 if(!fullValidation&&clearCache.has(local.key))return;
 const clear=checker(p,local.nearby,r,local.traces);for(let j=1;j<r.points.length;j++)if(!clear(r.points[j-1],r.points[j]))throw Error('Final artwork changes violate an existing trace clearance.');
 if(!fullValidation)remember(clearCache,local.key,true);
}
function fullCheck(p,items){const old=fullValidation;fullValidation=true;try{return apply(p,items);}finally{fullValidation=old;}}
function apply(p,items){let current=items;const previous=[];if(!Array.isArray(p.routes||[])||(p.routes||[]).length>500)throw Error('Invalid saved routes.');for(const r of p.routes||[]){current=applyOne(p,current,r,previous).items;previous.push(r);}for(let index=0;index<previous.length;index++){const r=previous[index];checkFinal(p,current,r,previous.slice(0,index));}return current;}
// Bounded 8-direction A*, followed by exact segment-clearance shortcuts.
function search(start,end,clear,step){if(clear(start,end))return [start,end];const nx=Math.ceil(3000/step)+1,ny=Math.ceil(2160/step)+1,key=(x,y)=>y*nx+x,point=k=>[(k%nx)*step,Math.floor(k/nx)*step];const heap=[],cost=new Map(),parent=new Map();
 const push=e=>{heap.push(e);let i=heap.length-1;while(i){const j=(i-1)>>1;if(heap[j].f<=e.f)break;heap[i]=heap[j];i=j;}heap[i]=e;};
 const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){let i=0;while(2*i+1<heap.length){let j=2*i+1;if(j+1<heap.length&&heap[j+1].f<heap[j].f)j++;if(heap[j].f>=last.f)break;heap[i]=heap[j];i=j;}heap[i]=last;}return top;};
 const sx=Math.round(start[0]/step),sy=Math.round(start[1]/step);for(let y=sy-2;y<=sy+2;y++)for(let x=sx-2;x<=sx+2;x++){if(x<0||y<0||x>=nx||y>=ny)continue;const k=key(x,y),q=point(k);if(clear(start,q)){const g=dist(start,q);cost.set(k,g);parent.set(k,-1);push({k,g,f:g+dist(q,end)});}}
 let explored=0;while(heap.length&&explored++<70000){const cur=pop();if(cur.g!==cost.get(cur.k))continue;const a=point(cur.k);if(dist(a,end)<step*3&&clear(a,end)){const out=[end];let k=cur.k;while(k!==-1){out.push(point(k));k=parent.get(k);}out.push(start);out.reverse();const simple=[out[0]];for(let i=0;i<out.length-1;){let j=out.length-1;while(j>i+1&&!clear(out[i],out[j]))j--;simple.push(out[j]);i=j;}return simple;}
 for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const x=cur.k%nx+dx,y=Math.floor(cur.k/nx)+dy;if(x<0||x>=nx||y<0||y>=ny)continue;const k=key(x,y),b=point(k),g=cur.g+dist(a,b);if(g>=(cost.get(k)??Infinity)||!clear(a,b))continue;cost.set(k,g);parent.set(k,cur.k);push({k,g,f:g+dist(b,end)});}}
 throw Error('No path found at this search resolution. Try another waypoint or enable bounded push.');}
function planRoute(p,items,request,restriction=null,searchStep=null){const r=copy(request),waypoints=r.waypoints||[];delete r.waypoints;delete r.pushTraces;delete r.traceMoveMm;r.net=net(p,r.from,r.layer);checkMeta(p,items,r);if(waypoints.length>32||waypoints.some(q=>q.length!==2||q.some(n=>!Number.isFinite(n))))throw Error('Invalid route waypoints.');const stops=[r.points[0],...waypoints,r.points.at(-1)],unit=3000/p.widthMm;
 const manual=r.manual;delete r.manual;if(manual){r.points=stops;const result=applyOne(p,items,r,p.routes||[]);for(const old of [...(p.routes||[]),r])checkMeta(p,result.items,old);return {route:r,...result};}
 const run=push=>{let searchItems=items;if(push)searchItems=items.flatMap(i=>{if(net(p,i.id,r.layer)===r.net)return [i];const ps=offset(paths(i.rings),-r.pushMm*unit);if(!ps.length)return [i];const tree=boolean(ps,[],C.ClipType.ctUnion);return regions(tree).map(rs=>shape(i,rs));});const check=checker(p,searchItems,r,p.routes||[]),clear=(a,b)=>check(a,b)&&(!restriction||restriction(a,b));let points=[];for(let j=1;j<stops.length;j++){let section;try{section=search(stops[j-1],stops[j],clear,searchStep||Math.max(6,Math.min(16,(r.widthMm/2+r.clearanceMm)*unit)));}catch(error){const blocked=items.filter(i=>net(p,i.id,r.layer)!==r.net&&S.contains(i,stops[j]));const detail=blocked.length?` Waypoint lies inside ${blocked.map(i=>i.id+' ('+(net(p,i.id,r.layer)===undefined?'unassigned':r.layer+' '+net(p,i.id,r.layer))+')').join(', ')}; requested trace is ${r.layer} ${r.net}. Move the waypoint into a clear passage; push must preserve artwork and contacts.`:'';throw Error(error.message+detail+` Leg ${j}: (${(stops[j-1][0]/unit).toFixed(2)}, ${(stops[j-1][1]/unit).toFixed(2)}) → (${(stops[j][0]/unit).toFixed(2)}, ${(stops[j][1]/unit).toFixed(2)}) mm.`);}points.push(...section.slice(j===1?0:1));}r.points=points;const result=applyOne(p,items,r,p.routes||[]);const all=[...(p.routes||[]),r];for(const old of all)checkMeta(p,result.items,old);return {route:r,items:result.items,changed:result.changed};};
 try{return run(false);}catch(e){if(!r.pushMm)throw e;
 // The coarse eroded search can miss a shallow, valid straight corridor.
 // Check the exact requested legs against real geometry before grid detours.
 try{if(restriction&&stops.slice(1).some((q,j)=>!restriction(stops[j],q)))throw e;r.points=stops;const result=applyOne(p,items,r,p.routes||[]);for(const old of [...(p.routes||[]),r])checkMeta(p,result.items,old);return {route:r,...result};}catch{}
 return run(true);}}
// Restrict a displaced trace to a physical corridor around its original path.
// Segment coverage is checked against the corridor, not just its vertices.
function movementCorridor(route,amount){const rings=offset(paths([route.points]),amount-.03,true).map(path=>path.map(q=>[q.X/scale,q.Y/scale]));if(!rings.length)throw Error('Trace movement limit is too small.');const region=shape({id:'movement'},rings);return (a,b)=>spans(a,b,[region]).every(part=>part.inside);}
function routeConflict(p,items,a,b){const clear=checker(p,items,a,[b],true);return a.points.slice(1).some((point,j)=>!clear(a.points[j],point));}
function plan(p,items,request,baseItems=null){
 if(request.editIndex!==undefined)return edit(p,items,request,baseItems);
 try{return planRoute(p,items,request);}catch(initial){
  if(!request.pushTraces)throw initial;
  if(!baseItems)throw Error('Original slice geometry is required for trace push.');
  if(!Number.isFinite(request.traceMoveMm)||request.traceMoveMm<.01||request.traceMoveMm>2)throw Error('Use a trace movement limit between 0.01 and 2 mm.');
  const original=p.routes||[];
  // First reserve the requested path, then move only traces that obstruct it.
  let candidate;const direct={...copy(request),net:net(p,request.from,request.layer),points:[request.points[0],...(request.waypoints||[]),request.points.at(-1)]};delete direct.waypoints;delete direct.pushTraces;delete direct.traceMoveMm;delete direct.manual;try{const proposal=applyOne(p,items,direct,[]);candidate={route:direct,...proposal};}catch{candidate=planRoute({...p,routes:[]},items,request);}const blocked=original.map((old,index)=>routeConflict(p,candidate.items,candidate.route,old)?index:-1).filter(i=>i>=0);
  if(!blocked.length)throw initial;
  if(blocked.length>8)throw Error('This path blocks more than eight traces. Use waypoints to choose a smaller passage.');
  let lastError=initial;
  for(const order of [blocked,[...blocked].reverse()]){
   const replacements=new Map();let working=candidate.items;
   try{
    for(const index of order){const old=original[index],fixed=[candidate.route,...original.filter((r,i)=>!blocked.includes(i)),...replacements.values()],limit=movementCorridor(old,request.traceMoveMm*3000/p.widthMm),reroute={...old,pushMm:Math.max(old.pushMm,request.pushMm),points:[old.points[0],old.points.at(-1)]};
     const pinCheck=checker(p,working,reroute,fixed,true);reroute.waypoints=old.points.slice(1,-1).filter(q=>pinCheck(q,q));
     let result,error;for(const step of [6,3,1.5]){try{result=planRoute({...p,routes:fixed},working,reroute,limit,step);break;}catch(e){error=e;}}
     if(!result)throw Error(`Cannot move ${old.layer} ${old.net} (route ${index+1}) within ${request.traceMoveMm} mm: ${error.message}`);
     replacements.set(index,result.route);working=result.items;
    }
    const routes=original.map((r,i)=>replacements.get(i)||copy(r)).concat(candidate.route),finalItems=apply({...p,routes},baseItems);
    // Later trimming can expose formerly internal trace sections: validate final geometry.
    const changed=finalItems.filter(i=>JSON.stringify(i.rings)!==JSON.stringify(items.find(old=>old.id===i.id)?.rings)).map(i=>i.id);
    return {route:candidate.route,routes,items:finalItems,changed,movedRoutes:blocked.map(index=>({index,before:copy(original[index]),after:replacements.get(index)}))};
   }catch(e){lastError=e;}
  }
  throw Error('Trace push could not find a valid arrangement. '+lastError.message);
 }
}
// Replace a route in place and rebuild artwork from the original slice geometry.
// Do not retain cuts made by the old version of the trace.
function edit(p,items,request,baseItems){const index=request.editIndex,old=p.routes?.[index];if(!Number.isInteger(index)||!old||!baseItems)throw Error('Select a saved trace to edit.');if(request.from!==old.from||request.to!==old.to||request.layer!==old.layer)throw Error('Editing keeps the original artwork pieces and net fixed.');const other=p.routes.filter((r,i)=>i!==index),working={...p,routes:other},next=copy(request);delete next.editIndex;
 const restored=apply(working,baseItems),result=plan(working,restored,next,baseItems),proposed=result.routes||[...other,result.route],replacement=proposed.at(-1),routes=proposed.slice(0,-1);routes.splice(index,0,replacement);
 const finalItems=apply({...p,routes},baseItems),changed=finalItems.filter(i=>JSON.stringify(i.rings)!==JSON.stringify(items.find(old=>old.id===i.id)?.rings)).map(i=>i.id),restoredIds=finalItems.filter(i=>{const before=items.find(old=>old.id===i.id);return before&&changed.includes(i.id)&&regions(boolean(paths(i.rings),paths(before.rings),C.ClipType.ctDifference)).some(rings=>area(rings)>1e-5);}).map(i=>i.id);
 return {...result,route:replacement,routes,items:finalItems,changed,restoredIds,editIndex:index,movedRoutes:(result.movedRoutes||[]).map(m=>({...m,index:m.index>=index?m.index+1:m.index}))};
}
// Diagnostic overlay only: validity still comes from the exact route validator.
function diagnose(p,items,request){
 const r={...request,net:net(p,request.from,request.layer),points:[request.points[0],...(request.waypoints||[]),request.points.at(-1)]};
 if(!Number.isFinite(r.widthMm)||!Number.isFinite(r.clearanceMm)||r.points.some(q=>!q||q.some(v=>!Number.isFinite(v))))return [];
 const previous=(p.routes||[]).filter((_,i)=>i!==request.editIndex),local=localContext(p,items,r,previous),clear=checker(p,local.nearby,r,local.traces),issues=[],tolerance=.05*3000/p.widthMm;
 function locate(a,b,leg,depth=0){if(clear(a,b))return;if(dist(a,b)<=tolerance||depth>=12){const last=issues.at(-1);if(last?.leg===leg&&dist(last.b,a)<1e-7)last.b=b;else issues.push({a,b,leg});return;}const mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];locate(a,mid,leg,depth+1);locate(mid,b,leg,depth+1);}
 for(let j=1;j<r.points.length;j++)locate(r.points[j-1],r.points[j],j);
 return issues;
}
const api={diagnose,fullCheck,common,plan,apply,checkMeta,collides,spans};root.TraceRouting=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
