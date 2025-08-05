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
        persistSession: !isTest(),
        detectSessionInUrl: !isTest(),
      },

      db: {
        schema: 'public',
      },

      realtime: {
        enabled: config.database.enableRealtime,
      },

      global: {
        headers: {
          'Cache-Control': isProduction() ? 'public, max-age=3600' : 'no-cache',
          Pragma: isProduction() ? 'cache' : 'no-cache',
          'X-Environment': config.environment,
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

  return {
    debug: (...args: any[]) => {
      if (config.features.debug) {
        console.log(`[${config.environment.toUpperCase()}][${module}]`, ...args);
      }
    },

    info: (...args: any[]) => {
      console.info(`[${config.environment.toUpperCase()}][${module}]`, ...args);
    },

    warn: (...args: any[]) => {
      console.warn(`[${config.environment.toUpperCase()}][${module}]`, ...args);
    },

    error: (...args: any[]) => {
      console.error(`[${config.environment.toUpperCase()}][${module}]`, ...args);
    },
  };
};

/**
 * Environment validation
 */
export const validateEnvironment = () => {
  const errors: string[] = [];
  const config = getEnvironmentConfig();

  // Check required environment variables for production
  if (isProductionLike()) {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    ) {
      errors.push('NEXT_PUBLIC_SUPABASE_URL must be set for production environments');
    }

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('placeholder')
    ) {
      errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY must be set for production environments');
    }

    if (!process.env.CSRF_SECRET) {
      errors.push('CSRF_SECRET must be set for production environments');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    config,
  };
};
