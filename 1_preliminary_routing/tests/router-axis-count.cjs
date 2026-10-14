const assert=require('node:assert/strict'),P=require('../routing-editor/project.js');
const d={segments:[{id:'A',islands:[{bounds:[0,0,10,10]},{bounds:[0,20,10,30]}]},{id:'B',islands:[{bounds:[20,0,30,10]}]}]};
assert.deepEqual(P.axisIslands(d,[5,5]),{vertical:['A_0','A_1'],horizontal:['A_0','B']});
assert.deepEqual(P.axisIslands(d,[15,15]),{vertical:[],horizontal:[]});
assert.deepEqual(P.axisIslands(d,[10,10]),{vertical:['A_0','A_1'],horizontal:['A_0','B']});
const artwork=P.islandData(require('../output/router/segments-data.json'));
assert.equal(artwork.segments.length,769);
for(const s of artwork.segments){const hits=P.axisIslands(artwork,s.islands[0].point);assert(hits.vertical.includes(s.id));assert(hits.horizontal.includes(s.id));assert.equal(new Set(hits.vertical).size,hits.vertical.length)}
console.log('Axis counts: separate sibling islands, gaps, boundary touches, and all 769 interior points passed.');
