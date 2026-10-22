/* ============================================================
   Decisions and feedback
   Allow / step-up / deny logic, scoring, shield loss, the firing rule and the feedback bar.
   ============================================================ */
'use strict';

function stamp(kind){const el=$('#stamp');if(!el)return;const m={allow:['ALLOWED','var(--green)'],deny:['DENIED','var(--red)'],challenge:['STEP-UP','var(--amber)'],timeout:['TIMED OUT','var(--dim)']}[kind];el.innerHTML=`<div class="stampmark" style="color:${m[1]};border-color:${m[1]}">${m[0]}</div>`}
function stepResult(r){return r.actor==='bad'?`❌ <b>Step-up FAILED.</b> The person couldn't produce the second factor, so an attacker was stopped and the real owner alerted.`:`✅ <b>Step-up PASSED.</b> It really was ${r.user.first}; they proved it in seconds and got in.`}
function passList(r,L){const a=[`Password verified, MFA passed (${r.auth.method}), session bound to device`,'Account is active'];
 if(L>=2)a.push(`${GROUP(r)} is on the ACL for ${ACT[r.action]} on ${RES[r.res].name}`);
 if(L>=3){a.push('Familiar location, no risk signals, no impossible travel');a.push(r.ctx.device.kind==='byod'?'Personal device is acceptable for LOW sensitivity data':'Managed, compliant device');if(isNight(r.ctx.hour))a.push('After hours, but this user is on call');else a.push('Normal working hours')}
 if(L>=4){a.push('Personal account, logging active'+(r.acct.ticket?', valid scoped change ticket':'')+(r.acct.payment?', no conflict of interest':''))}return a}
function failList(r){return `<ul>${r.ev.failed.map(x=>`<li>${x.text(r)}</li>`).join('')}</ul>`}
function hlKeys(r){return [...new Set(r.ev.failed.flatMap(x=>x.f))]}
function adj(d){G.score=Math.max(0,G.score+d);G.dayStats.pts+=d}

function decide(choice,reason){
 if(G.locked||G.screen!=='play')return;G.locked=true;stopTimer();hideReasons();
 const r=G.cur,L=lv(),ev=r.ev,exp=r.exp,prim=ev.failed.length?ev.failed[0].c:'legit';
 const ds=G.dayStats;ds.n++;ds.by[prim]=ds.by[prim]||{ok:0,n:0};ds.by[prim].n++;G.stats[prim]=G.stats[prim]||{ok:0,n:0};G.stats[prim].n++;
 stamp(choice);let fb='',cls='ok',modal=null,breach=false;
 if(choice===exp){ds.ok++;ds.by[prim].ok++;G.stats[prim].ok++;G.streak++;G.best=Math.max(G.best,G.streak);let pts=100;beep(choice==='deny'?220:760,.12,choice==='deny'?'sawtooth':'square');
  if(choice==='allow')fb=`✔ <b>Correct.</b> Everything checked out for ${r.user.first}:<ul>${passList(r,L).slice(0,4).map(x=>`<li>${x}</li>`).join('')}</ul>`;
  else if(choice==='challenge')fb=`✔ <b>Correct: proportional response.</b> ${stepResult(r)}<ul>${r.ev.failed.map(x=>`<li>${x.text(r)}</li>`).join('')}</ul>`;
  else if(ev.denyC.has(reason)){pts+=50;fb=`✔ <b>Denied for the right reason (+50 bonus).</b>${failList(r)}`}
  else{cls='meh';pts+=10;const want=[...ev.denyC][0];fb=`✔ <b>Right call, wrong stamp.</b> This was a <b>${CONCEPT[want].icon} ${CONCEPT[want].name}</b> failure: ${CONCEPT[want].def}${failList(r)}`;G.mistakes.push({t:FLAWS[r.flaws[0]].title,m:`Denied correctly but stamped ${CONCEPT[reason].name}; it was ${CONCEPT[want].name}.`})}
  adj(pts)}
 else{cls='bad';G.streak=0;beep(110,.35,'sawtooth',.07);
  if(choice==='allow'&&(exp==='deny'||r.actor==='bad')){breach=true;G.lives--;G.breaches++;G.shiftBreaches++;adj(-150);modal=breachModal(r,exp);fb=`💥 <b>Security incident.</b> You admitted someone you should have stopped.`;G.mistakes.push({t:FLAWS[r.flaws[0]].title,m:'ALLOWED, breach.'})}
  else if(choice==='allow'){G.biz-=0;adj(-25);cls='meh';modal=luckyModal(r);fb=`⚠️ <b>You skipped step-up.</b> It was the real user this time, but the policy was broken.`;G.mistakes.push({t:FLAWS[r.flaws[0]].title,m:'Allowed without step-up (lucky).'})}
  else if(choice==='deny'&&exp==='allow'){G.lives--;G.biz-=12;adj(-25);modal=falsePosModal(r,L);fb=`😤 <b>False positive.</b> You blocked a legitimate user.`;G.mistakes.push({t:'Legitimate user',m:'Wrongly denied '+r.user.name+'.'})}
  else if(choice==='deny'){G.biz-=5;adj(-10);cls='meh';modal=bluntModal(r);fb=`⚠️ <b>Too blunt.</b> Conditional Access prefers a proportional response.`;G.mistakes.push({t:FLAWS[r.flaws[0]].title,m:'Denied when STEP-UP was the right response.'})}
  else if(exp==='allow'){G.biz-=4;adj(-10);cls='meh';modal=frictionModal(r,L);fb=`⚠️ <b>Needless friction.</b> Nothing was wrong with this request.`;G.mistakes.push({t:'Legitimate user',m:'Unnecessary step-up for '+r.user.name+'.'})}
  else{G.biz-=3;cls='meh';modal=wasteModal(r);fb=`⚠️ <b>Step-up can't fix this.</b>`;G.mistakes.push({t:FLAWS[r.flaws[0]].title,m:'Used STEP-UP on a hard-deny violation.'})}}
 if(choice==='challenge'&&exp!=='challenge'){G.stepStrikes++;if(G.stepStrikes>=2){G.fired=true;modal={cls:'',html:firedModal(r)};fb='🔥 <b>You are fired.</b>'}else if(modal){modal.html=modal.html.replace('<div class="center">','<div class="ms r"><h4>Warning 1 of 2</h4>One more unnecessary STEP-UP this shift and you are fired.</div><div class="center">')}}
 showFb(fb,cls);updateHud();if(modal)openModal(modal.html,modal.cls)}
function timeout(){if(G.locked)return;G.locked=true;const r=G.cur,prim=r.ev.failed.length?r.ev.failed[0].c:'legit',ds=G.dayStats;ds.n++;ds.by[prim]=ds.by[prim]||{ok:0,n:0};ds.by[prim].n++;G.stats[prim]=G.stats[prim]||{ok:0,n:0};G.stats[prim].n++;
 stamp('timeout');G.streak=0;G.biz-=8;adj(-10);hideReasons();G.mistakes.push({t:'Timeout',m:'Ran out of time on '+r.user.name+'.'});beep(110,.3,'sawtooth');
 const right=r.exp==='allow'?'ALLOW':r.exp==='deny'?'DENY':'STEP-UP';
 showFb(`⏱️ <b>Queue backed up: the user gave up.</b> Slow decisions cost the business too. The right answer was <b>${right}</b>:${r.exp==='allow'?`<ul>${passList(r,lv()).slice(0,3).map(x=>`<li>${x}</li>`).join('')}</ul>`:failList(r)}`,'meh');updateHud()}
function showFb(html,cls){const el=$('#fb');el.innerHTML=`<div class="fb ${cls}"><div class="t">${html}</div><button class="next" id="bNext">Next ▶<i id="nbar"></i></button></div>`;$('#bNext').onclick=advance;el.onmouseenter=()=>{G.hover=true};el.onmouseleave=()=>{G.hover=false};el.scrollIntoView({block:'nearest',behavior:'smooth'});if(cls==='ok')scheduleAdv()}
function scheduleAdv(){clearAdv();const total=6000;let el=0,last=performance.now();G.adv=setInterval(()=>{const now=performance.now(),dt=now-last;last=now;if(G.modal||G.rbOpen||G.hover)return;el+=dt;const b=$('#nbar');if(b)b.style.width=Math.min(100,el/total*100)+'%';if(el>=total)advance()},100)}
function advance(){clearAdv();if(G.modal)return;if(G.fired){restartAll();return}if(G.lives<=0){screenOver('breach');return}if(G.biz<=0){screenOver('biz');return}G.idx++;nextReq()}
