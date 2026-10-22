/* ============================================================
   Timers
   The per-request countdown.
   ============================================================ */
'use strict';

function stopTimer(){if(G.tid){clearInterval(G.tid);G.tid=null}}
function startTimer(){stopTimer();const b=$('#tbar');if(G.relaxed){if(b)b.style.width='0';return}
 G.tmax=Math.max(20,50-4*Math.min(G.day,8));G.tleft=G.tmax;G.tlast=performance.now();
 G.tid=setInterval(()=>{const now=performance.now();if(G.paused||G.locked||G.modal||G.rbOpen){G.tlast=now;return}G.tleft-=(now-G.tlast)/1000;G.tlast=now;const e=$('#tbar');if(e){e.style.width=Math.max(0,G.tleft/G.tmax*100)+'%';e.className=G.tleft<G.tmax*.25?'low':''}if(G.tleft<=0){stopTimer();timeout()}},100)}
