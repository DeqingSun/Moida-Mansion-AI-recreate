'use strict';
(function(root){
function build(data,project,items){const parents=new Map(data.segments.map(s=>[s.id,s.bit]));const pieces=items.filter(i=>!i.electrode).map(i=>{if(parents.get(i.parentId)!==i.bit)throw Error('Game-bit mapping changed at '+i.id);return {id:i.id,parentId:i.parentId,bit:i.bit,rings:i.rings.map(r=>r.map(q=>[...q]))};});return {format:'moida-simulator-panel',version:1,sourceHash:data.sourceHash,widthMm:project.widthMm,viewBox:[0,0,3000,2160],mode:'optical-game-bit-preview',pieces};}
const api={build};root.SimulatorExport=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
