// Reads the permanent working PCB; never sends/replaces the user's routing.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/deqinguser/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),c=require('./convert.cjs'),path=require('path');
(async()=>{const expected=c.importProject(path.join(__dirname,'exports/Moida-LCD'));const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 const p=await b.newPage({viewport:{width:1700,height:1100}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8766/2_refine_routing/index.html');await p.waitForFunction(()=>window.RouterApp);
 assert.equal(await p.evaluate(()=>localStorage.getItem('moida-eda-export-v1')),null);
 const initial=await p.evaluate(()=>RouterApp.getProject());
 // Import works on a fresh browser without an export or local session token.
 await p.locator('#edaImport').click();await p.waitForFunction(()=>document.querySelector('#edaStatus').textContent.startsWith('Imported '),{},{timeout:90000});
 assert.equal(await p.evaluate(()=>RouterApp.getProject().traces.length),expected.summary.traceWires);
 assert.deepEqual(await p.evaluate(()=>RouterApp.getProject().assignments),expected.project.assignments);
 await p.locator('#undo').click();assert.deepEqual(await p.evaluate(()=>RouterApp.getProject()),initial);
 await p.locator('#redo').click();assert.equal(await p.evaluate(()=>RouterApp.getProject().traces.length),expected.summary.traceWires);
 // Opening is a separate non-exporting action, always targeting the Git file.
 await p.locator('#edaOpen').click();await p.waitForFunction(()=>document.querySelector('#edaStatus').textContent.startsWith('Opened '),{},{timeout:90000});
 assert.match(await p.locator('#edaStatus').innerText(),/exports\/Moida-LCD\/Moida-LCD.eprj3/);
 await p.locator('#edaImport').click();await p.waitForFunction(()=>document.querySelector('#edaStatus').textContent.startsWith('Imported '),{},{timeout:90000});
 assert.equal(await p.evaluate(()=>RouterApp.getProject().traces.length),expected.summary.traceWires);
 assert.match(await p.locator('#edaStatus').innerText(),/Saved the open EDA project/);
 assert.deepEqual(errors,[]);console.log('PASS: fresh-browser import without export, deleted wires preserved, undo/redo, open stable project, live save/import.');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
