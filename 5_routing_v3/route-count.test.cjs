const assert=require('node:assert/strict'),R=require('./routing.js');
const items=['a','b'].map((id,i)=>({id,parentId:id,sourceId:id,point:[100+i*200,100],bounds:[90+i*200,90,110+i*200,110],rings:[[[90+i*200,90],[110+i*200,90],[110+i*200,110],[90+i*200,110]]]}));
const route={from:'a',to:'b',layer:'SEG',net:1,widthMm:.12,clearanceMm:.12,crossClearanceMm:.1,pushMm:0,points:[[100,100],[300,100]]};
const p={widthMm:300,assignments:{a:{t:1,b:1},b:{t:1,b:2}},routes:Array.from({length:501},()=>structuredClone(route))};
assert.doesNotThrow(()=>R.apply(p,items));
p.routes[500].widthMm=-1;
assert.throws(()=>R.apply(p,items),/width/i);
assert.throws(()=>R.apply({...p,routes:{}},items),/expected a list/);
console.log('PASS: 501 routes accepted; route 501 still validated; malformed lists rejected.');
