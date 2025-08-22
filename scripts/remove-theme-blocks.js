#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentsDir = path.join(__dirname, '../src/styles/components');
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.css'));

let allTokens = [];

files.forEach(file => {
  const filePath = path.join(componentsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Find @theme blocks
  const themeRegex = /@theme\s*{([^}]*)}/gs;
  const matches = content.matchAll(themeRegex);
  
  for (const match of matches) {
    const tokens = match[1].trim();
    if (tokens) {
      allTokens.push(`  /* Tokens from ${file} */`);
      allTokens.push(tokens);
    }
  }
  
  // Remove @theme blocks from file
  const newContent = content.replace(themeRegex, '/* Tokens moved to globals.css */');
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Processed ${file}`);
  }
});

// Output all tokens for manual addition to globals.css
if (allTokens.length > 0) {
  const tokensFile = path.join(__dirname, '../component-tokens.txt');
  fs.writeFileSync(tokensFile, allTokens.join('\n\n'));
  console.log(`\nAll tokens saved to component-tokens.txt`);
  console.log('Add these to the @theme block in globals.css');
}