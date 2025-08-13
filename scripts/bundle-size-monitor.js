#!/usr/bin/env node

/**
 * Bundle Size Monitor
 * Tracks and analyzes Next.js bundle sizes for performance optimization
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Bundle size thresholds (in KB)
 */
const BUNDLE_THRESHOLDS = {
  // Page bundles
  page: {
    warning: 250,  // 250KB warning
    error: 500     // 500KB error
  },
  // Shared chunks
  shared: {
    warning: 100,  // 100KB warning
    error: 200     // 200KB error
  },
  // Framework bundles
  framework: {
    warning: 300,  // 300KB warning
    error: 600     // 600KB error
  },
  // Total JS bundle
  total: {
    warning: 1000, // 1MB warning
    error: 2000    // 2MB error
  }
};

/**
 * Parse Next.js build output for bundle sizes
 */
function parseBuildOutput(buildOutput) {
  const bundles = [];
  const lines = buildOutput.split('\n');
  
  let inBundleSection = false;
  
  for (const line of lines) {
    // Detect bundle analysis section
    if (line.includes('Route (pages)') || line.includes('└')) {
      inBundleSection = true;
      continue;
    }
    
    if (line.includes('+ First Load JS shared by all')) {
      inBundleSection = false;
      continue;
    }
    
    if (inBundleSection && line.trim()) {
      // Parse bundle information
      const match = line.match(/([○●◐]) (\/[^│]*?)?\s+([0-9.]+) kB\s+([0-9.]+) kB/);
      if (match) {
        const [, symbol, route, size, firstLoad] = match;
        bundles.push({
          symbol,
          route: route?.trim() || 'Unknown',
          size: parseFloat(size),
          firstLoad: parseFloat(firstLoad),
          type: determineRouteType(route)
        });
      }
    }
  }
  
  return bundles;
}

/**
 * Determine the type of route/bundle
 */
function determineRouteType(route) {
  if (!route) return 'unknown';
  
  if (route === '/') return 'homepage';
  if (route.includes('/api/')) return 'api';
  if (route.includes('/admin')) return 'admin';
  if (route.includes('/auth') || route.includes('/login') || route.includes('/signup')) return 'auth';
  if (route.includes('/dashboard')) return 'dashboard';
  if (route.includes('/_app')) return 'app';
  if (route.includes('/_document')) return 'document';
  if (route.includes('/_error')) return 'error';
  
  return 'page';
}

/**
 * Analyze bundle sizes and identify issues
 */
function analyzeBundleSizes(bundles) {
  const analysis = {
    total: 0,
    totalFirstLoad: 0,
    issues: [],
    recommendations: [],
    largestBundles: [],
    bundlesByType: {}
  };
  
  // Calculate totals and categorize
  for (const bundle of bundles) {
    analysis.total += bundle.size;
    analysis.totalFirstLoad += bundle.firstLoad;
    
    if (!analysis.bundlesByType[bundle.type]) {
      analysis.bundlesByType[bundle.type] = [];
    }
    analysis.bundlesByType[bundle.type].push(bundle);
  }
  
  // Sort by size
  analysis.largestBundles = bundles
    .sort((a, b) => b.firstLoad - a.firstLoad)
    .slice(0, 10);
  
  // Check thresholds
  for (const bundle of bundles) {
    const threshold = getThresholdForBundle(bundle);
    
    if (bundle.firstLoad > threshold.error) {
      analysis.issues.push({
        severity: 'error',
        bundle: bundle.route,
        size: bundle.firstLoad,
        threshold: threshold.error,
        message: `Bundle exceeds error threshold (${threshold.error}KB)`
      });
    } else if (bundle.firstLoad > threshold.warning) {
      analysis.issues.push({
        severity: 'warning',
        bundle: bundle.route,
        size: bundle.firstLoad,
        threshold: threshold.warning,
        message: `Bundle exceeds warning threshold (${threshold.warning}KB)`
      });
    }
  }
  
  // Check total bundle size
  if (analysis.totalFirstLoad > BUNDLE_THRESHOLDS.total.error) {
    analysis.issues.push({
      severity: 'error',
      bundle: 'Total Bundle',
      size: analysis.totalFirstLoad,
      threshold: BUNDLE_THRESHOLDS.total.error,
      message: `Total bundle size exceeds error threshold (${BUNDLE_THRESHOLDS.total.error}KB)`
    });
  } else if (analysis.totalFirstLoad > BUNDLE_THRESHOLDS.total.warning) {
    analysis.issues.push({
      severity: 'warning',
      bundle: 'Total Bundle',
      size: analysis.totalFirstLoad,
      threshold: BUNDLE_THRESHOLDS.total.warning,
      message: `Total bundle size exceeds warning threshold (${BUNDLE_THRESHOLDS.total.warning}KB)`
    });
  }
  
  // Generate recommendations
  analysis.recommendations = generateOptimizationRecommendations(analysis);
  
  return analysis;
}

/**
 * Get appropriate threshold for bundle type
 */
function getThresholdForBundle(bundle) {
  if (bundle.route?.includes('/_app') || bundle.route?.includes('framework')) {
    return BUNDLE_THRESHOLDS.framework;
  }
  
  if (bundle.type === 'shared' || bundle.route?.includes('chunks/')) {
    return BUNDLE_THRESHOLDS.shared;
  }
  
  return BUNDLE_THRESHOLDS.page;
}

/**
 * Generate optimization recommendations
 */
function generateOptimizationRecommendations(analysis) {
  const recommendations = [];
  
  // Check for large bundles
  const largeBundles = analysis.largestBundles.filter(b => b.firstLoad > 200);
  if (largeBundles.length > 0) {
    recommendations.push('Consider code splitting for large pages: ' + largeBundles.map(b => b.route).slice(0, 3).join(', '));
  }
  
  // Check for admin pages in main bundle
  const adminBundles = analysis.bundlesByType.admin || [];
  if (adminBundles.some(b => b.firstLoad > 100)) {
    recommendations.push('Move admin functionality to separate chunks with dynamic imports');
  }
  
  // Check for multiple auth pages
  const authBundles = analysis.bundlesByType.auth || [];
  if (authBundles.length > 2) {
    recommendations.push('Consider combining auth pages into a single route with client-side routing');
  }
  
  // General recommendations based on total size
  if (analysis.totalFirstLoad > 800) {
    recommendations.push('Implement tree shaking to remove unused code');
    recommendations.push('Consider using dynamic imports for heavy components');
    recommendations.push('Analyze and optimize third-party dependencies');
  }
  
  if (analysis.totalFirstLoad > 1200) {
    recommendations.push('Implement route-based code splitting');
    recommendations.push('Use Next.js dynamic imports with SSR: false for client-only components');
    recommendations.push('Consider lazy loading of images and components');
  }
  
  return recommendations;
}

/**
 * Run bundle analysis
 */
function runBundleAnalysis() {
  console.log('📦 Running Bundle Size Analysis...');
  console.log('🎯 Building and analyzing Next.js bundles...\n');

  const startTime = Date.now();
  
  try {
    // Build the application to get bundle info
    console.log('📋 Task 1: Building application...');
    const buildOutput = execSync('npm run build', { encoding: 'utf8', stdio: 'pipe' });
    console.log('   ✅ Build completed successfully');
    
    // Parse bundle information
    console.log('\n📋 Task 2: Parsing bundle information...');
    const bundles = parseBuildOutput(buildOutput);
    console.log(`   ✅ Found ${bundles.length} bundles to analyze`);
    
    // Analyze bundle sizes
    console.log('\n📋 Task 3: Analyzing bundle sizes...');
    const analysis = analyzeBundleSizes(bundles);
    console.log(`   ✅ Analysis complete - found ${analysis.issues.length} issues`);
    
    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalBundles: bundles.length,
        totalSize: Math.round(analysis.total),
        totalFirstLoad: Math.round(analysis.totalFirstLoad),
        issues: analysis.issues.length,
        errors: analysis.issues.filter(i => i.severity === 'error').length,
        warnings: analysis.issues.filter(i => i.severity === 'warning').length
      },
      bundles,
      analysis,
      thresholds: BUNDLE_THRESHOLDS,
      buildOutput
    };
    
    // Save report
    fs.writeFileSync('bundle-size-report.json', JSON.stringify(report, null, 2));
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    // Console output
    console.log('\n📦 Bundle Size Analysis Results:');
    console.log(`   📊 Total Bundles: ${report.summary.totalBundles}`);
    console.log(`   📏 Total Size: ${report.summary.totalSize}KB`);
    console.log(`   🚀 First Load: ${report.summary.totalFirstLoad}KB`);
    console.log(`   ⚠️  Issues: ${report.summary.issues} (${report.summary.errors} errors, ${report.summary.warnings} warnings)`);
    console.log(`   ⏱️  Completed in ${duration} seconds\n`);
    
    // Show largest bundles
    if (analysis.largestBundles.length > 0) {
      console.log('📋 Largest Bundles:');
      analysis.largestBundles.slice(0, 5).forEach((bundle, index) => {
        const status = bundle.firstLoad > getThresholdForBundle(bundle).warning ? '⚠️' : '✅';
        console.log(`   ${index + 1}. ${status} ${bundle.route} - ${bundle.firstLoad}KB`);
      });
      console.log('');
    }
    
    // Show issues
    if (analysis.issues.length > 0) {
      console.log('🚨 Bundle Size Issues:');
      analysis.issues.slice(0, 5).forEach(issue => {
        const icon = issue.severity === 'error' ? '❌' : '⚠️';
        console.log(`   ${icon} ${issue.bundle}: ${issue.size}KB (threshold: ${issue.threshold}KB)`);
      });
      if (analysis.issues.length > 5) {
        console.log(`   ... and ${analysis.issues.length - 5} more issues`);
      }
      console.log('');
    }
    
    // Show recommendations
    if (analysis.recommendations.length > 0) {
      console.log('💡 Optimization Recommendations:');
      analysis.recommendations.slice(0, 5).forEach(rec => console.log(`   - ${rec}`));
      if (analysis.recommendations.length > 5) {
        console.log(`   ... and ${analysis.recommendations.length - 5} more recommendations`);
      }
      console.log('');
    }
    
    console.log('📋 Detailed report saved to: bundle-size-report.json');
    
    return report;
    
  } catch (error) {
    console.error('❌ Error during bundle analysis:', error.message);
    
    // Check if it's a build error
    if (error.message.includes('Build failed')) {
      console.log('\n💡 Build failed. Common solutions:');
      console.log('   - Fix TypeScript errors: npm run type-check');
      console.log('   - Fix linting errors: npm run lint:fix');
      console.log('   - Check for missing dependencies');
    }
    
    process.exit(1);
  }
}

/**
 * Monitor bundle size changes
 */
function compareBundleSizes(previousReport) {
  if (!fs.existsSync('bundle-size-report.json')) {
    console.log('📦 No previous bundle report found for comparison');
    return null;
  }
  
  try {
    const previous = JSON.parse(fs.readFileSync('bundle-size-report.json', 'utf8'));
    
    const comparison = {
      sizeDelta: previousReport.summary.totalFirstLoad - previous.summary.totalFirstLoad,
      bundlesDelta: previousReport.summary.totalBundles - previous.summary.totalBundles,
      changes: []
    };
    
    console.log('\n📊 Bundle Size Comparison:');
    if (comparison.sizeDelta > 0) {
      console.log(`   📈 Total size increased by ${Math.round(comparison.sizeDelta)}KB`);
    } else if (comparison.sizeDelta < 0) {
      console.log(`   📉 Total size decreased by ${Math.round(Math.abs(comparison.sizeDelta))}KB`);
    } else {
      console.log(`   ➡️  Total size unchanged`);
    }
    
    return comparison;
    
  } catch (error) {
    console.warn('⚠️  Could not compare with previous report:', error.message);
    return null;
  }
}

if (require.main === module) {
  runBundleAnalysis();
}

module.exports = { 
  runBundleAnalysis,
  parseBuildOutput,
  analyzeBundleSizes,
  compareBundleSizes
};