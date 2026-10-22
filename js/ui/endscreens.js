/* ============================================================
   Celebration and game over
   Skill bars, fireworks, the Zero Trust certificate and the out-of-shields screen.
   ============================================================ */
'use strict';

function conceptBars(by){return Object.keys(NAMES).filter(k=>by[k]).map(k=>{const s=by[k],p=Math.round(s.ok/s.n*100);return `<div class="mrow"><span>${NAMES[k]}</span><div class="bar wide"><i style="width:${p}%"></i></div><b>${s.ok}/${s.n}</b></div>`}).join('')}
function countUp(el,to,ms){const t0=performance.now(),dur=ms||1800;(function f(t){const p=Math.min(1,((t||performance.now())-t0)/dur);el.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1&&G.screen==='win'&&typeof requestAnimationFrame!=='undefined')requestAnimationFrame(f)})(t0)}
function startFX(){const cv=$('#fx');if(!cv||!cv.getContext)return;let c=null;try{c=cv.getContext('2d')}catch(e){}if(!c||typeof requestAnimationFrame==='undefined')return;
 let W=0,H=0;const rs=()=>{W=cv.width=window.innerWidth;H=cv.height=window.innerHeight};rs();window.addEventListener('resize',rs);
 const cols=['#18c1cc','#3fe0b0','#f0b24a','#ff8fa3','#8f84e8','#0a8fa6'],P=[],R=Math.random;
 const burst=(x,y)=>{const col=cols[Math.floor(R()*cols.length)];for(let i=0;i<80;i++){const a=R()*6.283,s=1.5+R()*5.5;P.push({k:0,x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:1,c:col})}};
 for(let i=0;i<5;i++)setTimeout(()=>{if(G.screen==='win')burst(W*(.15+.7*R()),H*(.15+.35*R()))},i*250);
 let last=0;
 const loop=ts=>{if(G.screen!=='win'){window.removeEventListener('resize',rs);return}
  if(ts-last>650){burst(W*(.1+.8*R()),H*(.1+.4*R()));last=ts}
  if(P.length<700)for(let i=0;i<3;i++)P.push({k:1,x:R()*W,y:-12,vx:(R()-.5)*2,vy:2+R()*3,l:1,c:cols[Math.floor(R()*cols.length)],r:R()*6,w:5+R()*7});
  c.clearRect(0,0,W,H);
  for(let i=P.length-1;i>=0;i--){const p=P[i];p.x+=p.vx;p.y+=p.vy;
   if(p.k===0){p.vy+=.06;p.vx*=.99;p.l-=.011;c.globalAlpha=Math.max(0,p.l);c.fillStyle=p.c;c.beginPath();c.arc(p.x,p.y,2.2,0,6.283);c.fill()}
   else{p.r+=.12;p.vx+=Math.sin(p.r)*.04;c.globalAlpha=1;c.save();c.translate(p.x,p.y);c.rotate(p.r);c.fillStyle=p.c;c.fillRect(-p.w/2,-3,p.w,6);c.restore();if(p.y>H+20)p.l=0}
   if(p.l<=0)P.splice(i,1)}
  c.globalAlpha=1;requestAnimationFrame(loop)};
 requestAnimationFrame(loop)}

function screenCelebration(rep){setScreen('win');G.celebrated=true;
 let ok=0,n=0;const by={};Object.keys(G.stats).forEach(k=>{by[k]=G.stats[k];ok+=G.stats[k].ok;n+=G.stats[k].n});
 const acc=n?Math.round(ok/n*100):0;
 const rank=acc>=95?['👑','Chief Information Security Officer']:acc>=85?['🏛️','Principal Security Architect']:acc>=70?['🛡️','Senior Gatekeeper']:['🎖️','Certified Gatekeeper'];
 const concOK=ORDER.every(k=>by[k]&&by[k].ok/by[k].n>=.8);
 const badges=[[true,'🎓','Graduate','Completed all five shifts'],[G.breaches===0,'🛡️','Untouchable','Zero breaches the whole game'],[acc>=90,'🎯','Sharpshooter','90%+ accuracy overall'],[G.reports.some(r=>r.acc===100),'🏅','Perfect Shift','A 100% shift'],[G.best>=10,'🔥','On Fire','Best streak: '+G.best+' correct in a row'],[concOK,'🧠','Concept Master','80%+ in every discipline'],[!G.relaxed,'⚡','Under Pressure','Finished with the timer on']].filter(b=>b[0]);
 const date=new Date().toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'});
 $('#app').innerHTML=`<canvas id="fx"></canvas><div class="wrap win center">
 <div class="trophy">🏆</div>
 <div class="kicker up" style="animation-delay:.6s">ALL FIVE SHIFTS COMPLETE</div>
 <h1 class="wt up" style="animation-delay:.9s">ZERO TRUST CERTIFIED</h1>
 <div class="rank up" style="animation-delay:1.3s">${rank[0]} ${rank[1]} ${rank[0]}</div>
 <p class="pitch up" style="animation-delay:1.6s">Nimbus Corp stayed standing because of you. You verified identities, enforced least privilege, read the context and kept the audit trail honest. Take a bow.</p>
 <div class="sgrid up" style="animation-delay:1.9s">
  <div class="sc"><b data-cu="${G.score}">0</b>final score</div>
  <div class="sc"><b><span data-cu="${acc}">0</span>%</b>accuracy</div>
  <div class="sc"><b data-cu="${G.best}">0</b>best streak</div>
  <div class="sc"><b data-cu="${G.breaches}">0</b>breaches</div></div>
 <div class="up" style="animation-delay:2.3s"><h3 style="margin:14px 0 4px">Badges earned</h3>${badges.map((b,i)=>`<div class="badge" style="animation-delay:${2.5+i*.25}s"><span>${b[1]}</span><div><b>${b[2]}</b><br><small class="dim">${b[3]}</small></div></div>`).join('')}</div>
 <div class="card up" style="max-width:820px;margin:18px auto;text-align:left;animation-delay:2.6s"><h3>Your skills across the whole game</h3>${conceptBars(by)}</div>
 <div class="cert up" style="animation-delay:2.9s"><div class="cs">NIMBUS CORP · SECURITY OPERATIONS</div><h2>Certificate of Zero Trust Mastery</h2><p>This certifies that</p><input id="cname" class="cname" placeholder="Type your name here" maxlength="40"><p>completed all five shifts at the Nimbus Corp checkpoint, mastering <b>Authentication, Authorization, Conditional Access</b> and <b>Accounting &amp; Auditing</b>, with <b>${acc}%</b> accuracy, earning the rank of <b>${rank[1]}</b>.</p><div class="cdate">${date}</div></div>
 <div class="center up" style="animation-delay:3.2s;padding-top:10px"><button class="big" id="bPrint">🖨️ PRINT / SAVE CERTIFICATE</button> <button class="btn" id="bEndless" style="padding:12px 18px;margin:6px">Keep playing (endless) ▶</button> <button class="btn" id="bAgain" style="padding:12px 18px;margin:6px">↻ Play again</button></div></div>`;
 $('#bPrint').onclick=()=>window.print();
 $('#bEndless').onclick=()=>{G.day=6;screenTransition(null)};
 $('#bAgain').onclick=screenStart;
 document.querySelectorAll('[data-cu]').forEach(el=>countUp(el,parseInt(el.dataset.cu,10)||0));
 startFX();
 if(G.sound)[523,659,784,1047,784,1047,1319].forEach((f,i)=>setTimeout(()=>beep(f,.28,'triangle',.08),i*160))}

function screenOver(kind){setScreen('over');
 $('#app').innerHTML=`<div class="wrap center"><div class="logo">${kind==='breach'?'💥':'📉'}</div><h1 style="font:900 36px var(--mono);color:var(--red)">${kind==='breach'?'OUT OF SHIELDS':'THE BUSINESS WALKED OUT'}</h1>
 <p class="pitch">${kind==='breach'?'You ran out of shields. Letting in bad actors and blocking real users both cost shields. Take a breath, review the rulebook and try the shift again.':'You blocked so many legitimate users that the business started working around security. That is a risk too.'}</p>
 <p>Score <b>${G.score}</b> · shift <b>${G.day}</b></p>
 <div class="card" style="max-width:700px;margin:14px auto;text-align:left"><h3>Your skills so far</h3>${conceptBars(G.stats)}</div>
 <button class="big" id="bRetry">↻ RETRY SHIFT ${G.day}</button> <button class="btn" id="bAgain" style="padding:12px 18px;margin-left:10px">Start over from shift 1</button></div>`;
 $('#bRetry').onclick=()=>{restoreSnap();startDay()};$('#bAgain').onclick=screenStart}
