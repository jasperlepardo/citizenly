import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import PhilSysNumberInput from './PhilSysNumberInput';

const meta = {
  title: 'Molecules/PhilSysNumberInput',
  component: PhilSysNumberInput,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A secure PhilSys (Philippine National ID) card number input component with automatic formatting, validation, masking, and encryption capabilities. Ensures sensitive data is handled securely with proper masking when not in focus.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
    },
    required: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    showLastFourDigits: {
      control: 'boolean',
    },
    autoHash: {
      control: 'boolean',
    },
    label: {
      control: 'text',
    },
    placeholder: {
      control: 'text',
    },
  },
} satisfies Meta<typeof PhilSysNumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onChange: (value, hashedValue) => {
      console.log('Value changed:', value, 'Hashed:', hashedValue);
    },
    onValidation: (isValid, error) => {
      console.log('Validation:', isValid, error);
    },
  },
};

export const Required: Story = {
  args: {
    required: true,
    onChange: (value, hashedValue) => {
      console.log('Value changed:', value, 'Hashed:', hashedValue);
    },
    onValidation: (isValid, error) => {
      console.log('Validation:', isValid, error);
    },
  },
};

export const WithCustomLabel: Story = {
  args: {
    label: 'National ID Number',
    placeholder: 'Enter your PhilSys number',
    onChange: (value, hashedValue) => {
      console.log('Value changed:', value, 'Hashed:', hashedValue);
    },
  },
};

export const WithError: Story = {
  args: {
    error: 'Invalid PhilSys number format',
    onChange: (value, hashedValue) => {
      console.log('Value changed:', value, 'Hashed:', hashedValue);
    },
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: '1234-5678-9012',
    onChange: (value, hashedValue) => {
      console.log('Value changed:', value, 'Hashed:', hashedValue);
    },
  },
};

export const NoAutoHash: Story = {
  args: {
    autoHash: false,
    label: 'PhilSys Number (No Auto-Hash)',
    onChange: (value, hashedValue) => {
      console.log('Value changed:', value, 'Hashed:', hashedValue);
    },
  },
};

export const HideLastFourDigits: Story = {
  args: {
    showLastFourDigits: false,
    label: 'Fully Masked PhilSys Number',
    onChange: (value, hashedValue) => {
      console.log('Value changed:', value, 'Hashed:', hashedValue);
    },
  },
};

export const PrefilledValid: Story = {
  args: {
    value: '1234-5678-9012',
    onChange: (value, hashedValue) => {
      console.log('Value changed:', value, 'Hashed:', hashedValue);
    },
  },
};

export const PrefilledInvalid: Story = {
  args: {
    value: '1234-5678',
    onChange: (value, hashedValue) => {
      console.log('Value changed:', value, 'Hashed:', hashedValue);
    },
  },
};

// Interactive example showing real-time validation
const InteractiveComponent = () => {
  const [value, setValue] = useState('');
  const [hashedValue, setHashedValue] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState('');

  return (
    <div className="space-y-4">
      <PhilSysNumberInput
        value={value}
        required
        onChange={(newValue, newHashedValue) => {
          setValue(newValue);
          setHashedValue(newHashedValue || '');
        }}
        onValidation={(valid, validationError) => {
          setIsValid(valid);
          setError(validationError || '');
        }}
      />

      <div className="bg-background rounded-lg border border-default p-4">
        <h3 className="mb-2 font-semibold text-primary">Real-time Status:</h3>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Current Value:</strong>{' '}
            <code className="bg-background-muted rounded px-2 py-1">{value || 'empty'}</code>
          </div>
          <div>
            <strong>Is Valid:</strong>{' '}
            <span className={isValid ? 'text-green-600' : 'text-red-600'}>
              {isValid ? 'Yes' : 'No'}
            </span>
          </div>
          {error && (
            <div>
              <strong>Error:</strong> <span className="text-red-600">{error}</span>
            </div>
          )}
          {hashedValue && (
            <div>
              <strong>Hashed Value:</strong>{' '}
              <code className="bg-background-muted break-all rounded px-2 py-1 text-xs">
                {hashedValue.substring(0, 20)}...
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Interactive: Story = {
  render: InteractiveComponent,
};

// Example showing masking behavior
const MaskingDemoComponent = () => {
  const [value, setValue] = useState('1234567890123');

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
        <h3 className="mb-2 font-semibold text-yellow-800 dark:text-yellow-200">Masking Demo</h3>
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          Click on the input field to see the full number. When you click away, it will be masked
          for security.
        </p>
      </div>

      <PhilSysNumberInput
        value={value}
        label="PhilSys Number (Try focusing/unfocusing)"
        showLastFourDigits={true}
        onChange={newValue => setValue(newValue)}
      />

      <div className="text-muted text-sm">
        <strong>Tip:</strong> The input automatically formats as you type and masks the number when
        not focused.
      </div>
    </div>
  );
};

export const MaskingDemo: Story = {
  render: MaskingDemoComponent,
};

// Security features showcase
export const SecurityFeatures: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-3 font-semibold text-primary">With Auto-Hash (Default)</h3>
          <PhilSysNumberInput
            label="Secure PhilSys Input"
            autoHash={true}
            onChange={(value, hashedValue) => {
              console.log('Auto-hash enabled:', value, hashedValue);
            }}
          />
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-primary">No Auto-Hash</h3>
          <PhilSysNumberInput
            label="Manual Handling"
            autoHash={false}
            onChange={value => {
              console.log('Manual handling:', value);
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-3 font-semibold text-primary">Show Last 4 Digits</h3>
          <PhilSysNumberInput
            label="Partial Masking"
            showLastFourDigits={true}
            value="1234567890123"
            onChange={() => {}}
          />
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-primary">Full Masking</h3>
          <PhilSysNumberInput
            label="Complete Masking"
            showLastFourDigits={false}
            value="1234567890123"
            onChange={() => {}}
          />
        </div>
      </div>
    </div>
  ),
};
