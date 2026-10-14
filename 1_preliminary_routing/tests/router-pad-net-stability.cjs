const assert=require('node:assert/strict'),P=require('../routing-editor/project'),G=require('../routing-editor/geometry');
const d={sourceHash:'pads',segments:[]},a=P.PORT_BY_ID.get('T-N042'),b=P.PORT_BY_ID.get('T-N044');
const route=(id,net,points)=>({id,layer:'top',net,widthMm:.1,points});
// A floating route named after pad 42 reaches pad 44: only route conductors adopt 44.
let p=P.empty(d),pads=P.clone(p.pads);p.traces=[route('floating',a.id,[[b.x,2100],[b.x,2200]])];
G.addRoutedTrace(p,d,route('join',a.id,[[b.x,2200],[b.x,b.y]]));assert.deepEqual(p.pads,pads);assert(p.traces.every(t=>t.net===b.id));
// Reverse direction: a route from pad 44 reaches a floating route named after 42.
p=P.empty(d);p.traces=[route('floating',a.id,[[b.x,2100],[b.x,2200]])];G.addRoutedTrace(p,d,route('join',b.id,[[b.x,b.y],[b.x,2200]]));assert.deepEqual(p.pads,pads);assert(p.traces.every(t=>t.net===b.id));
// A pad explicitly marked unused must not acquire a net during routing or width edits.
p=P.empty(d);delete p.pads[b.id];const t=route('unused',a.id,[[b.x,2200],[b.x,b.y]]);G.addRoutedTrace(p,d,t);assert.equal(p.pads[b.id],undefined);G.autoAssignTouched(p,d,t,{preservePadNets:true});assert.equal(p.pads[b.id],undefined);
// Explicit rename remains deliberate and includes pads.
p=P.empty(d);P.renameNet(p,'top',a.id,'CUSTOM');assert.equal(p.pads[a.id],'CUSTOM');
console.log('Automatic adoption in both directions preserves pad nets, unused pads stay unused, explicit renames remain supported.');
