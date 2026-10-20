const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');const {loadOriginal}=require('./runtime.cjs');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'moida-puzzle-'));
try{
 const exe=path.join(temp,'puzzle');
 const build=spawnSync(process.env.CC||'cc',['-std=c11','-Wall','-Wextra','-Werror','-fsanitize=address,undefined',...['moida_core.c','moida_layout.c','moida_puzzle.c','puzzle_demo.c'].map(f=>path.join(__dirname,'native',f)),'-o',exe],{encoding:'utf8'});assert.equal(build.status,0,build.stderr);
 const seeds=[0n,-1n,-9223372036854775808n,9223372036854775807n,...Array.from({length:3000},(_,i)=>1700000000000n+BigInt(i)*1234567n)];
 const native=spawnSync(exe,[],{input:seeds.join('\n')+'\n',encoding:'utf8',maxBuffer:16*1024*1024});assert.equal(native.status,0,native.stderr);
 const actual=native.stdout.trim().split('\n').map(JSON.parse);assert.equal(actual.length,seeds.length);
 const {context}=loadOriginal();let valid=0;const kinds=new Set();
 for(let i=0;i<seeds.length;i++){
 const expected=JSON.parse(vm.runInContext(`JSON.stringify((()=>{
 initDice__dice_u290(${seeds[i]}n);const loc={suite:rand__house_u222(dice_1577058593[0],new Int32Array([10,40,40,10])),floor:1};
 const p=g_553648167[0].house.puzzle;const valid=build__houseZpuzzle_u3758(p,loc);
 const mask=s=>Object.keys(s).reduce((n,id)=>n|(1n<<BigInt(id)),0n).toString();
 return {valid,entrance:toCoord__houseZcoord_u91(loc),entities:p.defs.items.slice(0,p.defs.len).map(e=>[e.kind,toCoord__houseZcoord_u91(e.loc),e.searchableContents,e.gate.kind,mask(e.gate.entIds),e.exit.has?e.exit.val:-1,e.hintEntId.has?e.hintEntId.val:-1,e.ghostRevealEntId.has?e.ghostRevealEntId.val:-1,...Array.from(e.ghostPath)]),random:[String(dice_1577058593[0].rand.a0),String(dice_1577058593[0].rand.a1)]};
 })())`,context,{timeout:1000}));
 assert.deepEqual(actual[i],expected,`seed ${seeds[i]}`);valid+=+expected.valid;expected.entities.forEach(e=>kinds.add(e[0]));
 }
 console.log(`PASS: ${seeds.length} puzzle attempts match original entities, gates, hints, ghost paths, success/failure and final PRNG state; ${valid} successful, entity kinds ${[...kinds].sort()}.`);
}finally{fs.rmSync(temp,{recursive:true,force:true});}
