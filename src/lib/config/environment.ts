/**
 * Environment Detection and Configuration
 * Centralized environment management for the RBI System
 */

export type Environment = 'development' | 'staging' | 'production' | 'test';

/**
 * Get current environment
 */
export const getEnvironment = (): Environment => {
  const env = process.env.NEXT_PUBLIC_APP_ENV as Environment;

  // Fallback logic
  if (!env) {
    if (process.env.NODE_ENV === 'test') return 'test';
    if (process.env.NODE_ENV === 'production') return 'production';
    return 'development';
  }

  return env;
};

/**
 * Environment checks
 */
export const isDevelopment = () => getEnvironment() === 'development';
export const isStaging = () => getEnvironment() === 'staging';
export const isProduction = () => getEnvironment() === 'production';
export const isTest = () => getEnvironment() === 'test';

/**
 * Check if we're in a production-like environment
 */
export const isProductionLike = () => isProduction() || isStaging();

/**
 * Check if debug features should be enabled
 */
export const isDebugEnabled = () => {
  return process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true' || isDevelopment();
};

/**
 * Get environment-specific configuration
 */
export const getEnvironmentConfig = () => {
  const env = getEnvironment();

  return {
    environment: env,
    appName: process.env.NEXT_PUBLIC_APP_NAME || 'RBI System',
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',

    // Feature flags
    features: {
      debug: isDebugEnabled(),
      storybook: process.env.NEXT_PUBLIC_ENABLE_STORYBOOK === 'true',
      mockData: process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true',
    },

    // API settings
    api: {
      timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
      rateLimitEnabled: process.env.NEXT_PUBLIC_RATE_LIMIT_ENABLED === 'true',
    },

    // Database settings
    database: {
      enableRealtime: isProductionLike(),
      enableSchemaValidation: !isProduction(),
    },
  };
};

/**
 * Get Supabase configuration for current environment
 */
export const getSupabaseConfig = () => {
  const config = getEnvironmentConfig();

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',

    // Environment-specific Supabase options
    options: {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        flowType: 'pkce' as const,
        debug: isDebugEnabled(),
        // Force session refresh on page load
        storageKey: `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] || 'default'}-auth-token`,
      },

      db: {
        schema: 'public',
      },

      // Realtime settings for production
      realtime: config.database.enableRealtime
        ? {
            params: {
              eventsPerSecond: 10,
            },
          }
        : undefined,

      global: {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': isProduction() ? 'public, max-age=3600' : 'no-cache',
          Pragma: isProduction() ? 'cache' : 'no-cache',
          'X-Environment': config.environment,
          'X-Client-Info': 'rbi-system-client',
        },
      },
    },
  };
};

/**
 * Environment-specific logging
 */
export const createLogger = (module: string) => {
  const config = getEnvironmentConfig();
  const timestamp = () => new Date().toISOString();

  return {
    debug: (...args: unknown[]) => {
      if (config.features.debug) {
        console.log(`[${timestamp()}][${config.environment.toUpperCase()}][${module}]`, ...args);
      }
    },

    info: (...args: unknown[]) => {
      console.info(`[${timestamp()}][${config.environment.toUpperCase()}][${module}]`, ...args);
    },

    warn: (...args: unknown[]) => {
      console.warn(`[${timestamp()}][${config.environment.toUpperCase()}][${module}]`, ...args);
    },

    error: (...args: unknown[]) => {
      console.error(`[${timestamp()}][${config.environment.toUpperCase()}][${module}]`, ...args);
    },
  };
};

/**
 * Enhanced environment validation with production readiness checks
 */
export const validateEnvironment = () => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const config = getEnvironmentConfig();

  // Core required variables for all environments
  const requiredVars = [
    { name: 'NEXT_PUBLIC_SUPABASE_URL', value: process.env.NEXT_PUBLIC_SUPABASE_URL },
    { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', value: process.env.SUPABASE_SERVICE_ROLE_KEY },
  ];

  // Check required variables
  requiredVars.forEach(({ name, value }) => {
    if (!value || value.includes('placeholder') || value.trim() === '') {
      errors.push(`${name} is required and must be properly configured`);
    }
  });

  // Production-specific checks
  if (isProduction()) {
    const productionRequiredVars = [
      { name: 'NEXTAUTH_SECRET', value: process.env.NEXTAUTH_SECRET },
      { name: 'NEXT_PUBLIC_APP_URL', value: process.env.NEXT_PUBLIC_APP_URL },
    ];

    productionRequiredVars.forEach(({ name, value }) => {
      if (!value || value.trim() === '') {
        errors.push(`${name} is required for production environment`);
      }
    });

    // Security checks for production
    if (process.env.NODE_ENV !== 'production') {
      warnings.push('NODE_ENV should be "production" in production environment');
    }

    // URL validation
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
        if (url.protocol !== 'https:') {
          errors.push('SUPABASE_URL must use HTTPS in production');
        }
        if (!url.hostname.includes('supabase')) {
          warnings.push('SUPABASE_URL does not appear to be a Supabase URL');
        }
      } catch {
        errors.push('NEXT_PUBLIC_SUPABASE_URL is not a valid URL');
      }
    }

    // Key length validation
    if (
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length < 100
    ) {
      warnings.push('SUPABASE_ANON_KEY appears to be too short');
    }

    if (
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY.length < 100
    ) {
      warnings.push('SUPABASE_SERVICE_ROLE_KEY appears to be too short');
    }

    if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
      errors.push('NEXTAUTH_SECRET must be at least 32 characters long');
    }

    // Optional but recommended for production
    const recommendedVars = [
      { name: 'SENTRY_DSN', purpose: 'Error monitoring' },
      { name: 'REDIS_URL', purpose: 'Caching and sessions' },
    ];

    recommendedVars.forEach(({ name, purpose }) => {
      if (!process.env[name]) {
        warnings.push(`${name} is not configured - ${purpose} will be limited`);
      }
    });
  }

  // Development warnings
  if (isDevelopment()) {
    if (!process.env.NEXTAUTH_SECRET) {
      warnings.push('NEXTAUTH_SECRET should be set even in development for consistent behavior');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config,
    environment: getEnvironment(),
    checks: {
      hasDatabase:
        !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder'),
      hasAuth: !!process.env.NEXTAUTH_SECRET,
      hasMonitoring: !!process.env.SENTRY_DSN,
      hasCaching: !!process.env.REDIS_URL,
      isSecure: isProduction()
        ? (process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://') ?? false)
        : true,
    },
  };
};

/**
 * Runtime health check for production
 */
export const performRuntimeHealthCheck = async (): Promise<{
  healthy: boolean;
  checks: Record<string, { status: 'pass' | 'fail' | 'warn'; message: string }>;
}> => {
  const checks: Record<string, { status: 'pass' | 'fail' | 'warn'; message: string }> = {};

  // Environment validation
  const envValidation = validateEnvironment();
  checks.environment = {
    status: envValidation.isValid ? 'pass' : 'fail',
    message: envValidation.isValid
      ? `Environment configured for ${envValidation.environment}`
      : `Environment issues: ${envValidation.errors.join(', ')}`,
  };

  // Database connectivity (if we can test it)
  if (
    typeof window === 'undefined' &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    try {
      // Simple connectivity check
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      });

      checks.database = {
        status: response.ok ? 'pass' : 'fail',
        message: response.ok
          ? 'Database connection successful'
          : `Database connection failed: ${response.status}`,
      };
    } catch (error) {
      checks.database = {
        status: 'fail',
        message: `Database connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  // Memory usage check
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const memory = process.memoryUsage();
    const heapUsedMB = memory.heapUsed / 1024 / 1024;
    const heapTotalMB = memory.heapTotal / 1024 / 1024;
    const usagePercent = (heapUsedMB / heapTotalMB) * 100;

    checks.memory = {
      status: usagePercent > 90 ? 'fail' : usagePercent > 70 ? 'warn' : 'pass',
      message: `Heap usage: ${heapUsedMB.toFixed(1)}MB / ${heapTotalMB.toFixed(1)}MB (${usagePercent.toFixed(1)}%)`,
    };
  }

  const healthy = Object.values(checks).every(check => check.status !== 'fail');

  return {
    healthy,
    checks,
  };
};

/**
 * Log environment status on startup
 */
export const logEnvironmentStatus = () => {
  const validation = validateEnvironment();
  const logger = createLogger('Environment');

  if (validation.isValid) {
    logger.info(`✅ Environment validation passed for ${validation.environment}`);

    if (validation.warnings.length > 0) {
      logger.warn('⚠️  Warnings:', validation.warnings);
    }
  } else {
    logger.error('❌ Environment validation failed:', validation.errors);
  }

  if (isDevelopment()) {
    logger.debug('Environment status:', {
      valid: validation.isValid,
      environment: validation.environment,
      checks: validation.checks,
    });
  }
};
