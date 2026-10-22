/* ============================================================
   World data
   Names, countries, roles, resources and their ACLs, and the four security concepts (with analogies).
   ============================================================ */
'use strict';

const HOME=['South Africa','United Kingdom','United States','Germany','Kenya'];
const FOREIGN=['Canada','Japan','Brazil','Poland','Thailand','Mexico','Chile','Norway','Vietnam','Romania'];
const CITY={'South Africa':['Johannesburg','Cape Town','Durban','Pretoria'],'United Kingdom':['London','Manchester'],'United States':['New York','Austin'],'Germany':['Berlin','Munich'],'Kenya':['Nairobi'],Canada:['Toronto'],Japan:['Tokyo'],Brazil:['São Paulo'],Poland:['Warsaw'],Thailand:['Bangkok'],Mexico:['Mexico City'],Chile:['Santiago'],Norway:['Oslo'],Vietnam:['Hanoi'],Romania:['Bucharest']};
const FIRST=['Priya','Thabo','Lerato','Sipho','Amara','Jonas','Mei','Carlos','Fatima','Liam','Nomsa','Chen','Aisha','Pieter','Zanele','Oliver','Naledi','Hassan','Emma','Kabelo','Ingrid','Tendai','Sofia','Mandla','Yusuf','Anika','Dewald','Palesa','Ravi','Grace'];
const LAST=['Naidoo','Mokoena','Van der Merwe','Okafor','Dlamini','Smith','Patel','Nkosi','Botha','Khumalo','Fischer','Mensah','Pillay','Jacobs','Mahlangu','Ndlovu','Williams','Kruger','Sithole','Chowdhury','Tshabalala','Coetzee','Lindqvist','Abdi'];
const AVATARS=['🧑‍💼','👩‍💼','👨‍💼','🧑‍💻','👩‍💻','👨‍💻','🧑‍🔧','👩‍🔧','🧑‍🏫','🧑‍🎨','👩‍🔬','👨‍🔬'];
const MFA=['Authenticator app (number match)','Hardware security key','Authenticator app (code)'];
const NETS=['Residential ISP','Corporate VPN','Office network','Mobile carrier'];
const SIGNALS=['Device never seen before on this account','Sign-in from a new city','Unfamiliar browser / OS combination'];
const ROLES={
 'finance-user':{title:['Accounts Clerk','Junior Accountant'],dept:'Finance'},
 'finance-approver':{title:['Finance Manager','Financial Controller'],dept:'Finance'},
 hr:{title:['HR Specialist','Recruiter'],dept:'HR'},
 dev:{title:['Software Developer','QA Engineer'],dept:'Engineering'},
 intern:{title:['Engineering Intern'],dept:'Engineering'},
 sre:{title:['Site Reliability Engineer'],dept:'Engineering'},
 admin:{title:['Systems Administrator'],dept:'IT'},
 helpdesk:{title:['Helpdesk Technician'],dept:'IT'},
 sales:{title:['Sales Representative','Account Executive'],dept:'Sales'},
 marketing:{title:['Marketing Coordinator'],dept:'Marketing'},
 exec:{title:['COO','VP Operations'],dept:'Executive'},
 contractor:{title:['External Contractor'],dept:'Vendor'}};
const RES={
 intranet:{name:'Company Intranet',sens:0,perm:{read:'*'}},
 assets:{name:'Brand Asset Library',sens:0,perm:{read:['marketing','sales','exec']}},
 crm:{name:'Sales CRM',sens:1,perm:{read:['sales','marketing','exec'],write:['sales']}},
 repo:{name:'Source Code Repository',sens:1,perm:{read:['dev','sre','admin','intern','contractor'],write:['dev','sre','admin']}},
 ledger:{name:'Finance Ledger',sens:2,perm:{read:['finance-user','finance-approver','exec'],write:['finance-user','finance-approver']}},
 payroll:{name:'Payroll Database',sens:2,perm:{read:['hr','finance-approver'],write:['hr']}},
 hrrec:{name:'HR Records',sens:2,perm:{read:['hr'],write:['hr']}},
 payments:{name:'Payments Approval Portal',sens:2,perm:{approve:['finance-approver']}},
 prod:{name:'Production Servers (SSH)',sens:2,priv:true,perm:{read:['sre','admin','dev'],write:['sre','admin']}},
 useradmin:{name:'User Admin Console',sens:2,priv:true,perm:{write:['helpdesk','admin']}},
 auditlog:{name:'Audit Log Store',sens:2,perm:{read:['admin'],delete:['admin']}}};
const SENS=['LOW · Internal','MEDIUM · Confidential','HIGH · Restricted'];
const VERB={read:'read',write:'make changes to',approve:'approve a payment in',delete:'delete entries from'};
const ACT={read:'READ',write:'WRITE',approve:'APPROVE',delete:'DELETE'};
const CONCEPT={
 authn:{lvl:1,icon:'🔐',name:'Authentication',q:'Who are you?',def:'Proving WHO someone is: passwords, MFA, session tokens, and checking the account is still valid.',analogy:'✈️ Passport control: is this passport genuine, is it really theirs, and is it still valid?'},
 authz:{lvl:2,icon:'🎫',name:'Authorization',q:'What may you do?',def:'Deciding WHAT a proven identity is allowed to do: roles, groups, access lists (ACLs) and least privilege.',analogy:'🛂 The visa: the passport is real, but does it permit THIS activity in THIS country?'},
 cond:{lvl:3,icon:'🌍',name:'Conditional Access',q:'Under what conditions?',def:'Granting access based on CONTEXT: location, device health, time, risk. Three outcomes: allow, step-up (extra proof) or block.',analogy:'🧳 The officer reads the situation: where you flew from, what you carry, what time it is. Odd but explainable? Extra questions. Clearly wrong? Turned back.'},
 acct:{lvl:4,icon:'🧾',name:'Accounting / Auditing',q:'Can we prove who did what?',def:'Recording who did what, when and with whose approval so every action is traceable and nobody can deny it (non-repudiation).',analogy:'📹 The CCTV and the logbook: if nothing is recorded, nobody is accountable.'}};
const NAMES={authn:'🔐 Authentication',authz:'🎫 Authorization',cond:'🌍 Conditional Access',acct:'🧾 Accounting / Audit',legit:'✅ Letting good users in'};
const ORDER=['authn','authz','cond','acct'];

const GROUP=r=>'SG-'+r.user.role.toUpperCase();
const allowed=(role,res,act)=>{const p=RES[res].perm[act];return !!p&&(p==='*'||p.includes(role))};
const hhmm=r=>pad(r.ctx.hour)+':'+pad(r.ctx.min);
const isNight=h=>h<6||h>=20;
const ip=()=>ri(41,196)+'.'+ri(0,255)+'.'+ri(0,255)+'.'+ri(1,254);
