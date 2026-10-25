const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/deqinguser/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
const page=await browser.newPage({viewport:{width:1500,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:8773/5_routing_v3/');await page.locator('#start').click();
assert.equal(await page.evaluate(()=>MeshApp.getProject().cols),60);
// Drag a mesh intersection onto a real island using visible pointer interaction.
const points=await page.evaluate(()=>{const p=MeshApp.getProject(),i=MeshApp.getItems().find(i=>i.id==='C02S106_0');return {start:MeshApp.worldToScreen(MeshModel.position(p,1,1)),end:MeshApp.worldToScreen(i.point),id:i.id};});
await page.mouse.move(points.start.x,points.start.y);await page.mouse.down();await page.mouse.move(points.end.x,points.end.y,{steps:12});await page.mouse.up();
assert.deepEqual(await page.evaluate(id=>MeshApp.getProject().assignments[id],points.id),{t:1,b:1});
await page.locator('#undo').click();assert.equal(await page.evaluate(()=>Object.keys(MeshApp.getProject().assignments).length),0);
await page.locator('#redo').click();assert.equal(await page.evaluate(()=>Object.keys(MeshApp.getProject().assignments).length),1);
await page.locator('#whole').check();await page.locator('#assign').click();assert.equal(await page.evaluate(()=>Object.keys(MeshApp.getProject().assignments).length),10);
// Explicit reassignment transfers the pair and undo restores every former sibling.
await page.locator('#search').fill('C00S01');await page.locator('#islands').selectOption('C00S01_0');const before=await page.evaluate(()=>MeshApp.getProject());await page.locator('#assign').click();assert.deepEqual(await page.evaluate(()=>MeshApp.getProject().assignments),{'C00S01_0':{t:1,b:1}});await page.locator('#undo').click();assert.deepEqual(await page.evaluate(()=>MeshApp.getProject()),before);
await page.locator('#pairT').fill('60');await page.locator('#pairB').fill('16');await page.locator('#choosePair').click();await page.locator('#assign').click();
await page.locator('#cols').fill('48');await page.locator('#apply').click();assert.equal(await page.evaluate(()=>MeshApp.getProject().cols),60);
await page.locator('#cols').fill('64');await page.locator('#scale').fill('0.6');await page.locator('#apply').click();assert.equal(await page.evaluate(()=>MeshApp.getProject().widthMm),90);
const saved=await page.evaluate(()=>MeshApp.getProject());await page.reload();assert.deepEqual(await page.evaluate(()=>MeshApp.getProject()),saved);
// JSON save/load uses the public UI.
const dlPromise=page.waitForEvent('download');await page.locator('#save').click();const dl=await dlPromise;const file=await dl.path();await page.locator('#new').click();await page.locator('#start').click();assert.equal(await page.evaluate(()=>Object.keys(MeshApp.getProject().assignments).length),0);await page.locator('#file').setInputFiles(file);await page.waitForFunction(()=>MeshApp.getProject().cols===64);assert.deepEqual(await page.evaluate(()=>MeshApp.getProject()),saved);
// Pin a pair, then try to drag a different intersection onto it.
await page.locator('#new').click();await page.locator('#startCols').fill('4');await page.locator('#startRows').fill('4');await page.locator('#start').click();
await page.locator('#search').fill('C00S01');await page.locator('#islands').selectOption('C00S01_0');await page.locator('#pairT').fill('3');await page.locator('#pairB').fill('3');await page.locator('#choosePair').click();await page.locator('#assign').click();await page.locator('#fit').click();
const pinned=await page.evaluate(()=>MeshApp.getProject());
const blockPoints=await page.evaluate(()=>{const p=MeshApp.getProject();return {a:MeshApp.worldToScreen(MeshModel.position(p,2,2)),b:MeshApp.worldToScreen([2400,1700])};});
await page.mouse.move(blockPoints.a.x,blockPoints.a.y);await page.mouse.down();await page.mouse.move(blockPoints.b.x,blockPoints.b.y,{steps:5});
assert(await page.locator('#meshStatus').evaluate(el=>el.classList.contains('warning')));
await page.screenshot({path:'/tmp/moida-v3-crossing-warning.png'});
await page.mouse.up();assert.deepEqual(await page.evaluate(()=>MeshApp.getProject()),pinned);
assert.match(await page.locator('#message').innerText(),/Drag cancelled/);
// Escape cancels a valid preview, including automatic neighbor movement.
await page.mouse.move(blockPoints.a.x,blockPoints.a.y);await page.mouse.down();await page.mouse.move(blockPoints.a.x+20,blockPoints.a.y+15);await page.keyboard.press('Escape');await page.mouse.up();assert.deepEqual(await page.evaluate(()=>MeshApp.getProject()),pinned);
await page.locator('#fit').click();await page.locator('#search').fill('');await page.screenshot({path:'/tmp/moida-v3-mesh.png'});
await page.locator('#boxMode').click();
const groupCoords=await page.evaluate(()=>({a:MeshApp.worldToScreen([1100,800]),b:MeshApp.worldToScreen([1900,1400]),start:MeshApp.worldToScreen([1200,864]),end:MeshApp.worldToScreen([1220,879])}));
await page.mouse.move(groupCoords.a.x,groupCoords.a.y);await page.mouse.down();await page.mouse.move(groupCoords.b.x,groupCoords.b.y,{steps:6});await page.mouse.up();
assert.match(await page.locator('#meshSelectionCount').innerText(),/4 points selected/);
const groupBefore=await page.evaluate(()=>MeshApp.getProject());
await page.mouse.move(groupCoords.start.x,groupCoords.start.y);await page.mouse.down();await page.mouse.move(groupCoords.end.x,groupCoords.end.y,{steps:5});await page.mouse.up();
const groupAfter=await page.evaluate(()=>MeshApp.getProject());assert.deepEqual(groupAfter.assignments,groupBefore.assignments);
assert(Math.abs(groupAfter.nodes['2:2'][0]-1220)<1);assert(Math.abs(groupAfter.nodes['3:3'][0]-1820)<1);
await page.locator('#undo').click();assert.deepEqual(await page.evaluate(()=>MeshApp.getProject()),groupBefore);
await page.locator('#redo').click();assert.deepEqual(await page.evaluate(()=>MeshApp.getProject()),groupAfter);
await page.locator('#clearMeshSelection').click();assert.equal(await page.locator('#meshSelectionCount').innerText(),'');
assert.deepEqual(errors,[]);console.log('PASS: drag assignment, undo/redo, whole segment, pair transfer and undo, protected resize, physical scale, autosave reload, JSON round-trip, crossing warning/rejection, Escape cancellation, no browser errors.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
