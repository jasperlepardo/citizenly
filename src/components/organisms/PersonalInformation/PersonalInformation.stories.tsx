import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import PersonalInformation, { PersonalInformationData } from './PersonalInformation';

const meta: Meta<typeof PersonalInformation> = {
  title: 'Organisms/PersonalInformation',
  component: PersonalInformation,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A comprehensive form section for capturing personal identification information of residents. This component handles the most basic and essential demographic data required for resident registration. Key features include:

- **Complete Name Fields** - First, middle, last name and extension (Jr., Sr., etc.)
- **Birth Information** - Date picker for birth date with age calculation
- **Demographic Data** - Sex and civil status selection
- **Citizenship Status** - Filipino, dual citizen, or foreign national options
- **Form Validation** - Built-in validation with error messaging
- **Responsive Layout** - Adapts to different screen sizes
- **Accessibility** - Proper labeling and ARIA support

This component is typically the first section in resident registration forms and provides the foundation for all other resident data.
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

const defaultFormData: PersonalInformationData = {
  firstName: '',
  middleName: '',
  lastName: '',
  extensionName: '',
  birthdate: '',
  sex: '',
  civilStatus: '',
  citizenship: '',
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
      firstName: 'Juan',
      middleName: 'Santos',
      lastName: 'dela Cruz',
      extensionName: '',
      birthdate: '1990-05-15',
      sex: 'male',
      civilStatus: 'married',
      citizenship: 'filipino',
    },
    onChange: action('form-changed'),
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Form pre-filled with typical Filipino resident data.',
      },
    },
  },
};

export const WithExtension: Story = {
  args: {
    value: {
      firstName: 'Juan',
      middleName: 'Santos',
      lastName: 'dela Cruz',
      extensionName: 'Jr.',
      birthdate: '1995-08-22',
      sex: 'male',
      civilStatus: 'single',
      citizenship: 'filipino',
    },
    onChange: action('form-changed'),
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Example with name extension (Jr., Sr., III, etc.).',
      },
    },
  },
};

export const WithErrors: Story = {
  args: {
    value: {
      firstName: '',
      middleName: '',
      lastName: '',
      extensionName: '',
      birthdate: '2025-01-01',
      sex: '',
      civilStatus: '',
      citizenship: '',
    },
    onChange: action('form-changed'),
    errors: {
      firstName: 'First name is required',
      lastName: 'Last name is required',
      birthdate: 'Birth date cannot be in the future',
      sex: 'Please select sex',
      civilStatus: 'Civil status is required',
      citizenship: 'Citizenship is required',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Form showing validation errors for missing or invalid fields.',
      },
    },
  },
};

export const FemaleProfessional: Story = {
  args: {
    value: {
      firstName: 'Maria',
      middleName: 'Esperanza',
      lastName: 'Santos',
      extensionName: '',
      birthdate: '1985-12-03',
      sex: 'female',
      civilStatus: 'married',
      citizenship: 'filipino',
    },
    onChange: action('form-changed'),
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Example of female professional resident profile.',
      },
    },
  },
};

export const SeniorCitizen: Story = {
  args: {
    value: {
      firstName: 'Lourdes',
      middleName: 'Bautista',
      lastName: 'Rodriguez',
      extensionName: '',
      birthdate: '1950-03-18',
      sex: 'female',
      civilStatus: 'widowed',
      citizenship: 'filipino',
    },
    onChange: action('form-changed'),
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Senior citizen resident profile showing widowed status.',
      },
    },
  },
};

export const YoungAdult: Story = {
  args: {
    value: {
      firstName: 'Miguel',
      middleName: 'Jose',
      lastName: 'Garcia',
      extensionName: '',
      birthdate: '2000-07-12',
      sex: 'male',
      civilStatus: 'single',
      citizenship: 'filipino',
    },
    onChange: action('form-changed'),
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Young adult resident profile.',
      },
    },
  },
};

export const DualCitizen: Story = {
  args: {
    value: {
      firstName: 'Anna',
      middleName: 'Marie',
      lastName: 'Johnson',
      extensionName: '',
      birthdate: '1988-11-25',
      sex: 'female',
      civilStatus: 'married',
      citizenship: 'dual_citizen',
    },
    onChange: action('form-changed'),
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Dual citizen resident profile (Filipino-American).',
      },
    },
  },
};

export const ForeignNational: Story = {
  args: {
    value: {
      firstName: 'John',
      middleName: '',
      lastName: 'Smith',
      extensionName: '',
      birthdate: '1982-09-14',
      sex: 'male',
      civilStatus: 'married',
      citizenship: 'foreign_national',
    },
    onChange: action('form-changed'),
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Foreign national resident profile.',
      },
    },
  },
};

export const ValidationDemo: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo showing form validation and real-time feedback.',
      },
    },
  },
  render: () => {
    const [formData, setFormData] = React.useState<PersonalInformationData>(defaultFormData);
    const [errors, setErrors] = React.useState<Partial<Record<keyof PersonalInformationData, string>>>({});

    const validateForm = () => {
      const newErrors: Partial<Record<keyof PersonalInformationData, string>> = {};

      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }

      if (!formData.birthdate) {
        newErrors.birthdate = 'Birth date is required';
      } else {
        const birthDate = new Date(formData.birthdate);
        const today = new Date();
        if (birthDate > today) {
          newErrors.birthdate = 'Birth date cannot be in the future';
        }
        if (birthDate.getFullYear() < 1900) {
          newErrors.birthdate = 'Please enter a valid birth date';
        }
      }

      if (!formData.sex) {
        newErrors.sex = 'Please select sex';
      }

      if (!formData.civilStatus) {
        newErrors.civilStatus = 'Civil status is required';
      }

      if (!formData.citizenship) {
        newErrors.citizenship = 'Citizenship is required';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const calculateAge = (birthdate: string) => {
      if (!birthdate) return 0;
      const today = new Date();
      const birth = new Date(birthdate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    };

    const handleSubmit = () => {
      if (validateForm()) {
        const age = calculateAge(formData.birthdate);
        action('form-submitted')({ ...formData, age });
        alert(`Form is valid! ${formData.firstName} ${formData.lastName} is ${age} years old.`);
      } else {
        alert('Please fix the errors before submitting.');
      }
    };

    const handleChange = (newData: PersonalInformationData) => {
      setFormData(newData);
      // Clear errors for fields that are now valid
      const newErrors = { ...errors };
      Object.keys(newErrors).forEach(key => {
        const fieldKey = key as keyof PersonalInformationData;
        if (newData[fieldKey]) {
          delete newErrors[fieldKey];
        }
      });
      setErrors(newErrors);
    };

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <PersonalInformation
          value={formData}
          onChange={handleChange}
          errors={errors}
        />
        
        {formData.birthdate && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>Age:</strong> {calculateAge(formData.birthdate)} years old
            </p>
          </div>
        )}
        
        <div className="flex gap-4 pt-6 border-t">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Validate & Submit
          </button>
          <button
            onClick={() => {
              setFormData(defaultFormData);
              setErrors({});
            }}
            className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Clear Form
          </button>
        </div>
        
        <div className="p-4 bg-gray-50 rounded border">
          <h4 className="font-semibold mb-2">Current Form Data:</h4>
          <pre className="text-xs bg-white p-2 rounded border overflow-auto">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      </div>
    );
  },
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
        <h3 className="text-lg font-semibold mb-4">Mobile Layout</h3>
        <div className="border border-gray-200 rounded p-4">
          <PersonalInformation
            value={{
              firstName: 'Juan',
              middleName: 'Santos',
              lastName: 'dela Cruz',
              extensionName: '',
              birthdate: '1990-05-15',
              sex: 'male',
              civilStatus: 'married',
              citizenship: 'filipino',
            }}
            onChange={action('mobile-changed')}
            errors={{}}
          />
        </div>
      </div>
      
      <div className="max-w-4xl">
        <h3 className="text-lg font-semibold mb-4">Desktop Layout</h3>
        <div className="border border-gray-200 rounded p-6">
          <PersonalInformation
            value={{
              firstName: 'Juan',
              middleName: 'Santos',
              lastName: 'dela Cruz',
              extensionName: '',
              birthdate: '1990-05-15',
              sex: 'male',
              civilStatus: 'married',
              citizenship: 'filipino',
            }}
            onChange={action('desktop-changed')}
            errors={{}}
          />
        </div>
      </div>
    </div>
  ),
};

export const CommonScenarios: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Common Filipino naming and demographic patterns.',
      },
    },
  },
  render: () => {
    const [currentProfile, setCurrentProfile] = React.useState(0);
    
    const profiles = [
      {
        title: 'Typical Filipino Name',
        data: {
          firstName: 'Maria Clara',
          middleName: 'Santos',
          lastName: 'dela Cruz',
          extensionName: '',
          birthdate: '1992-06-12',
          sex: 'female' as const,
          civilStatus: 'married',
          citizenship: 'filipino',
        },
      },
      {
        title: 'With Name Extension',
        data: {
          firstName: 'Juan',
          middleName: 'Bautista',
          lastName: 'Rodriguez',
          extensionName: 'III',
          birthdate: '1985-03-08',
          sex: 'male' as const,
          civilStatus: 'married',
          citizenship: 'filipino',
        },
      },
      {
        title: 'Single Name (Mononym)',
        data: {
          firstName: 'Isko',
          middleName: '',
          lastName: 'Moreno',
          extensionName: '',
          birthdate: '1974-10-24',
          sex: 'male' as const,
          civilStatus: 'married',
          citizenship: 'filipino',
        },
      },
      {
        title: 'Chinese-Filipino',
        data: {
          firstName: 'Li Wei',
          middleName: '',
          lastName: 'Tan',
          extensionName: '',
          birthdate: '1988-11-15',
          sex: 'male' as const,
          civilStatus: 'single',
          citizenship: 'filipino',
        },
      },
    ];

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {profiles.map((profile, index) => (
            <button
              key={index}
              onClick={() => setCurrentProfile(index)}
              className={`px-4 py-2 rounded text-sm ${
                currentProfile === index
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {profile.title}
            </button>
          ))}
        </div>
        
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">{profiles[currentProfile].title}</h3>
          <PersonalInformation
            value={profiles[currentProfile].data}
            onChange={action('profile-changed')}
            errors={{}}
          />
        </div>
      </div>
    );
  },
};