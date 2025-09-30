// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

// Ensure public directory exists
const publicDir = path.join(__dirname, '..', 'public');

if (!fs.existsSync(publicDir)) {
  console.log('Creating public directory for Storybook...');
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create a placeholder file if the directory is empty
const placeholderFile = path.join(publicDir, '.gitkeep');
if (!fs.existsSync(placeholderFile)) {
  fs.writeFileSync(placeholderFile, '');
}

console.log('✅ Public directory is ready for Storybook build');
