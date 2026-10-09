importScripts('vendor/clipper.js','project.js','geometry.js');
let data=null;
self.onmessage=e=>{if(e.data.type==='init'){data=e.data.data;return}const {revision,project}=e.data;try{const clean=RouterProject.validate(project,data);const result=RouterGeometry.check(clean,data,phase=>self.postMessage({type:'progress',revision,phase}));self.postMessage({type:'result',revision,result})}catch(error){self.postMessage({type:'error',revision,error:String(error.message||error)})}};
