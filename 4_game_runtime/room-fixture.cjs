const vm=require('node:vm');
const {loadOriginal}=require('./runtime.cjs');
function mask(set){let bits=0n;for(const k of Object.keys(set)){const n=Number(k);if(n<0||n>=64)throw Error('Entity exceeds native mask');bits|=1n<<BigInt(n);}return bits.toString();}
function roomText(r){
 const icons=Array.from({length:r.iconIds.count},(_,i)=>r.iconIds.pool.ids[r.iconIds.start+i]);
 const ents=r.ents.items.slice(0,r.ents.len);
 if(icons.length>64||ents.length>16)throw Error('Native room capacity exceeded');
 return [r.loc.floor*4+r.loc.suite,r.name,Number(mask(r.exits)),icons.length,ents.length,...icons,
  ...ents.flatMap(e=>{const d=e.def;return [d.id,d.kind,d.gate.kind,mask(d.gate.entIds),d.exit.has?d.exit.val:-1,e.untilGateIconIds.len,e.afterGateIconIds.len,...Array.from(e.untilGateIconIds.items).slice(0,e.untilGateIconIds.len),...Array.from(e.afterGateIconIds.items).slice(0,e.afterGateIconIds.len)];})].join(' ');
}
function fixture(seedTime){const {context}=loadOriginal({seedTime});return {context,rooms:vm.runInContext('g_553648167[0].house.rooms',context),entrance:vm.runInContext('toCoord__houseZcoord_u91(g_553648167[0].playerLoc)',context)};}
module.exports={roomText,mask,fixture};
if(require.main===module){const fs=require('node:fs'),path=require('node:path');const f=fixture(1700000000000);fs.writeFileSync(path.join(__dirname,'recovered/entrance.room'),roomText(f.rooms[f.entrance])+'\n');console.log('Wrote reference-generated entrance fixture; generation is not native yet.');}
