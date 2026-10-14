const assert=require('node:assert/strict'),P=require('../routing-editor/project'),G=require('../routing-editor/geometry');
const d={sourceHash:'area',segments:[]};
function check(width,size,count=1){const p=P.empty(d);p.pads={};p.settings.widthMm=width;for(let i=0;i<count;i++){const x=100+i*20;p.traces.push({id:'t'+i,layer:'top',net:'T',widthMm:size,points:[[x-5,100],[x+5,100]]},{id:'b'+i,layer:'bottom',net:'B',widthMm:size,points:[[x,95],[x,105]]})}return G.check(p,d)}
for(const width of [150,300]){let r=check(width,.009,3);assert.equal(r.issues.filter(i=>i.code==='unwanted-overlap').length,0);assert.equal(r.summary.unwantedOverlapMm2,0);r=check(width,.011);assert.equal(r.issues.filter(i=>i.code==='unwanted-overlap').length,1);assert(Math.abs(r.summary.unwantedOverlapMm2-.000121)<1e-8)}
assert.equal(check(150,.01).issues.filter(i=>i.code==='unwanted-overlap').length,1);
console.log('Physical area threshold: smaller regions ignored individually, equal/larger retained, scaling and totals correct.');
