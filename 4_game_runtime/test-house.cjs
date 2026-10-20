const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');const {loadOriginal}=require('./runtime.cjs');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'moida-house-'));
try{
 const exe=path.join(temp,'house');
 const build=spawnSync(process.env.CC||'cc',['-std=c11','-Wall','-Wextra','-Werror','-fsanitize=address,undefined',...['moida_core.c','moida_text.c','moida_room.c','moida_layout.c','moida_puzzle.c','moida_house.c','house_demo.c'].map(f=>path.join(__dirname,'native',f)),'-o',exe],{encoding:'utf8'});assert.equal(build.status,0,build.stderr);
 const cases=Array.from({length:400},(_,i)=>({seed:1700000000000n+BigInt(i)*1234567n,attempts:i%2?11:1}));
 const native=spawnSync(exe,[],{input:cases.map(c=>`${c.seed} ${c.attempts}`).join('\n')+'\n',encoding:'utf8',maxBuffer:16*1024*1024});assert.equal(native.status,0,native.stderr);
 const actual=native.stdout.trim().split('\n').map(JSON.parse);const {context}=loadOriginal();let valid=0;
 for(let i=0;i<cases.length;i++){
 const {seed,attempts}=cases[i];const expected=JSON.parse(vm.runInContext(`JSON.stringify((()=>{
 initDice__dice_u290(${seed}n);const h=g_553648167[0].house;let valid=false,count=0;for(;count<${attempts};){count++;if(build__house_u113(h)){valid=true;break;}}
 const mask=s=>Object.keys(s).reduce((n,id)=>n|(1<<id),0);
 return {valid,attempts:count,entrance:toCoord__houseZcoord_u91(h.entranceLoc),assets:h.friendDefs.map(f=>f.assetIndex),friends:h.friendDefs.map(f=>f.entId),rooms:h.rooms.map(r=>({kind:r.kind,name:r.name,coord:toCoord__houseZcoord_u91(r.loc),effect:r.effect,exits:mask(r.exits),icons:Array.from(r.iconIds.pool?.ids||[]).slice(r.iconIds.start,r.iconIds.start+r.iconIds.count),entities:r.ents.items.slice(0,r.ents.len).map(e=>[e.def.id,e.searchableIconId,e.rustlingIconId,Array.from(e.untilGateIconIds.items).slice(0,e.untilGateIconIds.len),Array.from(e.afterGateIconIds.items).slice(0,e.afterGateIconIds.len)])})),random:[String(dice_1577058593[0].rand.a0),String(dice_1577058593[0].rand.a1)]};
 })())`,context,{timeout:2000}));
 try{assert.deepEqual(actual[i],expected,`seed ${seed} attempts ${attempts}`);}catch(e){fs.writeFileSync('/tmp/moida-house-mismatch.json',JSON.stringify({seed:String(seed),actual:actual[i],expected},null,2));throw e;}valid+=+expected.valid;
 }
 console.log(`PASS: ${cases.length} house generation cases (single attempts and 11-attempt retries); ${valid} successes. All room types, decorations, entities, friend assets and final PRNG states match.`);
}finally{fs.rmSync(temp,{recursive:true,force:true});}
