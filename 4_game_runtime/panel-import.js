'use strict';
(function(root){
function validate(raw,ids){
 if(!raw||raw.format!=='moida-simulator-panel'||raw.version!==1||raw.viewBox?.join(',')!=='0,0,3000,2160'||!Number.isFinite(raw.widthMm)||raw.widthMm<=0)throw Error('Choose a Simulator JSON exported by routing v3.');
 if(!Array.isArray(raw.pieces)||raw.pieces.length>20000)throw Error('Invalid panel pieces.');
 const seen=new Set(),bits=new Set();let vertices=0;
 for(const p of raw.pieces){if(!p||typeof p.id!=='string'||seen.has(p.id)||!Number.isInteger(p.bit)||ids[p.bit]!==p.parentId)throw Error('Panel game-bit mapping does not match this simulator.');seen.add(p.id);bits.add(p.bit);if(!Array.isArray(p.rings)||!p.rings.length)throw Error('Missing piece geometry.');for(const ring of p.rings){if(!Array.isArray(ring)||ring.length<3||(vertices+=ring.length)>2000000||ring.some(q=>!Array.isArray(q)||q.length!==2||q.some(v=>!Number.isFinite(v)||Math.abs(v)>100000)))throw Error('Invalid panel geometry.');}}
 if(bits.size!==ids.length)throw Error('Panel is missing one or more game segments.');return raw;
}
function render(raw,ids,document){validate(raw,ids);const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 3000 2160');svg.id='panel';const groups=ids.map(id=>{const g=document.createElementNS(ns,'g');g.id='seg_'+id;svg.append(g);return g;});for(const piece of raw.pieces){const path=document.createElementNS(ns,'path');path.setAttribute('data-island',piece.id);path.setAttribute('fill-rule','evenodd');path.setAttribute('d',piece.rings.map(r=>'M '+r.map(q=>q.join(' ')).join(' L ')+' Z').join(' '));groups[piece.bit].append(path);}return {svg,groups};}
const api={validate,render};root.SimulatorPanel=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
