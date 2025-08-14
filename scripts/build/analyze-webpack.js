#!/usr/bin/env node

/**
 * Webpack Bundle Analyzer Integration
 * Provides detailed bundle composition analysis
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Check if webpack-bundle-analyzer is available
 */
function checkBundleAnalyzer() {
  try {
    require.resolve('webpack-bundle-analyzer');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Generate bundle analysis report
 */
function generateBundleAnalysisReport() {
  console.log('📊 Generating Webpack Bundle Analysis...');
  
  if (!checkBundleAnalyzer()) {
    console.log('⚠️  webpack-bundle-analyzer not found, using basic analysis');
    return generateBasicAnalysis();
  }
  
  try {
    // Run the analyzer to generate static report
    console.log('🔍 Running webpack-bundle-analyzer...');
    
    // Build with analyzer
    execSync('ANALYZE=true npm run build', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log('✅ Bundle analysis report generated');
    console.log('📁 Check .next/analyze/ for detailed bundle breakdown');
    
    return {
      success: true,
      message: 'Webpack bundle analysis completed',
      reportPath: '.next/analyze/'
    };
    
  } catch (error) {
    console.error('❌ Error running webpack-bundle-analyzer:', error.message);
    return generateBasicAnalysis();
  }
}

/**
 * Generate basic bundle analysis without webpack-bundle-analyzer
 */
function generateBasicAnalysis() {
  console.log('📋 Generating basic bundle analysis...');
  
  const buildDir = '.next';
  if (!fs.existsSync(buildDir)) {
    return {
      success: false,
      error: 'No build directory found. Run npm run build first.'
    };
  }
  
  try {
    const staticDir = path.join(buildDir, 'static');
    const chunks = [];
    
    if (fs.existsSync(staticDir)) {
      const scanDir = (dir, prefix = '') => {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          const itemPath = path.join(dir, item);
          const stat = fs.statSync(itemPath);
          
          if (stat.isDirectory()) {
            scanDir(itemPath, prefix + item + '/');
          } else if (item.endsWith('.js')) {
            chunks.push({
              name: prefix + item,
              size: Math.round(stat.size / 1024), // KB
              path: itemPath
            });
          }
        }
      };
      
      scanDir(staticDir);
    }
    
    // Sort by size
    chunks.sort((a, b) => b.size - a.size);
    
    const analysis = {
      timestamp: new Date().toISOString(),
      totalChunks: chunks.length,
      totalSize: chunks.reduce((sum, chunk) => sum + chunk.size, 0),
      largestChunks: chunks.slice(0, 10),
      chunks
    };
    
    fs.writeFileSync('basic-bundle-analysis.json', JSON.stringify(analysis, null, 2));
    
    console.log(`📊 Basic Analysis Results:`);
    console.log(`   📦 Total Chunks: ${analysis.totalChunks}`);
    console.log(`   📏 Total Size: ${analysis.totalSize}KB`);
    console.log(`   📋 Report saved to: basic-bundle-analysis.json`);
    
    return {
      success: true,
      analysis
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Analyze bundle composition for optimization opportunities
 */
function analyzeBundleComposition() {
  console.log('🔍 Analyzing bundle composition...');
  
  const insights = [];
  
  // Check for large vendor bundles
  if (fs.existsSync('.next/static/chunks')) {
    const chunksDir = '.next/static/chunks';
    const chunks = fs.readdirSync(chunksDir)
      .filter(file => file.endsWith('.js'))
      .map(file => {
        const filePath = path.join(chunksDir, file);
        const stat = fs.statSync(filePath);
        return {
          name: file,
          size: Math.round(stat.size / 1024)
        };
      })
      .sort((a, b) => b.size - a.size);
    
    // Identify potential optimization opportunities
    chunks.forEach(chunk => {
      if (chunk.size > 100) { // > 100KB
        if (chunk.name.includes('vendor') || chunk.name.includes('framework')) {
          insights.push({
            type: 'large_vendor',
            chunk: chunk.name,
            size: chunk.size,
            recommendation: 'Consider splitting vendor bundles or tree shaking unused imports'
          });
        } else if (chunk.name.includes('pages')) {
          insights.push({
            type: 'large_page',
            chunk: chunk.name,
            size: chunk.size,
            recommendation: 'Consider code splitting or lazy loading for this page'
          });
        }
      }
    });
  }
  
  return insights;
}

/**
 * Generate optimization recommendations
 */
function generateOptimizationGuide() {
  const guide = {
    timestamp: new Date().toISOString(),
    strategies: [
      {
        strategy: 'Code Splitting',
        description: 'Split code into smaller chunks that load on demand',
        implementation: [
          'Use dynamic imports: import("./Component")',
          'Implement route-based splitting with Next.js',
          'Split vendor bundles with webpack configuration'
        ],
        impact: 'High - Reduces initial bundle size significantly'
      },
      {
        strategy: 'Tree Shaking',
        description: 'Remove unused code from bundles',
        implementation: [
          'Use ES6 modules (import/export)',
          'Configure webpack with sideEffects: false',
          'Import only needed functions from libraries'
        ],
        impact: 'Medium - Reduces bundle size by eliminating dead code'
      },
      {
        strategy: 'Dynamic Imports',
        description: 'Load components and modules only when needed',
        implementation: [
          'Use React.lazy() for component lazy loading',
          'Implement conditional imports based on user actions',
          'Load heavy libraries on demand'
        ],
        impact: 'High - Improves initial page load time'
      },
      {
        strategy: 'Bundle Analysis',
        description: 'Regular monitoring and optimization of bundle sizes',
        implementation: [
          'Set up automated bundle size monitoring',
          'Track bundle size changes in CI/CD',
          'Regular analysis with webpack-bundle-analyzer'
        ],
        impact: 'Medium - Prevents bundle size regression'
      }
    ],
    commonIssues: [
      {
        issue: 'Large vendor bundles',
        cause: 'Including entire libraries when only small parts are used',
        solution: 'Use tree shaking and import only needed functions'
      },
      {
        issue: 'Duplicate dependencies',
        cause: 'Multiple versions of the same library',
        solution: 'Use webpack resolve.alias or npm dedupe'
      },
      {
        issue: 'Large CSS bundles',
        cause: 'Including unused CSS styles',
        solution: 'Use PurgeCSS or similar tools to remove unused styles'
      }
    ]
  };
  
  fs.writeFileSync('bundle-optimization-guide.json', JSON.stringify(guide, null, 2));
  
  console.log('📋 Bundle Optimization Guide:');
  console.log('   📊 4 optimization strategies documented');
  console.log('   🔍 3 common issues and solutions identified');
  console.log('   📁 Guide saved to: bundle-optimization-guide.json');
  
  return guide;
}

/**
 * Main bundle analysis function
 */
function runWebpackAnalysis() {
  console.log('📊 Running Comprehensive Bundle Analysis...');
  console.log('🎯 Analyzing webpack bundles and generating optimization recommendations...\n');
  
  const startTime = Date.now();
  const results = {
    bundleAnalysis: null,
    composition: null,
    optimizationGuide: null
  };
  
  try {
    // 1. Generate bundle analysis
    console.log('📋 Task 1: Generating bundle analysis...');
    results.bundleAnalysis = generateBundleAnalysisReport();
    console.log('   ✅ Bundle analysis completed');
    
    // 2. Analyze composition
    console.log('\n📋 Task 2: Analyzing bundle composition...');
    results.composition = analyzeBundleComposition();
    console.log(`   ✅ Found ${results.composition.length} optimization opportunities`);
    
    // 3. Generate optimization guide
    console.log('\n📋 Task 3: Generating optimization guide...');
    results.optimizationGuide = generateOptimizationGuide();
    console.log('   ✅ Optimization guide generated');
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('\n📊 Webpack Analysis Complete!');
    console.log(`   ⏱️  Completed in ${duration} seconds`);
    console.log('   📁 Reports generated in current directory');
    
    // Show key insights
    if (results.composition.length > 0) {
      console.log('\n💡 Key Optimization Opportunities:');
      results.composition.slice(0, 3).forEach(insight => {
        console.log(`   • ${insight.chunk} (${insight.size}KB): ${insight.recommendation}`);
      });
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Error during webpack analysis:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  runWebpackAnalysis();
}

module.exports = {
  generateBundleAnalysisReport,
  analyzeBundleComposition,
  generateOptimizationGuide,
  runWebpackAnalysis
};