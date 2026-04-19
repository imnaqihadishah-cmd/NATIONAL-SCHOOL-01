import fs from 'fs';

const filePath = 'src/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove the image imports to avoid confusion and use root paths
content = content.replace(/import logoImg from '\.\/assets\/logo\.png';/g, '');
content = content.replace(/import signatureImg from '\.\/assets\/signature\.png';/g, '');

// 2. Replace all {logoImg} with "/logo.png"
content = content.replace(/\{logoImg\}/g, '"/logo.png"');

// 3. Replace all {signatureImg} with "/signature.png"
content = content.replace(/\{signatureImg\}/g, '"/signature.png"');

// 4. Remove referrerPolicy="no-referrer" from logo/signature images as they are internal
// We can do this by searching for images that use /logo.png or /signature.png
content = content.replace(/src="\/logo\.png"([^>]*?)referrerPolicy="no-referrer"/g, 'src="/logo.png"$1');
content = content.replace(/src="\/signature\.png"([^>]*?)referrerPolicy="no-referrer"/g, 'src="/signature.png"$1');

// 5. Add Logo to the Top Header for better visibility
content = content.replace(
  /<header className="h-20 bg-white\/80 backdrop-blur-md border-b border-slate-200\/60 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">/g,
  `<header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-xl p-1.5 flex items-center justify-center border border-slate-200">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none uppercase">QUAID-E-AZAM MODEL SCHOOL</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Management Dashboard</p>
              </div>
            </div>`
);

// Search for the existing header div that we might have duplicated or messed up
// The original code had:
// <header ...>
//   <div className="flex items-center gap-4">
//     <h2 className="text-2xl font-black text-slate-800 tracking-tight">System Overview</h2>
//   </div>
// Let's refine the replacement to be more precise or remove the old "System Overview"

content = content.replace(
  /<div className="flex items-center gap-4">\s*<h2 className="text-2xl font-black text-slate-800 tracking-tight">System Overview<\/h2>\s*<\/div>/g,
  ''
);

fs.writeFileSync(filePath, content);
console.log('App.tsx updated (Logo visibility and path optimization)');
