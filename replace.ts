import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(/bg-\[#003399\]/g, 'bg-blue-700');
content = content.replace(/text-\[#003399\]/g, 'text-blue-700');
content = content.replace(/hover:text-\[#003399\]/g, 'hover:text-blue-700');
content = content.replace(/indigo-/g, 'blue-');
content = content.replace(/bg-slate-900 border-r border-slate-800/g, 'bg-slate-950 border-r border-slate-900');
content = content.replace(/bg-\[#FFD700\]/g, 'bg-amber-400');

fs.writeFileSync('src/App.tsx', content);
console.log('Replacements done.');
