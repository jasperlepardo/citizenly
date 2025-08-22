#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the component tokens file
const tokensFile = path.join(__dirname, '../component-tokens.txt');
const tokens = fs.readFileSync(tokensFile, 'utf8');

// Read globals.css
const globalsPath = path.join(__dirname, '../src/app/globals.css');
let globals = fs.readFileSync(globalsPath, 'utf8');

// Find the @theme block's closing brace
const themeEndIndex = globals.indexOf('  --button-spinner-xl: var(--spacing-24);  /* 24px */\n}');

if (themeEndIndex === -1) {
  console.error('Could not find the end of @theme block');
  process.exit(1);
}

// Insert all tokens before the closing brace
const insertPos = themeEndIndex + '  --button-spinner-xl: var(--spacing-24);  /* 24px */'.length;
const newGlobals = 
  globals.slice(0, insertPos) + 
  '\n\n  /* ====================================================================== */\n' +
  '  /* COMPONENT-SPECIFIC TOKENS - Extracted from component CSS files       */\n' +
  '  /* ====================================================================== */\n' +
  tokens.replace(/\n\n/g, '\n') +
  globals.slice(insertPos);

// Write back to globals.css
fs.writeFileSync(globalsPath, newGlobals);
console.log('Component tokens added to globals.css');