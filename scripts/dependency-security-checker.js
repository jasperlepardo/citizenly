#!/usr/bin/env node

/**
 * Dependency Security Checker
 * Analyzes npm dependencies for known vulnerabilities and security issues
 */

const fs = require('fs');
const { execSync } = require('child_process');

/**
 * Check npm audit for vulnerabilities
 */
function checkNpmAudit() {
  console.log('🔍 Running npm audit...');
  
  try {
    const auditOutput = execSync('npm audit --json', { encoding: 'utf8' });
    const auditData = JSON.parse(auditOutput);
    
    return {
      success: true,
      vulnerabilities: auditData.vulnerabilities || {},
      metadata: auditData.metadata || {}
    };
  } catch (error) {
    // npm audit returns non-zero exit code when vulnerabilities are found
    try {
      const auditData = JSON.parse(error.stdout);
      return {
        success: false,
        vulnerabilities: auditData.vulnerabilities || {},
        metadata: auditData.metadata || {},
        error: 'Vulnerabilities found'
      };
    } catch (parseError) {
      return {
        success: false,
        error: `Failed to run npm audit: ${error.message}`,
        vulnerabilities: {},
        metadata: {}
      };
    }
  }
}

/**
 * Analyze package.json for security best practices
 */
function analyzePackageJson() {
  const issues = [];
  
  if (!fs.existsSync('package.json')) {
    return [{ severity: 'high', message: 'package.json not found' }];
  }
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Check for overly permissive version ranges
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  for (const [pkg, version] of Object.entries(dependencies)) {
    // Check for dangerous version patterns
    if (version.includes('*') || version.includes('x')) {
      issues.push({
        severity: 'medium',
        message: `Overly permissive version range for ${pkg}: ${version}`,
        recommendation: 'Use specific version ranges to avoid unexpected updates'
      });
    }
    
    if (version.startsWith('^') && pkg.includes('crypto')) {
      issues.push({
        severity: 'low',
        message: `Consider pinning security-related package ${pkg}`,
        recommendation: 'Use exact versions for cryptographic dependencies'
      });
    }
  }
  
  // Check for missing security fields
  if (!packageJson.private && !packageJson.files) {
    issues.push({
      severity: 'medium',
      message: 'Public package missing "files" field',
      recommendation: 'Specify which files to include when publishing'
    });
  }
  
  return issues;
}

/**
 * Check for known vulnerable packages
 */
function checkKnownVulnerablePackages() {
  const vulnerablePackages = [
    'node-sass', // Deprecated, use sass instead
    'request', // Deprecated
    'lodash', // Check for specific vulnerable versions
    'moment', // Consider date-fns or dayjs
    'axios', // Check for SSRF vulnerabilities in older versions
  ];
  
  const issues = [];
  
  if (!fs.existsSync('package.json')) {
    return issues;
  }
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  for (const pkg of vulnerablePackages) {
    if (dependencies[pkg]) {
      let severity = 'medium';
      let recommendation = `Consider alternatives to ${pkg}`;
      
      if (pkg === 'node-sass') {
        severity = 'low';
        recommendation = 'Migrate from node-sass to sass (Dart Sass)';
      } else if (pkg === 'request') {
        severity = 'medium';
        recommendation = 'Replace request with axios, fetch, or got';
      }
      
      issues.push({
        severity,
        message: `Using potentially problematic package: ${pkg}`,
        recommendation
      });
    }
  }
  
  return issues;
}

/**
 * Check for dependency confusion risks
 */
function checkDependencyConfusion() {
  const issues = [];
  
  if (!fs.existsSync('package.json')) {
    return issues;
  }
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  // Look for suspicious package names
  const suspiciousPatterns = [
    /^[a-z]+$/i, // Single word packages (higher risk)
    /test|demo|example/i, // Test packages
    /temp|tmp/i, // Temporary packages
  ];
  
  for (const [pkg, version] of Object.entries(dependencies)) {
    // Check for very new packages (potential typosquatting)
    if (pkg.length < 3) {
      issues.push({
        severity: 'low',
        message: `Very short package name: ${pkg}`,
        recommendation: 'Verify this is the intended package'
      });
    }
    
    // Check for packages with suspicious names
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(pkg) && !isWellKnownPackage(pkg)) {
        issues.push({
          severity: 'low',
          message: `Potentially suspicious package name: ${pkg}`,
          recommendation: 'Verify package authenticity and popularity'
        });
        break;
      }
    }
  }
  
  return issues;
}

/**
 * Check if package is well-known/trusted
 */
function isWellKnownPackage(pkg) {
  const wellKnownPackages = [
    'react', 'vue', 'angular', 'next', 'express', 'lodash',
    'axios', 'moment', 'jest', 'webpack', 'babel', 'eslint',
    'typescript', 'sass', 'uuid', 'cors', 'helmet', 'bcrypt'
  ];
  
  return wellKnownPackages.includes(pkg);
}

/**
 * Generate dependency security report
 */
function generateDependencySecurityReport() {
  console.log('🔒 Running Dependency Security Analysis...');
  console.log('🎯 Checking for vulnerable dependencies and security issues...\n');

  const startTime = Date.now();
  const report = {
    timestamp: new Date().toISOString(),
    audit: {},
    packageIssues: [],
    vulnerablePackages: [],
    dependencyConfusion: [],
    summary: {
      criticalVulns: 0,
      highVulns: 0,
      moderateVulns: 0,
      lowVulns: 0,
      totalIssues: 0
    },
    recommendations: []
  };

  // 1. Run npm audit
  console.log('📋 Task 1: Running npm audit...');
  const auditResult = checkNpmAudit();
  report.audit = auditResult;
  
  if (auditResult.metadata && auditResult.metadata.vulnerabilities) {
    const vulns = auditResult.metadata.vulnerabilities;
    report.summary.criticalVulns = vulns.critical || 0;
    report.summary.highVulns = vulns.high || 0;
    report.summary.moderateVulns = vulns.moderate || 0;
    report.summary.lowVulns = vulns.low || 0;
  }
  
  console.log(`   ✅ npm audit completed`);
  if (!auditResult.success) {
    console.log(`   ⚠️  Found vulnerabilities: ${JSON.stringify(report.summary)}`);
  }

  // 2. Analyze package.json
  console.log('\n📋 Task 2: Analyzing package.json security...');
  report.packageIssues = analyzePackageJson();
  console.log(`   ✅ Found ${report.packageIssues.length} package configuration issues`);

  // 3. Check for known vulnerable packages
  console.log('\n📋 Task 3: Checking for known vulnerable packages...');
  report.vulnerablePackages = checkKnownVulnerablePackages();
  console.log(`   ✅ Found ${report.vulnerablePackages.length} potentially problematic packages`);

  // 4. Check for dependency confusion risks
  console.log('\n📋 Task 4: Checking for dependency confusion risks...');
  report.dependencyConfusion = checkDependencyConfusion();
  console.log(`   ✅ Found ${report.dependencyConfusion.length} potential dependency confusion risks`);

  // Calculate total issues
  report.summary.totalIssues = 
    report.summary.criticalVulns + 
    report.summary.highVulns + 
    report.summary.moderateVulns + 
    report.summary.lowVulns +
    report.packageIssues.length +
    report.vulnerablePackages.length +
    report.dependencyConfusion.length;

  // Generate recommendations
  report.recommendations = generateDependencyRecommendations(report);

  // Save report
  fs.writeFileSync('dependency-security-report.json', JSON.stringify(report, null, 2));

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  
  // Console output
  console.log('\n🔒 Dependency Security Analysis Results:');
  console.log(`   📊 Total Issues: ${report.summary.totalIssues}`);
  console.log(`   🚨 Critical: ${report.summary.criticalVulns}`);
  console.log(`   ⚠️  High: ${report.summary.highVulns}`);
  console.log(`   💛 Moderate: ${report.summary.moderateVulns}`);
  console.log(`   💡 Low: ${report.summary.lowVulns}`);
  console.log(`   ⏱️  Completed in ${duration} seconds\n`);

  // Show critical/high vulnerabilities
  if (report.summary.criticalVulns > 0 || report.summary.highVulns > 0) {
    console.log('🚨 HIGH PRIORITY VULNERABILITIES DETECTED!');
    console.log('   Run "npm audit fix" to attempt automatic fixes');
    console.log('   Review dependency-security-report.json for details\n');
  }

  // Show recommendations
  if (report.recommendations.length > 0) {
    console.log('💡 Security Recommendations:');
    report.recommendations.slice(0, 5).forEach(rec => console.log(`   - ${rec}`));
    if (report.recommendations.length > 5) {
      console.log(`   ... and ${report.recommendations.length - 5} more recommendations`);
    }
    console.log('');
  }

  console.log('📋 Detailed report saved to: dependency-security-report.json');
  
  return report;
}

/**
 * Generate dependency security recommendations
 */
function generateDependencyRecommendations(report) {
  const recommendations = [];

  if (report.summary.criticalVulns > 0) {
    recommendations.push('URGENT: Fix critical vulnerabilities with "npm audit fix --force"');
    recommendations.push('Review breaking changes after forced updates');
  }

  if (report.summary.highVulns > 0) {
    recommendations.push('Fix high severity vulnerabilities immediately');
  }

  if (report.summary.moderateVulns > 0) {
    recommendations.push('Schedule updates for moderate severity vulnerabilities');
  }

  if (report.vulnerablePackages.length > 0) {
    recommendations.push('Replace deprecated/vulnerable packages with modern alternatives');
  }

  if (report.packageIssues.length > 0) {
    recommendations.push('Tighten version ranges in package.json');
    recommendations.push('Pin versions for security-critical dependencies');
  }

  if (report.dependencyConfusion.length > 0) {
    recommendations.push('Verify authenticity of packages with suspicious names');
  }

  // General recommendations
  recommendations.push('Run "npm audit" regularly as part of CI/CD pipeline');
  recommendations.push('Consider using "npm ci" in production for reproducible builds');
  recommendations.push('Enable GitHub Dependabot for automatic security updates');
  recommendations.push('Use package-lock.json to ensure consistent dependency versions');
  recommendations.push('Regularly update dependencies to latest stable versions');

  return recommendations;
}

if (require.main === module) {
  generateDependencySecurityReport();
}

module.exports = { 
  checkNpmAudit,
  analyzePackageJson,
  checkKnownVulnerablePackages,
  generateDependencySecurityReport 
};