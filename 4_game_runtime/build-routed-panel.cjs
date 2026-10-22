// Generate simulator artwork with the routing editor's own geometry pipeline.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const P=require('../2_refine_routing/project');
require('../2_refine_routing/segments-data');
const file=process.argv[2];if(!file)throw Error('Usage: node 4_game_runtime/build-routed-panel.cjs PATH_TO_ROUTING_JSON');
const bytes=fs.readFileSync(file),raw=JSON.parse(bytes),base=P.islandData(global.ROUTER_DATA);
assert.equal(raw.sourceHash,base.sourceHash,'Routing artwork does not match');
// Same geometry inputs as the current webpage: EDA imports supply traces only.
const data=P.layoutData(base,raw.cuts,undefined,raw.localGeometry);
const ids=JSON.parse(fs.readFileSync(path.join(__dirname,'recovered/segment-ids.json')));
const groups=new Map(ids.map(id=>[id,[]]));
for(const s of data.segments){assert.equal(ids[s.bit],s.parentId,'Original bit mapping changed');assert(groups.has(s.parentId));groups.get(s.parentId).push(s);}
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const svg=`<svg id="panel" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${data.width} ${data.height}">`+
 ids.map(id=>{const pieces=groups.get(id);assert(pieces.length,`Missing game segment ${id}`);return `<g id="seg_${id}">`+pieces.map(s=>`<path data-island="${escape(s.id)}" fill-rule="evenodd" d="${escape(s.paths.join(' '))}"/>`).join('')+'</g>';}).join('')+'</svg>\n';
fs.writeFileSync(path.join(__dirname,'recovered/routed-panel.svg'),svg);
const report={sourceFile:path.basename(file),sourceSha256:crypto.createHash('sha256').update(bytes).digest('hex'),cuts:raw.cuts?.length||0,geometryOverrides:Object.keys(raw.localGeometry||{}).length,gameSegments:ids.length,routedIslands:data.segments.length,width:data.width,height:data.height};
fs.writeFileSync(path.join(__dirname,'recovered/routed-panel.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
