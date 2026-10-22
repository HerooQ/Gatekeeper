/* ============================================================
   Game state and audio
   The single game-state object G, the current difficulty level, and the beep helper.
   ============================================================ */
'use strict';

const G={screen:'start',day:1,lives:3,biz:100,score:0,relaxed:false,seed:'',sound:true,stats:{},dayStats:null,mistakes:[],queue:[],idx:0,cur:null,locked:false,paused:false,pendingDeny:false,modal:null,rbOpen:false,tid:null,tleft:0,tmax:0,tlast:0,adv:null,tt:null,snap:null,celebrated:false,streak:0,best:0,breaches:0,shiftBreaches:0,reports:[],hover:false,stepStrikes:0,fired:false};
const lv=()=>Math.min(G.day,5);
let AC=null;
function beep(fr,d,t,v){if(!G.sound)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.type=t||'square';o.frequency.value=fr;g.gain.value=v||.05;o.connect(g);g.connect(AC.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+(d||.12));o.stop(AC.currentTime+(d||.12))}catch(e){}}
