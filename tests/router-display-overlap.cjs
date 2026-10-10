const assert=require('node:assert/strict'),P=require('../routing-editor/project'),G=require('../routing-editor/geometry');
const d={sourceHash:'display-overlap',segments:[]};
function report(points){const p=P.empty(d);p.pads={};p.traces=['top','bottom'].map(layer=>({id:layer,layer,net:layer,widthMm:1,points}));return G.check(p,d)}
for(const points of [[[-100,-100],[-50,-100]],[[100,-100],[200,-100]],[[3100,100],[3200,100]],[[100,2300],[200,2300]]]){const r=report(points);assert.equal(r.summary.unwantedOverlapMm2,0);assert(!r.issues.some(i=>i.code==='unwanted-overlap'))}
const inside=report([[100,100],[200,100]]);assert(inside.summary.unwantedOverlapMm2>0);
const edge=report([[-100,100],[100,100]]);const issues=edge.issues.filter(i=>i.code==='unwanted-overlap');assert(issues.length);assert(issues.every(i=>i.bbox[0]>=0&&i.bbox[1]>=0&&i.bbox[2]<=3000&&i.bbox[3]<=2160));
const p=P.empty(d);p.pads={};p.traces=['A','B'].map(net=>({id:net,layer:'top',net,widthMm:1,points:[[-100,-100],[-50,-100]]}));assert(G.check(p,d).issues.some(i=>i.code==='short'),'Same-layer shorts outside the display remain checked');
console.log('Outside-display overlaps ignored, inside and boundary crossings clipped, external same-layer shorts preserved.');
