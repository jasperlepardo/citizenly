import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Radio, RadioGroup } from './Radio';

const meta: Meta<typeof Radio> = {
  title: 'UI/Radio',
  component: Radio,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Radio button component for single selection from a group of options.',
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
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Accept terms and conditions',
    description: 'By selecting this option, you agree to our terms',
    value: 'accept',
    name: 'terms',
  },
};

export const Primary: Story = {
  args: {
    label: 'Primary option',
    variant: 'primary',
    description: 'This uses primary color when selected',
    value: 'primary',
    name: 'variant-demo',
  },
};

export const WithoutDescription: Story = {
  args: {
    label: 'Simple radio option',
    value: 'simple',
    name: 'simple-demo',
  },
};

export const ErrorState: Story = {
  args: {
    label: 'Required selection',
    description: 'This option has an error',
    variant: 'error',
    errorMessage: 'This field is required',
    value: 'error',
    name: 'error-demo',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled option',
    description: 'This option cannot be selected',
    disabled: true,
    value: 'disabled',
    name: 'disabled-demo',
  },
};

export const DisabledChecked: Story = {
  args: {
    label: 'Disabled selected',
    description: 'This option is selected and disabled',
    disabled: true,
    checked: true,
    value: 'disabled-checked',
    name: 'disabled-checked-demo',
  },
};

// Sizes
export const Small: Story = {
  args: {
    label: 'Small radio',
    size: 'sm',
    description: 'This is a small radio button',
    value: 'small',
    name: 'size-demo',
  },
};

export const Medium: Story = {
  args: {
    label: 'Medium radio',
    size: 'md',
    description: 'This is a medium radio button (default)',
    value: 'medium',
    name: 'size-demo',
  },
};

export const Large: Story = {
  args: {
    label: 'Large radio',
    size: 'lg',
    description: 'This is a large radio button',
    value: 'large',
    name: 'size-demo',
  },
};

// RadioGroup Stories
const RadioGroupMeta: Meta<typeof RadioGroup> = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A group of radio buttons for selecting a single option from multiple choices.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: { type: 'select' },
      options: ['vertical', 'horizontal'],
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'primary', 'error'],
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
  },
};

const GroupVerticalComponent = () => {
  const [value, setValue] = useState('option1');
  return (
    <RadioGroup
      label="Choose your plan"
      description="Select the plan that best suits your needs"
      value={value}
      onChange={setValue}
      orientation="vertical"
    >
      <Radio value="basic" label="Basic Plan" description="Perfect for individuals - $9/month" />
      <Radio value="pro" label="Pro Plan" description="Great for small teams - $29/month" />
      <Radio
        value="enterprise"
        label="Enterprise Plan"
        description="For large organizations - $99/month"
      />
    </RadioGroup>
  );
};

export const GroupVertical: StoryObj<typeof RadioGroup> = {
  ...RadioGroupMeta,
  render: GroupVerticalComponent,
};

const GroupHorizontalComponent = () => {
  const [value, setValue] = useState('medium');
  return (
    <RadioGroup
      label="Size preference"
      description="How would you like your coffee?"
      value={value}
      onChange={setValue}
      orientation="horizontal"
    >
      <Radio value="small" label="Small" />
      <Radio value="medium" label="Medium" />
      <Radio value="large" label="Large" />
    </RadioGroup>
  );
};

export const GroupHorizontal: StoryObj<typeof RadioGroup> = {
  ...RadioGroupMeta,
  render: GroupHorizontalComponent,
};

const GroupWithErrorComponent = () => {
  const [value, setValue] = useState('');
  return (
    <RadioGroup
      label="Required selection"
      description="You must choose one option"
      value={value}
      onChange={setValue}
      variant="error"
      errorMessage="Please select an option to continue"
    >
      <Radio value="yes" label="Yes, I agree" />
      <Radio value="no" label="No, I disagree" />
    </RadioGroup>
  );
};

export const GroupWithError: StoryObj<typeof RadioGroup> = {
  ...RadioGroupMeta,
  render: GroupWithErrorComponent,
};

export const GroupDisabled: StoryObj<typeof RadioGroup> = {
  ...RadioGroupMeta,
  args: {
    label: 'Disabled group',
    description: 'This entire group is disabled',
    disabled: true,
    value: 'option2',
  },
  render: args => (
    <RadioGroup {...args}>
      <Radio value="option1" label="First option" />
      <Radio value="option2" label="Second option" />
      <Radio value="option3" label="Third option" />
    </RadioGroup>
  ),
};

// Showcase all variants
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Individual Radio Variants</h3>
        <div className="space-y-2">
          <Radio label="Default variant" value="default" name="variants" />
          <Radio label="Primary variant" variant="primary" value="primary" name="variants" />
          <Radio label="Error variant" variant="error" value="error" name="variants" />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">States</h3>
        <div className="space-y-2">
          <Radio label="Unselected" value="unselected" name="states" />
          <Radio label="Selected" value="selected" name="states" checked />
          <Radio label="Disabled unselected" disabled value="disabled" name="states" />
          <Radio
            label="Disabled selected"
            disabled
            checked
            value="disabled-selected"
            name="states"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Sizes</h3>
        <div className="space-y-2">
          <Radio label="Small size" size="sm" value="small" name="sizes" />
          <Radio label="Medium size" size="md" value="medium" name="sizes" />
          <Radio label="Large size" size="lg" value="large" name="sizes" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// Settings example
const SettingsExampleComponent = () => {
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState('email');
  const [privacy, setPrivacy] = useState('friends');

  return (
    <div className="w-96 space-y-6">
      <h3 className="text-lg font-semibold">User Preferences</h3>

      <RadioGroup
        label="Theme Preference"
        description="Choose your preferred theme"
        value={theme}
        onChange={setTheme}
        orientation="vertical"
      >
        <Radio value="light" label="Light theme" description="Clean and bright interface" />
        <Radio value="dark" label="Dark theme" description="Easy on the eyes" />
        <Radio value="auto" label="System theme" description="Match your device settings" />
      </RadioGroup>

      <RadioGroup
        label="Notification Method"
        description="How would you like to receive notifications?"
        value={notifications}
        onChange={setNotifications}
        variant="primary"
        orientation="vertical"
      >
        <Radio value="email" label="Email only" description="Receive notifications via email" />
        <Radio
          value="push"
          label="Push notifications"
          description="Get instant alerts on your device"
        />
        <Radio value="both" label="Email + Push" description="Get notified everywhere" />
        <Radio value="none" label="No notifications" description="Stay focused, no interruptions" />
      </RadioGroup>

      <RadioGroup
        label="Privacy Level"
        description="Who can see your profile?"
        value={privacy}
        onChange={setPrivacy}
        orientation="horizontal"
      >
        <Radio value="public" label="Public" />
        <Radio value="friends" label="Friends" />
        <Radio value="private" label="Private" />
      </RadioGroup>

      <div className="border-t pt-4 text-sm text-gray-600">
        <p>
          Current settings: {theme} theme, {notifications} notifications, {privacy} profile
        </p>
      </div>
    </div>
  );
};

export const SettingsExample: Story = {
  render: SettingsExampleComponent,
  parameters: {
    layout: 'padded',
  },
};
