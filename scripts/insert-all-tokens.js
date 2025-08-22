#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the component tokens file
const tokensFile = path.join(__dirname, '../component-tokens.txt');
let tokens = fs.readFileSync(tokensFile, 'utf8');

// Clean up the tokens - remove the "Tokens from X.css" comments and extra indentation
tokens = tokens
  .split('\n')
  .filter(line => !line.includes('/* Tokens from'))
  .map(line => line.replace(/^  /, ''))
  .join('\n');

// Add missing orange color scale (referenced by auth-debug)
const orangeColors = `
  /* Orange colors */
  --color-orange-50: #fff7ed;
  --color-orange-100: #ffedd5;
  --color-orange-200: #fed7aa;
  --color-orange-300: #fdba74;
  --color-orange-400: #fb923c;
  --color-orange-500: #f97316;
  --color-orange-600: #ea580c;
  --color-orange-700: #c2410c;
  --color-orange-800: #9a3412;
  --color-orange-900: #7c2d12;
  --color-orange-950: #431407;
`;

// Read globals.css
const globalsPath = path.join(__dirname, '../src/app/globals.css');
let globals = fs.readFileSync(globalsPath, 'utf8');

// Find the position right before the closing } of @theme
const themeEndMatch = globals.match(/  --btn-ghost-focus-ring: var\(--border-focus\);\n}/);
if (!themeEndMatch) {
  console.error('Could not find the end of @theme block');
  process.exit(1);
}

const insertPos = globals.indexOf(themeEndMatch[0]) + themeEndMatch[0].length - 1;

// Insert orange colors and all component tokens
const newGlobals = 
  globals.slice(0, insertPos) + 
  orangeColors + '\n' +
  '\n  /* ====================================================================== */\n' +
  '  /* ALL COMPONENT TOKENS - Extracted from component CSS files            */\n' +
  '  /* ====================================================================== */\n' +
  tokens +
  globals.slice(insertPos);

// Write back to globals.css
fs.writeFileSync(globalsPath, newGlobals);
console.log('All component tokens added to globals.css');