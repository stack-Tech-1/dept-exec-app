// C:\Users\SMC\Documents\GitHub\dept-exec-app\generate-icons.js
const fs = require('fs');
const { createCanvas } = require('canvas');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconDir = path.join(__dirname, 'public', 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

// Generate simple icons with letter "I" (for IESA)
sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Green background
  ctx.fillStyle = '#0d7c3d';
  ctx.fillRect(0, 0, size, size);
  
  // White "I" in center
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.6}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('I', size/2, size/2);
  
  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(iconDir, `icon-${size}x${size}.png`), buffer);
});

console.log('✅ Icons generated successfully!');