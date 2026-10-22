/* ============================================================
   Entry point
   Keyboard controls and game start.
   ============================================================ */
'use strict';

function init(){
 document.addEventListener('keydown',e=>{if(e.target&&e.target.matches&&e.target.matches('input,select,textarea'))return;const k=e.key.toLowerCase();
  if(G.modal){if(k==='enter'||k===' '||k==='escape'){e.preventDefault();closeModal()}return}
  if(G.rbOpen){if(k==='escape'||k==='r')toggleRB(false);return}
  if(G.screen==='brief'){if(k==='enter'||k===' '){e.preventDefault();clearTT();startDay()}else if(k==='r')toggleRB(true);return}
  if(G.screen!=='play')return;
  if(k==='r'){toggleRB(true);return}
  if(G.locked){if(k==='enter'||k===' '||k==='n'){e.preventDefault();advance()}return}
  if(k==='a')decide('allow');else if(k==='s'&&lv()>=3)decide('challenge');else if(k==='d')showReasons();
  else if(k==='escape')hideReasons();
  else if(G.pendingDeny){const i=parseInt(k,10),l=reasonList();if(i>=1&&i<=l.length)decide('deny',l[i-1])}});
 screenStart()}

init();
