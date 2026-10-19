(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.RouterProject=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const COMPARISON_TOLERANCE_MM=.0001;
const MANUFACTURING={traceWidthMm:.12,traceSpacingMm:.12,segmentTraceSpacingMm:.12,crossLayerSpacingMm:.1};
const FROZEN=typeof module==='object'&&module.exports?require('./frozen-nets.js'):globalThis.MOIDA_FROZEN_NETS;
const FORMAT='moida-lcd-routing',VERSION=12,LAYERS=['top','bottom'];
function ports(){const all=[];for(let i=1;i<=48;i++)all.push({id:`T-N${String(i).padStart(3,'0')}`,layer:'top',side:'S',x:3000*i/49,y:2304});for(let i=1;i<=16;i++)all.push({id:`B-W${String(i).padStart(3,'0')}`,layer:'bottom',side:'W',x:-244,y:2160*i/17});return all}
const PORTS=ports(),PORT_BY_ID=new Map(PORTS.map(p=>[p.id,p]));
function getPorts(project){const scale=project.settings.widthMm/3000;return PORTS.map(p=>{if(project.contactLayout!=='zebra')return {...p,widthMm:project.settings.padSizeMm,heightMm:project.settings.padSizeMm};const n=+p.id.slice(-3),slot=p.layer==='bottom'?n-1:n+17;return {...p,side:'S',x:(project.settings.widthMm/2+(slot-32.5)*2)/scale,y:2160+4.5/scale,widthMm:1,heightMm:3,...project.padPositions?.[p.id]};});}
function getPort(project,id){return getPorts(project).find(p=>p.id===id);}

function freezeAssignments(project,data){if(data.sourceHash!==FROZEN.sourceHash)return project;const nets=FROZEN.nets;project.assignments=Object.fromEntries(data.segments.map(s=>{let key=s.cutId||s.id;while(!nets[key]&&key.includes('_sub'))key=key.slice(0,key.lastIndexOf('_sub'));let a=nets[key];if(!a){const descendants=Object.entries(nets).filter(([k])=>k.startsWith((s.cutId||s.id)+'_sub')).map(([,v])=>v);if(descendants.length&&descendants.every(v=>v.top===descendants[0].top&&v.bottom===descendants[0].bottom))a=descendants[0];}if(!a)a={top:'',bottom:''};return [s.id,{...a}]}));return project;}
function empty(data){return {format:FORMAT,version:VERSION,sourceHash:data.sourceHash,name:'Moida routing',settings:{widthMm:150,padSizeMm:1.8,clearanceMm:.1,gridMm:.1},assignments:Object.fromEntries(data.segments.map(s=>[s.id,{top:'',bottom:''}])),pads:Object.fromEntries(PORTS.map(p=>[p.id,p.id])),traces:[]}}
function islandData(data){return {...data,segments:data.segments.flatMap(s=>s.islands.length===1?[{...s,parentId:s.parentId||s.id}]:s.islands.map((i,index)=>({...s,id:s.id+'_'+index,parentId:s.id,islandIndex:index,bounds:i.bounds,islands:[i],paths:[i.rings.map(r=>'M '+r.map(p=>p.join(' ')).join(' L ')+' Z').join(' ')]})))} }
function sameIslandGeometry(a,b,epsilon){
 return a.length===b.length&&a.every((is,i)=>is.rings.length===b[i].rings.length&&is.rings.every((r,j)=>{
 const other=b[i].rings[j];if(r.length!==other.length)return false;
 const near=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1])<=epsilon;
 return other.some((q,start)=>near(r[0],q)&&[1,-1].some(dir=>r.every((p,k)=>near(p,other[(start+dir*k+r.length)%r.length]))));
 }));
}
function pruneRestoredGeometry(project,data){
 const redundant=new Set(),epsilon=COMPARISON_TOLERANCE_MM/(project.settings.widthMm/3000);
 layoutData(data,project.cuts,project.edaGeometry,project.localGeometry,(id,before,after)=>{
 if(Object.hasOwn(project.localGeometry||{},id)&&!Object.hasOwn(project.edaGeometry||{},id)&&sameIslandGeometry(before,after,epsilon))redundant.add(id);
 });
 for(const id of redundant)delete project.localGeometry[id];
 return project;
}
function layoutData(data,cuts=[],geometry={},localGeometry={},inspectOverride=null){
 geometry={...geometry,...localGeometry};
 if(!geometry||typeof geometry!=='object'||Array.isArray(geometry))throw Error('Invalid EDA geometry');
 const used=new Set(),g=typeof module==='object'&&module.exports?require('./geometry.js'):globalThis.RouterGeometry;
 function apply(){result.segments=result.segments.map(s=>{if(used.has(s.id)||!Object.hasOwn(geometry,s.id))return s;const islands=geometry[s.id];if(!Array.isArray(islands)||!islands.length||islands.length>1000)throw Error('Invalid island geometry: '+s.id);let count=0;for(const i of islands){if(!Array.isArray(i.rings)||!i.rings.length||!Array.isArray(i.point)||i.point.length!==2||i.point.some(v=>!Number.isFinite(v)))throw Error('Invalid island geometry');for(const ring of i.rings)if(!Array.isArray(ring)||ring.length<3||(count+=ring.length)>100000||ring.some(p=>!Array.isArray(p)||p.length!==2||p.some(v=>!Number.isFinite(v)||Math.abs(v)>100000)))throw Error('Invalid island ring');}
 if(inspectOverride)inspectOverride(s.id,s.islands,islands);used.add(s.id);const clean=islands.map(i=>({...i,bounds:g.bounds(g.island(i))}));return {...s,islands:clean,bounds:g.bounds(clean.flatMap(g.island)),paths:clean.map(i=>g.svgPath(g.island(i)))};});}

 if(!Array.isArray(cuts)||cuts.length>2000)throw Error('Invalid island cuts.');
 let result={...data,segments:data.segments.slice()};
 for(const cut of cuts){
 apply();
 if(!cut||typeof cut.target!=='string'||!Number.isFinite(cut.width)||cut.width<.001||cut.width>1000||!Array.isArray(cut.points)||cut.points.length<2||cut.points.length>1000||cut.points.some(p=>!Array.isArray(p)||p.length!==2||p.some(v=>!Number.isFinite(v)||Math.abs(v)>100000)))throw Error('Invalid island cut.');
 const index=result.segments.findIndex(s=>s.id===cut.target);if(index<0)throw Error('Unknown cut island: '+cut.target);
 const original=result.segments[index],g=typeof module==='object'&&module.exports?require('./geometry.js'):globalThis.RouterGeometry;
 const pieces=g.sliceShape(original,cut.points,cut.width).map((island,i)=>({...original,id:original.id+'_sub'+i,bounds:island.bounds,islands:[island],paths:[island.rings.map(r=>'M '+r.map(p=>p.join(' ')).join(' L ')+' Z').join(' ')]}));
 result.segments.splice(index,1,...pieces);
 }
 apply();
 if(Object.keys(geometry).some(k=>!used.has(k)))throw Error('EDA geometry refers to unknown island');
 // Keep replay identifiers internal; present contiguous names per original island.
 const counters=new Map();result.segments=result.segments.map(s=>{const root=s.id.split('_sub')[0];if(root===s.id)return {...s,cutId:s.id};const n=counters.get(root)||0;counters.set(root,n+1);return {...s,cutId:s.id,id:root+'_sub'+n}});
 return result;
}
function eraseSlice(project,data,index){
 project=pruneRestoredGeometry(clone(project),data);
 const cut=project.cuts?.[index];if(!cut)throw Error('Slice not found.');
 if(Object.keys(project.localGeometry||{}).some(k=>k.startsWith(cut.target+'_sub')))throw Error('This slice has manually edited pieces. Undo those shape edits before erasing the slice.');
 const before=layoutData(data,project.cuts,project.edaGeometry,project.localGeometry),candidate=clone(project);
 candidate.cuts=project.cuts.filter((c,i)=>i!==index&&!c.target.startsWith(cut.target+'_sub'));
 if(candidate.edaGeometry)for(const key of Object.keys(candidate.edaGeometry))if(key.startsWith(cut.target+'_sub'))delete candidate.edaGeometry[key];
 const after=layoutData(data,candidate.cuts,candidate.edaGeometry,candidate.localGeometry);let cleared=0;
 candidate.assignments=Object.fromEntries(after.segments.map(s=>{const previous=before.segments.filter(old=>old.cutId===s.cutId||old.cutId.startsWith(s.cutId+'_sub')),assignment={};for(const layer of LAYERS){const nets=new Set(previous.map(old=>project.assignments[old.id][layer]));assignment[layer]=nets.size===1?[...nets][0]:'';if(nets.size>1)cleared++}return [s.id,assignment]}));
 return {project:candidate,removed:project.cuts.length-candidate.cuts.length,cleared};
}
function renameNet(project,layer,from,to,{merge=false,preservePads=false}={}){if(!LAYERS.includes(layer)||!validNet(from)||!from||!validNet(to)||!to)throw Error('Enter valid nonempty net names.');if(from===to)return;if(!nets(project,layer).includes(from))throw Error('Net does not exist on this layer.');if(!merge&&nets(project,layer).includes(to))throw Error('That name already exists on this layer. Choose a new name to avoid merging networks.');for(const a of Object.values(project.assignments))if(a[layer]===from)a[layer]=to;for(const t of project.traces)if(t.layer===layer&&t.net===from)t.net=to;if(!preservePads)for(const id of Object.keys(project.pads))if(PORT_BY_ID.get(id).layer===layer&&project.pads[id]===from)project.pads[id]=to;}
function clone(x){return JSON.parse(JSON.stringify(x))}
function validNet(n){return typeof n==='string'&&(n===''||/^[A-Za-z0-9][A-Za-z0-9_.-]{0,31}$/.test(n))}
function legacyPad(id){const m=/^[TB]-[NESW](\d{3})$/.exec(id);return !!m&&+m[1]>=1&&+m[1]<=256}
function validate(raw,data){if(!raw||raw.format!==FORMAT||![1,2,3,4,5,6,7,8,9,10,11,VERSION].includes(raw.version))throw Error('Not a supported Moida routing project (versions 1–12).');if(raw.sourceHash!==data.sourceHash)throw Error('This project uses different source artwork. Loading was stopped.');const cuts=raw.version>=8?(raw.cuts||[]):[];data=layoutData(data,cuts,raw.edaGeometry,raw.localGeometry);if(raw.version<10&&cuts.length&&raw.assignments){const old=raw.assignments,mapped={};for(const s of data.segments)if(Object.hasOwn(old,s.cutId))mapped[s.id]=old[s.cutId];for(const id of Object.keys(old))if(!data.segments.some(s=>s.cutId===id))throw Error('Unknown segment: '+id);raw={...raw,assignments:mapped}}raw=freezeAssignments(clone(raw),data);const base=empty(data);if(raw.contactLayout!==undefined){if(raw.contactLayout!=='zebra')throw Error('Invalid contact layout');base.contactLayout='zebra';}if(raw.padPositions!==undefined){if(!raw.padPositions||typeof raw.padPositions!=='object'||Array.isArray(raw.padPositions))throw Error('Invalid contact positions');base.padPositions={};for(const [id,p]of Object.entries(raw.padPositions)){if(!PORT_BY_ID.has(id)||!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)||Math.abs(p.x)>100000||Math.abs(p.y)>100000)throw Error('Invalid contact position');base.padPositions[id]={x:p.x,y:p.y};}}if(raw.edaGeometry)base.edaGeometry=clone(raw.edaGeometry);if(raw.localGeometry)base.localGeometry=clone(raw.localGeometry);if(raw.wantedOverlaps!==undefined){if(!Array.isArray(raw.wantedOverlaps)||raw.wantedOverlaps.length>2000||raw.wantedOverlaps.some(b=>!Array.isArray(b)||b.length!==4||b.some(v=>!Number.isFinite(v)||Math.abs(v)>100000)||b[2]<=b[0]||b[3]<=b[1]))throw Error('Invalid wanted overlap areas.');base.wantedOverlaps=clone(raw.wantedOverlaps)}if(cuts.length)base.cuts=clone(cuts);if(raw.version>=3)base.pads={};if(typeof raw.name!=='string'||raw.name.length>120)throw Error('Invalid project name.');base.name=raw.name;const settings=raw.settings||{};for(const [key,min,max]of [['widthMm',30,2000],['padSizeMm',.02,raw.version<4?5:raw.version<5?15:30],['clearanceMm',0,5],['gridMm',.001,10]]){let v=settings[key];if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw Error(`Invalid ${key}: expected ${min}–${max}.`);base.settings[key]=key==='padSizeMm'&&raw.version<5?Math.round(v*(raw.version<4?6:2)*1e9)/1e9:v}if(!raw.assignments||typeof raw.assignments!=='object')throw Error('Missing segment assignments.');for(const id of Object.keys(raw.assignments))if(!Object.hasOwn(base.assignments,id)&&!(raw.version<6&&data.segments.some(s=>s.parentId===id)))throw Error('Unknown segment: '+id);for(const s of data.segments){const a=raw.assignments[s.id]||(raw.version<6?raw.assignments[s.parentId]:null);if(!a||!validNet(a.top)||!validNet(a.bottom))throw Error('Invalid or missing net assignment for '+s.id);base.assignments[s.id]={top:a.top,bottom:a.bottom}}if(!raw.pads||typeof raw.pads!=='object'||Array.isArray(raw.pads))throw Error('Invalid pad assignments.');for(const [id,net]of Object.entries(raw.pads)){if(!(raw.version>=3?PORT_BY_ID.has(id):legacyPad(id))||!validNet(net)||!net)throw Error('Invalid assigned pad: '+id);if(raw.version>=3)base.pads[id]=net}if(raw.version<3)base.previousPadLayout={version:raw.version,pads:clone(raw.pads)};else if(raw.previousPadLayout){const old=raw.previousPadLayout;if(![1,2].includes(old.version)||!old.pads||typeof old.pads!=='object'||Array.isArray(old.pads)||Object.entries(old.pads).some(([id,n])=>!legacyPad(id)||!validNet(n)||!n))throw Error('Invalid previous pad layout');base.previousPadLayout=clone(old)}if(!Array.isArray(raw.traces)||raw.traces.length>20000)throw Error('Invalid trace list or more than 20,000 traces.');const ids=new Set();let pointCount=0;for(const t of raw.traces){if(!t||typeof t.id!=='string'||!t.id||t.id.length>80||ids.has(t.id)||!LAYERS.includes(t.layer)||!validNet(t.net)||!t.net)throw Error('Invalid or duplicate trace ID, layer or net.');if(typeof t.widthMm!=='number'||!Number.isFinite(t.widthMm)||t.widthMm<.005||t.widthMm>10)throw Error('Trace widths must be between 0.005 and 10 mm.');if(!Array.isArray(t.points)||t.points.length<2)throw Error('A trace needs at least two points.');if((pointCount+=t.points.length)>200000)throw Error('Project has too many trace points.');for(const p of t.points)if(!Array.isArray(p)||p.length!==2||p.some(v=>typeof v!=='number'||!Number.isFinite(v)||Math.abs(v)>100000))throw Error('Invalid trace coordinates.');if(!t.points.some(p=>p[0]!==t.points[0][0]||p[1]!==t.points[0][1]))throw Error('Zero-length trace.');ids.add(t.id);base.traces.push({id:t.id,layer:t.layer,net:t.net,widthMm:t.widthMm,points:t.points.map(p=>p.slice())})}return base}
function nets(p,layer){const n=new Set();for(const a of Object.values(p.assignments))if(a[layer])n.add(a[layer]);for(const [id,v]of Object.entries(p.pads))if(PORT_BY_ID.get(id).layer===layer)n.add(v);for(const t of p.traces)if(t.layer===layer)n.add(t.net);return [...n].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}))}
// A connected island projects to one interval on either axis. Count each island once,
// including boundary touches, regardless of holes or its electrical assignments.
function axisIslands(data,point){const vertical=[],horizontal=[];for(const s of data.segments)for(let i=0;i<s.islands.length;i++){const b=s.islands[i].bounds,id=s.islands.length===1?s.id:s.id+'_'+i;if(point[0]>=b[0]&&point[0]<=b[2])vertical.push(id);if(point[1]>=b[1]&&point[1]<=b[3])horizontal.push(id)}return {vertical,horizontal}}
return {getPorts,getPort,pruneRestoredGeometry,freezeAssignments,COMPARISON_TOLERANCE_MM,MANUFACTURING,eraseSlice,layoutData,axisIslands,FORMAT,VERSION,LAYERS,PORTS,PORT_BY_ID,empty,islandData,renameNet,clone,validNet,validate,nets};
});
