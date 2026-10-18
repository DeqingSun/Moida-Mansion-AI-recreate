'use strict';
// Join endpoint-connected EDA sections into editable polylines. Stop at branches
// and width transitions; coincident points on other nets/layers never connect.
module.exports=function joinTraces(traces,widthMm){
 const toleranceMm=.0001,epsilon=toleranceMm/(widthMm/3000),groups=new Map(),out=[];
 for(const trace of traces){const key=JSON.stringify([trace.layer,trace.net]);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(trace);}
 for(const group of groups.values()){
  const cells=new Map(),nodes=[],edges=[];
  function node(point){
   const x=Math.floor(point[0]/epsilon),y=Math.floor(point[1]/epsilon);
   for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(const n of cells.get(`${x+dx},${y+dy}`)||[])
    if(Math.hypot(n.point[0]-point[0],n.point[1]-point[1])<=epsilon)return n;
   const n={point:[...point],edges:[]};nodes.push(n);const key=`${x},${y}`;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(n);return n;
  }
  for(const t of group){const a=node(t.points[0]),b=node(t.points.at(-1));
   // Do not collapse genuine very short sections into zero-length geometry.
   if(a===b){out.push({...t,points:t.points.map(p=>[...p])});continue;}
   const e={t,a,b,used:false};edges.push(e);a.edges.push(e);b.edges.push(e);
  }
  const through=n=>n.edges.length===2&&Math.abs(n.edges[0].t.widthMm-n.edges[1].t.widthMm)<=toleranceMm;
  function walk(first,start){let edge=first,n=start;const points=[[...n.point]],members=[];const width=first.t.widthMm;
   while(edge&&!edge.used){edge.used=true;members.push(edge.t.id);n=edge.a===n?edge.b:edge.a;points.push([...n.point]);if(!through(n))break;const next=n.edges.find(e=>!e.used);if(!next||Math.abs(next.t.widthMm-width)>toleranceMm)break;edge=next;}
   out.push({...first.t,id:members.length===1?first.t.id:'eda-wire-'+require('crypto').createHash('sha256').update(members.slice().sort().join('\n')).digest('hex').slice(0,16),points});
  }
  for(const n of nodes)if(!through(n))for(const e of n.edges)if(!e.used)walk(e,n);
  for(const e of edges)if(!e.used)walk(e,e.a); // Closed loops.
 }
 return out;
};
