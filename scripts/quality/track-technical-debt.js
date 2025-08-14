#!/usr/bin/env node

/**
 * Technical Debt Tracker
 * Automatically creates GitHub issues for TODO/FIXME comments
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const DEBT_KEYWORDS = ['TODO', 'FIXME', 'HACK', 'XXX', 'DEPRECATED'];
const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage',
  'storybook-static'
];

/**
 * Extract technical debt comments from files
 */
function extractDebtComments(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const debtItems = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      DEBT_KEYWORDS.forEach(keyword => {
        if (trimmedLine.includes(`// ${keyword}`) || 
            trimmedLine.includes(`/* ${keyword}`) ||
            trimmedLine.includes(`* ${keyword}`)) {
          
          // Extract the comment text
          const commentMatch = line.match(new RegExp(`(${keyword}):?\\s*(.+?)(?:\\*\\/|$)`));
          const description = commentMatch ? commentMatch[2].trim() : trimmedLine;
          
          debtItems.push({
            keyword,
            file: filePath,
            line: index + 1,
            description,
            context: getContextLines(lines, index),
            severity: getSeverity(keyword),
            estimatedEffort: estimateEffort(description)
          });
        }
      });
    });

    return debtItems;
  } catch (error) {
    console.warn(`Could not read file ${filePath}:`, error.message);
    return [];
  }
}

/**
 * Get context lines around the debt comment
 */
function getContextLines(lines, targetIndex, contextSize = 2) {
  const start = Math.max(0, targetIndex - contextSize);
  const end = Math.min(lines.length, targetIndex + contextSize + 1);
  
  return lines.slice(start, end).map((line, index) => ({
    lineNumber: start + index + 1,
    content: line,
    isTarget: start + index === targetIndex
  }));
}

/**
 * Determine severity based on keyword
 */
function getSeverity(keyword) {
  const severityMap = {
    'FIXME': 'high',
    'HACK': 'high',
    'DEPRECATED': 'medium',
    'TODO': 'low',
    'XXX': 'medium'
  };
  return severityMap[keyword] || 'low';
}

/**
 * Estimate effort based on description
 */
function estimateEffort(description) {
  const lowEffortKeywords = ['typo', 'comment', 'documentation', 'rename'];
  const highEffortKeywords = ['refactor', 'rewrite', 'architecture', 'security', 'performance'];
  
  const lower = description.toLowerCase();
  
  if (highEffortKeywords.some(keyword => lower.includes(keyword))) {
    return 'high';
  }
  
  if (lowEffortKeywords.some(keyword => lower.includes(keyword))) {
    return 'low';
  }
  
  return 'medium';
}

/**
 * Scan directory for debt items
 */
function scanDirectory(dirPath) {
  const allDebtItems = [];
  
  function scanRecursive(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    items.forEach(item => {
      if (IGNORE_PATTERNS.some(pattern => item.includes(pattern))) {
        return;
      }
      
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanRecursive(fullPath);
      } else if (stat.isFile() && /\.(ts|tsx|js|jsx|md|sql)$/.test(item)) {
        const debtItems = extractDebtComments(fullPath);
        allDebtItems.push(...debtItems);
      }
    });
  }
  
  scanRecursive(dirPath);
  return allDebtItems;
}

/**
 * Generate technical debt report
 */
function generateReport(debtItems) {
  const report = {
    summary: {
      totalItems: debtItems.length,
      bySeverity: {},
      byKeyword: {},
      byEffort: {},
      byFile: {}
    },
    items: debtItems
  };
  
  debtItems.forEach(item => {
    // Count by severity
    report.summary.bySeverity[item.severity] = 
      (report.summary.bySeverity[item.severity] || 0) + 1;
    
    // Count by keyword
    report.summary.byKeyword[item.keyword] = 
      (report.summary.byKeyword[item.keyword] || 0) + 1;
    
    // Count by effort
    report.summary.byEffort[item.estimatedEffort] = 
      (report.summary.byEffort[item.estimatedEffort] || 0) + 1;
    
    // Count by file
    report.summary.byFile[item.file] = 
      (report.summary.byFile[item.file] || 0) + 1;
  });
  
  return report;
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(report) {
  let markdown = `# Technical Debt Report

Generated on: ${new Date().toISOString()}

## Summary

- **Total Items**: ${report.summary.totalItems}
- **High Severity**: ${report.summary.bySeverity.high || 0}
- **Medium Severity**: ${report.summary.bySeverity.medium || 0}
- **Low Severity**: ${report.summary.bySeverity.low || 0}

### Breakdown by Type

| Type | Count | Percentage |
|------|-------|------------|
`;

  Object.entries(report.summary.byKeyword).forEach(([keyword, count]) => {
    const percentage = ((count / report.summary.totalItems) * 100).toFixed(1);
    markdown += `| ${keyword} | ${count} | ${percentage}% |\n`;
  });

  markdown += `\n### Breakdown by Effort

| Effort Level | Count | Percentage |
|--------------|-------|------------|
`;

  Object.entries(report.summary.byEffort).forEach(([effort, count]) => {
    const percentage = ((count / report.summary.totalItems) * 100).toFixed(1);
    markdown += `| ${effort} | ${count} | ${percentage}% |\n`;
  });

  markdown += `\n## High Priority Items

`;

  const highPriorityItems = report.items.filter(item => 
    item.severity === 'high' || item.estimatedEffort === 'high'
  );

  highPriorityItems.forEach((item, index) => {
    markdown += `### ${index + 1}. ${item.keyword} in ${item.file}:${item.line}

**Description**: ${item.description}
**Severity**: ${item.severity}
**Estimated Effort**: ${item.estimatedEffort}

\`\`\`typescript
${item.context.map(ctx => 
  `${ctx.lineNumber}: ${ctx.isTarget ? '-> ' : '   '}${ctx.content}`
).join('\n')}
\`\`\`

---
`;
  });

  return markdown;
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'scan';
  
  switch (command) {
    case 'scan':
      console.log('🔍 Scanning for technical debt...');
      const debtItems = scanDirectory('./src');
      const report = generateReport(debtItems);
      
      console.log(`\n📊 Technical Debt Summary:`);
      console.log(`   Total items: ${report.summary.totalItems}`);
      console.log(`   High severity: ${report.summary.bySeverity.high || 0}`);
      console.log(`   Medium severity: ${report.summary.bySeverity.medium || 0}`);
      console.log(`   Low severity: ${report.summary.bySeverity.low || 0}\n`);
      
      // Save reports
      fs.writeFileSync('./technical-debt-report.json', JSON.stringify(report, null, 2));
      fs.writeFileSync('./TECHNICAL_DEBT.md', generateMarkdownReport(report));
      
      console.log('📄 Reports saved:');
      console.log('   - technical-debt-report.json');
      console.log('   - TECHNICAL_DEBT.md');
      break;
      
    case 'check':
      console.log('⚖️  Checking technical debt limits...');
      const currentDebt = scanDirectory('./src');
      const currentReport = generateReport(currentDebt);
      
      // Set limits
      const MAX_HIGH_SEVERITY = 5;
      const MAX_TOTAL_ITEMS = 50;
      
      const highSeverityCount = currentReport.summary.bySeverity.high || 0;
      const totalCount = currentReport.summary.totalItems;
      
      if (highSeverityCount > MAX_HIGH_SEVERITY) {
        console.error(`❌ Too many high-severity debt items: ${highSeverityCount} (max: ${MAX_HIGH_SEVERITY})`);
        process.exit(1);
      }
      
      if (totalCount > MAX_TOTAL_ITEMS) {
        console.error(`❌ Too much technical debt: ${totalCount} items (max: ${MAX_TOTAL_ITEMS})`);
        process.exit(1);
      }
      
      console.log('✅ Technical debt within acceptable limits');
      break;
      
    default:
      console.log(`Usage: node technical-debt-tracker.js [scan|check]`);
      console.log(`  scan  - Generate technical debt report`);
      console.log(`  check - Check if debt is within limits (for CI)`);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  extractDebtComments,
  scanDirectory,
  generateReport,
  generateMarkdownReport
};