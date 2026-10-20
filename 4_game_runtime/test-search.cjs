const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');const {loadOriginal}=require('./runtime.cjs');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'moida-search-'));
try{
 const exe=path.join(dir,'search');const build=spawnSync(process.env.CC||'cc',['-std=c11','-Wall','-Wextra','-Werror','-fsanitize=address,undefined',...['moida_core.c','moida_text.c','moida_room.c','moida_layout.c','moida_puzzle.c','moida_house.c','search_probe.c'].map(f=>path.join(__dirname,'native',f)),'-o',exe],{encoding:'utf8'});assert.equal(build.status,0,build.stderr);
 const commands=[],expected=[];
 for(let i=0;i<12;i++){
  const seed=1700000000000+i*1234567,{context}=loadOriginal({seedTime:seed});
  const rows=JSON.parse(vm.runInContext(`JSON.stringify((()=>{const result=[];for(let coord=0;coord<12;coord++)for(let variant=0;variant<4;variant++){const have={},used={};let hm=0n,um=0n;for(let id=0;id<64;id++){if(variant===1||variant===3&&id%2===0){have[id]=true;hm|=1n<<BigInt(id);}if(variant===2||variant===3&&id%2){used[id]=true;um|=1n<<BigInt(id);}}const r=g_553648167[0].house.rooms[coord];for(let icon=0;icon<352;icon++){const e=entForSearch__houseZroom_u1730(r,icon,used);result.push([coord,icon,String(hm),String(um),nextSearchIconId__houseZroom_u1712(r,icon,have),e.has?e.val.def.id:-1]);}}return result;})())`,context));
  for(const [coord,icon,have,used,next,entity] of rows){commands.push(`${seed} ${coord} ${icon} ${have} ${used}`);expected.push([next,entity]);}
 }
 const result=spawnSync(exe,[],{input:commands.join('\n')+'\n',encoding:'utf8',maxBuffer:16*1024*1024});assert.equal(result.status,0,result.stderr);
 const actual=result.stdout.trim().split('\n').map(JSON.parse);assert.deepEqual(actual,expected);
 console.log(`PASS: ${actual.length} search-target and entity-lookup cases match original (12 houses, all rooms/icons, empty/full/mixed inventory and used-key states).`);
}finally{fs.rmSync(dir,{recursive:true,force:true});}
