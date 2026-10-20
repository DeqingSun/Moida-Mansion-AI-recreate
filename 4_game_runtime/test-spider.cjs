const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),{loadOriginal}=require('./runtime.cjs');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'moida-spider-'));
try{
 const exe=path.join(dir,'probe');const b=spawnSync('cc',['-std=c11','-Wall','-Wextra','-Werror','-fsanitize=address,undefined',...['moida_core.c','moida_text.c','moida_room.c','moida_layout.c','moida_puzzle.c','moida_house.c','spider_probe.c'].map(f=>path.join(__dirname,'native',f)),'-o',exe],{encoding:'utf8'});assert.equal(b.status,0,b.stderr);
 const input=[],expected=[];
 for(let i=0;i<12;i++){const seed=1700000000000+i*1234567,{context}=loadOriginal({seedTime:seed});input.push(String(seed));context.testSeed=String(seed);const rows=JSON.parse(vm.runInContext(`JSON.stringify((()=>{const g=g_553648167[0],rows=[],random=initRand__pureZrandom_u237(BigInt(testSeed));for(let n=0;n<120;n++){const yes=n%7!==0&&n%3!==2&&prob__dice_u212({rand:random},10);rows.push([yes,String(random.a0),String(random.a1)]);}g.haveKeyIds={};for(let c=0;c<12;c++){g.playerLoc=g.house.rooms[c].loc;for(const cur of [...Array.from({length:51},(_,k)=>k*7),229])for(let v=0;v<3;v++){g.spiderHere=v!==0;g.spiderSearched=v===2;rows.push(nextSearchIconId__game_u3890(g,cur));}}return rows;})())`,context));expected.push(...rows);}

 const r=spawnSync(exe,[],{input:input.join('\n')+'\n',encoding:'utf8'});assert.equal(r.status,0,r.stderr);assert.deepEqual(r.stdout.trim().split('\n').map(JSON.parse),expected);console.log(`PASS: ${expected.length} spider spawn/RNG-state and search-order outputs match original across 12 houses.`);
}finally{fs.rmSync(dir,{recursive:true,force:true});}
