const assert=require('node:assert/strict'),P=require('../routing-editor/project'),G=require('../routing-editor/geometry');
const island={rings:[[[0,0],[100,0],[100,20],[0,20]]],bounds:[0,0,100,20],point:[10,10]};const d={sourceHash:'slice',segments:[{id:'A',parentId:'A',bit:5,bounds:island.bounds,paths:[],islands:[island]}]};
const cut={target:'A',width:4,points:[[50,-10],[50,30]]};const next=P.layoutData(d,[cut]);assert.equal(next.segments.length,2);assert.equal(next.segments[0].bounds[2],48);assert.equal(next.segments[1].bounds[0],52);assert(next.segments.every(s=>s.parentId==='A'&&s.bit===5&&G.contains(G.segment(s),s.islands[0].point)));
const p=P.empty(next);p.cuts=[cut];p.assignments.A_sub0={top:'T',bottom:'B'};p.assignments.A_sub1={top:'T',bottom:'B'};assert.deepEqual(P.validate(p,d),p);assert(!G.check(p,next).issues.some(i=>i.code==='duplicate-pair'));
const more=P.layoutData(d,[cut,{target:'A_sub0',width:2,points:[[25,-10],[25,30]]}]);assert.equal(more.segments.length,3);assert(more.segments.some(s=>s.id==='A_sub2'));
assert.throws(()=>P.layoutData(d,[{...cut,points:[[50,5],[50,15]]}]));assert.throws(()=>P.layoutData(d,[{...cut,width:-1}]));assert.throws(()=>P.layoutData(d,[{...cut,target:'bad'}]));
const gapTrace={id:'cross',layer:'top',net:'T',widthMm:.1,points:[[50,-5],[50,25]]};p.traces=[gapTrace,{...gapTrace,id:'cross2',layer:'bottom',net:'B'}];assert(G.check(p,next).issues.some(i=>i.code==='unwanted-overlap'));
console.log('Slice gaps, repeat cuts, interior points, save/load, group identity, invalid cuts and gap overlap checks passed.');
