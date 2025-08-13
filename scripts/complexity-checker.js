#!/usr/bin/env node

/**
 * Code Complexity Checker
 * Analyzes cognitive complexity and suggests refactoring opportunities
 */

const fs = require('fs');
const path = require('path');

/**
 * Calculate cyclomatic complexity for a function
 */
function calculateCyclomaticComplexity(code) {
  // Count decision points
  const decisionPatterns = [
    /\bif\s*\(/g,
    /\belse\s+if\s*\(/g,
    /\belse\b/g,
    /\bswitch\s*\(/g,
    /\bcase\s+/g,
    /\bfor\s*\(/g,
    /\bwhile\s*\(/g,
    /\bdo\s+/g,
    /\bcatch\s*\(/g,
    /\?\s*.*\s*:/g, // ternary operator
    /&&/g,
    /\|\|/g
  ];
  
  let complexity = 1; // Base complexity
  
  decisionPatterns.forEach(pattern => {
    const matches = code.match(pattern);
    if (matches) {
      complexity += matches.length;
    }
  });
  
  return complexity;
}

/**
 * Calculate cognitive complexity (more nuanced than cyclomatic)
 */
function calculateCognitiveComplexity(code) {
  let complexity = 0;
  let nestingLevel = 0;
  
  const lines = code.split('\n');
  const stack = [];
  
  lines.forEach(line => {
    const trimmed = line.trim();
    
    // Track nesting level
    if (trimmed.includes('{')) {
      if (trimmed.match(/\b(if|for|while|switch|try|catch|function)\b/)) {
        nestingLevel++;
        stack.push(trimmed);
      }
    }
    
    if (trimmed.includes('}')) {
      if (stack.length > 0) {
        nestingLevel = Math.max(0, nestingLevel - 1);
        stack.pop();
      }
    }
    
    // Add complexity based on constructs
    if (trimmed.match(/\bif\s*\(/)) {
      complexity += 1 + nestingLevel;
    }
    if (trimmed.match(/\belse\s+if\s*\(/)) {
      complexity += 1;
    }
    if (trimmed.match(/\bfor\s*\(|while\s*\(/)) {
      complexity += 1 + nestingLevel;
    }
    if (trimmed.match(/\bswitch\s*\(/)) {
      complexity += 1 + nestingLevel;
    }
    if (trimmed.match(/\bcatch\s*\(/)) {
      complexity += 1 + nestingLevel;
    }
    if (trimmed.match(/&&|\|\|/)) {
      complexity += 1;
    }
    if (trimmed.match(/\?\s*.*\s*:/)) {
      complexity += 1 + nestingLevel;
    }
    
    // Nested functions add complexity
    if (trimmed.match(/function\s+\w+|=>\s*{|=>\s*\(/)) {
      if (nestingLevel > 0) {
        complexity += nestingLevel;
      }
    }
  });
  
  return complexity;
}

/**
 * Extract functions from TypeScript/JavaScript code
 */
function extractFunctions(code, filePath) {
  const functions = [];
  const lines = code.split('\n');
  
  // Patterns to match function declarations
  const functionPatterns = [
    /^export\s+(?:default\s+)?function\s+(\w+)/,
    /^function\s+(\w+)/,
    /^const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/,
    /^const\s+(\w+)\s*=\s*(?:async\s+)?function/,
    /(\w+)\s*:\s*(?:async\s+)?\([^)]*\)\s*=>/,
    /^export\s+const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/
  ];
  
  let currentFunction = null;
  let braceCount = 0;
  let functionStartLine = 0;
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Check if this line starts a function
    functionPatterns.forEach(pattern => {
      const match = trimmed.match(pattern);
      if (match && !currentFunction) {
        currentFunction = {
          name: match[1],
          startLine: index + 1,
          endLine: 0,
          code: '',
          filePath
        };
        functionStartLine = index;
        braceCount = 0;
      }
    });
    
    if (currentFunction) {
      currentFunction.code += line + '\n';
      
      // Count braces to find function end
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      braceCount += openBraces - closeBraces;
      
      // Function ends when braces are balanced
      if (braceCount <= 0 && index > functionStartLine) {
        currentFunction.endLine = index + 1;
        currentFunction.lineCount = currentFunction.endLine - currentFunction.startLine + 1;
        currentFunction.cyclomaticComplexity = calculateCyclomaticComplexity(currentFunction.code);
        currentFunction.cognitiveComplexity = calculateCognitiveComplexity(currentFunction.code);
        
        functions.push(currentFunction);
        currentFunction = null;
      }
    }
  });
  
  return functions;
}

/**
 * Analyze file complexity
 */
function analyzeFile(filePath) {
  try {
    const code = fs.readFileSync(filePath, 'utf8');
    const functions = extractFunctions(code, filePath);
    
    const analysis = {
      filePath,
      lineCount: code.split('\n').length,
      functions,
      issues: []
    };
    
    // Check file size
    if (analysis.lineCount > 300) {
      analysis.issues.push({
        type: 'file_too_large',
        severity: 'medium',
        message: `File has ${analysis.lineCount} lines (max recommended: 300)`,
        suggestion: 'Consider breaking this file into smaller, focused modules'
      });
    }
    
    // Check function complexity
    functions.forEach(func => {
      if (func.lineCount > 30) {
        analysis.issues.push({
          type: 'function_too_large',
          severity: 'medium',
          function: func.name,
          line: func.startLine,
          message: `Function '${func.name}' has ${func.lineCount} lines (max recommended: 30)`,
          suggestion: 'Break this function into smaller, single-purpose functions'
        });
      }
      
      if (func.cyclomaticComplexity > 10) {
        analysis.issues.push({
          type: 'high_cyclomatic_complexity',
          severity: 'high',
          function: func.name,
          line: func.startLine,
          complexity: func.cyclomaticComplexity,
          message: `Function '${func.name}' has cyclomatic complexity of ${func.cyclomaticComplexity} (max recommended: 10)`,
          suggestion: 'Reduce decision points by extracting conditional logic into separate functions'
        });
      }
      
      if (func.cognitiveComplexity > 15) {
        analysis.issues.push({
          type: 'high_cognitive_complexity',
          severity: 'high',
          function: func.name,
          line: func.startLine,
          complexity: func.cognitiveComplexity,
          message: `Function '${func.name}' has cognitive complexity of ${func.cognitiveComplexity} (max recommended: 15)`,
          suggestion: 'Reduce nesting and simplify logic flow for better readability'
        });
      }
    });
    
    return analysis;
  } catch (error) {
    return {
      filePath,
      error: error.message,
      issues: [{
        type: 'analysis_error',
        severity: 'low',
        message: `Could not analyze file: ${error.message}`
      }]
    };
  }
}

/**
 * Scan directory for complexity issues
 */
function scanDirectory(dirPath) {
  const results = [];
  
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
        if (analysis.functions.length > 0 || analysis.issues.length > 0) {
          results.push(analysis);
        }
      }
    });
  }
  
  scanRecursive(dirPath);
  return results;
}

/**
 * Generate complexity report
 */
function generateComplexityReport(analyses) {
  const report = {
    summary: {
      totalFiles: analyses.length,
      totalFunctions: 0,
      totalIssues: 0,
      issuesBySeverity: { high: 0, medium: 0, low: 0 },
      issuesByType: {},
      mostComplexFiles: [],
      mostComplexFunctions: []
    },
    details: analyses
  };
  
  const allFunctions = [];
  
  analyses.forEach(analysis => {
    if (analysis.functions) {
      report.summary.totalFunctions += analysis.functions.length;
      allFunctions.push(...analysis.functions.map(f => ({ ...f, filePath: analysis.filePath })));
    }
    
    analysis.issues.forEach(issue => {
      report.summary.totalIssues++;
      report.summary.issuesBySeverity[issue.severity]++;
      report.summary.issuesByType[issue.type] = (report.summary.issuesByType[issue.type] || 0) + 1;
    });
  });
  
  // Find most complex files and functions
  report.summary.mostComplexFiles = analyses
    .filter(a => a.lineCount)
    .sort((a, b) => b.lineCount - a.lineCount)
    .slice(0, 10)
    .map(a => ({ filePath: a.filePath, lineCount: a.lineCount }));
  
  report.summary.mostComplexFunctions = allFunctions
    .sort((a, b) => b.cognitiveComplexity - a.cognitiveComplexity)
    .slice(0, 10)
    .map(f => ({
      name: f.name,
      filePath: f.filePath,
      startLine: f.startLine,
      cognitiveComplexity: f.cognitiveComplexity,
      cyclomaticComplexity: f.cyclomaticComplexity,
      lineCount: f.lineCount
    }));
  
  return report;
}

/**
 * Main execution
 */
function main() {
  console.log('🧮 Analyzing code complexity...');
  
  const analyses = scanDirectory('./src');
  const report = generateComplexityReport(analyses);
  
  console.log(`\n📊 Complexity Analysis Summary:`);
  console.log(`   Files analyzed: ${report.summary.totalFiles}`);
  console.log(`   Functions found: ${report.summary.totalFunctions}`);
  console.log(`   Total issues: ${report.summary.totalIssues}`);
  console.log(`   High severity: ${report.summary.issuesBySeverity.high}`);
  console.log(`   Medium severity: ${report.summary.issuesBySeverity.medium}`);
  console.log(`   Low severity: ${report.summary.issuesBySeverity.low}\n`);
  
  if (report.summary.issuesBySeverity.high > 0) {
    console.log('⚠️  High severity issues found:');
    analyses.forEach(analysis => {
      const highIssues = analysis.issues.filter(i => i.severity === 'high');
      if (highIssues.length > 0) {
        console.log(`   📁 ${analysis.filePath}:`);
        highIssues.forEach(issue => {
          console.log(`      ❌ ${issue.message}`);
          console.log(`         💡 ${issue.suggestion}\n`);
        });
      }
    });
  }
  
  // Save detailed report
  fs.writeFileSync('./complexity-report.json', JSON.stringify(report, null, 2));
  console.log('📄 Detailed report saved to complexity-report.json');
  
  // Exit with error code if there are high-severity issues
  if (report.summary.issuesBySeverity.high > 0) {
    console.log('❌ Complexity check failed due to high-severity issues');
    process.exit(1);
  } else {
    console.log('✅ Code complexity within acceptable limits');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  analyzeFile,
  scanDirectory,
  generateComplexityReport
};