/**
 * Environment Variable Validation
 * Ensure all required environment variables are properly configured
 */

import { z } from 'zod';

// Define schema for all environment variables
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Supabase configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key required'),

  // Webhook secrets
  SUPABASE_WEBHOOK_SECRET: z
    .string()
    .min(16, 'Webhook secret must be at least 16 characters')
    .refine(val => val !== 'dev-webhook-secret', 'Use a secure webhook secret in production'),

  // Security secrets
  CSRF_SECRET: z.string().min(32, 'CSRF secret must be at least 32 characters'),

  // Application configuration
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid app URL'),
  NEXT_PUBLIC_APP_ENV: z.string().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().optional(),
  NEXT_PUBLIC_APP_VERSION: z.string().optional(),

  // Feature flags
  NEXT_PUBLIC_ENABLE_DEBUG: z.coerce.boolean().default(false),
  NEXT_PUBLIC_ENABLE_STORYBOOK: z.coerce.boolean().default(false),
  NEXT_PUBLIC_ENABLE_MOCK_DATA: z.coerce.boolean().default(false),
  NEXT_PUBLIC_RATE_LIMIT_ENABLED: z.coerce.boolean().default(true),

  // API configuration
  NEXT_PUBLIC_API_TIMEOUT: z.coerce.number().min(1000).default(30000),
});

// Production-specific validation
const productionEnvSchema = envSchema.extend({
  // In production, these must not use default/development values
  SUPABASE_WEBHOOK_SECRET: z
    .string()
    .min(32, 'Production webhook secret must be at least 32 characters')
    .refine(val => !val.includes('dev'), 'Production webhook secret cannot contain "dev"'),

  CSRF_SECRET: z.string().min(64, 'Production CSRF secret must be at least 64 characters'),

  NEXT_PUBLIC_ENABLE_DEBUG: z.literal(false, {
    message: 'Debug mode must be disabled in production',
  }),

  NEXT_PUBLIC_ENABLE_MOCK_DATA: z.literal(false, {
    message: 'Mock data must be disabled in production',
  }),
});

export type Environment = z.infer<typeof envSchema>;
export type ProductionEnvironment = z.infer<typeof productionEnvSchema>;

/**
 * Validate environment variables
 */
export function validateEnvironment(): {
  success: boolean;
  data?: Environment;
  errors?: z.ZodError;
} {
  const isProduction = process.env.NODE_ENV === 'production';
  const schema = isProduction ? productionEnvSchema : envSchema;

  const result = schema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Environment validation failed:', result.error.format());
    return { success: false, errors: result.error };
  }

  console.log('✅ Environment validation passed');
  return { success: true, data: result.data };
}

/**
 * Get validated environment variables
 */
export function getEnvironment(): Environment {
  const result = validateEnvironment();

  if (!result.success || !result.data) {
    throw new Error('Environment validation failed. Check your environment variables.');
  }

  return result.data;
}

/**
 * Check for common security issues in environment configuration
 */
export function auditEnvironmentSecurity(): {
  passed: boolean;
  issues: Array<{ severity: 'critical' | 'high' | 'medium' | 'low'; message: string }>;
} {
  const issues: Array<{ severity: 'critical' | 'high' | 'medium' | 'low'; message: string }> = [];

  // Check for URL protocols
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
    issues.push({
      severity: process.env.NODE_ENV === 'production' ? 'critical' : 'medium',
      message: 'Supabase URL should use HTTPS',
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl && !appUrl.startsWith('https://') && process.env.NODE_ENV === 'production') {
    issues.push({
      severity: 'critical',
      message: 'App URL must use HTTPS in production',
    });
  }

  // Check for key lengths
  const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;
  if (webhookSecret && webhookSecret.length < 32) {
    issues.push({
      severity: 'high',
      message: 'Webhook secret should be at least 32 characters',
    });
  }

  // Check for debug flags in production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true') {
      issues.push({
        severity: 'high',
        message: 'Debug mode should be disabled in production',
      });
    }

    if (process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true') {
      issues.push({
        severity: 'medium',
        message: 'Mock data should be disabled in production',
      });
    }
  }

  return {
    passed: issues.filter(i => i.severity === 'critical' || i.severity === 'high').length === 0,
    issues,
  };
}

/**
 * Initialize environment validation on module load
 */
if (typeof window === 'undefined') {
  // Only run on server side
  const result = validateEnvironment();
  if (!result.success && process.env.NODE_ENV !== 'test') {
    console.error('🚨 Environment validation failed! Application may not function correctly.');

    // In production, exit if critical environment validation fails
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }

  // Run security audit
  const auditResult = auditEnvironmentSecurity();
  if (!auditResult.passed) {
    console.warn('⚠️  Environment security audit found issues:', auditResult.issues);
  }
}
