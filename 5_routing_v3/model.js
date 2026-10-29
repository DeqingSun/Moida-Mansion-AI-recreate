'use strict';
(function(root){
const S=typeof module!=='undefined'?require('./auto-slice.js'):root.AutoSlice;
const R=typeof module!=='undefined'?require('./routing.js'):root.TraceRouting;
const G=typeof module!=='undefined'?require('./shape.js'):root.ShapeEdit;
const clone=x=>JSON.parse(JSON.stringify(x));
function artwork(data,p){const base=data.segments.flatMap(s=>s.islands.map((is,i)=>({id:`${s.id}_${i}`,parentId:s.id,bit:s.bit,rings:is.rings,bounds:is.bounds,point:is.point,sourceId:`${s.id}_${i}`})));return p?R.apply(p,S.layout(G.apply(base,p),p)):base;}
function dimensions(cols,rows,widthMm){if(!Number.isInteger(cols)||cols<1||cols>128||!Number.isInteger(rows)||rows<1||rows>64||cols*rows>8192)throw Error('Use 1–128 SEG nets and 1–64 COM nets (at most 8,192 pairs).');if(!Number.isFinite(widthMm)||widthMm<10||widthMm>2000)throw Error('Screen width must be 10–2,000 mm.');}
const key=(t,b)=>`${t}:${b}`;
function regular(t,b,cols,rows){return [3000*t/(cols+1),2160*b/(rows+1)];}
function create(data,cols=60,rows=16,widthMm=75){dimensions(cols,rows,widthMm);return {format:'moida-mesh-v3',version:3,sourceHash:data.sourceHash,widthMm,cols,rows,nodes:{},bends:{},assignments:{},meshAnchors:{},sliceGapMm:.1};}
function position(p,t,b){return p.nodes[key(t,b)]||regular(t,b,p.cols,p.rows);}
const edgeKey=(t,b,u,v)=>`${t}:${b}>${u}:${v}`;
function edgePath(p,t,b,u,v){return [position(p,t,b),...(p.bends?.[edgeKey(t,b,u,v)]||[]),position(p,u,v)];}
function meshEdges(p){const result=[];for(let t=1;t<=p.cols;t++)for(let b=1;b<=p.rows;b++){
 for(const [u,v]of [[t+1,b],[t,b+1]])if(u<=p.cols&&v<=p.rows)result.push({key:edgeKey(t,b,u,v),ids:[key(t,b),key(u,v)],points:edgePath(p,t,b,u,v)});
 }return result;}
// Presentation only: keep the complete mesh for deformation and topology checks.
function routedMeshEdges(p){const hidden=new Set();for(const r of p.routes||[]){const a=p.assignments[r.from],b=p.assignments[r.to];if(!a||!b)continue;if(r.layer==='SEG'&&a.t===b.t&&a.t===r.net){for(let row=Math.min(a.b,b.b);row<Math.max(a.b,b.b);row++)hidden.add(edgeKey(a.t,row,a.t,row+1));}else if(r.layer==='COM'&&a.b===b.b&&a.b===r.net){for(let col=Math.min(a.t,b.t);col<Math.max(a.t,b.t);col++)hidden.add(edgeKey(col,a.b,col+1,a.b));}}return hidden;}
function cellRing(p,t,b){return [edgePath(p,t,b,t+1,b),edgePath(p,t+1,b,t+1,b+1),edgePath(p,t,b+1,t+1,b+1).reverse(),edgePath(p,t,b,t,b+1).reverse()].flatMap(path=>path.slice(0,-1));}
function pair(p,t,b){if(!Number.isInteger(t)||t<1||t>p.cols||!Number.isInteger(b)||b<1||b>p.rows)throw Error('Pair is outside the current mesh.');}
function assign(p,items,ids,t,b,transfer=false){pair(p,t,b);const byId=new Map(items.map(i=>[i.id,i]));if(!ids.length||ids.some(id=>!byId.has(id)))throw Error('Select an artwork island first.');const parents=new Set(ids.map(id=>byId.get(id).parentId));if(parents.size!==1)throw Error('One electrical pair can belong to only one original segment.');for(const [id,a]of Object.entries(p.assignments))if(a.t===t&&a.b===b&&!parents.has(byId.get(id).parentId)){if(transfer)delete p.assignments[id];else throw Error(`SEG ${t} / COM ${b} already belongs to ${byId.get(id).parentId}.`);}for(const id of ids){p.assignments[id]={t,b};if(p.detachedAssignments)delete p.detachedAssignments[id];}return p;}
function resize(p,cols,rows,widthMm){dimensions(cols,rows,widthMm);if(Object.values(p.assignments).some(a=>a.t>cols||a.b>rows))throw Error('This mesh size would remove assigned nets. Clear or reassign those islands first.');const next=clone(p);next.cols=cols;next.rows=rows;next.widthMm=widthMm;for(const k of Object.keys(next.nodes)){const [t,b]=k.split(':').map(Number);if(t>cols||b>rows)delete next.nodes[k];}const validEdges=new Set(meshEdges(next).map(e=>e.key));for(const k of Object.keys(next.bends||{}))if(!validEdges.has(k))delete next.bends[k];return next;}
function validate(raw,data){if(!raw||raw.format!=='moida-mesh-v3'||![1,2,3].includes(raw.version)||raw.sourceHash!==data.sourceHash)throw Error('Load a v3 mesh project made from this original artwork.');dimensions(raw.cols,raw.rows,raw.widthMm);const p=create(data,raw.cols,raw.rows,raw.widthMm);if(!raw.nodes||typeof raw.nodes!=='object'||Array.isArray(raw.nodes)||!raw.assignments||typeof raw.assignments!=='object'||Array.isArray(raw.assignments))throw Error('Invalid mesh project.');for(const [k,v]of Object.entries(raw.nodes)){const [t,b]=k.split(':').map(Number);pair(p,t,b);if(k!==key(t,b)||!Array.isArray(v)||v.length!==2||v.some(n=>!Number.isFinite(n))||v.some(n=>Math.abs(n)>100000))throw Error('Invalid mesh point.');p.nodes[k]=[...v];}if(raw.bends!==undefined){if(!raw.bends||typeof raw.bends!=='object'||Array.isArray(raw.bends))throw Error('Invalid mesh bends.');const allowed=new Set(meshEdges(p).map(e=>e.key));let total=0;for(const [k,points]of Object.entries(raw.bends)){if(!allowed.has(k)||!Array.isArray(points)||points.length>2048||(total+=points.length)>30000||points.some(v=>!Array.isArray(v)||v.length!==2||v.some(n=>!Number.isFinite(n))||v.some(n=>Math.abs(n)>100000)))throw Error('Invalid mesh bends.');if(points.length)p.bends[k]=clone(points);}}
 if(raw.geometryOffsets!==undefined){if(!raw.geometryOffsets||typeof raw.geometryOffsets!=='object'||Array.isArray(raw.geometryOffsets))throw Error('Invalid artwork offsets.');p.geometryOffsets=clone(raw.geometryOffsets);const ids=new Set(artwork(data).map(i=>i.id));for(const [id,q]of Object.entries(p.geometryOffsets))if(!ids.has(id)||!Array.isArray(q)||q.length!==2||q.some(v=>!Number.isFinite(v)||Math.abs(v)>100000))throw Error('Invalid artwork offset.');}
 if(raw.geometry!==undefined){if(!raw.geometry||typeof raw.geometry!=='object'||Array.isArray(raw.geometry))throw Error('Invalid artwork edits.');p.geometry=clone(raw.geometry);G.apply(artwork(data),p);}
 if(raw.sliceGapMm!==undefined){if(!Number.isFinite(raw.sliceGapMm)||raw.sliceGapMm<.01||raw.sliceGapMm>2)throw Error('Invalid automatic slice gap.');p.sliceGapMm=raw.sliceGapMm;}
 if(raw.meshAnchors!==undefined){if(!raw.meshAnchors||Array.isArray(raw.meshAnchors)||typeof raw.meshAnchors!=='object')throw Error('Invalid slice anchors.');const base=new Map(G.apply(artwork(data),p).map(i=>[i.id,i])),used=new Set();for(const [id,sites]of Object.entries(raw.meshAnchors)){if(!base.has(id)||!Array.isArray(sites)||sites.length>128)throw Error('Invalid slice anchors.');p.meshAnchors[id]=sites.map(a=>{pair(p,a.t,a.b);const k=key(a.t,a.b);if(used.has(k)||!S.contains(base.get(id),position(p,a.t,a.b)))throw Error('Invalid or duplicate slice anchor.');used.add(k);return {t:a.t,b:a.b};});}}
 if(raw.sliceEdits!==undefined){if(!raw.sliceEdits||typeof raw.sliceEdits!=='object'||Array.isArray(raw.sliceEdits))throw Error('Invalid slice adjustments.');p.sliceEdits={};const valid=new Set();for(const [id,sites] of Object.entries(p.meshAnchors))for(let i=0;i<sites.length;i++)for(let j=i+1;j<sites.length;j++)valid.add(S.sliceKey(id,sites[i],sites[j]));for(const [key,e] of Object.entries(raw.sliceEdits)){if(!valid.has(key))continue;if(!e||!Number.isFinite(e.widthMm)||e.widthMm<.01||e.widthMm>2||!Array.isArray(e.ends)||e.ends.length!==2||e.ends.some(q=>!Array.isArray(q)||q.length!==2||q.some(n=>!Number.isFinite(n)||Math.abs(n)>100000)))throw Error('Invalid slice width or endpoints.');if(e.finite!==undefined&&typeof e.finite!=='boolean')throw Error('Invalid slice endpoint mode.');p.sliceEdits[key]=clone(e);}}
 if(raw.detachedAssignments!==undefined){if(!raw.detachedAssignments||typeof raw.detachedAssignments!=='object'||Array.isArray(raw.detachedAssignments))throw Error('Invalid detached internal wiring.');p.detachedAssignments=clone(raw.detachedAssignments);const all=new Map(artwork(data,p).map(i=>[i.id,i]));for(const [id,a]of Object.entries(p.detachedAssignments)){if(!all.has(id)||raw.assignments[id]||!a||typeof a.group!=='string'||!a.group.split('|').includes(id))throw Error('Invalid detached internal wiring.');pair(p,a.t,a.b);const members=a.group.split('|');if(members.some(other=>all.get(other)?.parentId!==all.get(id).parentId||p.detachedAssignments[other]?.group!==a.group))throw Error('Detached wiring must remain within one original segment.');}}
 const items=artwork(data,p);
 for(const [id,a]of Object.entries(raw.assignments)){if(!a)throw Error('Invalid assignment.');assign(p,items,[id],a.t,a.b);}if(raw.routes!==undefined){p.routes=clone(raw.routes);artwork(data,p);}return p;}
// Mesh edges may meet only at their shared logical endpoint. Other touches,
// crossings and collinear overlaps are invalid, including same-layer crossings.
function topology(p,previous=null){
 const changed=previous?new Set(meshEdges(p).filter(e=>JSON.stringify(e.points)!==JSON.stringify(edgePath(previous,...e.ids.flatMap(id=>id.split(':').map(Number))))).map(e=>e.key)):null;
 const edges=[],eps=1e-7;
 const points=[...Object.values(p.nodes),...Object.values(p.bends||{}).flat()];if(points.some(q=>q.some(n=>!Number.isFinite(n)||Math.abs(n)>100000)))return {ok:false,reason:'Mesh coordinates exceed the supported workspace range.',edges:[]};
 for(const edge of meshEdges(p)){const points=edge.points;for(let i=1;i<points.length;i++)edges.push({key:edge.key,ids:[i===1?edge.ids[0]:edge.key+'@'+(i-1),i===points.length-1?edge.ids[1]:edge.key+'@'+i],points:[points[i-1],points[i]]});}
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 const on=(a,b,c)=>Math.abs(cross(a,b,c))<eps&&c[0]>=Math.min(a[0],b[0])-eps&&c[0]<=Math.max(a[0],b[0])+eps&&c[1]>=Math.min(a[1],b[1])-eps&&c[1]<=Math.max(a[1],b[1])+eps;
 const fail=(reason,es)=>({ok:false,reason,edges:es.map(e=>e.points)});
 const extent=edges.reduce((n,e)=>Math.max(n,...e.points.flat().map(Math.abs)),3000);
 const buckets=new Map(),size=Math.max(30,extent/64,Math.min(3000/(p.cols+1),2160/(p.rows+1))*2);
 for(let n=0;n<edges.length;n++){
  const e=edges[n],[a,b]=e.points;if((!changed||changed.has(e.key))&&Math.hypot(a[0]-b[0],a[1]-b[1])<eps)return fail('Two neighboring mesh points coincide.',[e]);
  const cells=[],seen=new Set();
  for(let x=Math.floor(Math.min(a[0],b[0])/size);x<=Math.floor(Math.max(a[0],b[0])/size);x++)for(let y=Math.floor(Math.min(a[1],b[1])/size);y<=Math.floor(Math.max(a[1],b[1])/size);y++){
   const k=x+','+y;cells.push(k);for(const j of buckets.get(k)||[])seen.add(j);
  }
  for(const j of seen){const f=edges[j];if(changed&&!changed.has(e.key)&&!changed.has(f.key))continue;const [c,d]=f.points,shared=e.ids.find(id=>f.ids.includes(id));
   if(shared){const v=e.points[e.ids.indexOf(shared)],u=e.points[1-e.ids.indexOf(shared)],w=f.points[1-f.ids.indexOf(shared)];if(Math.abs(cross(v,u,w))<eps&&(u[0]-v[0])*(w[0]-v[0])+(u[1]-v[1])*(w[1]-v[1])>eps)return fail('Neighboring mesh edges overlap.',[e,f]);continue;}
   const c1=cross(a,b,c),c2=cross(a,b,d),c3=cross(c,d,a),c4=cross(c,d,b);
   if(((c1>eps&&c2< -eps||c1< -eps&&c2>eps)&&(c3>eps&&c4< -eps||c3< -eps&&c4>eps))||on(a,b,c)||on(a,b,d)||on(c,d,a)||on(c,d,b))return fail('Mesh edges cross or touch away from their shared intersection.',[e,f]);
  }
  for(const k of cells){if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(n);}
 }
 // Retain the original orientation; a whole cell must not turn inside out.
 for(let t=1;t<p.cols;t++)for(let b=1;b<p.rows;b++){if(changed&&![[t,b,t+1,b],[t+1,b,t+1,b+1],[t,b+1,t+1,b+1],[t,b,t,b+1]].some(q=>changed.has(edgeKey(...q))))continue;const ring=cellRing(p,t,b);let area=0;ring.forEach((v,i)=>{const w=ring[(i+1)%ring.length];area+=v[0]*w[1]-w[0]*v[1];});if(area<=eps)return {ok:false,reason:'A mesh cell is folded or collapsed.',edges:ring.map((v,i)=>[v,ring[(i+1)%ring.length]])};}
 return {ok:true,edges:[]};
}
// Optimize the complete network to a fixed point. Each accepted shortcut
// removes stored vertices; all checks see the complete proposed mesh.
function simplify(p,previous=null){
 if(!Object.keys(p.bends||{}).length||!topology(p,previous).ok)return p;
 let result={...p,bends:{...p.bends}},changed=true;
 const accept=bends=>{const candidate={...result,bends};if(!topology(candidate,result).ok)return false;result=candidate;changed=true;return true;};
 while(changed){
  changed=false;
  const ids=Object.keys(result.bends).filter(id=>result.bends[id].length&&(!previous||id.split('>').some(k=>JSON.stringify(position(result,...k.split(':').map(Number)))!==JSON.stringify(position(previous,...k.split(':').map(Number))))||previous&&JSON.stringify(result.bends[id])!==JSON.stringify(previous.bends?.[id])));
  if(!ids.length)break;
  // Joint straightening handles mutually blocking curves in one transaction.
  const straight={...result.bends};for(const id of ids)delete straight[id];if(accept(straight))break;
  for(const id of ids){const bends={...result.bends};delete bends[id];accept(bends);}
  const remaining=ids.filter(id=>result.bends[id]);
  // Adjacent connections may need to straighten together, even when each
  // individual shortcut intersects the other's old curve.
  for(let i=0;i<remaining.length;i++)for(let j=i+1;j<remaining.length;j++){
   const a=remaining[i],b=remaining[j];if(!result.bends[a]||!result.bends[b]||!a.split('>').some(n=>b.split('>').includes(n)))continue;
   const bends={...result.bends};delete bends[a];delete bends[b];accept(bends);
  }
  // A necessary detour can still contain many redundant samples. Try long
  // shortcuts first, down to individual vertices, preserving endpoints.
  for(const id of remaining){
   const [a,b]=id.split('>').map(k=>k.split(':').map(Number));
   let path=edgePath(result,...a,...b);
   for(let span=Math.max(2,Math.floor(path.length/2));span>=2;span=span===2?1:Math.max(2,Math.floor(span/2))){
    for(let i=0;i+span<path.length;i++){
     const shortcut=[...path.slice(0,i+1),...path.slice(i+span)];
     const bends={...result.bends};if(shortcut.length===2)delete bends[id];else bends[id]=shortcut.slice(1,-1);
     if(accept(bends)){path=shortcut;i=Math.max(-1,i-span);}
    }
   }
  }
 }
 return result;
}
function finishProposal(project,adjusted=0){return {project,check:topology(project),adjusted,bent:Object.keys(project.bends||{}).length};}
// Advect edge geometry through a local smooth displacement field. All other
// intersections stay fixed. Short steps and adaptive subdivisions let edges
// bend while the final exact polyline check remains the acceptance authority.
function bendDrag(p,t,b,target){
 if(!topology(p).ok)return null;
 const start=position(p,t,b),distance=Math.hypot(target[0]-start[0],target[1]-start[1]);
 if(distance<1e-8||distance>500)return null;
 const fixed=[];for(let x=1;x<=p.cols;x++)for(let y=1;y<=p.rows;y++)if(x!==t||y!==b)fixed.push(position(p,x,y));
 if(fixed.some(q=>Math.hypot(q[0]-target[0],q[1]-target[1])<1e-5))return null;
 for(const resolution of [5,10]){
  let center=[...start],edges=meshEdges(p).map(e=>({...e,points:e.points.map(q=>[...q])})),complete=false;
  for(let step=0;step<240;step++){
   const remaining=Math.hypot(target[0]-center[0],target[1]-center[1]);if(remaining<1e-7){complete=true;break;}
   let radius=300;
   for(const q of fixed)radius=Math.min(radius,Math.hypot(q[0]-center[0],q[1]-center[1]));radius*=.75;
   if(radius<.01)break;
   const travel=Math.min(remaining,radius*.1),delta=[(target[0]-center[0])*travel/remaining,(target[1]-center[1])*travel/remaining];
   const warp=q=>{const d=Math.hypot(q[0]-center[0],q[1]-center[1])/radius,f=d>=1?0:(1-d*d)**3;return [q[0]+delta[0]*f,q[1]+delta[1]*f];};
   let total=0,overflow=false;
   for(const edge of edges){const expanded=[warp(edge.points[0])];for(let i=1;i<edge.points.length;i++){
    const a=edge.points[i-1],b=edge.points[i];
    const near=Math.max(a[0],b[0])>=center[0]-radius&&Math.min(a[0],b[0])<=center[0]+radius&&Math.max(a[1],b[1])>=center[1]-radius&&Math.min(a[1],b[1])<=center[1]+radius;
    const pieces=near?Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/(radius/resolution))):1;
    if(pieces>2048){overflow=true;break;}for(let j=1;j<=pieces;j++)expanded.push(warp([a[0]+(b[0]-a[0])*j/pieces,a[1]+(b[1]-a[1])*j/pieces]));
   }edge.points=expanded;total+=expanded.length-2;if(expanded.length>2050||total>30000||overflow){overflow=true;break;}}
   if(overflow)break;center=[center[0]+delta[0],center[1]+delta[1]];
   if(travel===remaining){center=[...target];complete=true;break;}
  }
  if(!complete)continue;
  const candidate={...p,version:3,nodes:{...p.nodes,[key(t,b)]:target},bends:{}};
  let bent=0;
  for(const edge of edges){
   // Remove exactly redundant collinear samples; keep actual curves intact.
   const clean=[];for(const q of edge.points){while(clean.length>=2){const a=clean[clean.length-2],b=clean[clean.length-1],cross=(b[0]-a[0])*(q[1]-b[1])-(b[1]-a[1])*(q[0]-b[0]);if(Math.abs(cross)>1e-9||(b[0]-a[0])*(q[0]-b[0])+(b[1]-a[1])*(q[1]-b[1])<0)break;clean.pop();}clean.push(q);}
   if(clean.length>2){candidate.bends[edge.key]=clean.slice(1,-1);bent++;}
  }
  const check=topology(candidate,p);if(check.ok)return {project:candidate,check,adjusted:0,bent:Object.keys(candidate.bends||{}).length};
 }
 return null;
}
function deformRaw(p,t,b,target){
 pair(p,t,b);const origin=position(p,t,b),dx=target[0]-origin[0],dy=target[1]-origin[1],k=key(t,b);
 const direct={...p,nodes:{...p.nodes,[k]:target}},initial=topology(direct,p);
 if(initial.ok)return {project:direct,check:initial,adjusted:0,bent:Object.keys(direct.bends||{}).length};
 const curved=bendDrag(p,t,b,target);if(curved)return curved;
 // Assigned pairs are anchors. Never move them automatically while repairing a drag.
 const pinned=new Set(Object.values(p.assignments).map(a=>key(a.t,a.b)));
 const step=Math.max(3000/(p.cols+1),2160/(p.rows+1));
 for(const radius of [2,4,8,16,32,64,Infinity]){
  const nodes={...p.nodes};let adjusted=0;
  for(let x=1;x<=p.cols;x++)for(let y=1;y<=p.rows;y++){
   const id=key(x,y),v=position(p,x,y);if(id===k){nodes[id]=target;continue;}if(pinned.has(id))continue;
   const distance=Math.hypot(v[0]-origin[0],v[1]-origin[1])/(radius*step);if(distance>=1)continue;
   const weight=(1-distance*distance)**3;
   const q=[v[0]+dx*weight,v[1]+dy*weight];
   if(Math.hypot(q[0]-v[0],q[1]-v[1])>1e-7){nodes[id]=q;adjusted++;}
  }
  const candidate={...p,nodes},check=topology(candidate,p);if(check.ok)return {project:candidate,check,adjusted,bent:Object.keys(candidate.bends||{}).length};
 }
 return {project:direct,check:initial,adjusted:0};
}
function deform(p,t,b,target,optimize=true){const result=deformRaw(p,t,b,target);if(result.check.ok&&optimize)return finishProposal(simplify(result.project),result.adjusted);return result;}
function boxPoints(p,a,b){const ids=[];for(let t=1;t<=p.cols;t++)for(let c=1;c<=p.rows;c++){const q=position(p,t,c);if(q[0]>=Math.min(a[0],b[0])&&q[0]<=Math.max(a[0],b[0])&&q[1]>=Math.min(a[1],b[1])&&q[1]<=Math.max(a[1],b[1]))ids.push(key(t,c));}return ids;}
function moveGroup(p,ids,delta){
 if(!Array.isArray(delta)||delta.length!==2||delta.some(v=>!Number.isFinite(v)))throw Error('Invalid group displacement.');
 const selected=new Set(ids),candidate={...p,nodes:{...p.nodes},bends:clone(p.bends||{})};
 for(const id of selected){const [t,b]=id.split(':').map(Number);pair(p,t,b);const q=position(p,t,b);candidate.nodes[id]=[q[0]+delta[0],q[1]+delta[1]];}
 for(const e of meshEdges(p)){if(!candidate.bends[e.key])continue;const start=selected.has(e.ids[0])?1:0,end=selected.has(e.ids[1])?1:0;if(!start&&!end)continue;
 const lengths=[0];for(let i=1;i<e.points.length;i++)lengths.push(lengths[i-1]+Math.hypot(e.points[i][0]-e.points[i-1][0],e.points[i][1]-e.points[i-1][1]));
 candidate.bends[e.key]=e.points.slice(1,-1).map((q,i)=>{const f=lengths[i+1]/(lengths.at(-1)||1),weight=start*(1-f)+end*f;return [q[0]+delta[0]*weight,q[1]+delta[1]*weight];});
 }
 return {project:candidate,check:topology(candidate,p)};
}
// Track intentional mesh placements; geometry is rebuilt from original artwork
// every time, so removing an anchor restores area instead of accumulating cuts.
function placePoints(p,data,moved,previous=p,detachOnly=false){
 const before=clone(previous);
 const base=G.apply(artwork(data),p);p.meshAnchors=clone(p.meshAnchors||{});
 // Adopt older single-island assignments whose mesh points are on the artwork.
 for(const item of base){if(p.meshAnchors[item.id]?.length)continue;const a=p.assignments[item.id];if(a&&S.contains(item,position(previous,a.t,a.b)))p.meshAnchors[item.id]=[{...a}];}
 const changed=new Set();
 for(const id of moved){const [t,b]=id.split(':').map(Number);pair(p,t,b);
  for(const [source,sites]of Object.entries(p.meshAnchors)){if(sites.some(a=>a.t===t&&a.b===b)){p.meshAnchors[source]=sites.filter(a=>a.t!==t||a.b!==b);changed.add(source);}}
  const target=detachOnly?null:base.find(i=>S.contains(i,position(p,t,b)));if(target){(p.meshAnchors[target.id]??=[]).push({t,b});changed.add(target.id);}
 }
 for(const source of Object.keys(p.meshAnchors))if(!p.meshAnchors[source].length)delete p.meshAnchors[source];
 const current=artwork(data,{...p,routes:[]});
 for(const source of changed)for(const id of Object.keys(p.assignments))if(id===source||id.startsWith(source+'_sub'))delete p.assignments[id];
 // A transferred pair may leave internally wired siblings without a mesh.
 for(const target of current){const a=target.autoPair||p.meshAnchors[target.sourceId]?.[0];if(!changed.has(target.sourceId)||!a)continue;
  const oldIds=Object.keys(before.assignments).filter(id=>before.assignments[id].t===a.t&&before.assignments[id].b===a.b&&current.find(i=>i.id===id)?.parentId!==target.parentId),set=new Set(oldIds);
  const routes=(p.routes||[]).filter(r=>set.has(r.from)||set.has(r.to));
  if(!routes.length||routes.some(r=>!set.has(r.from)||!set.has(r.to)))continue;
  const group=oldIds.slice().sort().join('|');p.detachedAssignments??={};
  for(const id of oldIds){p.detachedAssignments[id]={...before.assignments[id],group};delete p.assignments[id];}
  for(const r of routes)r.net=`floating:${group}:${r.layer}`;
 }
 for(const item of current){if(!changed.has(item.sourceId))continue;const a=item.autoPair||p.meshAnchors[item.sourceId]?.[0];if(a)assign(p,current,[item.id],a.t,a.b,true);}
 // Internal sibling wiring follows a newly assigned pair as one component.
 // External connections and independently anchored siblings must not be retagged.
 const byId=new Map(current.map(i=>[i.id,i])),seen=new Set();
 for(const seed of current){
  if(seen.has(seed.id))continue;const ids=new Set([seed.id]),queue=[seed.id];
  while(queue.length){const id=queue.pop();for(const r of p.routes||[]){const other=r.from===id?r.to:r.to===id?r.from:null;if(other&&byId.get(other)?.parentId===seed.parentId&&!ids.has(other)){ids.add(other);queue.push(other);}}}
  for(const id of ids)seen.add(id);
  if(ids.size<2||![...ids].some(id=>changed.has(byId.get(id).sourceId)))continue;
  const oldPairs=new Set([...ids].filter(id=>(before.assignments[id]||before.detachedAssignments?.[id])).map(id=>{const a=before.assignments[id]||before.detachedAssignments[id];return key(a.t,a.b);}));if(oldPairs.size!==1)continue;
  const internal=(p.routes||[]).filter(r=>ids.has(r.from)&&ids.has(r.to));
  if((p.routes||[]).some(r=>ids.has(r.from)!==ids.has(r.to)))continue;
  const choices=new Map([...ids].filter(id=>changed.has(byId.get(id).sourceId)&&p.assignments[id]).map(id=>{const a=p.assignments[id];return [key(a.t,a.b),a];}));
  if(choices.size>1)throw Error('Internally connected sibling pieces must share one mesh pair.');
  if(!choices.size&&[...ids].some(id=>p.detachedAssignments?.[id]))continue;
  if(!choices.size){for(const id of ids)if(before.assignments[id])assign(p,current,[id],before.assignments[id].t,before.assignments[id].b);continue;}
  const a=[...choices.values()][0];
  for(const id of ids)for(const anchor of p.meshAnchors[byId.get(id).sourceId]||[])if(anchor.t!==a.t||anchor.b!==a.b)throw Error('Another mesh point anchors this internally connected group. Move or clear that anchor before reassigning.');
  for(const id of ids)assign(p,current,[id],a.t,a.b);
  for(const r of internal)r.net=r.layer==='SEG'?a.t:a.b;
 }
 // Slice creation/removal changes IDs. Keep confirmed contacts on the same
 // source artwork and electrical net, without moving their physical endpoints.
 for(const route of p.routes||[])for(const end of ['from','to']){
  const id=route[end],source=[...changed].find(s=>id===s||id.startsWith(s+'_sub'));
  if(!source)continue;
  const point=end==='from'?route.points[0]:route.points.at(-1),field=route.layer==='SEG'?'t':'b';
  const candidates=current.filter(i=>i.sourceId===source&&(p.assignments[i.id]?.[field]??(p.detachedAssignments?.[i.id]?`floating:${p.detachedAssignments[i.id].group}:${route.layer}`:undefined))===route.net&&S.contains(i,point));
  const target=candidates.find(i=>i.id===id)||candidates[0];
  if(!target)throw Error('Mesh move would disconnect a confirmed trace. Keep its endpoint on artwork with the same net.');
  route[end]=target.id;
 }
 // Reattaching a connected subset removes its detached entries. Remaining
 // siblings must no longer refer to those members in their floating group.
 const detached=p.detachedAssignments||{},groups=new Map();
 for(const [id,a] of Object.entries(detached)){if(!groups.has(a.group))groups.set(a.group,[]);groups.get(a.group).push(id);}
 for(const members of groups.values()){const group=members.sort().join('|');for(const id of members)detached[id].group=group;}
 for(const r of p.routes||[])if(typeof r.net==='string'&&detached[r.from]&&detached[r.to]&&detached[r.from].group===detached[r.to].group)r.net=`floating:${detached[r.from].group}:${r.layer}`;
 artwork(data,p);
 return p;
}
function artworkOffset(p,data,id){if(p.geometryOffsets?.[id])return p.geometryOffsets[id];const base=artwork(data).find(i=>i.id===id),rings=p.geometry?.[id];if(!rings)return [0,0];return [0,1].map(k=>{const values=base.rings.flatMap((r,ri)=>r.map((q,qi)=>rings[ri][qi][k]-q[k])).sort((a,b)=>a-b);return values[Math.floor(values.length/2)];});}
function resetVertex(p,data,id,vertex){const original=artwork(data).find(i=>i.id===id),offset=artworkOffset(p,data,id);if(!original?.rings[vertex[0]]?.[vertex[1]])throw Error('Select a vertex first.');return editArtwork(p,data,id,original.rings[vertex[0]][vertex[1]].map((v,k)=>v+offset[k]),vertex);}
function editArtwork(p,data,source,delta,vertex=null,scope='whole'){
 const next=clone(p),base=G.apply(artwork(data),p),item=base.find(i=>i.id===source);
 if(!item)throw Error('Select artwork first.');
 const targets=vertex||scope==='island'?[item]:base.filter(i=>i.parentId===item.parentId);
 next.geometry??={};next.geometryOffsets??={};
 for(const target of targets)next.geometryOffsets[target.id]=artworkOffset(p,data,target.id).map((v,k)=>v+(vertex?0:delta[k]));
 for(const target of targets){const rings=clone(target.rings);if(vertex)rings[vertex[0]][vertex[1]]=delta;else for(const r of rings)for(const q of r){q[0]+=delta[0];q[1]+=delta[1];}next.geometry[target.id]=G.geometry(target,rings).rings;}
 G.clearance(base,G.apply(artwork(data),next),new Set(targets.map(i=>i.id)),.1*3000/p.widthMm);
 if(!vertex){
  const keys=new Set(targets.flatMap(i=>(p.meshAnchors[i.id]||[]).map(a=>key(a.t,a.b))));
  if(keys.size){const moved=moveGroup(next,[...keys],delta);if(!moved.check.ok)throw Error(moved.check.reason);next.nodes=moved.project.nodes;next.bends=moved.project.bends;}
  for(const [k,e] of Object.entries(next.sliceEdits||{}))if(targets.some(i=>k.startsWith(i.id+'|')))e.ends=e.ends.map(q=>[q[0]+delta[0],q[1]+delta[1]]);
  const current=artwork(data,p),ids=new Set(current.filter(i=>targets.some(target=>target.id===i.sourceId)).map(i=>i.id));
  for(const r of next.routes||[])for(const [id,index] of [[r.from,0],[r.to,r.points.length-1]])if(ids.has(id))r.points[index]=r.points[index].map((v,k)=>v+delta[k]);
 }
 return validate(next,data);
}
// Stage endpoint assignments without changing the saved mesh or ambiguous sliced regions.
function routeProject(p,items,ids,allowPending=false){
 const staged=clone(p);
 for(const id of ids){
  if(staged.assignments[id]||staged.detachedAssignments?.[id])continue;
  const item=items.find(i=>i.id===id);
  if(!item)throw Error('Click an artwork piece to route.');
  if(item.autoPair)throw Error('Assign this sliced piece to a mesh point before routing.');
  const peers=ids.filter(other=>other!==id&&items.find(i=>i.id===other)?.parentId===item.parentId&&p.assignments[other]);
 if(peers.length===1){const a=p.assignments[peers[0]];assign(staged,items,[id],a.t,a.b);continue;}
 const pairs=new Map(items.filter(i=>i.parentId===item.parentId&&p.assignments[i.id]).map(i=>{const a=p.assignments[i.id];return [key(a.t,a.b),a];}));
  if(allowPending&&ids.length===1&&pairs.size>1)continue;
  if(pairs.size!==1)throw Error(pairs.size?'This segment has multiple mesh pairs. Assign this piece explicitly before routing.':'Assign a mesh point to this segment before routing.');
  const a=[...pairs.values()][0];assign(staged,items,[id],a.t,a.b);
 }
 return staged;
}
const api={artworkOffset,resetVertex,editArtwork,routeProject,clone,artwork,key,create,position,assign,resize,validate,topology,deform,edgePath,meshEdges,routedMeshEdges,simplify,boxPoints,moveGroup,placePoints};root.MeshModel=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
