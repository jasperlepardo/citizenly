# CodeRabbit Integration Test

This file validates that CodeRabbit is properly integrated with the Citizenly repository.

## What CodeRabbit Will Review

### 🔍 **Focus Areas**
- **Type Safety**: Detecting `any` types and improving TypeScript usage
- **Security**: API route authentication and data validation  
- **Performance**: Database query optimization and React patterns
- **Maintainability**: Code organization and best practices
- **Accessibility**: UI component compliance

### 🎯 **High-Priority Files**
- API routes (`src/app/api/**/*.ts`) - Security critical
- Type definitions (`src/types/**/*.ts`) - Affects entire codebase  
- Database schemas (`database/**/*.sql`) - Data integrity
- Authentication logic (`src/lib/authentication/**`) - Access control
- Custom hooks (`src/hooks/**/*.ts`) - Reusable logic

### ⚡ **Project-Specific Rules**
- **Supabase Error Handling**: Ensures database operations have proper error handling
- **API Authentication**: Verifies routes use `withAuth` middleware
- **PII Protection**: Reviews personal data handling (birthdate, mobile, etc.)
- **Geographic Codes**: Validates PSGC compliance for barangay/city codes
- **Permission Checks**: Ensures role-based access controls

### 🚫 **Excluded from Review**  
- `node_modules/`, `.next/`, `build/` - Generated/dependency files
- `**/*.test.ts`, `**/__tests__/` - Test files (different criteria)
- `.env*` files - Environment secrets
- `public/**/*.js` - Static assets

## Integration Status

✅ **Configuration Created**: `.coderabbit.yaml` optimized for TypeScript/Next.js/Supabase
⏳ **GitHub App Installation**: Pending installation from marketplace
⏳ **First PR Review**: Waiting for CodeRabbit to analyze this PR

## Next Steps

1. Install CodeRabbit from GitHub Apps marketplace
2. Grant repository access to CodeRabbit  
3. Create a test PR to validate integration
4. Review CodeRabbit's analysis and feedback
5. Fine-tune configuration based on initial results

---

*This test file will be removed after successful integration validation.*