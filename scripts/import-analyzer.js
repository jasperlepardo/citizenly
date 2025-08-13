#!/usr/bin/env node

/**
 * Import/Export Analyzer
 * Enforces clean import patterns and identifies circular dependencies
 */

const fs = require('fs');
const path = require('path');

/**
 * Extract import and export statements from a file
 */
function extractImportsExports(code, filePath) {
  const lines = code.split('\n');
  const imports = [];
  const exports = [];
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const lineNumber = index + 1;
    
    // Extract imports
    const importPatterns = [
      /^import\s+(.+?)\s+from\s+['"](.+?)['"];?$/,
      /^import\s+['"](.+?)['"];?$/,
      /^import\s*\(\s*['"](.+?)['"]\s*\)/
    ];
    
    importPatterns.forEach(pattern => {
      const match = trimmed.match(pattern);
      if (match) {
        const isDefault = match[1] && !match[1].includes('{');
        const isNamespace = match[1] && match[1].includes('*');
        const isNamed = match[1] && match[1].includes('{');
        const isDynamic = pattern.source.includes('import\\s*\\(');
        
        imports.push({
          line: lineNumber,
          raw: trimmed,
          module: match[2] || match[1],
          imported: match[1] || null,
          type: isDynamic ? 'dynamic' : 
                isDefault ? 'default' :
                isNamespace ? 'namespace' :
                isNamed ? 'named' : 'side-effect'
        });
      }
    });
    
    // Extract exports
    const exportPatterns = [
      /^export\s+default\s+(.+);?$/,
      /^export\s+\{([^}]+)\}(?:\s+from\s+['"](.+?)['"])?;?$/,
      /^export\s+\*\s+from\s+['"](.+?)['"];?$/,
      /^export\s+(const|let|var|function|class|interface|type|enum)\s+(\w+)/
    ];
    
    exportPatterns.forEach(pattern => {
      const match = trimmed.match(pattern);
      if (match) {
        exports.push({
          line: lineNumber,
          raw: trimmed,
          exported: match[1] || match[2] || '*',
          type: trimmed.includes('default') ? 'default' :
                trimmed.includes('*') ? 'namespace' : 'named',
          reExportFrom: pattern.source.includes('from') ? match[3] || match[2] : null
        });
      }
    });
  });
  
  return { imports, exports };
}

/**
 * Categorize imports by type
 */
function categorizeImports(imports) {
  return imports.map(imp => {
    let category = 'unknown';
    
    if (imp.module.startsWith('.')) {
      category = 'relative';
    } else if (imp.module.startsWith('@/')) {
      category = 'absolute-alias';
    } else if (imp.module.includes('/')) {
      category = 'external';
    } else {
      category = 'external';
    }
    
    return { ...imp, category };
  });
}

/**
 * Check import order according to standards
 */
function checkImportOrder(imports) {
  const expectedOrder = [
    'external',      // react, next, third-party
    'absolute-alias', // @/components, @/lib
    'relative'       // ./Button, ../utils
  ];
  
  const issues = [];
  let lastCategory = '';
  let lastCategoryIndex = -1;
  
  imports.forEach((imp, index) => {
    const currentCategoryIndex = expectedOrder.indexOf(imp.category);
    
    if (currentCategoryIndex < lastCategoryIndex) {
      issues.push({
        type: 'import_order',
        line: imp.line,
        message: `Import should come before ${lastCategory} imports`,
        suggestion: `Move ${imp.category} imports before ${lastCategory} imports`
      });
    }
    
    lastCategory = imp.category;
    lastCategoryIndex = Math.max(lastCategoryIndex, currentCategoryIndex);
  });
  
  return issues;
}

/**
 * Check for barrel export violations
 */
function checkBarrelExports(filePath, exports) {
  const issues = [];
  const fileName = path.basename(filePath);
  
  // Index files should primarily re-export
  if (fileName === 'index.ts' || fileName === 'index.tsx') {
    const nonReExports = exports.filter(exp => !exp.reExportFrom);
    if (nonReExports.length > 1) {
      issues.push({
        type: 'barrel_violation',
        line: 1,
        message: `Index file should primarily re-export from other modules`,
        suggestion: 'Move implementations to separate files and re-export from index'
      });
    }
  }
  
  return issues;
}

/**
 * Detect potential circular dependencies
 */
function detectCircularDependencies(analyses) {
  const graph = new Map();
  const issues = [];
  
  // Build dependency graph
  analyses.forEach(analysis => {
    const relativePath = path.relative('./src', analysis.filePath);
    const dependencies = analysis.imports
      .filter(imp => imp.module.startsWith('@/') || imp.module.startsWith('.'))
      .map(imp => {
        if (imp.module.startsWith('@/')) {
          return imp.module.replace('@/', '');
        } else {
          return path.resolve(path.dirname(analysis.filePath), imp.module);
        }
      });
    
    graph.set(relativePath, dependencies);
  });
  
  // Simple circular dependency detection (DFS)
  function hasCycle(node, visited = new Set(), recursionStack = new Set()) {
    if (recursionStack.has(node)) {
      return true; // Found cycle
    }
    
    if (visited.has(node)) {
      return false;
    }
    
    visited.add(node);
    recursionStack.add(node);
    
    const dependencies = graph.get(node) || [];
    for (const dep of dependencies) {
      if (hasCycle(dep, visited, recursionStack)) {
        return true;
      }
    }
    
    recursionStack.delete(node);
    return false;
  }
  
  // Check each file for cycles
  for (const [filePath] of graph) {
    if (hasCycle(filePath)) {
      issues.push({
        type: 'circular_dependency',
        filePath,
        message: 'Potential circular dependency detected',
        suggestion: 'Review import structure and consider dependency injection or restructuring'
      });
    }
  }
  
  return issues;
}

/**
 * Check for unused imports
 */
function checkUnusedImports(code, imports) {
  const issues = [];
  
  imports.forEach(imp => {
    if (imp.type === 'side-effect' || imp.type === 'dynamic') {
      return; // Skip side-effects and dynamic imports
    }
    
    const imported = imp.imported;
    if (!imported) return;
    
    // Extract imported names
    let importedNames = [];
    if (imp.type === 'default') {
      importedNames = [imported.trim()];
    } else if (imp.type === 'named') {
      const namedImports = imported.replace(/[{}]/g, '').split(',');
      importedNames = namedImports.map(name => {
        const parts = name.trim().split(' as ');
        return parts[parts.length - 1].trim();
      });
    } else if (imp.type === 'namespace') {
      const match = imported.match(/\*\s+as\s+(\w+)/);
      if (match) importedNames = [match[1]];
    }
    
    // Check if any imported name is used in the code (excluding the import line)
    const codeWithoutImports = code.split('\n')
      .filter((_, index) => index + 1 !== imp.line)
      .join('\n');
    
    importedNames.forEach(name => {
      const usagePattern = new RegExp(`\\b${name}\\b`);
      if (!usagePattern.test(codeWithoutImports)) {
        issues.push({
          type: 'unused_import',
          line: imp.line,
          importName: name,
          message: `Imported '${name}' is not used`,
          suggestion: `Remove unused import '${name}'`
        });
      }
    });
  });
  
  return issues;
}

/**
 * Analyze a single file
 */
function analyzeFile(filePath) {
  try {
    const code = fs.readFileSync(filePath, 'utf8');
    const { imports, exports } = extractImportsExports(code, filePath);
    const categorizedImports = categorizeImports(imports);
    
    const issues = [
      ...checkImportOrder(categorizedImports),
      ...checkBarrelExports(filePath, exports),
      ...checkUnusedImports(code, imports)
    ];
    
    return {
      filePath,
      imports: categorizedImports,
      exports,
      issues
    };
  } catch (error) {
    return {
      filePath,
      error: error.message,
      imports: [],
      exports: [],
      issues: []
    };
  }
}

/**
 * Scan directory for import/export issues
 */
function scanDirectory(dirPath) {
  const analyses = [];
  
  function scanRecursive(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    items.forEach(item => {
      if (item.includes('node_modules') || item.includes('.git') || 
          item.includes('dist') || item.includes('build') ||
          item.includes('.next') || item.includes('coverage')) {
        return;
      }
      
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanRecursive(fullPath);
      } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(item)) {
        const analysis = analyzeFile(fullPath);
        analyses.push(analysis);
      }
    });
  }
  
  scanRecursive(dirPath);
  return analyses;
}

/**
 * Main execution
 */
function main() {
  console.log('📦 Analyzing imports and exports...');
  
  const analyses = scanDirectory('./src');
  const circularDeps = detectCircularDependencies(analyses);
  
  const totalIssues = analyses.reduce((sum, a) => sum + a.issues.length, 0) + circularDeps.length;
  const importOrderIssues = analyses.reduce((sum, a) => sum + a.issues.filter(i => i.type === 'import_order').length, 0);
  const unusedImports = analyses.reduce((sum, a) => sum + a.issues.filter(i => i.type === 'unused_import').length, 0);
  
  console.log(`\n📊 Import/Export Analysis Summary:`);
  console.log(`   Files analyzed: ${analyses.length}`);
  console.log(`   Total issues: ${totalIssues}`);
  console.log(`   Import order issues: ${importOrderIssues}`);
  console.log(`   Unused imports: ${unusedImports}`);
  console.log(`   Circular dependencies: ${circularDeps.length}\n`);
  
  // Show critical issues
  if (circularDeps.length > 0) {
    console.log('🔄 Circular Dependencies:');
    circularDeps.forEach(issue => {
      console.log(`   ❌ ${issue.filePath}: ${issue.message}`);
    });
    console.log();
  }
  
  // Show some import order issues
  const importIssues = analyses.filter(a => a.issues.some(i => i.type === 'import_order')).slice(0, 5);
  if (importIssues.length > 0) {
    console.log('📋 Import Order Issues (showing first 5):');
    importIssues.forEach(analysis => {
      const orderIssues = analysis.issues.filter(i => i.type === 'import_order');
      console.log(`   📁 ${analysis.filePath}:`);
      orderIssues.slice(0, 2).forEach(issue => {
        console.log(`      Line ${issue.line}: ${issue.message}`);
      });
    });
    console.log();
  }
  
  // Save detailed report
  const report = {
    summary: {
      totalFiles: analyses.length,
      totalIssues,
      importOrderIssues,
      unusedImports,
      circularDependencies: circularDeps.length
    },
    circularDependencies: circularDeps,
    fileAnalyses: analyses
  };
  
  fs.writeFileSync('./import-export-report.json', JSON.stringify(report, null, 2));
  console.log('📄 Detailed report saved to import-export-report.json');
  
  // Fail if there are critical issues
  if (circularDeps.length > 0) {
    console.log('❌ Critical import/export issues found');
    process.exit(1);
  } else {
    console.log('✅ Import/export structure is clean');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  analyzeFile,
  scanDirectory,
  detectCircularDependencies
};