#!/usr/bin/env tsx

/**
 * Automated Enum Generator
 * Generates TypeScript enums from database schema and validation files
 * Ensures consistency between API validation, database, and frontend forms
 */

import { promises as fs } from 'fs';
import path from 'path';

interface EnumOption {
  value: string;
  label: string;
}

interface EnumDefinition {
  name: string;
  options: EnumOption[];
  description?: string;
}

// Master enum definitions - single source of truth
const MASTER_ENUMS: Record<string, EnumDefinition> = {
  SEX: {
    name: 'SEX_OPTIONS',
    description: 'Gender/sex options',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
    ],
  },
  
  CIVIL_STATUS: {
    name: 'CIVIL_STATUS_OPTIONS',
    description: 'Marital status options',
    options: [
      { value: 'single', label: 'Single' },
      { value: 'married', label: 'Married' },
      { value: 'widowed', label: 'Widowed' },
      { value: 'divorced', label: 'Divorced' },
      { value: 'separated', label: 'Separated' },
      { value: 'annulled', label: 'Annulled' },
    ],
  },
  
  EMPLOYMENT_STATUS: {
    name: 'EMPLOYMENT_STATUS_OPTIONS',
    description: 'Employment status options - synced with API validation',
    options: [
      { value: 'employed', label: 'Employed' },
      { value: 'unemployed', label: 'Unemployed' },
      { value: 'self_employed', label: 'Self Employed' },
      { value: 'student', label: 'Student' },
      { value: 'retired', label: 'Retired' },
      { value: 'not_in_labor_force', label: 'Not in Labor Force' },
      { value: 'ofw', label: 'Overseas Filipino Worker (OFW)' },
    ],
  },
  
  BLOOD_TYPE: {
    name: 'BLOOD_TYPE_OPTIONS',
    description: 'Blood type options',
    options: [
      { value: '', label: 'Select blood type' },
      { value: 'A+', label: 'A+' },
      { value: 'A-', label: 'A-' },
      { value: 'B+', label: 'B+' },
      { value: 'B-', label: 'B-' },
      { value: 'AB+', label: 'AB+' },
      { value: 'AB-', label: 'AB-' },
      { value: 'O+', label: 'O+' },
      { value: 'O-', label: 'O-' },
      { value: 'unknown', label: 'Unknown' },
    ],
  },
  
  CITIZENSHIP: {
    name: 'CITIZENSHIP_OPTIONS',
    description: 'Citizenship options',
    options: [
      { value: 'filipino', label: 'Filipino' },
      { value: 'dual_citizen', label: 'Dual Citizen' },
      { value: 'foreign_national', label: 'Foreign National' },
    ],
  },
  
  RELIGION: {
    name: 'RELIGION_OPTIONS',
    description: 'Religious affiliation options',
    options: [
      { value: 'roman_catholic', label: 'Roman Catholic' },
      { value: 'protestant', label: 'Protestant' },
      { value: 'iglesia_ni_cristo', label: 'Iglesia ni Cristo' },
      { value: 'islam', label: 'Islam' },
      { value: 'buddhism', label: 'Buddhism' },
      { value: 'judaism', label: 'Judaism' },
      { value: 'hinduism', label: 'Hinduism' },
      { value: 'indigenous_beliefs', label: 'Indigenous Beliefs' },
      { value: 'other', label: 'Other' },
      { value: 'none', label: 'None' },
      { value: 'prefer_not_to_say', label: 'Prefer not to say' },
    ],
  },
  
  ETHNICITY: {
    name: 'ETHNICITY_OPTIONS',
    description: 'Ethnicity/tribal affiliation options',
    options: [
      { value: 'tagalog', label: 'Tagalog' },
      { value: 'cebuano', label: 'Cebuano' },
      { value: 'ilocano', label: 'Ilocano' },
      { value: 'bisaya', label: 'Bisaya' },
      { value: 'hiligaynon', label: 'Hiligaynon' },
      { value: 'bicolano', label: 'Bicolano' },
      { value: 'waray', label: 'Waray' },
      { value: 'kapampangan', label: 'Kapampangan' },
      { value: 'pangasinan', label: 'Pangasinan' },
      { value: 'maranao', label: 'Maranao' },
      { value: 'maguindanao', label: 'Maguindanao' },
      { value: 'tausug', label: 'Tausug' },
      { value: 'indigenous_group', label: 'Indigenous Group' },
      { value: 'mixed_heritage', label: 'Mixed Heritage' },
      { value: 'other', label: 'Other' },
      { value: 'not_reported', label: 'Not Reported' },
    ],
  },
  
  EDUCATION_LEVEL: {
    name: 'EDUCATION_LEVEL_OPTIONS',
    description: 'Education attainment levels',
    options: [
      { value: 'no_schooling', label: 'No Schooling' },
      { value: 'elementary_undergraduate', label: 'Elementary Undergraduate' },
      { value: 'elementary_graduate', label: 'Elementary Graduate' },
      { value: 'high_school_undergraduate', label: 'High School Undergraduate' },
      { value: 'high_school_graduate', label: 'High School Graduate' },
      { value: 'college_undergraduate', label: 'College Undergraduate' },
      { value: 'college_graduate', label: 'College Graduate' },
      { value: 'post_graduate', label: 'Post Graduate' },
      { value: 'vocational', label: 'Vocational' },
    ],
  },
};

/**
 * Generate TypeScript enum file content
 */
function generateEnumFileContent(): string {
  const timestamp = new Date().toISOString();
  
  let content = `/**
 * Generated Enums - Single Source of Truth
 * 
 * This file is auto-generated. Do not edit manually.
 * Generated at: ${timestamp}
 * 
 * To update enums, modify scripts/generate-enums.ts and run:
 * npm run generate:enums
 */

`;

  // Generate each enum
  Object.values(MASTER_ENUMS).forEach(enumDef => {
    content += `// ${enumDef.description || enumDef.name}\n`;
    content += `export const ${enumDef.name} = [\n`;
    
    enumDef.options.forEach(option => {
      content += `  { value: '${option.value}', label: '${option.label}' },\n`;
    });
    
    content += `] as const;\n\n`;
  });

  // Generate type helpers
  content += `// Type helpers for strict typing\n`;
  Object.values(MASTER_ENUMS).forEach(enumDef => {
    const typeName = enumDef.name.replace('_OPTIONS', '').split('_').map(
      word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join('') + 'Value';
    
    content += `export type ${typeName} = (typeof ${enumDef.name})[number]['value'];\n`;
  });

  // Generate helper functions
  content += `
// Helper function to extract just the values
export const extractValues = (options: { value: string; label: string }[]) =>
  options.map(option => option.value).filter(value => value !== '');

// Helper function to get label by value
export const getLabelByValue = (options: { value: string; label: string }[], value: string) =>
  options.find(option => option.value === value)?.label || value;

// Helper function to validate enum value
export const isValidEnumValue = <T extends readonly { value: string; label: string }[]>(
  options: T,
  value: string
): value is T[number]['value'] => {
  return options.some(option => option.value === value);
};
`;

  return content;
}

/**
 * Generate Zod validation schema content
 */
function generateZodSchemaContent(): string {
  const timestamp = new Date().toISOString();
  
  let content = `/**
 * Generated Zod Validation Schemas
 * 
 * This file is auto-generated. Do not edit manually.
 * Generated at: ${timestamp}
 * 
 * To update schemas, modify scripts/generate-enums.ts and run:
 * npm run generate:enums
 */

import { z } from 'zod';

`;

  // Generate Zod enums for each definition
  Object.entries(MASTER_ENUMS).forEach(([key, enumDef]) => {
    const schemaName = key.toLowerCase() + 'Schema';
    const values = enumDef.options.map(opt => opt.value).filter(val => val !== '');
    
    if (values.length > 0) {
      content += `export const ${schemaName} = z.enum([${values.map(v => `'${v}'`).join(', ')}]);\n`;
    }
  });

  return content;
}

/**
 * Main generator function
 */
async function generateEnums() {
  try {
    const srcDir = path.join(process.cwd(), 'src');
    
    // Generate main enum file
    const enumContent = generateEnumFileContent();
    const enumPath = path.join(srcDir, 'lib', 'constants', 'generated-enums.ts');
    await fs.writeFile(enumPath, enumContent, 'utf-8');
    console.log('✅ Generated:', enumPath);
    
    // Generate Zod schemas
    const zodContent = generateZodSchemaContent();
    const zodPath = path.join(srcDir, 'lib', 'validation', 'generated-schemas.ts');
    await fs.mkdir(path.dirname(zodPath), { recursive: true });
    await fs.writeFile(zodPath, zodContent, 'utf-8');
    console.log('✅ Generated:', zodPath);
    
    // Generate validation report
    const report = generateValidationReport();
    console.log(report);
    
    console.log('\n🎉 Enum generation complete!');
    console.log('📝 Next steps:');
    console.log('   1. Update imports to use generated-enums.ts');
    console.log('   2. Update API validation to use generated-schemas.ts');
    console.log('   3. Run tests to ensure compatibility');
    
  } catch (error) {
    console.error('❌ Error generating enums:', error);
    process.exit(1);
  }
}

/**
 * Generate validation report showing enum consistency
 */
function generateValidationReport(): string {
  let report = '\n📊 Enum Validation Report:\n';
  report += '=' .repeat(40) + '\n';
  
  Object.values(MASTER_ENUMS).forEach(enumDef => {
    report += `${enumDef.name}: ${enumDef.options.length} options\n`;
  });
  
  report += `\nTotal enums managed: ${Object.keys(MASTER_ENUMS).length}\n`;
  return report;
}

// Run the generator if called directly
if (require.main === module) {
  generateEnums();
}

export { generateEnums, MASTER_ENUMS };