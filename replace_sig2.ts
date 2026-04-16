import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace Student ID and Teacher ID signatures
content = content.replace(
  /<div className="text-right flex flex-col items-end">\s*<div className="h-12 flex items-end justify-end mb-1">\s*<img src="\/signature\.png" alt="S\. Q\. Abbas" className="h-full object-contain mix-blend-multiply opacity-90" onError=\{\(e\) => \{ e\.currentTarget\.style\.display = 'none'; e\.currentTarget\.nextElementSibling!\.style\.display = 'block'; \}\} \/>\s*<span className="font-signature text-blue-800 text-2xl -mb-1 hidden">S\. Q\. Abbas<\/span>\s*<\/div>\s*<div className="w-24 border-t border-slate-300 pt-1">\s*<span className="text-\[10px\] text-slate-400 uppercase font-bold tracking-wider">Principal Signature<\/span>\s*<\/div>\s*<\/div>/g,
  `<div className="text-right flex flex-col items-end relative">
                    <img src="/signature.png" alt="S. Q. Abbas" className="absolute bottom-4 right-2 h-16 object-contain mix-blend-multiply opacity-90 z-10 pointer-events-none" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.style.display = 'block'; }} />
                    <span className="font-signature text-blue-800 text-2xl absolute bottom-4 right-2 hidden z-10">S. Q. Abbas</span>
                    <div className="w-32 border-t border-slate-400 pt-1 mt-12 text-center">
                      <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Principal Signature</span>
                    </div>
                  </div>`
);

// Replace Fee Slip signature
content = content.replace(
  /<div className="text-center flex flex-col items-center">\s*<div className="h-10 flex items-end justify-center mb-1">\s*<img src="\/signature\.png" alt="S\. Q\. Abbas" className="h-full object-contain mix-blend-multiply opacity-90" onError=\{\(e\) => \{ e\.currentTarget\.style\.display = 'none'; e\.currentTarget\.nextElementSibling!\.style\.display = 'block'; \}\} \/>\s*<span className="font-signature text-blue-800 text-xl -mb-1 hidden">S\. Q\. Abbas<\/span>\s*<\/div>\s*<div className="w-20 border-t border-slate-400 pt-1">\s*<p className="text-\[9px\] font-bold text-slate-500 uppercase tracking-widest">Principal<\/p>\s*<\/div>\s*<\/div>/g,
  `<div className="text-center flex flex-col items-center relative">
                      <img src="/signature.png" alt="S. Q. Abbas" className="absolute bottom-3 h-14 object-contain mix-blend-multiply opacity-90 z-10 pointer-events-none" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.style.display = 'block'; }} />
                      <span className="font-signature text-blue-800 text-xl absolute bottom-3 hidden z-10">S. Q. Abbas</span>
                      <div className="w-24 border-t border-slate-400 pt-1 mt-10">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Principal</p>
                      </div>
                    </div>`
);

// Replace Result Card signature
content = content.replace(
  /<div className="text-center flex flex-col items-center">\s*<div className="h-12 flex items-end justify-center mb-1">\s*<img src="\/signature\.png" alt="S\. Q\. Abbas" className="h-full object-contain mix-blend-multiply opacity-90" onError=\{\(e\) => \{ e\.currentTarget\.style\.display = 'none'; e\.currentTarget\.nextElementSibling!\.style\.display = 'block'; \}\} \/>\s*<span className="font-signature text-blue-800 text-2xl -mb-1 hidden">S\. Q\. Abbas<\/span>\s*<\/div>\s*<div className="w-24 border-t border-slate-200 pt-1">\s*<p className="text-\[10px\] font-bold text-slate-400 uppercase tracking-widest">Principal<\/p>\s*<\/div>\s*<\/div>/g,
  `<div className="text-center flex flex-col items-center relative">
                      <img src="/signature.png" alt="S. Q. Abbas" className="absolute bottom-4 h-16 object-contain mix-blend-multiply opacity-90 z-10 pointer-events-none" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.style.display = 'block'; }} />
                      <span className="font-signature text-blue-800 text-2xl absolute bottom-4 hidden z-10">S. Q. Abbas</span>
                      <div className="w-28 border-t border-slate-300 pt-1 mt-12">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Principal</p>
                      </div>
                    </div>`
);

fs.writeFileSync('src/App.tsx', content);
console.log('Replacements done.');
