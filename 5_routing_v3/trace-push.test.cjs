const assert=require('node:assert/strict'),R=require('./routing.js');
const rect=(id,x,y,w,h)=>({id,parentId:id,sourceId:id,point:[x+w/2,y+h/2],bounds:[x,y,x+w,y+h],rings:[[[x,y],[x+w,y],[x+w,y+h],[x,y+h]]]});
const base=[rect('a',50,100,40,25),rect('b',250,100,40,25),rect('c',50,150,40,30),rect('d',250,150,40,30),rect('wall',100,0,140,100)];
const old={from:'a',to:'b',layer:'SEG',net:1,widthMm:.5,clearanceMm:.5,crossClearanceMm:.1,pushMm:0,points:[[70,110],[270,110]]};
const p={widthMm:300,cols:4,rows:4,nodes:{},meshAnchors:{},assignments:{a:{t:1,b:1},b:{t:1,b:2},c:{t:2,b:3},d:{t:2,b:4}},routes:[old]};
const request={from:'c',to:'d',layer:'SEG',widthMm:.5,clearanceMm:.5,pushMm:1,pushTraces:true,traceMoveMm:2,points:[[70,160],[270,160]],waypoints:[[150,110],[200,110]]};
const before=JSON.stringify(p),out=R.plan(p,base,request,base);assert.equal(JSON.stringify(p),before);assert.equal(out.movedRoutes.length,1);assert(out.changed.includes('wall'));assert.deepEqual(out.routes[0].points[0],old.points[0]);assert.deepEqual(out.routes[0].points.at(-1),old.points.at(-1));assert.doesNotThrow(()=>R.apply({...p,routes:out.routes},base));assert.notDeepEqual(out.routes[0].points,old.points);
assert.throws(()=>R.plan(p,base,{...request,pushTraces:false},base));assert.throws(()=>R.plan(p,base,{...request,traceMoveMm:.1},base));assert.equal(JSON.stringify(p),before);
console.log('PASS: trace push plus artwork trimming, fixed endpoints, movement limit, final DRC, disabled mode, no mutation on success/failure.');
const originalNew={...request,net:2,points:[[70,160],[270,160]]};delete originalNew.waypoints;delete originalNew.pushTraces;delete originalNew.traceMoveMm;
const editProject={...p,routes:[old,originalNew]},editBefore=JSON.stringify(editProject),edited=R.plan(editProject,R.apply(editProject,base),{...request,editIndex:1},base);
assert.equal(edited.routes.length,2);assert.equal(edited.editIndex,1);assert.equal(edited.movedRoutes[0].index,0);assert.notDeepEqual(edited.routes[0].points,old.points);assert.equal(JSON.stringify(editProject),editBefore);assert.doesNotThrow(()=>R.apply({...p,routes:edited.routes},base));
const trimmedRoute={...old,pushMm:1,points:[[70,110],[120,102],[220,102],[270,110]]},trimmedProject={...p,routes:[trimmedRoute]},trimmed=R.apply(trimmedProject,base);assert.notDeepEqual(trimmed.find(i=>i.id==='wall').rings,base.find(i=>i.id==='wall').rings);
const restored=R.plan(trimmedProject,trimmed,{...trimmedRoute,editIndex:0,waypoints:[[120,130],[220,130]],points:[[70,110],[270,110]]},base);
assert.equal(restored.routes.length,1);assert(restored.restoredIds.includes('wall'));assert.deepEqual(restored.items.find(i=>i.id==='wall').rings,base.find(i=>i.id==='wall').rings);assert.doesNotThrow(()=>R.apply({...p,routes:restored.routes},base));
const movedEndpoint=R.plan(trimmedProject,trimmed,{...trimmedRoute,editIndex:0,points:[[71,110],[271,110]]},base);assert.deepEqual(movedEndpoint.route.points[0],[71,110]);assert.deepEqual(movedEndpoint.route.points.at(-1),[271,110]);
assert.throws(()=>R.plan(trimmedProject,trimmed,{...trimmedRoute,editIndex:0,points:[[10,110],[270,110]]},base),/contact/);
console.log('PASS: editing replaces in place, pushes a neighbor, preserves endpoints, restores abandoned trim from original geometry, no mutation before confirm.');

// A saved route's own trim is an available corridor during explicit walk edits.
const walkSame=R.plan(trimmedProject,trimmed,{...trimmedRoute,editIndex:0,manual:true,walkAround:true,points:[trimmedRoute.points[0],trimmedRoute.points.at(-1)],waypoints:trimmedRoute.points.slice(1,-1)},base);
assert.deepEqual(walkSame.route.points,trimmedRoute.points);
assert.doesNotThrow(()=>R.apply({...p,routes:walkSame.routes},base));
const walkAway=R.plan(trimmedProject,trimmed,{...trimmedRoute,editIndex:0,manual:true,walkAround:true,points:[trimmedRoute.points[0],trimmedRoute.points.at(-1)],waypoints:[[120,130],[220,130]]},base);
assert(walkAway.restoredIds.includes('wall'));
assert.deepEqual(walkAway.items.find(i=>i.id==='wall').rings,base.find(i=>i.id==='wall').rings);
assert.doesNotThrow(()=>R.apply({...p,routes:walkAway.routes},base));
console.log('PASS: walk edits retain existing trim corridors and restore abandoned cuts on final replay.');
