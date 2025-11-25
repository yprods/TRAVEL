// Create proper sized icons using SVG and convert to PNG
// This creates simple but properly sized icons
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create SVG icon and convert to data URL
const createIconSVG = (size) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.1}"/>
  <circle cx="${size * 0.5}" cy="${size * 0.5}" r="${size * 0.35}" fill="none" stroke="#ffffff" stroke-width="${size * 0.03}"/>
  <ellipse cx="${size * 0.5}" cy="${size * 0.4}" rx="${size * 0.35}" ry="${size * 0.1}" fill="none" stroke="#ffffff" stroke-width="${size * 0.015}"/>
  <ellipse cx="${size * 0.5}" cy="${size * 0.5}" rx="${size * 0.35}" ry="${size * 0.1}" fill="none" stroke="#ffffff" stroke-width="${size * 0.015}"/>
  <ellipse cx="${size * 0.5}" cy="${size * 0.6}" rx="${size * 0.35}" ry="${size * 0.1}" fill="none" stroke="#ffffff" stroke-width="${size * 0.015}"/>
  <ellipse cx="${size * 0.35}" cy="${size * 0.5}" rx="${size * 0.1}" ry="${size * 0.35}" fill="none" stroke="#ffffff" stroke-width="${size * 0.015}"/>
  <ellipse cx="${size * 0.5}" cy="${size * 0.5}" rx="${size * 0.1}" ry="${size * 0.35}" fill="none" stroke="#ffffff" stroke-width="${size * 0.015}"/>
  <ellipse cx="${size * 0.65}" cy="${size * 0.5}" rx="${size * 0.1}" ry="${size * 0.35}" fill="none" stroke="#ffffff" stroke-width="${size * 0.015}"/>
  <circle cx="${size * 0.65}" cy="${size * 0.45}" r="${size * 0.05}" fill="#ff6b6b"/>
  <path d="M ${size * 0.65} ${size * 0.5} L ${size * 0.6} ${size * 0.6} L ${size * 0.7} ${size * 0.6} Z" fill="#ff6b6b"/>
  <text x="${size * 0.5}" y="${size * 0.8}" font-family="Arial" font-size="${size * 0.15}" fill="#ffffff" text-anchor="middle" font-weight="bold">🌍</text>
</svg>`;
};

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// For now, create SVG files (browsers can use them)
// For PNG, user needs to use the HTML generator or convert SVG to PNG
console.log('Creating SVG icons (browsers can use these directly)...');

// Create SVG icons
fs.writeFileSync(path.join(publicDir, 'icon-192.svg'), createIconSVG(192));
fs.writeFileSync(path.join(publicDir, 'icon-512.svg'), createIconSVG(512));
fs.writeFileSync(path.join(publicDir, 'icon-32.svg'), createIconSVG(32));

console.log('✅ Created SVG icons');
console.log('⚠️  For PNG icons, open public/generate-icons.html in a browser');
console.log('   Or update manifest.json to use .svg files');

