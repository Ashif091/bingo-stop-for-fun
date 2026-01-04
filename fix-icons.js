// Script to convert icons to proper PNG format
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputDir = path.join(__dirname, 'public', 'icons');

async function fixIcons() {
  for (const size of sizes) {
    const file = path.join(inputDir, `icon-${size}x${size}.png`);
    const tempFile = file + '.tmp';
    
    try {
      // Read and convert to proper PNG
      await sharp(file)
        .png({ quality: 100 })
        .toFile(tempFile);
      
      // Replace original
      fs.unlinkSync(file);
      fs.renameSync(tempFile, file);
      
      console.log(`Fixed: icon-${size}x${size}.png`);
    } catch (err) {
      console.log(`Error ${size}x${size}: ${err.message}`);
    }
  }
  console.log('Done!');
}

fixIcons();
