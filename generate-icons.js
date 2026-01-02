// Script to generate PWA icons from the 512x512 source
// Run with: node generate-icons.js

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const sourceIcon = path.join(__dirname, 'public', 'icons', 'icon-512x512.png');
const outputDir = path.join(__dirname, 'public', 'icons');

async function generateIcons() {
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    
    if (size === 512) {
      console.log(`Skipping ${size}x${size} (source file)`);
      continue;
    }
    
    try {
      await sharp(sourceIcon)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`Generated: icon-${size}x${size}.png`);
    } catch (err) {
      console.error(`Error generating ${size}x${size}:`, err.message);
    }
  }
  console.log('Done!');
}

generateIcons();
