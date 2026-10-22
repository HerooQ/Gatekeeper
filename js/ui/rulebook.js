/* ============================================================
   Rulebook
   The in-game policy drawer (press R).
   ============================================================ */
'use strict';

function toggleRB(on){if(G.screen!=='play'&&G.screen!=='brief'&&on)return;G.rbOpen=on;const d=$('#rb');if(on){const L=lv();d.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center"><h2>📖 Access Policy</h2><button class="btn" id="rbX">Close (Esc)</button></div><p class="dim">Decisions: <b>ALLOW</b>, ${L>=3?'<b>STEP-UP</b>, ':''}<b>DENY</b> + reason. The timer pauses while this is open.${L>=3?' Two unnecessary STEP-UPs in one shift gets you fired.':''}</p>`+ORDER.filter(k=>CONCEPT[k].lvl<=L).map(k=>`<div class="rbsec"><h3>${CONCEPT[k].icon} ${CONCEPT[k].name} ${CONCEPT[k].lvl===L&&L>1?'<span class="tag" style="color:var(--green);border-color:var(--green)">NEW</span>':''}</h3><p class="def">${CONCEPT[k].def}</p><p class="analogy">${CONCEPT[k].analogy}</p><ul>${RULES.filter(x=>x.c===k).map(x=>`<li><span class="tag ${x.out}">${x.out==='deny'?'DENY':'STEP-UP'}</span> ${x.desc}</li>`).join('')}</ul></div>`).join('');d.classList.add('open');$('#rbX').onclick=()=>toggleRB(false)}else d.classList.remove('open')}
function closeRB(){G.rbOpen=false;const d=$('#rb');if(d)d.classList.remove('open')}
