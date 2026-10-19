const assert=require('node:assert/strict'),P=require('../project'),G=require('../geometry'),C=require('./convert.cjs'),fs=require('fs'),os=require('os'),path=require('path');
let p=P.clone(require('../Moida-routing.moida-routing_finished.json'));const traces=JSON.stringify(p.traces);p.contactLayout='zebra';p.padPositions={};
const ports=P.getPorts(p).sort((a,b)=>a.x-b.x),scale=p.settings.widthMm/3000;
assert.equal(ports.length,64);assert.equal(ports[0].id,'B-W001');assert.equal(ports[15].id,'B-W016');assert.equal(ports[16].id,'T-N001');assert.equal(ports[63].id,'T-N048');
const near=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);
near((ports[0].x+ports[63].x)*scale/2,75);near((ports[16].x-ports[15].x)*scale,6);
for(const pad of ports){const b=G.bounds(G.pad(pad,p));near((b[2]-b[0])*scale,1);near((b[3]-b[1])*scale,3);near(b[1]*scale-108,3);}
p.padPositions['T-N001']={x:1200,y:2400};const clean=P.validate(p,C.BASE);assert.deepEqual(clean.padPositions,p.padPositions);assert.equal(clean.contactLayout,'zebra');assert.equal(JSON.stringify(clean.traces),traces);
const b=G.bounds(G.pad(P.PORT_BY_ID.get('T-N001'),clean));near((b[0]+b[2])/2,1200);near((b[1]+b[3])/2,2400);
const folder=fs.mkdtempSync(path.join(os.tmpdir(),'zebra-test-'));try{C.exportProject(clean,folder,{sample:true});const r=C.parse(fs.readFileSync(path.join(folder,'pcb/LCD.epcb2'),'utf8'));const pads=r.filter(r=>r.head.type==='PAD'&&r.body.num==='T-N001');assert.equal(pads.length,1);near(pads[0].body.defaultPad.width*.0254,1);near(pads[0].body.defaultPad.height*.0254,3);near(pads[0].body.centerX*.0254,60);near(pads[0].body.centerY*.0254,-120);}finally{fs.rmSync(folder,{recursive:true,force:true});}
assert.throws(()=>P.validate({...p,padPositions:{'INVALID':{x:1,y:2}}},C.BASE),/contact position/);
console.log('PASS: zebra spacing, centering, rectangles, moved contact, save/load, EDA export, unchanged traces');
