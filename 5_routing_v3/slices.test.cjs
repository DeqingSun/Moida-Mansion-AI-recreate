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
const adjustable=M.clone(savedTwo),slice=S.slices(M.artwork(D),adjustable)[0];
adjustable.sliceEdits={[slice.key]:{widthMm:.2,ends:[[900,500],[1000,1500]]}};
const adjusted=M.validate(adjustable,D);assert.equal(S.slices(M.artwork(D),adjusted)[0].widthMm,.2);assert.notDeepEqual(M.artwork(D,adjusted),two);assert.deepEqual(M.validate(JSON.parse(JSON.stringify(adjusted)),D),adjusted);
const invalid=M.clone(adjusted);invalid.sliceEdits[slice.key].ends=[[600,500],[600,1500]];assert.throws(()=>M.validate(invalid,D),/contacts/);
const moved=M.clone(adjusted);moved.nodes['2:1']=[2000,1800];M.placePoints(moved,D,['2:1'],adjusted);const cleaned=M.validate(moved,D);assert.equal(Object.keys(cleaned.sliceEdits).length,0);assert.deepEqual(M.artwork(D,cleaned)[0].rings,square.rings);
console.log('PASS: adjusted slice width/angle, save/load, anchor protection, stale edit removal.');
// Removing an unused slice must preserve traces attached to the surviving net.
const routedData={...D,segments:[...D.segments,{id:'B',bit:8,islands:[{rings:[[[300,700],[400,700],[400,900],[300,900]]],bounds:[300,700,400,900],point:[350,800]}]}]};
const routed=M.clone(savedTwo);routed.assignments.B_0={t:1,b:2};routed.routes=[{from:'B_0',to:'A_0_subS1C1_0',layer:'SEG',net:1,widthMm:.12,clearanceMm:.12,crossClearanceMm:.1,pushMm:0,points:[[350,800],[700,800]]}];assert.doesNotThrow(()=>M.validate(routed,routedData));
const merged=M.clone(routed);merged.nodes['2:1']=[2000,1800];M.placePoints(merged,routedData,['2:1'],routed);assert.equal(merged.routes[0].to,'A_0');assert.deepEqual(merged.routes[0].points,routed.routes[0].points);assert.doesNotThrow(()=>M.validate(merged,routedData));
const split=M.clone(merged);split.nodes['2:1']=[1200,800];M.placePoints(split,routedData,['2:1'],merged);assert.equal(split.routes[0].to,'A_0_subS1C1_0');assert.doesNotThrow(()=>M.validate(split,routedData));
const disconnected=M.clone(routed);disconnected.nodes['1:1']=[2000,1800];assert.throws(()=>M.placePoints(disconnected,routedData,['1:1'],routed),/disconnect/);
console.log('PASS: slice merge/split remaps confirmed contacts, fixed trace geometry, real disconnection rejected.');
const fork={id:'fork',sourceId:'fork',rings:[[[500,500],[1500,500],[1500,700],[700,700],[700,1100],[1500,1100],[1500,1300],[500,1300]]],bounds:[500,500,1500,1300],point:[600,600]},sites=[{t:1,b:1,point:[600,600]},{t:2,b:1,point:[1200,600]}],finiteKey=S.sliceKey('fork',sites[0],sites[1]);
const finite=S.partition(fork,sites,4,{[finiteKey]:{widthMm:4,ends:[[950,500],[950,700]],finite:true}});assert(finite.some(i=>S.contains(i,[950,1200])),'artwork beyond the end remains intact');assert(!finite.some(i=>S.contains(i,[950,600])),'actual finite cut removes gap');assert.throws(()=>S.partition(fork,sites,4,{[finiteKey]:{widthMm:4,ends:[[950,550],[950,650]],finite:true}}),/too short/);console.log('PASS: finite cuts stop at handles and reject cuts that leave contacts connected.');
const displayProject={widthMm:3000,cols:2,rows:1,sliceGapMm:4,meshAnchors:{fork:sites},nodes:{'1:1':[600,600],'2:1':[1200,600]}};
const shown=S.visibleSlices([fork],displayProject);assert.equal(shown.length,1);assert.equal(shown[0].segments.length,2);assert(shown[0].segments.every(([a,b])=>S.contains(fork,[(a[0]+b[0])/2,(a[1]+b[1])/2])));
const separated={...fork,rings:[[[500,500],[700,500],[700,700],[500,700]],[[1100,500],[1300,500],[1300,700],[1100,700]]],bounds:[500,500,1300,700]};assert.equal(S.slices([separated],displayProject).length,1);assert.equal(S.visibleSlices([separated],displayProject).length,0);console.log('PASS: empty-space slice guides hidden and displayed lines clipped to actual artwork.');
