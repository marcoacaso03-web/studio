const getPixels = require('get-pixels');

getPixels('public/favicon-16x16.png', 'image/jpeg', (err, pixels) => {
  if(err) { console.error(err); return; }
  
  let validColors = [];
  
  for(let i=0; i<pixels.data.length; i+=4) {
    let r = pixels.data[i];
    let g = pixels.data[i+1];
    let b = pixels.data[i+2];
    
    let max = Math.max(r,g,b), min = Math.min(r,g,b);
    let l = (max+min)/2;
    if (l < 40 || l > 220) continue; // too dark or too light
    if (max === min) continue; // grayscale
    let s = l > 127 ? (max-min)/(255-max-min) : (max-min)/(max+min);
    if (s < 0.2) continue; // too gray
    
    let hex = '#' + r.toString(16).padStart(2,'0') + g.toString(16).padStart(2,'0') + b.toString(16).padStart(2,'0');
    validColors.push({ hex, r, g, b, s, l });
  }
  
  // count hexes
  let counts = {};
  for (let c of validColors) {
    counts[c.hex] = (counts[c.hex] || 0) + 1;
  }
  let sorted = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0, 30);
  console.log("Top Saturated Colors:", sorted);
});
