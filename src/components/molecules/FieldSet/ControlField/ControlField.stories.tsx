import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ControlField, ControlGroup } from './ControlField';

const meta = {
  title: 'Molecules/FieldSet/ControlField',
  component: ControlField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A ControlField molecule that wraps the Control atom component with additional field functionality like helper text, error messages, and layout options.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: { type: 'select' },
      options: ['vertical', 'horizontal'],
    },
    labelWidth: {
      control: { type: 'text' },
    },
    helperText: {
      control: { type: 'text' },
    },
    errorMessage: {
      control: { type: 'text' },
    },
    className: {
      control: { type: 'text' },
    },
  },
} satisfies Meta<typeof ControlField>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const CheckboxField: Story = {
  args: {
    label: 'Terms and Conditions',
    required: true,
    controlProps: {
      type: 'checkbox',
      label: 'Accept terms and conditions',
      description: 'Please read and accept our terms of service',
    },
    helperText: 'This is required to continue',
  },
};

export const RadioField: Story = {
  args: {
    controlProps: {
      type: 'radio',
      name: 'payment-method',
      value: 'credit-card',
      label: 'Credit Card',
      description: 'Pay with your credit or debit card',
    },
    helperText: 'Secure payment processing',
  },
};

export const ToggleField: Story = {
  args: {
    controlProps: {
      type: 'toggle',
      label: 'Enable notifications',
      description: 'Receive email updates about your account',
      checked: true,
    },
    helperText: 'You can change this anytime in settings',
  },
};

// With Error States
export const CheckboxWithError: Story = {
  args: {
    controlProps: {
      type: 'checkbox',
      label: 'Required checkbox',
    },
    errorMessage: 'This field is required',
  },
};

export const RadioWithError: Story = {
  args: {
    controlProps: {
      type: 'radio',
      name: 'required-radio',
      value: 'option1',
      label: 'Option 1',
    },
    errorMessage: 'Please select an option',
  },
};

export const ToggleWithError: Story = {
  args: {
    controlProps: {
      type: 'toggle',
      label: 'Required toggle',
    },
    errorMessage: 'This must be enabled to continue',
  },
};

// Horizontal Layout
export const HorizontalCheckbox: Story = {
  args: {
    orientation: 'horizontal',
    labelWidth: 'w-48',
    controlProps: {
      type: 'checkbox',
      label: 'Marketing emails',
      description: 'Receive promotional content',
    },
    helperText: 'Optional - you can unsubscribe anytime',
  },
};

export const HorizontalRadio: Story = {
  args: {
    orientation: 'horizontal',
    labelWidth: 'w-48',
    controlProps: {
      type: 'radio',
      name: 'horizontal-radio',
      value: 'option1',
      label: 'Payment method',
      description: 'Credit card payment',
    },
    helperText: '3% processing fee applies',
  },
};

// Size Variations
export const SizeVariations: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Size Variations - Checkbox</h3>
        <div className="space-y-4">
          <ControlField
            controlProps={{
              type: 'checkbox',
              size: 'sm',
              label: 'Small checkbox',
              checked: true,
            }}
            helperText="Small size control"
          />
          <ControlField
            controlProps={{
              type: 'checkbox',
              size: 'md',
              label: 'Medium checkbox',
              checked: true,
            }}
            helperText="Medium size control"
          />
          <ControlField
            controlProps={{
              type: 'checkbox',
              size: 'lg',
              label: 'Large checkbox',
              checked: true,
            }}
            helperText="Large size control"
          />
        </div>
      </div>
    </div>
  ),
};

// Interactive Examples
export const InteractiveCheckboxField: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    const [hasError, setHasError] = useState(false);

    return (
      <div className="space-y-4">
        <ControlField
          controlProps={{
            type: 'checkbox',
            label: 'Interactive checkbox',
            description: 'Click to toggle the state',
            checked,
            onChange: (e) => {
              setChecked(e.target.checked);
              setHasError(false);
            },
          }}
          helperText={!hasError ? 'Checkbox is currently ' + (checked ? 'checked' : 'unchecked') : undefined}
          errorMessage={hasError ? 'This field is required' : undefined}
        />
        <div className="flex gap-2">
          <button
            onClick={() => setHasError(!hasError)}
            className="rounded bg-red-500 px-3 py-1 text-sm text-white"
          >
            Toggle Error
          </button>
          <button
            onClick={() => {
              setChecked(false);
              setHasError(false);
            }}
            className="rounded bg-zinc-500 px-3 py-1 text-sm text-white"
          >
            Reset
          </button>
        </div>
      </div>
    );
  },
};

export const InteractiveToggleField: Story = {
  render: () => {
    const [enabled, setEnabled] = useState(false);
    const [notifications, setNotifications] = useState(true);

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Interactive Toggle Fields</h3>
        
        <ControlField
          controlProps={{
            type: 'toggle',
            label: 'Enable feature',
            description: 'Turn this feature on or off',
            checked: enabled,
            onToggle: setEnabled,
          }}
          helperText={`Feature is currently ${enabled ? 'enabled' : 'disabled'}`}
        />
        
        <ControlField
          controlProps={{
            type: 'toggle',
            label: 'Notifications',
            description: 'Receive push notifications',
            checked: notifications,
            onToggle: setNotifications,
          }}
          helperText={`Notifications are ${notifications ? 'on' : 'off'}`}
        />
      </div>
    );
  },
};

// Control Group Examples
export const BasicControlGroup: Story = {
  render: () => (
    <ControlGroup
      title="Notification Preferences"
      description="Choose how you'd like to be notified"
      spacing="md"
    >
      <ControlField
        controlProps={{
          type: 'checkbox',
          label: 'Email notifications',
          description: 'Receive updates via email',
        }}
      />
      <ControlField
        controlProps={{
          type: 'checkbox',
          label: 'SMS notifications',
          description: 'Receive updates via text message',
        }}
      />
      <ControlField
        controlProps={{
          type: 'checkbox',
          label: 'Push notifications',
          description: 'Receive updates in your browser',
        }}
      />
    </ControlGroup>
  ),
};

export const HorizontalControlGroup: Story = {
  render: () => (
    <ControlGroup
      title="Quick Actions"
      description="Enable or disable features quickly"
      orientation="horizontal"
      spacing="lg"
    >
      <ControlField
        controlProps={{
          type: 'toggle',
          label: 'Dark mode',
          checked: true,
        }}
      />
      <ControlField
        controlProps={{
          type: 'toggle',
          label: 'Auto-save',
          checked: false,
        }}
      />
      <ControlField
        controlProps={{
          type: 'toggle',
          label: 'Sound effects',
          checked: true,
        }}
      />
    </ControlGroup>
  ),
};

export const RadioGroup: Story = {
  render: () => {
    const [paymentMethod, setPaymentMethod] = useState('credit-card');

    const options = [
      { value: 'credit-card', label: 'Credit Card', description: 'Pay with Visa, MasterCard, or Amex' },
      { value: 'paypal', label: 'PayPal', description: 'Pay with your PayPal account' },
      { value: 'bank-transfer', label: 'Bank Transfer', description: 'Direct bank account transfer' },
    ];

    return (
      <ControlGroup
        title="Payment Method"
        description="Select your preferred payment method"
        spacing="md"
      >
        {options.map((option) => (
          <ControlField
            key={option.value}
            controlProps={{
              type: 'radio',
              name: 'payment-method',
              value: option.value,
              label: option.label,
              description: option.description,
              checked: paymentMethod === option.value,
              onChange: (e) => setPaymentMethod(e.target.value),
            }}
            helperText={paymentMethod === option.value ? 'Selected payment method' : undefined}
          />
        ))}
      </ControlGroup>
    );
  },
};

// Complex Form Example
export const ComplexForm: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      terms: false,
      marketing: false,
      notifications: true,
      theme: 'light',
      frequency: 'weekly',
    });

    const updateField = (field: string, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
      <div className="max-w-2xl space-y-8">
        <h2 className="text-xl font-bold">Account Settings</h2>
        
        <ControlGroup
          title="Terms & Privacy"
          description="Required agreements"
          spacing="md"
        >
          <ControlField
            controlProps={{
              type: 'checkbox',
              label: 'Accept Terms of Service',
              description: 'I agree to the terms and conditions',
              checked: formData.terms,
              onChange: (e) => updateField('terms', e.target.checked),
            }}
            errorMessage={!formData.terms ? 'You must accept the terms to continue' : undefined}
          />
          <ControlField
            controlProps={{
              type: 'checkbox',
              label: 'Marketing Communications',
              description: 'Receive promotional emails and offers',
              checked: formData.marketing,
              onChange: (e) => updateField('marketing', e.target.checked),
            }}
            helperText="Optional - you can unsubscribe anytime"
          />
        </ControlGroup>

        <ControlGroup
          title="Preferences"
          description="Customize your experience"
          spacing="md"
        >
          <ControlField
            controlProps={{
              type: 'toggle',
              label: 'Push Notifications',
              description: 'Receive real-time updates',
              checked: formData.notifications,
              onToggle: (checked) => updateField('notifications', checked),
            }}
            helperText="Recommended for staying up to date"
          />
        </ControlGroup>

        <ControlGroup
          title="Theme Preference"
          description="Choose your preferred theme"
          spacing="sm"
        >
          <ControlField
            controlProps={{
              type: 'radio',
              name: 'theme',
              value: 'light',
              label: 'Light Theme',
              description: 'Clean and bright interface',
              checked: formData.theme === 'light',
              onChange: (e) => updateField('theme', e.target.value),
            }}
          />
          <ControlField
            controlProps={{
              type: 'radio',
              name: 'theme',
              value: 'dark',
              label: 'Dark Theme',
              description: 'Easy on the eyes in low light',
              checked: formData.theme === 'dark',
              onChange: (e) => updateField('theme', e.target.value),
            }}
          />
          <ControlField
            controlProps={{
              type: 'radio',
              name: 'theme',
              value: 'auto',
              label: 'Auto Theme',
              description: 'Matches your system preference',
              checked: formData.theme === 'auto',
              onChange: (e) => updateField('theme', e.target.value),
            }}
          />
        </ControlGroup>

        <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
          <h4 className="font-medium mb-2">Current Settings:</h4>
          <pre className="text-sm">
{JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      </div>
    );
  },
};

// Playground
export const Playground: Story = {
  args: {
    controlProps: {
      type: 'checkbox',
      label: 'Playground control',
      description: 'Customize this control to test different configurations',
      checked: false,
    },
    helperText: 'This is a helper text',
    orientation: 'vertical',
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to experiment with different ControlField configurations.',
      },
    },
  },
};