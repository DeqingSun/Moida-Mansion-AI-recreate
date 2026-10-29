const assert=require('node:assert/strict'),M=require('./model.js'),E=require('./electrodes.js'),R=require('./routing.js');
const data={sourceHash:'pads-test',segments:[{id:'a',islands:[{point:[1820,2100],bounds:[1800,2080,1840,2120],rings:[[[1800,2080],[1840,2080],[1840,2120],[1800,2120]]]}]}]};
let p=M.create(data);p.electrodes={gapMm:3};p.assignments.a_0={t:30,b:1};const pads=E.items(p),u=40;
assert.equal(pads.length,76);assert.equal(pads[15].id,'PAD_COM_16');assert.equal(pads[16].id,'PAD_SEG_1');assert.equal(pads[75].id,'PAD_SEG_60');
assert.equal(pads[0].bounds[0]/u,-.75);assert.equal(pads.at(-1).bounds[2]/u,75.75);assert.equal((pads[16].bounds[0]-pads[15].bounds[2])/u,1.5);
for(const pad of pads){assert.equal((pad.bounds[2]-pad.bounds[0])/u,.5);assert.equal((pad.bounds[3]-pad.bounds[1])/u,3);}
const items=M.artwork(data,p),pad=items.find(i=>i.id==='PAD_SEG_30');assert.deepEqual(R.common(p,'a_0',pad.id),['SEG']);assert.deepEqual(R.common(p,'a_0','PAD_COM_1'),['COM']);assert.deepEqual(R.common(p,'a_0','PAD_SEG_29'),[]);
const request={from:'a_0',to:pad.id,layer:'SEG',widthMm:.12,clearanceMm:.12,crossClearanceMm:.1,pushMm:0,points:[[1820,2100],pad.point]};
p.routes=[R.plan(p,items,request).route];assert.doesNotThrow(()=>M.validate(p,data));const moved=M.moveElectrodes(p,5);assert.equal(moved.routes[0].points.at(-1)[1],pad.point[1]+80);assert.deepEqual(moved.routes[0].points[0],[1820,2100]);assert.doesNotThrow(()=>M.validate(moved,data));assert.deepEqual(M.validate(JSON.parse(JSON.stringify(moved)),data),moved);
assert.throws(()=>M.validate({...p,electrodes:{gapMm:-1}},data),/gap/);assert.throws(()=>M.assign(p,items,[pad.id],1,1),/artwork/);
console.log('PASS: 77-position centered geometry, fixed nets/layers, outside-screen route, vertical movement/contact follow, persistence and invalid inputs.');
const comData={sourceHash:'com-test',segments:[{id:'c',islands:[{point:[260,2100],bounds:[240,2080,280,2120],rings:[[[240,2080],[280,2080],[280,2120],[240,2120]]]}]}]},cp=M.create(comData);cp.electrodes={gapMm:3};cp.assignments.c_0={t:1,b:8};const ci=M.artwork(comData,cp),contact=ci.find(i=>i.id==='PAD_COM_8');cp.routes=[R.plan(cp,ci,{...request,from:'c_0',to:contact.id,layer:'COM',points:[[260,2100],contact.point]}).route];assert.doesNotThrow(()=>M.validate(cp,comData));console.log('PASS: COM bottom-layer contact routing.');
