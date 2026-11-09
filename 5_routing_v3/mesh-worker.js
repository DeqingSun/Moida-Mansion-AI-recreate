'use strict';
importScripts('../2_refine_routing/segments-data.js','../2_refine_routing/vendor/clipper.js','auto-slice.js?v=manual-slices-1','electrodes.js','routing.js?v=route-count-3','shape.js','model.js?v=manual-slices-1');
onmessage=e=>{
 try {
  const M=MeshModel, data=ROUTER_DATA, base=e.data.base;
  let p=M.clone(base);
  for(const move of e.data.moves){
   const before=M.clone(p);
   p.nodes=move.nodes;p.bends=move.bends;
   const check=M.topology(p,before);if(!check.ok)throw Error(check.reason);
   p=M.placePoints(p,data,move.ids,before);
   if(move.whole){
    const current=M.artwork(data,p),target=current.find(i=>i.id===move.target);
    if(target&&(p.meshAnchors[target.sourceId]?.length||0)<=1){const [t,b]=move.ids[0].split(':').map(Number);M.assign(p,current,current.filter(i=>i.parentId===target.parentId).map(i=>i.id),t,b,true);}
   }
  }
  p=M.validate(M.simplify(p,base),data);
  const check=M.topology(p);if(!check.ok)throw Error(check.reason);
  const slices=AutoSlice.visibleSlices(ShapeEdit.apply(M.artwork(data),p),p);
  postMessage({project:p,items:M.artwork(data,p),check,slices});
 }catch(error){postMessage({error:error.message});}
};
