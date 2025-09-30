# Utils Domain-First Migration Plan

## New Domain-First Structure Created:

```
src/utils-new/
├── residents/          # Resident domain utilities
│   ├── index.ts
│   ├── resident-form-utils.ts
│   └── form-utils.ts
├── addresses/          # Geographic/address domain utilities  
│   ├── index.ts
│   └── geographic-utils.ts
├── reports/           # Charts/analytics domain utilities
│   ├── index.ts
│   ├── chart-utils.ts
│   ├── chart-transformers.ts
│   ├── pieChartMath.ts
│   └── color-utils.ts
├── auth/              # Authentication/security domain utilities
│   ├── index.ts
│   ├── security-utils.ts
│   ├── sessionUtils.ts
│   ├── csrf-utils.ts
│   ├── input-sanitizer.ts
│   ├── sanitization-utils.ts
│   ├── sanitizers.ts
│   └── responseUtils.ts
└── shared/            # Cross-cutting utilities
    ├── index.ts
    ├── stringUtils.ts
    ├── dateUtils.ts
    ├── errorUtils.ts
    ├── async-utils.ts
    ├── id-generators.ts
    ├── file-utils.ts
    ├── css-utils.ts
    ├── api-utils.ts
    ├── databaseUtils.ts
    ├── data-transformers.ts
    ├── validation-utilities.ts
    ├── validationUtils.ts
    ├── utilities.ts
    └── field-utils.ts
```

## Import Migration Examples:

### Before (Technical-First):
```typescript
import { formatName } from '@/utils/forms/resident-form-utils';
import { formatFullAddress } from '@/utils/data/geographic-utils'; 
import { createPieSlicePath } from '@/utils/charts/chart-utils';
import { withSecurityHeaders } from '@/utils/auth/responseUtils';
import { capitalize } from '@/utils/core/stringUtils';
```

### After (Domain-First):
```typescript
import { formatName } from '@/utils/residents';
import { formatFullAddress } from '@/utils/addresses';
import { createPieSlicePath } from '@/utils/reports';
import { withSecurityHeaders } from '@/utils/auth';
import { capitalize } from '@/utils/shared';
```

## Benefits:

1. **Domain Cohesion**: Related utilities grouped together
2. **Discoverability**: Easy to find domain-specific utilities
3. **Team Ownership**: Teams can own entire domain utility folders
4. **Maintainability**: Domain changes contained within domain folders
5. **Clean Imports**: Simple domain-based import paths

## Next Steps:

1. Update all import statements using bulk find/replace
2. Swap old utils directory with new one
3. Test and fix any remaining import issues
4. Update documentation and team guidelines

## Migration Impact:

- **~100+ files** need import updates
- **Zero breaking changes** to utility function signatures
- **Improved architecture** alignment with domain-first principles