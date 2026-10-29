'use strict';
(function(root){
const geometry=typeof module!=='undefined'?require('../2_refine_routing/measure.js'):root.RefineMeasure;
function capacity(mm){return Math.max(0,Math.floor((mm-.12+1e-10)/.24));}
function between(items,ids,widthMm,whole=false){const selected=ids.map(id=>items.find(i=>i.id===id));if(selected.length!==2||selected.some(i=>!i))return null;if(ids[0]===ids[1]||(whole&&selected[0].parentId===selected[1].parentId))return null;
 const shapes=selected.map(i=>({islands:(whole?items.filter(j=>j.parentId===i.parentId):[i]).map(j=>({rings:j.rings}))}));
 const result=geometry.nearest(...shapes),mm=result.distance*widthMm/3000;return {...result,mm,count:capacity(mm)};
}
const api={between,capacity};root.MeshMeasure=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
