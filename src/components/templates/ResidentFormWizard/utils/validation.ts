import { ResidentFormData, ValidationErrors } from '../types';

// Step validation functions
export const validateStep1 = (data: ResidentFormData): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  if (!data.firstName.trim()) errors.firstName = 'First name is required';
  if (!data.lastName.trim()) errors.lastName = 'Last name is required';
  if (!data.birthdate) errors.birthdate = 'Birth date is required';
  if (!data.sex) errors.sex = 'Sex is required';

  // Validate birthdate is not in future
  if (data.birthdate) {
    const birthDate = new Date(data.birthdate);
    const today = new Date();
    if (birthDate > today) {
      errors.birthdate = 'Birth date cannot be in the future';
    }
    // Validate reasonable age range (not before 1900)
    const minDate = new Date('1900-01-01');
    if (birthDate < minDate) {
      errors.birthdate = 'Birth date must be after 1900';
    }
  }

  return errors;
};

export const validateStep2 = (data: ResidentFormData): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  // Validate email format if provided
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }

  // Validate mobile number format if provided (Philippine format)
  if (data.mobileNumber && data.mobileNumber.trim() !== '') {
    const cleanNumber = data.mobileNumber.replace(/[\s-]/g, '');
    if (!/^(\+63|0)?9\d{9}$/.test(cleanNumber)) {
      errors.mobileNumber = 'Invalid mobile number format. Use Philippine format: +639XXXXXXXXX, 09XXXXXXXXX, or 9XXXXXXXXX';
    }
  }

  // Geographic validation - at least barangay code required
  if (!data.barangayCode) {
    errors.barangayCode = 'Barangay selection is required';
  }

  // Household assignment validation - required for proper address tracking
  if (!data.householdCode || data.householdCode.trim() === '') {
    errors.householdCode = 'Household assignment is required. Please select an existing household or create a new one.';
  }

  return errors;
};

export const validateStep3 = (data: ResidentFormData): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  // No strict validation for education/employment - all fields optional
  // PSOC validation handled by component
  
  return errors;
};

export const validateStep4 = (data: ResidentFormData): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  // Validate PhilSys card number format if provided
  if (data.philsysCardNumber && data.philsysCardNumber.trim() !== '') {
    // Basic format validation (adjust pattern as needed)
    if (!/^\d{4}-\d{4}-\d{4}$/.test(data.philsysCardNumber.replace(/\s/g, '').replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3'))) {
      errors.philsysCardNumber = 'Invalid PhilSys card number format';
    }
  }

  // Height/weight validation
  if (data.height && (parseInt(data.height) < 50 || parseInt(data.height) > 250)) {
    errors.height = 'Height must be between 50 and 250 cm';
  }
  
  if (data.weight && (parseInt(data.weight) < 10 || parseInt(data.weight) > 300)) {
    errors.weight = 'Weight must be between 10 and 300 kg';
  }

  return errors;
};

export const validateStep5 = (data: ResidentFormData): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  // Review step - no additional validation needed
  // All previous validations should pass
  
  return errors;
};