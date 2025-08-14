#!/usr/bin/env node

/**
 * Fix High Complexity Script
 * Addresses the most critical complexity issues by suggesting refactoring strategies
 */

const fs = require('fs');
const { execSync } = require('child_process');

/**
 * Analyze and suggest fixes for high complexity components
 */
function analyzeHighComplexityFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    console.log(`\n🔍 Analyzing: ${filePath}`);
    console.log('=' .repeat(60));
    
    // Count lines
    const totalLines = lines.length;
    const nonEmptyLines = lines.filter(line => line.trim().length > 0).length;
    
    // Detect complexity indicators
    const ifStatements = content.match(/\bif\s*\(/g)?.length || 0;
    const switches = content.match(/\bswitch\s*\(/g)?.length || 0;
    const loops = content.match(/\b(for|while)\s*\(/g)?.length || 0;
    const ternaries = content.match(/\?.*:/g)?.length || 0;
    const tryBlocks = content.match(/\btry\s*\{/g)?.length || 0;
    const nestedCallbacks = content.match(/\}\s*\)\s*=>/g)?.length || 0;
    
    console.log(`📊 Complexity Indicators:`);
    console.log(`   Lines: ${totalLines} (${nonEmptyLines} non-empty)`);
    console.log(`   If statements: ${ifStatements}`);
    console.log(`   Switch statements: ${switches}`);
    console.log(`   Loops: ${loops}`);
    console.log(`   Ternary operators: ${ternaries}`);
    console.log(`   Try blocks: ${tryBlocks}`);
    console.log(`   Nested callbacks: ${nestedCallbacks}`);
    
    // Suggest refactoring strategies
    console.log(`\n💡 Refactoring Strategies:`);
    
    if (totalLines > 300) {
      console.log(`   🔧 Component is too large (${totalLines} lines) - split into smaller components`);
    }
    
    if (ifStatements > 10) {
      console.log(`   🔧 Too many conditional branches (${ifStatements}) - extract validation/logic functions`);
    }
    
    if (loops > 5) {
      console.log(`   🔧 Multiple loops detected (${loops}) - consider using map/filter/reduce patterns`);
    }
    
    if (ternaries > 8) {
      console.log(`   🔧 Excessive ternary operators (${ternaries}) - extract to named functions`);
    }
    
    if (nestedCallbacks > 5) {
      console.log(`   🔧 High nesting level (${nestedCallbacks}) - flatten with early returns or separate functions`);
    }
    
    // Check for specific patterns that can be simplified
    if (content.includes('useState') && content.match(/useState/g).length > 8) {
      console.log(`   🔧 Too many state variables - consider useReducer or custom hooks`);
    }
    
    if (content.includes('useEffect') && content.match(/useEffect/g).length > 4) {
      console.log(`   🔧 Multiple useEffect hooks - combine related effects or extract custom hooks`);
    }
    
    return {
      totalLines,
      complexity: ifStatements + switches * 2 + loops * 2 + ternaries + tryBlocks,
      suggestions: []
    };
    
  } catch (error) {
    console.error(`❌ Error analyzing ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Main execution function
 */
function main() {
  console.log('🧮 High Complexity Analysis & Refactoring Guide');
  console.log('🎯 Identifying critical complexity issues for manual refactoring...\n');

  const startTime = Date.now();
  let filesAnalyzed = 0;

  // Focus on the most problematic files identified by complexity checker
  const highComplexityFiles = [
    'src/components/molecules/CascadingGeographicSelector/CascadingGeographicSelector.tsx',
    'src/components/organisms/DataTable/DataTable.tsx',
    'src/components/organisms/CreateHouseholdModal/CreateHouseholdModal.tsx',
    'src/components/organisms/AddressSelector/AddressSelector.tsx',
    'src/components/organisms/HouseholdSelector/HouseholdSelector.tsx',
    'src/app/signup/page.tsx',
    'src/components/molecules/DropdownSelect/DropdownSelect.tsx',
    'src/components/molecules/PhilSysNumberInput/PhilSysNumberInput.tsx'
  ];

  try {
    console.log(`📁 Analyzing ${highComplexityFiles.length} high-complexity files...`);
    
    highComplexityFiles.forEach(file => {
      if (fs.existsSync(file)) {
        analyzeHighComplexityFile(file);
        filesAnalyzed++;
      } else {
        console.log(`⚠️  File not found: ${file}`);
      }
    });

  } catch (error) {
    console.error(`❌ Error during analysis: ${error.message}`);
    process.exit(1);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n🎉 High Complexity Analysis Complete!`);
  console.log(`   📊 Analyzed ${filesAnalyzed} critical files`);
  console.log(`   ⏱️  Completed in ${duration} seconds`);

  console.log('\n📋 Priority Refactoring Recommendations:');
  console.log('   1. 🥇 CascadingGeographicSelector (Cognitive: 159) - URGENT');
  console.log('   2. 🥈 DataTable (Cognitive: 62) - HIGH');
  console.log('   3. 🥉 CreateHouseholdModal (Cognitive: 54) - HIGH');
  console.log('   4. 📋 AddressSelector (Cognitive: 51) - HIGH');
  console.log('   5. 📋 HouseholdSelector (Cognitive: 49) - MEDIUM');

  console.log('\n💡 Next Steps:');
  console.log('   1. Refactor the top 3 components manually using suggested strategies');
  console.log('   2. Extract reusable hooks and utility functions');
  console.log('   3. Split large components into smaller, focused components');
  console.log('   4. Re-run complexity analysis to measure improvements');
  console.log('   5. Set up pre-commit hooks to prevent future complexity increases');
}

if (require.main === module) {
  main();
}

module.exports = { analyzeHighComplexityFile };