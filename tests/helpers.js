'use strict';
// Shared by the tests: the list of game scripts, read from index.html so the order is never duplicated.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const scripts = [...fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
module.exports = { ROOT, scripts };
