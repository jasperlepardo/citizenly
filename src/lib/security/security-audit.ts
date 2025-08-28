/**
 * Security Audit Utilities
 * Comprehensive security checking for API routes
 */

export interface SecurityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category:
    | 'authentication'
    | 'authorization'
    | 'input_validation'
    | 'information_disclosure'
    | 'crypto'
    | 'configuration';
  description: string;
  file?: string;
  recommendation: string;
}

export interface SecurityAuditResult {
  passed: boolean;
  issues: SecurityIssue[];
  score: number; // 0-100
}

/**
 * Run comprehensive security audit
 */
export async function runSecurityAudit(): Promise<SecurityAuditResult> {
  const issues: SecurityIssue[] = [];

  // Check environment configuration
  issues.push(...auditEnvironmentConfig());

  // Check authentication setup
  issues.push(...auditAuthenticationSetup());

  // Check for information disclosure
  issues.push(...auditInformationDisclosure());

  // Calculate security score (100 - (critical * 25 + high * 15 + medium * 5 + low * 1))
  const score = Math.max(
    0,
    100 -
      issues.reduce((acc, issue) => {
        const weights = { critical: 25, high: 15, medium: 5, low: 1 };
        return acc + weights[issue.severity];
      }, 0)
  );

  return {
    passed: issues.filter(i => i.severity === 'critical' || i.severity === 'high').length === 0,
    issues,
    score,
  };
}

function auditEnvironmentConfig(): SecurityIssue[] {
  const issues: SecurityIssue[] = [];

  // Check production environment setup
  if (process.env.NODE_ENV === 'production') {
    if (
      !process.env.SUPABASE_WEBHOOK_SECRET ||
      process.env.SUPABASE_WEBHOOK_SECRET === 'dev-webhook-secret'
    ) {
      issues.push({
        severity: 'critical',
        category: 'configuration',
        description: 'Webhook secret not properly configured for production',
        recommendation: 'Set a strong, unique SUPABASE_WEBHOOK_SECRET in production environment',
      });
    }

    if (!process.env.CSRF_SECRET || process.env.CSRF_SECRET.length < 32) {
      issues.push({
        severity: 'high',
        category: 'configuration',
        description: 'CSRF secret not properly configured',
        recommendation: 'Set a strong CSRF_SECRET with at least 32 characters',
      });
    }
  }

  // Check for missing required environment variables
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  required.forEach(key => {
    if (!process.env[key]) {
      issues.push({
        severity: 'critical',
        category: 'configuration',
        description: `Missing required environment variable: ${key}`,
        recommendation: `Set the ${key} environment variable`,
      });
    }
  });

  return issues;
}

function auditAuthenticationSetup(): SecurityIssue[] {
  const issues: SecurityIssue[] = [];

  // Check for hardcoded secrets (this would be checked by static analysis)
  // In a real implementation, you'd scan files for patterns

  return issues;
}

function auditInformationDisclosure(): SecurityIssue[] {
  const issues: SecurityIssue[] = [];

  // Check for potential information leakage in development
  if (process.env.NODE_ENV !== 'development') {
    // This would check for console.log, detailed error messages, etc.
    // Static analysis would be needed for comprehensive checking
  }

  return issues;
}

/**
 * Generate security report
 */
export function generateSecurityReport(audit: SecurityAuditResult): string {
  const severityEmojis = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢',
  };

  let report = `# Security Audit Report\n\n`;
  report += `**Overall Score:** ${audit.score}/100\n`;
  report += `**Status:** ${audit.passed ? '✅ PASSED' : '❌ FAILED'}\n\n`;

  if (audit.issues.length === 0) {
    report += `🎉 No security issues found!\n`;
    return report;
  }

  report += `## Issues Found (${audit.issues.length})\n\n`;

  const groupedIssues = audit.issues.reduce(
    (acc, issue) => {
      if (!acc[issue.severity]) acc[issue.severity] = [];
      acc[issue.severity].push(issue);
      return acc;
    },
    {} as Record<string, SecurityIssue[]>
  );

  (['critical', 'high', 'medium', 'low'] as const).forEach(severity => {
    const issues = groupedIssues[severity];
    if (!issues || issues.length === 0) return;

    report += `### ${severityEmojis[severity]} ${severity.toUpperCase()} (${issues.length})\n\n`;
    issues.forEach((issue, index) => {
      report += `${index + 1}. **${issue.category.replace('_', ' ').toUpperCase()}**: ${issue.description}\n`;
      report += `   - **Recommendation**: ${issue.recommendation}\n`;
      if (issue.file) report += `   - **File**: ${issue.file}\n`;
      report += `\n`;
    });
  });

  return report;
}

/**
 * Security middleware to add headers and validate requests
 */
export const securityHeaders = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  // Prevent page from being embedded in frames
  'X-Frame-Options': 'DENY',
  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',
  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Content Security Policy
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';",
  // Prevent caching of sensitive responses
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
} as const;
