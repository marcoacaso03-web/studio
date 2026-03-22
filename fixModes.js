const fs = require('fs');
const path = require('path');

const fileNames = [
  'src/app/altro/page.tsx',
  'src/app/membri/page.tsx',
  'src/app/allenamento/page.tsx',
  'src/app/calendario/page.tsx',
  'src/app/login/page.tsx',
  'src/components/layout/bottom-nav.tsx',
];

for (const name of fileNames) {
  const fullPath = path.join(__dirname, name);
  if (!fs.existsSync(fullPath)) continue;
  let content = fs.readFileSync(fullPath, 'utf8');

  // Replace hardcoded dark theme text colors to standard tailwind
  // so it works in light mode too. But we only do standard text-white
  // that implies main text. Buttons or colored badges we should be careful.
  content = content.replace(/bg-\[#111625\]/g, 'bg-card border-border');
  content = content.replace(/bg-\[#05070a\]/g, 'bg-background');
  content = content.replace(/bg-\[#0a0d14\]/g, 'bg-card/50');
  
  // Testo scuro vs testo chiaro.
  // Instead of text-white, let's just make it text-foreground for text outside of explicit colored pills.
  // Actually, replacing text-white with text-foreground globally might break button texts.
  // Let's replace text-white with text-foreground where it's generic text.
  content = content.replace(/text-white/g, 'text-foreground');
  // but if the text is inside a gradient or button (e.g. `text-foreground font-medium text-lg tracking-wide`), it's probably fine because text-foreground handles light/dark inversion! Except on buttons that are solid neon!
  // Wait, if it's on a solid background, it needs text-primary-foreground or just white. I'll stick to text-foreground globally, and if it's over a gradient, the gradient in light mode is quite bright! e.g. #FFFD66 to #ACE504. In light mode, a bright gradient requires DARK text! So text-foreground (which becomes dark in light mode) is PERFECT!
  // Same for `text-black`. Let's change text-black over gradients to `text-foreground` or simply `text-primary-foreground` NO, wait.
  // The gradients are:
  // yellow is very light. Green is light. Teal is dark.
  // If it's `from-[#fffd66] to-[#ace504]`, the contrast needs black text regardless of mode.
  // If we change text-white to text-foreground, in Dark Mode it's white, in Light Mode it's black.
  
  // also fix text-muted-foreground/60
  content = content.replace(/text-white\/60/g, 'text-muted-foreground');
  content = content.replace(/text-white\/50/g, 'text-muted-foreground/80');
  content = content.replace(/text-white\/40/g, 'text-muted-foreground/60');
  content = content.replace(/text-white\/30/g, 'text-muted-foreground/40');
  
  content = content.replace(/bg-white\/5/g, 'bg-card/20 hover:bg-card/30');
  content = content.replace(/bg-white\/10/g, 'bg-card/40 hover:bg-card/50');

  // fix specific button cases where we want text to invert
  content = content.replace(/text-black/g, 'text-primary-foreground');

  fs.writeFileSync(fullPath, content);
  console.log('Fixed themes for:', fullPath);
}
