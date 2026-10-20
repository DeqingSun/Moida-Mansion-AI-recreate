const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');const {loadOriginal}=require('./runtime.cjs');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'moida-intro-'));
try {
 const exe=path.join(temp,'intro');
 const build=spawnSync(process.env.CC||'cc',['-std=c11','-Wall','-Wextra','-Werror','-fsanitize=address,undefined',...['moida_core.c','moida_text.c','intro_demo.c'].map(f=>path.join(__dirname,'native',f)),'-o',exe],{encoding:'utf8'});
 assert.equal(build.status,0,build.stderr);
 for(const welcome of [91,92]) {
  const result=spawnSync(exe,[String(welcome)],{input:'0\n'.repeat(5000),encoding:'utf8',maxBuffer:8*1024*1024});assert.equal(result.status,0,result.stderr);
  const frames=result.stdout.trim().split('\n').map(JSON.parse);
  const {context}=loadOriginal();vm.runInContext(`g_553648167[0].varStrandIds[5]=${welcome}`,context);
  for(let i=0;i<frames.length;i++) {
   const actual=JSON.parse(vm.runInContext(`JSON.stringify((()=>{const o=tick__main_u41({curButtonIds:{},preButtonIds:{}});return {status:0,words:Array.from(o.spriteState.data),beeperHz:o.beeperHz,beeperDurationInMs:o.beeperDurationInMs};})())`,context));
   assert.deepEqual(frames[i],actual,`welcome ${welcome}, frame ${i}`);
  }
  console.log(`PASS: welcome ${welcome}, ${frames.length} native intro/idle frames match full original tick.`);
 }
 for(const at of [0,10,160,161,200,1000])for(let button=0;button<4;button++) {
  const result=spawnSync(exe,[],{input:'0\n'.repeat(at)+`${1<<button}\n0\n`,encoding:'utf8'});assert.equal(result.status,0,result.stderr);
  const frames=result.stdout.trim().split('\n').map(JSON.parse);
  assert(frames.slice(0,at).every(f=>f.status===0));assert.equal(frames[at].status,1);assert.equal(frames[at+1].status,1);
  const {context}=loadOriginal();
  vm.runInContext(`for(let i=0;i<${at};i++)tick__main_u41({curButtonIds:{},preButtonIds:{}});tick__main_u41({curButtonIds:{${button}:true},preButtonIds:{}})`,context);
  assert.equal(vm.runInContext('curRoutineId__game_u853(g_553648167[0].runners[0])',context),3);
 }
 console.log('PASS: 24 button/boundary cases explicitly stop where original enters the unported house transition.');
} finally {fs.rmSync(temp,{recursive:true,force:true});}
