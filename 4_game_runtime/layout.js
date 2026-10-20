'use strict';
(async()=>{
 const el=id=>document.getElementById(id),ns='http://www.w3.org/2000/svg';
 function shape(tag,attrs,text){const n=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));if(text!==undefined)n.textContent=text;el('map').append(n);return n;}
 const xy=c=>[100+(c%4)*200,70+(2-Math.floor(c/4))*140];
 const neighbor=(c,d)=>c+[-1,1,4,-4][d];
 let busy=false;
 async function generate(){
  if(busy)return;busy=true;
  el('generate').disabled=el('random').disabled=true;
  try{
   const response=await fetch('/api/layout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({seed:el('seed').value.trim()}),signal:AbortSignal.timeout(5000)});
   const g=await response.json();if(!response.ok)throw Error(g.error);
   el('seed').value=g.seed;el('map').replaceChildren();
   for(let c=0;c<12;c++)for(const d of [1,2])if(g.exits[c]&(1<<d)){
    const [x1,y1]=xy(c),[x2,y2]=xy(neighbor(c,d));shape('line',{x1,y1,x2,y2,stroke:'#b2c4bd','stroke-width':7});
   }
   if(g.locks.valid)for(const [label,p] of [['A',g.locks.a],['B',g.locks.b]])if(p[0]){
    const [x1,y1]=xy(p[1]),[x2,y2]=xy(neighbor(p[1],p[2]));
    shape('line',{x1,y1,x2,y2,stroke:'#f36a63','stroke-width':7});
    shape('text',{x:(x1+x2)/2+12,y:(y1+y2)/2-12,fill:'#ffaaa4','font-size':18},label);
   }
   for(let c=0;c<12;c++){
    const [x,y]=xy(c),entrance=c===g.entrance;
    shape('rect',{x:x-60,y:y-33,width:120,height:66,rx:10,fill:entrance?'#dbc16b':'#40564c',stroke:entrance?'#ffdf81':'#729b85','stroke-width':2});
    shape('text',{x,y:y-5,'text-anchor':'middle',fill:entrance?'#222':'#fff','font-size':17},entrance?'Entrance':`Room ${c}`);
    shape('text',{x,y:y+17,'text-anchor':'middle',fill:entrance?'#333':'#c4d7cd','font-size':12},`F${Math.floor(c/4)} · S${c%4} · depth ${g.nodes[c][0]}`);
   }
   const p=g.puzzle;
   const content=['empty','key','combination','tunnel control','friend','crown button'];
   const kind=['searchable','tunnel','door lock','fairy','ghost','gift'];
   const label=e=>e[0]===0?content[e[2]]:e[0]===5?`gift: ${content[e[2]]}`:kind[e[0]];
   const short=e=>e[0]===0?['','K','Code','T','F','C'][e[2]]:['','T','L','Fairy','G','Gift'][e[0]];
   for(let c=0;c<12;c++){
    const here=p.entities.map((e,id)=>({e,id})).filter(({e})=>e[1]===c&&e[0]!==5);
    if(here.length){const [x,y]=xy(c);const n=shape('text',{x,y:y+50,'text-anchor':'middle',fill:'#e5dfba','font-size':11},here.map(({e,id})=>`${short(e)}${id}`).join(' · '));const title=document.createElementNS(ns,'title');title.textContent=here.map(({e,id})=>`#${id}: ${label(e)}`).join(', ');n.append(title);}
   }
   el('status').textContent=p.valid?`Seed ${g.seed}: puzzle placement succeeded — ${p.entities.length} entities. See the live game preview for native room decoration and the entrance reveal.`:`Seed ${g.seed}: this candidate failed ${g.locks.valid?'puzzle placement':'lock selection'}. The original pipeline retries; this explorer shows the first attempt, including any partial entities.`;
   el('details').textContent=`Final PRNG state after puzzle placement: ${p.random.join(' / ')}\nF = friend · K = key · Code = combination · T = tunnel/control · L = lock · G = ghost · C = crown button. Numbers are entity IDs. Gifts have no physical room location.`;
   const table=document.createElement('table'),header=table.createTHead().insertRow();
   for(const name of ['ID','Room','Entity','Gate / requirements','Hint / ghost path']){const th=document.createElement('th');th.textContent=name;header.append(th);}
   const body=table.createTBody();
   p.entities.forEach((e,id)=>{
    const keys=[];for(let bit=0;bit<32;bit++)if(BigInt(e[4])&(1n<<BigInt(bit)))keys.push('#'+bit);
    const gate=e[3]?`kind ${e[3]}: ${keys.join(', ')}`:'none';
    const hint=[e[6]>=0?`hint #${e[6]}`:'',e[7]>=0?`reveals #${e[7]}`:'',e[0]===4?`path ${e.slice(8).join(' → ')}`:''].filter(Boolean).join('; ');
    const row=body.insertRow();for(const value of [id,e[0]===5?'—':e[1],label(e),gate,hint])row.insertCell().textContent=String(value);
   });el('entities').replaceChildren(table);
  }catch(e){el('status').textContent=`${e.message}. Start the native server with: python3 4_game_runtime/serve.py`;}
  finally{busy=false;el('generate').disabled=el('random').disabled=false;}
 }
 el('generate').onclick=generate;el('seed').onkeydown=e=>{if(e.key==='Enter')generate();};
 el('random').onclick=()=>{const values=crypto.getRandomValues(new Uint32Array(2));el('seed').value=String((BigInt(values[0])<<32n|BigInt(values[1]))&((1n<<63n)-1n));generate();};
 await generate();
})().catch(e=>document.getElementById('status').textContent=e.message);
