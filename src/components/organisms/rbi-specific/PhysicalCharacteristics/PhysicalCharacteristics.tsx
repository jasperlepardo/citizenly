'use client';

/**
 * PhysicalCharacteristics Component - RBI Physical Description
 * Captures physical characteristics for identification purposes
 * Follows Philippine identification standards and accessibility guidelines
 */

import React from 'react';
import { Textarea } from '../../../atoms';
import { DropdownSelect } from '../../../molecules';
import { FormGroup, InputField } from '../../../molecules';

// Physical Characteristics Interface (matches database schema)
export interface PhysicalCharacteristics {
  height_cm?: number;
  weight_kg?: number;
  blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null;
  eye_color?:
    | 'black'
    | 'brown'
    | 'dark_brown'
    | 'light_brown'
    | 'hazel'
    | 'green'
    | 'blue'
    | 'gray'
    | null;
  hair_color?:
    | 'black'
    | 'dark_brown'
    | 'brown'
    | 'light_brown'
    | 'blonde'
    | 'red'
    | 'gray'
    | 'white'
    | null;
  complexion?:
    | 'very_fair'
    | 'fair'
    | 'medium'
    | 'olive'
    | 'brown'
    | 'dark_brown'
    | 'very_dark'
    | null;
  distinguishing_marks?: string;
  medical_conditions?: string;
  allergies?: string;
}

interface PhysicalCharacteristicsProps {
  value: PhysicalCharacteristics;
  onChange: (characteristics: PhysicalCharacteristics) => void;
  disabled?: boolean;
  className?: string;
}

// Blood type options
const BLOOD_TYPE_OPTIONS = [
  { value: '', label: 'Select blood type' },
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

// Eye color options (common in Philippines)
const EYE_COLOR_OPTIONS = [
  { value: '', label: 'Select eye color' },
  { value: 'black', label: 'Black' },
  { value: 'dark_brown', label: 'Dark Brown' },
  { value: 'brown', label: 'Brown' },
  { value: 'light_brown', label: 'Light Brown' },
  { value: 'hazel', label: 'Hazel' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
  { value: 'gray', label: 'Gray' },
];

// Hair color options
const HAIR_COLOR_OPTIONS = [
  { value: '', label: 'Select hair color' },
  { value: 'black', label: 'Black' },
  { value: 'dark_brown', label: 'Dark Brown' },
  { value: 'brown', label: 'Brown' },
  { value: 'light_brown', label: 'Light Brown' },
  { value: 'blonde', label: 'Blonde' },
  { value: 'red', label: 'Red' },
  { value: 'gray', label: 'Gray' },
  { value: 'white', label: 'White' },
];

// Complexion options (culturally appropriate for Philippines)
const COMPLEXION_OPTIONS = [
  { value: '', label: 'Select complexion' },
  { value: 'very_fair', label: 'Very Fair (Maputi)' },
  { value: 'fair', label: 'Fair (Maputi-puti)' },
  { value: 'medium', label: 'Medium (Kayumanggi)' },
  { value: 'olive', label: 'Olive (Moreno/Morena)' },
  { value: 'brown', label: 'Brown (Moreno/Morena)' },
  { value: 'dark_brown', label: 'Dark Brown (Maitim-tim)' },
  { value: 'very_dark', label: 'Very Dark (Maitim)' },
];

export default function PhysicalCharacteristics({
  value,
  onChange,
  disabled = false,
  className = '',
}: PhysicalCharacteristicsProps) {
  const handleChange = (field: keyof PhysicalCharacteristics, newValue: unknown) => {
    onChange({ ...value, [field]: newValue || undefined });
  };

  // Calculate BMI if both height and weight are available
  const calculateBMI = () => {
    if (value.height_cm && value.weight_kg) {
      const heightInMeters = value.height_cm / 100;
      const bmi = value.weight_kg / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-yellow-600' };
    if (bmi < 25) return { category: 'Normal weight', color: 'text-green-600' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-orange-600' };
    return { category: 'Obese', color: 'text-red-600' };
  };

  const bmiValue = calculateBMI();
  const bmiCategory = bmiValue ? getBMICategory(parseFloat(bmiValue)) : null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="border-b border-default pb-4">
        <h3 className="mb-2 text-lg font-medium text-primary">
          <span className="text-base">👤</span> Physical Characteristics
        </h3>
        <p className="text-sm text-secondary">
          Physical description for identification and health tracking purposes. All fields are
          optional.
        </p>
      </div>

      {/* Body Measurements */}
      <FormGroup title="Body Measurements">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            label="Height (cm)"
            type="number"
            value={value.height_cm || ''}
            onChange={e =>
              handleChange('height_cm', e.target.value ? parseInt(e.target.value) : undefined)
            }
            placeholder="e.g., 165"
            min={50}
            max={250}
            disabled={disabled}
          />

          <InputField
            label="Weight (kg)"
            type="number"
            value={value.weight_kg || ''}
            onChange={e =>
              handleChange('weight_kg', e.target.value ? parseFloat(e.target.value) : undefined)
            }
            placeholder="e.g., 65.5"
            min={1}
            max={300}
            step={0.1}
            disabled={disabled}
          />
        </div>

        {/* BMI Display */}
        {bmiValue && bmiCategory && (
          <div className="bg-background-muted mt-3 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-secondary">Body Mass Index (BMI):</span>
              <span className="font-medium">
                {bmiValue} kg/m²
                <span className={`ml-2 ${bmiCategory.color}`}>({bmiCategory.category})</span>
              </span>
            </div>
          </div>
        )}
      </FormGroup>

      {/* Blood Type */}
      <FormGroup title="Blood Type">
        <DropdownSelect
          options={BLOOD_TYPE_OPTIONS}
          value={value.blood_type || ''}
          onChange={newValue => handleChange('blood_type', newValue || null)}
          disabled={disabled}
        />
      </FormGroup>

      {/* Physical Features */}
      <FormGroup title="Physical Features">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <DropdownSelect
            label="Eye Color"
            options={EYE_COLOR_OPTIONS}
            value={value.eye_color || ''}
            onChange={newValue => handleChange('eye_color', newValue || null)}
            disabled={disabled}
          />

          <DropdownSelect
            label="Hair Color"
            options={HAIR_COLOR_OPTIONS}
            value={value.hair_color || ''}
            onChange={newValue => handleChange('hair_color', newValue || null)}
            disabled={disabled}
          />

          <DropdownSelect
            label="Complexion"
            options={COMPLEXION_OPTIONS}
            value={value.complexion || ''}
            onChange={newValue => handleChange('complexion', newValue || null)}
            disabled={disabled}
          />
        </div>
      </FormGroup>

      {/* Distinguishing Marks */}
      <FormGroup title="Distinguishing Marks">
        <Textarea
          value={value.distinguishing_marks || ''}
          onChange={e => handleChange('distinguishing_marks', e.target.value)}
          placeholder="e.g., Scar on left arm, birthmark on face, tattoo on shoulder"
          disabled={disabled}
          rows={3}
        />
        <p className="text-muted mt-1 text-xs">
          Include scars, birthmarks, tattoos, or other identifying features
        </p>
      </FormGroup>

      {/* Medical Information */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormGroup title="Medical Conditions">
          <Textarea
            value={value.medical_conditions || ''}
            onChange={e => handleChange('medical_conditions', e.target.value)}
            placeholder="e.g., Diabetes, Hypertension, Asthma"
            disabled={disabled}
            rows={3}
          />
          <p className="text-muted mt-1 text-xs">
            List any chronic conditions or ongoing medical issues
          </p>
        </FormGroup>

        <FormGroup title="Known Allergies">
          <Textarea
            value={value.allergies || ''}
            onChange={e => handleChange('allergies', e.target.value)}
            placeholder="e.g., Peanuts, Shellfish, Penicillin"
            disabled={disabled}
            rows={3}
          />
          <p className="text-muted mt-1 text-xs">
            List any known allergies to food, medicine, or other substances
          </p>
        </FormGroup>
      </div>

      {/* Privacy Notice */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <div className="flex items-start">
          <div className="shrink-0">
            <span className="text-yellow-400">⚠️</span>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-yellow-800">Privacy Notice</h4>
            <p className="mt-1 text-sm text-yellow-700">
              Physical characteristics and medical information are collected for identification and
              emergency purposes only. This information is protected under the Data Privacy Act of
              2012 and will not be shared without proper consent.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      {(value.height_cm ||
        value.weight_kg ||
        value.blood_type ||
        value.eye_color ||
        value.hair_color ||
        value.complexion) && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h4 className="mb-2 font-medium text-blue-900">Physical Profile Summary</h4>
          <div className="space-y-1 text-sm text-blue-800">
            {value.height_cm && value.weight_kg && (
              <p>
                <strong>Physical:</strong> {value.height_cm}cm, {value.weight_kg}kg{' '}
                {bmiValue && `(BMI: ${bmiValue})`}
              </p>
            )}
            {value.blood_type && (
              <p>
                <strong>Blood Type:</strong> {value.blood_type}
              </p>
            )}
            {(value.eye_color || value.hair_color) && (
              <p>
                <strong>Features:</strong>
                {value.eye_color &&
                  ` ${EYE_COLOR_OPTIONS.find(o => o.value === value.eye_color)?.label} eyes`}
                {value.eye_color && value.hair_color && ','}
                {value.hair_color &&
                  ` ${HAIR_COLOR_OPTIONS.find(o => o.value === value.hair_color)?.label} hair`}
              </p>
            )}
            {value.complexion && (
              <p>
                <strong>Complexion:</strong>{' '}
                {COMPLEXION_OPTIONS.find(o => o.value === value.complexion)?.label}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
