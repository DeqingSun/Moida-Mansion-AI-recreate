const assert=require('node:assert/strict'),M=require('./model.js');
const p=M.create({sourceHash:'test'},4,4),a=[1100,800],b=[1900,1400];
const ids=M.boxPoints(p,a,b);assert.deepEqual(ids,['2:2','2:3','3:2','3:3']);assert.deepEqual(M.boxPoints(p,b,a),ids);
p.assignments.island={t:2,b:2};p.bends['2:2>3:2']=[[1500,900]];
const before=M.clone(p),result=M.moveGroup(p,ids,[40,30]);assert(result.check.ok);
for(let t=1;t<=4;t++)for(let c=1;c<=4;c++){const old=M.position(p,t,c),q=M.position(result.project,t,c);assert.deepEqual(q,ids.includes(`${t}:${c}`)?[old[0]+40,old[1]+30]:old);}
assert.deepEqual(result.project.assignments,p.assignments);assert.deepEqual(result.project.bends['2:2>3:2'],[[1540,930]]);assert.deepEqual(p,before);
assert(!M.moveGroup(p,ids,[2400,0]).check.ok);assert(!M.moveGroup(p,['2:2'],[600,0]).check.ok);
assert(M.moveGroup(M.create({sourceHash:'x'},1,1),['1:1'],[4000,0]).check.ok);
assert(M.topology(M.simplify(result.project)).ok);
console.log('PASS: box selection in both directions, rigid group move, fixed unselected points, assignments, bent edges, no mutation, crossing rejection.');

require('../2_refine_routing/segments-data.js');
const original=M.create(globalThis.ROUTER_DATA,4,4);
original.bends['2:2>3:2']=[[1500,900]];
const all=M.boxPoints(original,[0,0],[3000,2160]);
for(const delta of [[-4000,-3000],[4000,3000]]){
 const parked=M.moveGroup(original,all,delta);assert(parked.check.ok);
 assert.deepEqual(M.validate(JSON.parse(JSON.stringify(parked.project)),globalThis.ROUTER_DATA),parked.project);
 const returned=M.moveGroup(parked.project,all,delta.map(v=>-v));assert(returned.check.ok);
 for(const id of all){const [t,b]=id.split(':').map(Number);assert.deepEqual(M.position(returned.project,t,b),M.position(original,t,b));}
}
const single=M.deform(original,1,1,[-200,-100]);assert(single.check.ok);assert.deepEqual(M.position(single.project,1,1),[-200,-100]);
console.log('PASS: off-screen individual/group moves, negative and positive coordinates, bent-edge save/load, move back onto screen.');
