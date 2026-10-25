const assert=require('node:assert/strict'),M=require('./model.js');
require('../2_refine_routing/segments-data.js');const D=globalThis.ROUTER_DATA;
const legacy=require('./tests/s3-c16-before-bends.json'),p=M.validate(legacy,D),before=M.clone(p),start=M.position(p,3,16);
assert.equal(p.version,3);assert.deepEqual(p.assignments,legacy.assignments);assert(M.topology(p).ok);
for(const dx of [10,20,40,60]){
 const target=[start[0]+dx,start[1]],direct={...p,nodes:{...p.nodes,'3:16':target}};
 assert(!M.topology(direct).ok,'straight edges must reproduce the reported crossing');
 const result=M.deform(p,3,16,target);assert(result.check.ok);assert(result.bent>0);assert.deepEqual(result.project.assignments,p.assignments);
 for(let t=1;t<=p.cols;t++)for(let b=1;b<=p.rows;b++)assert.deepEqual(M.position(result.project,t,b),t===3&&b===16?target:M.position(p,t,b));
 const restored=M.validate(JSON.parse(JSON.stringify(result.project)),D);assert.deepEqual(restored,result.project);assert(M.topology(restored).ok);
 const second=M.deform(restored,3,16,[target[0]+5,target[1]+2]);assert(second.check.ok);assert(M.topology(second.project).ok);
}
assert.deepEqual(p,before,'preview must not mutate the input');
// Artificial bends that cross a neighboring edge or loop must fail exact checking.
const bad=M.create(D,3,3);bad.bends['1:1>2:1']=[[2600,1800]];assert(!M.topology(bad).ok);
assert.throws(()=>M.validate({...p,bends:{'1:1>60:16':[[10,10]]}},D),/Invalid mesh bends/);
assert.throws(()=>M.validate({...p,bends:{'1:1>2:1':[[NaN,10]]}},D),/Invalid mesh bends/);
const collision=M.deform(p,3,16,M.position(p,4,16));assert(!collision.check.ok,'bends cannot permit coincident intersections');
console.log('PASS: real S3/C16 regression, unchanged neighbors/assignments, saved bends, repeated drags, v1 migration, invalid bends and pinned collision.');
// A harmless bow should be straightened, without changing endpoints or ownership.
const bowed=M.create(D,4,4);bowed.bends['3:4>4:4']=[[2100,1800]];
assert(M.topology(bowed).ok);const straight=M.simplify(bowed);
assert.deepEqual(straight.bends,{});assert.deepEqual(straight.nodes,bowed.nodes);assert.deepEqual(straight.assignments,bowed.assignments);
assert.equal(bowed.bends['3:4>4:4'].length,1,'simplification is a non-mutating proposal');
// Necessary curves stay; every retained curve in this case fails a straight substitution.
const bent=M.deform(p,3,16,[start[0]+20,start[1]]).project;
assert(!bent.bends['3:16>4:16'],'the reported S3/C16–S4/C16 edge can be straight');
for(const id of Object.keys(bent.bends)){const attempt=M.clone(bent);delete attempt.bends[id];assert(!M.topology(attempt).ok,'keep only necessary bends');}
assert.deepEqual(M.simplify(bent),bent);
console.log('PASS: unnecessary bows removed, S3/C16–S4/C16 straight, necessary bends retained, endpoints preserved.');
// The right curve cannot straighten until the left curve moves out of its way.
const dependent=M.create(D,3,3);
dependent.bends['2:1>2:2']=[[2200,800]];
dependent.bends['1:1>1:2']=[[1700,800]];
assert(M.topology(dependent).ok);
const premature=M.clone(dependent);delete premature.bends['2:1>2:2'];assert(!M.topology(premature).ok);
const settled=M.simplify(dependent);assert.deepEqual(settled.bends,{});assert.deepEqual(M.simplify(settled),settled);
// Necessary curves are optimized internally as well, not just tested for a
// whole-edge replacement. A second invocation must make no further change.
const preview=M.deform(p,3,16,[start[0]+40,start[1]],false).project;
const optimized=M.simplify(preview),count=q=>Object.values(q.bends).reduce((n,b)=>n+b.length,0);
assert(count(optimized)<count(preview));assert(M.topology(optimized).ok);
assert.deepEqual(M.simplify(optimized),optimized);
assert.deepEqual(optimized.nodes,preview.nodes);assert.deepEqual(optimized.assignments,preview.assignments);
console.log('PASS: dependent curves optimize together; necessary detours shorten; one invocation reaches a stable result.');
