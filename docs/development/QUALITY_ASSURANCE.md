# Quality Assurance System Documentation

## Overview

This project implements a comprehensive **Environment-Based Quality Assurance System** that adapts validation intensity based on the deployment environment. The system uses a 4-tier approach to balance development speed with production safety.

## Quick Start

```bash
# Run environment-appropriate checks
npm run check

# Run specific tier checks
npm run tier1:dev    # Development (fast)
npm run tier2:ci     # CI/CD (standard)
npm run tier3:staging # Staging (enhanced)
npm run tier4:prod   # Production (critical)
```

## System Architecture

### 4-Tier Quality System

| Tier       | Environment | Focus               | Speed  | Coverage               |
| ---------- | ----------- | ------------------- | ------ | ---------------------- |
| **Tier 1** | Development | Fast feedback       | ⚡⚡⚡ | Essential checks       |
| **Tier 2** | CI/CD       | Standard validation | ⚡⚡   | Comprehensive checks   |
| **Tier 3** | Staging     | Enhanced testing    | ⚡     | Full integration tests |
| **Tier 4** | Production  | Critical validation | 🔒     | Security-focused       |

### Environment Detection

The system automatically detects the environment using:

```typescript
// src/lib/env-config.ts
export function getEnvironmentConfig() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isCI = process.env.CI === 'true';
  const vercelEnv = process.env.VERCEL_ENV;

  // Returns appropriate tier and checks
}
```

## Tier Details

### Tier 1: Development Environment

**Goal**: Immediate feedback for developers

**Checks**:

- `lint:fast` - Fast ESLint with compact format
- `type-check:fast` - TypeScript check with skipLibCheck
- `test:fast` - Jest with silent mode and max workers

**Trigger**: Local development environment

```bash
npm run tier1:dev
```

### Tier 2: CI/CD Environment

**Goal**: Comprehensive validation before integration

**Checks**:

- `lint` - Full ESLint validation
- `type-check` - Complete TypeScript validation
- `test:ci` - Jest with coverage and CI optimizations
- `security:scan` - NPM audit + audit-ci
- `analyze:deps` - Circular dependency detection
- `bundle:check` - Bundle size validation

**Trigger**: GitHub Actions, CI environments

```bash
npm run tier2:ci
```

### Tier 3: Staging Environment

**Goal**: Integration and user experience testing

**Checks**:

- `test:e2e` - End-to-end testing with Playwright
- `test:visual` - Visual regression testing
- `test:lighthouse` - Performance testing with Lighthouse
- `test:a11y` - Accessibility testing with axe-core

**Trigger**: Staging deployments

```bash
npm run tier3:staging
```

### Tier 4: Production Environment

**Goal**: Critical security and performance validation

**Checks**:

- `security:audit` - Production vulnerability scan
- `security:snyk` - Advanced security analysis
- `analyze:bundle` - Production bundle analysis
- Health checks and performance monitoring

**Trigger**: Production deployments

```bash
npm run tier4:prod
```

## Configuration Files

### Environment-Specific ESLint

- `.eslintrc.dev.js` - Relaxed rules for development speed
- `.eslintrc.ci.js` - Strict rules with accessibility requirements

### Environment-Specific Jest

- `jest.config.dev.js` - Fast testing, no coverage
- `jest.config.ci.js` - Full coverage with thresholds

### Security Configuration

- `audit-ci.json` - Vulnerability scanning settings
- `.snyk` - Snyk security policy
- `scripts/security-check.sh` - Environment-aware security validation

### Pre-commit Hooks

- `.husky/pre-commit` - Tier 1 validation on commit
- `.lintstagedrc.js` - Process only staged files

## Usage Guide

### For Developers

**Daily Development**:

```bash
# Automatic environment detection
npm run check

# Manual fast checks
npm run dev:check
npm run dev:test
```

**Before Committing**:
Pre-commit hooks automatically run Tier 1 checks. No action needed.

**Debugging Issues**:

```bash
# Check environment detection
npm run env:check

# Run specific tools
npm run lint:fast
npm run type-check:fast
npm run test:fast
```

### For CI/CD

**GitHub Actions Integration**:
The system includes workflow files:

- `.github/workflows/pull-request.yml` - Tier 2 validation
- `.github/workflows/staging-validation.yml` - Tier 3 testing
- `.github/workflows/production-validation.yml` - Tier 4 critical checks

**Manual CI Testing**:

```bash
# Simulate CI environment
CI=true npm run check
```

### For DevOps

**Production Deployment**:

```bash
# Critical production validation
VERCEL_ENV=production npm run check

# Manual production checks
npm run prod:validate
```

**Security Auditing**:

```bash
# Comprehensive security scan
npm run security:full

# Production security audit
npm run security:audit
```

## Tool Descriptions

### Code Quality Tools

- **ESLint**: Code style and error detection
- **TypeScript**: Type checking and compile-time validation
- **Prettier**: Code formatting (via lint-staged)

### Testing Tools

- **Jest**: Unit and integration testing
- **@testing-library/react**: Component testing utilities
- **axe-core**: Accessibility testing (mocked until dependencies installed)

### Security Tools

- **npm audit**: Built-in vulnerability scanner
- **audit-ci**: CI-focused vulnerability detection
- **Snyk**: Advanced security analysis
- **Custom security script**: Environment-aware security validation

### Performance Tools

- **bundlesize**: Bundle size monitoring
- **madge**: Dependency analysis and circular dependency detection
- **webpack-bundle-analyzer**: Bundle composition analysis
- **jscpd**: Code duplication detection

## Customization

### Adding New Checks

1. Add script to `package.json`
2. Update `src/lib/env-config.ts` QUALITY_TIERS
3. Update relevant workflow files
4. Document in this file

### Modifying Thresholds

Update configuration files:

- ESLint rules in `.eslintrc.*.js`
- Jest coverage in `jest.config.*.js`
- Bundle size limits in `package.json` bundlesize config
- Security levels in `audit-ci.json`

### Environment Detection

Modify `src/lib/env-config.ts` to adjust environment detection logic.

## Troubleshooting

### Common Issues

**"Command not found" errors**:

```bash
npm install  # Install missing dependencies
```

**ESLint cache issues**:

```bash
npx eslint --cache-location=node_modules/.cache/eslint-cache --fix src/
```

**TypeScript compilation errors**:

```bash
# Clear TypeScript cache
rm -rf node_modules/.cache/.tsbuildinfo
npm run type-check
```

**Test failures**:

```bash
# Run tests in watch mode for debugging
npm run test:watch
```

### Performance Issues

**Slow linting**:

- Use `lint:fast` for development
- Configure ESLint cache properly
- Consider using `lint-staged` for changed files only

**Slow tests**:

- Use `test:fast` for development
- Adjust `maxWorkers` based on system capabilities
- Use `--bail` flag to stop on first failure

### Security Issues

**High/Critical vulnerabilities**:

```bash
# Try automatic fixes first
npm audit fix

# For production dependencies only
npm audit fix --production

# Manual review for breaking changes
npm audit
```

**False positives**:

- Add exceptions to `.snyk` file
- Update `audit-ci.json` allowlist
- Document reasoning in security policy

## Integration with IDEs

### VS Code

Recommended extensions:

- ESLint extension with workspace settings
- TypeScript Hero for imports
- Jest Runner for test execution

### WebStorm/IntelliJ

- Enable ESLint integration
- Configure TypeScript service
- Set up Jest run configurations

## Monitoring and Metrics

### Success Metrics

- **Development speed**: Tier 1 checks complete in <30s
- **CI reliability**: Tier 2 checks have <5% false positive rate
- **Security coverage**: 100% of high/critical vulnerabilities caught
- **Performance**: Bundle size stays within limits

### Reporting

The system generates reports for:

- Security vulnerabilities
- Bundle size changes
- Test coverage metrics
- Performance benchmarks

## Best Practices

### For Developers

1. Run `npm run check` before pushing
2. Fix lint/type errors immediately
3. Keep bundle size changes minimal
4. Write tests for new features

### For Team Leads

1. Monitor CI failure rates
2. Review security reports regularly
3. Update quality gates as needed
4. Ensure team follows practices

### For DevOps

1. Monitor production validation metrics
2. Keep security tools updated
3. Review and update thresholds quarterly
4. Maintain documentation

## Migration Guide

### From Previous System

1. Install new dependencies: `npm install`
2. Update scripts: Copy new `package.json` scripts
3. Configure environments: Set up `.env.*` files
4. Test locally: Run `npm run check`
5. Update CI: Deploy new workflow files

### Rollback Plan

1. Revert `package.json` scripts
2. Remove configuration files
3. Restore previous workflow files
4. Update documentation

## Contributing

### Adding New Tools

1. Research tool and integration approach
2. Add to appropriate tier in `env-config.ts`
3. Create configuration files
4. Add npm scripts
5. Update workflows
6. Test thoroughly
7. Update documentation

### Reporting Issues

Include:

- Environment details
- Command that failed
- Full error output
- Steps to reproduce

## Changelog

### v1.0.0 - Initial Implementation

- Multi-tier quality system
- Environment detection
- Security tools integration
- Performance monitoring
- Accessibility testing framework
- GitHub Actions workflows
- Pre-commit hooks
- Comprehensive documentation

---

For questions or support, see the main [README.md](../README.md) or create an issue in the repository.
