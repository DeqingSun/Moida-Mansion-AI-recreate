'use strict';
(function(root){
const S=typeof module!=='undefined'?require('./auto-slice.js'):root.AutoSlice;
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
function intersects(a,b,c,d){return cross(a,b,c)*cross(a,b,d)<=0&&cross(c,d,a)*cross(c,d,b)<=0&&Math.max(Math.min(a[0],b[0]),Math.min(c[0],d[0]))<=Math.min(Math.max(a[0],b[0]),Math.max(c[0],d[0]))&&Math.max(Math.min(a[1],b[1]),Math.min(c[1],d[1]))<=Math.min(Math.max(a[1],b[1]),Math.max(c[1],d[1]));}
function geometry(item,rings){
 if(!Array.isArray(rings)||rings.length!==item.rings.length)throw Error('Invalid artwork rings.');
 const edges=[];
 rings.forEach((r,ri)=>{if(!Array.isArray(r)||r.length<3||r.length>10000||r.some(q=>!Array.isArray(q)||q.length!==2||q.some((v,k)=>!Number.isFinite(v)||v<0||v>(k?2160:3000))))throw Error('Artwork must stay inside the screen.');let area=0;for(let j=0;j<r.length;j++){const a=r[j],b=r[(j+1)%r.length];if(Math.hypot(a[0]-b[0],a[1]-b[1])<1e-6)throw Error('Artwork edge collapsed.');area+=a[0]*b[1]-b[0]*a[1];edges.push({a,b,ri,j,n:r.length});}if(Math.abs(area)<1e-3)throw Error('Artwork area collapsed.');});
 for(let i=0;i<edges.length;i++)for(let j=i+1;j<edges.length;j++){const a=edges[i],b=edges[j];if(a.ri===b.ri&&(b.j===a.j+1||a.j===0&&b.j===a.n-1))continue;if(intersects(a.a,a.b,b.a,b.b))throw Error('Artwork edges cannot cross or touch.');}
 for(let j=1;j<rings.length;j++){if(!S.contains({rings:[rings[0]]},rings[j][0]))throw Error('Hole must remain inside artwork.');for(let k=1;k<j;k++)if(S.contains({rings:[rings[k]]},rings[j][0])||S.contains({rings:[rings[j]]},rings[k][0]))throw Error('Artwork holes overlap.');}
 const points=rings.flat(),xs=points.map(q=>q[0]),ys=points.map(q=>q[1]);return {...item,rings,bounds:[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)]};
}
function apply(base,p){const edits=p?.geometry||{};for(const id of Object.keys(edits))if(!base.some(i=>i.id===id))throw Error('Unknown edited artwork.');return base.map(i=>edits[i.id]?geometry(i,edits[i.id]):i);}
function gap(a,b){let best=Infinity;const distance=(p,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);};if(a.rings[0].some(q=>S.contains(b,q))||b.rings[0].some(q=>S.contains(a,q)))return 0;for(const r of a.rings)for(let i=0;i<r.length;i++)for(const t of b.rings)for(let j=0;j<t.length;j++){const x=r[i],y=r[(i+1)%r.length],u=t[j],v=t[(j+1)%t.length];if(intersects(x,y,u,v))return 0;best=Math.min(best,distance(x,u,v),distance(y,u,v),distance(u,x,y),distance(v,x,y));}return best;}
function clearance(before,after,ids,margin){for(let i=0;i<after.length;i++)for(let j=i+1;j<after.length;j++){const a=after[i],b=after[j];if(!ids.has(a.id)&&!ids.has(b.id))continue;if(a.bounds[0]>b.bounds[2]+margin||b.bounds[0]>a.bounds[2]+margin||a.bounds[1]>b.bounds[3]+margin||b.bounds[1]>a.bounds[3]+margin)continue;const next=gap(a,b);if(next<margin-1e-6&&next<gap(before[i],before[j])-1e-6)throw Error('Artwork edit reduces spacing below 0.10 mm near '+b.id+'.');}}
const api={apply,geometry,clearance};root.ShapeEdit=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
