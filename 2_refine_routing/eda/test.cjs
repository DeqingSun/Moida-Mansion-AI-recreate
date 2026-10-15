const assert=require('node:assert/strict'),fs=require('fs'),os=require('os'),path=require('path'),c=require('./convert.cjs'),P=require('../project'),G=require('../geometry');
const raw=JSON.parse(fs.readFileSync(path.join(__dirname,'../Moida-routing.moida-routing_finished.json'))),folder=fs.mkdtempSync(path.join(os.tmpdir(),'moida-eda-test-'));
const counts=c.exportProject(raw,folder);assert.equal(counts.components,780);assert.equal(counts.pads,64);assert.equal(counts.traces,3267);
const untouched=c.importProject(folder);assert.equal(untouched.summary.changedIslands,0);assert.deepEqual(untouched.project.assignments,raw.assignments);assert.equal(untouched.project.settings.widthMm,150);
const file=path.join(folder,'pcb/LCD.epcb2'),original=fs.readFileSync(file,'utf8'),records=c.parse(original),component=records.find(r=>r.head.type==='COMPONENT'),line=records.find(r=>r.head.type==='LINE'),map=JSON.parse(fs.readFileSync(path.join(folder,'moida-map.json'))),sid=map.components[component.head.id].island;
component.body.x+=10;component.body.y+=5;line.body.width=.12/.0254;fs.writeFileSync(file,c.encode(records));const changed=c.importProject(folder);assert.equal(changed.summary.changedIslands,1);assert(Math.abs(changed.project.traces.find(t=>t.id==='eda-'+line.head.id).widthMm-.12)<1e-9);
const old=c.layout(raw).segments.find(s=>s.id===sid),moved=c.layout(changed.project).segments.find(s=>s.id===sid);assert(Math.abs((moved.bounds[0]-old.bounds[0])*.05-.254)<.0001);assert(Math.abs((moved.bounds[1]-old.bounds[1])*.05+.127)<.0001);assert.deepEqual(P.validate(changed.project,c.BASE).edaGeometry,changed.project.edaGeometry);
// A new webpage slice operates on the moved artwork and survives save/load.
const cut={target:moved.cutId,width:1,points:[[(moved.bounds[0]+moved.bounds[2])/2,moved.bounds[1]-5],[(moved.bounds[0]+moved.bounds[2])/2,moved.bounds[3]+5]]};const sliced=P.layoutData(c.BASE,[...changed.project.cuts,cut],changed.project.edaGeometry);assert(sliced.segments.some(s=>s.cutId.startsWith(moved.cutId+'_sub')));
// Real EDA saves deletions as empty-body tombstones, sometimes without a final delimiter.
const removed=records.find(r=>r.head.type==='LINE'&&r!==line);
const tombstone=JSON.stringify({...removed.head,ticket:1e9})+'|||\n';
const replacement={...line.body,width:.15/.0254};
fs.writeFileSync(file,c.encode(records)+tombstone+JSON.stringify({...line.head,ticket:1e9+1})+'||'+JSON.stringify(replacement));
const journal=c.importProject(folder);
assert.equal(journal.project.traces.length,3266);
assert(!journal.project.traces.some(t=>t.id==='eda-'+removed.head.id));
assert(Math.abs(journal.project.traces.find(t=>t.id==='eda-'+line.head.id).widthMm-.15)<1e-9);
assert.equal(journal.project.traces.filter(t=>t.id==='eda-'+line.head.id).length,1);
fs.writeFileSync(file,c.encode([...records,{head:{type:'VIA',id:'unsupported'},body:{}}]));assert.throws(()=>c.importProject(folder),/Unsupported copper/);
fs.writeFileSync(file,c.encode(records.filter(r=>r!==component)));assert.throws(()=>c.importProject(folder),/Missing island/);
fs.rmSync(folder,{recursive:true});console.log('PASS: full export/import; geometry and nets preserved; moved component; wire width; new slice on moved geometry; deleted-wire journals and updated records replayed; invalid copper and missing islands rejected.');
