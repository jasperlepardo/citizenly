/**
 * Custom hook for managing resident form state and validation
 * Provides centralized form logic following our coding standards
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  ResidentEditFormData, 
  ResidentFormSchema, 
  validateResidentForm,
  ValidationResult 
} from '@/lib/validation/resident-schema';

/**
 * Default form data with proper typing
 */
const DEFAULT_FORM_DATA: Partial<ResidentEditFormData> = {
  first_name: '',
  middle_name: '',
  last_name: '',
  extension_name: '',
  birthdate: '',
  sex: 'male',
  civil_status: 'single',
  civil_status_others_specify: '',
  citizenship: 'filipino',
  birth_place_name: '',
  birth_place_code: '',
  mobile_number: '',
  email: '',
  telephone_number: '',
  philsys_card_number: '',
  household_code: '',
  street_id: '',
  subdivision_id: '',
  zip_code: '',
  education_attainment: undefined,
  is_graduate: false,
  employment_status: undefined,
  employment_code: '',
  employment_name: '',
  psoc_code: '',
  psoc_level: undefined,
  occupation_title: '',
  blood_type: undefined,
  height: undefined,
  weight: undefined,
  complexion: '',
  religion: undefined,
  religion_others_specify: '',
  ethnicity: undefined,
  is_voter: false,
  is_resident_voter: false,
  last_voted_date: '',
  mother_maiden_first: '',
  mother_maiden_middle: '',
  mother_maiden_last: '',
};

/**
 * Hook options interface
 */
interface UseResidentEditFormOptions {
  initialData?: Partial<ResidentEditFormData>;
  onSubmit?: (data: ResidentEditFormData) => Promise<void>;
  autoSave?: boolean;
  autoSaveKey?: string;
}

/**
 * Hook return type
 */
interface UseResidentEditFormReturn {
  // Form data
  formData: Partial<ResidentEditFormData>;
  errors: Record<string, string>;
  
  // Form state
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  
  // Form actions
  updateField: <K extends keyof ResidentEditFormData>(field: K, value: ResidentEditFormData[K]) => void;
  updateFields: (fields: Partial<ResidentEditFormData>) => void;
  validateField: (field: keyof ResidentEditFormData) => void;
  validateForm: () => ValidationResult;
  resetForm: () => void;
  submitForm: () => Promise<void>;
  
  // Utility methods
  getFieldError: (field: keyof ResidentEditFormData) => string | undefined;
  hasFieldError: (field: keyof ResidentEditFormData) => boolean;
  clearFieldError: (field: keyof ResidentEditFormData) => void;
}

/**
 * Custom hook for resident form management
 * 
 * @param options - Configuration options for the form hook
 * @returns Object containing form state and actions
 * 
 * @example
 * ```typescript
 * function ResidentEditForm() {
 *   const {
 *     formData,
 *     errors,
 *     updateField,
 *     submitForm,
 *     isSubmitting
 *   } = useResidentForm({
 *     initialData: existingResident,
 *     onSubmit: async (data) => {
 *       await updateResident(data);
 *     }
 *   });
 * 
 *   return (
 *     <form onSubmit={submitForm}>
 *       <input
 *         value={formData.first_name || ''}
 *         onChange={(e) => updateField('first_name', e.target.value)}
 *       />
 *     </form>
 *   );
 * }
 * ```
 */
export function useResidentEditForm(options: UseResidentEditFormOptions = {}): UseResidentEditFormReturn {
  const {
    initialData = {},
    onSubmit,
    autoSave = false,
    autoSaveKey = 'resident-form-draft'
  } = options;

  // Form state
  const [formData, setFormData] = useState<Partial<ResidentEditFormData>>(() => {
    const merged = { ...DEFAULT_FORM_DATA, ...initialData };
    
    // Load from localStorage if autoSave is enabled and no initial data
    if (autoSave && Object.keys(initialData).length === 0) {
      try {
        const saved = localStorage.getItem(autoSaveKey);
        if (saved) {
          const parsedData = JSON.parse(saved);
          return { ...merged, ...parsedData };
        }
      } catch (error) {
        console.warn('Failed to load auto-saved form data:', error);
      }
    }
    
    return merged;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Auto-save to localStorage
  useEffect(() => {
    if (autoSave && isDirty) {
      try {
        localStorage.setItem(autoSaveKey, JSON.stringify(formData));
      } catch (error) {
        console.warn('Failed to auto-save form data:', error);
      }
    }
  }, [formData, autoSave, autoSaveKey, isDirty]);

  /**
   * Updates a single form field
   */
  const updateField = useCallback(<K extends keyof ResidentEditFormData>(
    field: K, 
    value: ResidentEditFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  /**
   * Updates multiple form fields at once
   */
  const updateFields = useCallback((fields: Partial<ResidentEditFormData>) => {
    setFormData(prev => ({ ...prev, ...fields }));
    setIsDirty(true);
    
    // Clear errors for updated fields
    const updatedFieldNames = Object.keys(fields);
    setErrors(prev => {
      const newErrors = { ...prev };
      updatedFieldNames.forEach(fieldName => {
        if (newErrors[fieldName]) {
          newErrors[fieldName] = '';
        }
      });
      return newErrors;
    });
  }, []);

  /**
   * Validates a single field
   */
  const validateField = useCallback((field: keyof ResidentEditFormData) => {
    try {
      const fieldSchema = ResidentFormSchema.shape[field];
      if (fieldSchema) {
        fieldSchema.parse(formData[field]);
        // Clear error if validation passes
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrors(prev => ({ ...prev, [field]: error.message }));
      }
    }
  }, [formData]);

  /**
   * Validates the entire form
   */
  const validateForm = useCallback((): ValidationResult => {
    const result = validateResidentForm(formData);
    
    if (!result.success && result.errors) {
      setErrors(result.errors);
    } else {
      setErrors({});
    }
    
    return result;
  }, [formData]);

  /**
   * Resets the form to initial state
   */
  const resetForm = useCallback(() => {
    const resetData = { ...DEFAULT_FORM_DATA, ...initialData };
    setFormData(resetData);
    setErrors({});
    setIsDirty(false);
    
    // Clear auto-saved data
    if (autoSave) {
      try {
        localStorage.removeItem(autoSaveKey);
      } catch (error) {
        console.warn('Failed to clear auto-saved data:', error);
      }
    }
  }, [initialData, autoSave, autoSaveKey]);

  /**
   * Submits the form with validation
   */
  const submitForm = useCallback(async () => {
    if (!onSubmit) {
      console.warn('No onSubmit handler provided to useResidentForm');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const validation = validateForm();
      
      if (!validation.success) {
        console.warn('Form validation failed:', validation.errors);
        return;
      }

      if (validation.data) {
        await onSubmit(validation.data);
        
        // Clear auto-saved data on successful submit
        if (autoSave) {
          try {
            localStorage.removeItem(autoSaveKey);
          } catch (error) {
            console.warn('Failed to clear auto-saved data:', error);
          }
        }
        
        setIsDirty(false);
      }
    } catch (error) {
      console.error('Form submission failed:', error);
      // You might want to set a general error here
      setErrors(prev => ({ 
        ...prev, 
        submit: error instanceof Error ? error.message : 'Submission failed' 
      }));
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, validateForm, autoSave, autoSaveKey]);

  /**
   * Utility methods
   */
  const getFieldError = useCallback((field: keyof ResidentEditFormData) => {
    return errors[field] || undefined;
  }, [errors]);

  const hasFieldError = useCallback((field: keyof ResidentEditFormData) => {
    return Boolean(errors[field]);
  }, [errors]);

  const clearFieldError = useCallback((field: keyof ResidentEditFormData) => {
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  // Compute derived state
  const isValid = Object.keys(errors).length === 0;

  return {
    // Form data
    formData,
    errors,
    
    // Form state
    isSubmitting,
    isValid,
    isDirty,
    
    // Form actions
    updateField,
    updateFields,
    validateField,
    validateForm,
    resetForm,
    submitForm,
    
    // Utility methods
    getFieldError,
    hasFieldError,
    clearFieldError,
  };
}