const assert=require('node:assert/strict');
require('../2_refine_routing/segments-data.js');
const M=require('./model.js'),D=globalThis.ROUTER_DATA,items=M.artwork(D);
const p=M.create(D);assert.equal(p.cols,60);assert.equal(p.rows,16);assert.equal(p.widthMm,75);assert.deepEqual(p.assignments,{});
const siblings=items.filter(i=>i.parentId==='C02S106');assert(siblings.length>1);
M.assign(p,items,siblings.map(i=>i.id),60,16);
assert.throws(()=>M.assign(p,items,[items[0].id],60,16),/already belongs/);
assert.throws(()=>M.resize(p,48,16,75),/remove assigned/);
assert.throws(()=>M.resize(p,60,15,75),/remove assigned/);
assert.equal(M.resize(p,64,16,100).widthMm,100);
p.nodes['60:16']=[800,900];assert.deepEqual(M.validate(JSON.parse(JSON.stringify(p)),D),p);
assert.throws(()=>M.validate({...p,sourceHash:'wrong'},D),/original artwork/);
assert.throws(()=>M.validate({...p,nodes:{'60:16':[Infinity,2]}},D),/Invalid mesh point/);
assert.throws(()=>M.assign(p,items,['bad'],1,1),/Select an artwork/);
assert.throws(()=>M.create(D,1.5,16,75));
const empty=M.create(D);empty.nodes['60:16']=[800,900];const shrunk=M.resize(empty,48,16,75);assert.deepEqual(shrunk.nodes,{});
console.log(`PASS: ${items.length} original islands; fresh defaults, sibling sharing, pair conflicts, shrink protection, schema validation, and round-trip.`);
// Topology checks cover proper crossings, accidental touches, collapsed edges,
// collinear overlaps, legitimate common endpoints, and a one-dimensional mesh.
const grid=M.create(D,4,4),point=M.position(grid,2,2);
assert(M.topology(grid).ok);
const crossed=M.clone(grid);crossed.nodes['2:2']=M.position(grid,4,4);assert(!M.topology(crossed).ok);
const line=M.create(D,3,1);assert(M.topology(line).ok);line.nodes['2:1']=[2500,1080];assert(!M.topology(line).ok);
const resolved=M.deform(grid,2,2,[2200,1600]);assert(resolved.check.ok);assert(resolved.adjusted>0);assert.deepEqual(M.position(resolved.project,2,2),[2200,1600]);assert.deepEqual(grid.nodes,{});
const anchored=M.create(D,4,4);anchored.assignments[items[0].id]={t:3,b:3};const fixed=M.position(anchored,3,3);const blocked=M.deform(anchored,2,2,fixed);assert(!blocked.check.ok);assert.deepEqual(M.position(blocked.project,3,3),fixed);
const large=M.create(D);const t0=performance.now();const moved=M.deform(large,1,1,items.find(i=>i.id==='C02S106_0').point);assert(moved.check.ok);console.log(`PASS: crossing/touch/overlap detection, automatic reshaping, pinned pair rejection; 60×16 drag ${(performance.now()-t0).toFixed(0)} ms.`);

const transfer=M.create(D);M.assign(transfer,items,siblings.map(i=>i.id),4,16);
M.assign(transfer,items,[items[1].id],5,16);
M.assign(transfer,items,[items[0].id],4,16,true);
assert.deepEqual(transfer.assignments[items[0].id],{t:4,b:16});
assert(siblings.every(i=>!transfer.assignments[i.id]));
assert.deepEqual(transfer.assignments[items[1].id],{t:5,b:16});
const malformed=M.clone(transfer);malformed.assignments[siblings[0].id]={t:4,b:16};
assert.throws(()=>M.validate(malformed,D),/already belongs/);
console.log('PASS: explicit pair transfer clears former siblings, preserves other nets; imports still reject duplicate owners.');
// Incremental checks must match full checks for edits to a valid baseline.
{const data={sourceHash:'local-check',segments:[]},base=M.create(data,8,8);for(const delta of [[5,5],[500,0],[-100,100],[0,-400]]){const next=M.clone(base),q=M.position(base,4,4);next.nodes['4:4']=[q[0]+delta[0],q[1]+delta[1]];assert.equal(M.topology(next,base).ok,M.topology(next).ok);}console.log('PASS: local changed-edge and cell checks match full checks for valid and crossing moves.');}
