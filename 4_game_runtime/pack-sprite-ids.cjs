// Four 10-bit IDs per five bytes, least-significant bits first.
function packSpriteIds(ids) {
 const bytes=Array(Math.ceil(ids.length*10/8)).fill(0);
 ids.forEach((id,i)=>{
  if(!Number.isInteger(id)||id<0||id>630)throw Error('Sprite ID outside 0..630');
  const bit=i*10, pos=bit>>>3, shift=bit&7;
  bytes[pos]|=(id<<shift)&255;
  bytes[pos+1]|=id>>>(8-shift);
 });
 ids.forEach((id,i)=>{
  const bit=i*10,pos=bit>>>3;
  if((((bytes[pos]|(bytes[pos+1]<<8))>>>(bit&7))&1023)!==id)throw Error('Sprite packing changed ID');
 });
 return bytes;
}
module.exports={packSpriteIds};
