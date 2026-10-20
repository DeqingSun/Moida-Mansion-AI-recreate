const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm'),assert=require('node:assert/strict');const {spawnSync}=require('node:child_process');const {loadOriginal}=require('./runtime.cjs');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'moida-search-animation-'));
try{
const exe=path.join(dir,'probe');const build=spawnSync('cc',['-std=c11','-Wall','-Wextra','-Werror','-fsanitize=address,undefined',...['moida_core.c','moida_text.c','moida_room.c','moida_layout.c','moida_puzzle.c','moida_house.c','fairy_animation_probe.c'].map(f=>path.join(__dirname,'native',f)),'-o',exe],{encoding:'utf8'});assert.equal(build.status,0,build.stderr);
const commands=[],expected=[];
for(let i=0;i<8;i++){
const seed=1700000000000+i*1234567,{context}=loadOriginal({seedTime:seed});
for(let coord=0;coord<12;coord++){
const rows=JSON.parse(vm.runInContext(`JSON.stringify((()=>{const g=g_553648167[0],r=g.house.rooms[${coord}];let icon=0;const rows=[];for(let target=0;target<4;target++){icon=nextSearchIconId__houseZroom_u1712(r,icon,{});if(!icon)break;g.playerLoc=r.loc;g.varIcons[0]={id0:icon,id1:0};g.varIcons[11]={id0:icon,id1:0};g.activeRunnerKind=0;g.haveKeyIds={};g.usedKeyIds={};draw_house__game_u446(g);let complete=false;apply_search_found__game_u2113=()=>{complete=true;draw_house__game_u446(g);};start__game_u483(g.runners[0],25);const frames=[];for(let t=0;t<200&&!complete;t++){g.output.beeperHz=0;g.output.beeperDurationInMs=0;step__game_u4297(g.runners[0],g);frames.push({words:Array.from(g.output.spriteState.data),beeperHz:g.output.beeperHz,beeperDurationInMs:g.output.beeperDurationInMs,complete});}if(!complete)throw Error('timeout');rows.push({icon,frames});}return rows;})())`,context));
for(const row of rows){commands.push(`${seed} ${coord} ${row.icon}`);expected.push(...row.frames);}
}}
const result=spawnSync(exe,[],{input:commands.join('\n')+'\n',encoding:'utf8',maxBuffer:32*1024*1024});assert.equal(result.status,0,result.stderr);const actual=result.stdout.trim().split('\n').map(JSON.parse);assert.equal(actual.length,expected.length);actual.forEach((f,i)=>assert.deepEqual(f,expected[i],`frame ${i}`));console.log(`PASS: ${commands.length} fairy search animations, ${actual.length} frames match original scheduler, text, target blinking and beeps. Outcome boundary replaced with room restoration in both versions.`);
}finally{fs.rmSync(dir,{recursive:true,force:true});}
