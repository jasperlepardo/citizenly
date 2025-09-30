#!/usr/bin/env node

/**
 * Bundle Size Analyzer
 * Analyzes Next.js build output for optimization opportunities
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BundleAnalyzer {
  constructor() {
    this.buildDir = path.join(process.cwd(), '.next');
    this.results = {
      totalSize: 0,
      chunks: [],
      pages: [],
      warnings: [],
      recommendations: []
    };
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  analyzeStaticFiles() {
    const staticDir = path.join(this.buildDir, 'static');
    
    if (!fs.existsSync(staticDir)) {
      this.results.warnings.push('No .next/static directory found. Run build first.');
      return;
    }
    
    const walkDir = (dir, fileList = []) => {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDir(filePath, fileList);
        } else {
          const relativePath = path.relative(this.buildDir, filePath);
          const size = stat.size;
          
          fileList.push({
            path: relativePath,
            size,
            formattedSize: this.formatBytes(size),
            type: this.getFileType(file)
          });
          
          this.results.totalSize += size;
        }
      });
      
      return fileList;
    };
    
    const files = walkDir(staticDir);
    
    // Categorize files
    this.results.chunks = files.filter(f => f.type === 'javascript').sort((a, b) => b.size - a.size);
    this.results.pages = files.filter(f => f.path.includes('pages/')).sort((a, b) => b.size - a.size);
    
    // Generate recommendations
    this.generateRecommendations();
  }

  getFileType(filename) {
    if (filename.endsWith('.js')) return 'javascript';
    if (filename.endsWith('.css')) return 'stylesheet';
    if (filename.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (filename.match(/\.(woff|woff2|eot|ttf|otf)$/)) return 'font';
    return 'other';
  }

  generateRecommendations() {
    // Check for large JavaScript bundles
    const largeChunks = this.results.chunks.filter(chunk => chunk.size > 300 * 1024); // > 300KB
    if (largeChunks.length > 0) {
      this.results.recommendations.push({
        type: 'warning',
        message: `Large JavaScript chunks detected (${largeChunks.length} files > 300KB)`,
        details: largeChunks.map(chunk => `${chunk.path}: ${chunk.formattedSize}`),
        action: 'Consider code splitting or dynamic imports'
      });
    }
    
    // Check total bundle size
    const totalJSSize = this.results.chunks.reduce((total, chunk) => total + chunk.size, 0);
    if (totalJSSize > 1024 * 1024) { // > 1MB
      this.results.recommendations.push({
        type: 'warning',
        message: `Total JavaScript size is large: ${this.formatBytes(totalJSSize)}`,
        action: 'Consider removing unused dependencies or code splitting'
      });
    }
    
    // Check for duplicate dependencies
    const duplicatePatterns = this.findDuplicatePatterns();
    if (duplicatePatterns.length > 0) {
      this.results.recommendations.push({
        type: 'info',
        message: 'Potential duplicate dependencies detected',
        details: duplicatePatterns,
        action: 'Review webpack bundle analyzer for duplicate modules'
      });
    }
    
    // Performance recommendations
    if (this.results.chunks.length > 50) {
      this.results.recommendations.push({
        type: 'info',
        message: `Many chunks generated (${this.results.chunks.length})`,
        action: 'Consider adjusting Next.js chunk splitting configuration'
      });
    }
  }

  findDuplicatePatterns() {
    const patterns = {};
    const duplicates = [];
    
    this.results.chunks.forEach(chunk => {
      const name = chunk.path.split('/').pop().replace(/[-\w]+\./, '');
      if (!patterns[name]) {
        patterns[name] = [];
      }
      patterns[name].push(chunk.path);
    });
    
    Object.entries(patterns).forEach(([pattern, files]) => {
      if (files.length > 1 && pattern !== 'js') {
        duplicates.push(`${pattern}: ${files.length} instances`);
      }
    });
    
    return duplicates;
  }

  runWebpackBundleAnalyzer() {
    try {
      console.log('🔍 Running webpack-bundle-analyzer...');
      
      // Check if analyzer is available
      execSync('npx webpack-bundle-analyzer --help', { stdio: 'pipe' });
      
      const analyzerOutput = path.join(process.cwd(), 'bundle-report.html');
      const command = `npx webpack-bundle-analyzer .next/static/chunks/*.js -r ${analyzerOutput} -m static`;
      
      execSync(command, { stdio: 'pipe' });
      
      if (fs.existsSync(analyzerOutput)) {
        console.log(`📊 Detailed bundle analysis: ${analyzerOutput}`);
        this.results.recommendations.unshift({
          type: 'success',
          message: `Detailed bundle analysis available: ${analyzerOutput}`,
          action: 'Open in browser to identify optimization opportunities'
        });
      }
    } catch (error) {
      this.results.warnings.push('webpack-bundle-analyzer not available. Install with: npm install -D webpack-bundle-analyzer');
    }
  }

  printReport() {
    console.log('\n📦 Bundle Analysis Report');
    console.log('=========================');
    console.log(`Total bundle size: ${this.formatBytes(this.results.totalSize)}`);
    console.log(`JavaScript files: ${this.results.chunks.length}`);
    console.log(`Page bundles: ${this.results.pages.length}`);
    
    if (this.results.chunks.length > 0) {
      console.log('\n📊 Top 10 Largest JavaScript Files:');
      this.results.chunks.slice(0, 10).forEach((chunk, index) => {
        console.log(`  ${index + 1}. ${chunk.path} - ${chunk.formattedSize}`);
      });
    }
    
    if (this.results.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.results.warnings.forEach(warning => {
        console.log(`  • ${warning}`);
      });
    }
    
    if (this.results.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      this.results.recommendations.forEach(rec => {
        const icon = rec.type === 'warning' ? '⚠️ ' : rec.type === 'success' ? '✅ ' : '💡 ';
        console.log(`${icon} ${rec.message}`);
        if (rec.details) {
          rec.details.forEach(detail => console.log(`     - ${detail}`));
        }
        console.log(`     → ${rec.action}\n`);
      });
    }
  }

  saveReport() {
    const reportPath = path.join(process.cwd(), 'reports', 'bundle-analysis.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    
    const report = {
      timestamp: new Date().toISOString(),
      totalSize: this.results.totalSize,
      formattedTotalSize: this.formatBytes(this.results.totalSize),
      summary: {
        javascriptFiles: this.results.chunks.length,
        pageBundles: this.results.pages.length,
        warnings: this.results.warnings.length,
        recommendations: this.results.recommendations.length
      },
      ...this.results
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved: ${reportPath}`);
  }
}

// CLI usage
if (require.main === module) {
  const analyzer = new BundleAnalyzer();
  
  console.log('Analyzing bundle sizes...');
  analyzer.analyzeStaticFiles();
  
  if (process.argv.includes('--detailed')) {
    analyzer.runWebpackBundleAnalyzer();
  }
  
  analyzer.printReport();
  analyzer.saveReport();
  
  // Exit with error if there are warnings about large bundles
  const hasLargeBundle = analyzer.results.recommendations.some(rec => 
    rec.type === 'warning' && rec.message.includes('Large JavaScript')
  );
  
  if (hasLargeBundle && process.argv.includes('--strict')) {
    process.exit(1);
  }
}

module.exports = { BundleAnalyzer };