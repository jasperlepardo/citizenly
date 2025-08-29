import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ContactDetails, ContactDetailsData } from '@/components/organisms/ContactDetails';
import { 
  InteractiveStory, 
  ProgressiveStory, 
  ProgressiveStoryControls,
  ValidationPatternStory,
  ValidationPatternControls,
  StoryControlButtons,
  StoryValueDisplay,
  createEmailValidator,
  createPhoneValidator,
  combineValidators,
  createStoryParameters,
  createEmptyFormData,
  createSampleFormData
} from '@/lib/storybookUtils';

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

// Default empty state using consolidated utility
const emptyData: ContactDetailsData = createEmptyFormData<ContactDetailsData>(['email', 'phoneNumber', 'mobileNumber']);

// Sample complete data using consolidated utility
const sampleData: ContactDetailsData = createSampleFormData<ContactDetailsData>({
  email: 'juan.delacruz@gmail.com',
  phoneNumber: '(02) 123-4567',
  mobileNumber: '+63 912 345 6789',
});

// Consolidated validation rules
const contactValidationRules = combineValidators(
  createEmailValidator('email'),
  createPhoneValidator('phoneNumber'),
  createPhoneValidator('mobileNumber')
);

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

// Interactive Examples using consolidated utility
export const Interactive: Story = {
  render: () => (
    <InteractiveStory
      initialValue={emptyData}
      sampleData={sampleData}
      validationRules={contactValidationRules}
    >
      {(storyState) => (
        <div className="space-y-6">
          <ContactDetails 
            value={storyState.value} 
            onChange={storyState.onChange} 
            errors={storyState.errors} 
          />

          <StoryControlButtons 
            storyState={storyState} 
            sampleData={sampleData} 
          />

          <StoryValueDisplay 
            value={storyState.value} 
            errors={storyState.errors} 
          />
        </div>
      )}
    </InteractiveStory>
  ),
  parameters: createStoryParameters(
    'Interactive Contact Details',
    'Interactive form with real-time validation for contact details using consolidated utilities.'
  ),
};

// Progressive Filling Example using consolidated utility
export const ProgressiveFilling: Story = {
  render: () => {
    const steps = [
      { 
        label: 'Empty Form', 
        data: { ...emptyData },
        description: 'Starting with empty form'
      },
      { 
        label: 'Add Email', 
        data: { ...emptyData, email: 'user@example.com' },
        description: 'Email address added'
      },
      { 
        label: 'Add Phone', 
        data: { ...emptyData, email: 'user@example.com', phoneNumber: '(02) 123-4567' },
        description: 'Phone number added'
      },
      {
        label: 'Add Mobile',
        data: {
          ...emptyData,
          email: 'user@example.com',
          phoneNumber: '(02) 123-4567',
          mobileNumber: '+63 912 345 6789',
        },
        description: 'All contact details completed'
      },
    ];

    return (
      <ProgressiveStory steps={steps}>
        {({ currentData, currentStep, goToStep }) => (
          <div className="space-y-6">
            <ContactDetails value={currentData} onChange={() => {}} errors={{}} />
            <ProgressiveStoryControls 
              steps={steps} 
              currentStep={currentStep} 
              onStepChange={goToStep} 
            />
          </div>
        )}
      </ProgressiveStory>
    );
  },
  parameters: createStoryParameters(
    'Progressive Contact Entry',
    'Demonstration of progressive contact information entry using consolidated utilities.'
  ),
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
