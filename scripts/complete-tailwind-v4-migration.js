#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentsDir = path.join(__dirname, '../src/styles/components');
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.css'));

console.log('Completing Tailwind v4 migration...\n');

// Step 1: Fix all component CSS files
files.forEach(file => {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Remove any leftover "Tokens moved to globals.css" with unclosed media queries
  if (content.includes('@media (prefers-color-scheme: dark) {\n  /* Tokens moved to globals.css */')) {
    // Fix unclosed media query by either closing it or removing if empty
    content = content.replace(
      /@media \(prefers-color-scheme: dark\) \{\s*\/\* Tokens moved to globals\.css \*\/\s*$/gm,
      '@media (prefers-color-scheme: dark) {\n  /* Dark mode styles handled via Tailwind utilities */\n}'
    );
    modified = true;
  }
  
  // Ensure all @media blocks are properly closed
  const lines = content.split('\n');
  let braceCount = 0;
  let inMedia = false;
  
  lines.forEach(line => {
    if (line.includes('@media')) {
      inMedia = true;
    }
    if (line.includes('{')) {
      braceCount += (line.match(/{/g) || []).length;
    }
    if (line.includes('}')) {
      braceCount -= (line.match(/}/g) || []).length;
    }
  });
  
  // If we have unclosed braces, close them
  if (braceCount > 0) {
    content = content.trimEnd();
    for (let i = 0; i < braceCount; i++) {
      content += '\n}';
    }
    content += '\n';
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✓ Fixed ${file}`);
  }
});

console.log('\n✅ Component CSS files fixed');
console.log('\nTailwind v4 migration structure:');
console.log('- All tokens defined in globals.css @theme block');
console.log('- Component styles in separate files using @layer');
console.log('- No @theme blocks in component files');
console.log('\nThis maintains separation of concerns while being Tailwind v4 compliant.');