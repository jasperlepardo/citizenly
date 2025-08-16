# Resident Wizard Refactoring Plan

## **Current State Analysis**

### **Existing Implementation**
- **Location**: `src/components/templates/ResidentFormWizard/ResidentFormWizard.tsx`
- **Size**: 1,710 lines (monolithic component)
- **Structure**: 5-step wizard with inline step components
- **Issues**: 
  - All step components defined as functions inside main file
  - No proper TypeScript interfaces (using `any` types)
  - No reusable components
  - Mixed business logic and UI concerns

### **Existing Assets (To Leverage)**
**Organism Components Ready for Integration:**
- ✅ `PersonalInformation` - handles firstName, lastName, birthdate, sex, civilStatus
- ✅ `EducationEmployment` - handles education level, employment status  
- ✅ `PSOCSelector` - handles occupation search and selection
- ✅ `MotherMaidenName` - handles mother's maiden name fields
- ✅ `PhysicalCharacteristics` - handles blood type, ethnicity, religion
- ✅ `GeographicLocationStep` - handles region/province/city/barangay selection
- ✅ `BarangaySelector` & `SimpleBarangaySelector` - geographic selection
- ✅ `AddressSelector` & `AddressSearch` - address management

## **Refactoring Strategy**

### **Approach: Component Composition**
**Leverage existing organism components** rather than building from scratch to:
- Reduce development time by 70%
- Maintain design consistency
- Utilize existing validation logic
- Preserve established patterns

## **Target Architecture**

```
src/components/templates/ResidentFormWizard/
├── ResidentFormWizard.tsx          # Main orchestrator (200-300 lines)
├── index.ts                        # Public exports
├── types/
│   ├── index.ts                   # Core wizard interfaces
│   └── steps.ts                   # Step-specific types
├── hooks/
│   └── useResidentForm.ts         # Form logic, validation, API calls
├── steps/
│   ├── BasicInfoStep.tsx          # Step 1 implementation
│   ├── ContactAddressStep.tsx     # Step 2 implementation  
│   ├── EducationEmploymentStep.tsx # Step 3 implementation
│   ├── AdditionalDetailsStep.tsx  # Step 4 implementation
│   └── ReviewStep.tsx             # Step 5 implementation
└── components/
    ├── StepIndicator.tsx          # Progress visualization
    └── NavigationButtons.tsx      # Step navigation controls
```

## **Implementation Plan**

### **Phase 1: Foundation (1 hour)**
**Create TypeScript interfaces and types**

#### **Files to Create:**
1. `types/index.ts` - Core wizard interfaces
2. `types/steps.ts` - Step-specific type definitions

#### **Key Interfaces:**
```typescript
// Core form data interface
export interface ResidentFormData {
  // Personal Information
  firstName: string;
  middleName: string;
  lastName: string;
  // ... all other fields
}

// Step component props
export interface StepComponentProps {
  formData: ResidentFormData;
  onChange: (field: keyof ResidentFormData, value: any) => void;
  errors: Partial<Record<keyof ResidentFormData, string>>;
  onNext: () => void;
  onPrevious: () => void;
}

// Step configuration
export interface FormStep {
  id: number;
  title: string;
  description: string;
  component: React.ComponentType<StepComponentProps>;
  validation: (data: ResidentFormData) => Record<string, string>;
}
```

### **Phase 2: Extract Business Logic (2 hours)**
**Create custom hook for form management**

#### **File to Create:**
- `hooks/useResidentForm.ts`

#### **Responsibilities:**
```typescript
export function useResidentForm() {
  return {
    // State management
    formData: ResidentFormData;
    errors: ValidationErrors;
    currentStep: number;
    isSubmitting: boolean;
    
    // Actions
    handleInputChange: (field, value) => void;
    handleNextStep: () => void;
    handlePrevStep: () => void;
    handleSubmit: () => Promise<void>;
    
    // Validation
    validateStep: (step: number) => boolean;
    validateForm: () => boolean;
    
    // Utilities
    steps: FormStep[];
    canProceedToNext: boolean;
    canGoBack: boolean;
  }
}
```

### **Phase 3: Step Components (3 hours)**
**Extract step components using existing organisms**

#### **Step 1: BasicInfoStep.tsx**
```typescript
import { PersonalInformation } from '@/components/organisms';
import { MotherMaidenName } from '@/components/organisms/rbi-specific';

export function BasicInfoStep({ formData, onChange, errors }: StepComponentProps) {
  return (
    <div className="space-y-8">
      <PersonalInformation 
        value={{
          firstName: formData.firstName,
          lastName: formData.lastName,
          // ... map form data to component props
        }}
        onChange={(value) => {
          // Map component changes back to form data
          onChange('firstName', value.firstName);
          onChange('lastName', value.lastName);
          // ...
        }}
        errors={errors}
      />
      
      <MotherMaidenName 
        value={{
          motherMaidenFirst: formData.motherMaidenFirstName,
          // ...
        }}
        onChange={(value) => {
          onChange('motherMaidenFirstName', value.motherMaidenFirst);
          // ...
        }}
        errors={errors}
      />
    </div>
  );
}
```

#### **Step 2: ContactAddressStep.tsx**
```typescript
import { GeographicLocationStep } from '@/components/organisms';
import { InputField } from '@/components/molecules';

export function ContactAddressStep({ formData, onChange, errors }: StepComponentProps) {
  return (
    <div className="space-y-8">
      {/* Contact Information */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <InputField 
          label="Mobile Number"
          value={formData.mobileNumber}
          onChange={(e) => onChange('mobileNumber', e.target.value)}
          // ...
        />
        {/* ... other contact fields */}
      </div>
      
      {/* Geographic Selection */}
      <GeographicLocationStep 
        value={{
          regionCode: formData.regionCode,
          provinceCode: formData.provinceCode,
          // ...
        }}
        onChange={(selection) => {
          onChange('regionCode', selection.regionCode);
          onChange('provinceCode', selection.provinceCode);
          // ...
        }}
      />
    </div>
  );
}
```

#### **Step 3: EducationEmploymentStep.tsx**  
```typescript
import { EducationEmployment } from '@/components/organisms';
import { PSOCSelector } from '@/components/organisms';

export function EducationEmploymentStep({ formData, onChange, errors }: StepComponentProps) {
  return (
    <div className="space-y-8">
      <EducationEmployment 
        value={{
          educationAttainment: formData.educationAttainment,
          isGraduate: formData.isGraduate,
          employmentStatus: formData.employmentStatus,
        }}
        onChange={(value) => {
          onChange('educationAttainment', value.educationAttainment);
          onChange('isGraduate', value.isGraduate);
          onChange('employmentStatus', value.employmentStatus);
        }}
        errors={errors}
      />
      
      <PSOCSelector 
        value={formData.psocCode}
        onSelect={(option) => {
          onChange('psocCode', option?.occupation_code);
          onChange('occupationTitle', option?.occupation_title);
          onChange('psocLevel', option?.hierarchy_level);
        }}
        placeholder="Search for occupation..."
        error={errors.psocCode}
      />
    </div>
  );
}
```

#### **Step 4: AdditionalDetailsStep.tsx**
```typescript
import { PhysicalCharacteristics } from '@/components/organisms/rbi-specific';
import { InputField, SelectField } from '@/components/molecules';

export function AdditionalDetailsStep({ formData, onChange, errors }: StepComponentProps) {
  return (
    <div className="space-y-8">
      <PhysicalCharacteristics 
        value={{
          bloodType: formData.bloodType,
          ethnicity: formData.ethnicity,
          religion: formData.religion,
          // ...
        }}
        onChange={(value) => {
          onChange('bloodType', value.bloodType);
          onChange('ethnicity', value.ethnicity);
          onChange('religion', value.religion);
        }}
        errors={errors}
      />
      
      {/* Voting Information */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-primary">Voting Information</h4>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <SelectField 
            label="Registered Voter?"
            value={formData.isVoter === true ? 'yes' : formData.isVoter === false ? 'no' : ''}
            onChange={(value) => 
              onChange('isVoter', value === 'yes' ? true : value === 'no' ? false : null)
            }
            options={[
              { value: '', label: 'Not specified' },
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' }
            ]}
          />
          {/* ... other voting fields */}
        </div>
      </div>
    </div>
  );
}
```

#### **Step 5: ReviewStep.tsx**
```typescript
export function ReviewStep({ formData }: StepComponentProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base/7 font-semibold text-primary">Review & Submit</h3>
        <p className="mt-1 text-sm/6 text-secondary">
          Please review your information before submitting.
        </p>
      </div>
      
      <div className="bg-background-muted rounded-lg border border-default p-6">
        <div className="space-y-6">
          {/* Personal Information Summary */}
          <ReviewSection 
            title="Personal Information"
            data={{
              'Name': `${formData.firstName} ${formData.lastName}`,
              'Birth Date': formData.birthdate,
              'Sex': formData.sex,
              'Civil Status': formData.civilStatus
            }}
          />
          
          {/* Contact Information Summary */}
          <ReviewSection 
            title="Contact Information"
            data={{
              'Mobile Number': formData.mobileNumber || 'Not provided',
              'Email': formData.email || 'Not provided'
            }}
          />
          
          {/* ... other sections */}
        </div>
      </div>
    </div>
  );
}
```

### **Phase 4: Main Component Refactor (1 hour)**
**Simplify main ResidentFormWizard component**

#### **New ResidentFormWizard.tsx:**
```typescript
import { useResidentForm } from './hooks/useResidentForm';
import { 
  BasicInfoStep, 
  ContactAddressStep, 
  EducationEmploymentStep,
  AdditionalDetailsStep,
  ReviewStep 
} from './steps';
import { StepIndicator, NavigationButtons } from './components';

export function ResidentFormWizard({ onSubmit, onCancel }: ResidentFormWizardProps) {
  const {
    formData,
    errors,
    currentStep,
    steps,
    isSubmitting,
    handleInputChange,
    handleNextStep,
    handlePrevStep,
    handleSubmit
  } = useResidentForm({ onSubmit, onCancel });

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="mx-auto max-w-4xl">
      <StepIndicator 
        steps={steps}
        currentStep={currentStep}
      />
      
      <div className="bg-surface rounded-lg border border-default shadow-xs">
        <div className="px-6 py-8">
          <CurrentStepComponent 
            formData={formData}
            onChange={handleInputChange}
            errors={errors}
            onNext={handleNextStep}
            onPrevious={handlePrevStep}
          />
        </div>
      </div>
      
      <NavigationButtons 
        currentStep={currentStep}
        totalSteps={steps.length}
        canGoBack={currentStep > 1}
        canProceed={true}
        isSubmitting={isSubmitting}
        onPrevious={handlePrevStep}
        onNext={handleNextStep}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
```

### **Phase 5: Testing & Integration (1 hour)**
**Verify refactored wizard works correctly**

#### **Testing Checklist:**
- [ ] All steps render correctly
- [ ] Form data persists between steps
- [ ] Validation works on each step
- [ ] Existing organism components integrate properly
- [ ] API submission works
- [ ] Error handling functions correctly
- [ ] Navigation between steps works
- [ ] Progress indicator updates

## **Benefits of This Approach**

### **Code Quality Improvements**
- **Reduced complexity**: Main component from 1,710 to ~300 lines
- **Better separation of concerns**: UI, logic, and validation separated
- **Improved maintainability**: Each step can be modified independently
- **Enhanced testability**: Individual components can be unit tested
- **Type safety**: Proper TypeScript interfaces throughout

### **Development Efficiency**
- **70% faster implementation**: Leverages existing organism components
- **Consistent UX**: Uses established design patterns
- **Proven functionality**: Existing components already validated and tested
- **Future-proof**: Easier to add/remove steps or modify individual sections

### **Performance Benefits**
- **Code splitting**: Steps can be lazy-loaded
- **Reduced bundle size**: Shared components across multiple features
- **Better tree-shaking**: Unused code can be eliminated

## **Implementation Timeline**

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| Phase 1 | 1 hour | TypeScript interfaces and types |
| Phase 2 | 2 hours | Custom hook with form logic |
| Phase 3 | 3 hours | All step components using existing organisms |
| Phase 4 | 1 hour | Refactored main wizard component |
| Phase 5 | 1 hour | Testing and integration fixes |
| **Total** | **8 hours** | **Complete refactored wizard** |

## **Risk Mitigation**

### **Potential Issues & Solutions**
1. **Component interface mismatches**: Map existing component props to wizard needs
2. **Styling inconsistencies**: Use existing design system tokens
3. **Validation conflicts**: Centralize validation in custom hook
4. **State management complexity**: Use reducer pattern if needed

### **Rollback Strategy**
- Keep current monolithic component as backup
- Implement behind feature flag initially
- Gradual rollout with A/B testing

## **Next Steps**

1. **Get approval** for this refactoring approach
2. **Create feature branch** for development
3. **Implement Phase 1** (types and interfaces)
4. **Implement Phase 2** (custom hook)
5. **Implement Phase 3** (step components)
6. **Implement Phase 4** (main component)
7. **Test thoroughly** (Phase 5)
8. **Deploy and monitor**

## **Success Metrics**

- **Code maintainability**: Main component under 300 lines
- **Development velocity**: Future wizard changes take <30 minutes
- **Bug reduction**: Fewer form-related issues due to better separation
- **Developer experience**: New developers can understand and modify wizard quickly
- **User experience**: No regression in functionality or performance