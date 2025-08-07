import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import PersonalInformation, { type PersonalInformationData } from './PersonalInformation';
import { useState } from 'react';

const meta = {
  title: 'Organisms/PersonalInformation',
  component: PersonalInformation,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A comprehensive personal information form component for the RBI System. Handles basic personal details including name, birth date, sex, civil status, and citizenship information with proper validation and error handling.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
    },
  },
} satisfies Meta<typeof PersonalInformation>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default data for stories
const defaultData: PersonalInformationData = {
  firstName: '',
  middleName: '',
  lastName: '',
  extensionName: '',
  birthdate: '',
  sex: '',
  civilStatus: '',
  citizenship: '',
};

// Sample completed data
const sampleData: PersonalInformationData = {
  firstName: 'Juan',
  middleName: 'Santos',
  lastName: 'Dela Cruz',
  extensionName: 'Jr.',
  birthdate: '1985-06-15',
  sex: 'male',
  civilStatus: 'married',
  citizenship: 'filipino',
};

// Sample data with errors
const sampleErrors = {
  firstName: 'First name is required',
  lastName: 'Last name is required',
  birthdate: 'Birth date is required',
  sex: 'Please select sex',
};

export const Default: Story = {
  args: {
    value: defaultData,
    onChange: value => console.log('Changed:', value),
  },
};

export const WithErrors: Story = {
  args: {
    value: {
      firstName: '',
      middleName: '',
      lastName: '',
      extensionName: '',
      birthdate: '',
      sex: '',
      civilStatus: '',
      citizenship: '',
    },
    errors: sampleErrors,
    onChange: value => console.log('Changed:', value),
  },
};

export const Prefilled: Story = {
  args: {
    value: sampleData,
    onChange: value => console.log('Changed:', value),
  },
};

export const PartiallyFilled: Story = {
  args: {
    value: {
      firstName: 'Maria',
      middleName: 'Elena',
      lastName: 'Santos',
      extensionName: '',
      birthdate: '1990-03-22',
      sex: 'female',
      civilStatus: '',
      citizenship: '',
    },
    onChange: value => console.log('Changed:', value),
  },
};

// Interactive story
const InteractiveComponent = () => {
  const [data, setData] = useState<PersonalInformationData>(defaultData);
  const [errors, setErrors] = useState<Partial<Record<keyof PersonalInformationData, string>>>({});

  const handleChange = (newData: PersonalInformationData) => {
    setData(newData);

    // Simple validation example
    const newErrors: Partial<Record<keyof PersonalInformationData, string>> = {};

    if (!newData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!newData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!newData.birthdate) {
      newErrors.birthdate = 'Birth date is required';
    }

    if (!newData.sex) {
      newErrors.sex = 'Please select sex';
    }

    setErrors(newErrors);
  };

  const isValid = Object.keys(errors).length === 0;
  const hasRequiredFields = data.firstName && data.lastName && data.birthdate && data.sex;

  return (
    <div className="space-y-6">
      <PersonalInformation value={data} onChange={handleChange} errors={errors} />

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
        <pre className="overflow-x-auto rounded p-3 text-xs text-secondary bg-background-muted">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export const Interactive: Story = {
  render: InteractiveComponent,
};

// Different data scenarios
export const ForeignNational: Story = {
  args: {
    value: {
      firstName: 'John',
      middleName: 'Michael',
      lastName: 'Smith',
      extensionName: '',
      birthdate: '1988-12-03',
      sex: 'male',
      civilStatus: 'single',
      citizenship: 'foreign_national',
    },
    onChange: value => console.log('Changed:', value),
  },
};

export const DualCitizen: Story = {
  args: {
    value: {
      firstName: 'Sarah',
      middleName: 'Grace',
      lastName: 'Johnson-Cruz',
      extensionName: '',
      birthdate: '1992-09-18',
      sex: 'female',
      civilStatus: 'married',
      citizenship: 'dual_citizen',
    },
    onChange: value => console.log('Changed:', value),
  },
};

export const WithExtensionName: Story = {
  args: {
    value: {
      firstName: 'Roberto',
      middleName: 'Miguel',
      lastName: 'Santos',
      extensionName: 'III',
      birthdate: '1975-04-12',
      sex: 'male',
      civilStatus: 'married',
      citizenship: 'filipino',
    },
    onChange: value => console.log('Changed:', value),
  },
};

// Validation scenarios
export const ValidationScenarios: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 font-semibold text-primary">Missing Required Fields</h3>
        <PersonalInformation
          value={{
            firstName: '',
            middleName: 'Optional',
            lastName: '',
            extensionName: '',
            birthdate: '',
            sex: '',
            civilStatus: 'single',
            citizenship: 'filipino',
          }}
          errors={{
            firstName: 'First name is required',
            lastName: 'Last name is required',
            birthdate: 'Birth date is required',
            sex: 'Please select sex',
          }}
          onChange={() => {}}
        />
      </div>

      <div>
        <h3 className="mb-4 font-semibold text-primary">Valid Complete Form</h3>
        <PersonalInformation value={sampleData} onChange={() => {}} />
      </div>
    </div>
  ),
};

// Form integration example
const FormIntegrationComponent = () => {
  const [data, setData] = useState<PersonalInformationData>(defaultData);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    setIsSubmitted(true);
    // Simulate API call
    setTimeout(() => {
      alert('Personal information saved successfully!');
      setIsSubmitted(false);
    }, 1500);
  };

  const isComplete = data.firstName && data.lastName && data.birthdate && data.sex;

  return (
    <div className="space-y-6">
      <PersonalInformation value={data} onChange={setData} />

      <div className="flex items-center justify-between rounded-lg border p-4 bg-background border-default">
        <div className="text-sm text-secondary">
          {isComplete
            ? '✅ All required fields completed'
            : '⚠️  Please complete all required fields'}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setData(defaultData)}
            className="rounded-md border px-4 py-2 text-sm font-medium transition-colors text-secondary border-default hover:text-primary hover:bg-surface-hover"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isComplete || isSubmitted}
            className="disabled:bg-secondary rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed"
          >
            {isSubmitted ? 'Saving...' : 'Save Information'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const FormIntegration: Story = {
  render: FormIntegrationComponent,
};
