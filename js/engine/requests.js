/* ============================================================
   Request factory and flaws
   Builds a legitimate request, then the FLAWS table of things that can be wrong with it.
   ============================================================ */
'use strict';

function makeUser(role){const f=pick(FIRST),l=pick(LAST),d=ROLES[role];
 return{first:f,last:l,name:f+' '+l,username:(f[0]+l.replace(/ /g,'')).toLowerCase(),role,title:pick(d.title),dept:d.dept,avatar:pick(AVATARS),status:'active',note:'Employed since '+ri(2016,2025),onCall:(role==='sre'||role==='admin')&&chance(.6),shared:false,travel:null,empId:'NC-'+ri(1000,9999)}}
const managedDev=()=>({kind:'managed',name:'NC-LT-'+ri(1000,9999)+' (Nimbus laptop)',compliant:true,issue:null});
const byodDev=()=>({kind:'byod',name:pick(['Personal phone (Android)','Home PC (Windows 11)','Personal tablet (iPad)']),compliant:null,issue:null});
function setTarget(r,res,action){
 r.res=res;r.action=action;const rs=RES[res];
 r.acct.ticket=(rs.priv&&action==='write')?{status:'valid',id:'CHG-'+ri(10000,99999),scope:rs.name,note:'Approved · change window open now'}:null;
 r.acct.payment=res==='payments'?{id:'PAY-'+ri(1000,9999),amount:'R '+ri(12,480)+' 000',createdBy:pick(FIRST)+' '+pick(LAST)}:null;
 if(rs.sens>=1&&r.ctx.device.kind==='byod')r.ctx.device=managedDev();
 if(isNight(r.ctx.hour)&&!(rs.sens===2&&r.user.onCall))r.ctx.hour=ri(8,16);}
function reuser(r,roles){r.user=makeUser(pick(roles))}
function baseLegit(){
 const role=pick(Object.keys(ROLES)),u=makeUser(role),combos=[];
 for(const k in RES)for(const a in RES[k].perm){if(k==='auditlog'&&a==='delete')continue;if(allowed(role,k,a))combos.push([k,a])}
 let pool=combos.filter(c=>c[0]!=='intranet');if(!pool.length||chance(.2))pool=combos;
 const [res,action]=pick(pool),home=chance(.75)?'South Africa':pick(HOME);
 const r={id:ri(100000,999999),user:u,res,action,
  auth:{pw:'ok',attempts:0,mfa:'passed',method:pick(MFA),prompts:0,token:'ok'},
  ctx:{country:home,city:pick(CITY[home]),ip:ip(),net:pick(NETS),device:managedDev(),hour:ri(7,17),min:ri(0,59),last:{country:home,city:pick(CITY[home]),mins:ri(700,4000)},signals:[]},
  acct:{agent:'running',ticket:null,payment:null}};
 setTarget(r,res,action);
 const s=RES[res].sens;
 if(s===0&&chance(.2))r.ctx.device=byodDev();
 if(s===2&&u.onCall&&chance(.4))r.ctx.hour=pick([21,22,23,0,1,2,3,4,5]);
 return r}

/* ---------- flaws (what can be wrong) ---------- */
const FLAWS={
 badpw:{lvl:1,c:'authn',d:'deny',rules:['pw_fail'],title:'Brute-force / failed credentials',apply(r){r.auth.pw='wrong';r.auth.attempts=ri(4,12);r.auth.mfa='skipped';r.auth.method=null;return true}},
 breached:{lvl:1,c:'authn',d:'deny',rules:['pw_breach','mfa_missing'],title:'Leaked password, no MFA',apply(r){r.auth.pw='breached';r.auth.mfa='notenrolled';r.auth.method=null;return true}},
 nomfa:{lvl:1,c:'authn',d:'deny',rules:['mfa_missing'],title:'No MFA enrolled',apply(r){r.auth.mfa='notenrolled';r.auth.method=null;return true}},
 fatigue:{lvl:1,c:'authn',d:'deny',rules:['mfa_fatigue'],title:'MFA fatigue attack',apply(r){r.auth.prompts=ri(9,34);r.auth.mfa='fatigue';return true}},
 gone:{lvl:1,c:'authn',d:'deny',rules:['acct_disabled'],title:'Offboarded account still active',apply(r){if(r.user.role==='contractor'){r.user.status='expired';r.user.note='Contract ended '+ri(3,40)+' days ago'}else{r.user.status='terminated';r.user.note='Left the company '+ri(3,60)+' days ago'}return true}},
 replay:{lvl:1,c:'authn',d:'deny',rules:['token_replay'],title:'Stolen session token',apply(r){r.auth.token='replayed';return true}},
 wrongrole:{lvl:2,c:'authz',d:'deny',rules:['perm'],title:'Snooping outside their role',apply(r){const o=[];for(const k in RES){if(RES[k].sens<1)continue;if(Object.keys(RES[k].perm).every(a=>!allowed(r.user.role,k,a)))for(const a in RES[k].perm)o.push([k,a])}if(!o.length)return false;const t=pick(o);setTarget(r,t[0],t[1]);return true}},
 overreach:{lvl:2,c:'authz',d:'deny',rules:['perm'],title:'Privilege creep (read ≠ write)',apply(r){reuser(r,['intern','marketing','exec','dev','finance-approver','contractor']);const o=[];for(const k in RES){const p=RES[k].perm;if(p.read&&p.write&&p.read!=='*'&&allowed(r.user.role,k,'read')&&!allowed(r.user.role,k,'write'))o.push(k)}if(!o.length)return false;setTarget(r,pick(o),'write');return true}},
 anon:{lvl:3,c:'cond',d:'deny',rules:['anon'],title:'Anonymising network',apply(r){r.ctx.net=pick(['Tor exit node','Anonymizing VPN service','Public proxy (no-log)']);return true}},
 impossible:{lvl:3,c:'cond',d:'deny',rules:['impossible'],title:'Impossible travel',apply(r){const b=pick(HOME.filter(x=>x!==r.ctx.country));r.ctx.last={country:b,city:pick(CITY[b]),mins:ri(15,150)};return true}},
 geo:{lvl:3,c:'cond',d:'deny',rules:['geo_block'],title:'Sign-in from a no-operations country',apply(r){const c=pick(FOREIGN);r.ctx.country=c;r.ctx.city=pick(CITY[c]);r.ctx.last={country:'South Africa',city:'Johannesburg',mins:ri(1500,6000)};return true}},
 rooted:{lvl:3,c:'cond',d:'deny',rules:['dev_rooted'],title:'Jailbroken / rooted device',apply(r){r.ctx.device={kind:'rooted',name:pick(['Personal phone (jailbroken iPhone)','Personal phone (rooted Android)']),compliant:false,issue:'Root / jailbreak detected'};return true}},
 noncompliant:{lvl:3,c:'cond',d:'deny',rules:['dev_noncompliant'],title:'Unhealthy managed device',apply(r){if(RES[r.res].sens<1||r.ctx.device.kind!=='managed')return false;r.ctx.device.compliant=false;r.ctx.device.issue=pick(['Disk encryption is OFF','Critical OS patches 4 months overdue','Antivirus / EDR disabled']);return true}},
 byodhigh:{lvl:3,c:'cond',d:'deny',rules:['dev_byod_high'],title:'Personal device on restricted data',apply(r){if(RES[r.res].sens!==2)return false;r.ctx.device=byodDev();return true}},
 afterhours:{lvl:3,c:'cond',d:'deny',rules:['after_high'],title:'Off-hours access, not on call',apply(r){if(RES[r.res].sens!==2)return false;r.user.onCall=false;r.ctx.hour=pick([22,23,0,1,2,3,4,5]);return true}},
 byodmed:{lvl:3,c:'cond',d:'challenge',rules:['dev_byod_med'],title:'Unmanaged device on confidential data',apply(r){if(RES[r.res].sens!==1)return false;r.ctx.device=byodDev();return true}},
 newdev:{lvl:3,c:'cond',d:'challenge',rules:['unfamiliar'],title:'Unfamiliar sign-in properties',apply(r){if(RES[r.res].sens<1)return false;r.ctx.signals=[pick(SIGNALS)];return true}},
 travel:{lvl:3,c:'cond',d:'challenge',rules:['geo_notice'],title:'Travelling abroad (notice on file)',apply(r){const c=pick(FOREIGN);r.ctx.country=c;r.ctx.city=pick(CITY[c]);r.ctx.last={country:'South Africa',city:'Johannesburg',mins:ri(1500,6000)};r.user.travel={country:c,days:ri(2,10)};return true}},
 lateMed:{lvl:3,c:'cond',d:'challenge',rules:['after_med'],title:'After-hours on confidential data',apply(r){if(RES[r.res].sens!==1)return false;r.ctx.hour=pick([20,21,22,23,0,1,2,3,4,5]);return true}},
 shared:{lvl:4,c:'acct',d:'deny',rules:['shared'],title:'Shared account',apply(r){const u=r.user;u.shared=true;u.username='shared-'+u.dept.toLowerCase();u.name='Shared login · '+u.dept+' team';u.first='The '+u.dept+' team';u.avatar='👥';u.size=ri(3,9);return true}},
 noticket:{lvl:4,c:'acct',d:'deny',rules:['ticket'],title:'Privileged change without a valid ticket',apply(r){reuser(r,['sre','admin','helpdesk']);const o=[['prod','write'],['useradmin','write']].filter(x=>allowed(r.user.role,x[0],x[1]));if(!o.length)return false;const t=pick(o);setTarget(r,t[0],t[1]);const k=pick(['none','expired','wrong']),rs=RES[t[0]];
  r.acct.ticket=k==='none'?{status:'none',id:'n/a',scope:'n/a',note:'No ticket attached'}:k==='expired'?{status:'expired',id:'CHG-'+ri(10000,99999),scope:rs.name,note:'Change window closed '+ri(2,9)+' days ago'}:{status:'wrong',id:'CHG-'+ri(10000,99999),scope:pick(['Marketing website deploy','Printer firmware update','Quarterly workstation patching']),note:'Approved, but for a different system'};return true}},
 noagent:{lvl:4,c:'acct',d:'deny',rules:['agent'],title:'Logging disabled',apply(r){r.acct.agent=pick(['stopped','missing']);return true}},
 logtamper:{lvl:4,c:'acct',d:'deny',rules:['log_tamper'],title:'Deleting audit logs',apply(r){reuser(r,['admin']);setTarget(r,'auditlog','delete');return true}},
 sod:{lvl:4,c:'acct',d:'deny',rules:['sod'],title:'Approving their own payment',apply(r){reuser(r,['finance-approver']);setTarget(r,'payments','approve');r.acct.payment.createdBy=r.user.name;return true}}};
