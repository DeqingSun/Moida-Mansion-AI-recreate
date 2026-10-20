const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');const {loadOriginal}=require('./runtime.cjs');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'moida-layout-'));
try{
 const exe=path.join(temp,'layout');
 const build=spawnSync(process.env.CC||'cc',['-std=c11','-Wall','-Wextra','-Werror','-fsanitize=address,undefined',...['moida_core.c','moida_layout.c','layout_demo.c'].map(f=>path.join(__dirname,'native',f)),'-o',exe],{encoding:'utf8'});assert.equal(build.status,0,build.stderr);
 const seeds=[0n,-1n,-9223372036854775808n,9223372036854775807n,...Array.from({length:2000},(_,i)=>1700000000000n+BigInt(i)*1234567n)];
 const native=spawnSync(exe,[],{input:seeds.join('\n')+'\n',encoding:'utf8',maxBuffer:8*1024*1024});assert.equal(native.status,0,native.stderr);
 const actual=native.stdout.trim().split('\n').map(JSON.parse);assert.equal(actual.length,seeds.length);
 const {context}=loadOriginal();let valid=0;const unique=new Set();
 for(let i=0;i<seeds.length;i++){
  const expected=JSON.parse(vm.runInContext(`JSON.stringify((()=>{
   initDice__dice_u290(${seeds[i]}n);
   const loc={suite:rand__house_u222(dice_1577058593[0],new Int32Array([10,40,40,10])),floor:1};
   const map=make__houseZpuzzle_u3762(loc);
   const spec=sample__houseZpuzzle_u4084(dice_1577058593[0],puzzleLayoutSpecs_1694500973);
   const zone=make__houseZpuzzle_u2174(map,loc),locks=make__houseZpuzzle_u4138(zone,spec.lockedPassageOrientations);
   const coord=n=>n?toCoord__houseZcoord_u91(n.loc):-1;
   const passage=p=>[+p.valid,toCoord__houseZcoord_u91(p.loc),p.exit];
   return {entrance:toCoord__houseZcoord_u91(loc),spec:puzzleLayoutSpecs_1694500973.findIndex(s=>JSON.stringify(s)===JSON.stringify(spec)),exits:map.map(s=>Object.keys(s).reduce((n,d)=>n|(1<<d),0)),nodes:zone.nodes.map(n=>[n.depth,coord(n.parent),...n.kids.map(coord)]),locks:{valid:locks.valid,order:locks.order,a:passage(locks.a),b:passage(locks.b)},random:[String(dice_1577058593[0].rand.a0),String(dice_1577058593[0].rand.a1)]};
  })())`,context,{timeout:1000}));
  assert.deepEqual(actual[i],expected,`seed ${seeds[i]}`);valid+=+expected.locks.valid;unique.add(JSON.stringify(expected.exits));
 }
 console.log(`PASS: ${seeds.length} seeds match original topology, entrance, DFS zones, lock selection and final PRNG state; ${unique.size} unique maps, ${valid} valid lock candidates.`);
}finally{fs.rmSync(temp,{recursive:true,force:true});}
