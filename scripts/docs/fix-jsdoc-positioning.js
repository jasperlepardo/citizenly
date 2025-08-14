#!/usr/bin/env node

/**
 * Fix JSDoc Positioning Script
 * Moves JSDoc comments to be within 5 lines of their target functions
 */

const fs = require('fs');
const { execSync } = require('child_process');

/**
 * Fix JSDoc positioning in a file
 */
function fixJSDocPositioning(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let modified = false;
    let fixedCount = 0;

    // Find JSDoc blocks that are too far from their functions
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for function declarations
      const functionPatterns = [
        /^export\s+(?:default\s+)?(?:async\s+)?function\s+(\w+)/,
        /^export\s+const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/,
        /^(?:export\s+(?:default\s+)?)?function\s+([A-Z]\w+).*\{/
      ];

      let foundFunction = null;
      for (const pattern of functionPatterns) {
        const match = line.trim().match(pattern);
        if (match) {
          foundFunction = { name: match[1], line: i };
          break;
        }
      }

      if (foundFunction) {
        // Look backwards for JSDoc comment
        let jsdocBlock = null;
        let jsdocStart = -1;
        let jsdocEnd = -1;

        for (let j = i - 1; j >= Math.max(0, i - 15); j--) {
          const checkLine = lines[j].trim();
          
          if (checkLine.includes('*/') && !jsdocBlock) {
            jsdocEnd = j;
          }
          
          if (checkLine.includes('/**') && jsdocEnd !== -1) {
            jsdocStart = j;
            jsdocBlock = lines.slice(jsdocStart, jsdocEnd + 1);
            break;
          }
        }

        // If JSDoc found but too far (more than 5 lines), move it closer
        if (jsdocBlock && jsdocStart !== -1 && (i - jsdocEnd) > 5) {
          // Remove the old JSDoc block
          lines.splice(jsdocStart, jsdocEnd - jsdocStart + 1);
          
          // Adjust the function line index since we removed lines
          const adjustedFunctionLine = i - (jsdocEnd - jsdocStart + 1);
          
          // Insert JSDoc right before the function
          lines.splice(adjustedFunctionLine, 0, ...jsdocBlock);
          
          modified = true;
          fixedCount++;
          console.log(`   ✅ Moved JSDoc for '${foundFunction.name}' closer to function`);
        }
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, lines.join('\n'));
      console.log(`   📝 Fixed ${fixedCount} JSDoc positioning issues in ${filePath}`);
      return fixedCount;
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
  console.log('📍 Fixing JSDoc Positioning');
  console.log('🎯 Moving JSDoc comments closer to their functions...\n');

  const startTime = Date.now();
  let totalFixed = 0;

  try {
    // Focus on problematic files first
    const problemFiles = [
      'src/app/api/addresses/barangays/public/route.ts',
      'src/app/api/addresses/barangays/route.ts',
      'src/app/api/addresses/cities/public/route.ts',
      'src/app/api/addresses/cities/route.ts',
      'src/app/api/addresses/provinces/public/route.ts',
      'src/app/admin/create-user/page.tsx',
      'src/app/admin/users/page.tsx'
    ];

    console.log('📁 Phase 1: Fixing problematic files...');
    problemFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const fixed = fixJSDocPositioning(file);
        totalFixed += fixed;
      }
    });

    // Then check all other TypeScript files
    console.log('\n📁 Phase 2: Checking other TypeScript files...');
    const allFiles = execSync('find src -name "*.ts" -o -name "*.tsx"', { encoding: 'utf8' })
      .split('\n')
      .filter(f => f.length > 0 && !problemFiles.includes(f))
      .slice(0, 50); // Limit to avoid too many files

    allFiles.forEach(file => {
      const fixed = fixJSDocPositioning(file);
      totalFixed += fixed;
    });

  } catch (error) {
    console.error(`❌ Error during processing: ${error.message}`);
    process.exit(1);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n🎉 JSDoc Positioning Fix Complete!`);
  console.log(`   📍 Fixed ${totalFixed} positioning issues`);
  console.log(`   ⏱️  Completed in ${duration} seconds`);

  if (totalFixed > 0) {
    console.log('\n💡 Next steps:');
    console.log('   1. Run npm run quality:docs to check updated coverage');
    console.log('   2. Verify documentation is now properly detected');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixJSDocPositioning };