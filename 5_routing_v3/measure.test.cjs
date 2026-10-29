const assert=require('node:assert/strict'),M=require('./measure.js');
const rect=(id,parentId,x,y,w,h)=>({id,parentId,rings:[[[x,y],[x+w,y],[x+w,y+h],[x,y+h]]]});
for(const [gap,n] of [[0,0],[.3599,0],[.36,1],[.5999,1],[.60,2],[.84,3]])assert.equal(M.capacity(gap),n);
const a=rect('a','A',0,0,10,10),b=rect('b','B',16,0,10,10),s=rect('s','A',14,20,10,10);
let m=M.between([a,b,s],['a','b'],300);assert.equal(m.mm,.6);assert.equal(m.count,2);assert.deepEqual(m.a,[10,0]);assert.deepEqual(m.b,[16,0]);
assert.equal(M.between([a,b,s],['a','s'],300,true),null);assert.equal(M.between([a,rect('b','B',5,5,10,10)],['a','b'],300).mm,0);
const hole={id:'h',parentId:'H',rings:[[[0,0],[100,0],[100,100],[0,100]],[[20,20],[80,20],[80,80],[20,80]]]};assert.equal(M.between([hole,rect('in','I',30,30,10,10)],['h','in'],300).mm,1);
assert.equal(M.between([a,rect('b','B',50,0,10,10),rect('a2','A',40,0,5,10)],['a','b'],300,true).mm,.5);
console.log('PASS: 0.12 mm capacity thresholds, closest edges, overlap, holes, and whole-segment scope.');
