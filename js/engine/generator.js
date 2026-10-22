/* ============================================================
   Queue generator
   makeReq() builds a verified request for a given set of flaws; buildQueue() builds each shift.
   ============================================================ */
'use strict';

function makeReq(ids){
 const exp=!ids.length?'allow':ids.some(f=>FLAWS[f].d==='deny')?'deny':'challenge';
 const okRules=new Set(ids.flatMap(f=>FLAWS[f].rules));
 for(let i=0;i<500;i++){const r=baseLegit();let ok=true;
  for(const f of ids){if(!FLAWS[f].apply(r)){ok=false;break}}
  if(!ok)continue;const ev=evaluate(r);if(ev.decision!==exp)continue;
  if(!ev.failed.every(x=>okRules.has(x.id)))continue;
  if(!ids.every(f=>FLAWS[f].rules.some(id=>ev.failed.some(x=>x.id===id))))continue;
  r.ev=ev;r.flaws=ids;r.exp=exp;r.actor=exp==='allow'?'legit':exp==='deny'?'bad':(chance(.5)?'bad':'legit');
  const u=r.user,rs=RES[r.res],v=VERB[r.action];
  r.line=u.shared?pick([`Hey, it's the ${u.dept} team login. We need to ${v} the ${rs.name}.`,`${u.dept} team here, can we ${v} the ${rs.name}?`]):
   pick([`Hi, it's ${u.first} from ${u.dept}. I need to ${v} the ${rs.name}.`,`Morning! Quick one, can you let me ${v} the ${rs.name}?`,`I'm up against a deadline. Please let me ${v} the ${rs.name}!`,`Hello, ${u.first} here. Requesting access to ${v} the ${rs.name}.`]);
  return r}
 return null}
function buildQueue(day){
 const L=Math.min(day,5),N=[6,8,10,10,12][L-1],cnt={};
 const deny=Object.keys(FLAWS).filter(f=>FLAWS[f].lvl<=L&&FLAWS[f].d==='deny'),step=Object.keys(FLAWS).filter(f=>FLAWS[f].lvl<=L&&FLAWS[f].d==='challenge');
 const p1=c=>{const nw=c.filter(f=>FLAWS[f].lvl===L),pool=(nw.length&&chance(.55))?nw:c,m=Math.min(...pool.map(f=>cnt[f]||0)),f=pick(pool.filter(x=>(cnt[x]||0)===m));cnt[f]=(cnt[f]||0)+1;return f};
 const q=[],pL=L===1?.5:.34,pS=L>=3?.2:0;
 for(let i=0;i<N;i++){const x=rnd();let kind=x<pL?'legit':x<pL+pS?'step':'bad';if(i===N-1&&!q.some(r=>r.exp==='allow'))kind='legit';
  let r=null;
  for(let t=0;t<8&&!r;t++){let ids=[];
   if(kind==='bad'){ids=[p1(deny)];if(L>=5&&t<3&&chance(.35)){const o=deny.filter(f=>FLAWS[f].c!==FLAWS[ids[0]].c);if(o.length)ids.push(pick(o))}}
   else if(kind==='step')ids=[p1(step)];
   r=makeReq(ids)}
  q.push(r||makeReq([]))}
 return q}
