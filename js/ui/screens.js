/* ============================================================
   Screens and shift flow
   Start screen, automatic shift briefings, play screen, HUD and shift scoring.
   ============================================================ */
'use strict';

function setScreen(s){G.screen=s;stopTimer();clearTT();clearAdv();closeRB()}
function screenStart(){setScreen('start');
 $('#app').innerHTML=`<div class="wrap start"><div class="logo">🛡️</div><h1>GATEKEEPER</h1><p class="sub">Zero Trust Checkpoint · Nimbus Corp Security Operations</p>
 <p class="pitch">Every request that reaches the gate arrives with a dossier. Decide who gets in, who gets turned back, and who gets pulled aside for extra proof. Wave the wrong person through and you'll read the incident report.</p>
 <div class="cgrid">${ORDER.map(k=>`<div class="card"><h3>${CONCEPT[k].icon} ${CONCEPT[k].name}</h3><p>${CONCEPT[k].q}</p><p class="an">${CONCEPT[k].analogy}</p></div>`).join('')}</div>
 <div class="opts"><label><input type="checkbox" id="oRelax"> Relaxed mode (no timer)</label>
 <label>Class code (optional) <input type="text" id="oSeed" placeholder="e.g. CYBER-101" size="14"></label>
 <label>Start at day <select id="oDay">${[1,2,3,4,5].map(d=>`<option>${d}</option>`).join('')}</select></label></div>
 <button class="big" id="bStart">▶ START SHIFT</button>
 <p class="fine">Keys: A allow · S step-up · D deny · 1-4 denial reason · R rulebook · Enter next<br>Same class code = same customers for everyone, handy for a classroom debrief.</p></div>`;
 $('#bStart').onclick=()=>{G.relaxed=$('#oRelax').checked;G.seed=$('#oSeed').value.trim();G.day=parseInt($('#oDay').value,10)||1;G.lives=3;G.biz=100;G.score=0;G.stats={};G.reports=[];G.breaches=0;G.streak=0;G.best=0;G.celebrated=false;G.fired=false;G.stepStrikes=0;screenTransition(null)}}

function clearTT(){if(G.tt){clearInterval(G.tt);G.tt=null}}
function clearAdv(){if(G.adv){clearInterval(G.adv);G.adv=null}}
function screenTransition(rep){setScreen('brief');const L=lv(),nc=ORDER.find(k=>CONCEPT[k].lvl===L);
 const tips=['Study the dossier, then choose ALLOW or DENY. When you deny, stamp the reason so we know you understand the failure.','A real employee with a valid login can still be the wrong person for the job. Compare the user\'s group with the resource\'s ACL.','New button: STEP-UP. Use it when something is unusual but explainable. Block only when policy says block. Careful: two unnecessary step-ups in one shift and you are fired.','Even authorised, healthy, well-located users can be refused when we couldn\'t prove or trust the record of their actions.','Everything at once. Some requests break more than one rule, and the queue is moving faster. This is Zero Trust: never trust, always verify.'];
 let body='';
 if(nc){const c=CONCEPT[nc];body=`<p><b>New this shift: ${c.icon} ${c.name}</b>: ${c.q}</p><p>${c.def}</p><div class="an">${c.analogy}</div><p><b>Policy additions:</b></p><ul>${RULES.filter(x=>x.c===nc).map(x=>`<li><span class="tg ${x.out}">${x.out==='deny'?'DENY':'STEP-UP'}</span>${x.desc}</li>`).join('')}</ul>`}
 else body=`<p>No new rules, but all four disciplines stay in force:</p><ul>${ORDER.map(k=>`<li>${CONCEPT[k].icon} <b>${CONCEPT[k].name}</b>: ${CONCEPT[k].q}</li>`).join('')}</ul>`;
 let recap='';
 if(rep){const weak=ORDER.filter(k=>rep.by[k]&&rep.by[k].ok/rep.by[k].n<.8);
  recap=`<div class="card recap"><div class="rh"><div class="grade sm">${rep.grade}</div><div><b>Shift ${rep.day} complete</b><br><span class="dim">${rep.acc}% correct · ${rep.pts>=0?'+':''}${rep.pts} pts · ${rep.breaches?rep.breaches+' breach'+(rep.breaches>1?'es':''):'no breaches'}</span></div></div>${conceptBars(rep.by)}${weak.length?`<p class="dim">Worth a second look: ${weak.map(k=>CONCEPT[k].icon+' '+CONCEPT[k].name).join(', ')}. The rulebook has the details.</p>`:''}</div>`}
 const secs=120,t0=performance.now();
 $('#app').innerHTML=`<div class="wrap">${recap}<div class="memo"><h2>MEMO · FROM: CISO · TO: GATEKEEPER · SHIFT ${G.day}${G.day>5?' · ENDLESS':''}</h2>${body}<p><b>Briefing:</b> ${tips[L-1]}</p>${G.relaxed?'<p>(Relaxed mode: no timer.)</p>':'<p>Time per request: '+Math.max(20,50-4*Math.min(G.day,8))+' seconds.</p>'}<p>You get a fresh set of <b>3 shields</b> every shift. Admitting a bad actor <i>or</i> blocking a legitimate user costs a shield.</p></div>
 <div class="center"><p class="dim">Take your time reading the rules. The shift starts automatically in <b>2 minutes</b>, or press the button when you are ready.</p><div class="cd"><i id="cdbar"></i></div><button class="big" id="bGo">START SHIFT ${G.day} NOW ▶</button></div></div>`;
 const go=()=>{clearTT();startDay()};$('#bGo').onclick=go;
 G.tt=setInterval(()=>{const p=(performance.now()-t0)/1000/secs,b=$('#cdbar');if(b)b.style.width=Math.min(100,p*100)+'%';if(p>=1)go()},100)}

function startDay(){clearTT();if(G.seed)seedRng(G.seed+':'+G.day);else rnd=Math.random;
 G.snap=JSON.stringify({score:G.score,stats:G.stats,streak:G.streak,best:G.best,breaches:G.breaches,reports:G.reports});
 G.lives=3;G.biz=100;G.shiftBreaches=0;G.stepStrikes=0;
 G.queue=buildQueue(G.day);G.idx=0;G.dayStats={ok:0,n:0,by:{},pts:0};G.mistakes=[];nextReq()}
function restoreSnap(){if(G.snap)Object.assign(G,JSON.parse(G.snap))}
function finishShift(){const d=G.dayStats,acc=d.n?Math.round(d.ok/d.n*100):0,grade=acc>=95?'S':acc>=85?'A':acc>=70?'B':acc>=50?'C':'D';
 const rep={day:G.day,acc,grade,pts:d.pts,breaches:G.shiftBreaches,by:d.by,n:d.n,ok:d.ok};G.reports.push(rep);
 if(G.day===5&&!G.celebrated){screenCelebration(rep);return}
 G.day++;screenTransition(rep)}
function nextReq(){if(G.idx>=G.queue.length){finishShift();return}
 G.cur=G.queue[G.idx];G.locked=false;G.hover=false;G.pendingDeny=false;G.screen='play';renderPlay();startTimer()}
function hudHTML(){return `<span class="brand">🛡️ GATEKEEPER</span><span class="stat">SHIFT <b>${G.day}</b></span><span class="stat">SCORE <b>${G.score}</b></span><span class="stat">SECURITY <b>${'🛡️'.repeat(G.lives)}${'💥'.repeat(3-G.lives)}</b></span><span class="stat">BUSINESS <span class="bar"><i style="width:${Math.max(0,G.biz)}%"></i></span></span><span class="stat">REQ <b>${Math.min(G.idx+1,G.queue.length)}/${G.queue.length}</b></span>${lv()>=3?`<span class="stat" title="Unnecessary step-ups this shift. Two and you are fired.">ESCALATIONS <b>${G.stepStrikes}/2</b></span>`:''}<div class="timer" title="time left"><i id="tbar"></i></div><button class="btn" id="bSnd">${G.sound?'🔊':'🔇'}</button><button class="btn" id="bRB">📖 Rulebook (R)</button>`}
function updateHud(){const h=$('#hud');if(h){h.innerHTML=hudHTML();bindHud()}}
function bindHud(){const a=$('#bRB'),b=$('#bSnd');if(a)a.onclick=()=>toggleRB(!G.rbOpen);if(b)b.onclick=()=>{G.sound=!G.sound;b.textContent=G.sound?'🔊':'🔇';beep(660,.1)}}
function reasonList(){return ORDER.filter(k=>CONCEPT[k].lvl<=lv())}
function renderPlay(){const r=G.cur,L=lv(),u=r.user,rs=RES[r.res];
 $('#app').innerHTML=`<div class="wrap"><div class="hud" id="hud">${hudHTML()}</div>
 <div class="stage"><aside class="booth"><div class="avatar">${u.avatar}</div><div class="nm">${u.name}</div><div class="dim">${u.shared?'Shared account':u.title+' · '+u.dept}</div>
 <div class="bubble">“${r.line}”</div>
 <div class="want"><div class="dim">REQUEST</div><div class="v ${r.action}">${ACT[r.action]}</div><div>${rs.name}</div><span class="sens s${rs.sens}">${SENS[rs.sens]}</span></div>
 <div class="dots">${G.queue.map((q,i)=>`<i class="${i<G.idx?'d':i===G.idx?'c':''}"></i>`).join('')}</div></aside>
 <main class="dossier" id="dos">${dossierHTML(r,L)}<div id="stamp"></div></main></div>
 <div class="actions"><div class="btns"><button class="ab allow" id="bAllow"><b>ALLOW</b><small>A</small></button>
 <button class="ab step" id="bStep" ${L<3?'disabled':''}><b>${L<3?'🔒 STEP-UP':'STEP-UP'}</b><small>${L<3?'unlocks on day 3':'S · extra MFA'}</small></button>
 <button class="ab deny" id="bDeny"><b>DENY</b><small>D</small></button></div>
 <div class="reasons" id="rsn" hidden><span class="dim">Stamp the reason:</span>${reasonList().map((k,i)=>`<button class="chip" data-c="${k}"><kbd>${i+1}</kbd>${CONCEPT[k].icon} ${CONCEPT[k].name} failure</button>`).join('')}</div>
 <div id="fb"></div></div></div>`;
 bindHud();$('#bAllow').onclick=()=>decide('allow');$('#bStep').onclick=()=>decide('challenge');$('#bDeny').onclick=showReasons;
 document.querySelectorAll('.chip').forEach(b=>b.onclick=()=>decide('deny',b.dataset.c))}
function showReasons(){if(G.locked)return;G.pendingDeny=true;const e=$('#rsn');e.hidden=false;e.scrollIntoView({block:'nearest',behavior:'smooth'})}
function hideReasons(){G.pendingDeny=false;const e=$('#rsn');if(e)e.hidden=true}
