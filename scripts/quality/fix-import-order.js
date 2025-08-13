#!/usr/bin/env node

/**
 * Fix Import Order Script
 * Organizes imports according to the coding standards: builtin, external, internal, parent, sibling, index
 */

const fs = require('fs');
const { execSync } = require('child_process');

/**
 * Categorize import based on its path
 */
function categorizeImport(importPath) {
  // Built-in Node.js modules
  const builtins = ['fs', 'path', 'url', 'crypto', 'http', 'https', 'stream', 'util', 'os'];
  if (builtins.includes(importPath)) {
    return { category: 'builtin', order: 1 };
  }

  // External packages (not starting with . or /)
  if (!importPath.startsWith('.') && !importPath.startsWith('/') && !importPath.startsWith('@/')) {
    return { category: 'external', order: 2 };
  }

  // Internal absolute paths (@/...)
  if (importPath.startsWith('@/')) {
    return { category: 'internal', order: 3 };
  }

  // Parent imports (../)
  if (importPath.startsWith('../')) {
    return { category: 'parent', order: 4 };
  }

  // Index imports (./index or .)
  if (importPath === '.' || importPath === './index' || importPath.endsWith('/index')) {
    return { category: 'index', order: 6 };
  }

  // Sibling imports (./)
  if (importPath.startsWith('./')) {
    return { category: 'sibling', order: 5 };
  }

  // Default to external
  return { category: 'external', order: 2 };
}

/**
 * Fix import order in a file
 */
function fixImportOrder(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    const imports = [];
    const nonImportLines = [];
    let inImportSection = true;
    let hasChanges = false;

    // Parse file and extract imports
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check if this is an import line
      if (trimmed.startsWith('import ') && !trimmed.includes('import type')) {
        if (inImportSection) {
          // Extract import path
          const pathMatch = trimmed.match(/from\s+['"]([^'"]+)['"]/);
          if (pathMatch) {
            const importPath = pathMatch[1];
            const category = categorizeImport(importPath);
            
            imports.push({
              line,
              path: importPath,
              category: category.category,
              order: category.order,
              originalIndex: i
            });
          } else {
            imports.push({
              line,
              path: '',
              category: 'external',
              order: 2,
              originalIndex: i
            });
          }
        } else {
          nonImportLines.push(line);
        }
      } else if (trimmed === '' && inImportSection) {
        // Empty line in import section - continue
        continue;
      } else {
        // Non-import line - end of import section
        inImportSection = false;
        nonImportLines.push(line);
      }
    }

    // Sort imports by category and then alphabetically
    const sortedImports = imports.sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a.path.localeCompare(b.path);
    });

    // Check if order changed
    for (let i = 0; i < imports.length; i++) {
      if (imports[i].originalIndex !== sortedImports[i].originalIndex) {
        hasChanges = true;
        break;
      }
    }

    if (hasChanges) {
      // Rebuild file with sorted imports
      const newLines = [];
      
      // Add sorted imports with proper grouping
      let currentCategory = '';
      sortedImports.forEach((imp, index) => {
        // Add blank line between different categories
        if (imp.category !== currentCategory && index > 0) {
          newLines.push('');
        }
        newLines.push(imp.line);
        currentCategory = imp.category;
      });

      // Add blank line after imports if there are non-import lines
      if (sortedImports.length > 0 && nonImportLines.length > 0) {
        newLines.push('');
      }

      // Add the rest of the file
      newLines.push(...nonImportLines);

      fs.writeFileSync(filePath, newLines.join('\n'));
      console.log(`   ✅ Fixed import order in ${filePath}`);
      return 1;
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
  console.log('📋 Fixing Import Order');
  console.log('🎯 Organizing imports according to coding standards...\n');

  const startTime = Date.now();
  let totalFixed = 0;

  try {
    // Get files with import order issues
    const problemFiles = [
      'src/app/api/households/route.ts',
      'src/app/api/residents/route.ts',
      'src/app/layout.tsx',
      'src/app/signup/page.tsx',
      'src/components/atoms/IconButton/IconButton.tsx'
    ];

    console.log(`📁 Phase 1: Fixing known problematic files...`);
    problemFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const fixed = fixImportOrder(file);
        totalFixed += fixed;
      }
    });

    // Also check other TypeScript files
    console.log('\n📁 Phase 2: Checking other TypeScript files...');
    const allFiles = execSync('find src -name "*.ts" -o -name "*.tsx"', { encoding: 'utf8' })
      .split('\n')
      .filter(f => f.length > 0 && !problemFiles.includes(f))
      .slice(0, 30); // Limit to avoid too many files

    allFiles.forEach(file => {
      const fixed = fixImportOrder(file);
      totalFixed += fixed;
    });

  } catch (error) {
    console.error(`❌ Error during processing: ${error.message}`);
    process.exit(1);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n🎉 Import Order Fix Complete!`);
  console.log(`   📋 Fixed ${totalFixed} files`);
  console.log(`   ⏱️  Completed in ${duration} seconds`);

  if (totalFixed > 0) {
    console.log('\n💡 Next steps:');
    console.log('   1. Run npm run quality:imports to verify improvements');
    console.log('   2. Test that application still works correctly');
    console.log('   3. Proceed with circular dependency checks');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixImportOrder, categorizeImport };