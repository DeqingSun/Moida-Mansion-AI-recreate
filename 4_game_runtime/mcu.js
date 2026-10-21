'use strict';
(async()=>{
 const el=id=>document.getElementById(id), buttons=[...document.querySelectorAll('[data-button]')];
 const [svg,ids]=await Promise.all([fetch('../1_preliminary_routing/source/panel.svg').then(r=>r.text()),fetch('recovered/segment-ids.json').then(r=>r.json())]);
 el('screen').innerHTML=svg;
 const segments=ids.map(id=>document.getElementById('seg_'+id));
 segments.forEach(s=>s.style.display='none');
 let started=false,paused=true,tail=Promise.resolve();
 function request(action,data={}) {
  const job=tail.then(async()=>{
   const r=await fetch('/api/mcu/'+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(4000)});
   const result=await r.json();if(!r.ok)throw Error(result.error);return result;
  });tail=job.catch(()=>{});return job;
 }
 function controls(){buttons.forEach(b=>b.disabled=!started||paused);el('pause').disabled=!started;el('pause').textContent=paused?'Resume':'Pause';}
 function fail(e){started=false;paused=true;controls();el('error').textContent=e.message+' — check USB and press Start / Reset to reconnect.';}
 async function poll(){
  if(started)try{
   const f=await request('frame');started=f.started;paused=f.paused;controls();
   segments.forEach((s,i)=>s.style.display=((f.words[i>>>5]>>>(i&31))&1)?'':'none');
   el('status').textContent=paused?'MCU paused.':'Live LCD frames from CH32 over USB';
  }catch(e){fail(e);}
  setTimeout(poll,100);
 }
 el('start').onclick=async()=>{
  el('start').disabled=true;
  try{await request('start');started=true;paused=false;el('error').textContent='';controls();}
  catch(e){fail(e);}finally{el('start').disabled=false;}
 };
 el('pause').onclick=async()=>{try{const f=await request('pause',{paused:!paused});paused=f.paused;controls();}catch(e){fail(e);}};
 async function press(button){if(started&&!paused)try{await request('button',{button});}catch(e){fail(e);}}
 buttons.forEach(b=>b.onclick=()=>press(b.dataset.button));
 document.addEventListener('keydown',e=>{
  const key={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'stairs',' ':'stairs',Enter:'search'}[e.key];
  if(!key||e.repeat||e.target.matches('input,textarea,select'))return;
  if(e.target.matches('button')&&(e.key==='Enter'||e.key===' '))return;
  e.preventDefault();press(key);
 });
 el('status').textContent='Ready. Press Start / Reset.';poll();
})().catch(e=>document.getElementById('error').textContent=e.message);
