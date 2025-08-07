import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { action } from '@storybook/addon-actions';
import EducationEmployment, { EducationEmploymentData } from './EducationEmployment';

const meta: Meta<typeof EducationEmployment> = {
  title: 'Organisms/EducationEmployment',
  component: EducationEmployment,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A comprehensive form section for capturing education and employment information of residents. This component integrates with the Philippine Standard Occupational Classification (PSOC) system for standardized occupation data. Key features include:

- **Education Level & Status** - Captures current educational attainment and status
- **PSOC Integration** - Standardized occupation classification system
- **Occupation Search** - Dynamic search for occupations with auto-complete
- **Employment Status** - Various employment categories
- **Workplace Information** - Optional workplace details
- **Form Validation** - Built-in error handling and validation

The component is designed specifically for the Philippine context, using PSOC codes for occupation standardization and relevant education/employment categories.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      description: 'Current form data values',
    },
    onChange: {
      action: 'onChange',
      description: 'Callback when form data changes',
    },
    errors: {
      description: 'Validation error messages for form fields',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultFormData: EducationEmploymentData = {
  educationLevel: '',
  educationStatus: '',
  psocCode: '',
  psocLevel: '',
  positionTitleId: '',
  occupationDescription: '',
  employmentStatus: '',
  workplace: '',
};

export const Default: Story = {
  args: {
    value: defaultFormData,
    onChange: action('form-changed'),
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Default empty form ready for user input.',
      },
    },
  },
};

export const WithData: Story = {
  args: {
    value: {
      educationLevel: 'college',
      educationStatus: 'graduated',
      psocCode: '2421',
      psocLevel: 'unit_group',
      positionTitleId: '',
      occupationDescription: 'Management and Organization Analysts',
      employmentStatus: 'employed',
      workplace: 'Makati City Government',
    },
    onChange: action('form-changed'),
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story:
          'Form pre-filled with education and employment data showing a college graduate working in local government.',
      },
    },
  },
};

export const WithErrors: Story = {
  args: {
    value: {
      educationLevel: '',
      educationStatus: 'graduated',
      psocCode: '',
      psocLevel: '',
      positionTitleId: '',
      occupationDescription: '',
      employmentStatus: '',
      workplace: '',
    },
    onChange: action('form-changed'),
    errors: {
      educationLevel: 'Education level is required',
      occupationDescription: 'Please select an occupation',
      employmentStatus: 'Employment status is required',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Form showing validation errors for missing required fields.',
      },
    },
  },
};

export const StudentProfile: Story = {
  args: {
    value: {
      educationLevel: 'college',
      educationStatus: 'currently_studying',
      psocCode: '',
      psocLevel: '',
      positionTitleId: '',
      occupationDescription: '',
      employmentStatus: 'student',
      workplace: '',
    },
    onChange: action('form-changed'),
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Profile of a current college student with no employment.',
      },
    },
  },
};

export const WorkingProfessional: Story = {
  args: {
    value: {
      educationLevel: 'college',
      educationStatus: 'graduated',
      psocCode: '2310',
      psocLevel: 'unit_group',
      positionTitleId: '',
      occupationDescription: 'University and Higher Education Teachers',
      employmentStatus: 'employed',
      workplace: 'University of the Philippines Manila',
    },
    onChange: action('form-changed'),
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Profile of a working professional - university professor with advanced education.',
      },
    },
  },
};

export const SkilledWorker: Story = {
  args: {
    value: {
      educationLevel: 'vocational',
      educationStatus: 'graduated',
      psocCode: '7231',
      psocLevel: 'unit_group',
      positionTitleId: '',
      occupationDescription: 'Motor Vehicle Mechanics and Repairers',
      employmentStatus: 'self_employed',
      workplace: 'Own Auto Repair Shop',
    },
    onChange: action('form-changed'),
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Profile of a skilled worker with vocational training running their own business.',
      },
    },
  },
};

export const RetiredResident: Story = {
  args: {
    value: {
      educationLevel: 'high_school',
      educationStatus: 'graduated',
      psocCode: '5120',
      psocLevel: 'unit_group',
      positionTitleId: '',
      occupationDescription: 'Cooks (former)',
      employmentStatus: 'retired',
      workplace: 'Previously at Hotel InterContinental',
    },
    onChange: action('form-changed'),
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Profile of a retired resident showing their previous occupation.',
      },
    },
  },
};

export const JobSeeker: Story = {
  args: {
    value: {
      educationLevel: 'college',
      educationStatus: 'graduated',
      psocCode: '',
      psocLevel: '',
      positionTitleId: '',
      occupationDescription: '',
      employmentStatus: 'looking_for_work',
      workplace: '',
    },
    onChange: action('form-changed'),
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Profile of a college graduate currently looking for employment.',
      },
    },
  },
};

export const HomebaseWorker: Story = {
  args: {
    value: {
      educationLevel: 'elementary',
      educationStatus: 'not_studying',
      psocCode: '5152',
      psocLevel: 'unit_group',
      positionTitleId: '',
      occupationDescription: 'Domestic Housekeepers',
      employmentStatus: 'employed',
      workplace: 'Various households in Makati',
    },
    onChange: action('form-changed'),
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Profile of a domestic worker with elementary education.',
      },
    },
  },
};

const ValidationDemoComponent = () => {
  const [formData, setFormData] = React.useState<EducationEmploymentData>(defaultFormData);
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof EducationEmploymentData, string>>
  >({});

  const validateForm = () => {
    const newErrors: Partial<Record<keyof EducationEmploymentData, string>> = {};

    if (!formData.educationLevel) {
      newErrors.educationLevel = 'Education level is required';
    }

    if (!formData.educationStatus) {
      newErrors.educationStatus = 'Education status is required';
    }

    if (formData.employmentStatus === 'employed' && !formData.occupationDescription) {
      newErrors.occupationDescription = 'Occupation is required for employed residents';
    }

    if (!formData.employmentStatus) {
      newErrors.employmentStatus = 'Employment status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      action('form-submitted')(formData);
      alert('Form is valid! Data: ' + JSON.stringify(formData, null, 2));
    } else {
      alert('Please fix the errors before submitting.');
    }
  };

  const handleChange = (newData: EducationEmploymentData) => {
    setFormData(newData);
    // Clear errors for fields that are now valid
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach(key => {
      const fieldKey = key as keyof EducationEmploymentData;
      if (newData[fieldKey]) {
        delete newErrors[fieldKey];
      }
    });
    setErrors(newErrors);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <EducationEmployment value={formData} onChange={handleChange} errors={errors} />

      <div className="flex gap-4 border-t pt-6">
        <button
          onClick={handleSubmit}
          className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
        >
          Validate & Submit
        </button>
        <button
          onClick={() => {
            setFormData(defaultFormData);
            setErrors({});
          }}
          className="rounded bg-gray-600 px-6 py-2 text-white hover:bg-gray-700"
        >
          Clear Form
        </button>
      </div>

      <div className="rounded border bg-gray-50 p-4">
        <h4 className="mb-2 font-semibold">Current Form Data:</h4>
        <pre className="overflow-auto rounded border bg-white p-2 text-xs">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export const ValidationDemo: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo showing form validation behavior.',
      },
    },
  },
  render: () => <ValidationDemoComponent />,
};

const CommonOccupationsComponent = () => {
  const [currentProfile, setCurrentProfile] = React.useState(0);

  const profiles = [
    {
      title: 'Barangay Captain',
      data: {
        educationLevel: 'college',
        educationStatus: 'graduated',
        psocCode: '1112',
        psocLevel: 'unit_group',
        positionTitleId: '',
        occupationDescription: 'Senior Government Officials',
        employmentStatus: 'employed',
        workplace: 'Barangay San Lorenzo',
      },
    },
    {
      title: 'Elementary Teacher',
      data: {
        educationLevel: 'college',
        educationStatus: 'graduated',
        psocCode: '2341',
        psocLevel: 'unit_group',
        positionTitleId: '',
        occupationDescription: 'Primary School Teachers',
        employmentStatus: 'employed',
        workplace: 'San Lorenzo Elementary School',
      },
    },
    {
      title: 'Tricycle Driver',
      data: {
        educationLevel: 'high_school',
        educationStatus: 'graduated',
        psocCode: '8322',
        psocLevel: 'unit_group',
        positionTitleId: '',
        occupationDescription: 'Car, Taxi and Van Drivers',
        employmentStatus: 'self_employed',
        workplace: 'San Lorenzo-Makati Route',
      },
    },
    {
      title: 'Store Owner',
      data: {
        educationLevel: 'high_school',
        educationStatus: 'graduated',
        psocCode: '5223',
        psocLevel: 'unit_group',
        positionTitleId: '',
        occupationDescription: 'Shop Keepers',
        employmentStatus: 'self_employed',
        workplace: 'Sari-sari Store, San Lorenzo Street',
      },
    },
    {
      title: 'Call Center Agent',
      data: {
        educationLevel: 'college',
        educationStatus: 'graduated',
        psocCode: '4222',
        psocLevel: 'unit_group',
        positionTitleId: '',
        occupationDescription: 'Contact Centre Information Clerks',
        employmentStatus: 'employed',
        workplace: 'Convergys Philippines, Makati',
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {profiles.map((profile, index) => (
          <button
            key={profile.title}
            onClick={() => setCurrentProfile(index)}
            className={`rounded px-4 py-2 text-sm ${
              currentProfile === index
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {profile.title}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 p-6">
        <h3 className="mb-4 text-lg font-semibold">{profiles[currentProfile].title} Profile</h3>
        <EducationEmployment
          value={profiles[currentProfile].data}
          onChange={action('profile-changed')}
          errors={{}}
        />
      </div>
    </div>
  );
};

export const CommonOccupations: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Examples of common occupations in Filipino barangays.',
      },
    },
  },
  render: () => <CommonOccupationsComponent />,
};

export const ResponsiveLayout: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Form layout adaptation on different screen sizes.',
      },
    },
  },
  render: () => (
    <div className="space-y-8">
      <div className="max-w-sm">
        <h3 className="mb-4 text-lg font-semibold">Mobile Layout</h3>
        <div className="rounded border border-gray-200 p-4">
          <EducationEmployment
            value={{
              educationLevel: 'college',
              educationStatus: 'graduated',
              psocCode: '2421',
              psocLevel: 'unit_group',
              positionTitleId: '',
              occupationDescription: 'Management and Organization Analysts',
              employmentStatus: 'employed',
              workplace: 'City Hall',
            }}
            onChange={action('mobile-changed')}
            errors={{}}
          />
        </div>
      </div>

      <div className="max-w-4xl">
        <h3 className="mb-4 text-lg font-semibold">Desktop Layout</h3>
        <div className="rounded border border-gray-200 p-6">
          <EducationEmployment
            value={{
              educationLevel: 'college',
              educationStatus: 'graduated',
              psocCode: '2421',
              psocLevel: 'unit_group',
              positionTitleId: '',
              occupationDescription: 'Management and Organization Analysts',
              employmentStatus: 'employed',
              workplace: 'City Hall',
            }}
            onChange={action('desktop-changed')}
            errors={{}}
          />
        </div>
      </div>
    </div>
  ),
};
