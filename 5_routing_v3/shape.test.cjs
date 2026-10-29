const assert=require('node:assert/strict'),M=require('./model.js');
const island=(x,y)=>({rings:[[[x,y],[x+40,y],[x+40,y+40],[x,y+40]]],bounds:[x,y,x+40,y+40],point:[x+20,y+20]});
const data={sourceHash:'shape-test',segments:[{id:'A',bit:1,islands:[island(100,100),island(100,200)]},{id:'B',bit:2,islands:[island(300,100)]}]};
const p=M.create(data,4,4,300);p.assignments={A_0:{t:1,b:1},B_0:{t:1,b:2}};p.routes=[{from:'A_0',to:'B_0',layer:'SEG',net:1,widthMm:.12,clearanceMm:.12,crossClearanceMm:.1,pushMm:.15,points:[[120,120],[320,120]]}];
const moved=M.editArtwork(p,data,'A_0',[10,0]);assert.deepEqual(moved.routes[0].points[0],[130,120]);assert.equal(M.artwork(data,moved).find(i=>i.id==='A_1').rings[0][0][0],110);assert.equal(p.geometry,undefined);assert.deepEqual(M.validate(moved,data),moved);
const vertex=M.editArtwork(moved,data,'A_0',[108,98],[0,0]);assert.deepEqual(vertex.geometry.A_0[0][0],[108,98]);assert.throws(()=>M.editArtwork(p,data,'A_0',[150,120],[0,0]),/cross/);assert.throws(()=>M.editArtwork(p,data,'A_0',[190,0]),/spacing/);assert.throws(()=>M.editArtwork(p,data,'A_0',[-200,0]),/screen/);
console.log('PASS: whole-segment movement, endpoint follow, vertex edit, persistence, invalid geometry and overlap rejection.');
const editedTwice=M.editArtwork(vertex,data,'A_0',[152,102],[0,1]);const reset=M.resetVertex(editedTwice,data,'A_0',[0,0]);assert.deepEqual(reset.geometry.A_0[0][0],[110,100]);assert.deepEqual(reset.geometry.A_0[0][1],[152,102]);assert.deepEqual(reset.geometry.A_1,editedTwice.geometry.A_1);assert.deepEqual(M.validate(reset,data),reset);console.log('PASS: resetting one vertex preserves segment translation, other vertices, siblings, and persistence.');

const single=M.editArtwork(p,data,'A_0',[10,0],null,'island');
assert.deepEqual(single.routes[0].points[0],[130,120]);
assert.deepEqual(M.artwork(data,single).find(i=>i.id==='A_1').rings,M.artwork(data,p).find(i=>i.id==='A_1').rings);
assert.equal(single.geometry.A_1,undefined);
assert.deepEqual(M.validate(single,data),single);
console.log('PASS: selected island moves independently and its trace endpoint follows.');
