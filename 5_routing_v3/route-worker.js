importScripts('../2_refine_routing/vendor/clipper.js','auto-slice.js','routing.js?v=endpoint-edit-1');
onmessage=e=>{try{postMessage({result:TraceRouting.plan(e.data.project,e.data.items,e.data.request,e.data.baseItems)});}catch(error){postMessage({error:error.message});}};
