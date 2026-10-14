// Verbatim excerpts from source/moida.js, for review only.
function setMask__spritestate_u36(e,n,t){e[n]=(e[n]|t)>>>0}

function setBit__spritestate_u28(e,n,t){setMask__spritestate_u36(e,n,1<<t>>>0)}

function clearMask__spritestate_u63(e,n,t){e[n]=(e[n]&~t>>>0)>>>0}

function clearBit__spritestate_u55(e,n,t){clearMask__spritestate_u63(e,n,1<<t>>>0)}

function set__spritestate_u20(e,n,t){var s=Math.trunc(n/32),o=Math.trunc(n%32);t?setBit__spritestate_u28(e.data,s,o):clearBit__spritestate_u55(e.data,s,o)}

function showSprite__spritestate_u16(e,n,t){set__spritestate_u20(e,0|n,t)}

function testBit__spritestate_u106(e,n){var t=1<<n>>>0;return(e&t)>>>0==t}

function get__spritestate_u99(e,n){var t=Math.trunc(n/32),s=Math.trunc(n%32);return testBit__spritestate_u106(e.data[t],s)}

function onHEX3D__device95html_u67(e,n,t){if(e[n].isOn!=t){e[n].isOn=t;var s=toJSStr(t?[98,108,111,99,107]:[110,111,110,101]);null!=e[n].elem0&&(e[n].elem0.style.display=s),null!=e[n].elem1&&(e[n].elem1.style.display=s),null!=e[n].elem2&&(e[n].elem2.style.display=s)}}

function apply__device95html_u344(e){var n=-1,t=0,s=segs_721420504[0].length;e:for(;t<s;)n+=1,onHEX3D__device95html_u67(segs_721420504[0],t,get__spritestate_u99(e.spriteState,n)),t+=1;0<e.beeperHz&&0<e.beeperDurationInMs&&beepStart__device95html_u285(e.beeperHz,e.beeperDurationInMs),listenButtonIds_721420344[0]=nimCopy(listenButtonIds_721420344[0],e.wakeOnButtonIds,NTI721420314)}
