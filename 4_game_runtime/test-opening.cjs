const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');const {loadOriginal}=require('./runtime.cjs');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'moida-opening-'));
try {
 const exe=path.join(temp,'opening');
 const build=spawnSync(process.env.CC||'cc',['-std=c11','-Wall','-Wextra','-Werror','-fsanitize=address,undefined',...['moida_core.c','moida_text.c','opening_demo.c'].map(f=>path.join(__dirname,'native',f)),'-o',exe],{encoding:'utf8'});
 assert.equal(build.status,0,build.stderr);
 for(const welcome of [91,92]) {
  const result=spawnSync(exe,[String(welcome)],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);
  const frames=JSON.parse(result.stdout);assert(frames.length>150);
  const {context}=loadOriginal();vm.runInContext(`g_553648167[0].varStrandIds[5]=${welcome}`,context);
  for(let i=0;i<frames.length;i++) {
   const actual=JSON.parse(vm.runInContext(`JSON.stringify((()=>{const o=tick__main_u41({curButtonIds:{},preButtonIds:{}});return {words:Array.from(o.spriteState.data),beeperHz:o.beeperHz,beeperDurationInMs:o.beeperDurationInMs};})())`,context));
   assert.deepEqual(frames[i],actual,`welcome ${welcome}, frame ${i}`);
  }
  console.log(`PASS: welcome ${welcome}, ${frames.length} C frames match full original game tick (all 640 bits + beep frequency/duration).`);
  if(welcome===91 && process.argv.includes('--write-preview'))fs.writeFileSync(path.join(__dirname,'opening-frames.json'),JSON.stringify(frames));
 }
} finally {fs.rmSync(temp,{recursive:true,force:true});}
