const getPixels = require('get-pixels');

getPixels('public/favicon-16x16.png', (err, pixels) => {
  if(err) {
    console.log("Error:", err);
    return;
  }
  const colorCounts = {};
  for(let i=0; i<pixels.data.length; i+=4) {
    const r = pixels.data[i];
    const g = pixels.data[i+1];
    const b = pixels.data[i+2];
    const a = pixels.data[i+3];
    if(a === 0) continue;
    
    // Ignore pure black/white/gray if it's just background or text
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    colorCounts[hex] = (colorCounts[hex] || 0) + 1;
  }
  
  const sorted = Object.entries(colorCounts).sort((a,b) => b[1] - a[1]);
  console.log(sorted.slice(0, 15));
});
