#!/usr/bin/env node

/**
 * Bundle Size Analyzer
 *
 * Analyzes Next.js build output to identify:
 * - Large bundles and optimization opportunities
 * - Duplicate dependencies
 * - Unused code and dead code elimination opportunities
 * - Dynamic import opportunities
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BUNDLE_SIZE_LIMITS = {
  // Page bundles (First Load JS)
  page: 250, // KB
  // Shared chunks
  shared: 200, // KB
  // Static chunks
  static: 100, // KB
  // Total First Load JS
  totalFirstLoad: 300, // KB
};

const OPTIMIZATION_SUGGESTIONS = {
  largeBundle: {
    threshold: 200, // KB
    suggestions: [
      'Consider code splitting with dynamic imports',
      'Move large libraries to separate chunks',
      'Implement lazy loading for non-critical components',
      'Review and remove unused dependencies',
    ],
  },
  duplicateDeps: {
    suggestions: [
      'Use webpack-bundle-analyzer to identify duplicate packages',
      'Configure webpack externals for shared libraries',
      'Review package.json for multiple versions of same library',
    ],
  },
  unoptimizedImages: {
    suggestions: [
      'Use Next.js Image component for automatic optimization',
      'Convert images to WebP format',
      'Implement responsive images with srcset',
    ],
  },
};

class BundleAnalyzer {
  constructor() {
    this.buildDir = path.join(process.cwd(), '.next');
    this.results = {
      pages: [],
      chunks: [],
      warnings: [],
      recommendations: [],
    };
  }

  /**
   * Analyze the Next.js build output
   */
  async analyze() {
    console.log('🔍 Analyzing bundle size...\n');

    if (!fs.existsSync(this.buildDir)) {
      throw new Error('Build directory not found. Run "npm run build" first.');
    }

    // Parse build manifest
    await this.parseManifest();

    // Analyze page bundles
    await this.analyzePages();

    // Analyze chunk sizes
    await this.analyzeChunks();

    // Generate recommendations
    this.generateRecommendations();

    // Output results
    this.outputResults();
  }

  /**
   * Parse Next.js build manifest
   */
  async parseManifest() {
    try {
      const manifestPath = path.join(this.buildDir, 'build-manifest.json');
      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        this.manifest = manifest;
      }
    } catch (error) {
      console.warn('⚠️  Could not parse build manifest:', error.message);
    }
  }

  /**
   * Analyze page bundle sizes
   */
  async analyzePages() {
    const staticDir = path.join(this.buildDir, 'static');
    if (!fs.existsSync(staticDir)) return;

    const chunks = await this.findChunkFiles(staticDir);

    for (const chunk of chunks) {
      const stats = fs.statSync(chunk.path);
      const sizeKB = Math.round(stats.size / 1024);

      chunk.size = sizeKB;

      if (chunk.type === 'page' && sizeKB > BUNDLE_SIZE_LIMITS.page) {
        this.results.warnings.push({
          type: 'large_page_bundle',
          file: chunk.name,
          size: sizeKB,
          limit: BUNDLE_SIZE_LIMITS.page,
          message: `Page bundle ${chunk.name} (${sizeKB}KB) exceeds recommended limit (${BUNDLE_SIZE_LIMITS.page}KB)`,
        });
      }

      this.results.pages.push(chunk);
    }
  }

  /**
   * Find and categorize chunk files
   */
  async findChunkFiles(dir) {
    const chunks = [];

    const scanDirectory = (dirPath, relativePath = '') => {
      const files = fs.readdirSync(dirPath);

      for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const relativeFilePath = path.join(relativePath, file);

        if (fs.statSync(fullPath).isDirectory()) {
          scanDirectory(fullPath, relativeFilePath);
        } else if (file.endsWith('.js')) {
          const chunkType = this.categorizeChunk(relativeFilePath);
          chunks.push({
            name: relativeFilePath,
            path: fullPath,
            type: chunkType,
          });
        }
      }
    };

    scanDirectory(dir);
    return chunks;
  }

  /**
   * Categorize chunk files
   */
  categorizeChunk(filePath) {
    if (filePath.includes('/pages/')) return 'page';
    if (filePath.includes('/chunks/')) return 'chunk';
    if (filePath.includes('/_app-')) return 'app';
    if (filePath.includes('/_error-')) return 'error';
    if (filePath.includes('/main-')) return 'main';
    if (filePath.includes('/webpack-')) return 'webpack';
    return 'other';
  }

  /**
   * Analyze chunk sizes and dependencies
   */
  async analyzeChunks() {
    const nodeModulesChunks = this.results.pages.filter(
      chunk => chunk.name.includes('node_modules') || chunk.size > 100
    );

    this.results.chunks = nodeModulesChunks.sort((a, b) => b.size - a.size);
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    // Large bundle recommendations
    const largeBundles = this.results.pages.filter(
      page => page.size > OPTIMIZATION_SUGGESTIONS.largeBundle.threshold
    );

    if (largeBundles.length > 0) {
      recommendations.push({
        category: 'Bundle Size',
        priority: 'High',
        issue: `${largeBundles.length} large bundles detected`,
        suggestions: OPTIMIZATION_SUGGESTIONS.largeBundle.suggestions,
        files: largeBundles.map(b => `${b.name} (${b.size}KB)`),
      });
    }

    // Dynamic import opportunities
    const pageFiles = this.results.pages.filter(p => p.type === 'page');
    if (pageFiles.length > 10) {
      recommendations.push({
        category: 'Code Splitting',
        priority: 'Medium',
        issue: 'Many page bundles could benefit from lazy loading',
        suggestions: [
          'Implement dynamic imports for route-based code splitting',
          'Use React.lazy() for component-level code splitting',
          'Consider lazy loading heavy third-party libraries',
        ],
      });
    }

    // Bundle analysis recommendation
    recommendations.push({
      category: 'Analysis',
      priority: 'Low',
      issue: 'Consider detailed bundle analysis',
      suggestions: [
        'Run "npm run analyze" to generate detailed bundle report',
        'Use @next/bundle-analyzer for visual analysis',
        'Monitor bundle sizes in CI/CD pipeline',
      ],
    });

    this.results.recommendations = recommendations;
  }

  /**
   * Output analysis results
   */
  outputResults() {
    console.log('📊 Bundle Analysis Results\n');
    console.log('='.repeat(50));

    // Summary
    const totalSize = this.results.pages.reduce((sum, page) => sum + page.size, 0);
    const avgSize = totalSize / this.results.pages.length || 0;

    console.log('\n📈 Summary:');
    console.log(`   Total bundle size: ${totalSize}KB`);
    console.log(`   Average page size: ${Math.round(avgSize)}KB`);
    console.log(`   Total files analyzed: ${this.results.pages.length}`);

    // Warnings
    if (this.results.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.results.warnings.forEach(warning => {
        console.log(`   • ${warning.message}`);
      });
    }

    // Largest bundles
    console.log('\n📦 Largest Bundles:');
    const topBundles = this.results.pages.sort((a, b) => b.size - a.size).slice(0, 10);

    topBundles.forEach((bundle, index) => {
      const status = bundle.size > BUNDLE_SIZE_LIMITS.page ? '🔴' : '🟢';
      console.log(`   ${index + 1}. ${status} ${bundle.name}: ${bundle.size}KB`);
    });

    // Recommendations
    if (this.results.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      this.results.recommendations.forEach(rec => {
        console.log(`\n   ${rec.category} (${rec.priority} Priority):`);
        console.log(`   Issue: ${rec.issue}`);
        rec.suggestions.forEach(suggestion => {
          console.log(`   • ${suggestion}`);
        });
        if (rec.files) {
          console.log(`   Affected files:`);
          rec.files.slice(0, 5).forEach(file => {
            console.log(`     - ${file}`);
          });
        }
      });
    }

    // Next steps
    console.log('\n🚀 Next Steps:');
    console.log('   1. Run "npm run analyze" for detailed visual analysis');
    console.log('   2. Implement dynamic imports for large components');
    console.log('   3. Review and remove unused dependencies');
    console.log('   4. Set up bundle size monitoring in CI');

    console.log('\n' + '='.repeat(50));
  }

  /**
   * Save results to file
   */
  saveResults() {
    const outputPath = path.join(process.cwd(), 'bundle-analysis.json');
    fs.writeFileSync(outputPath, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Results saved to: ${outputPath}`);
  }
}

// CLI execution
if (require.main === module) {
  const analyzer = new BundleAnalyzer();

  analyzer
    .analyze()
    .then(() => {
      analyzer.saveResults();
      console.log('\n✅ Bundle analysis complete!');
    })
    .catch(error => {
      console.error('❌ Bundle analysis failed:', error.message);
      process.exit(1);
    });
}

module.exports = BundleAnalyzer;
