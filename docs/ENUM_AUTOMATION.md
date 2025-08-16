# Automated Enum Management

This document describes the automated enum management system implemented in the Citizenly project to ensure consistency between frontend forms and API validation schemas.

## 🎯 Problem Solved

Previously, enum values were manually maintained in multiple files, leading to:
- ❌ Form validation failures due to mismatched enum values
- ❌ Manual synchronization between frontend and backend
- ❌ Developer time wasted debugging enum inconsistencies
- ❌ Risk of runtime errors from invalid enum values

## ✅ Solution: Automated Enum Management

### Single Source of Truth
All enum definitions are centralized in `scripts/generate-enums.ts` with master definitions that serve as the authoritative source.

### Automated Generation
- **Generated TypeScript**: `src/lib/constants/generated-enums.ts`
- **Generated Zod Schemas**: `src/lib/validation/generated-schemas.ts`
- **Type Safety**: Full TypeScript type extraction and validation

## 📜 Available Scripts

```bash
# Generate all enum files from master definitions
npm run generate:enums

# Watch mode - regenerate on changes
npm run generate:enums-watch

# Validate enum consistency across codebase
npm run validate:enums
```

## 🔄 Automated Workflows

### Pre-commit Hooks
- Automatically validates enum consistency when enum files are modified
- Prevents commits with inconsistent enum definitions
- Provides helpful suggestions for fixing issues

### GitHub Actions
- **Validation on PRs**: Ensures enum consistency in pull requests
- **Auto-comments**: Provides status updates on PR enum validation
- **Change Detection**: Alerts when generated enums are out of sync

### Development Workflow
1. **Modify Master Enums**: Edit `scripts/generate-enums.ts`
2. **Generate Files**: Run `npm run generate:enums`
3. **Validate**: Run `npm run validate:enums`
4. **Commit**: Pre-commit hooks automatically validate
5. **PR Review**: GitHub Actions provide validation status

## 🏗️ Architecture

### Master Enum Definitions
```typescript
// scripts/generate-enums.ts
const MASTER_ENUMS = {
  EMPLOYMENT_STATUS: {
    name: 'EMPLOYMENT_STATUS_OPTIONS',
    options: [
      { value: 'employed', label: 'Employed' },
      { value: 'unemployed', label: 'Unemployed' },
      // ... more options
    ],
  },
};
```

### Generated Output
```typescript
// src/lib/constants/generated-enums.ts
export const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'employed', label: 'Employed' },
  { value: 'unemployed', label: 'Unemployed' },
] as const;

export type EmploymentStatusValue = (typeof EMPLOYMENT_STATUS_OPTIONS)[number]['value'];
```

### API Validation Integration
```typescript
// src/lib/validation/generated-schemas.ts
export const employmentstatusSchema = z.enum(['employed', 'unemployed', 'self_employed']);
```

## 🛠️ How to Add New Enums

1. **Add to Master Definitions**:
   ```typescript
   // scripts/generate-enums.ts
   NEW_ENUM: {
     name: 'NEW_ENUM_OPTIONS',
     description: 'Description of the enum',
     options: [
       { value: 'option1', label: 'Option 1' },
       { value: 'option2', label: 'Option 2' },
     ],
   },
   ```

2. **Generate Files**:
   ```bash
   npm run generate:enums
   ```

3. **Update API Validation**:
   ```typescript
   // src/lib/api-validation.ts
   import { newenumSchema } from './validation/generated-schemas';
   
   const schema = z.object({
     newField: newenumSchema,
   });
   ```

4. **Use in Components**:
   ```typescript
   import { NEW_ENUM_OPTIONS, type NewEnumValue } from '@/lib/constants/generated-enums';
   
   <select>
     {NEW_ENUM_OPTIONS.map(option => (
       <option key={option.value} value={option.value}>
         {option.label}
       </option>
     ))}
   </select>
   ```

## 🔍 Validation Features

### Consistency Checking
- **API Schema Sync**: Ensures frontend enums match backend validation
- **Duplicate Detection**: Identifies multiple enum file sources
- **Missing Values**: Detects when API schemas have values not in frontend
- **Extra Values**: Identifies frontend values not in API schemas

### Automated Reporting
```bash
$ npm run validate:enums

✅ SEX: Enum values match API validation
✅ EMPLOYMENT_STATUS: Enum values match API validation
⚠️  Multiple enum files found: consolidate into single source
💡 Run 'npm run generate:enums' to auto-fix
```

## 📋 Migration Guide

### From Manual Enums
1. **Backup Current Enums**: Copy existing enum values
2. **Add to Master**: Include in `scripts/generate-enums.ts`
3. **Generate**: Run `npm run generate:enums`
4. **Update Imports**: Change imports to use generated enums
5. **Remove Old Files**: Delete manually maintained enum files
6. **Validate**: Run `npm run validate:enums`

### Example Migration
```typescript
// OLD: src/lib/constants/resident-enums.ts
export const SEX_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

// NEW: Import from generated file
import { SEX_OPTIONS } from '@/lib/constants/generated-enums';
```

## 🎯 Benefits

### For Developers
- ✅ **No More Manual Sync**: Automatic consistency between frontend/backend
- ✅ **Type Safety**: Full TypeScript support with generated types
- ✅ **Fast Development**: No time wasted debugging enum mismatches
- ✅ **Clear Errors**: Helpful validation messages with fix suggestions

### For Quality Assurance
- ✅ **Pre-commit Validation**: Issues caught before they reach repository
- ✅ **CI/CD Integration**: Automated validation in pull requests
- ✅ **Consistent UX**: All forms use same enum values and labels

### For System Reliability
- ✅ **Runtime Safety**: Prevents form submission errors from invalid enums
- ✅ **API Compatibility**: Ensures frontend values match backend validation
- ✅ **Maintainability**: Single source of truth for all enum definitions

## 🚀 Future Enhancements

- **Database Integration**: Extract enums directly from database schema
- **Internationalization**: Multi-language support for enum labels
- **Visual Editor**: GUI for managing enum definitions
- **Auto-migration**: Automatic import updates when enums change
- **Performance Monitoring**: Track enum validation performance

## 📞 Support

For issues with enum automation:
1. Check validation output: `npm run validate:enums`
2. Regenerate enums: `npm run generate:enums`
3. Review pre-commit hook logs
4. Check GitHub Actions for CI validation status

**Common Issues**:
- Enum values don't match API → Run `npm run generate:enums`
- Multiple enum files → Consolidate into generated enums
- Pre-commit failing → Fix validation errors before committing