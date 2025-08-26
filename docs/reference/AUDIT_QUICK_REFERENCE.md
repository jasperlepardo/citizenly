# 🚀 **AUDIT QUICK REFERENCE CARD**

**Citizenly Code Audit - August 24, 2025**

---

## 🚨 **CRITICAL ACTIONS (Fix Today)**

### **1. Circular Dependency (BLOCKING BUILDS)**
```bash
# File: src/types/households.ts:132
# Change: export type { HouseholdFormData } from '@/types';
# To:     export type { HouseholdFormData } from '@/types/forms';
```

### **2. Verify Fix Works**
```bash
npm run type-check  # Should pass after fix
```

---

## 📊 **KEY METRICS**

| Metric | Current | Target | Impact |
|--------|---------|--------|---------|
| **Type Errors** | 🔴 Failing | ✅ 0 errors | Unblocks deployment |
| **Unused Imports** | 🟡 140 found | 🎯 <10 | 15-20% bundle reduction |
| **Complex Functions** | 🟡 25 functions | 🎯 0 >15 complexity | Easier maintenance |
| **Code Health** | 🟢 97/100 | 🎯 98/100 | Team productivity |

---

## 🔧 **QUICK COMMANDS**

### **Check Current Status**
```bash
npm run type-check           # TypeScript errors
npm run quality:complexity   # Complex functions  
npm run quality:imports      # Unused imports
npm run build               # Bundle size
```

### **Automated Cleanup**
```bash
# Remove unused imports (manual review required)
npx eslint --fix src/ --ext .ts,.tsx

# Check complexity improvements
npm run quality:complexity -- --max=15
```

---

## 🎯 **TOP PRIORITY FILES**

### **Fix These First (Day 1-3)**
1. `src/types/households.ts:132` - Circular dependency
2. `src/app/(dashboard)/residents/[id]/page.tsx` - 8 unused imports
3. `src/components/molecules/CivilStatusPieChart.tsx` - 41 complexity
4. `src/components/molecules/EmploymentStatusPieChart.tsx` - 41 complexity
5. `src/components/organisms/Form/Resident/SectoralInformation.tsx` - 37 complexity

---

## 💡 **QUICK WINS**

### **Unused Import Cleanup Pattern**
```typescript
// Before
import { Button, Input, Modal } from '@/components';
import { unusedFunction } from '@/lib';  // ❌ Remove this

// After  
import { Button, Input, Modal } from '@/components';
// Removed unused import ✅
```

### **Complexity Reduction Pattern**
```typescript
// Before: Complex nested conditions
if (condition1) {
  if (condition2) {
    if (condition3) {
      // deep logic
    }
  }
}

// After: Early returns
if (!condition1) return;
if (!condition2) return;
if (!condition3) return;
// linear logic ✅
```

---

## ⚡ **3-Day Sprint Plan**

### **Day 1: Fix Blockers**
- [ ] Fix circular dependency
- [ ] Run `npm run type-check` (should pass)
- [ ] Commit and push fix

### **Day 2: Clean Imports**  
- [ ] Remove unused imports from top 10 files
- [ ] Run `npm run quality:imports`
- [ ] Test build still works

### **Day 3: Reduce Complexity**
- [ ] Refactor top 3 most complex functions
- [ ] Run `npm run quality:complexity`  
- [ ] Verify tests pass

---

## 🚦 **Success Indicators**

### **Green Light (Ready to Deploy)**
- ✅ `npm run type-check` passes
- ✅ `npm run build` succeeds
- ✅ All tests passing
- ✅ No critical complexity warnings

### **Yellow Light (Improving)**
- 🟡 <50 unused imports remaining
- 🟡 <10 high-complexity functions
- 🟡 Bundle size decreasing

### **Red Light (Still Blocked)**
- 🔴 TypeScript compilation fails
- 🔴 Circular dependencies present
- 🔴 Build process broken

---

## 📞 **Need Help?**

### **Common Issues & Solutions**

**Q: "Module not found" after fixing imports**  
**A:** Check the actual file path: `find src -name "*ComponentName*"`

**Q: Build fails after removing unused imports**  
**A:** Some imports might be used in ways ESLint doesn't detect. Re-add and check manually.

**Q: Tests fail after complexity refactoring**  
**A:** Update test mocks and assertions for new component structure.

---

## 📋 **Commit Message Templates**

```bash
# Circular dependency fix
git commit -m "fix: resolve circular dependency in households.ts

- Remove circular import from @/types
- Use direct import from @/types/forms
- Enables TypeScript compilation

Fixes: TypeScript build errors"

# Unused imports cleanup
git commit -m "refactor: remove unused imports (batch 1)

- Clean up 20 unused imports across 10 files
- Reduces bundle size by ~5%
- Improves tree-shaking efficiency"

# Complexity reduction
git commit -m "refactor: reduce complexity in chart components

- Extract data transformation logic to hooks
- Break down complex conditional structures
- Reduce CivilStatusPieChart complexity: 41 → 8"
```

---

## 🎯 **Expected Results After 3 Days**

| Before | After | Improvement |
|--------|-------|-------------|
| ❌ Build fails | ✅ Build passes | **Deployment unblocked** |
| 140 unused imports | ~50 unused imports | **15-20% bundle reduction** |
| 25 complex functions | ~10 complex functions | **60% complexity reduction** |
| 97/100 code health | 98/100 code health | **Improved maintainability** |

---

**Quick Reference v1.0** | **Team Copy** | **Keep Handy During Implementation** 📌