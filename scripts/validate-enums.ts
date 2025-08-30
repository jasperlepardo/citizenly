#!/usr/bin/env tsx

/**
 * Enum Validation Script
 * Validates consistency between API validation schemas and form enums
 */

import { promises as fs } from 'fs';
import path from 'path';

import { MASTER_ENUMS } from './generate-enums';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Extract enum values from API validation file
 */
async function extractApiValidationEnums(): Promise<Record<string, string[]>> {
  try {
    const apiValidationPath = path.join(process.cwd(), 'src/lib/api-validation.ts');
    const content = await fs.readFile(apiValidationPath, 'utf-8');

    const enums: Record<string, string[]> = {};

    // Extract employment status enum
    const employmentMatch = content.match(
      /employmentStatus:\s*z\s*\.enum\s*\(\s*\[\s*([\s\S]*?)\s*\]\s*\)/
    );
    if (employmentMatch) {
      const values = employmentMatch[1]
        .split(',')
        .map(v => v.trim().replace(/['"]/g, ''))
        .filter(v => v.length > 0);
      enums.EMPLOYMENT_STATUS = values;
    }

    // Extract sex enum
    const sexMatch = content.match(/sex:\s*z\s*\.enum\s*\(\s*\[\s*([\s\S]*?)\s*\]\s*\)/);
    if (sexMatch) {
      const values = sexMatch[1]
        .split(',')
        .map(v => v.trim().replace(/['"]/g, ''))
        .filter(v => v.length > 0);
      enums.SEX = values;
    }

    // Extract civil status enum
    const civilStatusMatch = content.match(
      /civilStatus:\s*z\s*\.enum\s*\(\s*\[\s*([\s\S]*?)\s*\]\s*\)/
    );
    if (civilStatusMatch) {
      const values = civilStatusMatch[1]
        .split(',')
        .map(v => v.trim().replace(/['"]/g, ''))
        .filter(v => v.length > 0);
      enums.CIVIL_STATUS = values;
    }

    // Extract blood type enum
    const bloodTypeMatch = content.match(
      /bloodType:\s*z\s*\.enum\s*\(\s*\[\s*([\s\S]*?)\s*\]\s*\)/
    );
    if (bloodTypeMatch) {
      const values = bloodTypeMatch[1]
        .split(',')
        .map(v => v.trim().replace(/['"]/g, ''))
        .filter(v => v.length > 0);
      enums.BLOOD_TYPE = values;
    }

    return enums;
  } catch (error) {
    console.warn('⚠️  Could not extract API validation enums:', error);
    return {};
  }
}

/**
 * Validate enum consistency
 */
async function validateEnumConsistency(): Promise<ValidationResult> {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  try {
    // Get API validation enums
    const apiEnums = await extractApiValidationEnums();

    // Check each master enum against API validation
    Object.entries(MASTER_ENUMS).forEach(([key, enumDef]) => {
      const apiValues = apiEnums[key];
      if (!apiValues) {
        result.warnings.push(`No API validation found for ${key}`);
        return;
      }

      const masterValues = enumDef.options.map(opt => opt.value).filter(val => val !== ''); // Remove empty values

      // Check for missing values in master enum
      const missingInMaster = apiValues.filter(val => !masterValues.includes(val));
      if (missingInMaster.length > 0) {
        result.errors.push(`${key}: Missing in master enum: ${missingInMaster.join(', ')}`);
        result.isValid = false;
      }

      // Check for extra values in master enum
      const extraInMaster = masterValues.filter(val => !apiValues.includes(val));
      if (extraInMaster.length > 0) {
        result.errors.push(
          `${key}: Extra in master enum (not in API): ${extraInMaster.join(', ')}`
        );
        result.isValid = false;
      }

      if (missingInMaster.length === 0 && extraInMaster.length === 0) {
        console.log(`✅ ${key}: Enum values match API validation`);
      }
    });
  } catch (error) {
    result.errors.push(`Validation error: ${error}`);
    result.isValid = false;
  }

  return result;
}

/**
 * Check for duplicate enum files
 */
async function checkDuplicateEnumFiles(): Promise<ValidationResult> {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  try {
    const srcDir = path.join(process.cwd(), 'src');

    // Find all enum-related files
    const enumFiles: string[] = [];

    // Check common locations
    const commonPaths = [
      'lib/constants/resident-enums.ts',
      'lib/constants/generated-enums.ts',
      'components/templates/ResidentFormWizard/constants/enums.ts',
      'lib/enums.ts',
      'constants/enums.ts',
    ];

    for (const relativePath of commonPaths) {
      const fullPath = path.join(srcDir, relativePath);
      try {
        await fs.access(fullPath);
        enumFiles.push(relativePath);
      } catch {
        // File doesn't exist, skip
      }
    }

    if (enumFiles.length > 2) {
      result.warnings.push(`Multiple enum files found: ${enumFiles.join(', ')}`);
      result.warnings.push('Consider consolidating into a single source of truth');
    }

    console.log(`📁 Found enum files: ${enumFiles.length}`);
    enumFiles.forEach(file => console.log(`   - ${file}`));
  } catch (error) {
    result.errors.push(`File check error: ${error}`);
    result.isValid = false;
  }

  return result;
}

/**
 * Main validation function
 */
async function validateEnums() {
  console.log('🔍 Starting enum validation...\n');

  // Run all validation checks
  const [consistencyResult, duplicateResult] = await Promise.all([
    validateEnumConsistency(),
    checkDuplicateEnumFiles(),
  ]);

  // Combine results
  const allErrors = [...consistencyResult.errors, ...duplicateResult.errors];
  const allWarnings = [...consistencyResult.warnings, ...duplicateResult.warnings];

  // Print results
  console.log('\n📊 Validation Results:');
  console.log('='.repeat(40));

  if (allErrors.length === 0) {
    console.log('✅ All enum validations passed!');
  } else {
    console.log('❌ Enum validation failed:');
    allErrors.forEach(error => console.log(`   - ${error}`));
  }

  if (allWarnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    allWarnings.forEach(warning => console.log(`   - ${warning}`));
  }

  // Recommendations
  console.log('\n💡 Recommendations:');
  if (allErrors.length > 0) {
    console.log('   1. Run `npm run generate:enums` to sync enums');
    console.log('   2. Update API validation schemas to match master enums');
  }
  if (allWarnings.filter(w => w.includes('Multiple enum files')).length > 0) {
    console.log('   3. Consolidate enum files into generated-enums.ts');
    console.log('   4. Update imports to use single source of truth');
  }

  // Exit with error code if validation failed
  if (allErrors.length > 0) {
    process.exit(1);
  }
}

// Run validation if called directly
if (require.main === module) {
  validateEnums();
}

export { validateEnums };
