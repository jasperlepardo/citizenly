#!/usr/bin/env node

/**
 * Enforce Complexity Limits Script
 * Sets up development guardrails to prevent complexity from getting worse
 */

const fs = require('fs');

/**
 * Add complexity checking to pre-commit hook
 */
function enhancePreCommitHook() {
  const hookPath = '.githooks/pre-commit';
  
  if (!fs.existsSync(hookPath)) {
    console.warn('⚠️  Pre-commit hook not found - run npm run hooks:install first');
    return false;
  }

  const hookContent = fs.readFileSync(hookPath, 'utf8');
  
  // Check if complexity check is already added
  if (hookContent.includes('npm run quality:complexity')) {
    console.log('✅ Complexity checking already enabled in pre-commit hook');
    return true;
  }

  // Add complexity check before the final success message
  const complexityCheck = `
# 13. Check code complexity limits
echo "🧮 Checking code complexity limits..."
if ! npm run quality:complexity > /dev/null 2>&1; then
    print_error "Code complexity exceeds limits"
    echo "💡 Run 'npm run quality:complexity' to see detailed complexity report"
    echo "💡 Consider refactoring complex functions before committing"
    echo "⚠️  This is a warning, not blocking the commit"
fi

`;

  // Insert before the final success message
  const finalMessageIndex = hookContent.indexOf('# 12. Final success message');
  if (finalMessageIndex === -1) {
    console.warn('⚠️  Could not find insertion point in pre-commit hook');
    return false;
  }

  const updatedContent = hookContent.slice(0, finalMessageIndex) + 
                        complexityCheck + 
                        hookContent.slice(finalMessageIndex).replace('# 12.', '# 14.');

  fs.writeFileSync(hookPath, updatedContent);
  console.log('✅ Added complexity checking to pre-commit hook');
  return true;
}

/**
 * Create complexity monitoring configuration
 */
function createComplexityConfig() {
  const config = {
    "complexity": {
      "maxCyclomaticComplexity": 10,
      "maxCognitiveComplexity": 15,
      "maxLinesPerFunction": 50,
      "maxLinesPerFile": 300,
      "warningThresholds": {
        "cyclomaticComplexity": 8,
        "cognitiveComplexity": 12,
        "linesPerFunction": 40,
        "linesPerFile": 250
      }
    },
    "refactoringPriority": {
      "urgent": {
        "cyclomaticComplexity": "> 30",
        "cognitiveComplexity": "> 50", 
        "linesPerFile": "> 500"
      },
      "high": {
        "cyclomaticComplexity": "> 20",
        "cognitiveComplexity": "> 30",
        "linesPerFile": "> 400"
      },
      "medium": {
        "cyclomaticComplexity": "> 15",
        "cognitiveComplexity": "> 20",
        "linesPerFile": "> 300"
      }
    }
  };

  fs.writeFileSync('complexity-config.json', JSON.stringify(config, null, 2));
  console.log('✅ Created complexity configuration file');
}

/**
 * Update package.json with complexity scripts
 */
function updatePackageScripts() {
  try {
    const packagePath = 'package.json';
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Add complexity-related scripts if they don't exist
    const complexityScripts = {
      "complexity:check": "node scripts/complexity-checker.js",
      "complexity:fix": "node scripts/fix-high-complexity.js", 
      "complexity:enforce": "node scripts/enforce-complexity-limits.js",
      "complexity:report": "node scripts/complexity-checker.js > complexity-report.txt"
    };

    let scriptsAdded = 0;
    for (const [script, command] of Object.entries(complexityScripts)) {
      if (!packageJson.scripts[script]) {
        packageJson.scripts[script] = command;
        scriptsAdded++;
      }
    }

    if (scriptsAdded > 0) {
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
      console.log(`✅ Added ${scriptsAdded} complexity scripts to package.json`);
    } else {
      console.log('✅ Complexity scripts already exist in package.json');
    }

    return true;
  } catch (error) {
    console.error(`❌ Error updating package.json: ${error.message}`);
    return false;
  }
}

/**
 * Create complexity refactoring guide
 */
function createRefactoringGuide() {
  const guide = `# Code Complexity Refactoring Guide

## Current Critical Issues (Priority Order)

### 🚨 URGENT (Immediate Action Required)
1. **CascadingGeographicSelector** (588 lines, Cognitive: 159)
   - Split into 4-5 smaller components
   - Extract state management to custom hook
   - Separate validation logic
   
2. **DropdownSelect** (614 lines, Cognitive: 43)
   - Extract keyboard navigation logic
   - Separate accessibility features
   - Create reusable dropdown hook

### 🔥 HIGH PRIORITY 
3. **DataTable** (408 lines, Cognitive: 62)
   - Extract sorting/filtering logic
   - Create separate column renderer components
   - Use composition pattern for features

4. **CreateHouseholdModal** (566 lines, Cognitive: 54)
   - Split form into step components
   - Extract validation to separate module
   - Create form state management hook

5. **AddressSelector** (322 lines, Cognitive: 51)
   - Extract address search logic
   - Separate display from business logic
   - Create address validation utilities

## Refactoring Strategies

### Component Splitting
\`\`\`typescript
// Before: Large component with multiple responsibilities
function LargeComponent() {
  // 500+ lines of mixed concerns
}

// After: Focused components with single responsibilities
function MainComponent() {
  return (
    <ComponentHeader />
    <ComponentBody />
    <ComponentFooter />
  );
}
\`\`\`

### Custom Hooks for Logic
\`\`\`typescript
// Extract complex state management
function useGeographicSelection() {
  // Geographic selection logic
  return { regions, provinces, cities, barangays, handlers };
}

// Extract validation logic
function useAddressValidation() {
  // Address validation logic
  return { validate, errors, isValid };
}
\`\`\`

### Utility Functions
\`\`\`typescript
// Extract conditional logic to utility functions
function validatePhilSysNumber(number: string): ValidationResult {
  // Complex validation logic extracted
}

function formatGeographicHierarchy(data: GeographicData): FormattedData {
  // Complex formatting logic extracted
}
\`\`\`

## Implementation Timeline

### Week 1: Critical Components
- [ ] Refactor CascadingGeographicSelector
- [ ] Refactor DropdownSelect

### Week 2: High Priority Components  
- [ ] Refactor DataTable
- [ ] Refactor CreateHouseholdModal

### Week 3: Medium Priority & Prevention
- [ ] Refactor AddressSelector
- [ ] Implement complexity pre-commit checks
- [ ] Create component size guidelines

## Prevention Measures

1. **Pre-commit Hooks**: Block commits with excessive complexity
2. **Component Guidelines**: Max 300 lines, max complexity 15
3. **Code Reviews**: Check complexity in PR reviews
4. **Regular Audits**: Weekly complexity reports

## Success Metrics

- Target: <10 high-severity complexity issues
- Current: 104 high-severity issues
- Goal: Reduce by 80% in 3 weeks
`;

  fs.writeFileSync('COMPLEXITY_REFACTORING_GUIDE.md', guide);
  console.log('✅ Created comprehensive refactoring guide');
}

/**
 * Main execution function
 */
function main() {
  console.log('⚡ Setting Up Complexity Enforcement');
  console.log('🎯 Implementing development guardrails...\n');

  const startTime = Date.now();
  let tasksCompleted = 0;

  try {
    console.log('📋 Task 1: Enhancing pre-commit hook...');
    if (enhancePreCommitHook()) tasksCompleted++;

    console.log('\n📋 Task 2: Creating complexity configuration...');
    createComplexityConfig();
    tasksCompleted++;

    console.log('\n📋 Task 3: Updating package.json scripts...');
    if (updatePackageScripts()) tasksCompleted++;

    console.log('\n📋 Task 4: Creating refactoring guide...');
    createRefactoringGuide();
    tasksCompleted++;

  } catch (error) {
    console.error(`❌ Error during setup: ${error.message}`);
    process.exit(1);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n🎉 Complexity Enforcement Setup Complete!`);
  console.log(`   ⚡ Completed ${tasksCompleted}/4 tasks`);
  console.log(`   ⏱️  Completed in ${duration} seconds`);

  console.log('\n📋 What was implemented:');
  console.log('   ✅ Pre-commit complexity checking');
  console.log('   ✅ Complexity configuration limits');
  console.log('   ✅ Package.json scripts for complexity management');
  console.log('   ✅ Comprehensive refactoring guide (COMPLEXITY_REFACTORING_GUIDE.md)');

  console.log('\n💡 Immediate Next Steps:');
  console.log('   1. Review COMPLEXITY_REFACTORING_GUIDE.md');
  console.log('   2. Start with CascadingGeographicSelector refactoring');
  console.log('   3. Use npm run complexity:check to monitor progress');
  console.log('   4. Enforce limits in code reviews');
}

if (require.main === module) {
  main();
}

module.exports = { 
  enhancePreCommitHook, 
  createComplexityConfig, 
  updatePackageScripts,
  createRefactoringGuide 
};