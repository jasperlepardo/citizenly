# Resident Services Domain Layer

## Directory Structure

This directory contains the domain logic for resident management, organized following Domain-Driven Design principles.

### Core Files

#### `residentService.ts`
- **Purpose**: Business logic orchestration
- **Responsibilities**: 
  - Validates resident data
  - Coordinates operations between repository and external services
  - Handles business rules and workflows
  - Manages PhilSys encryption

#### `residentRepository.ts`
- **Purpose**: Data access layer
- **Responsibilities**:
  - CRUD operations for residents
  - Complex queries and aggregations
  - Address and PSOC information fetching
  - Caching for performance optimization
  - Database transaction management

#### `residentMapper.ts`
- **Purpose**: Data transformation
- **Responsibilities**:
  - Form data ↔ Database schema mapping
  - API response formatting
  - Data type conversions
  - Option formatting for select components

#### `residentClassification.ts`
- **Purpose**: Unified classification system
- **Responsibilities**:
  - Sectoral demographics (PWD, senior citizens, indigenous, etc.)
  - Migration status and patterns
  - Vulnerability assessments
  - Statistical calculations for reporting
- **Key Functions**:
  - `classifyResident()` - Complete classification
  - `calculateResidentStatistics()` - Group statistics

#### `residentHelpers.ts`
- **Purpose**: General utility functions
- **Responsibilities**:
  - Field initialization
  - Computed field tooltips
  - Authentication validation
  - Session management helpers

#### `residentDisplayHelpers.ts`
- **Purpose**: Display formatting utilities
- **Responsibilities**:
  - Name formatting (full, compact)
  - Date formatting
  - Age calculation
  - Contact information display
  - Address formatting
  - Status display helpers

## Related Files

### Validation Rules
- **Location**: `src/lib/validation/resident-form-rules.ts`
- **Purpose**: Form validation and conditional field logic
- **Includes**:
  - Field dependency rules
  - Conditional visibility logic
  - Format validators (PhilSys, mobile numbers)
  - Date validation

## Usage Examples

### Creating a Resident
```typescript
import { residentService } from './residentService';

const result = await residentService.createResident({
  formData: residentData,
  userAddress: currentUserAddress,
  barangayCode: 'BGY001'
});
```

### Classifying a Resident
```typescript
import { classifyResident } from './residentClassification';

const classification = classifyResident({
  birthdate: '1960-01-01',
  employment_status: 'unemployed',
  previous_barangay_code: 'BGY002',
  // ... other context
});

// Returns:
// {
//   sectoral: { is_senior_citizen: true, is_unemployed: true, ... },
//   migration: { is_migrant: true, is_recent_migrant: false, ... },
//   vulnerabilities: ['senior_citizen', 'unemployed', ...]
// }
```

### Fetching Resident with Details
```typescript
import { ResidentRepository } from './residentRepository';

const repo = new ResidentRepository();
const result = await repo.fetchResidentDetailsOptimized(
  barangayCode,
  occupationCode
);
// Returns address info and PSOC info in one call
```

### Formatting for Display
```typescript
import { formatResidentFullName, formatDateCompact } from './residentDisplayHelpers';

const displayName = formatResidentFullName(resident);
const birthDate = formatDateCompact(resident.birthdate);
```

## Architecture Decisions

1. **Unified Classification**: Merged sectoral and migration classification into a single system for comprehensive resident analysis.

2. **Repository Pattern**: All data access goes through the repository layer, ensuring consistent error handling and caching.

3. **Display Helpers**: Consolidated all formatting functions to avoid duplication and ensure consistency across views.

4. **Form Rules Separation**: Moved form validation rules to lib/validation to keep domain logic pure.

5. **Performance Optimization**: Integrated specialized fetchers into repository with caching for frequently accessed data (PSOC, addresses).

## Best Practices

1. **Never access database directly** - Always use the repository
2. **Use classification system** for demographic analysis
3. **Use display helpers** for all UI formatting
4. **Validate through service layer** before database operations
5. **Cache expensive lookups** (PSOC, address hierarchies)

## Testing

Each file should have corresponding test files:
- `residentService.test.ts`
- `residentRepository.test.ts`
- `residentMapper.test.ts`
- `residentClassification.test.ts`
- `residentHelpers.test.ts`
- `residentDisplayHelpers.test.ts`

## Migration Notes

### Recent Changes (September 2024)
- Consolidated `residentDetailHelpers.ts` and `residentListingHelpers.ts` into `residentDisplayHelpers.ts`
- Merged `sectoralClassification.ts` and `migrationClassification.ts` into `residentClassification.ts`
- Integrated `residentDetailsFetcher.ts` methods into `residentRepository.ts`
- Moved `residentFormRules.ts` to `src/lib/validation/resident-form-rules.ts`

### Import Updates Required
```typescript
// Old imports
import { formatResidentDetailFullName } from './residentDetailHelpers';
import { formatResidentListFullName } from './residentListingHelpers';
import { classifySectoral } from './sectoralClassification';
import { fetchAddressInfo } from './residentDetailsFetcher';

// New imports
import { formatResidentFullName } from './residentDisplayHelpers';
import { classifyResident } from './residentClassification';
import { ResidentRepository } from './residentRepository';
const repo = new ResidentRepository();
await repo.fetchAddressInfo(barangayCode);
```