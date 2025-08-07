#!/usr/bin/env node

/**
 * Build Environment Detection Script
 * Automatically detects and sets the correct environment based on the git branch or Vercel environment
 */

import fs from 'fs';
import path from 'path';

function detectEnvironment() {
  // Check if we're on Vercel
  if (process.env.VERCEL) {
    // Use Vercel's branch detection
    const branch = process.env.VERCEL_GIT_COMMIT_REF;
    
    if (branch === 'main') {
      return 'production';
    } else if (branch === 'staging') {
      return 'staging';
    } else if (branch === 'develop') {
      return 'development';
    } else {
      // Feature branches default to development
      return 'development';
    }
  }
  
  // Local development or other CI
  const gitBranch = process.env.GITHUB_REF_NAME || process.env.CI_BRANCH || 'develop';
  
  if (gitBranch === 'main') {
    return 'production';
  } else if (gitBranch === 'staging') {
    return 'staging';
  } else {
    return 'development';
  }
}

function loadEnvironmentFile(env) {
  const envFile = path.join(process.cwd(), `.env.${env}`);
  
  if (!fs.existsSync(envFile)) {
    console.warn(`Warning: Environment file .env.${env} not found`);
    return {};
  }
  
  const content = fs.readFileSync(envFile, 'utf8');
  const envVars = {};
  
  content.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0 && !key.startsWith('#')) {
      const value = valueParts.join('=').trim();
      envVars[key.trim()] = value;
    }
  });
  
  return envVars;
}

function main() {
  const environment = detectEnvironment();
  console.log(`🔧 Detected environment: ${environment}`);
  
  // Load environment-specific variables
  const envVars = loadEnvironmentFile(environment);
  
  // Set environment variables for the build process
  Object.entries(envVars).forEach(([key, value]) => {
    if (!process.env[key]) { // Don't override existing env vars
      process.env[key] = value;
      console.log(`✅ Set ${key}=${value.substring(0, 20)}${value.length > 20 ? '...' : ''}`);
    }
  });
  
  // Ensure NEXT_PUBLIC_APP_ENV is set correctly
  process.env.NEXT_PUBLIC_APP_ENV = environment;
  console.log(`✅ Set NEXT_PUBLIC_APP_ENV=${environment}`);
  
  console.log(`🚀 Ready to build for ${environment} environment`);
}

// Run when called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { detectEnvironment, loadEnvironmentFile };