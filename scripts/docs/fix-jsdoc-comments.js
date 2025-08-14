#!/usr/bin/env node

/**
 * Fix JSDoc Comments Script
 * Replaces poorly generated JSDoc comments with proper ones
 */

const fs = require('fs');
const { execSync } = require('child_process');

/**
 * Fix JSDoc comments in a file
 */
function fixJSDocInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    let fixed = 0;

    // Fix GET API handlers
    updatedContent = updatedContent.replace(
      /\/\*\*\s*\*\s*GET\s*\*\s*\*\s*@description\s+G\s+E\s+T\s*\*\s*@returns\s+\{unknown\}\s+Function\s+result\s*\*\//g,
      `/**
 * GET API Handler
 * 
 * @description Retrieves data from this endpoint
 * @param {NextRequest} request - The incoming request object
 * @returns {Promise<NextResponse>} The API response
 */`
    );

    // Fix POST API handlers
    updatedContent = updatedContent.replace(
      /\/\*\*\s*\*\s*POST\s*\*\s*\*\s*@description\s+P\s+O\s+S\s+T\s*\*\s*@returns\s+\{unknown\}\s+Function\s+result\s*\*\//g,
      `/**
 * POST API Handler
 * 
 * @description Creates new data in this endpoint
 * @param {NextRequest} request - The incoming request object
 * @returns {Promise<NextResponse>} The API response
 */`
    );

    // Fix PUT API handlers
    updatedContent = updatedContent.replace(
      /\/\*\*\s*\*\s*PUT\s*\*\s*\*\s*@description\s+P\s+U\s+T\s*\*\s*@returns\s+\{unknown\}\s+Function\s+result\s*\*\//g,
      `/**
 * PUT API Handler
 * 
 * @description Updates existing data in this endpoint
 * @param {NextRequest} request - The incoming request object
 * @returns {Promise<NextResponse>} The API response
 */`
    );

    // Fix DELETE API handlers
    updatedContent = updatedContent.replace(
      /\/\*\*\s*\*\s*DELETE\s*\*\s*\*\s*@description\s+D\s+E\s+L\s+E\s+T\s+E\s*\*\s*@returns\s+\{unknown\}\s+Function\s+result\s*\*\//g,
      `/**
 * DELETE API Handler
 * 
 * @description Removes data from this endpoint
 * @param {NextRequest} request - The incoming request object
 * @returns {Promise<NextResponse>} The API response
 */`
    );

    // Count fixes
    if (updatedContent !== content) {
      fixed = (content.match(/G\s+E\s+T|P\s+O\s+S\s+T|P\s+U\s+T|D\s+E\s+L\s+E\s+T\s+E/) || []).length;
      fs.writeFileSync(filePath, updatedContent);
      console.log(`   ✅ Fixed ${fixed} JSDoc comments in ${filePath}`);
      return fixed;
    }

    return 0;
  } catch (error) {
    console.warn(`   ⚠️  Could not process ${filePath}: ${error.message}`);
    return 0;
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔧 Fixing JSDoc Comments');
  console.log('🎯 Replacing poorly generated comments with proper ones...\n');

  const startTime = Date.now();
  let totalFixed = 0;

  try {
    // Find all API route files
    const apiFiles = execSync('find src/app/api -name "route.ts"', { encoding: 'utf8' })
      .split('\n')
      .filter(f => f.length > 0);

    console.log(`📁 Processing ${apiFiles.length} API route files...`);
    
    apiFiles.forEach(file => {
      const fixed = fixJSDocInFile(file);
      totalFixed += fixed;
    });

    // Also process component files with poor JSDoc
    const componentFiles = execSync('find src/components -name "*.tsx"', { encoding: 'utf8' })
      .split('\n')
      .filter(f => f.length > 0)
      .slice(0, 30); // Limit to avoid too many files

    console.log(`\n📁 Processing ${componentFiles.length} component files...`);
    
    componentFiles.forEach(file => {
      const fixed = fixJSDocInFile(file);
      totalFixed += fixed;
    });

  } catch (error) {
    console.error(`❌ Error during processing: ${error.message}`);
    process.exit(1);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n🎉 JSDoc Fix Complete!`);
  console.log(`   🔧 Fixed ${totalFixed} JSDoc comments`);
  console.log(`   ⏱️  Completed in ${duration} seconds`);

  if (totalFixed > 0) {
    console.log('\n💡 Next steps:');
    console.log('   1. Run npm run quality:docs to check updated coverage');
    console.log('   2. Review the fixed documentation');
    console.log('   3. Commit the improvements');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixJSDocInFile };