const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');const {loadOriginal}=require('./runtime.cjs');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'moida-movement-'));
try{
 const exe=path.join(dir,'walk');const build=spawnSync(process.env.CC||'cc',['-std=c11','-Wall','-Wextra','-Werror','-fsanitize=address,undefined',...['moida_core.c','moida_text.c','moida_room.c','moida_layout.c','moida_puzzle.c','moida_house.c','moida_game.c','moida_hal.c','house_game.c'].map(f=>path.join(__dirname,'native',f)),'-o',exe],{encoding:'utf8'});assert.equal(build.status,0,build.stderr);
 let checks=0;const outcomes=[0,0,0,0];
 for(let i=0;i<40;i++){
  const seed=1700000000000+i*1234567,{context}=loadOriginal({seedTime:seed});
  let coord=vm.runInContext('toCoord__houseZcoord_u91(g_553648167[0].playerLoc)',context),rng=i+1;
  const commands=[1,...Array(11).fill(0)],expected=[];
  vm.runInContext('draw_house__game_u446(g_553648167[0])',context);
  for(let step=0;step<250;step++){
   rng=(Math.imul(rng,1664525)+1013904223)>>>0;const direction=rng>>>30;commands.push(128|((direction+1)<<4));
   const kind=vm.runInContext(`canMove__house_u852(g_553648167[0].house,g_553648167[0].house.rooms[${coord}].loc,${direction},{}).kind`,context);
   outcomes[kind]++;if(kind===1)coord+=[-1,1,4,-4][direction];assert(coord>=0&&coord<12);
   if(kind===1){
    context.targetCoord=coord;
    vm.runInContext('g_553648167[0].playerLoc=g_553648167[0].house.rooms[targetCoord].loc',context);
    const routine=['Game_routine_move_left_proc__game_u2237','Game_routine_move_right_proc__game_u2234','Game_routine_move_up_proc__game_u2240','Game_routine_move_down_proc__game_u2243'][direction];
    for(let frame=0;frame<8;frame++){
     if(frame)commands.push(0);
     expected.push(JSON.parse(vm.runInContext(`JSON.stringify((()=>{const g=g_553648167[0];g.output.beeperHz=0;g.output.beeperDurationInMs=0;${frame<7?routine+'(g,'+frame+');':''}return {words:Array.from(g.output.spriteState.data),beeperHz:g.output.beeperHz,beeperDurationInMs:g.output.beeperDurationInMs,status:3};})())`,context)));
    }
    commands.push(0);
   }
   expected.push(JSON.parse(vm.runInContext(`JSON.stringify((()=>{const g=g_553648167[0];g.playerLoc=g.house.rooms[${coord}].loc;g.haveKeyIds={};g.usedKeyIds={};draw_house__game_u446(g);return {words:Array.from(g.output.spriteState.data),beeperHz:0,beeperDurationInMs:0,status:2};})())`,context)));
  }
  const result=spawnSync(exe,[String(seed)],{input:commands.join('\n')+'\n',encoding:'utf8',maxBuffer:8*1024*1024});assert.equal(result.status,0,result.stderr);
  const [ready,...frames]=result.stdout.trim().split('\n').map(JSON.parse);assert(ready.ready);assert.equal(frames.length,commands.length);
  frames.slice(12).forEach((f,j)=>{const {searchResult,inventory,searchIcon,coord,moveResult,moves,...actual}=f;assert.deepEqual(actual,expected[j],`seed ${seed}, step ${j}`);checks++;});
 }
 assert(outcomes.every(n=>n>0));console.log(`PASS: ${checks} movement frames match original directional wipe routines, beeps and destination rendering; no passage/open/locked/hidden: ${outcomes}. Post-move encounters and original input handling remain outside this test.`);
}finally{fs.rmSync(dir,{recursive:true,force:true});}
