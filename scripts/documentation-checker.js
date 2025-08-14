#!/usr/bin/env node

/**
 * Documentation Coverage Checker
 * Ensures all public APIs, components, and functions are properly documented
 */

const fs = require('fs');
const path = require('path');

/**
 * Extract JSDoc comments from code
 */
function extractJSDocComments(code) {
  const jsdocPattern = /\/\*\*([\s\S]*?)\*\//g;
  const comments = [];
  let match;
  
  while ((match = jsdocPattern.exec(code)) !== null) {
    // Calculate line number at the END of the JSDoc comment, not the start
    const endIndex = match.index + match[0].length;
    const lines = code.substring(0, endIndex).split('\n');
    const lineNumber = lines.length;
    
    comments.push({
      line: lineNumber,
      content: match[1],
      raw: match[0]
    });
  }
  
  return comments;
}

/**
 * Extract function signatures that should be documented
 */
function extractDocumentableItems(code, filePath) {
  const lines = code.split('\n');
  const items = [];
  
  // Patterns for items that should have documentation
  const patterns = [
    {
      type: 'export_function',
      pattern: /^export\s+(?:default\s+)?(?:async\s+)?function\s+(\w+)/,
      required: true
    },
    {
      type: 'export_const_function',
      pattern: /^export\s+const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/,
      required: true
    },
    {
      type: 'export_component',
      pattern: /^export\s+(?:default\s+)?function\s+(\w+).*\{/,
      required: true,
      isComponent: true
    },
    {
      type: 'export_interface',
      pattern: /^export\s+interface\s+(\w+)/,
      required: true
    },
    {
      type: 'export_type',
      pattern: /^export\s+type\s+(\w+)/,
      required: true
    },
    {
      type: 'export_class',
      pattern: /^export\s+(?:default\s+)?class\s+(\w+)/,
      required: true
    },
    {
      type: 'react_component',
      pattern: /^(?:export\s+(?:default\s+)?)?function\s+([A-Z]\w+).*\{/,
      required: true,
      isComponent: true
    },
    {
      type: 'public_function',
      pattern: /^(?:async\s+)?function\s+(\w+)/,
      required: false
    },
    {
      type: 'const_function',
      pattern: /^const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/,
      required: false
    }
  ];
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const lineNumber = index + 1;
    
    patterns.forEach(({ type, pattern, required, isComponent }) => {
      const match = trimmed.match(pattern);
      if (match) {
        const name = match[1];
        
        // Check if it's actually a React component
        const actuallyComponent = isComponent || (
          type.includes('function') && 
          /^[A-Z]/.test(name) && 
          (trimmed.includes('return') || code.includes(`return <`) || code.includes(`jsx`))
        );
        
        items.push({
          type: actuallyComponent ? 'react_component' : type,
          name,
          line: lineNumber,
          required,
          isPublic: trimmed.startsWith('export'),
          isComponent: actuallyComponent
        });
      }
    });
  });
  
  return items;
}

/**
 * Check if an item has proper documentation
 */
function checkDocumentation(item, comments, code) {
  const issues = [];
  
  // Find JSDoc comment immediately preceding the item
  const precedingComment = comments.find(comment => 
    comment.line >= item.line - 5 && comment.line <= item.line - 1
  );
  
  if (!precedingComment) {
    if (item.required || item.isPublic) {
      issues.push({
        type: 'missing_documentation',
        severity: item.isPublic ? 'high' : 'medium',
        line: item.line,
        item: item.name,
        message: `${item.type} '${item.name}' is missing JSDoc documentation`,
        suggestion: `Add JSDoc comment describing the purpose, parameters, and return value`
      });
    }
    return issues;
  }
  
  const docContent = precedingComment.content.toLowerCase();
  
  // Check for component-specific documentation
  if (item.isComponent) {
    if (!docContent.includes('@param') && !docContent.includes('props')) {
      issues.push({
        type: 'incomplete_component_docs',
        severity: 'medium',
        line: precedingComment.line,
        item: item.name,
        message: `Component '${item.name}' documentation should describe props`,
        suggestion: 'Add @param tags for each prop or describe the props object'
      });
    }
    
    if (!docContent.includes('component')) {
      issues.push({
        type: 'unclear_component_docs',
        severity: 'low',
        line: precedingComment.line,
        item: item.name,
        message: `Component '${item.name}' documentation should clearly indicate it's a component`,
        suggestion: 'Include "component" in the description'
      });
    }
  }
  
  // Check for function-specific documentation
  if (item.type.includes('function')) {
    const hasParams = /\([^)]+\)/.test(code.split('\n')[item.line - 1]);
    
    if (hasParams && !docContent.includes('@param')) {
      issues.push({
        type: 'missing_param_docs',
        severity: 'medium',
        line: precedingComment.line,
        item: item.name,
        message: `Function '${item.name}' has parameters but no @param documentation`,
        suggestion: 'Add @param tags for each parameter'
      });
    }
    
    if (!docContent.includes('@return') && !docContent.includes('@returns')) {
      const functionLine = code.split('\n')[item.line - 1];
      if (!functionLine.includes(': void') && !functionLine.includes('React.')) {
        issues.push({
          type: 'missing_return_docs',
          severity: 'low',
          line: precedingComment.line,
          item: item.name,
          message: `Function '${item.name}' should document its return value`,
          suggestion: 'Add @returns tag describing the return value'
        });
      }
    }
  }
  
  // Check for type/interface documentation
  if (item.type.includes('interface') || item.type.includes('type')) {
    if (docContent.length < 10) {
      issues.push({
        type: 'minimal_type_docs',
        severity: 'low',
        line: precedingComment.line,
        item: item.name,
        message: `Type '${item.name}' has minimal documentation`,
        suggestion: 'Provide more detailed description of the type\'s purpose and usage'
      });
    }
  }
  
  return issues;
}

/**
 * Check for README files in component directories
 */
function checkComponentREADMEs(filePath) {
  const issues = [];
  const dir = path.dirname(filePath);
  const fileName = path.basename(filePath);
  
  // Check if this is a component file in a component directory
  if (fileName.endsWith('.tsx') && /^[A-Z]/.test(fileName.replace('.tsx', ''))) {
    const readmePath = path.join(dir, 'README.md');
    const indexPath = path.join(dir, 'index.ts');
    
    if (!fs.existsSync(readmePath)) {
      issues.push({
        type: 'missing_component_readme',
        severity: 'low',
        line: 1,
        message: `Component directory missing README.md`,
        suggestion: 'Add README.md with component usage examples and props documentation'
      });
    }
    
    if (!fs.existsSync(indexPath)) {
      issues.push({
        type: 'missing_barrel_export',
        severity: 'low',
        line: 1,
        message: `Component directory missing index.ts barrel export`,
        suggestion: 'Add index.ts to provide clean import path'
      });
    }
  }
  
  return issues;
}

/**
 * Analyze a single file for documentation coverage
 */
function analyzeFile(filePath) {
  try {
    const code = fs.readFileSync(filePath, 'utf8');
    const comments = extractJSDocComments(code);
    const items = extractDocumentableItems(code, filePath);
    const componentIssues = checkComponentREADMEs(filePath);
    
    let issues = [...componentIssues];
    
    items.forEach(item => {
      const itemIssues = checkDocumentation(item, comments, code);
      issues.push(...itemIssues);
    });
    
    const coverage = items.length > 0 ? 
      ((items.length - issues.filter(i => i.type === 'missing_documentation').length) / items.length) * 100 : 100;
    
    return {
      filePath,
      items,
      comments: comments.length,
      issues,
      coverage: Math.round(coverage * 100) / 100
    };
  } catch (error) {
    return {
      filePath,
      error: error.message,
      items: [],
      comments: 0,
      issues: [],
      coverage: 0
    };
  }
}

/**
 * Scan directory for documentation issues
 */
function scanDirectory(dirPath) {
  const analyses = [];
  
  function scanRecursive(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    items.forEach(item => {
      if (item.includes('node_modules') || item.includes('.git') || 
          item.includes('dist') || item.includes('build') ||
          item.includes('.next') || item.includes('coverage') ||
          item.includes('storybook-static')) {
        return;
      }
      
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanRecursive(fullPath);
      } else if (stat.isFile() && /\.(ts|tsx)$/.test(item)) {
        const analysis = analyzeFile(fullPath);
        if (analysis.items.length > 0 || analysis.issues.length > 0) {
          analyses.push(analysis);
        }
      }
    });
  }
  
  scanRecursive(dirPath);
  return analyses;
}

/**
 * Generate documentation coverage report
 */
function generateDocumentationReport(analyses) {
  const validAnalyses = analyses.filter(a => !a.error);
  
  const totalItems = validAnalyses.reduce((sum, a) => sum + a.items.length, 0);
  const totalComments = validAnalyses.reduce((sum, a) => sum + a.comments, 0);
  const totalIssues = validAnalyses.reduce((sum, a) => sum + a.issues.length, 0);
  const missingDocs = validAnalyses.reduce((sum, a) => 
    sum + a.issues.filter(i => i.type === 'missing_documentation').length, 0);
  
  const overallCoverage = totalItems > 0 ? ((totalItems - missingDocs) / totalItems) * 100 : 100;
  
  const report = {
    summary: {
      totalFiles: validAnalyses.length,
      totalDocumentableItems: totalItems,
      totalComments: totalComments,
      totalIssues,
      missingDocumentation: missingDocs,
      overallCoverage: Math.round(overallCoverage * 100) / 100,
      issuesByType: {},
      worstCoverage: [],
      bestCoverage: []
    },
    details: validAnalyses
  };
  
  // Count issues by type
  validAnalyses.forEach(analysis => {
    analysis.issues.forEach(issue => {
      report.summary.issuesByType[issue.type] = 
        (report.summary.issuesByType[issue.type] || 0) + 1;
    });
  });
  
  // Find files with worst and best coverage
  const sortedByCoverage = validAnalyses
    .filter(a => a.items.length > 0)
    .sort((a, b) => a.coverage - b.coverage);
  
  report.summary.worstCoverage = sortedByCoverage
    .slice(0, 10)
    .map(a => ({ filePath: a.filePath, coverage: a.coverage, items: a.items.length }));
  
  report.summary.bestCoverage = sortedByCoverage
    .slice(-10)
    .reverse()
    .map(a => ({ filePath: a.filePath, coverage: a.coverage, items: a.items.length }));
  
  return report;
}

/**
 * Main execution
 */
function main() {
  console.log('📚 Analyzing documentation coverage...');
  
  const analyses = scanDirectory('./src');
  const report = generateDocumentationReport(analyses);
  
  console.log(`\n📊 Documentation Coverage Summary:`);
  console.log(`   Files analyzed: ${report.summary.totalFiles}`);
  console.log(`   Documentable items: ${report.summary.totalDocumentableItems}`);
  console.log(`   JSDoc comments: ${report.summary.totalComments}`);
  console.log(`   Overall coverage: ${report.summary.overallCoverage.toFixed(1)}%`);
  console.log(`   Missing documentation: ${report.summary.missingDocumentation}`);
  console.log(`   Total issues: ${report.summary.totalIssues}\n`);
  
  if (report.summary.worstCoverage.length > 0) {
    console.log('📉 Files with lowest documentation coverage:');
    report.summary.worstCoverage.slice(0, 5).forEach(file => {
      console.log(`   ${file.coverage.toFixed(1)}% - ${file.filePath} (${file.items} items)`);
    });
    console.log();
  }
  
  // Show high-priority missing documentation
  const highPriorityIssues = analyses
    .filter(a => a.issues.some(i => i.severity === 'high'))
    .slice(0, 5);
  
  if (highPriorityIssues.length > 0) {
    console.log('⚠️  High priority documentation issues:');
    highPriorityIssues.forEach(analysis => {
      const highIssues = analysis.issues.filter(i => i.severity === 'high');
      console.log(`   📁 ${analysis.filePath}:`);
      highIssues.slice(0, 3).forEach(issue => {
        console.log(`      Line ${issue.line}: ${issue.message}`);
      });
    });
    console.log();
  }
  
  // Save detailed report
  fs.writeFileSync('./documentation-report.json', JSON.stringify(report, null, 2));
  console.log('📄 Detailed report saved to documentation-report.json');
  
  // Set quality thresholds
  const MIN_COVERAGE = 70; // 70% documentation coverage required
  const MAX_HIGH_ISSUES = 10;
  
  const highIssues = report.summary.issuesByType.missing_documentation || 0;
  
  if (report.summary.overallCoverage < MIN_COVERAGE) {
    console.log(`❌ Documentation coverage ${report.summary.overallCoverage.toFixed(1)}% is below minimum ${MIN_COVERAGE}%`);
    process.exit(1);
  } else if (highIssues > MAX_HIGH_ISSUES) {
    console.log(`❌ Too many items missing documentation: ${highIssues} (max: ${MAX_HIGH_ISSUES})`);
    process.exit(1);
  } else {
    console.log('✅ Documentation coverage meets quality standards');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  analyzeFile,
  scanDirectory,
  generateDocumentationReport
};