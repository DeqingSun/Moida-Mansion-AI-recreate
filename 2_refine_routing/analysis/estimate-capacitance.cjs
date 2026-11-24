// Area-based, constant dielectric-density estimates; not measured capacitance.
const fs=require('fs'),path=require('path'),C=require('../vendor/clipper.js');
const dir=path.join(__dirname,'resistance-area');
const g=JSON.parse(fs.readFileSync(path.join(dir,'geometry.json'))),r=JSON.parse(fs.readFileSync(path.join(dir,'results.json')));
if(g.source_sha256!==r.source_sha256)throw Error('Source mismatch');
const S=100000,paths=n=>n.rings.map(r=>r.map(([x,y])=>({X:Math.round(x*S),Y:Math.round(y*S)})));
const top=g.TOP.map(n=>({...n,paths:paths(n)})),bottom=g.BOTTOM.map(n=>({...n,paths:paths(n)}));
function overlap(a,b){const c=new C.Clipper(),out=[];c.AddPaths(a.paths,C.PolyType.ptSubject,true);c.AddPaths(b.paths,C.PolyType.ptClip,true);c.Execute(C.ClipType.ctIntersection,out,C.PolyFillType.pftEvenOdd,C.PolyFillType.pftEvenOdd);return Math.abs(out.reduce((v,p)=>v+C.Clipper.Area(p),0))/S/S}
const capacitance=a=>({C_10_pF_per_mm2_pF:a*10,C_30_pF_per_mm2_pF:a*30});
const cells=r.cells.map(s=>{const a=overlap(bottom.find(n=>n.electrode===s.com),top.find(n=>n.electrode===s.seg));if(a<s.area_mm2-.001)throw Error('Overlap below visible area '+s.com+'/'+s.seg);return {...s,visible_area_mm2:s.area_mm2,overlap_area_mm2:a,extra_overlap_mm2:a-s.area_mm2,...capacitance(a)}});
const islands=r.islands.map(s=>({...s,...capacitance(s.area_mm2)}));
const originals=r.original_segments.map(s=>({...s,...capacitance(s.area_mm2)}));
const electrodes=r.electrodes.map(s=>{const field=s.electrode.startsWith('COM')?'com':'seg',cs=cells.filter(c=>c[field]===s.electrode),a=cs.reduce((v,c)=>v+c.overlap_area_mm2,0);return {electrode:s.electrode,dxf_net:s.dxf_net,visible_area_mm2:s.area_mm2,overlap_area_mm2:a,extra_overlap_mm2:a-s.area_mm2,...capacitance(a)}});
const total=cells.reduce((v,c)=>v+c.overlap_area_mm2,0);
for(const prefix of ['COM','SEG'])if(Math.abs(electrodes.filter(e=>e.electrode.startsWith(prefix)).reduce((v,e)=>v+e.overlap_area_mm2,0)-total)>1e-7)throw Error('Area reconciliation');
const data={source:g.source,source_sha256:g.source_sha256,density_baseline_pF_per_mm2:10,density_sensitivity_pF_per_mm2:30,density_source:'https://www.nxp.com/docs/en/application-note/AN11491.pdf section 4.3: 10 pF/mm² example. 30 pF/mm² is an analyst-selected sensitivity, not a measured limit.',model:'C=A*c_density. Each island is a capacitor between its assigned COM and SEG. Cell/electrode sums use full TOP/BOTTOM overlap, including routing. Same-layer fringing, external stray capacitance, alignment-layer effects and dielectric nonlinearity are not separately modeled. COM and SEG totals are two views of the same capacitors; do not add them.',total_visible_area_mm2:r.total_area_mm2,total_overlap_area_mm2:total,total_extra_overlap_mm2:total-r.total_area_mm2,...capacitance(total),islands,original_segments:originals,cells,electrodes};
fs.writeFileSync(path.join(dir,'capacitance.json'),JSON.stringify(data,null,2));
function csv(name,rows){const fields=Object.keys(rows[0]);const quote=x=>'"'+String(x).replaceAll('"','""')+'"';fs.writeFileSync(path.join(dir,name),[fields,...rows.map(r=>fields.map(k=>r[k]))].map(row=>row.map(quote).join(',')).join('\n')+'\n')}
csv('island-capacitances.csv',islands);csv('original-segment-capacitances.csv',originals);csv('cell-capacitances.csv',cells);csv('electrode-capacitances.csv',electrodes);
console.log({overlap_area_mm2:total,extra_overlap_mm2:total-r.total_area_mm2,C_baseline_nF:total*.01,C_sensitivity_nF:total*.03,largest_island:islands.reduce((a,b)=>a.area_mm2>b.area_mm2?a:b)});
