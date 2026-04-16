import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  /<div className="h-10 flex items-end justify-end mb-1">\s*<span className="font-signature text-blue-800 text-2xl -mb-1">S\. Q\. Abbas<\/span>\s*<\/div>/g,
  `<div className="h-12 flex items-end justify-end mb-1">
                      <img src="/signature.png" alt="S. Q. Abbas" className="h-full object-contain mix-blend-multiply opacity-90" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.style.display = 'block'; }} />
                      <span className="font-signature text-blue-800 text-2xl -mb-1 hidden">S. Q. Abbas</span>
                    </div>`
);

fs.writeFileSync('src/App.tsx', content);
console.log('Replacements done.');
