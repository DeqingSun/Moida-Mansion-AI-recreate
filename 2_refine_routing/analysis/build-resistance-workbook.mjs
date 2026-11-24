import fs from 'node:fs/promises';
import {Workbook, SpreadsheetFile} from '@oai/artifact-tool';

const root='/Users/deqinguser/Documents/GitHub/Moida-Mansion-AI-recreate';
const d=JSON.parse(await fs.readFile(`${root}/2_refine_routing/analysis/resistance-area/results.json`,'utf8'));
const out=`${root}/2_refine_routing/outputs/lcd-resistance-area-20261124`;
await fs.mkdir(out,{recursive:true});
const wb=Workbook.create();
const sh=Object.fromEntries(['Electrodes','Islands','Cells','Game segments','Method'].map(n=>[n,wb.worksheets.add(n)]));
const format=(s,last)=>{s.showGridLines=false;s.getRange(`A1:${last}`).format.font={name:'Arial',size:10,color:'#172235'};s.getRange(`A1:${last}`).format.verticalAlignment='center';s.getRange(`A1:${last}`).format.rowHeight=20;};
function header(s,range){s.getRange(range).format={fill:'#243B53',font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'},horizontalAlignment:'center',verticalAlignment:'center',wrapText:true,rowHeight:34};}
function band(s,first,last,cols){for(let row=first;row<=last;row++)if((row-first)%2)s.getRange(`A${row}:${cols}${row}`).format.fill='#F1F5F8';}

const is=sh.Islands;
const ih=['Island','Original segment','COM','SEG','Area (mm²)','Interior x (mm)','Interior y (mm)','DXF HATCH'];
const iv=d.islands.map(s=>[s.island,s.original_segment,s.com,s.seg,s.area_mm2,s.point_x_mm,s.point_y_mm,s.dxf_handle]);
is.getRange('A1:H781').values=[ih,...iv];format(is,'H781');header(is,'A1:H1');band(is,2,781,'H');
is.getRange('A1:B781').format.columnWidth=22;is.getRange('C1:D781').format.columnWidth=12;is.getRange('E1:H781').format.columnWidth=18;
is.getRange('E2:G781').setNumberFormat('0.000');is.freezePanes.freezeRows(1);is.freezePanes.freezeColumns(2);

const ce=sh.Cells;ce.getRange('A1:D769').values=[['COM','SEG','Islands','Area (mm²)'],...d.cells.map(c=>[c.com,c.seg,null,null])];
ce.getRange('C2:D769').formulas=d.cells.map((c,i)=>{const r=i+2;return [`=COUNTIFS('Islands'!$C$2:$C$781,A${r},'Islands'!$D$2:$D$781,B${r})`,`=SUMIFS('Islands'!$E$2:$E$781,'Islands'!$C$2:$C$781,A${r},'Islands'!$D$2:$D$781,B${r})`];});
format(ce,'D769');header(ce,'A1:D1');band(ce,2,769,'D');ce.getRange('A1:D769').format.columnWidth=18;ce.getRange('C2:C769').setNumberFormat('0');ce.getRange('D2:D769').setNumberFormat('0.000');ce.freezePanes.freezeRows(1);

const gs=sh['Game segments'];gs.getRange('A1:C632').values=[['Original segment','Islands','Area (mm²)'],...d.original_segments.map(s=>[s.original_segment,null,null])];
gs.getRange('B2:C632').formulas=d.original_segments.map((s,i)=>{const r=i+2;return [`=COUNTIFS('Islands'!$B$2:$B$781,A${r})`,`=SUMIFS('Islands'!$E$2:$E$781,'Islands'!$B$2:$B$781,A${r})`];});
format(gs,'C632');header(gs,'A1:C1');band(gs,2,632,'C');gs.getRange('A1:C632').format.columnWidth=23;gs.getRange('B2:B632').setNumberFormat('0');gs.getRange('C2:C632').setNumberFormat('0.000');gs.freezePanes.freezeRows(1);

const me=sh.Method;format(me,'B25');me.getRange('A1:A25').format.columnWidth=27;me.getRange('B1:B25').format.columnWidth=105;
me.getRange('A2').values=[['Method and assumptions']];me.getRange('A2').format.font={name:'Arial',size:14,bold:true};
me.getRange('A4:B6').values=[['Sheet resistance (Ω/□)',30],['Report mesh (mm)',.025],['Verification mesh (mm)',.02]];
me.getRange('B4').format.fill='#FFF0B3';me.getRange('B4:B6').format.horizontalAlignment='left';me.getRange('B5:B6').setNumberFormat('0.000');
const notes=[
 ['Scope','Glass ITO resistance and visible segment area. Zebra contacts, PCB copper, driver output impedance and capacitance are excluded.'],
 ['Sheet resistance','The factory said “30欧”. This workbook assumes 30 Ω/square. Change B4 after confirming the units; all resistance outputs scale linearly.'],
 ['Contact terminal','All contacts are at the bottom. Ideal voltage clamp on the outer 1.5 mm strip of each 1 × 3 mm contact, representing half usable contact length. The resistance of the rubber itself is excluded.'],
 ['Segment terminal','The entire tested visible island is held at one voltage. All other visible islands retain their finite ITO sheet resistance and float. R equals applied voltage divided by total terminal current.'],
 ['First and last','Nearest and farthest visible islands by shortest connected ITO path from the contact. Eight-neighbor geometric paths use the 0.025 mm mesh. They are not straight-line distances.'],
 ['Branches','First/last by path length need not be the lowest/highest resistance islands on a branched electrode. The main table gives full-sheet R to those two stated islands.'],
 ['Solver','Four-neighbor 2D sheet resistor grid with 30 Ω per square cell adjacency. Solve the Dirichlet voltage problem and integrate contact current. The raw first/last square coefficients are in Electrodes columns L:M.'],
 ['Mesh verification',`Nine representative electrodes were rerun at 0.020 mm. Maximum resistance change was ${d.max_mesh_change_pct.toFixed(2)}%. These are numerical estimates, not exact or fabricated resistance measurements.`],
 ['Connectivity','All 64 raster conductors remained connected to their source contact. No disconnected conductor area was discarded at the report mesh.'],
 ['Areas','Analytic polygon shoelace area, subtracting holes, using final DXF SEGMENT HATCH boundaries. Narrow routing and contacts are excluded from visible segment area.'],
 ['Counting',`${d.island_count} physical islands, ${d.original_segment_count} original game segment groups, ${d.addressed_cells} occupied COM×SEG cells. Cells includes all 768 addresses, with zero area for 104 unused addresses.`],
 ['Indexing','Zero-based logical names: COM0 = B-W001 and SEG0 = T-N001. These are glass-net labels, not the replacement driver’s physical SEG pin numbers.'],
 ['Source','Moida-routing_to_vendor.dxf. Units: mm. HATCH polygons only; duplicate LWPOLYLINE outlines are not counted.'],
 ['Source SHA256',d.source_sha256],
 ['Identity check','All 780 artwork IDs were matched to final DXF island bounds and area. Electrode assignments were inferred from final conductive polygons and verified by polygon overlap.'],
 ['Reconciliation','Sum of areas over all COMs = sum over all SEGs = sum over all islands = sum over all electrical cells. Resistance equations and area sums remain visible in the workbook.'],
 ['Excluded terms','Do not add first and last resistance: they are two alternative pad-to-island measurements on the same electrode. COM-side and SEG-side values describe different glass conductors.'],
];
me.getRange(`A8:B${7+notes.length}`).values=notes;me.getRange(`B8:B${7+notes.length}`).format.wrapText=true;me.getRange(`A8:B${7+notes.length}`).format.rowHeight=42;

const el=sh.Electrodes;format(el,'M73');el.getRange('A2').values=[['LCD glass resistance and segment area']];el.getRange('A2').format.font={name:'Arial',size:14,bold:true};
el.getRange('A4').values=[['Sheet Ω/□']];el.getRange('B4').formulas=[["='Method'!B4"]];el.getRange('D4').values=[['Total area mm²']];el.getRange('E4').formulas=[["=SUM('Islands'!E2:E781)"]];el.getRange('G4').values=[['Used LCD cells']];el.getRange('H4').formulas=[["=COUNTIFS('Cells'!D2:D769,\">0\")"]];el.getRange('E4').setNumberFormat('0.000');
el.getRange('A6').values=[['Vendor DXF: bottom contacts, including COM feeds up the left side. First/last follow connected ITO paths.']];
el.getRange('A7').values=[['Glass only. 30 Ω/□ assumed. See Method for terminal definitions, mesh verification and exclusions.']];
const eh=['Electrode','DXF contact','Islands','LCD cells','Area (mm²)','First island','R first (kΩ)','Last island','R last (kΩ)','First path (mm)','Last path (mm)','First R/Rsheet','Last R/Rsheet'];
el.getRange('A9:M73').values=[eh,...d.electrodes.map(g=>[g.electrode,g.dxf_net,null,null,null,g.first_island,null,g.last_island,null,g.first_path_mm,g.last_path_mm,g.first_squares,g.last_squares])];
for(const [i,g] of d.electrodes.entries()){
 const r=i+10,c=g.electrode.startsWith('COM')?'C':'D',e=g.electrode.startsWith('COM')?'A':'B';
 el.getRange(`C${r}:E${r}`).formulas=[[`=COUNTIFS('Islands'!$${c}$2:$${c}$781,A${r})`,`=COUNTIFS('Cells'!$${e}$2:$${e}$769,A${r},'Cells'!$C$2:$C$769,">0")`,`=SUMIFS('Islands'!$E$2:$E$781,'Islands'!$${c}$2:$${c}$781,A${r})`]];
 el.getRange(`G${r}`).formulas=[[`=L${r}*'Method'!$B$4/1000`]];el.getRange(`I${r}`).formulas=[[`=M${r}*'Method'!$B$4/1000`]];
}
header(el,'A9:M9');band(el,10,73,'M');
el.getRange('A1:A73').format.columnWidth=13;el.getRange('B1:B73').format.columnWidth=14;el.getRange('C1:D73').format.columnWidth=11;el.getRange('E1:E73').format.columnWidth=16;el.getRange('F1:F73').format.columnWidth=23;el.getRange('G1:G73').format.columnWidth=16;el.getRange('H1:H73').format.columnWidth=23;el.getRange('I1:I73').format.columnWidth=16;el.getRange('J1:M73').format.columnWidth=18;
el.getRange('C10:D73').setNumberFormat('0');el.getRange('E10:E73').setNumberFormat('0.00');el.getRange('G10:G73').setNumberFormat('0.0');el.getRange('I10:K73').setNumberFormat('0.0');el.getRange('L10:M73').setNumberFormat('0.00');el.freezePanes.freezeRows(9);el.freezePanes.freezeColumns(2);

wb.recalculate();
const first=Number(el.getRange('G10').values[0][0]);me.getRange('B4').values=[[60]];wb.recalculate();const doubled=Number(el.getRange('G10').values[0][0]);if(Math.abs(doubled-2*first)>1e-8)throw Error('Sheet resistance scaling failed');me.getRange('B4').values=[[30]];wb.recalculate();
const total=Number(el.getRange('E4').values[0][0]);if(Math.abs(total-d.total_area_mm2)>1e-6)throw Error('Workbook area reconciliation failed');
const count=Number(el.getRange('H4').values[0][0]);if(count!==664)throw Error('Workbook occupied-cell count failed');
console.log((await wb.inspect({kind:'table',range:'Electrodes!A9:I13',include:'values,formulas',tableMaxRows:5,tableMaxCols:9,maxChars:3500})).ndjson);
console.log((await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:20},summary:'Formula error scan'})).ndjson);
for(const [name,range] of [['Electrodes','A1:I26'],['Islands','A1:H12'],['Cells','A1:D12'],['Game segments','A1:C12'],['Method','A1:B16']]){
 const preview=await wb.render({sheetName:name,range,scale:1.5,format:'png'});await fs.writeFile(`${out}/${name.toLowerCase()}-preview.png`,new Uint8Array(await preview.arrayBuffer()));
}
await (await SpreadsheetFile.exportXlsx(wb)).save(`${out}/Moida-LCD-resistance-area.xlsx`);
console.log(JSON.stringify({file:`${out}/Moida-LCD-resistance-area.xlsx`,area:total,occupied:count,scaling_verified:true}));
