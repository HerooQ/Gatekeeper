/* ============================================================
   Utilities
   DOM helper, seeded random numbers (class codes) and small formatters.
   ============================================================ */
'use strict';

const $=(s,el)=>(el||document).querySelector(s);
let rnd=Math.random;
function seedRng(str){let h=2166136261>>>0;for(const ch of String(str)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)>>>0}let a=h;rnd=function(){a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
const ri=(a,b)=>a+Math.floor(rnd()*(b-a+1));
const pick=a=>a[Math.floor(rnd()*a.length)];
const chance=p=>rnd()<p;
const pad=n=>String(n).padStart(2,'0');
const fmtMins=m=>m<60?m+' min':m<1440?Math.round(m/60)+' h':Math.round(m/1440)+' days';
