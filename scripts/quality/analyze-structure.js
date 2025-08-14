#!/usr/bin/env node

/**
 * Folder Structure Compliance Analyzer
 * Checks folder organization against coding standards
 */

const fs = require('fs');
const path = require('path');

/**
 * Naming convention patterns
 */
const NAMING_PATTERNS = {
  kebabCase: /^[a-z0-9]+(-[a-z0-9]+)*$/,
  camelCase: /^[a-z][a-zA-Z0-9]*$/,
  PascalCase: /^[A-Z][a-zA-Z0-9]*$/,
  snake_case: /^[a-z0-9]+(_[a-z0-9]+)*$/,
  lowercase: /^[a-z0-9]+$/,
  dotfile: /^\.[a-z0-9-]+$/
};

/**
 * Expected folder structure rules
 */
const FOLDER_RULES = {
  // Root level - kebab-case or lowercase, some exceptions
  root: {
    required: ['src', 'docs', 'public'],
    allowed: [
      'src', 'docs', 'public', 'database', 'scripts', 'coverage', 'reports',
      '.github', '.next', 'node_modules', 'storybook-static', '.storybook',
      '.git', '.vscode', '.gitignore', '.env.example', '.husky', '.githooks',
      '.claude'
    ],
    naming: ['kebabCase', 'lowercase', 'dotfile'],
    exceptions: ['node_modules', 'storybook-static', '.next', '.storybook', '.husky', '.githooks', '.claude']
  },
  
  // src/ directory structure
  src: {
    required: ['app', 'components', 'lib'],
    recommended: ['contexts', 'hooks', 'providers', 'types'],
    naming: ['kebabCase', 'lowercase'],
    exceptions: []
  },
  
  // Components structure - atomic design
  components: {
    required: ['atoms', 'molecules', 'organisms', 'templates'],
    recommended: ['tokens', 'utils'],
    naming: ['kebabCase', 'lowercase'],
    exceptions: []
  },
  
  // Individual component folders - PascalCase
  componentDir: {
    naming: ['PascalCase'],
    requiredFiles: ['index.ts'],
    recommendedFiles: ['.stories.tsx', '.test.tsx']
  }
};

/**
 * Issues found during analysis
 */
const ISSUE_TYPES = {
  WRONG_NAMING: 'wrong_naming',
  MISSING_REQUIRED: 'missing_required',
  UNEXPECTED_LOCATION: 'unexpected_location',
  ROOT_CLUTTER: 'root_clutter',
  DEEP_NESTING: 'deep_nesting',
  INCONSISTENT_STRUCTURE: 'inconsistent_structure'
};

/**
 * Check if name matches any of the allowed patterns
 */
function checkNaming(name, allowedPatterns) {
  return allowedPatterns.some(pattern => NAMING_PATTERNS[pattern].test(name));
}

/**
 * Analyze folder structure recursively
 */
function analyzeFolderStructure(basePath = '.', currentPath = '', depth = 0) {
  const issues = [];
  const structure = {};
  
  const fullPath = path.join(basePath, currentPath);
  
  if (!fs.existsSync(fullPath)) {
    return { issues, structure };
  }
  
  try {
    const items = fs.readdirSync(fullPath);
    
    for (const item of items) {
      const itemPath = path.join(fullPath, item);
      const relativePath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // Analyze directory naming and structure
        const directoryIssues = analyzeDirectory(item, relativePath, depth);
        issues.push(...directoryIssues);
        
        // Recursively analyze subdirectories (limit depth to avoid infinite recursion)
        if (depth < 6 && !shouldSkipDirectory(item)) {
          const subAnalysis = analyzeFolderStructure(basePath, relativePath, depth + 1);
          issues.push(...subAnalysis.issues);
          structure[item] = subAnalysis.structure;
        } else {
          structure[item] = { skipped: true, reason: depth >= 6 ? 'max_depth' : 'excluded' };
        }
      } else {
        // Analyze file naming
        const fileIssues = analyzeFileName(item, relativePath, depth);
        issues.push(...fileIssues);
      }
    }
  } catch (error) {
    issues.push({
      type: ISSUE_TYPES.UNEXPECTED_LOCATION,
      path: currentPath,
      message: `Cannot read directory: ${error.message}`,
      severity: 'error'
    });
  }
  
  return { issues, structure };
}

/**
 * Analyze directory naming and placement
 */
function analyzeDirectory(dirName, relativePath, depth) {
  const issues = [];
  const pathParts = relativePath.split(path.sep);
  
  // Root level directory analysis
  if (depth === 0) {
    return analyzeRootDirectory(dirName, relativePath);
  }
  
  // src/ subdirectory analysis
  if (pathParts.length === 2 && pathParts[0] === 'src') {
    return analyzeSrcSubdirectory(dirName, relativePath);
  }
  
  // Components directory analysis
  if (pathParts.includes('components')) {
    return analyzeComponentDirectory(dirName, relativePath, pathParts);
  }
  
  // General directory naming check
  if (!checkNaming(dirName, ['kebabCase', 'lowercase', 'PascalCase'])) {
    issues.push({
      type: ISSUE_TYPES.WRONG_NAMING,
      path: relativePath,
      message: `Directory "${dirName}" should use kebab-case, lowercase, or PascalCase`,
      severity: 'warning',
      suggestion: convertToKebabCase(dirName)
    });
  }
  
  return issues;
}

/**
 * Analyze root level directories
 */
function analyzeRootDirectory(dirName, relativePath) {
  const issues = [];
  
  // Check if it's an allowed root directory
  if (!FOLDER_RULES.root.allowed.includes(dirName)) {
    issues.push({
      type: ISSUE_TYPES.ROOT_CLUTTER,
      path: relativePath,
      message: `Unexpected root directory "${dirName}" - consider moving to appropriate subdirectory`,
      severity: 'warning',
      suggestion: 'Move to scripts/, docs/, or appropriate subdirectory'
    });
  }
  
  // Check naming convention for non-exception directories
  if (!FOLDER_RULES.root.exceptions.includes(dirName)) {
    if (!checkNaming(dirName, FOLDER_RULES.root.naming)) {
      issues.push({
        type: ISSUE_TYPES.WRONG_NAMING,
        path: relativePath,
        message: `Root directory "${dirName}" should use kebab-case or lowercase`,
        severity: 'error',
        suggestion: convertToKebabCase(dirName)
      });
    }
  }
  
  return issues;
}

/**
 * Analyze src/ subdirectories
 */
function analyzeSrcSubdirectory(dirName, relativePath) {
  const issues = [];
  
  // Check naming convention
  if (!checkNaming(dirName, FOLDER_RULES.src.naming)) {
    issues.push({
      type: ISSUE_TYPES.WRONG_NAMING,
      path: relativePath,
      message: `src/ subdirectory "${dirName}" should use kebab-case or lowercase`,
      severity: 'warning',
      suggestion: convertToKebabCase(dirName)
    });
  }
  
  return issues;
}

/**
 * Analyze component directories
 */
function analyzeComponentDirectory(dirName, relativePath, pathParts) {
  const issues = [];
  
  // Find components index in path
  const componentsIndex = pathParts.indexOf('components');
  const levelInComponents = pathParts.length - componentsIndex - 1;
  
  // Level 1: atoms, molecules, organisms, templates
  if (levelInComponents === 1) {
    const expectedDirs = ['atoms', 'molecules', 'organisms', 'templates'];
    if (!expectedDirs.includes(dirName) && !['tokens', 'utils', 'examples', 'providers'].includes(dirName)) {
      issues.push({
        type: ISSUE_TYPES.INCONSISTENT_STRUCTURE,
        path: relativePath,
        message: `Unexpected directory "${dirName}" in components/ - should follow atomic design`,
        severity: 'warning',
        suggestion: 'Use atoms/, molecules/, organisms/, or templates/'
      });
    }
  }
  
  // Level 2: Individual component directories - should be PascalCase
  if (levelInComponents === 2) {
    if (!checkNaming(dirName, ['PascalCase'])) {
      issues.push({
        type: ISSUE_TYPES.WRONG_NAMING,
        path: relativePath,
        message: `Component directory "${dirName}" should use PascalCase`,
        severity: 'error',
        suggestion: convertToPascalCase(dirName)
      });
    }
  }
  
  return issues;
}

/**
 * Analyze file naming
 */
function analyzeFileName(fileName, relativePath, depth) {
  const issues = [];
  
  // Skip analysis for certain file types
  if (shouldSkipFile(fileName)) {
    return issues;
  }
  
  const pathParts = relativePath.split(path.sep);
  const ext = path.extname(fileName);
  const baseName = path.basename(fileName, ext);
  
  // Next.js special files - these have required naming conventions
  const nextJSFiles = [
    'page.tsx', 'page.jsx', 'page.ts', 'page.js',
    'layout.tsx', 'layout.jsx', 'layout.ts', 'layout.js',
    'loading.tsx', 'loading.jsx', 'loading.ts', 'loading.js',
    'error.tsx', 'error.jsx', 'error.ts', 'error.js',
    'not-found.tsx', 'not-found.jsx', 'not-found.ts', 'not-found.js',
    'global-error.tsx', 'global-error.jsx', 'global-error.ts', 'global-error.js',
    'template.tsx', 'template.jsx', 'template.ts', 'template.js',
    'default.tsx', 'default.jsx', 'default.ts', 'default.js',
    'route.ts', 'route.js', 'middleware.ts', 'middleware.js'
  ];
  
  // Skip Next.js special files - they must use specific naming
  if (nextJSFiles.includes(fileName)) {
    return issues;
  }
  
  // Skip test utility files and setup files
  const testUtilFiles = [
    'test-utils.tsx', 'setup.tsx', 'setup.ts', 'jest.setup.js',
    'vitest.setup.ts', 'test.setup.ts'
  ];
  
  if (testUtilFiles.includes(fileName)) {
    return issues;
  }
  
  // Skip index files - they're re-export files and follow different conventions
  if (baseName === 'index') {
    return issues;
  }
  
  // Skip Storybook files
  if (fileName.includes('.stories.') || pathParts.includes('.storybook')) {
    return issues;
  }
  
  // React component files should be PascalCase (excluding special files)
  if (['.tsx', '.jsx'].includes(ext) && 
      !fileName.includes('.stories') && 
      !fileName.includes('.test') &&
      !fileName.includes('-utils') &&
      pathParts.includes('components')) {
    
    if (!checkNaming(baseName, ['PascalCase'])) {
      issues.push({
        type: ISSUE_TYPES.WRONG_NAMING,
        path: relativePath,
        message: `React component file "${fileName}" should use PascalCase`,
        severity: 'error',
        suggestion: `${convertToPascalCase(baseName)}${ext}`
      });
    }
  }
  
  // TypeScript utility files should be kebab-case or camelCase
  if (['.ts'].includes(ext) && 
      !pathParts.includes('components') && 
      !fileName.includes('.test') &&
      !fileName.includes('.config') &&
      !fileName.includes('setup')) {
    
    if (!checkNaming(baseName, ['kebabCase', 'camelCase', 'snake_case'])) {
      issues.push({
        type: ISSUE_TYPES.WRONG_NAMING,
        path: relativePath,
        message: `TypeScript file "${fileName}" should use kebab-case or camelCase`,
        severity: 'warning',
        suggestion: `${convertToKebabCase(baseName)}${ext}`
      });
    }
  }
  
  return issues;
}

/**
 * Check if directory should be skipped
 */
function shouldSkipDirectory(dirName) {
  const skipDirs = [
    'node_modules', '.git', '.next', 'coverage', 'storybook-static',
    '__pycache__', '.vscode', '.idea', 'dist', 'build'
  ];
  return skipDirs.includes(dirName);
}

/**
 * Check if file should be skipped
 */
function shouldSkipFile(fileName) {
  const skipFiles = [
    '.gitignore', '.env', '.env.local', '.env.example',
    'package.json', 'package-lock.json', 'tsconfig.json',
    'next.config.js', 'tailwind.config.js', 'postcss.config.js'
  ];
  const skipExtensions = ['.md', '.json', '.sql', '.sh', '.lock'];
  
  return skipFiles.includes(fileName) || 
         skipExtensions.some(ext => fileName.endsWith(ext)) ||
         fileName.startsWith('.');
}

/**
 * Convert string to kebab-case
 */
function convertToKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert string to PascalCase
 */
function convertToPascalCase(str) {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
    .replace(/^(.)/, char => char.toUpperCase());
}

/**
 * Generate folder structure compliance report
 */
function generateFolderStructureReport() {
  console.log('📁 Folder Structure Compliance Analysis');
  console.log('🎯 Checking organization against coding standards...\n');
  
  const startTime = Date.now();
  const analysis = analyzeFolderStructure('.');
  
  // Categorize issues by severity
  const issues = {
    error: analysis.issues.filter(i => i.severity === 'error'),
    warning: analysis.issues.filter(i => i.severity === 'warning'),
    info: analysis.issues.filter(i => i.severity === 'info')
  };
  
  // Generate recommendations
  const recommendations = generateRecommendations(issues);
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalIssues: analysis.issues.length,
      errors: issues.error.length,
      warnings: issues.warning.length,
      info: issues.info.length
    },
    issues,
    recommendations,
    structure: analysis.structure
  };
  
  fs.writeFileSync('folder-structure-report.json', JSON.stringify(report, null, 2));
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  
  // Console output
  console.log('📁 Folder Structure Analysis Results:');
  console.log(`   📊 Total Issues: ${report.summary.totalIssues}`);
  console.log(`   ❌ Errors: ${report.summary.errors}`);
  console.log(`   ⚠️  Warnings: ${report.summary.warnings}`);
  console.log(`   💡 Info: ${report.summary.info}`);
  console.log(`   ⏱️  Completed in ${duration} seconds\n`);
  
  // Show top issues
  if (issues.error.length > 0) {
    console.log('❌ Critical Naming/Structure Issues:');
    issues.error.slice(0, 5).forEach(issue => {
      console.log(`   📁 ${issue.path}: ${issue.message}`);
      if (issue.suggestion) {
        console.log(`      💡 Suggestion: ${issue.suggestion}`);
      }
    });
    console.log('');
  }
  
  if (issues.warning.length > 0) {
    console.log('⚠️  Folder Organization Warnings:');
    issues.warning.slice(0, 5).forEach(issue => {
      console.log(`   📁 ${issue.path}: ${issue.message}`);
      if (issue.suggestion) {
        console.log(`      💡 Suggestion: ${issue.suggestion}`);
      }
    });
    if (issues.warning.length > 5) {
      console.log(`   ... and ${issues.warning.length - 5} more warnings`);
    }
    console.log('');
  }
  
  // Show recommendations
  if (recommendations.length > 0) {
    console.log('🎯 Organization Recommendations:');
    recommendations.slice(0, 5).forEach(rec => console.log(`   - ${rec}`));
    if (recommendations.length > 5) {
      console.log(`   ... and ${recommendations.length - 5} more recommendations`);
    }
    console.log('');
  }
  
  console.log('📋 Detailed report saved to: folder-structure-report.json');
  
  return report;
}

/**
 * Generate organizational recommendations
 */
function generateRecommendations(issues) {
  const recommendations = [];
  
  if (issues.error.length > 0) {
    recommendations.push('Fix critical naming convention violations immediately');
  }
  
  const rootClutter = issues.warning.filter(i => i.type === ISSUE_TYPES.ROOT_CLUTTER);
  if (rootClutter.length > 0) {
    recommendations.push('Clean up root directory - move files to appropriate subdirectories');
  }
  
  const namingIssues = [...issues.error, ...issues.warning].filter(i => i.type === ISSUE_TYPES.WRONG_NAMING);
  if (namingIssues.length > 0) {
    recommendations.push('Standardize directory and file naming conventions');
  }
  
  const componentIssues = issues.warning.filter(i => i.type === ISSUE_TYPES.INCONSISTENT_STRUCTURE);
  if (componentIssues.length > 0) {
    recommendations.push('Reorganize components to follow atomic design principles');
  }
  
  // General recommendations
  recommendations.push('Create folder organization documentation for team reference');
  recommendations.push('Set up automated folder structure validation in pre-commit hooks');
  recommendations.push('Consider using ESLint rules for import path consistency');
  
  return recommendations;
}

if (require.main === module) {
  generateFolderStructureReport();
}

module.exports = {
  analyzeFolderStructure,
  generateFolderStructureReport,
  checkNaming,
  NAMING_PATTERNS
};