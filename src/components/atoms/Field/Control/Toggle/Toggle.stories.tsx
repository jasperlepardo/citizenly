import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Toggle } from './Toggle';

const meta = {
  title: 'Atoms/Field/Control/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A customizable toggle/switch component with support for labels, descriptions, error states, and different variants.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'primary', 'error', 'disabled'],
    },
    checked: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
    label: {
      control: { type: 'text' },
    },
    description: {
      control: { type: 'text' },
    },
    errorMessage: {
      control: { type: 'text' },
    },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Default toggle',
    checked: false,
  },
};

export const Checked: Story = {
  args: {
    label: 'Checked toggle',
    checked: true,
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Enable notifications',
    description: 'Receive email notifications about important updates and changes.',
    checked: false,
  },
};

export const Primary: Story = {
  args: {
    label: 'Primary toggle',
    variant: 'primary',
    checked: true,
  },
};

export const Error: Story = {
  args: {
    label: 'Toggle with error',
    errorMessage: 'This setting is required',
    checked: false,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled toggle',
    disabled: true,
    checked: false,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: 'Disabled checked toggle',
    disabled: true,
    checked: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Toggle
        size="sm"
        label="Small toggle"
        description="This is a small toggle switch"
        checked={true}
      />
      <Toggle
        size="md"
        label="Medium toggle"
        description="This is a medium toggle switch"
        checked={true}
      />
      <Toggle
        size="lg"
        label="Large toggle"
        description="This is a large toggle switch"
        checked={true}
      />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Toggle
        variant="default"
        label="Default variant"
        description="Purple/violet primary color"
        checked={true}
      />
      <Toggle
        variant="primary"
        label="Primary variant"
        description="Blue primary color"
        checked={true}
      />
      <Toggle variant="error" label="Error variant" description="Red error color" checked={true} />
      <Toggle
        label="Disabled variant"
        description="Disabled toggle"
        disabled={true}
        checked={true}
      />
    </div>
  ),
};

const SettingsPanelComponent = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [analytics, setAnalytics] = useState(false);

  return (
    <div className="w-full max-w-md rounded-lg border bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">Settings</h3>

      <div className="space-y-4">
        <Toggle
          label="Push Notifications"
          description="Receive notifications on your device"
          checked={notifications}
          onToggle={setNotifications}
        />

        <Toggle
          label="Dark Mode"
          description="Use dark theme across the application"
          variant="primary"
          checked={darkMode}
          onToggle={setDarkMode}
        />

        <Toggle
          label="Auto-save"
          description="Automatically save your work every 5 minutes"
          checked={autoSave}
          onToggle={setAutoSave}
        />

        <Toggle
          label="Analytics"
          description="Help us improve by sharing anonymous usage data"
          checked={analytics}
          onToggle={setAnalytics}
        />
      </div>

      <div className="mt-6 border-t pt-4">
        <h4 className="mb-2 text-sm font-medium">Current Settings:</h4>
        <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
          <li>Notifications: {notifications ? 'Enabled' : 'Disabled'}</li>
          <li>Dark Mode: {darkMode ? 'Enabled' : 'Disabled'}</li>
          <li>Auto-save: {autoSave ? 'Enabled' : 'Disabled'}</li>
          <li>Analytics: {analytics ? 'Enabled' : 'Disabled'}</li>
        </ul>
      </div>
    </div>
  );
};

export const SettingsPanel: Story = {
  args: {
    label: 'Settings panel demo',
    checked: false,
  },
  render: () => <SettingsPanelComponent />,
};

const InteractiveToggleComponent = () => {
  const [checked, setChecked] = useState(false);
  const [variant, setVariant] = useState<'default' | 'primary' | 'error'>('default');
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">Variant:</span>
          {(['default', 'primary', 'error'] as const).map(v => (
            <button
              key={v}
              onClick={() => setVariant(v)}
              className={`rounded px-2 py-1 text-xs ${
                variant === v ? 'bg-blue-500 text-white dark:text-black' : 'bg-gray-200'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="flex gap-1">
          <span className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-600">Size:</span>
          {(['sm', 'md', 'lg'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`rounded px-2 py-1 text-xs ${
                size === s ? 'bg-blue-500 text-white dark:text-black' : 'bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Toggle
        label="Interactive Toggle"
        description="This toggle demonstrates different variants and sizes"
        checked={checked}
        variant={variant}
        size={size}
        onToggle={setChecked}
      />

      <div className="rounded bg-gray-100 p-3 text-sm">
        <strong>State:</strong> {checked ? 'ON' : 'OFF'} |<strong> Variant:</strong> {variant} |
        <strong> Size:</strong> {size}
      </div>
    </div>
  );
};

export const Interactive: Story = {
  args: {
    label: 'Interactive toggle demo',
    checked: false,
  },
  render: () => <InteractiveToggleComponent />,
};
