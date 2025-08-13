#!/usr/bin/env node

/**
 * Fix Unused Imports Script
 * Removes unused imports to clean up the codebase
 */

const fs = require('fs');
const { execSync } = require('child_process');

/**
 * Remove unused imports from a file
 */
function removeUnusedImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let modified = false;
    let removedCount = 0;

    // Track imports and their usage
    const imports = new Map();
    const newLines = [];

    // First pass: identify all imports
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Match various import patterns
      const importPatterns = [
        /^import\s+(\w+)\s+from\s+['"]/,  // default import
        /^import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]/,  // named imports
        /^import\s+(\w+),\s*\{\s*([^}]+)\s*\}\s+from\s+['"]/,  // mixed imports
        /^import\s+\*\s+as\s+(\w+)\s+from\s+['"]/  // namespace import
      ];

      let foundImport = false;
      for (const pattern of importPatterns) {
        const match = trimmed.match(pattern);
        if (match) {
          foundImport = true;
          
          if (pattern.source.includes('\\{')) {
            // Named imports - extract individual names
            const namedImports = match[1] || match[2];
            if (namedImports) {
              const names = namedImports.split(',').map(n => n.trim());
              names.forEach(name => {
                const cleanName = name.replace(/\s+as\s+\w+/, '').trim();
                imports.set(cleanName, { line: i, used: false });
              });
            }
          } else {
            // Default or namespace import
            const importName = match[1];
            imports.set(importName, { line: i, used: false });
          }
          break;
        }
      }

      // Skip type-only imports and side-effect imports for now
      if (trimmed.includes('import type') || trimmed.match(/^import\s+['"]/)) {
        foundImport = false;
      }

      if (!foundImport) {
        newLines.push(line);
      }
    }

    // Second pass: check usage of imports in the rest of the file
    const fileContent = newLines.join('\n');
    
    for (const [importName, importInfo] of imports) {
      // Check if the import is used in the file content
      const usagePatterns = [
        new RegExp(`\\b${importName}\\b`, 'g'),  // Direct usage
        new RegExp(`<${importName}`, 'g'),       // JSX usage
        new RegExp(`${importName}\\.`, 'g'),     // Property access
        new RegExp(`${importName}\\(`, 'g')      // Function call
      ];

      for (const pattern of usagePatterns) {
        if (fileContent.match(pattern)) {
          importInfo.used = true;
          break;
        }
      }
    }

    // Third pass: rebuild file with only used imports
    const finalLines = [];
    const usedImportLines = new Set();

    // Mark which import lines to keep
    for (const [importName, importInfo] of imports) {
      if (importInfo.used) {
        usedImportLines.add(importInfo.line);
      } else {
        removedCount++;
      }
    }

    // Rebuild the file
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Check if this is an import line
      const isImportLine = trimmed.startsWith('import ') && !trimmed.includes('import type');
      
      if (isImportLine) {
        // Only include if it contains used imports
        if (usedImportLines.has(i)) {
          finalLines.push(line);
        } else {
          modified = true;
        }
      } else {
        finalLines.push(line);
      }
    }

    if (modified && removedCount > 0) {
      fs.writeFileSync(filePath, finalLines.join('\n'));
      console.log(`   ✅ Removed ${removedCount} unused imports from ${filePath}`);
      return removedCount;
    }

    return 0;
  } catch (error) {
    console.warn(`   ⚠️  Could not process ${filePath}: ${error.message}`);
    return 0;
  }
}

/**
 * Main execution function
 */
function main() {
  console.log('🧹 Fixing Unused Imports');
  console.log('🎯 Removing unused import statements...\n');

  const startTime = Date.now();
  let totalRemoved = 0;

  try {
    // Get TypeScript files
    const allFiles = execSync('find src -name "*.ts" -o -name "*.tsx"', { encoding: 'utf8' })
      .split('\n')
      .filter(f => f.length > 0)
; // Process all files for complete coverage

    console.log(`📁 Processing ${allFiles.length} TypeScript files...`);
    
    allFiles.forEach(file => {
      const removed = removeUnusedImports(file);
      totalRemoved += removed;
    });

  } catch (error) {
    console.error(`❌ Error during processing: ${error.message}`);
    process.exit(1);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n🎉 Unused Imports Cleanup Complete!`);
  console.log(`   🧹 Removed ${totalRemoved} unused imports`);
  console.log(`   ⏱️  Completed in ${duration} seconds`);

  if (totalRemoved > 0) {
    console.log('\n💡 Next steps:');
    console.log('   1. Run npm run quality:imports to check improvements');
    console.log('   2. Test that application still works correctly');
    console.log('   3. Proceed with import order fixes');
  }
}

if (require.main === module) {
  main();
}

module.exports = { removeUnusedImports };