const fs = require('fs');
const path = require('path');

const map = {
  // Brand colors mapping
  'facc15': 'fffd66',
  '34d399': 'ace504',
  '22d3ee': '005a71',
  '0ea5e9': '005a71',
  'ff00ff': 'fffd66',
  '00ffff': '005a71',
  'ffff00': 'fffd66',
  '4ade80': 'ace504',
  '818cf8': '005a71',
  '60a5fa': '005a71',
  
  // Uppercase variations
  'FACC15': 'FFFD66',
  '34D399': 'ACE504',
  '22D3EE': '005A71',
  '0EA5E9': '005A71',
  'FF00FF': 'FFFD66',
  '00FFFF': '005A71',
  'FFFF00': 'FFFD66',
  '4ADE80': 'ACE504',
  '818CF8': '005A71',
  '60A5FA': '005A71',
};

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let changed = false;
      for (const [key, val] of Object.entries(map)) {
        if (content.includes(key)) {
          content = content.replace(new RegExp(key, 'g'), val);
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated:', fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
console.log('Done.');
