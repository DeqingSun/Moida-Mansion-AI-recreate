const fs=require('fs'),c=require('./convert.cjs');
try{const [op,folder]=process.argv.slice(2);const result=op==='export'?c.exportProject(JSON.parse(fs.readFileSync(0,'utf8')),folder):op==='import'?c.importProject(folder):null;if(!result)throw Error('Unknown operation');process.stdout.write(JSON.stringify(result));}catch(e){process.stderr.write(e.message);process.exitCode=1;}
