const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm'),assert=require('node:assert/strict');const {spawnSync}=require('node:child_process');const {loadOriginal}=require('./runtime.cjs');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'moida-house-game-'));
try{
 const exe=path.join(dir,'game');const build=spawnSync(process.env.CC||'cc',['-std=c11','-Wall','-Wextra','-Werror','-fsanitize=address,undefined',...['moida_core.c','moida_text.c','moida_room.c','moida_layout.c','moida_puzzle.c','moida_house.c','moida_game.c','moida_hal.c','house_game.c'].map(f=>path.join(__dirname,'native',f)),'-o',exe],{encoding:'utf8'});assert.equal(build.status,0,build.stderr);
 for(let i=0;i<40;i++){
 const seed=1700000000000+i*1234567,at=[0,10,160,200][i%4],button=i%4;
 const buttons=[...Array(at).fill(0),1<<button,...Array(12).fill(0)];
 const native=spawnSync(exe,[String(seed)],{input:buttons.map(b=>b|512).join('\n')+'\n',encoding:'utf8'});assert.equal(native.status,0,native.stderr);
 const [ready,...frames]=native.stdout.trim().split('\n').map(JSON.parse);assert(ready.ready);
 const {context}=loadOriginal({seedTime:seed});assert.equal(ready.entrance,vm.runInContext('toCoord__houseZcoord_u91(g_553648167[0].playerLoc)',context));assert.equal(ready.welcome,vm.runInContext('g_553648167[0].varStrandIds[5]',context));
 let previous={};for(let tick=0;tick<buttons.length;tick++){
  const current=Object.fromEntries([0,1,2,3].filter(n=>buttons[tick]&(1<<n)).map(n=>[n,true]));context.input={curButtonIds:current,preButtonIds:previous};previous=current;
  const expected=JSON.parse(vm.runInContext(`JSON.stringify((()=>{const o=tick__main_u41(input);return {words:Array.from(o.spriteState.data),beeperHz:o.beeperHz,beeperDurationInMs:o.beeperDurationInMs};})())`,context));
  const {status}=frames[tick];const actual=Object.fromEntries(Object.keys(expected).map(key=>[key,frames[tick][key]]));assert.deepEqual(actual,expected,`seed ${seed} frame ${tick}`);assert.equal(status,tick<at?0:tick===buttons.length-1?2:1);
 }
 }
 console.log('PASS: 40 independently generated native houses match original startup, welcome variant, and every intro/reveal frame and beep.');
}finally{fs.rmSync(dir,{recursive:true,force:true});}
