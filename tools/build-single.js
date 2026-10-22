'use strict';
// Bundles index.html + css + js into ONE self-contained file (dist/gatekeeper-single.html),
// handy for emailing or dropping into an LMS. Run with: node tools/build-single.js
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
html = html.replace(/<link rel="stylesheet" href="([^"]+)">/, (_, f) => '<style>\n' + fs.readFileSync(path.join(root, f), 'utf8') + '</style>');
html = html.replace(/<script src="([^"]+)"><\/script>\n?/g, (_, f) => '<script>\n/* ' + f + ' */\n' + fs.readFileSync(path.join(root, f), 'utf8') + '</script>\n');
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'gatekeeper-single.html'), html);
console.log('Built dist/gatekeeper-single.html (' + Math.round(html.length / 1024) + ' KB)');
