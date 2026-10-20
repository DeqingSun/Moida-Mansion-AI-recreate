'use strict';
(async()=>{
 const el=id=>document.getElementById(id);
 const [svg,ids,frames]=await Promise.all([
  fetch('../1_preliminary_routing/source/panel.svg').then(r=>{if(!r.ok)throw Error('SVG unavailable');return r.text();}),
  fetch('recovered/segment-ids.json').then(r=>r.json()),fetch('opening-frames.json').then(r=>r.json())
 ]);
 el('screen').innerHTML=svg;
 const segments=ids.map(id=>document.getElementById('seg_'+id));
 if(segments.some(s=>!s))throw Error('Missing segment artwork');
 let index=0,timer=null,audio;
 el('seek').max=frames.length-1;
 function stop(){clearInterval(timer);timer=null;el('play').textContent='Play';}
 function draw(beep=false){
  const frame=frames[index];segments.forEach((s,i)=>s.style.display=(frame.words[i>>>5]>>>(i&31))&1?'':'none');
  el('seek').value=index;el('frame').textContent=`${index+1} / ${frames.length}`;
  el('status').textContent=index===frames.length-1?'End of ported sequence — the interactive intro is next.':`Time ${(index/10).toFixed(1)} s · ${frame.beeperHz?frame.beeperHz+' Hz':'silent'}`;
  if(beep&&el('sound').checked&&audio&&frame.beeperHz>0){
   const o=audio.createOscillator(),gain=audio.createGain();o.type='square';o.frequency.value=frame.beeperHz;gain.gain.value=.025;
   o.connect(gain).connect(audio.destination);o.start();o.stop(audio.currentTime+frame.beeperDurationInMs/1000);
  }
 }
 el('play').onclick=async()=>{
  if(timer){stop();return;}
  if(el('sound').checked){audio??=new AudioContext();await audio.resume();}
  if(index===frames.length-1)index=0;
  draw(true);el('play').textContent='Pause';
  timer=setInterval(()=>{if(index>=frames.length-1){stop();return;}index++;draw(true);},100);
 };
 el('restart').onclick=()=>{stop();index=0;draw();};
 el('seek').oninput=()=>{stop();index=Number(el('seek').value);draw();};
 el('play').disabled=el('restart').disabled=false;draw();
})().catch(e=>{document.getElementById('status').textContent='Preview failed: '+e.message;});
