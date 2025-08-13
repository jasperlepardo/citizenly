#!/usr/bin/env node

/**
 * Cleanup Duplicate JSDoc Comments Script
 * Removes duplicate JSDoc comments that were added by mistake
 */

const fs = require('fs');
const { execSync } = require('child_process');

/**
 * Remove duplicate JSDoc comments from a file
 */
function removeDuplicateJSDoc(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Pattern to match duplicate JSDoc blocks
    const duplicatePattern = /\/\*\*[\s\S]*?\*\/\s*\/\*\*[\s\S]*?\*\/\s*export/g;
    
    let updatedContent = content;
    let removedCount = 0;

    // Remove patterns where we have two JSDoc blocks before an export
    updatedContent = updatedContent.replace(duplicatePattern, (match) => {
      // Keep only the second (more detailed) JSDoc block
      const parts = match.split('export');
      const jsdocBlocks = parts[0].match(/\/\*\*[\s\S]*?\*\//g);
      
      if (jsdocBlocks && jsdocBlocks.length > 1) {
        removedCount++;
        // Keep the last (most detailed) JSDoc block
        return jsdocBlocks[jsdocBlocks.length - 1] + '\nexport';
      }
      
      return match;
    });

    if (removedCount > 0) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`   ✅ Removed ${removedCount} duplicate JSDoc comments from ${filePath}`);
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
  console.log('🧹 Cleaning Up Duplicate JSDoc Comments');
  console.log('🎯 Removing duplicate documentation blocks...\n');

  const startTime = Date.now();
  let totalRemoved = 0;

  try {
    // Find all TypeScript files with potential duplicates
    const allFiles = execSync('find src -name "*.ts" -o -name "*.tsx"', { encoding: 'utf8' })
      .split('\n')
      .filter(f => f.length > 0);

    console.log(`📁 Processing ${allFiles.length} TypeScript files...`);
    
    allFiles.forEach(file => {
      const removed = removeDuplicateJSDoc(file);
      totalRemoved += removed;
    });

  } catch (error) {
    console.error(`❌ Error during processing: ${error.message}`);
    process.exit(1);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n🎉 Cleanup Complete!`);
  console.log(`   🧹 Removed ${totalRemoved} duplicate JSDoc comments`);
  console.log(`   ⏱️  Completed in ${duration} seconds`);
}

if (require.main === module) {
  main();
}

module.exports = { removeDuplicateJSDoc };