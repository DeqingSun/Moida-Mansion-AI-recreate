const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),os=require('os');
const DXF=require('../dxf'),C=require('./convert.cjs'),G=require('../geometry');
const p=require('../Moida-routing.moida-routing_finished.json'),data=C.layout(p),before=JSON.stringify(p);
assert.throws(()=>DXF.exportDXF(p,data,[]),/Select/);
assert.throws(()=>DXF.exportDXF(p,data,['OTHER']),/Select/);
const output=process.argv[2]||fs.mkdtempSync(path.join(os.tmpdir(),'moida-dxf-'));
fs.mkdirSync(output,{recursive:true});
for(let mask=1;mask<8;mask++){
 const layers=['TOP','BOTTOM','SEGMENT'].filter((_,i)=>mask&(1<<i));
 const text=DXF.exportDXF(p,data,layers);
 const lines=text.trim().split(/\r?\n/),seen=new Set();
 let entities=false;for(let i=0;i<lines.length;i+=2){if(lines[i]==='2'&&lines[i+1]==='ENTITIES')entities=true;if(lines[i]==='0'&&lines[i+1]==='ENDSEC')entities=false;if(entities&&lines[i]==='8')seen.add(lines[i+1]);}
 assert(text.includes('BLOCK_RECORD')&&text.includes('AcDbLayout'));
 assert(text.includes('330\r\n'+require('../dxf-template').modelSpaceOwner));
 assert.deepEqual([...seen].sort(),layers.slice().sort());
 fs.writeFileSync(path.join(output,mask+'.dxf'),text);
}
// SEGMENT must use passed edited geometry, not original artwork.
const edited=JSON.parse(JSON.stringify(data));edited.segments=edited.segments.slice(0,1);
for(const i of edited.segments[0].islands)for(const r of i.rings)for(const q of r)q[0]+=10;
assert.notEqual(DXF.exportDXF(p,edited,['SEGMENT']),DXF.exportDXF(p,{...data,segments:data.segments.slice(0,1)},['SEGMENT']));
assert.equal(JSON.stringify(p),before);
const nets=G.build(p,data).netMap,area=paths=>G.area(G.union(paths))*(p.settings.widthMm/3000)**2;
fs.writeFileSync(path.join(output,'expected.json'),JSON.stringify({TOP:area([...nets.top.values()].flatMap(n=>n.paths)),BOTTOM:area([...nets.bottom.values()].flatMap(n=>n.paths)),SEGMENT:data.segments.reduce((n,s)=>n+area(G.segment(s)),0)}));
console.log('PASS: seven layer selections, edited geometry, no mutation. Files:',output);
