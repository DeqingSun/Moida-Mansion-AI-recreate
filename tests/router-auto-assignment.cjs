const assert=require('node:assert/strict'),P=require('../routing-editor/project.js'),G=require('../routing-editor/geometry.js');
const rect=(x,y,w,h)=>({rings:[[[x,y],[x+w,y],[x+w,y+h],[x,y+h]]],point:[x+w/2,y+h/2],bounds:[x,y,x+w,y+h]});
const data={sourceHash:'test',segments:[{id:'A',islands:[rect(0,0,20,20),rect(100,0,20,20)]}]};
const t={id:'new',layer:'top',net:'NEW',widthMm:.1,points:[[-10,10],[30,10]]};
function setup(){const p=P.empty(data);p.assignments.A.top='OLD';p.traces=[P.clone(t)];return p}
let p=setup(),r=G.autoAssignTouched(p,data,p.traces[0]);assert.equal(p.assignments.A.top,'NEW');assert.deepEqual(r.segments,['A']);assert.equal(p.assignments.A.bottom,'');
p=setup();p.traces.push({...t,id:'other',net:'OTHER',points:[[90,10],[130,10]]});r=G.autoAssignTouched(p,data,p.traces[0]);assert.equal(p.assignments.A.top,'OLD');assert.deepEqual(r.blockedSegments,['A']);
p.traces[1].layer='bottom';G.autoAssignTouched(p,data,p.traces[0]);assert.equal(p.assignments.A.top,'NEW');
p=setup();p.traces.push({...t,id:'same'});G.autoAssignTouched(p,data,p.traces[0]);assert.equal(p.assignments.A.top,'NEW');
p=setup();p.traces[0].points=[[-10,-2],[30,-2]];G.autoAssignTouched(p,data,p.traces[0]);assert.equal(p.assignments.A.top,'OLD');p.traces[0].widthMm=.2;G.autoAssignTouched(p,data,p.traces[0]);assert.equal(p.assignments.A.top,'NEW'); // boundary contact at full stroke width
const port=P.PORT_BY_ID.get('T-N001');p=setup();p.pads[port.id]='OLD';p.traces[0].points=[[port.x-8,port.y],[port.x+8,port.y]];r=G.autoAssignTouched(p,data,p.traces[0]);assert.equal(p.pads[port.id],'NEW');assert(r.pads.includes(port.id));
p.pads[port.id]='OLD';p.traces.push({...t,id:'foreign',net:'OTHER',points:[[port.x,port.y-8],[port.x,port.y+8]]});r=G.autoAssignTouched(p,data,p.traces[0]);assert.equal(p.pads[port.id],'OLD');assert(r.blockedPads.includes(port.id));
const holed={sourceHash:'hole',segments:[{id:'H',islands:[{rings:[[[0,0],[100,0],[100,100],[0,100]],[[20,20],[20,80],[80,80],[80,20]]]}]}]};p=P.empty(holed);p.traces=[{...t,points:[[30,50],[70,50]]}];G.autoAssignTouched(p,holed,p.traces[0]);assert.equal(p.assignments.H.top,'');
console.log('Automatic assignment passed: reassignment, all-island conflict guard, layer isolation, same-net contact, width edits, boundary contact, mid-trace pads, conflicting pads, artwork holes.');
