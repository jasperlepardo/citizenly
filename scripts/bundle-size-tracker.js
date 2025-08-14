#!/usr/bin/env node

/**
 * Bundle Size Tracker
 * Lightweight bundle size monitoring without requiring a full build
 */

const fs = require('fs');
const path = require('path');

/**
 * Calculate directory size recursively
 */
function calculateDirectorySize(dirPath) {
  let totalSize = 0;
  const items = [];
  
  if (!fs.existsSync(dirPath)) {
    return { totalSize: 0, items: [] };
  }
  
  function scanDirectory(currentPath, relativePath = '') {
    const dirItems = fs.readdirSync(currentPath);
    
    for (const item of dirItems) {
      const itemPath = path.join(currentPath, item);
      const itemRelativePath = path.join(relativePath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        scanDirectory(itemPath, itemRelativePath);
      } else {
        const sizeKB = Math.round(stat.size / 1024);
        totalSize += sizeKB;
        
        items.push({
          path: itemRelativePath,
          size: sizeKB,
          extension: path.extname(item)
        });
      }
    }
  }
  
  scanDirectory(dirPath);
  
  return { totalSize, items };
}

/**
 * Analyze source code size and complexity
 */
function analyzeSourceCode() {
  console.log('📊 Analyzing source code size...');
  
  const srcAnalysis = calculateDirectorySize('src');
  
  // Categorize by file type
  const byExtension = {};
  const byDirectory = {};
  
  for (const item of srcAnalysis.items) {
    const ext = item.extension || 'no-extension';
    const dir = path.dirname(item.path).split('/')[0] || 'root';
    
    byExtension[ext] = (byExtension[ext] || 0) + item.size;
    byDirectory[dir] = (byDirectory[dir] || 0) + item.size;
  }
  
  // Find largest files
  const largestFiles = srcAnalysis.items
    .sort((a, b) => b.size - a.size)
    .slice(0, 10);
  
  return {
    total: srcAnalysis.totalSize,
    fileCount: srcAnalysis.items.length,
    byExtension,
    byDirectory,
    largestFiles
  };
}

/**
 * Estimate bundle impact of source code changes
 */
function estimateBundleImpact(sourceAnalysis) {
  const estimates = {
    // TypeScript/JavaScript files typically compile to ~80% of original size
    jsBundle: Math.round((sourceAnalysis.byExtension['.tsx'] || 0) * 0.8 + 
                        (sourceAnalysis.byExtension['.ts'] || 0) * 0.8 + 
                        (sourceAnalysis.byExtension['.jsx'] || 0) * 0.8 + 
                        (sourceAnalysis.byExtension['.js'] || 0) * 0.8),
    
    // CSS files are usually included as-is or minified slightly
    cssBundle: Math.round((sourceAnalysis.byExtension['.css'] || 0) * 0.9),
    
    // Images and static assets
    staticAssets: Math.round((sourceAnalysis.byExtension['.png'] || 0) + 
                            (sourceAnalysis.byExtension['.jpg'] || 0) + 
                            (sourceAnalysis.byExtension['.jpeg'] || 0) + 
                            (sourceAnalysis.byExtension['.svg'] || 0) + 
                            (sourceAnalysis.byExtension['.gif'] || 0))
  };
  
  estimates.total = estimates.jsBundle + estimates.cssBundle + estimates.staticAssets;
  
  return estimates;
}

/**
 * Check for potential bundle optimization opportunities
 */
function identifyOptimizationOpportunities(sourceAnalysis) {
  const opportunities = [];
  
  // Large TypeScript/JavaScript files
  const largeJSFiles = sourceAnalysis.largestFiles.filter(file => 
    ['.ts', '.tsx', '.js', '.jsx'].includes(file.extension) && file.size > 50
  );
  
  if (largeJSFiles.length > 0) {
    opportunities.push({
      type: 'large_components',
      severity: 'medium',
      files: largeJSFiles.map(f => f.path),
      recommendation: 'Consider code splitting or breaking down large components'
    });
  }
  
  // Heavy directories
  const heavyDirs = Object.entries(sourceAnalysis.byDirectory)
    .filter(([dir, size]) => size > 200)
    .sort((a, b) => b[1] - a[1]);
  
  if (heavyDirs.length > 0) {
    opportunities.push({
      type: 'heavy_directories',
      severity: 'low',
      directories: heavyDirs.slice(0, 3),
      recommendation: 'Review directory structure for potential lazy loading'
    });
  }
  
  // Check for potential duplicates (files with similar names)
  const potentialDuplicates = findPotentialDuplicates(sourceAnalysis.items || []);
  if (potentialDuplicates.length > 0) {
    opportunities.push({
      type: 'potential_duplicates',
      severity: 'low',
      files: potentialDuplicates,
      recommendation: 'Review for potential code duplication'
    });
  }
  
  return opportunities;
}

/**
 * Find files that might contain duplicate code
 */
function findPotentialDuplicates(items) {
  const duplicates = [];
  const nameGroups = {};
  
  // Group files by base name (without extension)
  for (const item of items) {
    const baseName = path.basename(item.path, path.extname(item.path));
    if (!nameGroups[baseName]) {
      nameGroups[baseName] = [];
    }
    nameGroups[baseName].push(item);
  }
  
  // Find groups with multiple files
  for (const [name, files] of Object.entries(nameGroups)) {
    if (files.length > 1 && files.some(f => f.size > 10)) {
      duplicates.push({
        baseName: name,
        files: files.map(f => ({ path: f.path, size: f.size }))
      });
    }
  }
  
  return duplicates.slice(0, 5); // Limit to top 5
}

/**
 * Generate bundle size tracking report
 */
function generateBundleSizeReport() {
  console.log('📦 Bundle Size Tracking Report');
  console.log('🎯 Analyzing source code for bundle impact...\n');
  
  const startTime = Date.now();
  
  try {
    // 1. Analyze source code
    console.log('📋 Task 1: Analyzing source code...');
    const sourceAnalysis = analyzeSourceCode();
    console.log(`   ✅ Analyzed ${sourceAnalysis.fileCount} files (${sourceAnalysis.total}KB total)`);
    
    // 2. Estimate bundle impact
    console.log('\n📋 Task 2: Estimating bundle sizes...');
    const bundleEstimates = estimateBundleImpact(sourceAnalysis);
    console.log(`   ✅ Estimated total bundle size: ${bundleEstimates.total}KB`);
    
    // 3. Identify optimization opportunities
    console.log('\n📋 Task 3: Identifying optimization opportunities...');
    const opportunities = identifyOptimizationOpportunities(sourceAnalysis);
    console.log(`   ✅ Found ${opportunities.length} optimization opportunities`);
    
    // 4. Generate report
    const report = {
      timestamp: new Date().toISOString(),
      sourceAnalysis,
      bundleEstimates,
      opportunities,
      summary: {
        sourceFiles: sourceAnalysis.fileCount,
        sourceSize: sourceAnalysis.total,
        estimatedBundleSize: bundleEstimates.total,
        optimizationOpportunities: opportunities.length
      },
      recommendations: generateRecommendations(sourceAnalysis, bundleEstimates, opportunities)
    };
    
    fs.writeFileSync('bundle-size-tracking-report.json', JSON.stringify(report, null, 2));
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    // Console output
    console.log('\n📦 Bundle Size Tracking Results:');
    console.log(`   📊 Source Files: ${report.summary.sourceFiles}`);
    console.log(`   📏 Source Size: ${report.summary.sourceSize}KB`);
    console.log(`   🚀 Estimated Bundle: ${report.summary.estimatedBundleSize}KB`);
    console.log(`   💡 Opportunities: ${report.summary.optimizationOpportunities}`);
    console.log(`   ⏱️  Completed in ${duration} seconds\n`);
    
    // Show file type breakdown
    console.log('📋 File Type Breakdown:');
    Object.entries(sourceAnalysis.byExtension)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([ext, size]) => {
        console.log(`   ${ext || 'no-ext'}: ${size}KB`);
      });
    console.log('');
    
    // Show largest files
    if (sourceAnalysis.largestFiles.length > 0) {
      console.log('📋 Largest Files:');
      sourceAnalysis.largestFiles.slice(0, 5).forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.path} - ${file.size}KB`);
      });
      console.log('');
    }
    
    // Show optimization opportunities
    if (opportunities.length > 0) {
      console.log('💡 Optimization Opportunities:');
      opportunities.forEach(opp => {
        console.log(`   • ${opp.type}: ${opp.recommendation}`);
      });
      console.log('');
    }
    
    // Show recommendations
    if (report.recommendations.length > 0) {
      console.log('🎯 Recommendations:');
      report.recommendations.slice(0, 5).forEach(rec => {
        console.log(`   - ${rec}`);
      });
      console.log('');
    }
    
    console.log('📋 Detailed report saved to: bundle-size-tracking-report.json');
    
    return report;
    
  } catch (error) {
    console.error('❌ Error during bundle size tracking:', error.message);
    process.exit(1);
  }
}

/**
 * Generate optimization recommendations
 */
function generateRecommendations(sourceAnalysis, bundleEstimates, opportunities) {
  const recommendations = [];
  
  // Size-based recommendations
  if (bundleEstimates.total > 1000) {
    recommendations.push('Large estimated bundle size - consider implementing code splitting');
  }
  
  if (bundleEstimates.jsBundle > 800) {
    recommendations.push('Large JavaScript bundle - review for tree shaking opportunities');
  }
  
  if (sourceAnalysis.largestFiles.some(f => f.size > 100)) {
    recommendations.push('Large source files detected - consider breaking down into smaller modules');
  }
  
  // Directory-based recommendations
  const componentSize = sourceAnalysis.byDirectory.components || 0;
  if (componentSize > 300) {
    recommendations.push('Large components directory - implement lazy loading for heavy components');
  }
  
  // Type-based recommendations
  if ((sourceAnalysis.byExtension['.tsx'] || 0) > 200) {
    recommendations.push('Many React components - consider component lazy loading and code splitting');
  }
  
  if ((sourceAnalysis.byExtension['.css'] || 0) > 100) {
    recommendations.push('Large CSS files - consider CSS optimization and unused style removal');
  }
  
  // Opportunity-based recommendations
  opportunities.forEach(opp => {
    if (opp.type === 'large_components') {
      recommendations.push('Break down large components into smaller, reusable pieces');
    }
    if (opp.type === 'potential_duplicates') {
      recommendations.push('Review potential duplicate code for consolidation opportunities');
    }
  });
  
  // General recommendations
  recommendations.push('Set up webpack-bundle-analyzer for detailed bundle analysis');
  recommendations.push('Implement bundle size monitoring in CI/CD pipeline');
  recommendations.push('Consider using dynamic imports for route-based code splitting');
  
  return recommendations;
}

if (require.main === module) {
  generateBundleSizeReport();
}

module.exports = {
  calculateDirectorySize,
  analyzeSourceCode,
  estimateBundleImpact,
  generateBundleSizeReport
};