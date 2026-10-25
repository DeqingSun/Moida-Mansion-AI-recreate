const assert=require('node:assert/strict'),M=require('./model.js'),S=require('./auto-slice.js');
const square={rings:[[[500,500],[1500,500],[1500,1500],[500,1500]]],bounds:[500,500,1500,1500],point:[750,750]};
const D={sourceHash:'slice-test',segments:[{id:'A',bit:7,islands:[square]}]};
let p=M.create(D,4,4,75);p.nodes['1:1']=[700,800];M.placePoints(p,D,['1:1']);assert.equal(M.artwork(D,p).length,1);assert.deepEqual(p.assignments.A_0,{t:1,b:1});
let before=M.clone(p);p.nodes['2:1']=[1200,800];M.placePoints(p,D,['2:1'],before);const two=M.artwork(D,p);assert.equal(two.length,2);assert(two.every(i=>i.bit===7&&i.parentId==='A'));assert(!S.contains(two[0],[950,800])&&!S.contains(two[1],[950,800]));assert.equal(Math.min(...two[1].rings.flat().map(q=>q[0]))-Math.max(...two[0].rings.flat().map(q=>q[0])),4);
assert.deepEqual(M.validate(JSON.parse(JSON.stringify(p)),D),p);
const savedTwo=M.clone(p);before=M.clone(p);p.nodes['3:1']=[1000,1250];M.placePoints(p,D,['3:1'],before);assert.equal(M.artwork(D,p).length,3);
before=M.clone(p);p.nodes['3:1']=[2000,1600];M.placePoints(p,D,['3:1'],before);assert.equal(M.artwork(D,p).length,2);assert.deepEqual(M.artwork(D,p),two);
before=M.clone(p);p.nodes['2:1']=[2000,1800];M.placePoints(p,D,['2:1'],before);assert.equal(M.artwork(D,p).length,1);assert.deepEqual(M.artwork(D,p)[0].rings,square.rings);assert.deepEqual(p.assignments.A_0,{t:1,b:1});
before=M.clone(p);p.nodes['1:1']=[-500,800];M.placePoints(p,D,['1:1'],before);assert.deepEqual(p.assignments,{});assert.deepEqual(p.meshAnchors,{});
const cleared=M.clone(savedTwo);M.placePoints(cleared,D,['2:1'],savedTwo,true);assert.equal(M.artwork(D,cleared).length,1);
const close=M.clone(savedTwo);close.nodes['2:1']=[701,800];assert.throws(()=>M.placePoints(close,D,['2:1'],savedTwo),/too close/);
// Batch placement must produce the same split in a single transaction.
const batch=M.create(D,4,4,75);batch.nodes={'1:1':[700,800],'2:1':[1200,800]};M.placePoints(batch,D,['1:1','2:1']);assert.deepEqual(M.artwork(D,batch),two);
// Hole interiors are not targets and stay empty after partitioning.
const holed={...square,rings:[...square.rings,[[900,900],[900,1100],[1100,1100],[1100,900]]]};assert(!S.contains(holed,[1000,1000]));
const pieces=S.partition({...holed,id:'H',parentId:'H',bit:8},[{t:1,b:1,point:[700,800]},{t:2,b:1,point:[1200,800]}],4);assert(pieces.every(i=>!S.contains(i,[1000,1000])));
console.log('PASS: 1→2→3→2→1→0 placements, physical gap, original artwork restoration, assignments, batch drops, save/load, close-point rejection, holes.');
