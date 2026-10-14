let violationHighlight=null;
function clearViolation(){violationHighlight=null;render();}
function highlightViolation(issue){const shapes=[];let bounds=issue.bbox;
if(issue.geometry)shapes.push(new Path2D(issue.geometry));
else{let polygons=[];if(issue.traceId){const t=project.traces.find(t=>t.id===issue.traceId);if(t)polygons.push(...G.trace(t,project.settings.widthMm));}
else if(issue.segments){for(const id of issue.segments){const s=byId.get(id);if(s)polygons.push(...G.segment(s));}}
else if(issue.net||issue.nets){const nets=new Set(issue.nets||[issue.net]);for(const layer of issue.layer?[issue.layer]:P.LAYERS){for(const s of data.segments)if(nets.has(project.assignments[s.id]?.[layer]))polygons.push(...G.segment(s));for(const t of project.traces)if(t.layer===layer&&nets.has(t.net))polygons.push(...G.trace(t,project.settings.widthMm));for(const pad of P.PORTS)if(pad.layer===layer&&nets.has(project.pads[pad.id]))polygons.push(...G.pad(pad,project));}}
if(polygons.length){shapes.push(new Path2D(G.svgPath(polygons)));bounds=G.bounds(polygons);}}
violationHighlight={shapes,bounds};render();}
function drawViolation(px){if(!violationHighlight)return;ctx.save();ctx.fillStyle='#ffc04466';ctx.strokeStyle='#ffe16a';ctx.lineWidth=4*px;for(const path of violationHighlight.shapes){ctx.fill(path);ctx.stroke(path);}const b=violationHighlight.bounds;if(b&&b.every(Number.isFinite)){ctx.setLineDash([6*px,4*px]);ctx.lineWidth=1.5*px;ctx.strokeRect(b[0]-5*px,b[1]-5*px,b[2]-b[0]+10*px,b[3]-b[1]+10*px);}ctx.restore();}
