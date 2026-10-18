// File geometry and rule distances are mils; the unit fields only control display.
const LIMITS={traceWidthMm:.12,traceSpacingMm:.12,segmentTraceSpacingMm:.12,crossLayerSpacingMm:.1};
function applyRules(records){
 for(const r of records){
  const b=r.body;
  // Selection filtering is independent of visibility. UNLOCKED is a state gate.
  if(r.head.type==='PRIMITIVE'&&Object.hasOwn(b,'pick')){const kind=JSON.parse(r.head.id)[1];b.pick=kind==='TRACK'||kind==='VIA'||kind==='UNLOCKED';}
  if(r.head.type==='CANVAS')b.unit='mm';
  if(r.head.type==='PREFERENCE'){b.routingCorner='L';b.startTrackWidthFollowLast=false;b.lastTrackWidth=LIMITS.traceWidthMm/.0254;b.startViaSizeFollowLast=false;b.lastViaDiameter=.12/.0254;b.lastViaInnerDiameter=.06/.0254;}
  if(r.head.type!=='RULE')continue;
  const key=JSON.parse(r.head.id),ctx=b.ruleContext;
  if(!ctx)continue;
  if(key[1]==='TRACK'){
   ctx.unit='mm';ctx.track.isOpen=true;
   for(const row of ctx.track.content){row.stroMin=LIMITS.traceWidthMm/.0254;row.stroDef=LIMITS.traceWidthMm/.0254;row.stroMax=Math.max(row.stroMax,row.stroDef);}
  }
  if(key[1]==='RADIUS'){
   // Native via-size rules store radii; preferences store diameters.
   ctx.unit='mm';ctx.defRadius=.12/2/.0254;ctx.defInner=.06/2/.0254;
   ctx.minRadius=Math.min(ctx.minRadius,ctx.defRadius);ctx.minInner=Math.min(ctx.minInner,ctx.defInner);
  }
  if(key[1]==='OTHER'){ctx.unit='mm';ctx.holeClearance=.1/.0254;}
  if(key[1]==='SAFE'){
   ctx.unit='mm';
   for(const row of ctx.safeSpacing){
    // Native v4 matrix order: Track, SMD Pad, TH Pad, SMD test point,
    // TH test point, Via, Fill Region, Copper/Plane Zone, ...
    row.content[0][0]=LIMITS.traceSpacingMm/.0254;
    // SMD/SMD, through-hole/SMD and through-hole/through-hole pad pairs.
    for(const [i,j] of [[1,1],[2,1],[2,2]])row.content[i][j]=.1/.0254;
    // Temporary single-layer test points used as manual LCD routing obstacles.
    if(row.content[3])row.content[3][0]=.1/.0254;
    // Lower-triangular matrix: update both each object's row and its column.
    for(let i=0;i<row.content.length;i++)for(let j=0;j<row.content[i].length;j++)
     if(i===5||j===5||i===12||j===12)row.content[i][j]=.1/.0254;
    for(const index of [1,6,7])if(row.content[index])row.content[index][0]=LIMITS.segmentTraceSpacingMm/.0254;
   }
  }
 }
 return records;
}
module.exports={LIMITS,applyRules};
// Append settings updates to a native journal; never rewrite copper primitives.
function updateFile(file){
 const fs=require('fs'),{parse}=require('./convert.cjs'),text=fs.readFileSync(file,'utf8'),records=parse(text);
 const before=new Map(records.filter(r=>['CANVAS','PREFERENCE','RULE','PRIMITIVE'].includes(r.head.type)).map(r=>[r.head.type+':'+r.head.id,JSON.stringify(r.body)]));
 applyRules(records);
 let ticket=Math.max(...text.split('\n').filter(l=>l.includes('||')).map(l=>JSON.parse(l.slice(0,l.indexOf('||'))).ticket||0));
 const changed=records.filter(r=>before.has(r.head.type+':'+r.head.id)&&before.get(r.head.type+':'+r.head.id)!==JSON.stringify(r.body));
 if(changed.length)fs.appendFileSync(file,'\n'+changed.map(r=>JSON.stringify({...r.head,ticket:++ticket})+'||'+JSON.stringify(r.body)+'|').join('\n')+'\n');
 return {updatedRecords:changed.length,limits:LIMITS};
}
module.exports.updateFile=updateFile;
if(require.main===module)console.log(updateFile(process.argv[2]));
