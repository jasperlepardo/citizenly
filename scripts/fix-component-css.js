#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentsDir = path.join(__dirname, '../src/styles/components');
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.css'));

files.forEach(file => {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find the pattern "/* Tokens moved to globals.css */" followed by tokens until @layer
  const regex = /\/\* Tokens moved to globals\.css \*\/[\s\S]*?(?=@layer|$)/g;
  
  // Replace with just the comment
  const newContent = content.replace(regex, '/* Tokens moved to globals.css */\n\n');
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Fixed ${file}`);
  }
});

console.log('Done fixing component CSS files');