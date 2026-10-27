const assert=require('node:assert/strict'),M=require('./model.js'),R=require('./routing.js');
const rect=x=>({point:[x+20,110],bounds:[x,90,x+40,130],rings:[[[x,90],[x+40,90],[x+40,130],[x,130]]]});
const data={sourceHash:'siblings',segments:[{id:'a',bit:1,islands:[rect(50),rect(250),rect(450)]}]},p=M.create(data,4,16,300);p.assignments.a_0={t:3,b:12};const items=M.artwork(data,p),staged=M.routeProject(p,items,['a_0','a_1']);
assert.equal(p.assignments.a_1,undefined);assert.deepEqual(staged.assignments.a_1,{t:3,b:12});assert.deepEqual(R.common(staged,'a_0','a_1'),['SEG','COM']);
for(const layer of ['SEG','COM']){const result=R.plan(staged,items,{from:'a_0',to:'a_1',layer,widthMm:.12,clearanceMm:.12,crossClearanceMm:.1,pushMm:0,points:[[70,110],[270,110]]});assert.doesNotThrow(()=>M.validate({...staged,routes:[result.route]},data));}
assert.throws(()=>M.routeProject({...p,assignments:{}},items,['a_1']),/Assign a mesh/);
const ambiguous={...p,assignments:{...p.assignments,a_2:{t:4,b:12}}};assert.throws(()=>M.routeProject(ambiguous,items,['a_1']),/multiple mesh/);assert.deepEqual(M.routeProject(ambiguous,items,['a_2']).assignments.a_2,{t:4,b:12});
assert.throws(()=>M.routeProject(p,items.map(i=>i.id==='a_1'?{...i,autoPair:{t:4,b:12}}:i),['a_1']),/sliced piece/);
console.log('PASS: sibling assignment staging, both layers route and validate, original unchanged, ambiguous and sliced pieces protected.');
