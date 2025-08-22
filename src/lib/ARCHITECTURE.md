# src/lib Architecture Documentation

## Overview

This document provides a comprehensive architectural overview of the `src/lib` directory, detailing design decisions, patterns, and the rationale behind the current structure.

## Architectural Principles

### 1. Security-First Design
Every module prioritizes security with:
- Input validation and sanitization
- PII encryption and protection
- SQL injection prevention
- XSS protection
- Proper error handling without data leakage

### 2. Separation of Concerns
Clear boundaries between:
- **Business Logic**: Domain-specific rules and calculations
- **Data Access**: Database and API interactions
- **Utilities**: Helper functions and transformations
- **Types**: Type definitions and interfaces
- **Validation**: Input validation and schemas

### 3. Modularity and Reusability
- Self-contained modules with clear interfaces
- Minimal coupling between modules
- Reusable utilities across the application
- Proper abstraction layers

### 4. Performance Optimization
- Query batching to eliminate N+1 problems
- Intelligent caching strategies
- Debouncing and throttling
- Efficient data transformations

## Architectural Layers

```
┌─────────────────────────────────────────┐
│                Components               │ ← UI Layer
├─────────────────────────────────────────┤
│              src/lib (API)              │ ← Business Logic Layer
├─────────────────────────────────────────┤
│     Database/External Services          │ ← Data Layer
└─────────────────────────────────────────┘
```

### Layer Responsibilities

**UI Layer (Components)**
- Presentation logic only
- User interaction handling
- State management for UI
- Delegating business logic to lib

**Business Logic Layer (src/lib)**
- Domain rules and calculations
- Data validation and transformation
- Error handling and logging
- Performance optimizations
- Security implementations

**Data Layer (Database/Services)**
- Data persistence
- External API integrations
- Raw data operations

## Module Architecture

### Core Module Pattern

Each module follows a consistent structure:

```
module-name/
├── index.ts              # Barrel exports
├── core-logic.ts         # Main implementation
├── types.ts              # Module-specific types (if needed)
├── utils.ts              # Module utilities (if needed)
└── __tests__/            # Unit tests
    ├── core-logic.test.ts
    └── utils.test.ts
```

### Dependency Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  business-rules │────│     types       │────│   validation    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     forms       │────│     mappers     │────│     utils       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  error-handling │────│   optimizers    │────│   constants     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Key Principles:**
- `types` module has no dependencies (foundational)
- `business-rules` depends only on `types` and `validation`
- `utils` provides helper functions for other modules
- `error-handling` is used across all modules

## Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────────┐
│          Input Validation               │ ← First Line
├─────────────────────────────────────────┤
│         Data Sanitization               │ ← Second Line
├─────────────────────────────────────────┤
│       Business Rule Validation          │ ← Third Line
├─────────────────────────────────────────┤
│        Database Constraints             │ ← Final Line
└─────────────────────────────────────────┘
```

### Security Layers Implementation

**1. Input Validation (`/validation`)**
```typescript
// Zod schemas with strict validation
const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .regex(NAME_REGEX, 'Name contains invalid characters')
  .transform(sanitizeString);
```

**2. Data Sanitization (`validation.ts`)**
```typescript
function sanitizeString(str: string): string {
  return str
    .trim()
    .replace(/[<>"'&]/g, '') // Remove potential XSS characters
    .substring(0, 255); // Limit length to prevent DoS
}
```

**3. PII Protection (`crypto.ts`)**
```typescript
export async function encryptPII(data: string): Promise<string> {
  // AES-256-GCM encryption for sensitive data
  // Key derivation from environment variables
  // Secure random IV generation
}
```

**4. SQL Injection Prevention**
```typescript
function sanitizeSearchInput(input: string): string {
  return input
    .replace(/[%_]/g, '\\$&') // Escape SQL wildcards
    .replace(/['"]/g, '') // Remove quotes
    .replace(/[;\\]/g, '') // Remove dangerous characters
    .trim()
    .slice(0, 100); // Limit length
}
```

## Performance Architecture

### Optimization Strategies

**1. Query Optimization (`/optimizers`)**
```typescript
// Before: N+1 Problem
households.forEach(async (household) => {
  const head = await fetchHouseholdHead(household.head_id);
});

// After: Batch Operation
const heads = await batchFetchHouseholdHeads(householdIds);
```

**2. Caching Strategy (`query-cache.ts`)**
```typescript
class QueryCache {
  private cache = new Map<string, CacheEntry>();
  
  async get<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && !this.isExpired(cached)) {
      return cached.data;
    }
    
    const data = await fetcher();
    this.set(key, data);
    return data;
  }
}
```

**3. Debouncing (`performance.ts`)**
```typescript
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): DebounceFunction<T> {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
```

## Data Flow Architecture

### Form Data Lifecycle

```
User Input
    ↓
┌─────────────────┐
│  Input Field    │ ← Component Layer
└─────────────────┘
    ↓
┌─────────────────┐
│ Field Validation│ ← lib/validation
└─────────────────┘
    ↓
┌─────────────────┐
│  Form Handler   │ ← lib/forms
└─────────────────┘
    ↓
┌─────────────────┐
│ Business Rules  │ ← lib/business-rules
└─────────────────┘
    ↓
┌─────────────────┐
│  Data Mapper    │ ← lib/mappers
└─────────────────┘
    ↓
┌─────────────────┐
│   API Call      │ ← External Service
└─────────────────┘
```

### Error Propagation

```
Error Source
    ↓
┌─────────────────┐
│ Error Detection │ ← Any Module
└─────────────────┘
    ↓
┌─────────────────┐
│ Error Creation  │ ← lib/error-handling
└─────────────────┘
    ↓
┌─────────────────┐
│ Error Logging   │ ← lib/secure-logger
└─────────────────┘
    ↓
┌─────────────────┐
│ Error Boundary  │ ← Component Layer
└─────────────────┘
    ↓
┌─────────────────┐
│ User Feedback   │ ← UI Display
└─────────────────┘
```

## Type System Architecture

### Type Hierarchy

```
┌─────────────────────────────────────────┐
│              Database Types             │ ← Generated from DB
├─────────────────────────────────────────┤
│              Domain Types               │ ← Business entities
├─────────────────────────────────────────┤
│               Form Types                │ ← UI interaction
├─────────────────────────────────────────┤
│               API Types                 │ ← External interface
└─────────────────────────────────────────┘
```

### Type Relationships

```typescript
// Database Type (snake_case)
interface ResidentDatabaseRecord {
  first_name: string;
  last_name: string;
  birth_date: string;
}

// Form Type (camelCase)
interface ResidentFormData {
  firstName: string;
  lastName: string;
  birthDate: string;
}

// API Type (matches external API)
interface ResidentApiData {
  first_name: string;
  last_name: string;
  birth_date: string;
}
```

### Type Transformation Pipeline

```
Database ←→ Domain ←→ Form ←→ API
    ↑         ↑       ↑       ↑
    │         │       │       │
  Mappers   Business  UI    External
           Rules    Logic   Services
```

## Error Handling Architecture

### Error Classification

```typescript
enum ErrorCode {
  // Validation Errors (4xx equivalent)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Business Logic Errors (4xx equivalent)
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  
  // System Errors (5xx equivalent)
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
```

### Error Severity Levels

```typescript
enum ErrorSeverity {
  LOW = 'low',       // User can continue, minor issues
  MEDIUM = 'medium', // User should be notified, recoverable
  HIGH = 'high',     // User action blocked, needs attention
  CRITICAL = 'critical', // System integrity at risk
}
```

### Error Handling Flow

```
Error Occurs
    ↓
┌─────────────────┐
│   Catch Error   │
└─────────────────┘
    ↓
┌─────────────────┐
│  Classify Error │ ← Determine code & severity
└─────────────────┘
    ↓
┌─────────────────┐
│   Log Error     │ ← Secure logging with context
└─────────────────┘
    ↓
┌─────────────────┐
│ Create AppError │ ← Standardized error object
└─────────────────┘
    ↓
┌─────────────────┐
│  Handle Error   │ ← Component error boundary
└─────────────────┘
```

## Testing Architecture

### Testing Pyramid

```
┌─────────────────┐
│  E2E Tests      │ ← Few, expensive, full flow
├─────────────────┤
│ Integration     │ ← Some, module interactions
├─────────────────┤
│  Unit Tests     │ ← Many, fast, isolated
└─────────────────┘
```

### Current Testing Strategy

**Unit Tests** (`__tests__/`)
- Pure function testing
- Business logic validation
- Utility function verification
- Error handling scenarios

**Integration Tests** (Planned)
- Module interaction testing
- API integration testing
- Database operation testing

**Security Tests** (Planned)
- Input validation testing
- XSS prevention verification
- SQL injection prevention
- Authentication flow testing

## Deployment Architecture

### Build Process

```
Source Code
    ↓
┌─────────────────┐
│ TypeScript      │ ← Type checking
│ Compilation     │
└─────────────────┘
    ↓
┌─────────────────┐
│   Tree Shaking  │ ← Remove unused code
└─────────────────┘
    ↓
┌─────────────────┐
│   Bundling      │ ← Optimize imports
└─────────────────┘
    ↓
┌─────────────────┐
│  Minification   │ ← Reduce size
└─────────────────┘
    ↓
Production Bundle
```

### Environment Configuration

```typescript
// Environment-specific configurations
interface EnvironmentConfig {
  database: DatabaseConfig;
  api: ApiConfig;
  security: SecurityConfig;
  performance: PerformanceConfig;
}

// Development
const developmentConfig: EnvironmentConfig = {
  database: { /* dev settings */ },
  security: { strictMode: false },
  performance: { cacheEnabled: false }
};

// Production
const productionConfig: EnvironmentConfig = {
  database: { /* prod settings */ },
  security: { strictMode: true },
  performance: { cacheEnabled: true }
};
```

## Future Architecture Considerations

### Scalability Improvements

1. **Micro-frontends Support**
   - Module federation compatibility
   - Independent deployment capability
   - Shared lib packages

2. **Real-time Features**
   - WebSocket integration
   - Live data synchronization
   - Event-driven architecture

3. **Advanced Caching**
   - Redis integration
   - Distributed caching
   - Cache invalidation strategies

### Performance Enhancements

1. **Code Splitting**
   - Dynamic imports for large modules
   - Route-based splitting
   - Component-level splitting

2. **Web Workers**
   - Heavy computation offloading
   - Background data processing
   - Non-blocking operations

3. **Service Workers**
   - Offline capability
   - Background sync
   - Push notifications

### Security Enhancements

1. **Zero Trust Architecture**
   - Continuous verification
   - Least privilege access
   - Micro-segmentation

2. **Advanced Monitoring**
   - Real-time threat detection
   - Anomaly detection
   - Automated response

## Maintenance Guidelines

### Regular Maintenance Tasks

1. **Dependency Updates**
   - Monthly security updates
   - Quarterly major version updates
   - Continuous vulnerability scanning

2. **Performance Monitoring**
   - Bundle size tracking
   - Memory leak detection
   - Performance regression testing

3. **Security Audits**
   - Quarterly penetration testing
   - Code security reviews
   - Compliance verification

### Refactoring Guidelines

1. **When to Refactor**
   - Code complexity > threshold
   - Performance degradation
   - Security vulnerabilities
   - Maintainability issues

2. **Refactoring Process**
   - Identify problem areas
   - Create refactoring plan
   - Implement incrementally
   - Verify functionality
   - Update documentation

---

**Architecture Version**: 1.0  
**Last Updated**: 2025-01-17  
**Review Schedule**: Quarterly  
**Next Review**: 2025-04-17