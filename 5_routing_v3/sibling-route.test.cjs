const assert=require('node:assert/strict'),M=require('./model.js'),R=require('./routing.js');
const rect=x=>({point:[x+20,110],bounds:[x,90,x+40,130],rings:[[[x,90],[x+40,90],[x+40,130],[x,130]]]});
const data={sourceHash:'siblings',segments:[{id:'a',bit:1,islands:[rect(50),rect(250),rect(450)]}]},p=M.create(data,4,16,300);p.assignments.a_0={t:3,b:12};const items=M.artwork(data,p),staged=M.routeProject(p,items,['a_0','a_1']);
assert.equal(p.assignments.a_1,undefined);assert.deepEqual(staged.assignments.a_1,{t:3,b:12});assert.deepEqual(R.common(staged,'a_0','a_1'),['SEG','COM']);
for(const layer of ['SEG','COM']){const result=R.plan(staged,items,{from:'a_0',to:'a_1',layer,widthMm:.12,clearanceMm:.12,crossClearanceMm:.1,pushMm:0,points:[[70,110],[270,110]]});assert.doesNotThrow(()=>M.validate({...staged,routes:[result.route]},data));}
assert.throws(()=>M.routeProject({...p,assignments:{}},items,['a_1']),/Assign a mesh/);
const ambiguous={...p,assignments:{...p.assignments,a_2:{t:4,b:12}}};assert.throws(()=>M.routeProject(ambiguous,items,['a_1']),/multiple mesh/);assert.deepEqual(M.routeProject(ambiguous,items,['a_2']).assignments.a_2,{t:4,b:12});
assert.throws(()=>M.routeProject(p,items.map(i=>i.id==='a_1'?{...i,autoPair:{t:4,b:12}}:i),['a_1']),/sliced piece/);
console.log('PASS: sibling assignment staging, both layers route and validate, original unchanged, ambiguous and sliced pieces protected.');
for(const ids of [['a_2','a_1'],['a_1','a_2']]){const chosen=M.routeProject(ambiguous,items,ids);assert.deepEqual(chosen.assignments.a_1,{t:4,b:12});assert.deepEqual(R.common(chosen,...ids),['SEG','COM']);assert.deepEqual(chosen.assignments.a_0,{t:3,b:12});}
assert.equal(M.routeProject(ambiguous,items,['a_1'],true).assignments.a_1,undefined);assert.equal(ambiguous.assignments.a_1,undefined);console.log('PASS: selected assigned sibling resolves ambiguous parent in either click order, staged only.');
const wired=M.clone(staged);wired.nodes['3:12']=[70,110];wired.meshAnchors={a_0:[{t:3,b:12}]};wired.routes=['SEG','COM'].map(layer=>R.plan(staged,items,{from:'a_0',to:'a_1',layer,widthMm:.12,clearanceMm:.12,crossClearanceMm:0,pushMm:0,points:[[70,110],[270,110]]}).route);
const detached=M.clone(wired);detached.nodes['3:12']=[-100,-100];M.placePoints(detached,data,['3:12'],wired);assert.deepEqual(detached.assignments,wired.assignments);
const reassigned=M.clone(detached);reassigned.nodes['4:13']=[270,110];M.placePoints(reassigned,data,['4:13'],detached);assert.deepEqual(reassigned.assignments.a_0,{t:4,b:13});assert.deepEqual(reassigned.assignments.a_1,{t:4,b:13});assert.deepEqual(reassigned.routes.map(r=>r.net),[4,13]);assert.deepEqual(reassigned.routes.map(r=>r.points),wired.routes.map(r=>r.points));assert.doesNotThrow(()=>M.validate(reassigned,data));
const pinned=M.clone(wired);pinned.nodes['4:13']=[270,110];assert.throws(()=>M.placePoints(pinned,data,['4:13'],wired),/Another mesh point/);
console.log('PASS: internally wired siblings detach and reassign together on both layers, retaining paths and protecting other anchors.');
const transferData={...data,segments:[...data.segments,{id:'B',bit:2,islands:[rect(600)]}]},transferBefore=M.clone(wired);transferBefore.nodes['4:12']=[610,110];transferBefore.meshAnchors.B_0=[{t:4,b:12}];transferBefore.assignments.B_0={t:4,b:12};const transferred=M.clone(transferBefore);transferred.nodes['3:12']=[630,110];M.placePoints(transferred,transferData,['3:12'],transferBefore);assert.equal(transferred.assignments.a_0,undefined);assert(transferred.detachedAssignments.a_0);assert(transferred.routes.every(r=>String(r.net).startsWith('floating:')));assert.equal(M.artwork(transferData,transferred).filter(i=>i.parentId==='B').length,2);assert.doesNotThrow(()=>M.validate(transferred,transferData));const attached=M.clone(transferred);attached.nodes['2:11']=[70,110];M.placePoints(attached,transferData,['2:11'],transferred);assert.deepEqual(attached.assignments.a_1,{t:2,b:11});assert.deepEqual(attached.routes.map(r=>r.net),[2,11]);assert.doesNotThrow(()=>M.validate(attached,transferData));console.log('PASS: pair transfer auto-slices destination, retains detached internal wiring, saves and reassigns it.');

// A pair may cover unwired siblings as well as an internally wired component.
const extra=M.clone(transferBefore);extra.assignments.a_2={t:3,b:12};
const movedExtra=M.clone(extra);movedExtra.nodes['3:12']=[630,110];M.placePoints(movedExtra,transferData,['3:12'],extra);
assert.equal(movedExtra.detachedAssignments.a_2.group,'a_0|a_1|a_2');
const reconnect=M.clone(movedExtra);reconnect.nodes['2:11']=[70,110];M.placePoints(reconnect,transferData,['2:11'],movedExtra);
assert.deepEqual(reconnect.assignments.a_0,{t:2,b:11});assert.deepEqual(reconnect.assignments.a_1,{t:2,b:11});
assert.equal(reconnect.detachedAssignments.a_2.group,'a_2');assert.equal(reconnect.detachedAssignments.a_0,undefined);
assert.doesNotThrow(()=>M.validate(reconnect,transferData));
assert.deepEqual(M.validate(JSON.parse(JSON.stringify(reconnect)),transferData),reconnect);
console.log('PASS: reattaching one wired component clears stale detached group members, preserving other siblings and reload.');
const orphan=M.clone(p);orphan.assignments={a_1:{t:4,b:11},a_2:{t:2,b:10}};orphan.detachedAssignments={a_0:{t:3,b:11,group:'a_0'}};
for(const ids of [['a_0','a_1'],['a_1','a_0']]){const proposal=M.routeProject(orphan,items,ids);assert.deepEqual(proposal.assignments.a_0,{t:4,b:11});assert.equal(proposal.detachedAssignments.a_0,undefined);assert.deepEqual(R.common(proposal,...ids),['SEG','COM']);assert.doesNotThrow(()=>M.validate(proposal,data));}
assert(orphan.detachedAssignments.a_0);assert.equal(orphan.assignments.a_0,undefined);console.log('PASS: unwired detached sibling inherits the selected pair in either order; original remains unchanged before confirmation.');
