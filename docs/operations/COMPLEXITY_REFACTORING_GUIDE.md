# Code Complexity Refactoring Guide

## Current Critical Issues (Priority Order)

### 🚨 URGENT (Immediate Action Required)
1. **CascadingGeographicSelector** (588 lines, Cognitive: 159)
   - Split into 4-5 smaller components
   - Extract state management to custom hook
   - Separate validation logic
   
2. **DropdownSelect** (614 lines, Cognitive: 43)
   - Extract keyboard navigation logic
   - Separate accessibility features
   - Create reusable dropdown hook

### 🔥 HIGH PRIORITY 
3. **DataTable** (408 lines, Cognitive: 62)
   - Extract sorting/filtering logic
   - Create separate column renderer components
   - Use composition pattern for features

4. **CreateHouseholdModal** (566 lines, Cognitive: 54)
   - Split form into step components
   - Extract validation to separate module
   - Create form state management hook

5. **AddressSelector** (322 lines, Cognitive: 51)
   - Extract address search logic
   - Separate display from business logic
   - Create address validation utilities

## Refactoring Strategies

### Component Splitting
```typescript
// Before: Large component with multiple responsibilities
function LargeComponent() {
  // 500+ lines of mixed concerns
}

// After: Focused components with single responsibilities
function MainComponent() {
  return (
    <ComponentHeader />
    <ComponentBody />
    <ComponentFooter />
  );
}
```

### Custom Hooks for Logic
```typescript
// Extract complex state management
function useGeographicSelection() {
  // Geographic selection logic
  return { regions, provinces, cities, barangays, handlers };
}

// Extract validation logic
function useAddressValidation() {
  // Address validation logic
  return { validate, errors, isValid };
}
```

### Utility Functions
```typescript
// Extract conditional logic to utility functions
function validatePhilSysNumber(number: string): ValidationResult {
  // Complex validation logic extracted
}

function formatGeographicHierarchy(data: GeographicData): FormattedData {
  // Complex formatting logic extracted
}
```

## Implementation Timeline

### Week 1: Critical Components
- [ ] Refactor CascadingGeographicSelector
- [ ] Refactor DropdownSelect

### Week 2: High Priority Components  
- [ ] Refactor DataTable
- [ ] Refactor CreateHouseholdModal

### Week 3: Medium Priority & Prevention
- [ ] Refactor AddressSelector
- [ ] Implement complexity pre-commit checks
- [ ] Create component size guidelines

## Prevention Measures

1. **Pre-commit Hooks**: Block commits with excessive complexity
2. **Component Guidelines**: Max 300 lines, max complexity 15
3. **Code Reviews**: Check complexity in PR reviews
4. **Regular Audits**: Weekly complexity reports

## Success Metrics

- Target: <10 high-severity complexity issues
- Current: 104 high-severity issues
- Goal: Reduce by 80% in 3 weeks
