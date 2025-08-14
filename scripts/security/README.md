# Security Scripts

Scripts for dependency vulnerability scanning and security policy enforcement.

## Scripts

### `check-dependencies.js`
Scans dependencies for known vulnerabilities and generates reports.

### `analyze-security.js`
Analyzes code for security issues and potential vulnerabilities.

### `check-security.sh`
Comprehensive security check including dependencies, code patterns, and configuration.

## Usage

```bash
# Check for dependency vulnerabilities
node scripts/security/check-dependencies.js

# Run comprehensive security analysis
node scripts/security/analyze-security.js

# Execute full security check
./scripts/security/check-security.sh
```

## Security Considerations

These scripts help identify:
- Known vulnerabilities in dependencies
- Insecure code patterns
- Potential security misconfigurations
- Exposed secrets or credentials