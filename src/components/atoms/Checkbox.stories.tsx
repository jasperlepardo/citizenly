import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A versatile checkbox component with multiple variants, sizes, and states including indeterminate.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'primary', 'error', 'disabled'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    label: {
      control: 'text',
    },
    description: {
      control: 'text',
    },
    errorMessage: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    indeterminate: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const InteractiveWrapper = ({
  children,
  ...props
}: {
  children: React.ReactNode;
  [key: string]: unknown;
}) => {
  const [checked, setChecked] = useState(props.checked || false);
  return React.cloneElement(children, {
    ...props,
    checked,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setChecked(e.target.checked),
  });
};

export const Default: Story = {
  args: {
    label: 'Accept terms and conditions',
    description: 'By checking this box, you agree to our terms',
  },
  render: args => (
    <InteractiveWrapper {...args}>
      <Checkbox />
    </InteractiveWrapper>
  ),
};

export const Primary: Story = {
  args: {
    label: 'Primary Checkbox',
    variant: 'primary',
    description: 'This uses the primary color scheme',
  },
  render: args => (
    <InteractiveWrapper {...args}>
      <Checkbox />
    </InteractiveWrapper>
  ),
};

export const WithoutDescription: Story = {
  args: {
    label: 'Simple checkbox',
  },
  render: args => (
    <InteractiveWrapper {...args}>
      <Checkbox />
    </InteractiveWrapper>
  ),
};

export const ErrorState: Story = {
  args: {
    label: 'Required checkbox',
    description: 'This field is required',
    variant: 'error',
    errorMessage: 'You must accept the terms to continue',
  },
  render: args => (
    <InteractiveWrapper {...args}>
      <Checkbox />
    </InteractiveWrapper>
  ),
};

export const Disabled: Story = {
  args: {
    label: 'Disabled checkbox',
    description: 'This checkbox cannot be changed',
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: 'Disabled checked',
    description: 'This checkbox is checked and disabled',
    disabled: true,
    checked: true,
  },
};

export const Indeterminate: Story = {
  args: {
    label: 'Select all items',
    description: 'Some items are selected',
    indeterminate: true,
  },
  render: args => (
    <InteractiveWrapper {...args}>
      <Checkbox />
    </InteractiveWrapper>
  ),
};

// Sizes
export const Small: Story = {
  args: {
    label: 'Small checkbox',
    size: 'sm',
    description: 'This is a small checkbox',
  },
  render: args => (
    <InteractiveWrapper {...args}>
      <Checkbox />
    </InteractiveWrapper>
  ),
};

export const Medium: Story = {
  args: {
    label: 'Medium checkbox',
    size: 'md',
    description: 'This is a medium checkbox (default)',
  },
  render: args => (
    <InteractiveWrapper {...args}>
      <Checkbox />
    </InteractiveWrapper>
  ),
};

export const Large: Story = {
  args: {
    label: 'Large checkbox',
    size: 'lg',
    description: 'This is a large checkbox',
  },
  render: args => (
    <InteractiveWrapper {...args}>
      <Checkbox />
    </InteractiveWrapper>
  ),
};

// Showcase all variants
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Variants</h3>
        <Checkbox label="Default variant" />
        <Checkbox label="Primary variant" variant="primary" />
        <Checkbox label="Error variant" variant="error" />
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">States</h3>
        <Checkbox label="Unchecked" />
        <Checkbox label="Checked" checked />
        <Checkbox label="Indeterminate" indeterminate />
        <Checkbox label="Disabled unchecked" disabled />
        <Checkbox label="Disabled checked" disabled checked />
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Sizes</h3>
        <Checkbox label="Small size" size="sm" />
        <Checkbox label="Medium size" size="md" />
        <Checkbox label="Large size" size="lg" />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// Form example
const FormExampleComponent = () => {
  const [preferences, setPreferences] = useState({
    newsletter: false,
    sms: false,
    email: true,
    terms: false,
  });

  const handleChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences(prev => ({ ...prev, [key]: e.target.checked }));
  };

  return (
    <div className="space-y-4 w-96">
      <h3 className="text-lg font-semibold">Communication Preferences</h3>

      <Checkbox
        label="Email notifications"
        description="Receive important updates via email"
        checked={preferences.email}
        onChange={handleChange('email')}
      />

      <Checkbox
        label="SMS notifications"
        description="Get urgent alerts via text message"
        checked={preferences.sms}
        onChange={handleChange('sms')}
      />

      <Checkbox
        label="Newsletter subscription"
        description="Weekly newsletter with tips and updates"
        checked={preferences.newsletter}
        onChange={handleChange('newsletter')}
      />

      <div className="pt-4 border-t">
        <Checkbox
          label="I accept the terms and conditions"
          description="Required to proceed with registration"
          variant={!preferences.terms ? 'error' : 'default'}
          errorMessage={!preferences.terms ? 'You must accept the terms' : undefined}
          checked={preferences.terms}
          onChange={handleChange('terms')}
        />
      </div>

      <div className="pt-2 text-sm text-gray-600">
        Selected: {Object.values(preferences).filter(Boolean).length} of{' '}
        {Object.keys(preferences).length}
      </div>
    </div>
  );
};

export const FormExample: Story = {
  render: FormExampleComponent,
  parameters: {
    layout: 'padded',
  },
};
