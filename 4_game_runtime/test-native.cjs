const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const assert=require('node:assert/strict');
const {loadOriginal}=require('./runtime.cjs');
const {context}=loadOriginal();
const run=s=>vm.runInContext(s,context,{timeout:1000});
const commands=[],expected=[],origins=[];
function cmd(s,js){commands.push(s);if(js!==undefined){expected.push(String(run(js)));origins.push(commands.length+': '+s);}}
function mutate(s,js){commands.push(s);run(js);}
run('var testRand, testDisplay={data:new Uint32Array(20)}, testMelody={notes:new Uint8Array(128),curIndex:0,count:0,noteDurationInMs:0}');
for(const seed of [0n,1n,-1n,1700000000000n,9223372036854775807n,-9223372036854775808n]){
 cmd(`S ${seed}`,`testRand=initRand__pureZrandom_u237(${seed}n);[testRand.a0,testRand.a1].join(' ')`);
 for(let i=0;i<400;i++) cmd('R','next__pureZrandom_u39(testRand).toString()');
 for(const max of [0n,1n,2n,100n,631n,2147483647n,9223372036854775809n,18446744073709551615n])
  for(let i=0;i<100;i++)cmd(`B ${max}`,`rand__pureZrandom_u99(testRand,${max}n).toString()`);
 for(const p of [-1,0,1,50,99,100,101]) for(let i=0;i<100;i++)cmd(`P ${p}`,`+prob__dice_u212({rand:testRand},${p})`);
}
const snapshot=()=>cmd('V',"Array.from(testDisplay.data).join(' ')");
for(let bit=0;bit<640;bit++){
 mutate('F 0','clear__gameio_u81(testDisplay)');
 mutate(`D ${bit} 1`,`set__spritestate_u20(testDisplay,${bit},true)`);snapshot();
 mutate(`D ${bit} 0`,`set__spritestate_u20(testDisplay,${bit},false)`);snapshot();
}
for(let icon=0;icon<352;icon++)for(const on of [0,1]){
 mutate(`F ${1-on}`,on?'clear__gameio_u81(testDisplay)':'flood__game_u434(testDisplay)');
 mutate(`I ${icon} ${on}`,`showIcon__spritestate_u81(testDisplay,${icon},${!!on})`);snapshot();
 cmd(`A ${icon}`,`+hasAllSpriteIndexes__spritestate_u90(testDisplay,${icon})`);
}
for(const size of [0,1,11,128,129,256]){
 const notes=Array.from({length:size},(_,i)=>i%78);
 mutate(`M ${size} 60 ${notes.join(' ')}`,`set__melody_u109(testMelody,new Uint8Array(${JSON.stringify(notes)}),60)`);
 for(let i=0;i<size+2;i++)cmd('N',`var n=pop__melody_u146(testMelody);[+n.has,n.val,testMelody.curIndex,testMelody.count,testMelody.noteDurationInMs].join(' ')`);
 mutate('C','clear__melody_u91(testMelody)');
 cmd('N',`var n=pop__melody_u146(testMelody);[+n.has,n.val,testMelody.curIndex,testMelody.count,testMelody.noteDurationInMs].join(' ')`);
}
for(let n=0;n<78;n++)cmd(`H ${n}`,`noteToHz_1811939412[${n}].toFixed(2)`);
for(let a=0;a<16;a++)for(let b=0;b<16;b++)for(let n=0;n<4;n++){
 const set=x=>Object.fromEntries([0,1,2,3].filter(i=>x&(1<<i)).map(i=>[i,true]));
 cmd(`J ${a} ${b} ${n}`,`+justPressed__gameio_u15({curButtonIds:${JSON.stringify(set(a))},preButtonIds:${JSON.stringify(set(b))}},${n})`);
}
// Original scheduler, with matching synthetic callback bodies to exercise its transitions.
run(`var testEvents=0; var testRunner={stack:{routinePoses:Array.from({length:20},()=>({routineId:0,stepIndex:0})),curIndex:-1},waitCount:0,waitingForInput:false,goRoutineId:0,goRoutineIsStart:false,goRoutineWaitFirst:0,env:function(id){return {stepCount:id===1?3:id===2?4:id===3?2:1,stepDescs:[],name:[],routineProc:function(_,step){
 testEvents=(Math.imul(testEvents,31)+id*100+step)>>>0;
 if(id===1&&step===1)queGo__game_u809(testRunner,2,2);
 if(id===2&&step===0)testRunner.waitCount=1;
 if(id===2&&step===2)queGo__game_u809(testRunner,3,0);
 if(id===3&&step===0)queGo__game_u809(testRunner,1,0);
}}}}`);
const runnerState=()=>cmd('O',`[testRunner.stack.curIndex,testRunner.waitCount,testRunner.goRoutineId,testRunner.goRoutineWaitFirst,+testRunner.waitingForInput,+testRunner.goRoutineIsStart,testEvents,...testRunner.stack.routinePoses.slice(0,testRunner.stack.curIndex+1).flatMap(p=>[p.routineId,p.stepIndex])].join(' ')`);
for(let cycle=0;cycle<20;cycle++){
 mutate('X 1','start__game_u483(testRunner,1)');runnerState();
 for(let i=0;i<100;i++){
  if(i===20)mutate('E 1','testRunner.waitingForInput=true');
  if(i===25)mutate('E 0','testRunner.waitingForInput=false');
  if(i===40)mutate('Q 4 3','queGo__game_u809(testRunner,4,3)');
  if(i===60){mutate('Q 2 0','queGo__game_u809(testRunner,2,0)');mutate('G 1','testRunner.goRoutineIsStart=true');}
  mutate('T','step__game_u4297(testRunner,{})');runnerState();
 }
}
mutate('X 0','start__game_u483(testRunner,0)');
for(let id=1;id<=22;id++){cmd(`Z ${id}`,`+push__game_u496(testRunner.stack,${id})`);runnerState();}
cmd('Z 3','+push__game_u496(testRunner.stack,3)');runnerState();
run('var testText={count:0,codes:new Int32Array(13)}');
for(let strand=0;strand<101;strand++)for(const offset of [0,1,5,12,100]) {
 mutate('l','clear__textline_u9(testText)');
 mutate(`a ${strand} 0 ${offset}`,`append__textline_u59(testText,${strand},0,${offset})`);
 cmd('v',"[testText.count,...Array.from(testText.codes).slice(0,testText.count)].join(' ')");
 mutate('c','center__textline_u186(testText)');
 cmd('v',"[testText.count,...Array.from(testText.codes).slice(0,testText.count)].join(' ')");
 mutate('F 1','flood__game_u434(testDisplay)');
 mutate('d','draw__textline_u275(testText,testDisplay)');snapshot();
}
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'moida-c-test-'));
try{
 const exe=path.join(dir,'probe');
 const cc=spawnSync(process.env.CC||'cc',['-std=c11','-Wall','-Wextra','-Werror','-g','-fsanitize=address,undefined',path.join(__dirname,'native/moida_core.c'),path.join(__dirname,'native/moida_text.c'),path.join(__dirname,'native/probe.c'),'-o',exe],{encoding:'utf8'});
 assert.equal(cc.status,0,cc.stderr||String(cc.error));
 const result=spawnSync(exe,[],{input:commands.join('\n')+'\n',encoding:'utf8',maxBuffer:32*1024*1024});
 assert.equal(result.status,0,result.stderr||String(result.error));
 const actual=result.stdout.trimEnd().split('\n');assert.equal(actual.length,expected.length);
 for(let i=0;i<expected.length;i++)assert.equal(actual[i],expected[i],`Mismatch at protocol command ${origins[i]}`);
 console.log(`PASS: ${expected.length} C outputs match original JS (${commands.length} operations); AddressSanitizer and UndefinedBehaviorSanitizer enabled.`);
}finally{fs.rmSync(dir,{recursive:true,force:true});}
