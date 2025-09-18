# src/lib Documentation

## Overview

The `src/lib` directory contains the core business logic, utilities, and shared code for the Citizenly application. This library follows a security-first, modular architecture with comprehensive TypeScript typing and proper separation of concerns.

**Architecture Grade: A-** - Reorganized with clear separation between lib utilities and services layer

## Recent Reorganization (August 2023)

This directory has been **significantly reorganized** to follow traditional React/Next.js patterns:

- **Services layer moved to `src/services/`** - All data access, repositories, business services
- **Utilities remain in `src/lib/`** - Core utilities, configurations, security, validation
- **Types consolidated in `src/types/`** - Centralized type definitions
- **Improved barrel exports** - Better developer experience with cleaner imports

## Directory Structure

```
src/lib/
├── business-rules/          # Domain-specific business logic
│   ├── sectoral-classification.ts
│   └── resident-form-rules.ts
├── charts/                  # Chart data transformation utilities
│   ├── transformers.ts
│   └── index.ts
├── constants/               # Application constants and enums
│   ├── residentEnums.ts
│   ├── formOptions.ts
│   └── generatedEnums.ts
├── error-handling/          # Centralized error management
│   ├── error-types.ts
│   ├── error-utils.ts
│   ├── error-boundaries.ts
│   └── index.ts
├── forms/                   # Form-specific business logic
│   ├── handlers.ts
│   ├── field-logic.ts
│   └── index.ts
├── graphics/                # Graphics and visualization utilities
│   ├── pie-chart-math.ts
│   ├── color-generator.ts
│   └── index.ts
├── mappers/                 # Data transformation utilities
│   ├── resident-mapper.ts
│   ├── form-data-transformers.ts
│   └── __tests__/
├── optimizers/              # Performance optimization modules
│   ├── household-fetcher.ts
│   ├── resident-details-fetcher.ts
│   └── __tests__/
├── statistics/              # Statistics calculation utilities
│   ├── population-pyramid.ts
│   └── index.ts
├── types/                   # TypeScript type definitions
│   ├── forms.ts
│   ├── index.ts
│   └── README.md
├── utils/                   # Helper utilities
│   ├── resident-helpers.ts
│   ├── search-utilities.ts
│   ├── validation-utilities.ts
│   └── residentDetailHelpers.ts
├── validation/              # Validation schemas and utilities
│   ├── resident-schema.ts
│   ├── field-level-schemas.ts
│   └── generated-schemas.ts
└── __tests__/               # Test files
    ├── api-responses.test.ts
    ├── rateLimit.test.ts
    └── utils.test.ts
```

## Core Modules

### 🏛️ Business Rules (`/business-rules`)

Contains domain-specific business logic and classification algorithms.

**Key Files:**

- `sectoral-classification.ts` - RBI sectoral group classification logic
- `resident-form-rules.ts` - Form-specific business rules

**Usage:**

```typescript
import {
  calculateAge,
  isOutOfSchoolChildren,
  updateSectoralInformation,
} from '@/lib/business-rules';

const age = calculateAge('1990-01-01');
const isOSC = isOutOfSchoolChildren(age, 'elementary');
```

### 📊 Charts (`/charts`)

Chart data transformation and visualization utilities.

**Key Files:**

- `transformers.ts` - Data transformation for charts

**Usage:**

```typescript
import { transformSexData, CHART_COLORS } from '@/lib/charts';

const chartData = transformSexData({ male: 120, female: 135 });
```

### ⚙️ Constants (`/constants`)

Application-wide constants, enums, and configuration values.

**Key Files:**

- `residentEnums.ts` - Resident-related enumerations
- `formOptions.ts` - Form option definitions

**Usage:**

```typescript
import { CIVIL_STATUS_OPTIONS, EMPLOYMENT_STATUS_OPTIONS } from '@/lib/constants';
```

### 🚨 Error Handling (`/error-handling`)

Centralized error management and boundary components.

**Key Files:**

- `error-types.ts` - Error type definitions
- `error-utils.ts` - Error utility functions
- `error-boundaries.ts` - React error boundaries

**Usage:**

```typescript
import { createAppError, ErrorCode, ErrorSeverity } from '@/lib/error-handling';

const error = createAppError('Validation failed', {
  code: ErrorCode.VALIDATION_ERROR,
  severity: ErrorSeverity.MEDIUM,
});
```

### 📝 Forms (`/forms`)

Form-specific business logic and field handlers.

**Key Files:**

- `handlers.ts` - Form change handlers
- `field-logic.ts` - Field-specific logic

**Usage:**

```typescript
import { createFieldChangeHandler, isFieldReadOnly } from '@/lib/forms';

const handleChange = createFieldChangeHandler(formData, setFormData);
```

### 🎨 Graphics (`/graphics`)

Graphics utilities and mathematical functions for visualizations.

**Key Files:**

- `pie-chart-math.ts` - Pie chart calculations
- `color-generator.ts` - Color generation utilities

**Usage:**

```typescript
import { createPieSlicePath, calculateSliceAngles } from '@/lib/graphics';

const path = createPieSlicePath(startAngle, endAngle, radius);
```

### 🔄 Mappers (`/mappers`)

Data transformation between different formats (API ↔ Form ↔ Database).

**Key Files:**

- `resident-mapper.ts` - Resident data transformations
- `form-data-transformers.ts` - Form data transformations

**Usage:**

```typescript
import { mapApiToForm, mapFormToApi } from '@/lib/mappers';

const formData = mapApiToForm(apiResponse);
const apiData = mapFormToApi(formData);
```

### ⚡ Optimizers (`/optimizers`)

Performance optimization utilities for data fetching and processing.

**Key Files:**

- `household-fetcher.ts` - Optimized household data fetching
- `resident-details-fetcher.ts` - Resident details optimization

**Usage:**

```typescript
import { batchFetchHouseholdHeads } from '@/lib/optimizers';

const householdHeads = await batchFetchHouseholdHeads(householdIds);
```

### 📈 Statistics (`/statistics`)

Statistical calculations and data processing utilities.

**Key Files:**

- `population-pyramid.ts` - Population pyramid calculations

**Usage:**

```typescript
import { calculatePopulationStats, processAgeGroups } from '@/lib/statistics';

const stats = calculatePopulationStats(ageGroupData);
```

### 🏷️ Types (`/types`)

Comprehensive TypeScript type definitions.

**Key Files:**

- `forms.ts` - Form-related types
- `index.ts` - Main type exports

**Usage:**

```typescript
import { ResidentFormData, SectoralInformation } from '@/lib/types';
```

### 🛠️ Utils (`/utils`)

General utility functions and helpers.

**Key Files:**

- `resident-helpers.ts` - Resident-specific utilities
- `search-utilities.ts` - Search and filtering utilities
- `validation-utilities.ts` - Validation helpers

**Usage:**

```typescript
import { formatDisplayName, calculateAge } from '@/lib/utils';

const displayName = formatDisplayName(resident);
```

### ✅ Validation (`/validation`)

Validation schemas and utilities using Zod.

**Key Files:**

- `resident-schema.ts` - Resident validation schemas
- `field-level-schemas.ts` - Field-level validation

**Usage:**

```typescript
import { residentFormSchema, validateResidentData } from '@/lib/validation';

const result = residentFormSchema.safeParse(formData);
```

## Security Features

### 🔒 Input Sanitization

All user inputs are sanitized to prevent XSS and injection attacks:

```typescript
// From validation.ts
function sanitizeString(str: string): string {
  return str
    .trim()
    .replace(/[<>"'&]/g, '') // Remove potential XSS characters
    .substring(0, 255); // Limit length to prevent DoS
}
```

### 🛡️ PII Protection

Sensitive data like PhilSys card numbers are encrypted:

```typescript
// From crypto.ts
export async function encryptPII(data: string): Promise<string> {
  // AES-256-GCM encryption for sensitive data
}
```

### 🔐 Authentication & Authorization

Comprehensive auth utilities with proper error handling:

```typescript
// From auth.ts
export async function validateUserAccess(
  userId: string,
  resource: string,
  action: string
): Promise<boolean>;
```

## Performance Optimizations

### ⚡ Query Batching

Eliminates N+1 query problems:

```typescript
// Before: N individual queries
// After: 1 batch query
export const batchFetchHouseholdHeads = async (
  householdHeadIds: string[]
): Promise<Map<string, HouseholdHead>>
```

### 🗄️ Caching

Intelligent caching with TTL:

```typescript
// From query-cache.ts
export class QueryCache {
  private cache = new Map<string, CacheEntry>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
}
```

### 🎯 Debouncing

User input optimization:

```typescript
// From performance.ts
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): DebounceFunction<T>;
```

## Error Handling Strategy

### 📊 Error Types

Structured error handling with severity levels:

```typescript
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface AppError extends Error {
  code?: string;
  context?: Record<string, any>;
  timestamp?: Date;
  severity?: ErrorSeverity;
}
```

### 🔧 Error Boundaries

React error boundaries for graceful failures:

```typescript
// From error-boundaries.ts
export class ErrorBoundary extends React.Component {
  // Catches and handles component errors
}
```

## Usage Examples

### Basic Import Pattern

```typescript
// Recommended: Use barrel exports
import { calculateAge, formatDisplayName, createAppError } from '@/lib';

// Alternative: Direct imports for tree shaking
import { calculateAge } from '@/lib/business-rules/sectoral-classification';
```

### Form Handling

```typescript
import { createFieldChangeHandler, mapFormToApi, residentFormSchema } from '@/lib';

const FormComponent = () => {
  const [formData, setFormData] = useState<ResidentFormData>({});

  const handleFieldChange = createFieldChangeHandler(formData, setFormData);

  const handleSubmit = async () => {
    const validation = residentFormSchema.safeParse(formData);
    if (validation.success) {
      const apiData = mapFormToApi(formData);
      // Submit to API
    }
  };
};
```

### Error Handling

```typescript
import { createAppError, ErrorCode, withErrorBoundary } from '@/lib';

const ComponentWithErrorHandling = withErrorBoundary(() => {
  const handleError = (error: unknown) => {
    const appError = createAppError('Operation failed', {
      code: ErrorCode.VALIDATION_ERROR,
      context: { operation: 'user_input' },
    });
    // Handle error appropriately
  };
});
```

## Testing Strategy

### 🧪 Unit Tests

Located in `__tests__/` directories:

```typescript
// Example test structure
describe('calculateAge', () => {
  it('should calculate correct age', () => {
    const age = calculateAge('1990-01-01');
    expect(age).toBeGreaterThan(30);
  });
});
```

### ⚠️ Current Test Coverage

- **Total Files**: 88
- **Test Files**: 3
- **Coverage**: ~3% (Needs improvement)

**Priority for testing:**

1. Business rules validation
2. Data transformation functions
3. Security utilities
4. Error handling logic

## Development Guidelines

### 📝 Adding New Modules

1. **Create module directory** with proper structure:

   ```
   src/lib/new-module/
   ├── index.ts          # Barrel exports
   ├── main-logic.ts     # Core implementation
   └── __tests__/        # Unit tests
   ```

2. **Add to main barrel export**:

   ```typescript
   // src/lib/index.ts
   export * from './new-module';
   ```

3. **Follow naming conventions**:
   - Use kebab-case for file names
   - Use camelCase for functions
   - Use PascalCase for types/interfaces

### 🔒 Security Checklist

- [ ] Input validation with Zod schemas
- [ ] Output sanitization for XSS prevention
- [ ] SQL injection prevention
- [ ] PII encryption for sensitive data
- [ ] Proper error handling without data leakage
- [ ] Rate limiting for API endpoints

### ⚡ Performance Checklist

- [ ] Implement caching where appropriate
- [ ] Use batch operations for database queries
- [ ] Debounce user inputs
- [ ] Optimize data transformations
- [ ] Minimize bundle size with tree shaking

## Known Issues & TODOs

### 🚨 High Priority

- [ ] Resolve circular dependency risks in barrel exports
- [ ] Consolidate duplicate utility functions
- [ ] Improve test coverage to >80%
- [ ] Complete audit logging implementation

### 🔧 Medium Priority

- [ ] Implement repository pattern for data access
- [ ] Add comprehensive error monitoring
- [ ] Standardize validation patterns
- [ ] Optimize performance bottlenecks

### 📈 Low Priority

- [ ] Add migration utilities
- [ ] Implement backup/restore capabilities
- [ ] Enhance real-time data synchronization
- [ ] Improve documentation with more examples

## Contributing

### Pull Request Guidelines

1. **Add unit tests** for new functionality
2. **Update documentation** for API changes
3. **Follow security guidelines** for data handling
4. **Ensure backward compatibility** when possible
5. **Run linting and type checking** before submission

### Code Review Checklist

- [ ] Security implications reviewed
- [ ] Performance impact assessed
- [ ] Test coverage adequate
- [ ] Documentation updated
- [ ] Breaking changes documented

## Migration Guide

### From Components to Lib

When moving business logic from components to lib:

1. **Extract pure functions** first
2. **Move types** to appropriate type modules
3. **Update imports** in components
4. **Add unit tests** for extracted logic
5. **Update documentation**

### Example Migration

```typescript
// Before: In component file
const calculateAge = (birthdate: string) => {
  // Complex logic
};

// After: In lib/business-rules
export const calculateAge = (birthdate: string): number => {
  // Same logic but properly typed and tested
};

// Component update
import { calculateAge } from '@/lib/business-rules';
```

## Support

For questions or issues with the lib directory:

1. Check existing documentation
2. Review similar implementations in codebase
3. Consult security guidelines for sensitive operations
4. Create GitHub issue for architectural questions

---

**Last Updated**: 2025-01-17  
**Audit Grade**: B+  
**Security Status**: ✅ Good  
**Performance Status**: ✅ Good  
**Test Coverage**: ⚠️ Needs Improvement (3%)
