import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PhilSysCardField } from './PhilSysCardField';

const meta = {
  title: 'Organisms/Form/Resident/PersonalInformation/FormField/PhilSysCardField',
  component: PhilSysCardField,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A specialized input field for PhilSys (Philippine Identification System) card numbers. Provides consistent formatting and validation for national ID numbers.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'text' },
      description: 'Current PhilSys card number value',
    },
    onChange: {
      action: 'changed',
      description: 'Callback when the value changes',
    },
    error: {
      control: { type: 'text' },
      description: 'Error message to display',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether the field is required',
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof PhilSysCardField>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    value: '',
    onChange: () => {},
    required: false,
  },
};

export const Required: Story = {
  args: {
    value: '',
    onChange: () => {},
    required: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Required PhilSys card field with asterisk indicator.',
      },
    },
  },
};

export const WithValue: Story = {
  args: {
    value: '1234-5678-9012',
    onChange: () => {},
    required: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Field with a sample PhilSys card number.',
      },
    },
  },
};

export const WithError: Story = {
  args: {
    value: '123-456',
    onChange: () => {},
    error: 'PhilSys card number must be in the format XXXX-XXXX-XXXX',
    required: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Field showing validation error for incorrect format.',
      },
    },
  },
};

// Validation Examples
export const InvalidFormat: Story = {
  args: {
    value: 'invalid-format',
    onChange: () => {},
    error: 'Please enter a valid PhilSys card number',
    required: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Field with invalid format and error message.',
      },
    },
  },
};

export const Empty: Story = {
  args: {
    value: '',
    onChange: () => {},
    error: 'PhilSys card number is required',
    required: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Required field that is empty showing validation error.',
      },
    },
  },
};

// Interactive Examples
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const [error, setError] = useState('');

    const handleChange = (newValue: string) => {
      setValue(newValue);
      
      // Simple validation
      if (newValue && !/^\d{4}-\d{4}-\d{4}$/.test(newValue)) {
        setError('PhilSys card number must be in the format XXXX-XXXX-XXXX');
      } else if (!newValue) {
        setError('PhilSys card number is required');
      } else {
        setError('');
      }
    };

    return (
      <div className="space-y-4">
        <PhilSysCardField
          value={value}
          onChange={handleChange}
          error={error}
          required={true}
        />
        <div className="text-sm text-gray-600">
          <p>Current value: "{value}"</p>
          <p>Valid format: XXXX-XXXX-XXXX (e.g., 1234-5678-9012)</p>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive field with real-time validation for PhilSys card format.',
      },
    },
  },
};

// Progressive Filling Example
export const ProgressiveFilling: Story = {
  render: () => {
    const [value, setValue] = useState('');
    
    const examples = [
      { label: 'Clear', value: '' },
      { label: 'Partial (4 digits)', value: '1234' },
      { label: 'Partial (8 digits)', value: '1234-5678' },
      { label: 'Complete', value: '1234-5678-9012' },
    ];

    return (
      <div className="space-y-4">
        <PhilSysCardField
          value={value}
          onChange={setValue}
          required={true}
        />
        
        <div className="space-x-2">
          <span className="text-sm font-medium">Quick fill:</span>
          {examples.map((example) => (
            <button
              key={example.label}
              onClick={() => setValue(example.value)}
              className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800 hover:bg-blue-200"
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Example showing progressive filling of PhilSys card number.',
      },
    },
  },
};

// Form Context Example
export const InFormContext: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      philsysCard: '',
      firstName: '',
      lastName: '',
    });
    
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handlePhilSysChange = (value: string) => {
      setFormData(prev => ({ ...prev, philsysCard: value }));
      
      // Clear error when user starts typing
      if (errors.philsysCard) {
        setErrors(prev => ({ ...prev, philsysCard: '' }));
      }
    };

    const validateForm = () => {
      const newErrors: Record<string, string> = {};
      
      if (!formData.philsysCard) {
        newErrors.philsysCard = 'PhilSys card number is required';
      } else if (!/^\d{4}-\d{4}-\d{4}$/.test(formData.philsysCard)) {
        newErrors.philsysCard = 'Invalid PhilSys card format';
      }
      
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      }
      
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    return (
      <div className="max-w-md space-y-6">
        <div className="space-y-4">
          <PhilSysCardField
            value={formData.philsysCard}
            onChange={handlePhilSysChange}
            error={errors.philsysCard}
            required={true}
          />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">First Name *</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className="w-full rounded border px-3 py-2"
              placeholder="Enter first name"
            />
            {errors.firstName && (
              <p className="text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Last Name *</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className="w-full rounded border px-3 py-2"
              placeholder="Enter last name"
            />
            {errors.lastName && (
              <p className="text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>
        
        <button
          onClick={validateForm}
          className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Validate Form
        </button>
        
        {Object.keys(errors).length === 0 && formData.philsysCard && (
          <div className="rounded bg-green-100 p-3 text-green-800">
            ✓ All fields are valid!
          </div>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'PhilSys card field used within a larger form context with validation.',
      },
    },
  },
};