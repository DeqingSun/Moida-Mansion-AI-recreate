(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.RefineMeasure=api})(globalThis,()=>{
 const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]],cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
 function project(p,a,b){const d=sub(b,a),n=d[0]**2+d[1]**2,t=n?Math.max(0,Math.min(1,((p[0]-a[0])*d[0]+(p[1]-a[1])*d[1])/n)):0;return [a[0]+t*d[0],a[1]+t*d[1]]}
 function edges(s){return s.islands.flatMap(i=>i.rings.flatMap(r=>r.map((p,j)=>[p,r[(j+1)%r.length]])))}
 function inRing(p,r){let inside=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside}return inside}
 function contains(s,p){return s.islands.some(i=>inRing(p,i.rings[0])&&!i.rings.slice(1).some(r=>inRing(p,r)))}
 function nearest(a,b){let best={distance:Infinity,a:null,b:null};const consider=(p,q)=>{const distance=Math.hypot(p[0]-q[0],p[1]-q[1]);if(distance<best.distance)best={distance,a:[...p],b:[...q]}};
 const ea=edges(a),eb=edges(b);
 for(const [p,p2]of ea)for(const [q,q2]of eb){const u=sub(p2,p),v=sub(q2,q),w=sub(q,p),den=cross(u,v);if(Math.abs(den)>1e-12){const t=cross(w,v)/den,s=cross(w,u)/den;if(t>=0&&t<=1&&s>=0&&s<=1){const z=[p[0]+t*u[0],p[1]+t*u[1]];return {distance:0,a:z,b:z}}}consider(p,project(p,q,q2));consider(p2,project(p2,q,q2));consider(project(q,p,p2),q);consider(project(q2,p,p2),q2)}
 if(best.distance<1e-9)return {...best,distance:0};
 // A polygon wholly within filled material has zero separation; holes remain empty.
 for(const i of a.islands)if(contains(b,i.rings[0][0]))return {distance:0,a:i.rings[0][0],b:i.rings[0][0]};
 for(const i of b.islands)if(contains(a,i.rings[0][0]))return {distance:0,a:i.rings[0][0],b:i.rings[0][0]};
 return best;
 }
 function scaleProject(p,width=100){const result=JSON.parse(JSON.stringify(p)),ratio=width/p.settings.widthMm;result.settings.widthMm=width;for(const k of ['padSizeMm','clearanceMm','gridMm'])result.settings[k]*=ratio;for(const t of result.traces)t.widthMm*=ratio;return result}
 return {nearest,scaleProject};
});
