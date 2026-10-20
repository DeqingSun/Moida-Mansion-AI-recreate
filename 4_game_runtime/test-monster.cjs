const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),{loadOriginal}=require('./runtime.cjs');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'moida-monster-'));
try{
 const exe=path.join(dir,'probe');const b=spawnSync('cc',['-std=c11','-Wall','-Wextra','-Werror','-fsanitize=address,undefined',...['moida_core.c','moida_text.c','moida_room.c','moida_layout.c','moida_puzzle.c','moida_house.c','monster_probe.c'].map(f=>path.join(__dirname,'native',f)),'-o',exe],{encoding:'utf8'});assert.equal(b.status,0,b.stderr);
 const input=[],expected=[];
 for(let i=0;i<40;i++){const seed=1700000000000+i*1234567,{context}=loadOriginal({seedTime:seed});input.push(String(seed));const rows=JSON.parse(vm.runInContext(`JSON.stringify((()=>{const g=g_553648167[0],rows=g.house.rooms.map(r=>Object.keys(monstaPeepIndexes__houseZroom_u605(r)).reduce((a,k)=>a|(1<<k),0));dice_1577058593[0].rand=initRand__pureZrandom_u237(12345n);g.escapeRoomCycle=0;for(let i=0;i<36;i++){g.output.spriteState.data.fill(0);draw_next_escape_room__game_u460(g);rows.push([g.escapeRoomCycle,g.monsta.iconId,g.monsta.peep.spotIconId,Object.keys(g.monsta.guardingExits).reduce((a,k)=>a|(1<<k),0),Array.from(g.output.spriteState.data)]);}return rows;})())`,context));expected.push(...rows);}

 const r=spawnSync(exe,[],{input:input.join('\n')+'\n',encoding:'utf8'});assert.equal(r.status,0,r.stderr);assert.deepEqual(r.stdout.trim().split('\n').map(JSON.parse),expected);console.log(`PASS: ${expected.length} monster hiding-spot masks and seeded ending-room snapshots match original across 40 houses.`);
}finally{fs.rmSync(dir,{recursive:true,force:true});}
