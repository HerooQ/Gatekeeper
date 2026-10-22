'use strict';
// UI test: loads the real index.html (with its CSS and JS files) in jsdom and plays the game.
const path = require('path');
const { JSDOM } = require('jsdom');
const { ROOT } = require('./helpers');

const fail = m => { console.log('FAIL:', m); process.exit(1); };
const ok = m => console.log('ok  -', m);

JSDOM.fromFile(path.join(ROOT, 'index.html'), { runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true }).then(dom => {
  const w = dom.window, d = w.document;
  w.addEventListener('load', () => { try { run(w, d); } catch (e) { console.log(e); process.exit(1); } });
});

function run(w, d) {
  w.Element.prototype.scrollIntoView = function () {};
  const G = () => w.eval('G'), $ = s => d.querySelector(s);
  const correct = () => {
    const r = G().cur;
    if (r.exp === 'allow') $('#bAllow').click();
    else if (r.exp === 'challenge') $('#bStep').click();
    else { $('#bDeny').click(); d.querySelector('.chip[data-c="' + [...r.ev.denyC][0] + '"]').click(); }
  };
  const fresh = (day, seed) => { w.eval('screenStart()'); d.querySelector('#oRelax').checked = true; d.querySelector('#oSeed').value = seed || 'TEST'; d.querySelector('#oDay').value = String(day); $('#bStart').click(); };

  // 1. files loaded and start screen
  if (!d.querySelector('link[rel=stylesheet]') || typeof w.eval('G') !== 'object') fail('CSS/JS not loaded');
  ok('index.html loaded its CSS and all JS files');
  fresh(1); if (G().screen !== 'brief') fail('no briefing after start');
  ok('start -> shift 1 briefing (rules screen, auto-starts in 2 minutes)');
  if (!/2 minutes/.test(d.body.textContent)) fail('2 minute note missing');
  $('#bGo').click();

  // 2. DENY shows reasons
  if (w.getComputedStyle($('#rsn')).display !== 'none') fail('reason chips visible before DENY');
  $('#bDeny').click();
  if (w.getComputedStyle($('#rsn')).display === 'none') fail('DENY did not show reasons');
  ok('DENY button reveals the reason chips');

  // 3. flawless run through all five shifts, then the celebration
  fresh(1); $('#bGo').click();
  const seen = new Set(); let guard = 0;
  while (G().screen !== 'win' && guard++ < 400) {
    const s = G().screen;
    if (s === 'play') { seen.add(G().day); if (!G().locked) correct(); if (G().lives !== 3) fail('lost a shield on correct play'); $('#bNext').click(); }
    else if (s === 'brief') { if (!$('#cdbar') || !d.querySelector('.memo')) fail('transition missing info'); $('#bGo').click(); }
    else fail('unexpected screen ' + s);
  }
  if (G().screen !== 'win') fail('never reached the celebration');
  if ([...seen].join() !== '1,2,3,4,5') fail('shifts not linear: ' + [...seen]);
  if (!$('.trophy') || !$('.wt') || !$('#cname') || !$('.badge')) fail('celebration elements missing');
  ok('played shifts 1 to 5 automatically -> celebration with trophy, badges, certificate');
  $('#bEndless').click(); if (G().day !== 6 || G().screen !== 'brief') fail('endless mode broken');
  ok('endless mode continues with shift 6');

  // 4. denying a legitimate user costs a shield
  fresh(1); $('#bGo').click();
  let n = 0; while (G().cur.exp !== 'allow' && n++ < 30) { correct(); $('#bNext').click(); }
  $('#bDeny').click(); d.querySelector('.chip').click();
  if (G().lives !== 2) fail('denying a legitimate user did not cost a shield');
  if (!/lose a shield/.test($('#modal').textContent)) fail('review text missing');
  ok('denying a legitimate user costs a shield (3 -> 2)');

  // 4b. the incident report shows real sentences (not code) for the red flags
  fresh(1); $('#bGo').click();
  n = 0; while (G().cur.exp !== 'deny' && n++ < 30) { correct(); $('#bNext').click(); }
  $('#bAllow').click();
  if (!/Red flags you missed/.test($('#modal').textContent) || /=>|\$\{/.test($('#modal').textContent)) fail('incident report shows code instead of text');
  ok('incident report lists readable red flags'); $('#mOk').click();

  // 5. losing all shields -> game over -> retry same shift
  fresh(1); $('#bGo').click();
  n = 0; while (G().screen === 'play' && n++ < 80) {
    if (!G().locked) { const r = G().cur; if (r.exp !== 'allow') $('#bAllow').click(); else { $('#bDeny').click(); d.querySelector('.chip').click(); } }
    if (d.querySelector('#modal.open')) $('#mOk').click();
    if (G().screen === 'play' && G().locked && $('#bNext')) $('#bNext').click();
  }
  if (G().screen !== 'over') fail('did not reach game over');
  $('#bRetry').click(); if (G().screen !== 'play' || G().lives !== 3) fail('retry failed');
  ok('out of shields -> game over -> retry gives 3 fresh shields');

  // 6. unnecessary step-ups: warning, then fired back to shift 1
  // (pick a seed whose shift-3 queue has a step-up request early, followed by 2+ ordinary requests)
  let seed = 0;
  for (; seed < 200; seed++) {
    fresh(3, 'STEP' + seed); $('#bGo').click();
    const q = G().queue, i = q.findIndex(r => r.exp === 'challenge');
    if (i >= 0 && i <= 5 && q.slice(i + 1).filter(r => r.exp !== 'challenge').length >= 2) break;
  }
  if (seed === 200) fail('no suitable seed found');
  n = 0; while (G().cur.exp !== 'challenge' && n++ < 40) { correct(); $('#bNext').click(); }
  $('#bStep').click(); if (G().stepStrikes !== 0) fail('a correct step-up was penalised');
  ok('a correct step-up is never penalised'); $('#bNext').click();
  while (G().cur.exp === 'challenge') { correct(); $('#bNext').click(); }
  $('#bStep').click();
  if (G().stepStrikes !== 1 || G().fired || !/Warning 1 of 2/.test($('#modal').textContent)) fail('first unnecessary step-up not handled');
  ok('first unnecessary step-up gives a warning (1 of 2)'); $('#mOk').click(); $('#bNext').click();
  while (G().cur.exp === 'challenge') { correct(); $('#bNext').click(); }
  $('#bStep').click();
  if (!G().fired || !/unnecessary tasks to the administration team/.test($('#modal').textContent)) fail('not fired on second');
  $('#mOk').click();
  if (G().day !== 1 || G().screen !== 'brief' || G().score !== 0) fail('did not restart from shift 1');
  ok('second unnecessary step-up -> FIRED -> back to shift 1');

  console.log('UI TESTS PASSED'); process.exit(0);
}
