// Run from repository root. Input polygons are parsed by estimate-final-dxf.py.
const fs=require('fs'),C=require('../vendor/clipper.js');
const data=JSON.parse(fs.readFileSync(process.argv[2])),S=100000;
const paths=g=>g.rings.map(r=>r.map(([x,y])=>({X:Math.round(x*S),Y:Math.round(y*S)})));
const area=ps=>Math.abs(ps.reduce((a,p)=>a+C.Clipper.Area(p),0))/(S*S);
const opposite={TOP:data.BOTTOM.flatMap(paths),BOTTOM:data.TOP.flatMap(paths)};
for(const layer of ['TOP','BOTTOM']) for(const g of data[layer]){
 const c=new C.Clipper();c.AddPaths(paths(g),C.PolyType.ptSubject,true);c.AddPaths(opposite[layer],C.PolyType.ptClip,true);let out=[];c.Execute(C.ClipType.ctIntersection,out,C.PolyFillType.pftNonZero,C.PolyFillType.pftNonZero);
 g.overlapArea=area(out);g.overlapRings=out.map(r=>r.map(p=>[p.X/S,p.Y/S]));
 const contact=g.rings.flat().filter(([x,y])=>layer==='BOTTOM'?x< -11.31:y< -114.31);
 const axis=layer==='BOTTOM'?1:0,values=contact.map(p=>p[axis]);g.contactCenter=(Math.min(...values)+Math.max(...values))/2;
 g.net=layer==='BOTTOM'?`B-W${String(Math.round(-g.contactCenter/(108/17))).padStart(3,'0')}`:`T-N${String(Math.round(g.contactCenter/(150/49))).padStart(3,'0')}`;
}
fs.writeFileSync(process.argv[3],JSON.stringify(data));
console.log(JSON.stringify({topArea:data.TOP.reduce((s,g)=>s+g.overlapArea,0),bottomArea:data.BOTTOM.reduce((s,g)=>s+g.overlapArea,0),nets:data.BOTTOM.map(g=>[g.net,g.contactCenter,g.overlapArea])},null,2));
