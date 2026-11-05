'use strict';
(async()=>{
 const el=id=>document.getElementById(id);
 const [svg,ids]=await Promise.all([fetch('recovered/routed-panel.svg').then(r=>r.text()),fetch('recovered/segment-ids.json').then(r=>r.json())]);
 el('screen').innerHTML=svg;
 let segments=ids.map(id=>document.getElementById('seg_'+id)),lastWords=new Array(20).fill(0);
 function paint(){segments.forEach((s,i)=>s.style.display=el('allSegments').checked||((lastWords[i>>>5]>>>(i&31))&1)?'':'none');}
 el('loadPanel').onclick=()=>el('panelFile').click();
 el('panelFile').onchange=async()=>{const file=el('panelFile').files[0];if(!file)return;try{if(file.size>25000000)throw Error('Panel file exceeds 25 MB.');const raw=JSON.parse(await file.text()),panel=SimulatorPanel.render(raw,ids,document);el('screen').replaceChildren(panel.svg);segments=panel.groups;paint();el('panelStatus').textContent=`${file.name}: ${raw.pieces.length} pieces / ${ids.length} game bits · ${raw.widthMm} mm wide. Visual preview; electrical connectivity is not simulated.`;}catch(e){el('panelStatus').textContent='Artwork was not changed: '+e.message;}finally{el('panelFile').value='';}};
 el('allSegments').onchange=paint;
 el('defaultPanel').onclick=()=>{el('screen').innerHTML=svg;segments=ids.map(id=>el('screen').querySelector('#seg_'+id));paint();el('panelStatus').textContent='Default artwork restored.';};
 segments.forEach(s=>s.style.display='none');
 let searched=false,session=null,timer=null,busy=false,paused=false,finished=false,frames=0,cycle=0,audio,pendingButtons=0,lastButtons=0,pendingSearch=false;
 const controls=[...document.querySelectorAll('.game')];
 async function request(url,data){const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(5000)});const result=await r.json();if(!r.ok)throw Error(result.error);return result;}
 function cancel(){clearTimeout(timer);timer=null;}
 function fail(error){cancel();paused=true;el('pause').disabled=true;controls.forEach(b=>b.disabled=true);el('status').textContent=(error.name==='TimeoutError'?'The local C server did not respond within 5 seconds.':error.message)+' — press Start / Reset to reconnect. If needed, run python3 4_game_runtime/serve.py.';}
 async function tick(buttons=0,direction,searchNext=false){
  if(busy){if(searchNext)pendingSearch=true;return;}
  searchNext ||= pendingSearch;pendingSearch=false;
  if(!session)return;
  cancel();busy=true;buttons|=pendingButtons;pendingButtons=0;if(buttons&lastButtons){pendingButtons=buttons;buttons=0;}lastButtons=buttons;const start=performance.now();
  try{
   const f=await request('/api/tick',{session,buttons,direction,animate:true,searchNext,idleAnimation:true,spiders:true,ghosts:true,encounters:el('encounters').checked});
   lastWords=f.words;paint();
   if(el('sound').checked&&audio&&f.beeperHz>0){const oscillator=audio.createOscillator(),gain=audio.createGain();oscillator.type='square';oscillator.frequency.value=f.beeperHz;gain.gain.value=.025;oscillator.connect(gain).connect(audio.destination);oscillator.start();oscillator.stop(audio.currentTime+f.beeperDurationInMs/1000);}
   if(f.cycle!==cycle){cycle=f.cycle;searched=false;finished=false;el('explore').hidden=true;el('walkStatus').textContent='';el('generation').textContent=`Seed ${el('seed').value.trim()} · mansion ${cycle+1} · entrance F${Math.floor(f.coord/4)} S${f.coord%4}`;}
   el('escape').hidden=!f.canEscape;
   controls.forEach(b=>b.disabled=false);
   if(f.status===15||f.status===16||f.status===17){el('explore').hidden=true;finished=false;}
   if(f.status===14){el('explore').hidden=true;finished=false;}
   if(f.status===11||f.status===12){el('explore').hidden=f.status===11;finished=false;}
   if(f.status===9){el('explore').hidden=true;finished=false;}
   if(f.status===4)searched=true;
   if(f.status===3||f.status===4||f.status===5||f.status===6||f.status===7||f.status===8){finished=false;el('explore').hidden=f.status===3||f.status===5||f.status===6||f.status===7||f.status===8;}
   if(f.waitingForInput)el('explore').hidden=false;
   document.querySelectorAll('[data-direction]').forEach(b=>b.disabled=f.status!==2&&(f.status!==12||f.monsterDying));
   el('searchNext').disabled=!f.waitingForInput&&f.status!==2&&f.status!==4;
   el('searchNext').textContent=f.waitingForInput?'Continue dialogue':f.status===4?'Search next object (restart)':'Search next object';
   if(f.status===4)el('walkStatus').textContent=`Searching object ${f.searchIcon}. Press Search again to switch targets and restart.`;
   if(f.status===2){finished=false;el('explore').hidden=false;el('status').textContent=`Native C exploration · F${Math.floor(f.coord/4)} S${f.coord%4}. Ordinary key/code collection works. Door keys work. Fairies can be collected. Friends can be rescued, including code-locked friends. Rescue hints, gifts, and the crown-button puzzle work. Return to the entrance with all friends available to escape. Monster encounters are enabled by the checkbox. Follow ghosts to find hidden items.`;el('pause').disabled=false;
    document.querySelectorAll('[data-direction]').forEach(b=>{const kind=f.moves[Number(b.dataset.direction)];b.title=['No passage','Open passage','Locked passage','Hidden passage'][kind];});
    el('walkStatus').textContent=searched?({49:'The spider ran away! It will appear in your escape scene.',52:'Dot found. More friends need to help.',59:'A friend is staying here to help with Dot.',60:'Your friend is available again.',53:'Crown collected! Return to the entrance to leave the mansion.',100:'Friend rescued! Their face is now in the status area. Rescue dialogue finished.',42:'Nothing new found.',44:'Found a key! Added to inventory.',46:'Found a code! Added to inventory.',47:'Found a fairy code fragment! Added to inventory.',48:'Found a latch! Hidden passage opened.',45:'Locked. Find the matching code, then search this object again.',0:'This object needs a special outcome that is not implemented yet.'}[f.searchResult]+' Object restored.'):searchNext?(f.searchIcon?`Search target ${f.searchIcon} is temporarily hidden so you can locate it. Target selection only; nothing collected.`:'No searchable object in this room.'):direction===undefined?'Choose a direction to explore.':['No passage in that direction.','Moved to the next room.','Locked: you need to find and use its key.','Hidden passage: it must be discovered first.'][f.moveResult];return;}
   frames++;el('status').textContent=`Native C ${f.status===17?'search follow-up':f.status===16?'search tutorial':f.status===15?'friend rustling':f.status===14?'ghost encounter':f.status===12?'monster attack — move to escape':f.status===11?'monster nearby':f.status===9?'escaping':f.status===8?'unlocking search object':f.status===7?'unlocking door':f.status===6?'locked door':f.status===5?'search result':f.status===4?'searching':f.status===3?'moving':f.status===1?'room reveal':'intro'} · tick ${frames} · ${(frames/10).toFixed(1)} s · ${f.beeperHz?f.beeperHz+' Hz':'silent'}`;

  }catch(e){fail(e);}finally{busy=false;if(pendingSearch||(!finished&&(pendingButtons||!paused)))timer=setTimeout(()=>tick(),pendingSearch||pendingButtons?1:Math.max(1,100-(performance.now()-start)));}
 }
 el('reset').onclick=async()=>{
  if(busy)return;cancel();busy=true;el('reset').disabled=true;
  try{if(el('sound').checked){audio??=new AudioContext();await audio.resume();}const ready=await request('/api/start',{session,seed:el('seed').value.trim()});session=ready.session;el('generation').textContent=`Seed ${ready.seed} · entrance F${Math.floor(ready.entrance/4)} S${ready.entrance%4} · ${ready.attempts} generation attempt(s)`;el('explore').hidden=true;el('walkStatus').textContent='';searched=false;frames=0;cycle=0;lastButtons=0;pendingButtons=0;pendingSearch=false;paused=false;finished=false;controls.forEach(b=>b.disabled=false);el('pause').disabled=false;el('pause').textContent='Pause';}
  catch(e){fail(e);}finally{busy=false;el('reset').disabled=false;}
  if(session&&!paused)tick();
 };
 el('new').onclick=()=>{if(busy)return;const numbers=crypto.getRandomValues(new Uint32Array(2));el('seed').value=String(((BigInt(numbers[0])<<32n)|BigInt(numbers[1]))&((1n<<63n)-1n));el('reset').click();};
 document.querySelectorAll('[data-direction]').forEach(b=>b.onclick=()=>{searched=false;tick(0,Number(b.dataset.direction));});
 el('escape').onclick=()=>tick(1);
 el('searchNext').onclick=()=>{searched=false;tick(0,undefined,true);};
 el('pause').onclick=()=>{paused=!paused;el('pause').textContent=paused?'Resume':'Pause';if(paused)cancel();else tick();};
 // A press is a separate tick, like the original browser input adapter.
 async function press(button){if(busy){pendingButtons|=1<<button;return;}await tick(1<<button);}
 controls.forEach(b=>b.onclick=()=>press(Number(b.dataset.button)));
 document.addEventListener('keydown',e=>{const mapping={ArrowUp:0,' ':0,Enter:1,ArrowLeft:2,ArrowRight:3};if(e.repeat||e.target.matches('button,input,select'))return;if(mapping[e.key]!==undefined&&session&&!finished){e.preventDefault();press(mapping[e.key]);}});
 el('status').textContent='Ready. Press Start / Reset to run the native C intro.';
})().catch(e=>document.getElementById('status').textContent=e.message);
