/**
 * Environment Configuration and Detection Utility
 * Provides environment-aware configuration for quality checks and tool settings
 */

export type Environment = 'development' | 'ci' | 'staging' | 'production';

export interface EnvironmentConfig {
  environment: Environment;
  isCI: boolean;
  isProduction: boolean;
  isStaging: boolean;
  isDevelopment: boolean;
  qualityTier: 1 | 2 | 3 | 4;
}

/**
 * Detect current environment based on environment variables
 */
export function detectEnvironment(): Environment {
  // CI/CD Environment
  if (process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true') {
    return 'ci';
  }

  // Vercel Production
  if (process.env.VERCEL_ENV === 'production') {
    return 'production';
  }

  // Vercel Preview/Staging
  if (process.env.VERCEL_ENV === 'preview') {
    return 'staging';
  }

  // Local Development (default)
  return 'development';
}

/**
 * Get environment configuration with quality tier mapping
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const environment = detectEnvironment();

  const config: EnvironmentConfig = {
    environment,
    isCI: environment === 'ci',
    isProduction: environment === 'production',
    isStaging: environment === 'staging',
    isDevelopment: environment === 'development',
    qualityTier: getQualityTier(environment),
  };

  return config;
}

/**
 * Map environment to quality check tier
 */
function getQualityTier(env: Environment): 1 | 2 | 3 | 4 {
  switch (env) {
    case 'development':
      return 1; // Fast & Essential
    case 'ci':
      return 2; // Comprehensive
    case 'staging':
      return 3; // Integration
    case 'production':
      return 4; // Critical
  }
}

/**
 * Quality check configuration per tier
 */
export const QUALITY_TIERS = {
  1: {
    // Development - Fast & Essential
    name: 'Development',
    description: 'Fast checks for immediate feedback',
    checks: ['lint:fast', 'type-check:fast', 'test:fast'],
    timeout: 30, // seconds
    parallel: true,
    failFast: false,
  },
  2: {
    // CI/CD - Comprehensive
    name: 'CI/CD',
    description: 'Comprehensive validation for pull requests',
    checks: ['lint', 'type-check', 'test:ci', 'security:scan', 'analyze:deps', 'bundle:check'],
    timeout: 300, // 5 minutes
    parallel: true,
    failFast: true,
  },
  3: {
    // Staging - Integration
    name: 'Staging',
    description: 'Integration testing and visual validation',
    checks: ['test:e2e', 'test:visual', 'test:lighthouse', 'test:a11y'],
    timeout: 600, // 10 minutes
    parallel: false,
    failFast: true,
  },
  4: {
    // Production - Critical
    name: 'Production',
    description: 'Critical validation before release',
    checks: ['security:audit', 'performance:benchmark', 'test:smoke', 'health:check'],
    timeout: 900, // 15 minutes
    parallel: false,
    failFast: true,
  },
} as const;

/**
 * Get quality checks for current environment
 */
export function getQualityChecks(): string[] {
  const { qualityTier } = getEnvironmentConfig();
  return [...QUALITY_TIERS[qualityTier].checks];
}

/**
 * Check if specific feature should be enabled in current environment
 */
export function shouldEnableFeature(feature: string): boolean {
  const { environment } = getEnvironmentConfig();

  const featureMap: Record<string, Environment[]> = {
    'strict-linting': ['ci', 'staging', 'production'],
    'visual-testing': ['ci', 'staging'],
    'performance-monitoring': ['staging', 'production'],
    'security-scanning': ['ci', 'staging', 'production'],
    'coverage-enforcement': ['ci'],
    'bundle-analysis': ['ci', 'staging', 'production'],
    'accessibility-testing': ['ci', 'staging', 'production'],
    'e2e-testing': ['staging', 'production'],
  };

  return featureMap[feature]?.includes(environment) ?? false;
}

/**
 * Get tool configuration based on environment
 */
export function getToolConfig(tool: string): Record<string, string | number | boolean> {
  const { environment } = getEnvironmentConfig();

  const toolConfigs: Record<
    string,
    Record<Environment, Record<string, string | number | boolean>>
  > = {
    eslint: {
      development: { maxWarnings: -1, cache: true, format: 'compact' },
      ci: { maxWarnings: 0, cache: false, format: 'json' },
      staging: { maxWarnings: 0, cache: false, format: 'compact' },
      production: { maxWarnings: 0, cache: false, format: 'compact' },
    },
    jest: {
      development: { coverage: false, maxWorkers: '50%', silent: true },
      ci: { coverage: true, maxWorkers: 2, ci: true },
      staging: { coverage: true, maxWorkers: 1, verbose: true },
      production: { coverage: false, maxWorkers: 1, testTimeout: 30000 },
    },
    typescript: {
      development: { skipLibCheck: true, incremental: true },
      ci: { skipLibCheck: false, incremental: false },
      staging: { skipLibCheck: false, incremental: false },
      production: { skipLibCheck: false, incremental: false },
    },
  };

  return toolConfigs[tool]?.[environment] ?? {};
}

/**
 * Log current environment configuration
 */
export function logEnvironmentInfo(): void {
  const config = getEnvironmentConfig();
  const tier = QUALITY_TIERS[config.qualityTier];

  console.log(`🔧 Environment: ${config.environment.toUpperCase()}`);
  console.log(`📊 Quality Tier: ${config.qualityTier} (${tier.name})`);
  console.log(`✅ Checks: ${tier.checks.join(', ')}`);
  console.log(`⏱️  Timeout: ${tier.timeout}s`);
  console.log(`⚡ Parallel: ${tier.parallel ? 'Yes' : 'No'}`);
}
