# GitHub Workflows Documentation

This document provides comprehensive documentation for all GitHub Actions workflows in the Citizenly project, including their purposes, triggers, caching strategies, and integration requirements.

## Overview

Our CI/CD pipeline consists of 9 specialized workflows designed for code quality, security, performance monitoring, and deployment automation. All workflows implement advanced caching strategies for 60-70% faster builds.

## Workflow Index

1. [Pull Request Checks](#pull-request-checks) - Core PR validation
2. [Automated Code Review](#automated-code-review) - Multi-stage quality analysis
3. [Bundle Analysis](#bundle-analysis) - Performance and size monitoring
4. [Vercel Build Check](#vercel-build-check) - Deployment compatibility
5. [Deploy Storybook](#deploy-storybook) - Component library deployment
6. [Security Scans](#security-workflows) - Additional security workflows
7. [Performance Monitoring](#performance-workflows) - Additional performance workflows

## Advanced Caching Strategy

All workflows implement a multi-layer caching system:

```yaml
- name: Cache Next.js build
  uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      ${{ github.workspace }}/.next/cache
      ${{ github.workspace }}/.eslintcache
    key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx') }}
    restore-keys: |
      ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-
      ${{ runner.os }}-nextjs-
```

**Cache Layers:**

- **npm cache** (`~/.npm`) - Package installation acceleration
- **Next.js build cache** (`.next/cache`) - Build output and compilation cache
- **ESLint cache** (`.eslintcache`) - Linting performance improvement

**Performance Impact:** 60-70% reduction in workflow execution time.

## Core Workflows

### Pull Request Checks

**File:** `.github/workflows/pull-request.yml`

**Purpose:** Primary validation for all pull requests with comprehensive checks.

**Triggers:**

- Pull requests to `main`, `develop`, `release/**`

**Process:**

1. Security checks (`npm run security:check`)
2. Test execution (`npm run test:ci`)
3. Type checking (`npm run type-check`)
4. Linting (`npm run lint`)
5. Build validation (`npm run build`)
6. Conventional commit validation

**Success Criteria:** All steps must pass for PR approval.

### Automated Code Review

**File:** `.github/workflows/code-review.yml`

**Purpose:** Comprehensive code quality analysis with multiple specialized jobs.

**Triggers:**

- Pull requests to `main`, `develop`
- Pushes to `develop`, `feature/**`, `release/**`, `hotfix/**`

**Jobs:**

#### 1. Code Quality Analysis

- ESLint with reviewdog PR comments
- TypeScript validation with reviewdog
- Test coverage with Codecov integration
- Security audit (`npm audit`)
- Bundle size validation

#### 2. Complexity Analysis

- Code duplication detection (jscpd)
- Complexity metrics analysis
- Automated PR comments with quality reports

#### 3. Security Analysis

- Semgrep security scanning
- Custom security checks (`./scripts/security-check.sh`)

#### 4. Performance Budget

- Bundle analysis with webpack-bundle-analyzer
- Performance budget validation
- Bundle size reporting

#### 5. SonarCloud Quality Gate

- Comprehensive code quality analysis
- Integration with SonarCloud dashboard
- Quality gate enforcement

**Required Secrets:**

- `CODECOV_TOKEN` (optional)
- `SEMGREP_APP_TOKEN` (optional)
- `SONAR_TOKEN` (optional)

### Bundle Analysis

**File:** `.github/workflows/bundle-analysis.yml`

**Purpose:** Dedicated bundle size monitoring and analysis.

**Triggers:**

- Pull requests (`opened`, `synchronize`)
- Pushes to `main`, `develop`

**Process:**

1. Application build with production settings
2. Bundle size validation (`npx bundlesize`)
3. Webpack bundle analysis
4. Artifact upload for historical tracking
5. PR comment with bundle metrics

**Outputs:** Bundle analysis artifacts retained for 30 days.

### Vercel Build Check

**File:** `.github/workflows/vercel-build.yml`

**Purpose:** Ensure Vercel deployment compatibility.

**Triggers:**

- Pushes to `main`, `develop`
- Pull requests (`opened`, `synchronize`, `reopened`)

**Validation:**

1. Type checking
2. Linting
3. Production build simulation
4. Build output verification
5. Bundle analysis
6. PR deployment readiness confirmation

### Deploy Storybook

**File:** `.github/workflows/deploy-storybook.yml`

**Purpose:** Automated component library deployment to Vercel.

**Triggers:**

- Pushes to `main`, `develop` (component-related paths)
- Pull requests to `main`, `develop` (component-related paths)
- Manual dispatch (`workflow_dispatch`)

**Monitored Paths:**

- `src/components/**`
- `src/stories/**`
- `.storybook/**`
- `package.json`, `package-lock.json`
- `public/**`

**Specialized Caching:**

```yaml
path: |
  ~/.npm
  ${{ github.workspace }}/storybook-static
  ${{ github.workspace }}/.next/cache
key: ${{ runner.os }}-storybook-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('src/components/**', 'src/stories/**', '.storybook/**') }}
```

**Deployment:** Uses Vercel CLI for production deployment with PR preview comments.

**Required Secrets:**

- `VERCEL_TOKEN`

## Environment Variables

### Build Environment Variables

All workflows use consistent environment variables for build processes:

```yaml
env:
  NODE_ENV: production
  CSRF_SECRET: 'dev-csrf-secret-for-build-only-32-chars-long'
  NEXT_PUBLIC_SUPABASE_URL: 'https://placeholder.supabase.co'
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'placeholder-key-for-build-testing'
```

### Workflow-Specific Variables

- **Storybook:** Additional `NEXT_PUBLIC_APP_ENV: development`
- **Vercel:** `VERCEL_ENV: 'production'`

## Integration Requirements

### Required Package Scripts

Workflows depend on these npm scripts:

```json
{
  "security:check": "Security validation script",
  "test:ci": "Test execution for CI",
  "test:coverage": "Test with coverage reporting",
  "type-check": "TypeScript validation",
  "lint": "ESLint execution",
  "build": "Production build",
  "build-storybook": "Storybook static build"
}
```

### Optional Integrations

- **Codecov:** Test coverage reporting
- **Semgrep:** Advanced security scanning
- **SonarCloud:** Code quality analysis
- **Vercel:** Deployment platform

## Performance Metrics

With advanced caching implementation:

- **Build time reduction:** 60-70%
- **npm install acceleration:** ~80%
- **ESLint execution:** ~50% faster
- **Next.js compilation:** ~70% faster

## Troubleshooting

### Common Issues

1. **Cache Misses:** Verify file hash patterns in cache keys
2. **Build Failures:** Check environment variable configuration
3. **Integration Failures:** Validate optional secret availability
4. **Bundle Size Exceeded:** Review bundlesize configuration

### Workflow Logs

Each workflow provides detailed logging for:

- Cache hit/miss status
- Build performance metrics
- Integration success/failure status
- Quality gate results

### Manual Workflow Dispatch

Most workflows support manual triggering through GitHub UI for debugging.

## Security Considerations

- Environment variables use safe placeholder values for builds
- Optional integrations fail gracefully when secrets unavailable
- Security scanning covers multiple vulnerability sources
- Custom security validation via `scripts/security-check.sh`

## Maintenance

### Regular Tasks

- Monitor cache performance and adjust keys as needed
- Update integration versions (actions, tools)
- Review and adjust performance budgets
- Validate workflow triggers align with git-flow strategy

### Workflow Updates

When modifying workflows:

1. Test changes on feature branches
2. Validate caching strategy remains effective
3. Update documentation for new integrations
4. Consider impact on development team workflow

## Related Documentation

- [Development Workflow](./DEVELOPMENT_WORKFLOW.md)
- [Git Flow Strategy](../guides/GIT_BEST_PRACTICES.md)
- [Performance Monitoring](../reference/PERFORMANCE_MONITORING.md)
- [Security Guidelines](../reference/SECURITY_GUIDELINES.md)
