const assert=require('node:assert/strict'),M=require('./model.js'),S=require('./auto-slice.js');
const data={sourceHash:'manual-test',segments:[{id:'A',bit:0,islands:[{rings:[[[100,100],[500,100],[500,500],[100,500]]],bounds:[100,100,500,500],point:[200,200]}]}]};
let p=M.create(data,4,4,300);
p=M.manualSlice(p,data,'A_0',null,{ends:[[300,90],[300,510]],widthMm:.1});
let pieces=M.artwork(data,p);assert.equal(pieces.length,2);assert(pieces.every(i=>i.manualPiece));
assert.deepEqual(M.validate(JSON.parse(JSON.stringify(p)),data),p);
p.nodes={'1:1':[200,200],'2:1':[400,200]};
p=M.placePoints(p,data,['1:1','2:1'],p);
assert.equal(M.artwork(data,p).length,2);assert.equal(S.slices(M.artwork(data),p).length,1);
assert.equal(p.assignments.A_0_subManual_0.t,1);assert.equal(p.assignments.A_0_subManual_1.t,2);
assert.throws(()=>M.manualSlice(p,data,'A_0',1,{ends:[[300,200],[300,400]],widthMm:.1}),/separate/);
assert.throws(()=>M.manualSlice(p,data,'A_0',1,{ends:[[200,90],[200,510]],widthMm:.1}),/contact/);
// Manual geometry persists when contacts leave; it never creates auto dividers.
const previous=M.clone(p);p.nodes['2:1']=[600,600];p=M.placePoints(p,data,['2:1'],previous);
assert.equal(M.artwork(data,p).length,2);assert.equal(S.slices(M.artwork(data),p).length,1);
const moved=M.editArtwork(p,data,'A_0',[10,0],null,'island');
assert.deepEqual(moved.manualSlices.A_0[0].ends,[[310,90],[310,510]]);
const more=M.manualSlice(p,data,'A_0',null,{ends:[[90,300],[510,300]],widthMm:.2});
assert.equal(M.artwork(data,more).length,4);
const removed=M.manualSlice(p,data,'A_0',1,null);assert.equal(M.artwork(data,removed).length,1);
assert.throws(()=>M.validate({...p,manualSlices:{A_0:[{id:1,widthMm:-1,ends:[[1,1],[2,2]]}]}},data),/Invalid manual/);
console.log('PASS: finite manual cuts, independent assignments, no automatic cuts, contact protection, persistence, moving artwork, multiple cuts and removal.');
// Several contacts can be separated in one staged batch instead of requiring
// an invalid intermediate state with two contacts in one manual piece.
let multi=M.create(data,4,4,300);multi.nodes={'1:1':[180,200],'2:1':[300,200],'3:1':[420,200]};
multi=M.placePoints(multi,data,['1:1','2:1','3:1'],multi);
multi=M.manualSlice(multi,data,'A_0',null,[{ends:[[240,90],[240,510]],widthMm:.1},{ends:[[360,90],[360,510]],widthMm:.1}]);
assert.equal(M.artwork(data,multi).length,3);assert.equal(S.slices(M.artwork(data),multi).length,2);
assert.deepEqual(Object.values(multi.assignments).map(a=>a.t).sort(),[1,2,3]);
// A trace contact must remain in an assigned piece when its source is split.
const data2=structuredClone(data);data2.segments.push({id:'B',bit:1,islands:[{rings:[[[600,100],[700,100],[700,500],[600,500]]],bounds:[600,100,700,500],point:[650,200]}]});
let wired=M.create(data2,4,4,300);wired.assignments={A_0:{t:1,b:1},B_0:{t:1,b:2}};
wired.routes=[{from:'A_0',to:'B_0',layer:'SEG',net:1,widthMm:.12,clearanceMm:.12,crossClearanceMm:.1,pushMm:0,points:[[450,200],[650,200]]}];
const split=M.manualSlice(wired,data2,'A_0',null,{ends:[[300,90],[300,510]],widthMm:.1});
assert.equal(split.routes[0].from,'A_0_subManual_1');assert.deepEqual(split.routes[0].points,wired.routes[0].points);
assert.throws(()=>M.manualSlice(wired,data2,'A_0',null,{ends:[[450,90],[450,510]],widthMm:.1}),/disconnect/);
console.log('PASS: batch replaces multiple auto slices; saved route contacts remap safely and cuts through contacts are rejected.');
