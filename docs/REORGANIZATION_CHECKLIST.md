# Codebase Reorganization Checklist

## 📋 Quick Reference

### Current Issues:
- ❌ `/lib` directory: 138 files across 31 subdirectories (TOO LARGE)
- ❌ Types scattered across 4+ locations
- ❌ Services mixed with utilities
- ❌ No clear separation of concerns

### Target Benefits:
- ✅ Traditional React/Next.js structure
- ✅ Maintained atomic design (atoms/molecules/organisms/templates)
- ✅ Consolidated type definitions
- ✅ Clear service layer
- ✅ Streamlined utilities

---

## 🎯 Migration Phases

### ✅ Phase 0: Documentation & Planning
- [x] Create reorganization plan documentation
- [x] Create migration scripts
- [x] Create backup strategy
- [ ] Team review and approval

### 🔄 Phase 1: Type Consolidation (Days 1-2)

#### Preparation:
- [ ] Create backup branch: `backup-before-reorganization`
- [ ] Run existing tests to ensure clean starting state
- [ ] Run migration script: `./scripts/reorganization/migrate-types.sh`

#### Type Migration Tasks:
- [ ] Create `/src/types/` directory structure
- [ ] **From `/src/lib/types/`:**
  - [ ] Move `database.ts` → `/src/types/database.ts`
  - [ ] Move `forms.ts` → `/src/types/forms.ts`
  - [ ] Consolidate resident files → `/src/types/residents.ts`:
    - [ ] `resident-detail.ts`
    - [ ] `resident-listing.ts`  
    - [ ] `resident.ts`
- [ ] **From `/src/components/types/`:**
  - [ ] Move `form-field.ts` → `/src/types/components.ts`
  - [ ] Merge `index.ts` → `/src/types/components.ts`
- [ ] **Create missing type files:**
  - [ ] `/src/types/api.ts` - API response types
  - [ ] `/src/types/auth.ts` - Authentication types
  - [ ] `/src/types/households.ts` - Household-related types
  - [ ] `/src/types/ui.ts` - UI component types
- [ ] Create barrel export: `/src/types/index.ts`

#### Import Updates (Type Phase):
- [ ] Update imports in `/src/components/`
- [ ] Update imports in `/src/hooks/`
- [ ] Update imports in `/src/lib/`
- [ ] Update imports in `/src/app/`

#### Testing:
- [ ] Run TypeScript check: `npm run type-check`
- [ ] Run tests: `npm test`
- [ ] Fix any import issues
- [ ] Commit Phase 1: `git commit -m "phase 1: consolidate types"`

### 🔄 Phase 2: Service Layer Creation (Days 3-4)

#### Service Creation:
- [ ] Create `/src/services/` directory
- [ ] **Move from `/src/lib/services/`:**
  - [ ] `resident.service.ts` → `/src/services/residents.service.ts`
- [ ] **Create new service files:**
  - [ ] `/src/services/households.service.ts`
  - [ ] `/src/services/dashboard.service.ts`
  - [ ] `/src/services/auth.service.ts`
- [ ] **Move API logic from `/src/lib/`:**
  - [ ] Move repository logic to appropriate services
  - [ ] Move mapper logic to services
  - [ ] Move search logic to services
- [ ] Create service barrel export: `/src/services/index.ts`

#### Import Updates (Service Phase):
- [ ] Update service imports in hooks
- [ ] Update service imports in API routes
- [ ] Update service imports in components

#### Testing:
- [ ] Test API functionality
- [ ] Run integration tests
- [ ] Fix any service issues
- [ ] Commit Phase 2: `git commit -m "phase 2: create service layer"`

### 🔄 Phase 3: Lib Directory Cleanup (Days 5-6)

#### Move to Utils:
- [ ] Create `/src/utils/` directory
- [ ] **From `/src/lib/utilities/`:**
  - [ ] Move string utilities → `/src/utils/string.ts`
  - [ ] Move date utilities → `/src/utils/date.ts`
  - [ ] Move formatting utilities → `/src/utils/format.ts`
  - [ ] Move validation utilities → `/src/utils/validation.ts`
- [ ] Create utils barrel export: `/src/utils/index.ts`

#### Streamline Lib:
- [ ] **Keep in `/src/lib/`:**
  - [ ] `/src/lib/config/` - Configuration
  - [ ] `/src/lib/constants/` - Constants
  - [ ] `/src/lib/database/` - Database utilities
  - [ ] `/src/lib/security/` - Security utilities
  - [ ] `/src/lib/storage/` - Storage utilities
  - [ ] `/src/lib/supabase/` - Supabase client
  - [ ] `/src/lib/validation/` - Validation schemas
- [ ] **Remove from `/src/lib/`:**
  - [ ] Delete empty `/src/lib/services/`
  - [ ] Delete empty `/src/lib/types/`
  - [ ] Delete empty `/src/lib/utilities/`

#### Import Updates (Lib Phase):
- [ ] Update utility imports throughout codebase
- [ ] Update lib imports
- [ ] Remove old import paths

#### Testing:
- [ ] Run full test suite
- [ ] Test all functionality
- [ ] Fix any utility issues
- [ ] Commit Phase 3: `git commit -m "phase 3: cleanup lib directory"`

### 🔄 Phase 4: Component UI Enhancement (Days 7-8)

#### Create UI Directory:
- [ ] Create `/src/components/ui/` directory
- [ ] **Move to UI:**
  - [ ] Move `/src/components/constants/` → `/src/components/ui/constants/`
  - [ ] Move `/src/components/tokens/` → `/src/components/ui/tokens/`
  - [ ] Move theme utilities → `/src/components/ui/themes/`
  - [ ] Create `/src/components/ui/icons/` (consolidate icon components)

#### Maintain Atomic Design:
- [ ] ✅ Keep `/src/components/atoms/` (current structure good)
- [ ] ✅ Keep `/src/components/molecules/` (current structure good)
- [ ] ✅ Keep `/src/components/organisms/` (current structure good)
- [ ] ✅ Keep `/src/components/templates/` (current structure good)
- [ ] Update component barrel exports

#### Testing:
- [ ] Test component rendering
- [ ] Update Storybook stories
- [ ] Test UI utilities
- [ ] Commit Phase 4: `git commit -m "phase 4: enhance component UI"`

### 🔄 Phase 5: Final Import Updates (Days 9-10)

#### Comprehensive Import Update:
- [ ] **Automated replacement patterns:**
  - [ ] `@/lib/types/` → `@/types/`
  - [ ] `@/lib/services/` → `@/services/`
  - [ ] `@/lib/utilities/` → `@/utils/`
- [ ] **Manual import fixes:**
  - [ ] Fix any missed imports
  - [ ] Optimize import statements
  - [ ] Remove unused imports

#### Barrel Export Optimization:
- [ ] Optimize `/src/types/index.ts`
- [ ] Optimize `/src/services/index.ts`
- [ ] Optimize `/src/utils/index.ts`
- [ ] Optimize component exports

#### Final Testing:
- [ ] Run TypeScript check: `npm run type-check`
- [ ] Run full test suite: `npm test`
- [ ] Run build test: `npm run build`
- [ ] Test development server: `npm run dev`
- [ ] Manual testing of key features

#### Documentation:
- [ ] Update README.md with new structure
- [ ] Update contributing guidelines
- [ ] Update development setup guide
- [ ] Create architecture documentation

#### Final Commit:
- [ ] Commit Phase 5: `git commit -m "phase 5: final import updates and optimization"`
- [ ] Create summary commit: `git commit -m "feat: reorganize codebase to traditional React/Next.js structure"`

---

## 🛡️ Risk Mitigation Checklist

### Before Each Phase:
- [ ] Create incremental backup branch
- [ ] Ensure tests are passing
- [ ] Document current state

### During Each Phase:  
- [ ] Test frequently (after every major change)
- [ ] Fix issues immediately
- [ ] Keep changes focused and small

### After Each Phase:
- [ ] Run full test suite
- [ ] Test key functionality manually
- [ ] Commit changes before moving to next phase

### Rollback Plan:
- [ ] Keep backup branches throughout process
- [ ] Document rollback procedure
- [ ] Test rollback process before starting

---

## 📊 Success Metrics Tracking

### File Count Reduction:
- **Before**: `/src/lib/` has 138 files across 31 directories
- **Target**: `/src/lib/` should have <50 files across <10 directories
- **Current**: ___ files (update during migration)

### Type Consolidation:
- **Before**: Types scattered across 4+ locations
- **Target**: All types in `/src/types/` with clear organization
- **Current**: ___ locations (update during migration)

### Import Complexity:
- **Before**: Complex import paths like `@/lib/types/resident-detail`
- **Target**: Simple imports like `@/types/residents`
- **Current**: ___ average import length (update during migration)

### Developer Experience:
- **Before**: Hard to find related code
- **Target**: Intuitive code organization
- **Current**: ___ developer satisfaction rating (survey after completion)

---

## 🚀 Getting Started

1. **Review the plan**: Read `docs/REORGANIZATION_PLAN.md`
2. **Get team approval**: Ensure everyone understands the changes
3. **Start with Phase 1**: Run the type migration script
4. **Follow checklist**: Complete each phase systematically
5. **Test frequently**: Don't skip testing steps

**Next Command**: `./scripts/reorganization/migrate-types.sh`