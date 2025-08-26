# Type Organization Guide

This document clarifies the type organization strategy used in the Citizenly codebase.

## 📁 Directory Structure

### `src/types/` - **Domain/Business Types**

Contains comprehensive type definitions for core business domains:

- **Domain Entities**: `residents.ts`, `households.ts`, `auth.ts`
- **API Communication**: `api.ts`, `database.ts`
- **User Interface**: `forms.ts`, `charts.ts`
- **Geographic Data**: `geographic.ts`
- **Relationships**: `relationships.ts`

**Usage:** Import domain types that represent core business concepts.

```typescript
import type { ResidentFormData, HouseholdRecord } from '@/types';
```

### `src/lib/types/` - **Utility/Framework Types**

Contains utility types focused on specific library functions:

- **Helper Functions**: `resident-detail.ts`, `resident-listing.ts`
- **Framework Integration**: `forms.ts`, `database.ts`
- **Internal Library Types**: Types used internally by `src/lib/` modules

**Usage:** Import utility types needed for library/framework integration.

```typescript
import type { FormSectionProps } from '@/lib/types';
```

## 🎯 Decision Guidelines

### Use `src/types/` when:

- ✅ Defining core business entities (Resident, Household, User)
- ✅ Creating API request/response interfaces
- ✅ Defining form data structures used across multiple components
- ✅ Setting up domain-specific enums and constants

### Use `src/lib/types/` when:

- ✅ Creating types for utility functions within `src/lib/`
- ✅ Defining internal implementation details of library modules
- ✅ Types that are tightly coupled to specific utility functions

## 🔄 Import Patterns

### Recommended Imports

```typescript
// Domain types - use main barrel export
import type { ResidentFormData, HouseholdRecord } from '@/types';

// Utility types - use lib barrel export when needed
import type { FormSectionProps } from '@/lib/types';
```

### Avoid

```typescript
// Don't import directly from subdirectories
import type { ResidentFormData } from '@/types/residents'; // ❌
import type { FormSectionProps } from '@/lib/types/forms'; // ❌
```

## 📚 Type Guidelines

### Domain Types (`src/types/`)

- Should be **business-focused** and represent real-world entities
- Can be **large and comprehensive** with many fields
- Should be **stable** and change infrequently
- Often used across **multiple components and modules**

### Utility Types (`src/lib/types/`)

- Should be **implementation-focused** and support library functions
- Can be **small and specific** to particular use cases
- Can **evolve rapidly** with utility function changes
- Often used within **single modules or related functions**

---

**Last Updated:** August 24, 2025  
**Audit Status:** ✅ Consolidated and Clarified
