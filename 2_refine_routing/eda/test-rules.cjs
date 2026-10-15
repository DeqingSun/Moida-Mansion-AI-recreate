const assert=require('node:assert/strict'),fs=require('fs'),os=require('os'),path=require('path'),C=require('./convert.cjs'),G=require('../geometry'),P=require('../project'),{applyRules,LIMITS}=require('./rules.cjs');
assert.deepEqual(LIMITS,P.MANUFACTURING);
const raw=JSON.parse(fs.readFileSync(path.join(__dirname,'../Moida-routing.moida-routing_finished.json'))),dir=fs.mkdtempSync(path.join(os.tmpdir(),'moida-rules-'));
C.exportProject(raw,dir);const rows=C.parse(fs.readFileSync(path.join(dir,'pcb/LCD.epcb2'),'utf8'));
assert.equal(rows.find(r=>r.head.type==='CANVAS').body.unit,'mm');
for(const r of rows.filter(r=>r.head.type==='RULE')){const k=JSON.parse(r.head.id),ctx=r.body.ruleContext;if(k[1]==='TRACK')for(const x of ctx.track.content){assert(Math.abs(x.stroMin*.0254-.12)<1e-12);assert(Math.abs(x.stroDef*.0254-.12)<1e-12)}if(k[1]==='SAFE')for(const x of ctx.safeSpacing){assert(Math.abs(x.content[0][0]*.0254-.12)<1e-12);assert(Math.abs(x.content[1][0]*.0254-.12)<1e-12);assert(Math.abs(x.content[3][0]*.0254-.1)<1e-12);assert(Math.abs(x.content[5][0]*.0254-.1)<1e-12);assert(Math.abs(x.content[12][0]*.0254-.1)<1e-12)}}
assert.equal(rows.find(r=>r.head.type==='LINE').body.width,raw.traces[0].widthMm/.0254); // Rules do not widen existing work.
const p=P.empty({sourceHash:'fixture',segments:[]}),data={sourceHash:'fixture',segments:[]};
function wire(id,layer,y){return {id,layer,net:id,widthMm:.12,points:[[200,y*20],[400,y*20]]}}
p.traces=[wire('T','top',10),wire('B','bottom',10.2)];assert(G.area(G.crossLayerClearance(p,data))>0,'0.08 mm edge gap fails');
p.traces[1]=wire('B','bottom',10.22);assert.equal(G.area(G.crossLayerClearance(p,data)),0,'0.10 mm edge gap passes');
p.traces[1]=wire('B','bottom',10.24);assert.equal(G.area(G.crossLayerClearance(p,data)),0,'0.12 mm edge gap passes');
p.traces[1]=wire('B','bottom',10.2);p.wantedOverlaps=[[100,100,500,300]];assert.equal(G.area(G.crossLayerClearance(p,data)),0,'wanted regions exempt');delete p.wantedOverlaps;
const island={rings:[[[100,100],[500,100],[500,300],[100,300]]],point:[300,200],bounds:[100,100,500,300]};data.segments=[{id:'S',islands:[island],bounds:island.bounds}];assert.equal(G.area(G.crossLayerClearance(p,data)),0,'intended segment artwork exempt');data.segments=[];
p.traces=[wire('T','top',120),wire('B','bottom',120.2)];assert.equal(G.area(G.crossLayerClearance(p,data)),0,'outside display exempt');
p.traces=[wire('T','top',10),wire('B','top',10.2)];assert.equal(G.area(G.crossLayerClearance(p,data)),0,'same layer not a cross-layer error');
p.traces=[wire('T','top',10),wire('B','bottom',10.2)];const report=G.check(p,data);assert(report.issues.some(i=>i.code==='cross-layer-clearance'&&i.geometry));
p.traces[0].widthMm=.1;assert(G.check(p,data).issues.some(i=>i.code==='trace-width'));
// Same-layer traces: 0.11 mm fails, exactly 0.12 mm passes; same net is exempt.
p.traces=[wire('T','top',10),wire('B','top',10.23)];assert(G.check(p,data).issues.some(i=>i.code==='trace-clearance'));
p.traces[1]=wire('B','top',10.24);assert(!G.check(p,data).issues.some(i=>i.code==='trace-clearance'));
p.traces[1]={...wire('B','top',10.23),net:'T'};assert(!G.check(p,data).issues.some(i=>i.code==='trace-clearance'));
// Different-net segment/trace rule is 0.12 mm; same-net connections are legal.
const rect={rings:[[[200,200],[400,200],[400,220],[200,220]]],point:[300,210],bounds:[200,200,400,220]};
const sd={sourceHash:'fixture',segments:[{id:'S',parentId:'S',islands:[rect],bounds:rect.bounds}]},sp=P.empty(sd);
sp.assignments.S={top:'A',bottom:'B'};sp.traces=[wire('OTHER','top',11.17)]; // .11 mm from the island edge.
assert(G.check(sp,sd).issues.some(i=>i.code==='segment-clearance'));
sp.traces=[wire('OTHER','top',11.19)];assert(!G.check(sp,sd).issues.some(i=>i.code==='segment-clearance'));
sp.traces=[{...wire('A','top',11.17),net:'A'}];assert(!G.check(sp,sd).issues.some(i=>i.code==='segment-clearance'));
fs.rmSync(dir,{recursive:true});console.log('PASS: mm/native rule values, unchanged wire widths, 0.08/0.10/0.12 mm cross-layer gaps, segment/wanted/display exemptions, issue geometry.');

const pref=rows.find(r=>r.head.type==='PREFERENCE').body;
assert.equal(pref.startViaSizeFollowLast,false);
assert(Math.abs(pref.lastViaDiameter*.0254-.12)<1e-12);
assert(Math.abs(pref.lastViaInnerDiameter*.0254-.06)<1e-12);
for(const r of rows.filter(r=>r.head.type==='RULE'&&JSON.parse(r.head.id)[1]==='RADIUS')){
 const c=r.body.ruleContext;
 assert(Math.abs(c.defRadius*2*.0254-.12)<1e-12);
 assert(Math.abs(c.defInner*2*.0254-.06)<1e-12);
 assert(c.minRadius<=c.defRadius&&c.minInner<=c.defInner);
}

for(const r of rows.filter(r=>r.head.type==='RULE')){
 const key=JSON.parse(r.head.id),ctx=r.body.ruleContext;
 if(key[1]==='OTHER')assert(Math.abs(ctx.holeClearance*.0254-.1)<1e-12);
 if(key[1]==='SAFE')for(const row of ctx.safeSpacing)
  for(let i=0;i<row.content.length;i++)for(let j=0;j<row.content[i].length;j++)
   if(i===5||j===5||i===12||j===12)assert(Math.abs(row.content[i][j]*.0254-.1)<1e-12,`Via/hole clearance ${i},${j}`);
}
console.log('PASS: all via/hole clearance pairs and hole-to-hole are 0.10 mm');
// Rounded EDA values within 0.0001 mm pass; real undersizing still fails.
for(const [width,fail]of [[.1199996,false],[.1199,false],[.1198,true]]){
 const q=P.empty(data);q.traces=[{...wire('T','top',10),widthMm:width}];
 assert.equal(G.check(q,data).issues.some(i=>i.code==='trace-width'),fail);
}
for(const [gap,fail]of [[.1199996,false],[.11995,false],[.1195,true]]){
 const q=P.empty(data);q.traces=[wire('A','top',10),wire('B','top',10+.12+gap)];
 assert.equal(G.check(q,data).issues.some(i=>i.code==='trace-clearance'),fail);
}
console.log('PASS: rounding tolerance accepts 0.1199996 mm, flags real undersizing');

assert(rows.filter(r=>r.head.type==='COMPONENT').every(r=>r.body.locked===true));
assert(rows.filter(r=>r.head.type==='PAD'&&r.body.defaultPad.padType==='POLYGON').every(r=>r.body.locked===true));
assert(rows.filter(r=>r.head.type==='LINE').every(r=>r.body.locked===false));
console.log('PASS: exported segment components and electrode pads locked; traces editable');
