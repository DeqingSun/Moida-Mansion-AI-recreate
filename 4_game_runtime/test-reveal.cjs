const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');const {fixture,roomText}=require('./room-fixture.cjs');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'moida-reveal-'));
try{
 const exe=path.join(temp,'game');
 const build=spawnSync(process.env.CC||'cc',['-std=c11','-Wall','-Wextra','-Werror','-fsanitize=address,undefined',...['moida_core.c','moida_text.c','moida_room.c','game_demo.c'].map(f=>path.join(__dirname,'native',f)),'-o',exe],{encoding:'utf8'});assert.equal(build.status,0,build.stderr);
 let cases=0;
 for(let seed=0;seed<8;seed++)for(const pressAt of [0,10,160,200])for(let button=0;button<4;button++) {
  const {context,rooms,entrance}=fixture(1700000000000+seed*1234567);
  const file=path.join(temp,'room');fs.writeFileSync(file,roomText(rooms[entrance]));
  const welcome=vm.runInContext('g_553648167[0].varStrandIds[5]',context);
  const buttons=[...Array(pressAt).fill(0),1<<button,...Array(11).fill(0)];
  const result=spawnSync(exe,[String(welcome),file],{input:buttons.join('\n')+'\n',encoding:'utf8',maxBuffer:1024*1024});assert.equal(result.status,0,result.stderr);
  const frames=result.stdout.trim().split('\n').map(JSON.parse);
  let previous={};for(let i=0;i<buttons.length;i++){
   context.testInput={curButtonIds:Object.fromEntries([0,1,2,3].filter(n=>buttons[i]&(1<<n)).map(n=>[n,true])),preButtonIds:previous};previous=context.testInput.curButtonIds;
   const original=JSON.parse(vm.runInContext(`JSON.stringify((()=>{const o=tick__main_u41(testInput);return {words:Array.from(o.spriteState.data),beeperHz:o.beeperHz,beeperDurationInMs:o.beeperDurationInMs};})())`,context));
   const {status,...actual}=frames[i];assert.deepEqual(actual,original,`seed ${seed} press ${pressAt} button ${button} tick ${i}`);
   assert.equal(status,i<pressAt?0:i===buttons.length-1?2:1);
  }
  cases++;
 }
 console.log(`PASS: ${cases} full intro-to-entrance reveal sequences match original bits and audio; 8 mansion seeds, 4 buttons, 4 press timings.`);
}finally{fs.rmSync(temp,{recursive:true,force:true});}
