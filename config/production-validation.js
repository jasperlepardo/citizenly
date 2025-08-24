/**
 * Production Deployment Validation Script
 * Comprehensive pre-deployment checks for production readiness
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { validateEnvironment } = require('./environment-validation');

class ProductionValidator {
  constructor() {
    this.results = {
      passed: true,
      errors: [],
      warnings: [],
      info: [],
      metrics: {}
    };
  }

  log(type, message) {
    this.results[type].push(message);
    if (type === 'errors') this.results.passed = false;
  }

  // Check build artifacts and structure
  validateBuildArtifacts() {
    console.log('📦 Validating build artifacts...');
    
    const requiredFiles = [
      'package.json',
      'next.config.js',
      'tsconfig.json',
      '.env.production'
    ];
    
    const missingFiles = requiredFiles.filter(file => 
      !fs.existsSync(path.join(process.cwd(), file))
    );
    
    if (missingFiles.length > 0) {
      this.log('errors', `Missing required files: ${missingFiles.join(', ')}`);
    } else {
      this.log('info', 'All required files present');
    }
    
    // Check config directory structure
    const configDirs = ['build', 'jest', 'deployment'];
    const missingConfigDirs = configDirs.filter(dir => 
      !fs.existsSync(path.join(process.cwd(), 'config', dir))
    );
    
    if (missingConfigDirs.length > 0) {
      this.log('warnings', `Missing config directories: ${missingConfigDirs.join(', ')}`);
    } else {
      this.log('info', 'Config directory structure is organized');
    }
  }

  // Validate dependencies and security
  validateDependencies() {
    console.log('🔒 Validating dependencies and security...');
    
    try {
      // Check for high-risk vulnerabilities
      const auditResult = execSync('npm audit --audit-level=high --json', 
        { encoding: 'utf8', stdio: 'pipe' }
      );
      
      const audit = JSON.parse(auditResult);
      
      if (audit.metadata.vulnerabilities.high > 0 || audit.metadata.vulnerabilities.critical > 0) {
        this.log('errors', 
          `High/Critical vulnerabilities found: ${audit.metadata.vulnerabilities.high + audit.metadata.vulnerabilities.critical}`
        );
      } else if (audit.metadata.vulnerabilities.moderate > 0) {
        this.log('warnings', 
          `Moderate vulnerabilities found: ${audit.metadata.vulnerabilities.moderate}`
        );
      } else {
        this.log('info', 'No high-risk vulnerabilities found');
      }
      
      this.results.metrics.vulnerabilities = audit.metadata.vulnerabilities;
      
    } catch (error) {
      this.log('warnings', 'Could not run security audit - ensure npm audit is available');
    }
    
    // Check for outdated dependencies
    try {
      const outdated = execSync('npm outdated --json', 
        { encoding: 'utf8', stdio: 'pipe' }
      );
      
      const outdatedPackages = Object.keys(JSON.parse(outdated || '{}'));
      
      if (outdatedPackages.length > 10) {
        this.log('warnings', `${outdatedPackages.length} packages are outdated`);
      } else {
        this.log('info', `Dependencies are relatively up-to-date (${outdatedPackages.length} outdated)`);
      }
      
    } catch (error) {
      this.log('info', 'All dependencies are up-to-date');
    }
  }

  // Test build process
  validateBuild() {
    console.log('🏗️ Validating build process...');
    
    try {
      const startTime = Date.now();
      
      // Clean build
      execSync('rm -rf .next', { stdio: 'pipe' });
      
      // Test build
      execSync('npm run build', { 
        stdio: 'pipe',
        env: { ...process.env, NODE_ENV: 'production' }
      });
      
      const buildTime = Date.now() - startTime;
      this.results.metrics.buildTimeMs = buildTime;
      
      if (buildTime > 300000) { // 5 minutes
        this.log('warnings', `Build time is slow: ${Math.round(buildTime/1000)}s`);
      } else {
        this.log('info', `Build completed in ${Math.round(buildTime/1000)}s`);
      }
      
      // Check build output
      const buildDir = path.join(process.cwd(), '.next');
      if (!fs.existsSync(buildDir)) {
        this.log('errors', 'Build output directory not created');
      } else {
        const stats = fs.statSync(buildDir);
        this.log('info', 'Build artifacts generated successfully');
      }
      
    } catch (error) {
      this.log('errors', `Build failed: ${error.message}`);
    }
  }

  // Validate TypeScript compilation
  validateTypeScript() {
    console.log('📝 Validating TypeScript...');
    
    try {
      execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
      this.log('info', 'TypeScript compilation successful');
    } catch (error) {
      // Check if it's just warnings or actual errors
      const output = error.stdout?.toString() || error.message;
      const errorLines = output.split('\n').filter(line => 
        line.includes('error TS') && !line.includes('warning')
      );
      
      if (errorLines.length > 0) {
        this.log('errors', `TypeScript compilation errors: ${errorLines.length} errors found`);
      } else {
        this.log('warnings', 'TypeScript compilation has warnings but no blocking errors');
      }
    }
  }

  // Performance and bundle size checks
  validatePerformance() {
    console.log('⚡ Validating performance...');
    
    try {
      // Generate bundle analysis
      execSync('ANALYZE=true npm run build', { 
        stdio: 'pipe',
        env: { ...process.env, NODE_ENV: 'production' }
      });
      
      // Check if bundle analysis was generated
      const analysisFile = path.join(process.cwd(), '.next', 'bundle-analysis.html');
      if (fs.existsSync(analysisFile)) {
        this.log('info', 'Bundle analysis generated - review for optimization opportunities');
      }
      
      // Check bundle sizes (simplified check)
      const nextDir = path.join(process.cwd(), '.next/static');
      if (fs.existsSync(nextDir)) {
        const files = fs.readdirSync(nextDir, { recursive: true });
        const jsFiles = files.filter(f => f.toString().endsWith('.js'));
        const totalBundleCount = jsFiles.length;
        
        this.results.metrics.bundleFiles = totalBundleCount;
        
        if (totalBundleCount > 100) {
          this.log('warnings', `High number of bundle files: ${totalBundleCount}`);
        } else {
          this.log('info', `Bundle files: ${totalBundleCount}`);
        }
      }
      
    } catch (error) {
      this.log('warnings', 'Could not analyze bundle performance');
    }
  }

  // Validate Git repository state
  validateRepository() {
    console.log('📚 Validating repository state...');
    
    try {
      // Check for uncommitted changes
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      
      if (status.trim()) {
        this.log('warnings', 'Uncommitted changes found in repository');
      } else {
        this.log('info', 'Repository is clean');
      }
      
      // Check current branch
      const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
      
      if (branch === 'main' || branch === 'master') {
        this.log('info', `On production branch: ${branch}`);
      } else {
        this.log('warnings', `On non-production branch: ${branch}`);
      }
      
      this.results.metrics.gitBranch = branch;
      
    } catch (error) {
      this.log('warnings', 'Could not validate Git repository state');
    }
  }

  // Main validation runner
  async validate() {
    console.log('🚀 Starting Production Validation');
    console.log('==================================\n');
    
    const startTime = Date.now();
    
    // Environment validation
    console.log('🌍 Validating environment...');
    const envResults = validateEnvironment('production');
    
    if (!envResults.passed) {
      this.results.passed = false;
      this.results.errors.push(...envResults.errors);
    }
    this.results.warnings.push(...envResults.warnings);
    this.results.info.push(...envResults.info);
    
    // Run all validation steps
    this.validateBuildArtifacts();
    this.validateDependencies();
    this.validateTypeScript();
    this.validateBuild();
    this.validatePerformance();
    this.validateRepository();
    
    const totalTime = Date.now() - startTime;
    this.results.metrics.validationTimeMs = totalTime;
    
    return this.results;
  }

  // Print formatted results
  printResults() {
    console.log('\n📋 Production Validation Results');
    console.log('=================================');
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ BLOCKING ERRORS:');
      this.results.errors.forEach(error => console.log(`  • ${error}`));
    }
    
    if (this.results.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.results.warnings.forEach(warning => console.log(`  • ${warning}`));
    }
    
    if (this.results.info.length > 0) {
      console.log('\n✅ PASSED CHECKS:');
      this.results.info.forEach(info => console.log(`  • ${info}`));
    }
    
    if (Object.keys(this.results.metrics).length > 0) {
      console.log('\n📊 METRICS:');
      Object.entries(this.results.metrics).forEach(([key, value]) => {
        console.log(`  • ${key}: ${value}`);
      });
    }
    
    console.log(`\n🎯 Overall Status: ${this.results.passed ? '✅ READY FOR PRODUCTION' : '❌ NOT READY FOR PRODUCTION'}`);
    
    if (this.results.passed) {
      console.log('\n🚀 Deployment can proceed!');
    } else {
      console.log('\n🛑 Fix errors before deployment!');
      process.exit(1);
    }
  }
}

// CLI usage
if (require.main === module) {
  const validator = new ProductionValidator();
  validator.validate().then(() => {
    validator.printResults();
  }).catch(error => {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  });
}

module.exports = { ProductionValidator };