#!/usr/bin/env node

/**
 * Security Code Analyzer
 * Identifies potential security vulnerabilities in the codebase
 */

const fs = require('fs');
const path = require('path');

/**
 * Security vulnerability patterns to detect
 */
const SECURITY_PATTERNS = {
  // Hardcoded secrets/credentials
  hardcoded_secrets: {
    patterns: [
      /password\s*[:=]\s*["'][^"']*["']/gi,
      /api_key\s*[:=]\s*["'][^"']*["']/gi,
      /secret\s*[:=]\s*["'][^"']*["']/gi,
      /token\s*[:=]\s*["'][^"']*["']/gi,
      /private_key\s*[:=]\s*["'][^"']*["']/gi,
      /access_token\s*[:=]\s*["'][^"']*["']/gi,
    ],
    severity: 'high',
    message: 'Potential hardcoded secrets detected'
  },

  // SQL injection risks
  sql_injection: {
    patterns: [
      /\$\{[^}]*\}\s*(?:INTO|FROM|WHERE|UPDATE|DELETE|INSERT)/gi,
      /["'][^"']*\+[^"']*["']\s*(?:INTO|FROM|WHERE|UPDATE|DELETE|INSERT)/gi,
      /query\s*\(\s*["'][^"']*\+/gi,
    ],
    severity: 'high',
    message: 'Potential SQL injection vulnerability'
  },

  // XSS vulnerabilities
  xss_risks: {
    patterns: [
      /dangerouslySetInnerHTML/gi,
      /innerHTML\s*[:=]/gi,
      /document\.write\s*\(/gi,
      /eval\s*\(/gi,
    ],
    severity: 'medium',
    message: 'Potential XSS vulnerability'
  },

  // Insecure random number generation
  weak_random: {
    patterns: [
      /Math\.random\(\)/gi,
      /new Date\(\)\.getTime\(\)/gi,
    ],
    severity: 'medium',
    message: 'Weak random number generation for security purposes'
  },

  // Insecure HTTP usage
  insecure_http: {
    patterns: [
      /http:\/\/(?!localhost|127\.0\.0\.1)/gi,
      /fetch\s*\(\s*["']http:/gi,
    ],
    severity: 'medium',
    message: 'Insecure HTTP usage detected'
  },

  // Console logging sensitive data
  console_logging: {
    patterns: [
      /console\.log\([^)]*(?:password|token|secret|key|auth)/gi,
      /console\.(warn|error|info)\([^)]*(?:password|token|secret|key|auth)/gi,
    ],
    severity: 'low',
    message: 'Potential sensitive data logging'
  },

  // Unsafe object access
  prototype_pollution: {
    patterns: [
      /\[\s*["']__proto__["']\s*\]/gi,
      /\[\s*["']constructor["']\s*\]/gi,
      /\[\s*["']prototype["']\s*\]/gi,
    ],
    severity: 'high',
    message: 'Potential prototype pollution vulnerability'
  },

  // Buffer vulnerabilities
  buffer_overflow: {
    patterns: [
      /new Buffer\(/gi,
      /Buffer\.allocUnsafe\(/gi,
    ],
    severity: 'medium',
    message: 'Potentially unsafe buffer usage'
  }
};

/**
 * Analyze a file for security vulnerabilities
 */
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const vulnerabilities = [];

    for (const [type, config] of Object.entries(SECURITY_PATTERNS)) {
      for (const pattern of config.patterns) {
        let match;
        pattern.lastIndex = 0; // Reset regex state
        
        while ((match = pattern.exec(content)) !== null) {
          const lines = content.substring(0, match.index).split('\n');
          const lineNumber = lines.length;
          const lineContent = lines[lineNumber - 1]?.trim() || '';

          // Skip false positives
          if (shouldSkipMatch(match[0], lineContent, type)) {
            continue;
          }

          vulnerabilities.push({
            type,
            severity: config.severity,
            message: config.message,
            file: filePath,
            line: lineNumber,
            match: match[0],
            context: lineContent
          });
        }
      }
    }

    return vulnerabilities;
  } catch (error) {
    console.warn(`⚠️  Could not analyze ${filePath}: ${error.message}`);
    return [];
  }
}

/**
 * Skip false positives
 */
function shouldSkipMatch(match, lineContent, type) {
  // Skip comments
  if (lineContent.trim().startsWith('//') || lineContent.trim().startsWith('*')) {
    return true;
  }

  // Skip test files for certain patterns
  if (type === 'hardcoded_secrets' && lineContent.includes('test')) {
    return true;
  }

  // Skip environment variable examples
  if (type === 'hardcoded_secrets' && (
    lineContent.includes('process.env') ||
    lineContent.includes('example') ||
    lineContent.includes('placeholder')
  )) {
    return true;
  }

  // Skip localhost for insecure HTTP
  if (type === 'insecure_http' && (
    lineContent.includes('localhost') ||
    lineContent.includes('127.0.0.1')
  )) {
    return true;
  }

  return false;
}

/**
 * Scan directory for security vulnerabilities
 */
function scanDirectory(dir = 'src') {
  const vulnerabilities = [];
  
  function scanDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const itemPath = path.join(currentDir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other irrelevant directories
        if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(item)) {
          scanDir(itemPath);
        }
      } else if (stat.isFile()) {
        // Only analyze relevant file types
        const ext = path.extname(item);
        if (['.ts', '.tsx', '.js', '.jsx', '.json'].includes(ext)) {
          const fileVulns = analyzeFile(itemPath);
          vulnerabilities.push(...fileVulns);
        }
      }
    }
  }
  
  if (fs.existsSync(dir)) {
    scanDir(dir);
  }
  
  return vulnerabilities;
}

/**
 * Generate security report
 */
function generateSecurityReport() {
  console.log('🔒 Running Security Code Analysis...');
  console.log('🎯 Scanning for potential vulnerabilities...\n');

  const startTime = Date.now();
  const vulnerabilities = scanDirectory('src');
  
  // Also scan key config files
  const configFiles = [
    'next.config.js',
    'package.json',
    '.env.example',
    'docker-compose.yml'
  ].filter(file => fs.existsSync(file));
  
  for (const file of configFiles) {
    vulnerabilities.push(...analyzeFile(file));
  }

  // Categorize by severity
  const bySeverity = {
    high: vulnerabilities.filter(v => v.severity === 'high'),
    medium: vulnerabilities.filter(v => v.severity === 'medium'),
    low: vulnerabilities.filter(v => v.severity === 'low')
  };

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: vulnerabilities.length,
      high: bySeverity.high.length,
      medium: bySeverity.medium.length,
      low: bySeverity.low.length
    },
    vulnerabilities: bySeverity,
    recommendations: generateRecommendations(bySeverity)
  };

  // Save detailed report
  fs.writeFileSync('security-analysis-report.json', JSON.stringify(report, null, 2));

  // Console output
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log('🔒 Security Analysis Results:');
  console.log(`   📊 Total Issues: ${report.summary.total}`);
  console.log(`   🚨 High Severity: ${report.summary.high}`);
  console.log(`   ⚠️  Medium Severity: ${report.summary.medium}`);
  console.log(`   💡 Low Severity: ${report.summary.low}`);
  console.log(`   ⏱️  Completed in ${duration} seconds\n`);

  // Show high severity issues immediately
  if (bySeverity.high.length > 0) {
    console.log('🚨 HIGH SEVERITY ISSUES:');
    bySeverity.high.slice(0, 5).forEach(vuln => {
      console.log(`   📁 ${vuln.file}:${vuln.line}`);
      console.log(`   🔍 ${vuln.message}`);
      console.log(`   💾 ${vuln.context}`);
      console.log('');
    });
    if (bySeverity.high.length > 5) {
      console.log(`   ... and ${bySeverity.high.length - 5} more high severity issues`);
    }
    console.log('');
  }

  // Recommendations
  if (report.recommendations.length > 0) {
    console.log('💡 Security Recommendations:');
    report.recommendations.forEach(rec => console.log(`   - ${rec}`));
    console.log('');
  }

  console.log('📋 Detailed report saved to: security-analysis-report.json');
  
  return report;
}

/**
 * Generate security recommendations
 */
function generateRecommendations(bySeverity) {
  const recommendations = [];

  if (bySeverity.high.length > 0) {
    recommendations.push('Address all high-severity vulnerabilities immediately');
    
    const secretsCount = bySeverity.high.filter(v => v.type === 'hardcoded_secrets').length;
    if (secretsCount > 0) {
      recommendations.push('Move all secrets to environment variables');
      recommendations.push('Add .env files to .gitignore if not already present');
    }

    const sqlCount = bySeverity.high.filter(v => v.type === 'sql_injection').length;
    if (sqlCount > 0) {
      recommendations.push('Use parameterized queries or ORM methods');
    }

    const prototypeCount = bySeverity.high.filter(v => v.type === 'prototype_pollution').length;
    if (prototypeCount > 0) {
      recommendations.push('Validate and sanitize object property access');
    }
  }

  if (bySeverity.medium.length > 0) {
    const xssCount = bySeverity.medium.filter(v => v.type === 'xss_risks').length;
    if (xssCount > 0) {
      recommendations.push('Review all dangerouslySetInnerHTML usage and sanitize content');
    }

    const httpCount = bySeverity.medium.filter(v => v.type === 'insecure_http').length;
    if (httpCount > 0) {
      recommendations.push('Replace HTTP URLs with HTTPS equivalents');
    }

    const randomCount = bySeverity.medium.filter(v => v.type === 'weak_random').length;
    if (randomCount > 0) {
      recommendations.push('Use crypto.randomBytes() for cryptographic purposes');
    }
  }

  if (bySeverity.low.length > 0) {
    const loggingCount = bySeverity.low.filter(v => v.type === 'console_logging').length;
    if (loggingCount > 0) {
      recommendations.push('Remove console.log statements with sensitive data');
      recommendations.push('Use proper logging framework instead of console methods');
    }
  }

  // General recommendations
  recommendations.push('Run npm audit regularly to check for vulnerable dependencies');
  recommendations.push('Consider implementing Content Security Policy (CSP) headers');
  recommendations.push('Set up automated security scanning in CI/CD pipeline');

  return recommendations;
}

if (require.main === module) {
  generateSecurityReport();
}

module.exports = { 
  analyzeFile, 
  scanDirectory, 
  generateSecurityReport 
};