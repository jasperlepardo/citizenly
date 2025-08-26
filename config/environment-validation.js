/**
 * Production Environment Validation
 * Ensures all required environment variables and configurations are present
 */

const requiredEnvVars = {
  production: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ],
  staging: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ],
  development: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]
};

const securityChecks = {
  // Ensure secrets are not exposed in public env vars
  publicEnvSecurityCheck: () => {
    const publicEnvVars = Object.keys(process.env).filter(key => 
      key.startsWith('NEXT_PUBLIC_')
    );
    
    const dangerousPatterns = ['SECRET', 'KEY', 'TOKEN', 'PRIVATE'];
    const violations = publicEnvVars.filter(key =>
      dangerousPatterns.some(pattern => 
        key.toUpperCase().includes(pattern) && !key.includes('ANON')
      )
    );
    
    return {
      passed: violations.length === 0,
      violations,
      message: violations.length > 0 ? 
        `Public env vars contain sensitive data: ${violations.join(', ')}` : 
        'No sensitive data in public env vars'
    };
  },

  // Validate URL formats
  urlFormatCheck: () => {
    const urlVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXTAUTH_URL'];
    const violations = [];
    
    urlVars.forEach(varName => {
      const value = process.env[varName];
      if (value && !value.match(/^https?:\/\/.+/)) {
        violations.push(`${varName}: Invalid URL format`);
      }
    });
    
    return {
      passed: violations.length === 0,
      violations,
      message: violations.length > 0 ? 
        violations.join(', ') : 
        'All URLs have valid format'
    };
  },

  // Check for default/example values
  defaultValueCheck: () => {
    const dangerousDefaults = [
      'your-project-url',
      'your-anon-key',
      'your-service-role-key',
      'change-me',
      'example'
    ];
    
    const violations = [];
    Object.entries(process.env).forEach(([key, value]) => {
      if (value && dangerousDefaults.some(def => 
        value.toLowerCase().includes(def)
      )) {
        violations.push(`${key}: Contains default/example value`);
      }
    });
    
    return {
      passed: violations.length === 0,
      violations,
      message: violations.length > 0 ? 
        violations.join(', ') : 
        'No default values detected'
    };
  }
};

function validateEnvironment(environment = process.env.NODE_ENV || 'development') {
  console.log(`🔍 Validating ${environment} environment...`);
  
  const results = {
    environment,
    timestamp: new Date().toISOString(),
    passed: true,
    errors: [],
    warnings: [],
    info: []
  };
  
  // Check required environment variables
  const required = requiredEnvVars[environment] || requiredEnvVars.development;
  const missing = required.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    results.passed = false;
    results.errors.push(`Missing required environment variables: ${missing.join(', ')}`);
  } else {
    results.info.push(`All ${required.length} required environment variables present`);
  }
  
  // Run security checks
  Object.entries(securityChecks).forEach(([checkName, checkFn]) => {
    try {
      const result = checkFn();
      if (!result.passed) {
        if (checkName === 'publicEnvSecurityCheck') {
          results.passed = false;
          results.errors.push(`Security violation: ${result.message}`);
        } else {
          results.warnings.push(`${checkName}: ${result.message}`);
        }
      } else {
        results.info.push(`${checkName}: ${result.message}`);
      }
    } catch (error) {
      results.warnings.push(`${checkName}: Check failed - ${error.message}`);
    }
  });
  
  // Node.js version check
  const nodeVersion = process.version;
  const requiredNodeVersion = '20.0.0';
  if (nodeVersion < `v${requiredNodeVersion}`) {
    results.warnings.push(`Node.js ${nodeVersion} may not be compatible. Recommended: ${requiredNodeVersion}+`);
  } else {
    results.info.push(`Node.js ${nodeVersion} is compatible`);
  }
  
  return results;
}

function printResults(results) {
  console.log('\n📋 Environment Validation Results');
  console.log('================================');
  
  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    results.errors.forEach(error => console.log(`  • ${error}`));
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    results.warnings.forEach(warning => console.log(`  • ${warning}`));
  }
  
  if (results.info.length > 0) {
    console.log('\n✅ INFO:');
    results.info.forEach(info => console.log(`  • ${info}`));
  }
  
  console.log(`\n🎯 Overall Status: ${results.passed ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (!results.passed) {
    process.exit(1);
  }
}

// CLI usage
if (require.main === module) {
  const environment = process.argv[2] || process.env.NODE_ENV || 'development';
  const results = validateEnvironment(environment);
  printResults(results);
}

module.exports = { validateEnvironment, printResults };