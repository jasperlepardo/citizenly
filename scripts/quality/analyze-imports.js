#!/usr/bin/env node

/**
 * Import Structure Analyzer
 * Analyzes import patterns and identifies optimization opportunities
 */

const fs = require('fs');
const path = require('path');

class ImportAnalyzer {
  constructor() {
    this.results = {
      filesAnalyzed: 0,
      imports: {},
      exports: {},
      unused: [],
      circular: [],
      heavyDependencies: [],
      recommendations: []
    };
  }

  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    this.results.filesAnalyzed++;
    
    // Extract imports
    const imports = this.extractImports(content, relativePath);
    const exports = this.extractExports(content, relativePath);
    
    this.results.imports[relativePath] = imports;
    this.results.exports[relativePath] = exports;
    
    // Check for unused imports
    const unusedImports = this.findUnusedImports(content, imports);
    if (unusedImports.length > 0) {
      this.results.unused.push({
        file: relativePath,
        imports: unusedImports
      });
    }
    
    return { imports, exports };
  }

  extractImports(content, filePath) {
    const imports = [];
    
    // Match various import patterns
    const patterns = [
      // import { a, b } from 'module'
      /import\s*{\s*([^}]+)\s*}\s*from\s*['"`]([^'"`]+)['"`]/g,
      // import defaultExport from 'module'
      /import\s+(\w+)\s*from\s*['"`]([^'"`]+)['"`]/g,
      // import * as name from 'module'
      /import\s*\*\s*as\s+(\w+)\s*from\s*['"`]([^'"`]+)['"`]/g,
      // import 'module' (side effects only)
      /import\s*['"`]([^'"`]+)['"`]/g
    ];
    
    patterns.forEach((pattern, index) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        let importInfo;
        
        switch (index) {
          case 0: // Named imports
            importInfo = {
              type: 'named',
              names: match[1].split(',').map(s => s.trim()),
              from: match[2],
              line: content.substring(0, match.index).split('\n').length
            };
            break;
          case 1: // Default import
            importInfo = {
              type: 'default',
              names: [match[1]],
              from: match[2],
              line: content.substring(0, match.index).split('\n').length
            };
            break;
          case 2: // Namespace import
            importInfo = {
              type: 'namespace',
              names: [match[1]],
              from: match[2],
              line: content.substring(0, match.index).split('\n').length
            };
            break;
          case 3: // Side effect import
            importInfo = {
              type: 'side-effect',
              names: [],
              from: match[1],
              line: content.substring(0, match.index).split('\n').length
            };
            break;
        }
        
        if (importInfo) {
          imports.push(importInfo);
        }
      }
    });
    
    return imports;
  }

  extractExports(content, filePath) {
    const exports = [];
    
    // Match export patterns
    const patterns = [
      // export { a, b }
      /export\s*{\s*([^}]+)\s*}/g,
      // export const/function/class
      /export\s+(?:const|function|class)\s+(\w+)/g,
      // export default
      /export\s+default\s+(?:function\s+(\w+)|class\s+(\w+)|(\w+))/g
    ];
    
    patterns.forEach((pattern, index) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        let exportInfo;
        
        switch (index) {
          case 0: // Named exports
            exportInfo = {
              type: 'named',
              names: match[1].split(',').map(s => s.trim()),
              line: content.substring(0, match.index).split('\n').length
            };
            break;
          case 1: // Direct exports
            exportInfo = {
              type: 'direct',
              names: [match[1]],
              line: content.substring(0, match.index).split('\n').length
            };
            break;
          case 2: // Default export
            exportInfo = {
              type: 'default',
              names: [match[1] || match[2] || match[3] || 'default'],
              line: content.substring(0, match.index).split('\n').length
            };
            break;
        }
        
        if (exportInfo) {
          exports.push(exportInfo);
        }
      }
    });
    
    return exports;
  }

  findUnusedImports(content, imports) {
    const unused = [];
    
    imports.forEach(imp => {
      if (imp.type === 'side-effect') return; // Can't determine usage for side effects
      
      imp.names.forEach(name => {
        // Simple check if the imported name is used in the content
        // This is a basic implementation and might have false positives/negatives
        const usageRegex = new RegExp(`\\b${name}\\b`, 'g');
        const matches = content.match(usageRegex) || [];
        
        // If only found once, it's likely just the import statement
        if (matches.length <= 1) {
          unused.push({
            name,
            from: imp.from,
            line: imp.line,
            type: imp.type
          });
        }
      });
    });
    
    return unused;
  }

  detectCircularDependencies() {
    const graph = {};
    const visited = new Set();
    const recursionStack = new Set();
    const cycles = [];
    
    // Build dependency graph
    Object.entries(this.results.imports).forEach(([file, imports]) => {
      graph[file] = [];
      imports.forEach(imp => {
        if (imp.from.startsWith('.')) {
          // Resolve relative path
          const resolvedPath = path.resolve(path.dirname(file), imp.from);
          const relativePath = path.relative(process.cwd(), resolvedPath);
          graph[file].push(relativePath);
        }
      });
    });
    
    // DFS to detect cycles
    const dfs = (node, path = []) => {
      if (recursionStack.has(node)) {
        // Found a cycle
        const cycleStart = path.indexOf(node);
        const cycle = path.slice(cycleStart).concat(node);
        cycles.push(cycle);
        return;
      }
      
      if (visited.has(node)) return;
      
      visited.add(node);
      recursionStack.add(node);
      path.push(node);
      
      const dependencies = graph[node] || [];
      dependencies.forEach(dep => {
        if (fs.existsSync(dep) || fs.existsSync(dep + '.ts') || fs.existsSync(dep + '.tsx')) {
          dfs(dep, [...path]);
        }
      });
      
      recursionStack.delete(node);
    };
    
    Object.keys(graph).forEach(file => {
      if (!visited.has(file)) {
        dfs(file);
      }
    });
    
    this.results.circular = cycles;
  }

  analyzeHeavyDependencies() {
    const dependencyCounts = {};
    
    // Count imports by module
    Object.values(this.results.imports).forEach(imports => {
      imports.forEach(imp => {
        if (!dependencyCounts[imp.from]) {
          dependencyCounts[imp.from] = { count: 0, files: new Set() };
        }
        dependencyCounts[imp.from].count++;
        dependencyCounts[imp.from].files.add(imp.from);
      });
    });
    
    // Identify heavy dependencies
    const sorted = Object.entries(dependencyCounts)
      .map(([module, data]) => ({ module, ...data, files: Array.from(data.files) }))
      .sort((a, b) => b.count - a.count);
    
    this.results.heavyDependencies = sorted.slice(0, 10);
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Unused imports
    if (this.results.unused.length > 0) {
      const totalUnused = this.results.unused.reduce((sum, file) => sum + file.imports.length, 0);
      recommendations.push({
        type: 'cleanup',
        priority: 'medium',
        message: `${totalUnused} unused imports found across ${this.results.unused.length} files`,
        action: 'Remove unused imports to reduce bundle size and improve clarity'
      });
    }
    
    // Circular dependencies
    if (this.results.circular.length > 0) {
      recommendations.push({
        type: 'architecture',
        priority: 'high',
        message: `${this.results.circular.length} circular dependency cycles detected`,
        action: 'Refactor code to eliminate circular dependencies'
      });
    }
    
    // Heavy dependencies
    const externalHeavy = this.results.heavyDependencies.filter(dep => !dep.module.startsWith('.'));
    if (externalHeavy.length > 0 && externalHeavy[0].count > 20) {
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        message: `Heavy external dependencies detected: ${externalHeavy[0].module} used ${externalHeavy[0].count} times`,
        action: 'Consider creating a wrapper or using barrel exports'
      });
    }
    
    this.results.recommendations = recommendations;
  }

  analyzeDirectory(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      
      if (file.isDirectory() && 
          !file.name.startsWith('.') && 
          file.name !== 'node_modules' &&
          file.name !== '.next') {
        this.analyzeDirectory(filePath);
      } else if (file.name.match(/\.(ts|tsx|js|jsx)$/) && 
                 !file.name.includes('.test.') && 
                 !file.name.includes('.spec.')) {
        this.analyzeFile(filePath);
      }
    }
  }

  printReport() {
    console.log('📦 Import Analysis Report');
    console.log('=========================');
    console.log(`Files analyzed: ${this.results.filesAnalyzed}`);
    
    // Heavy dependencies
    if (this.results.heavyDependencies.length > 0) {
      console.log('\n📊 Most Imported Modules:');
      this.results.heavyDependencies.slice(0, 5).forEach((dep, index) => {
        console.log(`  ${index + 1}. ${dep.module} (${dep.count} imports)`);
      });
    }
    
    // Unused imports
    if (this.results.unused.length > 0) {
      const totalUnused = this.results.unused.reduce((sum, file) => sum + file.imports.length, 0);
      console.log(`\n🧹 Unused Imports: ${totalUnused} found in ${this.results.unused.length} files`);
      
      this.results.unused.slice(0, 5).forEach(file => {
        console.log(`  📄 ${file.file}:`);
        file.imports.forEach(imp => {
          console.log(`    - ${imp.name} from '${imp.from}' (line ${imp.line})`);
        });
      });
    }
    
    // Circular dependencies
    if (this.results.circular.length > 0) {
      console.log(`\n🔄 Circular Dependencies: ${this.results.circular.length} cycles found`);
      this.results.circular.forEach((cycle, index) => {
        console.log(`  ${index + 1}. ${cycle.join(' → ')}`);
      });
    }
    
    // Recommendations
    if (this.results.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      this.results.recommendations.forEach(rec => {
        const icon = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
        console.log(`${icon} ${rec.message}`);
        console.log(`   → ${rec.action}\n`);
      });
    } else {
      console.log('\n✅ Import structure looks good!');
    }
  }

  saveReport() {
    const reportPath = path.join(process.cwd(), 'reports', 'import-analysis.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        filesAnalyzed: this.results.filesAnalyzed,
        totalUnused: this.results.unused.reduce((sum, file) => sum + file.imports.length, 0),
        circularDependencies: this.results.circular.length,
        heavyDependencies: this.results.heavyDependencies.length
      },
      ...this.results
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved: ${reportPath}`);
  }
}

// CLI usage
if (require.main === module) {
  const analyzer = new ImportAnalyzer();
  const srcDir = path.join(process.cwd(), 'src');
  
  console.log('Analyzing import structure...');
  analyzer.analyzeDirectory(srcDir);
  analyzer.detectCircularDependencies();
  analyzer.analyzeHeavyDependencies();
  analyzer.generateRecommendations();
  
  analyzer.printReport();
  analyzer.saveReport();
  
  // Exit with error if there are high priority issues
  const hasHighPriorityIssues = analyzer.results.recommendations.some(rec => rec.priority === 'high');
  if (hasHighPriorityIssues && process.argv.includes('--strict')) {
    process.exit(1);
  }
}

module.exports = { ImportAnalyzer };