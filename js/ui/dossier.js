/* ============================================================
   Dossier renderer
   Draws the four-part dossier (Authentication, Authorization, Conditional Access, Accounting).
   ============================================================ */
'use strict';

function dossierHTML(r,lvl,hl){
 const u=r.user,c=r.ctx,a=r.auth,rs=RES[r.res],H=k=>hl&&hl.includes(k)?' hl':'';
 const R=(k,l,v)=>`<div class="row${H(k)}"><span class="lb">${l}</span><span class="vl">${v}</span></div>`;
 let h=`<section class="sec s-authn"><h3>🔐 Authentication <small>who are you?</small></h3>`+
  R('user','Username',`${u.username}@nimbus.corp<br><small>${u.name} · ${u.empId}</small>`)+
  R('pw','Password check',a.pw==='ok'?'Verified (hash match)':a.pw==='wrong'?`FAILED: ${a.attempts} attempts in 2 min`:'Verified, but the hash appears in breach corpus "Sep-2026 dump"')+
  R('mfa','MFA',a.mfa==='passed'?`Passed: ${a.method}`:a.mfa==='skipped'?'Not reached (password failed)':a.mfa==='notenrolled'?'Not enrolled (password-only account)':`Approved on prompt #${a.prompts}, ${a.prompts-1} denied in 6 min`)+
  R('token','Session token',a.token==='ok'?'Bound to this device ✔ (fp a41c…)':'Issued to Windows 11 / Chrome, presented by Linux / python-requests (fingerprint mismatch)')+
  R('status','Account status (HR)',u.status==='active'?`Active: ${u.note}`:`<b>${u.status==='expired'?'CONTRACT EXPIRED':'TERMINATED'}</b>: ${u.note}`)+`</section>`;
 if(lvl>=2){const p=rs.perm[r.action];
  h+=`<section class="sec s-authz"><h3>🎫 Authorization <small>what may you do?</small></h3>`+
  R('title','Job title',`${u.title} · ${u.dept}`)+R('group','Directory group',GROUP(r))+
  R('req','Requested',`${ACT[r.action]} → ${rs.name}`)+
  R('acl',`ACL: who may ${r.action}`,!p?'No group':p==='*'?'All staff & contractors':p.map(x=>'SG-'+x.toUpperCase()).join(', '))+`</section>`}
 if(lvl>=3){const d=c.device;
  h+=`<section class="sec s-cond"><h3>🌍 Conditional Access <small>under what conditions?</small></h3>`+
  R('ip','Sign-in from',`${c.city}, ${c.country}<br><small>${c.ip}</small>`)+R('net','Network',c.net)+
  R('last','Previous sign-in',`${c.last.city}, ${c.last.country} · ${fmtMins(c.last.mins)} ago`)+
  R('device','Device',`${d.name}<br><small>${d.kind==='managed'?(d.compliant?'Managed · compliant ✔ (encrypted, patched, AV on)':'Managed · NON-COMPLIANT: '+d.issue):d.kind==='byod'?'Personal device · unmanaged':d.issue}</small>`)+
  R('time','Local time',`${hhmm(r)}<br><small>On-call tonight: ${u.onCall?'Yes':'No'}</small>`)+
  R('signals','Risk signals',c.signals.length?c.signals.join('; '):'None, familiar device & location')+
  R('travel','Travel notice',u.travel?`Approved: ${u.travel.country} (${u.travel.days} days)`:'None on file')+`</section>`}
 if(lvl>=4){const t=r.acct.ticket,pm=r.acct.payment;
  h+=`<section class="sec s-acct"><h3>🧾 Accounting / Auditing <small>can we prove who did what?</small></h3>`+
  R('acctype','Account type',u.shared?`Shared account: password known by ${u.size} people`:'Personal (single owner)')+
  R('ticket','Change ticket',t?`${t.id} · scope: ${t.scope}<br><small>${t.note}</small>`:'Not required for this action')+
  R('agent','Audit / EDR agent',c.device.kind==='byod'?'Gateway session logging active (no agent on personal devices)':r.acct.agent==='running'?'Running ✔ (heartbeat 12 s ago)':r.acct.agent==='missing'?'NOT INSTALLED on this device':'STOPPED: last heartbeat 3 days ago')+
  (pm?R('payment','Payment record',`${pm.id} · ${pm.amount}<br><small>Created by ${pm.createdBy} · Approver requested: ${u.name}</small>`):'')+`</section>`}
 return h}
