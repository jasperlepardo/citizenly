# Household Services Domain Layer

## Directory Structure

This directory contains the domain logic for household management, organized following Domain-Driven Design principles.

### Core Files

#### `householdService.ts`
- **Purpose**: Business logic orchestration
- **Responsibilities**: 
  - Validates household data
  - Coordinates operations between repository and external services
  - Handles business rules and workflows
  - Manages household code generation

#### `householdRepository.ts`
- **Purpose**: Data access layer
- **Responsibilities**:
  - CRUD operations for households
  - Complex queries and aggregations
  - Optimized household search with head fetching
  - Batch operations to prevent N+1 queries
  - Caching for performance optimization

#### `householdMapper.ts`
- **Purpose**: Data transformation
- **Responsibilities**:
  - Form data ↔ Database schema mapping
  - API response formatting
  - Data type conversions
  - Validation error mapping
  - Default form data creation

#### `householdDisplayHelpers.ts`
- **Purpose**: Display formatting utilities
- **Responsibilities**:
  - Household name and address formatting
  - Income and member count display
  - Status badge generation
  - Type and tenure status formatting
  - Option formatting for select components

## Usage Examples

### Creating a Household
```typescript
import { householdService } from './householdService';

const result = await householdService.createHousehold({
  formData: householdData,
  userAddress: currentUserAddress,
  barangay_code: 'BGY001'
});
```

### Searching Households with Optimization
```typescript
import { HouseholdRepository } from './householdRepository';

const repo = new HouseholdRepository();
const result = await repo.searchHouseholdsOptimized(
  'BGY001',    // barangay code
  'HH-001',    // search query
  20           // limit
);

// Returns optimized results with cached household head information
// Eliminates N+1 query problem through batch fetching
```

### Formatting for Display
```typescript
import { 
  formatHouseholdName, 
  formatHouseholdIncome,
  formatHouseholdSize,
  getHouseholdStatusBadge 
} from './householdDisplayHelpers';

const displayName = formatHouseholdName(household);
const income = formatHouseholdIncome(household.monthly_income);
const size = formatHouseholdSize(household.no_of_household_members);
const badge = getHouseholdStatusBadge(household);
```

### Data Transformation
```typescript
import { 
  mapFormToDatabase, 
  mapDatabaseToForm,
  createDefaultFormData 
} from './householdMapper';

// Form to database
const dbData = mapFormToDatabase(formData);

// Database to form
const formData = mapDatabaseToForm(householdRecord);

// Create default form
const defaultData = createDefaultFormData('BGY001', 'HH-001');
```

## Architecture Features

### Performance Optimizations

1. **Batch Household Head Fetching**: 
   - Eliminates N+1 query problems
   - Fetches all household heads in a single query
   - Uses Map for O(1) lookup

2. **Caching Layer**:
   - 5-minute TTL for search results
   - Cache invalidation on data updates
   - Reduced database load for frequent queries

3. **Optimized Queries**:
   - Joins with street and subdivision data
   - Proper indexing on search fields
   - Limited result sets for performance

### Data Consistency

1. **Validation**: Form data validated before database operations
2. **Code Generation**: Automatic household code generation with barangay prefix
3. **Status Management**: Soft deletes with `is_active` flag
4. **Audit Trail**: Created/updated timestamps automatically managed

## Best Practices

1. **Never access database directly** - Always use the repository
2. **Use batch operations** for multiple household head fetches
3. **Use display helpers** for all UI formatting
4. **Validate through service layer** before database operations
5. **Clear cache** after data modifications

## Performance Considerations

### Before Optimization (N+1 Problem):
```
Query 1: SELECT * FROM households WHERE barangay_code = 'BGY001'
Query 2: SELECT * FROM residents WHERE id = 'head_1'
Query 3: SELECT * FROM residents WHERE id = 'head_2'
Query 4: SELECT * FROM residents WHERE id = 'head_3'
... (N more queries for N households)
```

### After Optimization (Batch Fetch):
```
Query 1: SELECT * FROM households WHERE barangay_code = 'BGY001'
Query 2: SELECT * FROM residents WHERE id IN ('head_1', 'head_2', 'head_3', ...)
```

**Result**: O(1) database queries instead of O(N), dramatically improving performance.

## Testing

Each file should have corresponding test files:
- `householdService.test.ts`
- `householdRepository.test.ts`
- `householdMapper.test.ts`
- `householdDisplayHelpers.test.ts`

## Recent Changes (September 2024)

### Consolidation Completed
- **Integrated** `householdFetcher.ts` functionality into `householdRepository.ts`
- **Added** `householdMapper.ts` for data transformation consistency
- **Added** `householdDisplayHelpers.ts` for UI formatting consistency
- **Enhanced** repository with performance optimizations and caching

### Benefits
- **Reduced from 3 files to 4 files** (but with better separation of concerns)
- **Eliminated N+1 query problems**
- **Added comprehensive caching**
- **Consistent patterns** with residents domain
- **Better maintainability** with clear responsibilities

### Import Updates Required
```typescript
// Old imports
import { searchHouseholdsOptimized } from './householdFetcher';
import { batchFetchHouseholdHeads } from './householdFetcher';

// New imports
import { HouseholdRepository } from './householdRepository';
const repo = new HouseholdRepository();
await repo.searchHouseholdsOptimized(barangayCode, query, limit);
await repo.batchFetchHouseholdHeads(headIds);
```

The household services domain layer now provides a complete, optimized solution for household management with proper separation of concerns and performance optimizations.