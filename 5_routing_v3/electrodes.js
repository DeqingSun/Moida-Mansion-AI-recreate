'use strict';
(function(root){
function net(p,id,layer){const m=/^PAD_(COM|SEG)_(\d+)$/.exec(id||'');if(!p.electrodes||!m||m[1]!==layer)return undefined;const n=+m[2];return n>=1&&n<=(layer==='COM'?16:60)?n:undefined;}
function items(p){if(!p.electrodes)return [];const u=3000/p.widthMm,left=(p.widthMm-76.5)/2,y=(p.widthMm*.72+p.electrodes.gapMm)*u;return Array.from({length:76},(_,i)=>{const layer=i<16?'COM':'SEG',n=i<16?i+1:i-15,slot=i<16?i:i+1,x=(left+slot)*u,w=.5*u,h=3*u,id=`PAD_${layer}_${n}`;return {id,parentId:id,sourceId:id,electrode:true,layer,net:n,point:[x+w/2,y+h/2],bounds:[x,y,x+w,y+h],rings:[[[x,y],[x+w,y],[x+w,y+h],[x,y+h]]]};});}
function bounds(p){const pads=items(p);if(!pads.length)return [0,0,3000,2160];const u=3000/p.widthMm;return [Math.min(0,pads[0].bounds[0]-u),0,Math.max(3000,pads.at(-1).bounds[2]+u),pads[0].bounds[3]+u];}
const api={items,net,bounds};root.Electrodes=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
