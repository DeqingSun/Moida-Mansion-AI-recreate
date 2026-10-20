// Full tick oracle: no original routines or outcomes are replaced.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');const {loadOriginal}=require('./runtime.cjs');
const scenarios=['escape','tutorial-spider-escape','death-restart','dot-escape','ghost-escape','timed-inputs'];
assert(!process.argv[2]||scenarios.includes(process.argv[2]),'Unknown scenario');
let totalFrames=0,totalSessions=0;
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'moida-session-'));
try {
 const exe=path.join(tmp,'game');const build=spawnSync('cc',['-std=c11','-Wall','-Wextra','-Werror','-fsanitize=address,undefined',...['moida_core','moida_text','moida_room','moida_layout','moida_puzzle','moida_house','house_game'].map(f=>path.join(__dirname,'native',f+'.c')),'-o',exe],{encoding:'utf8'});assert.equal(build.status,0,build.stderr);
 function run(name,seed){
 const {context}=loadOriginal({seedTime:seed});let previous={};const commands=[],expected=[],coverage=new Set();
 function tick(mask=0){context.input={curButtonIds:Object.fromEntries([0,1,2,3].filter(b=>mask&(1<<b)).map(b=>[b,true])),preButtonIds:previous};previous=context.input.curButtonIds;commands.push(mask|512|1024|2048|4096);const f=JSON.parse(vm.runInContext(`JSON.stringify((()=>{const o=tick__main_u41(input),g=g_553648167[0];return {words:Array.from(o.spriteState.data),beeperHz:o.beeperHz,beeperDurationInMs:o.beeperDurationInMs,coord:toCoord__houseZcoord_u91(g.playerLoc),searchIcon:g.varIcons[0].id0,routine:curRoutineId__game_u853(g.runners[0]),runners:g.runners.map(r=>({wait:r.waitCount,cur:curRoutineId__game_u853(r)})),waiting:g.runners[0].waitingForInput,inventory:String(Object.keys(g.haveKeyIds).reduce((m,k)=>m|(1n<<BigInt(k)),0n)),used:String(Object.keys(g.usedKeyIds).reduce((m,k)=>m|(1n<<BigInt(k)),0n)),stats:[g.stats[0],g.stats[1],g.stats[3]],random:[String(dice_1577058593[0].rand.a0),String(dice_1577058593[0].rand.a1)]};})())`,context));expected.push(f);coverage.add(f.routine);return f;}
 function state(){return JSON.parse(vm.runInContext(`JSON.stringify((()=>{const g=g_553648167[0];return {coord:toCoord__houseZcoord_u91(g.playerLoc),routine:curRoutineId__game_u853(g.runners[0]),waiting:g.runners[0].waitingForInput,wait:g.runners[0].waitCount,search:g.varIcons[0].id0,spiderHere:g.spiderHere,spiderSearched:g.spiderSearched,monster:g.monsta,gotCrown:g.gotCrown,have:g.haveKeyIds,used:g.usedKeyIds,canEscape:canEscape__house_u1292(g.house,g.playerLoc,g.friendState,g.haveKeyIds),moves:Array.from({length:12},(_,c)=>Array.from({length:4},(_,d)=>canMove__house_u852(g.house,toLocation__houseZcoord_u114(c),d,g.usedKeyIds)))};})())`,context));}
 function settle(){for(let i=0;i<1500;i++){const s=state();if(s.routine===0)return s;tick(s.waiting&&!s.wait&&Object.keys(previous).length===0?2:0);}throw Error('Oracle did not settle');}
 function move(dir){tick();tick([4,8,1,1][dir]);return settle();}
 function clearMonster(){for(let i=0;i<40;i++){const s=state();if(!s.monster.mode)return;const choices=s.moves[s.coord].map((m,d)=>m.kind===1&&!s.monster.guardingExits[d]?d:-1).filter(d=>d>=0);assert(choices.length,'no safe exit');move(choices[i%choices.length]);}throw Error('Monster did not clear');}
 function navigate(target){for(let tries=0;tries<80;tries++){const s=state();if(s.coord===target)return;const q=[[s.coord,[]]],seen=new Set([s.coord]);let route;
  while(q.length){const [c,ds]=q.shift();if(c===target){route=ds;break;}for(let d=0;d<4;d++){const m=s.moves[c][d],n=c+[-1,1,4,-4][d];if((m.kind===1||m.kind===2&&Object.keys(m.needKeyIds||{}).every(id=>s.have[id]))&&!seen.has(n)){seen.add(n);q.push([n,[...ds,d]]);}}}assert(route?.length,`no route to ${target}`);move(route[0]);}throw Error('navigation loop');}
 function searchAt(room,icon){clearMonster();navigate(room);for(let i=0;i<35;i++){tick();tick(2);if(state().search===icon){settle();return;}}throw Error('No target '+icon);}
 tick(1);settle();
 if(name==='timed-inputs'){
  let rng=seed>>>0,mask=0;for(let i=0;i<3000;i++){rng=(Math.imul(rng,1664525)+1013904223)>>>0;if(i%7===0)mask=rng%6===0?15:1<<(rng>>>30);if(i%7===3)mask=0;tick(mask);}
 }else if(name==='death-restart'){
  for(let i=0;i<100;i++)tick();
  for(const button of [2,4,8,4,1,8,8,8,2,2,4,4,4,1,8,2]){tick(button);for(let i=0;i<250;i++){const e=expected.at(-1);tick(e.waiting&&i%2===0?2:0);}}
 }else{
  if(name==='ghost-escape'){
   searchAt(8,313);searchAt(11,82);searchAt(9,83);searchAt(3,80);searchAt(1,319);
   clearMonster();navigate(11);navigate(10);navigate(9);navigate(8);searchAt(8,1);searchAt(4,260);
  }else{
   if(name==='tutorial-spider-escape'){
    searchAt(5,153);searchAt(5,153);assert(coverage.has(43),'tutorial not exercised');clearMonster();navigate(5);
    for(let i=0;i<100&&!state().spiderHere;i++)move(state().coord===5?0:1);
    assert(state().spiderHere,'spider did not appear');searchAt(state().coord,229);assert(state().spiderSearched,'spider not collected');
   }
   searchAt(4,327);searchAt(11,62);searchAt(1,36);searchAt(11,28);searchAt(7,319);
   if(name==='dot-escape'){for(const room of [0,2,8,10])searchAt(room,43);assert(state().gotCrown,'Dot not collected');}
  }
  clearMonster();const entrance=vm.runInContext('toCoord__houseZcoord_u91(g_553648167[0].house.entranceLoc)',context);navigate(entrance);assert(state().canEscape,'oracle rescue route cannot escape');for(let i=0;i<100;i++)tick();tick();tick(1);
  for(let i=0;i<1500;i++){let s=state();if(s.routine===1)break;tick(s.waiting&&!s.wait&&Object.keys(previous).length===0?2:0);}
  assert.equal(state().routine,1,'ending must restart');for(let i=0;i<180;i++)tick();tick(1);settle();
 }
 const out=spawnSync(exe,[String(seed)],{input:commands.join('\n')+'\n',encoding:'utf8',maxBuffer:64*1024*1024,env:{...process.env,MOIDA_SESSION_TRACE:"1"}});assert.equal(out.status,0,out.stderr);const [ready,...actual]=out.stdout.trim().split('\n').map(JSON.parse);assert(ready.ready);assert.equal(actual.length,expected.length);
 for(let i=0;i<actual.length;i++){const e=expected[i],a=actual[i];for(const key of ['words','beeperHz','beeperDurationInMs','coord','random','inventory','used','stats'])if(JSON.stringify(a[key])!==JSON.stringify(e[key])){console.log(JSON.stringify({scenario:name,seed,input:commands.slice(Math.max(0,i-10),i+1).map(x=>x&15),tick:i,key,previous:expected[i-1],expected:e,actual:a},null,2));throw Error(`Full-session mismatch at tick ${i}: ${key}`);}}
 if(name!=='timed-inputs')assert(actual.at(-1).cycle>=1,'native game did not restart');
 totalFrames+=actual.length;totalSessions++;
 console.log(`PASS: ${name} seed ${seed}: ${actual.length} uninterrupted original/native session ticks.`);
 }
 for(const [name,seed] of [["escape",1700000000000],["tutorial-spider-escape",1700000000000],["death-restart",1700000000000],["dot-escape",1700000000000],["ghost-escape",1700001234567]])if(!process.argv[2]||name===process.argv[2])run(name,seed);
 if(!process.argv[2]||process.argv[2]==="timed-inputs")for(let i=0;i<12;i++)run("timed-inputs",1700000000000+i*1234567);
 console.log(`PASS: ${totalFrames} exact ticks across ${totalSessions} sessions; sanitizers enabled.`);
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
