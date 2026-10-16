// Isolated format experiment. Does not change the production exporter.
// node eda/experiments/unsplit.cjs <pad|fill> <new-output-directory>
const fs = require('fs');
const path = require('path');
const C = require('../convert.cjs');
const [mode, output] = process.argv.slice(2);
if (!['pad', 'fill'].includes(mode) || !output) throw Error('Expected pad|fill and a new output directory');
const folder = path.resolve(output);
if (fs.existsSync(folder)) throw Error('Refusing to overwrite an existing directory');
const project = require('../../Moida-routing.moida-routing_finished.json');
C.exportProject(project, folder, {sample: true});
const map = JSON.parse(fs.readFileSync(path.join(folder, 'moida-map.json')));
const layout = C.layout(project);
const file = path.join(folder, 'pcb/LCD.epcb2');
let records = C.parse(fs.readFileSync(file, 'utf8'));
const remove = new Set(), fills = [];
const polygon = points => [...points[0], 'L', ...points.slice(1).flat(), ...points[0]];
for (const [cid, entry] of Object.entries(map.components)) {
  const island = layout.segments.find(s => s.id === entry.island);
  if (!island.islands.some(i => i.rings.length > 1)) continue;
  if (island.islands.length !== 1) throw Error('Experiment expects one connected island');
  for (const [layer, name] of [[1, 'top'], [2, 'bottom']]) {
    const pads = entry.pads.filter(p => p.layer === name);
    const net = map.project.assignments[entry.island][name];
    const origin = mode === 'pad' ? entry.origin : [0, 0];
    const contours = island.islands[0].rings.map(ring => polygon(ring.map(q => [
      (q[0] - origin[0]) * map.scale, -(q[1] - origin[1]) * map.scale
    ])));
    for (const p of pads.slice(mode === 'pad' ? 1 : 0)) remove.add(p.id);
    if (mode === 'pad') {
      records.find(r => r.head.type === 'PAD' && r.head.id === pads[0].id).body.defaultPad.path = contours;
    } else {
      fills.push({head: {type: 'FILL', id: `unsplit-${cid}-${layer}`}, body: {
        partitionId: '', groupId: 0, netName: net, layerId: layer,
        width: 0, fillStyle: 'SOLID', path: contours, locked: true,
        zIndex: -1, isBridgingCopper: false, networkList: [], refs: null
      }});
    }
    console.log(`${mode}: ${entry.island} ${name} ${net}, ${contours.length} contours`);
  }
}
records = records.filter(r => !remove.has(r.head.id) && !(r.head.type === 'PAD_NET' && remove.has(JSON.parse(r.head.id)[3])));
const boardIndex = records.findIndex(r => r.head.type === 'DOCHEAD' && r.body.docType === 'PCB');
records.splice(boardIndex + 1, 0, ...fills);
fs.writeFileSync(file, C.encode(records));
console.log('Experimental mapping retains original pad IDs: do not use full geometry import.');
console.log(path.join(folder, path.basename(folder) + '.eprj3'));
