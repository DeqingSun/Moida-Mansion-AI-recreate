'use strict';
(async()=>{
 const el=id=>document.getElementById(id);
 const [svg,ids]=await Promise.all([fetch('../1_preliminary_routing/source/panel.svg').then(r=>r.text()),fetch('recovered/segment-ids.json').then(r=>r.json())]);
 el('screen').innerHTML=svg;
 const segments=ids.map(id=>document.getElementById('seg_'+id));
 segments.forEach(s=>s.style.display='none');
 let session=null,timer=null,busy=false,paused=false,finished=false,frames=0,audio,pendingButtons=0;
 const controls=[...document.querySelectorAll('.game')];
 async function request(url,data){const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(5000)});const result=await r.json();if(!r.ok)throw Error(result.error);return result;}
 function cancel(){clearTimeout(timer);timer=null;}
 function fail(error){cancel();paused=true;el('pause').disabled=true;controls.forEach(b=>b.disabled=true);el('status').textContent=(error.name==='TimeoutError'?'The local C server did not respond within 5 seconds.':error.message)+' — press Start / Reset to reconnect. If needed, run python3 4_game_runtime/serve.py.';}
 async function tick(buttons=0,direction){
  if(busy||!session||(finished&&direction===undefined))return;
  cancel();busy=true;buttons|=pendingButtons;pendingButtons=0;const start=performance.now();
  try{
   const f=await request('/api/tick',{session,buttons,direction});
   segments.forEach((s,i)=>s.style.display=(f.words[i>>>5]>>>(i&31))&1?'':'none');
   if(f.status===2){finished=true;el('explore').hidden=false;el('status').textContent=`Native C exploration · F${Math.floor(f.coord/4)} S${f.coord%4}. Searching, encounters and movement animations are not ported yet.`;controls.forEach(b=>b.disabled=true);el('pause').disabled=true;
    document.querySelectorAll('[data-direction]').forEach(b=>{const kind=f.moves[Number(b.dataset.direction)];b.title=['No passage','Open passage','Locked passage','Hidden passage'][kind];});
    el('walkStatus').textContent=direction===undefined?'Choose a direction to explore.':['No passage in that direction.','Moved to the next room.','Locked: you need to find and use its key.','Hidden passage: it must be discovered first.'][f.moveResult];return;}
   frames++;el('status').textContent=`Native C ${f.status===1?'room reveal':'intro'} · tick ${frames} · ${(frames/10).toFixed(1)} s · ${f.beeperHz?f.beeperHz+' Hz':'silent'}`;
   if(el('sound').checked&&audio&&f.beeperHz>0){const oscillator=audio.createOscillator(),gain=audio.createGain();oscillator.type='square';oscillator.frequency.value=f.beeperHz;gain.gain.value=.025;oscillator.connect(gain).connect(audio.destination);oscillator.start();oscillator.stop(audio.currentTime+f.beeperDurationInMs/1000);}
  }catch(e){fail(e);}finally{busy=false;if(!finished&&(pendingButtons||!paused))timer=setTimeout(()=>tick(),pendingButtons?1:Math.max(1,100-(performance.now()-start)));}
 }
 el('reset').onclick=async()=>{
  if(busy)return;cancel();busy=true;el('reset').disabled=true;
  try{if(el('sound').checked){audio??=new AudioContext();await audio.resume();}const ready=await request('/api/start',{session,seed:el('seed').value.trim()});session=ready.session;el('generation').textContent=`Seed ${ready.seed} · entrance F${Math.floor(ready.entrance/4)} S${ready.entrance%4} · ${ready.attempts} generation attempt(s)`;el('explore').hidden=true;el('walkStatus').textContent='';frames=0;pendingButtons=0;paused=false;finished=false;controls.forEach(b=>b.disabled=false);el('pause').disabled=false;el('pause').textContent='Pause';}
  catch(e){fail(e);}finally{busy=false;el('reset').disabled=false;}
  if(session&&!paused)tick();
 };
 el('new').onclick=()=>{if(busy)return;const numbers=crypto.getRandomValues(new Uint32Array(2));el('seed').value=String(((BigInt(numbers[0])<<32n)|BigInt(numbers[1]))&((1n<<63n)-1n));el('reset').click();};
 document.querySelectorAll('[data-direction]').forEach(b=>b.onclick=()=>tick(0,Number(b.dataset.direction)));
 el('pause').onclick=()=>{paused=!paused;el('pause').textContent=paused?'Resume':'Pause';if(paused)cancel();else tick();};
 // A press is a separate tick, like the original browser input adapter.
 async function press(button){if(busy){pendingButtons|=1<<button;return;}await tick(1<<button);}
 controls.forEach(b=>b.onclick=()=>press(Number(b.dataset.button)));
 document.addEventListener('keydown',e=>{const mapping={ArrowUp:0,Enter:1,ArrowLeft:2,ArrowRight:3};if(e.repeat||e.target.matches('button,input,select'))return;if(mapping[e.key]!==undefined&&session&&!finished){e.preventDefault();press(mapping[e.key]);}});
 el('status').textContent='Ready. Press Start / Reset to run the native C intro.';
})().catch(e=>document.getElementById('status').textContent=e.message);
