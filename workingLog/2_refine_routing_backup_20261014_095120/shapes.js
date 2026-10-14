(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./geometry'),require('./project'));else root.RefineShapes=factory(root.RouterGeometry,root.RouterProject)})(globalThis,(G,P)=>{
function shape(rings){
 if(!Array.isArray(rings)||!rings.length||rings.length>100)throw Error('Invalid island rings.');
 for(const r of rings){if(!Array.isArray(r)||r.length<3||r.length>20000||r.some(p=>!Array.isArray(p)||p.length!==2||p.some(v=>!Number.isFinite(v)||Math.abs(v)>100000)))throw Error('Invalid island vertices.');
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 for(let i=0;i<r.length;i++)for(let j=i+2;j<r.length;j++){if(i===0&&j===r.length-1)continue;const a=r[i],b=r[(i+1)%r.length],c=r[j],d=r[(j+1)%r.length];if(cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0)throw Error('Island edges cannot cross.');}}
 const paths=rings.map(G.ring),tree=G.bool(paths,[],G.CT.ctUnion,true);
 // A geometry edit preserves one connected island, including its holes.
 const C=typeof ClipperLib!=='undefined'?ClipperLib:require('./vendor/clipper');
 const polys=C.JS.PolyTreeToExPolygons(tree);if(polys.length!==1||G.area(paths)<.001)throw Error('Keep one nonempty island.');
 const normalized=[polys[0].outer,...polys[0].holes].map(r=>r.map(p=>[p.X/G.SCALE,p.Y/G.SCALE]));
 if(normalized.length!==rings.length)throw Error('A hole or edge collapsed.');
 const ys=[...new Set(normalized.flatMap(r=>r.map(p=>p[1])))].sort((a,b)=>a-b);let point;
 for(let k=1;k<ys.length&&!point;k++){const y=(ys[k-1]+ys[k])/2,xs=[];for(const r of normalized)for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length];if((a[1]>y)!==(b[1]>y))xs.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));}xs.sort((a,b)=>a-b);for(let i=1;i<xs.length;i+=2)if(xs[i]-xs[i-1]>.002){point=[(xs[i]+xs[i-1])/2,y];break;}}
 if(!point)throw Error('Island too small.');return {rings:normalized,bounds:G.bounds(normalized.map(G.ring)),point};
}
function validate(edits,data){if(!edits)return {};if(typeof edits!=='object'||Array.isArray(edits))throw Error('Invalid island edits.');const out={};for(const [id,rings]of Object.entries(edits)){if(!data.segments.some(s=>s.id===id))throw Error('Unknown edited island '+id);out[id]=shape(rings).rings;}return out;}
function layout(data,p){return {...data,segments:data.segments.map(s=>{if(!p.islandEdits?.[s.id])return s;const i=shape(p.islandEdits[s.id]);return {...s,bounds:i.bounds,islands:[i]};})};}
return {shape,validate,layout};});
