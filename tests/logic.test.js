'use strict';
// Logic test: loads the engine (no DOM) and checks that every generated request has exactly the
// answer the policy engine says it should, across thousands of random shifts.
const fs = require('fs'), vm = require('vm'), path = require('path');
const { ROOT, scripts } = require('./helpers');

const ctx = vm.createContext({ console, performance, Math });
for (const f of scripts.filter(s => s !== 'js/main.js')) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
const get = name => vm.runInContext(name, ctx);
const [seedRng, buildQueue, evaluate, FLAWS, S, dossierHTML, passList, failList] =
  ['seedRng', 'buildQueue', 'evaluate', 'FLAWS', 'S', 'dossierHTML', 'passList', 'failList'].map(get);

let total = 0, mismatches = 0, nulls = 0, leaks = 0;
const flawCount = {};
for (let seed = 0; seed < 60; seed++) {
  seedRng('t' + seed);
  for (let day = 1; day <= 7; day++) {
    for (const r of buildQueue(day)) {
      total++;
      if (!r) { nulls++; continue; }
      if (evaluate(r).decision !== r.exp) { mismatches++; console.log('MISMATCH', r.flaws); }
      for (const f of r.flaws) {
        flawCount[f] = (flawCount[f] || 0) + 1;
        S[f](r);                                   // every flaw must have an incident story
        if (FLAWS[f].lvl > Math.min(day, 5)) leaks++; // and must not appear before its shift
      }
      dossierHTML(r, 5, []); passList(r, 5);
      // the "why" text must be real sentences, never leaked code
      const why = failList(r) + r.ev.failed.map(x => x.text(r)).join(' ') + r.flaws.map(f => { const s = S[f](r); return s.who + s.what + s.lesson + s.fix; }).join(' ');
      if (/=>|\$\{|undefined|\[object/.test(why)) { leaks++; console.log('LEAKED CODE IN TEXT:', r.flaws, why.slice(0, 120)); }
    }
  }
}
const untested = Object.keys(FLAWS).filter(f => !flawCount[f]);
console.log(`requests: ${total} | mismatches: ${mismatches} | null: ${nulls} | level leaks: ${leaks} | flaw types seen: ${Object.keys(flawCount).length}/${Object.keys(FLAWS).length}`);
if (mismatches || nulls || leaks || untested.length) { console.log('FAILED', untested); process.exit(1); }
console.log('LOGIC TESTS PASSED');
