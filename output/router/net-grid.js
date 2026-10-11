'use strict';
// Compact viewport into the electrical matrix; no routing data is modified.
window.NetGrid=(()=>{
 const canvas=document.querySelector('#netGridCanvas'),ctx=canvas.getContext('2d'),label=document.querySelector('#netGridLabel'),note=document.querySelector('#netGridNote');
 let key='',frame=0,position=null,target=null,from=null,start=0,fadeStart=0,trail=[],lastVisit=null;
 const center=(n,max)=>Math.max(3,Math.min(max-2,n));
 function draw(p,opacity=1){ctx.clearRect(0,0,210,188);const cx=p?.cx||3,cy=p?.cy||3,x=n=>105+(n-cx)*32,y=n=>102+(n-cy)*29;
 ctx.save();ctx.beginPath();ctx.rect(23,24,164,150);ctx.clip();
 for(let t=1;t<=48;t++){const xx=x(t);if(xx<23||xx>187)continue;ctx.strokeStyle='#ff73734a';ctx.beginPath();ctx.moveTo(xx,29);ctx.lineTo(xx,172);ctx.stroke();for(let b=1;b<=16;b++){const yy=y(b);if(yy<29||yy>172)continue;ctx.fillStyle='#8b9a91';ctx.beginPath();ctx.arc(xx,yy,2.4,0,Math.PI*2);ctx.fill()}}
 for(let b=1;b<=16;b++){const yy=y(b);if(yy<29||yy>172)continue;ctx.strokeStyle='#65c7ff4a';ctx.beginPath();ctx.moveTo(25,yy);ctx.lineTo(185,yy);ctx.stroke()}
 const now=performance.now();trail=trail.filter(dot=>now-dot.time<3000);for(const dot of trail){ctx.globalAlpha=.8*(1-(now-dot.time)/3000);ctx.fillStyle='#ffe09a';ctx.beginPath();ctx.arc(x(dot.t),y(dot.b),3.5,0,Math.PI*2);ctx.fill()}
 if(p){ctx.globalAlpha=opacity;ctx.strokeStyle='#ffaaaa';ctx.beginPath();ctx.moveTo(x(p.t),29);ctx.lineTo(x(p.t),172);ctx.stroke();ctx.strokeStyle='#9ddfff';ctx.beginPath();ctx.moveTo(25,y(p.b));ctx.lineTo(185,y(p.b));ctx.stroke();ctx.fillStyle='#fff5b7';ctx.beginPath();ctx.arc(x(p.t),y(p.b),5,0,Math.PI*2);ctx.fill()}
 ctx.restore();ctx.font='10px system-ui';ctx.textAlign='center';ctx.fillStyle='#ffaaaa';for(let t=1;t<=48;t++)if(x(t)>=25&&x(t)<=185)ctx.fillText('T'+t,x(t),18);ctx.fillStyle='#9ddfff';ctx.textAlign='right';for(let b=1;b<=16;b++)if(y(b)>=29&&y(b)<=172)ctx.fillText('B'+b,22,y(b)+3);
 }
 function tick(now){const f=Math.min(1,(now-start)/220),ease=1-(1-f)**3;position=Object.fromEntries(Object.keys(target).map(k=>[k,from[k]+(target[k]-from[k])*ease]));draw(position);if(f<1)frame=requestAnimationFrame(tick);else{frame=0;if(trail.length)frame=requestAnimationFrame(hold)}}
 function remember(){if(lastVisit){const now=performance.now();trail=trail.filter(dot=>now-dot.time<3000&&!(dot.t===lastVisit.t&&dot.b===lastVisit.b));trail.push({...lastVisit,time:now});lastVisit=null}}
 function hold(){draw(position);frame=trail.length?requestAnimationFrame(hold):0}
 function fade(now){const opacity=Math.max(0,1-(now-fadeStart)/3000);draw(position,opacity);if(opacity>0)frame=requestAnimationFrame(fade);else{frame=0;label.textContent='Hover an island';note.textContent='48 top × 16 bottom nets'}}
 function update(island,project){if(!island){if(key){remember();key='';cancelAnimationFrame(frame);frame=0;if(position){position={...target};fadeStart=performance.now();draw(position);frame=requestAnimationFrame(fade)}else{label.textContent='Hover an island';note.textContent='48 top × 16 bottom nets';draw(null)}}return}
 const a=project.assignments[island.id],nextKey=JSON.stringify([island.id,a,project.pads]);if(key===nextKey)return;remember();key=nextKey;
 const find=layer=>{const ids=RouterProject.PORTS.filter(p=>p.layer===layer&&a?.[layer]&&project.pads[p.id]===a[layer]);return ids.length===1?Number(ids[0].id.match(/\d+$/)[0]):null},t=find('top'),b=find('bottom');cancelAnimationFrame(frame);frame=0;
 label.textContent=`T${t??'—'}, B${b??'—'}`;note.textContent=island.id+' · assigned nets';
 if(t===null||b===null){position=null;target=null;note.textContent=island.id+' · net unassigned, floating or shared by pads';draw(position,0);const fadeTrail=()=>{draw(position,0);frame=trail.length?requestAnimationFrame(fadeTrail):0};if(trail.length)frame=requestAnimationFrame(fadeTrail);return}
 lastVisit={t,b};target={t,b,cx:center(t,48),cy:center(b,16)};
 if(!position||matchMedia('(prefers-reduced-motion: reduce)').matches){position={...target};draw(position);if(trail.length)frame=requestAnimationFrame(hold);return}
 from={...position};start=performance.now();frame=requestAnimationFrame(tick);
 }
 draw(null);return {update};
})();
