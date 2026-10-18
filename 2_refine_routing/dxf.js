(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./geometry'),require('./vendor/clipper'),require('./dxf-template'));else root.RouterDXF=factory(root.RouterGeometry,root.ClipperLib,root.RouterDXFTemplate)})(globalThis,(G,C,T)=>{
'use strict';
function exportDXF(project,data,selected){
 const layers=[...new Set(selected)];if(!layers.length||layers.some(l=>!['TOP','BOTTOM','SEGMENT'].includes(l)))throw Error('Select at least one DXF layer.');
 const scale=project.settings.widthMm/3000,out=[];let handle=256;
 const put=(...v)=>out.push(...v.map(x=>typeof x==='number'?String(Number(x.toFixed(9))):String(x)));
 const entity=(type,layer,sub)=>put(0,type,5,(handle++).toString(16),330,T.modelSpaceOwner,100,'AcDbEntity',8,layer,100,sub);
 function polygon(layer,ex){
  const rings=[ex.outer,...ex.holes].map(r=>r.map(p=>[p.X/G.SCALE*scale,-p.Y/G.SCALE*scale]));
  for(const r of rings){entity('LWPOLYLINE',layer,'AcDbPolyline');put(90,r.length,70,1);for(const [x,y]of r)put(10,x,20,y);}
  entity('HATCH',layer,'AcDbHatch');put(10,0,20,0,30,0,210,0,220,0,230,1,2,'SOLID',70,1,71,0,91,rings.length);
  rings.forEach((r,i)=>{put(92,i===0?3:2,72,0,73,1,93,r.length);for(const [x,y]of r)put(10,x,20,y);put(97,0);});
  put(75,0,76,1,98,0);
 }
 function polygons(paths){return C.JS.PolyTreeToExPolygons(G.bool(paths,[],G.CT.ctUnion,true));}
 let nets;if(layers.some(l=>l!=='SEGMENT'))nets=G.build(project,data).netMap;
 for(const layer of layers){
  if(layer==='SEGMENT'){for(const s of data.segments)for(const ex of polygons(G.segment(s)))polygon(layer,ex);}
  else for(const ex of polygons([...nets[layer.toLowerCase()].values()].flatMap(n=>n.paths)))polygon(layer,ex);
 }
 // Use complete symbol tables, model/paper-space blocks and layout dictionaries.
 const tags=T.text.trimEnd().split(/\r?\n/),pairs=[];
 for(let i=0;i<tags.length;i+=2)pairs.push([tags[i].trim(),tags[i+1]]);
 const result=[];for(let i=0;i<pairs.length;){
  const [code,value]=pairs[i];
  if(code==='9'&&value==='$HANDSEED'){result.push(...pairs[i],pairs[i+1][0],handle.toString(16));i+=2;continue;}
  if(code==='0'&&value==='LAYER'){
   let end=i+1;while(end<pairs.length&&pairs[end][0]!=='0')end++;
   const record=pairs.slice(i,end),name=record.find(p=>p[0]==='2')?.[1];
   if(name==='0'||layers.includes(name))for(const p of record)result.push(...p);
   i=end;continue;
  }
  if(code==='0'&&value==='TABLE'&&pairs[i+1]?.[1]==='LAYER'){
   result.push(...pairs[i++]);while(i<pairs.length&&pairs[i][0]!=='0'){result.push(pairs[i][0],pairs[i][0]==='70'?String(layers.length+1):pairs[i][1]);i++;}continue;
  }
  result.push(code,value);i++;
  if(code==='2'&&value==='ENTITIES')for(const value of out)result.push(value);
 }
 return result.join('\r\n')+'\r\n';
}
return {exportDXF};
});
