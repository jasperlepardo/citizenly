#!/usr/bin/env node

/**
 * Icon Generation Script for PWA
 * 
 * This script helps generate all required PWA icons from the SVG source.
 * 
 * To use this script:
 * 1. Install sharp: npm install sharp
 * 2. Run: node scripts/generate-icons.js
 * 
 * Alternative: Use online tools like:
 * - https://realfavicongenerator.net/
 * - https://maskable.app/editor
 * - https://www.pwabuilder.com/imageGenerator
 */

const fs = require('fs');
const path = require('path');

console.log('PWA Icon Generation Helper');
console.log('==========================');
console.log('');

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const svgPath = path.join(__dirname, '../public/icons/app-icon.svg');
const iconsDir = path.join(__dirname, '../public/icons');

console.log('Required icon sizes for PWA:');
iconSizes.forEach(size => {
  console.log(`- ${size}x${size}px -> icon-${size}x${size}.png`);
});

console.log('');
console.log('Manual conversion steps:');
console.log('1. Open public/icons/app-icon.svg in a browser');
console.log('2. Take screenshot or use browser dev tools to save as PNG');
console.log('3. Use online tools like realfavicongenerator.net');
console.log('4. Or use command line tools like ImageMagick:');
console.log('');

iconSizes.forEach(size => {
  console.log(`   convert public/icons/app-icon.svg -resize ${size}x${size} public/icons/icon-${size}x${size}.png`);
});

console.log('');
console.log('SVG source file: public/icons/app-icon.svg');
console.log('Target directory: public/icons/');

// Check if Sharp is available for automated conversion
try {
  const sharp = require('sharp');
  console.log('');
  console.log('Sharp is available! Generating icons automatically...');
  
  // Convert SVG to Buffer first
  const svgBuffer = fs.readFileSync(svgPath);
  
  // Generate all icon sizes
  Promise.all(
    iconSizes.map(async (size) => {
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`✓ Generated: icon-${size}x${size}.png`);
    })
  ).then(() => {
    console.log('');
    console.log('✅ All icons generated successfully!');
  }).catch(err => {
    console.error('❌ Error generating icons:', err.message);
  });
  
} catch (e) {
  console.log('');
  console.log('📝 To auto-generate icons, install Sharp:');
  console.log('   npm install sharp');
  console.log('   node scripts/generate-icons.js');
}