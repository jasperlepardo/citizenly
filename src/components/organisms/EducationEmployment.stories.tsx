import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import EducationEmployment, { type EducationEmploymentData } from './EducationEmployment';
import { useState } from 'react';

const meta = {
  title: 'Organisms/EducationEmployment',
  component: EducationEmployment,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A comprehensive education and employment information form component for the RBI System. Integrates with PSOC (Philippine Standard Occupational Classification) for accurate job classification and provides complete academic and work history capture.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
    },
  },
} satisfies Meta<typeof EducationEmployment>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default data for stories
const defaultData: EducationEmploymentData = {
  educationLevel: '',
  educationStatus: '',
  psocCode: '',
  psocLevel: '',
  positionTitleId: '',
  occupationDescription: '',
  employmentStatus: '',
  workplace: '',
};

// Sample completed data
const sampleData: EducationEmploymentData = {
  educationLevel: 'college',
  educationStatus: 'graduated',
  psocCode: '2221',
  psocLevel: 'unit_group',
  positionTitleId: '',
  occupationDescription: 'Nurses and midwives',
  employmentStatus: 'employed',
  workplace: 'Philippine General Hospital',
};

// Sample student data
const studentData: EducationEmploymentData = {
  educationLevel: 'college',
  educationStatus: 'currently_studying',
  psocCode: '',
  psocLevel: '',
  positionTitleId: '',
  occupationDescription: '',
  employmentStatus: 'student',
  workplace: '',
};

// Sample errors
const sampleErrors = {
  educationLevel: 'Education level is required',
  employmentStatus: 'Employment status is required',
  occupationDescription: 'Please select an occupation',
};

export const Default: Story = {
  args: {
    value: defaultData,
    onChange: value => console.log('Changed:', value),
  },
};

export const WithErrors: Story = {
  args: {
    value: defaultData,
    errors: sampleErrors,
    onChange: value => console.log('Changed:', value),
  },
};

export const EmployedProfessional: Story = {
  args: {
    value: sampleData,
    onChange: value => console.log('Changed:', value),
  },
};

export const CurrentStudent: Story = {
  args: {
    value: studentData,
    onChange: value => console.log('Changed:', value),
  },
};

// Interactive example
const InteractiveComponent = () => {
  const [data, setData] = useState<EducationEmploymentData>(defaultData);
  const [errors, setErrors] = useState<Partial<Record<keyof EducationEmploymentData, string>>>({});

  const handleChange = (newData: EducationEmploymentData) => {
    setData(newData);

    // Simple validation example
    const newErrors: Partial<Record<keyof EducationEmploymentData, string>> = {};

    if (!newData.educationLevel) {
      newErrors.educationLevel = 'Education level is required';
    }

    if (!newData.employmentStatus) {
      newErrors.employmentStatus = 'Employment status is required';
    }

    // If employed, should have occupation
    if (newData.employmentStatus === 'employed' && !newData.occupationDescription) {
      newErrors.occupationDescription = 'Please select an occupation for employed status';
    }

    setErrors(newErrors);
  };

  const isValid = Object.keys(errors).length === 0;
  const hasRequiredFields = data.educationLevel && data.employmentStatus;

  return (
    <div className="space-y-6">
      <EducationEmployment value={data} onChange={handleChange} errors={errors} />

      {/* Real-time validation display */}
      <div className="rounded-lg border p-4 bg-background border-default">
        <h3 className="mb-3 font-semibold text-primary">Form Status</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span
              className={`size-2 rounded-full ${hasRequiredFields ? 'bg-green-500' : 'bg-red-500'}`}
            ></span>
            <span>Required Fields: {hasRequiredFields ? 'Complete' : 'Incomplete'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`size-2 rounded-full ${isValid ? 'bg-green-500' : 'bg-yellow-500'}`}
            ></span>
            <span>Validation: {isValid ? 'Passed' : 'Has Errors'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`size-2 rounded-full ${data.psocCode ? 'bg-green-500' : 'bg-gray-400'}`}
            ></span>
            <span>PSOC Classification: {data.psocCode ? 'Selected' : 'Not Selected'}</span>
          </div>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="mt-3 rounded border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
            <h4 className="mb-2 text-sm font-medium text-red-800 dark:text-red-200">
              Validation Errors:
            </h4>
            <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Current data display */}
      <div className="rounded-lg border p-4 bg-background border-default">
        <h3 className="mb-3 font-semibold text-primary">Current Data</h3>
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          <div>
            <strong>Education:</strong> {data.educationLevel || 'Not selected'} -{' '}
            {data.educationStatus || 'Not selected'}
          </div>
          <div>
            <strong>Employment:</strong> {data.employmentStatus || 'Not selected'}
          </div>
          <div>
            <strong>Occupation:</strong> {data.occupationDescription || 'Not selected'}
          </div>
          <div>
            <strong>PSOC Code:</strong> {data.psocCode || 'Not assigned'}
          </div>
          <div>
            <strong>Workplace:</strong> {data.workplace || 'Not specified'}
          </div>
          <div>
            <strong>PSOC Level:</strong> {data.psocLevel || 'Not specified'}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Interactive: Story = {
  render: InteractiveComponent,
};

// Different employment scenarios
export const EmploymentScenarios: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 font-semibold text-primary">Healthcare Professional</h3>
        <EducationEmployment
          value={{
            educationLevel: 'college',
            educationStatus: 'graduated',
            psocCode: '2221',
            psocLevel: 'unit_group',
            positionTitleId: '',
            occupationDescription: 'Nurses and midwives',
            employmentStatus: 'employed',
            workplace: 'Manila General Hospital',
          }}
          onChange={() => {}}
        />
      </div>

      <div>
        <h3 className="mb-4 font-semibold text-primary">Teacher</h3>
        <EducationEmployment
          value={{
            educationLevel: 'college',
            educationStatus: 'graduated',
            psocCode: '2330',
            psocLevel: 'unit_group',
            positionTitleId: '',
            occupationDescription: 'Secondary education teachers',
            employmentStatus: 'employed',
            workplace: 'Manila High School',
          }}
          onChange={() => {}}
        />
      </div>

      <div>
        <h3 className="mb-4 font-semibold text-primary">Engineering Student</h3>
        <EducationEmployment
          value={{
            educationLevel: 'college',
            educationStatus: 'currently_studying',
            psocCode: '',
            psocLevel: '',
            positionTitleId: '',
            occupationDescription: '',
            employmentStatus: 'student',
            workplace: '',
          }}
          onChange={() => {}}
        />
      </div>

      <div>
        <h3 className="mb-4 font-semibold text-primary">Self-Employed Entrepreneur</h3>
        <EducationEmployment
          value={{
            educationLevel: 'high_school',
            educationStatus: 'graduated',
            psocCode: '1213',
            psocLevel: 'unit_group',
            positionTitleId: '',
            occupationDescription: 'Policy and planning managers',
            employmentStatus: 'self_employed',
            workplace: 'Own Business',
          }}
          onChange={() => {}}
        />
      </div>
    </div>
  ),
};

// PSOC integration showcase
const PSOCIntegrationComponent = () => {
  const [data, setData] = useState<EducationEmploymentData>(defaultData);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <h3 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">
          PSOC Integration Features
        </h3>
        <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
          <li>• Real-time occupation search with PSOC database</li>
          <li>• Automatic PSOC code assignment</li>
          <li>• Classification level detection (major group, unit group, etc.)</li>
          <li>• Standardized occupation descriptions</li>
          <li>• Compliance with Philippine labor statistics standards</li>
        </ul>
      </div>

      <EducationEmployment value={data} onChange={setData} />

      {data.psocCode && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <h4 className="mb-2 font-medium text-green-800 dark:text-green-200">
            PSOC Classification Details:
          </h4>
          <div className="space-y-1 text-sm text-green-700 dark:text-green-300">
            <div>
              <strong>Code:</strong> {data.psocCode}
            </div>
            <div>
              <strong>Title:</strong> {data.occupationDescription}
            </div>
            <div>
              <strong>Level:</strong> {data.psocLevel.replace('_', ' ')}
            </div>
            <div>
              <strong>Status:</strong> Compliant with Philippine Standard Occupational
              Classification
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const PSOCIntegration: Story = {
  render: PSOCIntegrationComponent,
};

// Form validation showcase
const ValidationDemoComponent = () => {
  const [data, setData] = useState<EducationEmploymentData>(defaultData);
  const [showValidation, setShowValidation] = useState(false);

  const validateForm = () => {
    const errors: Partial<Record<keyof EducationEmploymentData, string>> = {};

    if (!data.educationLevel) {
      errors.educationLevel = 'Education level is required';
    }

    if (!data.employmentStatus) {
      errors.employmentStatus = 'Employment status is required';
    }

    if (data.employmentStatus === 'employed' && !data.occupationDescription) {
      errors.occupationDescription = 'Occupation is required for employed individuals';
    }

    if (data.employmentStatus === 'employed' && !data.workplace.trim()) {
      errors.workplace = 'Workplace is required for employed individuals';
    }

    return errors;
  };

  const handleValidate = () => {
    setShowValidation(true);
    const errors = validateForm();

    if (Object.keys(errors).length === 0) {
      alert('Validation passed! All required fields are complete.');
    }
  };

  const errors = showValidation ? validateForm() : {};

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
        <h3 className="mb-2 font-semibold text-yellow-800 dark:text-yellow-200">
          Validation Rules Demo
        </h3>
        <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
          <li>• Education level is always required</li>
          <li>• Employment status is always required</li>
          <li>• Occupation is required if employment status is &quot;Employed&quot;</li>
          <li>• Workplace is required if employment status is &quot;Employed&quot;</li>
          <li>• Students typically don&apos;t need occupation details</li>
        </ul>

        <button
          onClick={handleValidate}
          className="mt-3 rounded-md border border-yellow-300 bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-800 transition-colors hover:bg-yellow-200 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200 dark:hover:bg-yellow-900/50"
        >
          Validate Current Form
        </button>
      </div>

      <EducationEmployment value={data} onChange={setData} errors={errors} />
    </div>
  );
};

export const ValidationDemo: Story = {
  render: ValidationDemoComponent,
};

// Form integration example
const FormIntegrationComponent = () => {
  const [formData, setFormData] = useState({
    personalInfo: {
      name: 'Juan Dela Cruz',
      age: 28,
    },
    educationEmployment: defaultData,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Form submitted! Check console for data.');
    console.log('Form data:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-lg border p-6 bg-background border-default">
        <h3 className="mb-4 font-semibold text-primary">Personal Information</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-primary">Full Name</label>
            <input
              type="text"
              value={formData.personalInfo.name}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  personalInfo: { ...prev.personalInfo, name: e.target.value },
                }))
              }
              className="w-full rounded-md border p-3 border-default focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-primary">Age</label>
            <input
              type="number"
              value={formData.personalInfo.age}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  personalInfo: { ...prev.personalInfo, age: parseInt(e.target.value) },
                }))
              }
              className="w-full rounded-md border p-3 border-default focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-6 bg-background border-default">
        <EducationEmployment
          value={formData.educationEmployment}
          onChange={data =>
            setFormData(prev => ({
              ...prev,
              educationEmployment: data,
            }))
          }
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() =>
            setFormData({
              personalInfo: { name: 'Juan Dela Cruz', age: 28 },
              educationEmployment: defaultData,
            })
          }
          className="rounded-md border px-4 py-2 text-sm font-medium transition-colors text-secondary border-default hover:text-primary hover:bg-surface-hover"
        >
          Reset Form
        </button>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Submit Complete Form
        </button>
      </div>
    </form>
  );
};

export const FormIntegration: Story = {
  render: FormIntegrationComponent,
};
