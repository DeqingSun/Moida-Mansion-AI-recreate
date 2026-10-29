const assert=require('node:assert/strict'),R=require('./routing.js'),M=require('./model.js');
const rect=(id,x,y,w,h)=>({id,parentId:id,sourceId:id,point:[x+w/2,y+h/2],bounds:[x,y,x+w,y+h],rings:[[[x,y],[x+w,y],[x+w,y+h],[x,y+h]]]});
const a=rect('a',50,90,40,40),b=rect('b',250,90,40,40),obstacle=rect('o',140,60,40,100),p={widthMm:300,cols:4,rows:4,nodes:{},meshAnchors:{},assignments:{a:{t:1,b:1},b:{t:1,b:2}},routes:[]};
const request={from:'a',to:'b',layer:'SEG',widthMm:.5,clearanceMm:.5,pushMm:0,points:[[70,110],[270,110]]};
assert.deepEqual(R.common(p,'a','b'),['SEG']);
const detour=R.plan(p,[a,b,obstacle],request);assert(detour.route.points.length>2);assert.equal(detour.changed.length,0);assert.doesNotThrow(()=>R.apply({...p,routes:[detour.route]},[a,b,obstacle]));
assert.throws(()=>R.plan(p,[a,b],{...request,layer:'COM'}),/sharing/);
// Entire screen height blocked except a 10-unit slit; width+clearance requires 15.
const top=rect('top',140,0,40,105),bottom=rect('bottom',140,115,40,2045),narrow=[a,b,top,bottom];
assert.throws(()=>R.plan(p,narrow,request),/No path/);
const pushed=R.plan(p,narrow,{...request,pushMm:.4});assert.equal(pushed.changed.length,2);assert.equal(pushed.route.points.length,2);assert.doesNotThrow(()=>R.apply({...p,routes:[pushed.route]},narrow));
assert.throws(()=>R.plan(p,narrow,{...request,pushMm:.1}),/No path|limit/);
const pinned={...p,meshAnchors:{top:[{t:2,b:1}]},nodes:{'2:1':[160,104]}};
assert.throws(()=>R.plan(pinned,narrow,{...request,pushMm:.4}),/contact/);
const c=rect('c',150,0,20,20),d=rect('d',150,2140,20,20);const crossed={...p,assignments:{...p.assignments,c:{t:2,b:3},d:{t:2,b:3}},routes:[{...request,from:'c',to:'d',net:2,points:[[160,5],[160,2155]]}]};
assert.throws(()=>R.plan(crossed,[a,b,c,d],request),/No path/);
assert.doesNotThrow(()=>R.plan({...crossed,routes:[{...crossed.routes[0],layer:'COM',net:3}]},[a,b,c,d],request));
const guided=R.plan(p,[a,b],{...request,waypoints:[[170,50]]});assert(guided.route.points.some(q=>q[0]===170&&q[1]===50));
// Saved trace is rechecked against assignment and physical scale edits.
const data={sourceHash:'routing-test',segments:[a,b,top,bottom].map(i=>({id:i.id,bit:1,islands:[i]}))};const saved=M.create(data,4,4,300);saved.assignments={'a_0':{t:1,b:1},'b_0':{t:1,b:2}};const route=R.plan(saved,M.artwork(data,saved),{...request,from:'a_0',to:'b_0',pushMm:.4}).route;saved.routes=[route];assert.deepEqual(M.validate(saved,data),saved);assert.throws(()=>M.validate({...saved,assignments:{...saved.assignments,'b_0':{t:3,b:2}}},data),/sharing/);assert.throws(()=>M.validate({...saved,widthMm:30},data));
console.log('PASS: shared nets, automatic detour, guided waypoint, narrow-passage push, push limit, protected contact, same-layer trace DRC, opposite layers, route persistence and invalidating edits.');

assert.throws(()=>R.plan({...crossed,routes:[{...crossed.routes[0],layer:'COM',net:3}]},[a,b,c,d],{...request,crossClearanceMm:.1}),/No path/);
assert.throws(()=>R.plan({...crossed,routes:[{...crossed.routes[0],layer:'COM',net:3,crossClearanceMm:.1}]},[a,b,c,d],request),/No path/);
console.log('PASS: SEG/COM spacing blocks crossing and honors either trace’s saved clearance.');
const withTwo={...p,routes:[pushed.route,{...pushed.route}]};
const beforeRemoval=R.apply(withTwo,narrow);
assert.notDeepEqual(beforeRemoval,narrow);
const afterFirstRemoval=R.apply({...withTwo,routes:withTwo.routes.slice(1)},narrow);
assert.deepEqual(afterFirstRemoval,beforeRemoval,'remaining route keeps its required pushed passage');
assert.deepEqual(R.apply({...withTwo,routes:[]},narrow),narrow,'removing all routes restores exact original artwork');
console.log('PASS: non-last route removal preserves remaining passage, last removal restores original artwork.');

const guideProject={assignments:{a:{t:3,b:12},b:{t:3,b:14},c:{t:5,b:14}},routes:[{from:'a',to:'b',layer:'SEG',net:3}]};
assert.deepEqual([...M.routedMeshEdges(guideProject)],['3:12>3:13','3:13>3:14']);
guideProject.routes.push({from:'b',to:'c',layer:'COM',net:14});
assert.deepEqual([...M.routedMeshEdges(guideProject)],['3:12>3:13','3:13>3:14','3:14>4:14','4:14>5:14']);
guideProject.routes.shift();assert.deepEqual([...M.routedMeshEdges(guideProject)],['3:14>4:14','4:14>5:14']);
guideProject.routes=[];assert.equal(M.routedMeshEdges(guideProject).size,0);
console.log('PASS: confirmed SEG/COM routes hide only their mesh spans; removing routes restores guides.');
const insideRoute={...request,net:1,points:[[70,92],[270,110]]};
const closeInside=rect('near',55,70,20,18);
assert.doesNotThrow(()=>R.apply({...p,routes:[insideRoute]},[a,b,closeInside]));
assert.equal(R.plan(p,[a,b,closeInside],insideRoute).route.points.length,2);
const overlapsCopper=rect('near',55,70,20,21);
assert.throws(()=>R.apply({...p,routes:[insideRoute]},[a,b,overlapsCopper]),/clearance/);
const outsideClose=rect('near',140,90,20,15);
assert.throws(()=>R.apply({...p,routes:[{...request,net:1}]},[a,b,outsideClose]),/clearance/);
const holed=rect('hole',0,0,100,100);holed.rings.push([[40,40],[40,60],[60,60],[60,40]]);
assert.deepEqual(R.spans([10,50],[90,50],[holed]).map(s=>s.inside),[true,false,true]);
assert.equal(R.plan(p,[a,b,closeInside],{...insideRoute,pushMm:.4}).changed.length,0);
console.log('PASS: clearance waived inside same-net artwork without pushing, retained outside and in holes, physical shorts still rejected.');
const sharedPad=rect('pad',50,90,40,40),otherPad=rect('other',250,90,40,40),segPad=rect('seg',50,200,40,40);
const sharedProject={...p,assignments:{pad:{t:2,b:1},other:{t:3,b:1},seg:{t:2,b:4}},routes:[{...request,from:'pad',to:'seg',layer:'SEG',net:2,crossClearanceMm:.1,points:[[70,110],[70,220]]}]};
const joined=R.plan(sharedProject,[sharedPad,otherPad,segPad],{...request,from:'pad',to:'other',layer:'COM',crossClearanceMm:.1,points:[[70,110],[270,110]]});
assert.equal(joined.route.points.length,2);assert.equal(joined.changed.length,0);
assert.doesNotThrow(()=>R.apply({...sharedProject,routes:[...sharedProject.routes,joined.route]},[sharedPad,otherPad,segPad]));
console.log('PASS: SEG and COM contacts can overlap inside artwork, with no push; exterior crossing tests remain enforced.');

assert.throws(()=>R.plan(p,[a,b,obstacle],{...request,manual:true}),/clearance|collision|path|overlap|push/i);
const exact=R.plan(p,[a,b],{...request,manual:true,waypoints:[[170,50]]});assert.deepEqual(exact.route.points,[[70,110],[170,50],[270,110]]);assert.equal(exact.route.manual,undefined);
console.log('PASS: manual path preserves exact points and refuses automatic detours.');
// Raising the push allowance beyond a thin obstacle's inradius must not reject
// a shallow cut that already passes with a smaller allowance.
const thinTop=rect('thinTop',140,95,40,10),thinItems=[a,b,thinTop];
const shallow={...request,manual:true,widthMm:.12,clearanceMm:.12,points:[[70,106],[270,106]],pushMm:.1};
const smallPush=R.plan(p,thinItems,shallow),largePush=R.plan(p,thinItems,{...shallow,pushMm:1});assert.deepEqual(largePush.items,smallPush.items);assert.throws(()=>R.plan(p,thinItems,{...shallow,points:[[70,100],[270,100]],pushMm:1}),/split|erase|shrink/);
console.log('PASS: larger push allowance permits shallow cuts in thin artwork, still rejects destructive cuts.');
for(const [field,value,label,range]of [['widthMm',0,'Trace width','0.02 to 2'],['clearanceMm',3,'Same-layer clearance','0.01 to 2'],['pushMm',11,'Maximum inward movement','0 to 10'],['crossClearanceMm',-1,'SEG ↔ COM trace clearance','0 to 2']])assert.throws(()=>R.plan(p,[a,b],{...request,[field]:value}),error=>error.message.includes(label)&&error.message.includes(value+' mm')&&error.message.includes(range));
console.log('PASS: invalid route settings identify field, value, and allowed range.');

for(const pushMm of [2,10]){const result=R.plan(p,thinItems,{...shallow,pushMm});assert.deepEqual(result.items,smallPush.items);assert.doesNotThrow(()=>R.apply({...p,routes:[result.route]},thinItems));}
console.log('PASS: 2 mm and 10 mm inward limits route and replay successfully.');
// A shallow transverse cut may discard a small scrap, but not its contacts.
const scrapA=rect('a',50,0,40,40),scrapB=rect('b',250,0,40,40),scrapObstacle=rect('o',140,0,40,100),scrapItems=[scrapA,scrapB,scrapObstacle];
const scrapRequest={...request,manual:true,widthMm:.12,clearanceMm:.12,pushMm:10,points:[[70,10],[270,10]]};
const scrapResult=R.plan(p,scrapItems,scrapRequest);assert.equal(scrapResult.changed.length,1);assert(scrapResult.items.find(i=>i.id==='o').bounds[1]>10);assert.doesNotThrow(()=>R.apply({...p,routes:[scrapResult.route]},scrapItems));assert.deepEqual(R.apply({...p,routes:[]},scrapItems),scrapItems);
assert.throws(()=>R.plan({...p,nodes:{'2:1':[160,5]},meshAnchors:{o:[{t:2,b:1}]}},scrapItems,scrapRequest),/mesh contact/);
const contact={from:'o',to:'c',layer:'SEG',net:2,widthMm:.12,clearanceMm:.12,pushMm:0,points:[[160,5],[210,5]]};
assert.throws(()=>R.plan({...p,assignments:{...p.assignments,o:{t:2,b:1},c:{t:2,b:2}},routes:[contact]},[...scrapItems,rect('c',200,0,20,10)],scrapRequest),/trace contact/);
assert.throws(()=>R.plan(p,scrapItems,{...scrapRequest,points:[[70,30],[270,30]]}),/maximum 20%/);
console.log('PASS: small split scraps discarded and restored on removal; mesh/trace contacts and total area limit protected.');
// Local validation and cached replay must agree with the full-workspace path.
const cachedProject={...p,routes:[scrapResult.route]};
assert.deepEqual(R.apply(cachedProject,scrapItems),R.fullCheck(cachedProject,scrapItems));
assert.deepEqual(R.apply(cachedProject,scrapItems),R.fullCheck(cachedProject,scrapItems));
const shiftedObstacle=[scrapA,scrapB,rect('o',140,0,40,30)];
for(const check of [R.apply,R.fullCheck])assert.throws(()=>check(cachedProject,shiftedObstacle),/maximum 20%/);
for(const check of [R.apply,R.fullCheck])assert.throws(()=>check({...cachedProject,nodes:{'2:1':[160,5]},meshAnchors:{o:[{t:2,b:1}]}},scrapItems),/mesh contact/);
for(const check of [R.apply,R.fullCheck])assert.throws(()=>check({...cachedProject,assignments:{...p.assignments,b:{t:3,b:2}}},scrapItems),/sharing/);
console.log('PASS: local/cached/full validation agree; geometry, mesh contacts, and assignment edits invalidate reused results.');

const diagnostics=R.diagnose(p,[a,b,obstacle],{...request,manual:true});
assert.equal(diagnostics.length,1);assert.equal(diagnostics[0].leg,1);
assert(diagnostics[0].a[0]>120&&diagnostics[0].a[0]<140);
assert(diagnostics[0].b[0]>180&&diagnostics[0].b[0]<200);
assert.deepEqual(R.diagnose(p,[a,b,obstacle],{...request,waypoints:[[100,40],[220,40]]}),[]);
assert(R.diagnose(crossed,[a,b,c,d],request).length);
console.log('PASS: diagnostics localize artwork and trace conflicts; clear manual detour has no markers.');
