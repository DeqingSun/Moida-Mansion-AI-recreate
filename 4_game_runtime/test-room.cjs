const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');const {fixture,roomText,mask}=require('./room-fixture.cjs');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'moida-room-'));
try{
 const exe=path.join(temp,'room');
 const build=spawnSync(process.env.CC||'cc',['-std=c11','-Wall','-Wextra','-Werror','-fsanitize=address,undefined',...['moida_core.c','moida_text.c','moida_room.c','room_probe.c'].map(f=>path.join(__dirname,'native',f)),'-o',exe],{encoding:'utf8'});assert.equal(build.status,0,build.stderr);
 const commands=[],expected=[],labels=[];
 for(let seed=0;seed<16;seed++){
  const {context,rooms}=fixture(1700000000000+seed*1234567);
  const run=s=>vm.runInContext(s,context);
  for(let coord=0;coord<12;coord++){
   const room=rooms[coord];
   for(let variant=0;variant<8;variant++){
    const have={},used={};
    for(let id=0;id<64;id++){if(variant&1||variant===4&&id%2===0)have[id]=true;if(variant&2||variant===5&&id%2===1)used[id]=true;}
    // Body tests exercise collected fairies, gated entities and child-icon erasure.
    context.have=have;context.used=used;
    const mode=variant>=6?1:0,percent=variant===7?50:0;
    commands.push(`${mode} ${percent} ${mask(have)} ${mask(used)} ${roomText(room)}`);
    const result=run(`(()=>{const g=g_553648167[0],r=g.house.rooms[${coord}],d={data:new Uint32Array(20)};
      if(${mode}){g.playerLoc=r.loc;g.haveKeyIds={};g.usedKeyIds={};draw_house__game_u446(g);d.data.set(g.output.spriteState.data);}else draw__houseZroom_u1583(r,d,have,used);
      if(${percent})erase_top__game_u985({output:{spriteState:d}},${percent});
      return {words:Array.from(d.data),moves:[0,1,2,3].map(dir=>{const m=canMove__house_u852(g.house,r.loc,dir,used);return [m.kind,m.lockIconId,m.needKeyIds];})};})()`);
    expected.push({words:Array.from(result.words),moves:Array.from(result.moves,m=>[m[0],m[1],mask(m[2])])});labels.push({seed,coord,variant});
   }
  }
 }
 const result=spawnSync(exe,[],{input:commands.join('\n')+'\n',encoding:'utf8',maxBuffer:8*1024*1024});assert.equal(result.status,0,result.stderr);
 const actual=result.stdout.trim().split('\n').map(JSON.parse);assert.equal(actual.length,expected.length);
 actual.forEach((v,i)=>assert.deepEqual(v,expected[i],JSON.stringify(labels[i])));
 console.log(`PASS: ${actual.length} room/render/reveal-mask cases across 16 generated mansions; 6144 exit/lock checks match original.`);
}finally{fs.rmSync(temp,{recursive:true,force:true});}
