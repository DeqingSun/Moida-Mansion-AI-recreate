// Execute only extracted display-state functions in an isolated VM with fake DOM nodes.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'source/moida.js'),'utf8');
function balanced(start,open,close){let depth=0,quote=null,escape=false;for(let i=start;i<source.length;i++){let c=source[i];if(quote){if(escape)escape=false;else if(c==='\\')escape=true;else if(c===quote)quote=null;continue}if(c==='"'||c==="'"){quote=c;continue}if(c===open)depth++;if(c===close&&!--depth)return source.slice(start,i+1);}throw Error('unterminated');}
function literal(name,open,close){let at=source.indexOf(name+'=');assert(at>=0);at=source.indexOf(open,at+name.length+1);return balanced(at,open,close)}
function fn(name){let start=source.indexOf('function '+name+'(');assert(start>=0);let body=source.indexOf('{',start);return source.slice(start,body)+balanced(body,'{','}')}
const ids=JSON.parse(literal('segIds_721420499','[',']')).map(a=>String.fromCharCode(...a));
const rom={};for(const key of ['icons','sprites']){const at=source.indexOf(key+':[' ,source.indexOf('romData_1409288915='));rom[key]=vm.runInNewContext('('+balanced(at+key.length+1,'[',']')+')',{}, {timeout:1000});}
assert.equal(ids.length,631);assert.equal(new Set(ids).size,631);assert.equal(rom.sprites.length,631);
const originals=['setMask__spritestate_u36','setBit__spritestate_u28','clearMask__spritestate_u63','clearBit__spritestate_u55','set__spritestate_u20','showSprite__spritestate_u16','testBit__spritestate_u106','get__spritestate_u99','onHEX3D__device95html_u67','apply__device95html_u344'];
const ctx=vm.createContext({toJSStr:a=>String.fromCharCode(...a),nimCopy:(a,b)=>b,NTI721420314:{},listenButtonIds_721420344:[{}],beepStart__device95html_u285:()=>{throw Error('unexpected beep')},segs_721420504:[ids.map(id=>({id,isOn:false,elem0:{style:{display:'none'}},elem1:{style:{display:'none'}},elem2:null}))]});
vm.runInContext(originals.map(fn).join('\n'),ctx,{timeout:1000});
for(let target=0;target<631;target++){
 const state={data:new Uint32Array(20)};
 ctx.showSprite__spritestate_u16(state,target,true);
 ctx.apply__device95html_u344({spriteState:state,beeperHz:0,wakeOnButtonIds:{}});
 for(let j=0;j<631;j++){
  assert.equal(ctx.get__spritestate_u99(state,j),j===target);
  assert.equal(ctx.segs_721420504[0][j].elem0.style.display,j===target?'block':'none');
  assert.equal(ctx.segs_721420504[0][j].elem1.style.display,j===target?'block':'none');
 }
 state.data.fill(0xffffffff);ctx.showSprite__spritestate_u16(state,target,false);
 ctx.apply__device95html_u344({spriteState:state,beeperHz:0,wakeOnButtonIds:{}});
 for(let j=0;j<631;j++)assert.equal(ctx.segs_721420504[0][j].elem0.style.display,j===target?'none':'block');
}
const referenced=new Set(rom.icons.flatMap(x=>Array.from(x.spriteIndexes)));
const text=rom.icons.slice(246,259).map(x=>Array.from(x.spriteIndexes));
assert(text.every(x=>x.length===15));assert.equal(new Set(text.flat()).size,195);
const report={unique_segment_ids:ids.length,rom_sprite_records:rom.sprites.length,rom_addresses_match_one_based_ordinals:rom.sprites.every((s,i)=>s.address===i+1),actual_state_bit_range:[0,630],one_hot_cases_passed:631,one_cold_cases_passed:631,icons:rom.icons.length,unique_sprite_indices_in_icons:referenced.size,unreferenced_indices:ids.map((_,i)=>i).filter(i=>!referenced.has(i)),text_characters:text.length,text_bits:new Set(text.flat()).size,example:{id:'C02S106',state_bit:ids.indexOf('C02S106'),rom_address:rom.sprites[ids.indexOf('C02S106')].address},limitation:'Proves independent addressing by the original renderer. Does not prove that all bit combinations arise in unmodified gameplay, or a minimum electrode count after gameplay-specific optimization.'};
fs.writeFileSync(path.join(root,'output/code-audit.json'),JSON.stringify(report,null,2)+'\n');
fs.writeFileSync(path.join(root,'research/original-display-functions.js'),'// Verbatim excerpts from source/moida.js, for review only.\n'+originals.map(fn).join('\n\n')+'\n');
console.log(JSON.stringify(report,null,2));
