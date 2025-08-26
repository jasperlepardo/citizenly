import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ContactDetails, ContactDetailsData } from '@/components/organisms/ContactDetails';

const meta = {
  title: 'Organisms/Form/Resident/ContactInformation/FormField/ContactDetails',
  component: ContactDetails,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A form section for collecting contact information including email, phone number, and mobile number. Features responsive grid layout and validation support for communication details.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'object' },
      description: 'Current form values for contact details',
    },
    onChange: {
      action: 'changed',
      description: 'Callback when any field value changes',
    },
    errors: {
      control: { type: 'object' },
      description: 'Error messages for each field',
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof ContactDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default empty state
const emptyData: ContactDetailsData = {
  email: '',
  phoneNumber: '',
  mobileNumber: '',
};

// Sample complete data
const sampleData: ContactDetailsData = {
  email: 'juan.delacruz@gmail.com',
  phoneNumber: '(02) 123-4567',
  mobileNumber: '+63 912 345 6789',
};

// Basic Examples
export const Default: Story = {
  args: {
    value: emptyData,
    onChange: () => {},
    errors: {},
  },
};

export const WithSampleData: Story = {
  args: {
    value: sampleData,
    onChange: () => {},
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Form filled with sample contact information.',
      },
    },
  },
};

// Validation Examples
export const WithValidationErrors: Story = {
  args: {
    value: {
      email: 'invalid-email',
      phoneNumber: '123',
      mobileNumber: 'not-a-number',
    },
    onChange: () => {},
    errors: {
      email: 'Please enter a valid email address',
      phoneNumber: 'Phone number must be at least 7 digits',
      mobileNumber: 'Please enter a valid mobile number',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Form showing validation errors for invalid contact information.',
      },
    },
  },
};

export const RequiredFieldErrors: Story = {
  args: {
    value: emptyData,
    onChange: () => {},
    errors: {
      email: 'Email address is required',
      mobileNumber: 'Mobile number is required',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Form showing required field validation errors.',
      },
    },
  },
};

// Partial Data Examples
export const EmailOnly: Story = {
  args: {
    value: {
      email: 'maria.santos@yahoo.com',
      phoneNumber: '',
      mobileNumber: '',
    },
    onChange: () => {},
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Form with only email address filled.',
      },
    },
  },
};

export const MobileOnly: Story = {
  args: {
    value: {
      email: '',
      phoneNumber: '',
      mobileNumber: '+63 917 123 4567',
    },
    onChange: () => {},
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Form with only mobile number filled.',
      },
    },
  },
};

export const PhoneAndMobile: Story = {
  args: {
    value: {
      email: '',
      phoneNumber: '(032) 234-5678',
      mobileNumber: '+63 918 765 4321',
    },
    onChange: () => {},
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Form with phone and mobile numbers filled.',
      },
    },
  },
};

// Different Format Examples
export const PhilippineFormats: Story = {
  args: {
    value: {
      email: 'pedro.garcia@gmail.com',
      phoneNumber: '(02) 987-6543',
      mobileNumber: '0917 123 4567',
    },
    onChange: () => {},
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Contact details using common Philippine number formats.',
      },
    },
  },
};

export const InternationalFormats: Story = {
  args: {
    value: {
      email: 'anna.reyes@outlook.com',
      phoneNumber: '+63 2 345 6789',
      mobileNumber: '+63 920 987 6543',
    },
    onChange: () => {},
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Contact details using international number formats.',
      },
    },
  },
};

export const BusinessContacts: Story = {
  args: {
    value: {
      email: 'info@businessname.com.ph',
      phoneNumber: '(02) 555-0123',
      mobileNumber: '+63 999 888 7777',
    },
    onChange: () => {},
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Business contact information example.',
      },
    },
  },
};

// Interactive Examples
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState<ContactDetailsData>(emptyData);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (newValue: ContactDetailsData) => {
      setValue(newValue);

      // Clear errors for fields that now have values
      const newErrors = { ...errors };
      Object.keys(newValue).forEach(key => {
        const field = key as keyof ContactDetailsData;
        if (newValue[field] && errors[field]) {
          delete newErrors[field];
        }
      });
      setErrors(newErrors);
    };

    const validateEmail = (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    const validatePhoneNumber = (phone: string) => {
      const phoneRegex = /^[\+]?[\d\s\(\)\-]{7,}$/;
      return phoneRegex.test(phone);
    };

    const validate = () => {
      const newErrors: Record<string, string> = {};

      if (value.email && !validateEmail(value.email)) {
        newErrors.email = 'Please enter a valid email address';
      }

      if (value.phoneNumber && !validatePhoneNumber(value.phoneNumber)) {
        newErrors.phoneNumber = 'Please enter a valid phone number';
      }

      if (value.mobileNumber && !validatePhoneNumber(value.mobileNumber)) {
        newErrors.mobileNumber = 'Please enter a valid mobile number';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const fillSampleData = () => {
      setValue(sampleData);
      setErrors({});
    };

    const reset = () => {
      setValue(emptyData);
      setErrors({});
    };

    return (
      <div className="space-y-6">
        <ContactDetails value={value} onChange={handleChange} errors={errors} />

        <div className="flex space-x-4">
          <button
            onClick={validate}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Validate
          </button>
          <button
            onClick={fillSampleData}
            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Fill Sample
          </button>
          <button
            onClick={reset}
            className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            Reset
          </button>
        </div>

        <div className="rounded bg-gray-100 p-4">
          <h4 className="font-medium">Current Values:</h4>
          <pre className="mt-2 text-sm">{JSON.stringify(value, null, 2)}</pre>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="rounded bg-red-100 p-4">
            <h4 className="font-medium text-red-800">Validation Errors:</h4>
            <pre className="mt-2 text-sm text-red-700">{JSON.stringify(errors, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive form with real-time validation for contact details.',
      },
    },
  },
};

// Progressive Filling Example
export const ProgressiveFilling: Story = {
  render: () => {
    const [step, setStep] = useState(0);

    const steps = [
      { ...emptyData },
      { ...emptyData, email: 'user@example.com' },
      { ...emptyData, email: 'user@example.com', phoneNumber: '(02) 123-4567' },
      {
        ...emptyData,
        email: 'user@example.com',
        phoneNumber: '(02) 123-4567',
        mobileNumber: '+63 912 345 6789',
      },
    ];

    const stepLabels = ['Empty Form', 'Add Email', 'Add Phone', 'Add Mobile'];

    return (
      <div className="space-y-6">
        <ContactDetails value={steps[step]} onChange={() => {}} errors={{}} />

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {stepLabels.map((label, index) => (
              <button
                key={index}
                onClick={() => setStep(index)}
                className={`rounded px-3 py-1 text-sm ${
                  step === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {index}: {label}
              </button>
            ))}
          </div>

          <div className="text-sm text-gray-600">
            Step {step + 1} of {steps.length}: {stepLabels[step]}
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of progressive contact information entry.',
      },
    },
  },
};

// Validation Patterns Example
export const ValidationPatterns: Story = {
  render: () => {
    const [currentExample, setCurrentExample] = useState(0);

    const examples = [
      {
        label: 'Valid Formats',
        data: {
          email: 'user@domain.com',
          phoneNumber: '(02) 123-4567',
          mobileNumber: '+63 912 345 6789',
        },
        errors: {},
      },
      {
        label: 'Invalid Email',
        data: {
          email: 'not-an-email',
          phoneNumber: '(02) 123-4567',
          mobileNumber: '+63 912 345 6789',
        },
        errors: {
          email: 'Invalid email format',
        },
      },
      {
        label: 'Short Phone',
        data: {
          email: 'user@domain.com',
          phoneNumber: '123',
          mobileNumber: '+63 912 345 6789',
        },
        errors: {
          phoneNumber: 'Phone number too short',
        },
      },
      {
        label: 'Invalid Mobile',
        data: {
          email: 'user@domain.com',
          phoneNumber: '(02) 123-4567',
          mobileNumber: 'abc-def-ghij',
        },
        errors: {
          mobileNumber: 'Mobile number contains invalid characters',
        },
      },
    ];

    const currentData = examples[currentExample];

    return (
      <div className="space-y-6">
        <ContactDetails value={currentData.data} onChange={() => {}} errors={currentData.errors} />

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => setCurrentExample(index)}
                className={`rounded px-3 py-1 text-sm ${
                  currentExample === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {example.label}
              </button>
            ))}
          </div>

          <div className="text-sm text-gray-600">Current: {currentData.label}</div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Examples of different validation patterns and error states.',
      },
    },
  },
};

// Layout Examples
export const CompactView: Story = {
  args: {
    value: sampleData,
    onChange: () => {},
    errors: {},
    className: 'max-w-2xl',
  },
  parameters: {
    docs: {
      description: {
        story: 'Contact form in a compact container showing responsive behavior.',
      },
    },
  },
};

export const MobileView: Story = {
  args: {
    value: sampleData,
    onChange: () => {},
    errors: {},
    className: 'max-w-sm',
  },
  parameters: {
    docs: {
      description: {
        story: 'Contact form optimized for mobile viewing (single column).',
      },
    },
  },
};
