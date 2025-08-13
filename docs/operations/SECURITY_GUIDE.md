# Security Guide

## Overview
This document outlines security practices and tools for the Citizenly codebase.

## Automated Security Scanning

### Code Security Analysis
```bash
# Run comprehensive security code analysis
npm run security:code

# Run dependency vulnerability scanning
npm run security:deps

# Run all security checks
npm run security:all
```

### Security Reports
Security analysis generates detailed reports:
- `security-analysis-report.json` - Code vulnerability analysis
- `dependency-security-report.json` - Dependency security analysis

## Security Patterns Detected

### High Severity Issues
- **Hardcoded Secrets**: API keys, passwords, tokens in source code
- **SQL Injection**: Unparameterized queries with user input
- **Prototype Pollution**: Unsafe object property access

### Medium Severity Issues
- **XSS Vulnerabilities**: `dangerouslySetInnerHTML`, `innerHTML` usage
- **Insecure HTTP**: HTTP URLs in production code
- **Weak Random**: `Math.random()` for security purposes
- **Buffer Overflow**: Unsafe buffer operations

### Low Severity Issues
- **Sensitive Logging**: Console logging of credentials/tokens
- **Information Disclosure**: Detailed error messages in production

## Security Best Practices

### 1. Environment Variables
Store all secrets in environment variables:
```javascript
// ❌ BAD - Hardcoded secret
const apiKey = "sk-1234567890abcdef";

// ✅ GOOD - Environment variable
const apiKey = process.env.API_KEY;
```

### 2. Parameterized Queries
Use ORM methods or parameterized queries:
```javascript
// ❌ BAD - SQL injection risk
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ GOOD - Parameterized query
const query = 'SELECT * FROM users WHERE id = $1';
const result = await client.query(query, [userId]);
```

### 3. Safe HTML Rendering
Avoid `dangerouslySetInnerHTML` or sanitize content:
```javascript
// ❌ BAD - XSS vulnerability
<div dangerouslySetInnerHTML={{__html: userContent}} />

// ✅ GOOD - Sanitized content
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(userContent)}} />
```

### 4. Secure Random Generation
Use crypto module for security purposes:
```javascript
// ❌ BAD - Weak random
const token = Math.random().toString(36);

// ✅ GOOD - Cryptographically secure
import crypto from 'crypto';
const token = crypto.randomBytes(32).toString('hex');
```

### 5. HTTPS Enforcement
Always use HTTPS in production:
```javascript
// ❌ BAD - Insecure HTTP
const apiUrl = "http://api.example.com";

// ✅ GOOD - Secure HTTPS
const apiUrl = "https://api.example.com";
```

## Pre-commit Security Checks

Security checks are automatically run during pre-commit hooks:
1. Code vulnerability scanning
2. Dependency vulnerability checks
3. Pattern-based security analysis

## Dependency Security

### Regular Audits
```bash
# Check for vulnerable dependencies
npm audit

# Fix automatically fixable vulnerabilities
npm audit fix

# Force fix breaking changes (use with caution)
npm audit fix --force
```

### Audit CI Configuration
The `audit-ci.json` file configures automated dependency scanning:
- Blocks commits with high/critical vulnerabilities
- Allows moderate/low vulnerabilities (with warnings)
- Maintains allowlist for known false positives

## Security Headers

### Content Security Policy (CSP)
Implement CSP headers in `next.config.js`:
```javascript
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval';"
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  }
];
```

## Authentication & Authorization

### JWT Token Security
- Use secure, random secrets for JWT signing
- Implement token expiration
- Store tokens securely (httpOnly cookies preferred)

### Role-Based Access Control
- Implement proper authorization checks
- Validate user permissions on every request
- Use principle of least privilege

## Data Protection

### Personal Information
- Encrypt PII data at rest
- Use secure transmission (HTTPS/TLS)
- Implement data retention policies
- Follow GDPR/privacy regulations

### Database Security
- Use parameterized queries
- Implement row-level security (RLS)
- Regular security audits
- Backup encryption

## Monitoring & Incident Response

### Security Monitoring
- Log security events
- Monitor failed authentication attempts
- Track unusual access patterns
- Set up alerts for security violations

### Incident Response
1. **Detect**: Automated monitoring and alerting
2. **Respond**: Immediate containment procedures
3. **Recover**: Restore services securely
4. **Learn**: Post-incident analysis and improvements

## Security Tools Integration

### GitHub Security Features
- Dependabot for dependency updates
- CodeQL for static analysis
- Secret scanning for leaked credentials
- Security advisories for vulnerabilities

### CI/CD Security
- Automated security testing
- Container image scanning
- Infrastructure as Code security
- Deployment security checks

## Reporting Security Issues

If you discover a security vulnerability:
1. **DO NOT** create a public issue
2. Email security concerns to the maintainer team
3. Provide detailed information about the vulnerability
4. Allow time for fix before public disclosure

## Security Training

### Developer Guidelines
- Regular security training
- Secure coding practices
- Threat modeling exercises
- Security code reviews

### Security Resources
- OWASP Top 10
- Security best practices documentation
- Regular security updates and patches
- Security-focused code review guidelines

## Compliance

### Standards Adherence
- Follow industry security standards
- Implement required compliance controls
- Regular security assessments
- Documentation of security measures

---

**Note**: This security guide should be regularly updated as new threats and best practices emerge. All team members are responsible for maintaining security awareness and following these guidelines.