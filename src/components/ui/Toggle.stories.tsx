import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Toggle } from './Toggle';

const meta: Meta<typeof Toggle> = {
  title: 'UI/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A toggle/switch component for binary on/off states with smooth animations.',
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

const InteractiveWrapper = ({ children, ...props }: any) => {
  const [checked, setChecked] = useState(props.checked || false);
  return React.cloneElement(children, {
    ...props,
    checked,
    onToggle: setChecked,
  });
};

export const Default: Story = {
  args: {
    label: 'Enable notifications',
    description: 'Receive push notifications on your device',
  },
  render: (args) => (
    <InteractiveWrapper {...args}>
      <Toggle />
    </InteractiveWrapper>
  ),
};

export const Primary: Story = {
  args: {
    label: 'Primary toggle',
    description: 'This uses primary color when active',
    variant: 'primary',
  },
  render: (args) => (
    <InteractiveWrapper {...args}>
      <Toggle />
    </InteractiveWrapper>
  ),
};

export const WithoutDescription: Story = {
  args: {
    label: 'Simple toggle',
  },
  render: (args) => (
    <InteractiveWrapper {...args}>
      <Toggle />
    </InteractiveWrapper>
  ),
};

export const ErrorState: Story = {
  args: {
    label: 'Required setting',
    description: 'This setting must be enabled',
    variant: 'error',
    errorMessage: 'This feature is required for the application to work',
  },
  render: (args) => (
    <InteractiveWrapper {...args}>
      <Toggle />
    </InteractiveWrapper>
  ),
};

export const Disabled: Story = {
  args: {
    label: 'Disabled toggle',
    description: 'This toggle cannot be changed',
    disabled: true,
  },
};

export const DisabledOn: Story = {
  args: {
    label: 'Disabled (On)',
    description: 'This toggle is on and cannot be changed',
    disabled: true,
    checked: true,
  },
};

// Sizes
export const Small: Story = {
  args: {
    label: 'Small toggle',
    size: 'sm',
    description: 'Compact size for tight spaces',
  },
  render: (args) => (
    <InteractiveWrapper {...args}>
      <Toggle />
    </InteractiveWrapper>
  ),
};

export const Medium: Story = {
  args: {
    label: 'Medium toggle',
    size: 'md',
    description: 'Default size for most use cases',
  },
  render: (args) => (
    <InteractiveWrapper {...args}>
      <Toggle />
    </InteractiveWrapper>
  ),
};

export const Large: Story = {
  args: {
    label: 'Large toggle',
    size: 'lg',
    description: 'Larger size for accessibility',
  },
  render: (args) => (
    <InteractiveWrapper {...args}>
      <Toggle />
    </InteractiveWrapper>
  ),
};

// Showcase all variants
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Variants</h3>
        <Toggle label="Default variant" description="Purple when active" />
        <Toggle label="Primary variant" variant="primary" description="Blue when active" />
        <Toggle label="Error variant" variant="error" description="Red when active" />
      </div>
      
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">States</h3>
        <Toggle label="Off state" />
        <Toggle label="On state" checked />
        <Toggle label="Disabled off" disabled />
        <Toggle label="Disabled on" disabled checked />
      </div>
      
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Sizes</h3>
        <Toggle label="Small size" size="sm" />
        <Toggle label="Medium size" size="md" />
        <Toggle label="Large size" size="lg" />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// Settings panel example
export const SettingsExample: Story = {
  render: () => {
    const [settings, setSettings] = useState({
      notifications: true,
      darkMode: false,
      autoSave: true,
      analytics: false,
      beta: false,
    });
    
    const handleToggle = (key: string) => (checked: boolean) => {
      setSettings(prev => ({ ...prev, [key]: checked }));
    };
    
    return (
      <div className="space-y-4 w-96">
        <h3 className="text-lg font-semibold">Application Settings</h3>
        
        <div className="space-y-4">
          <Toggle
            label="Push Notifications"
            description="Receive notifications about important updates"
            checked={settings.notifications}
            onToggle={handleToggle('notifications')}
          />
          
          <Toggle
            label="Dark Mode"
            description="Use dark theme across the application"
            variant="primary"
            checked={settings.darkMode}
            onToggle={handleToggle('darkMode')}
          />
          
          <Toggle
            label="Auto Save"
            description="Automatically save your work every 30 seconds"
            checked={settings.autoSave}
            onToggle={handleToggle('autoSave')}
          />
          
          <Toggle
            label="Usage Analytics"
            description="Help improve the app by sharing anonymous usage data"
            checked={settings.analytics}
            onToggle={handleToggle('analytics')}
          />
          
          <Toggle
            label="Beta Features"
            description="Enable experimental features (may be unstable)"
            variant="error"
            checked={settings.beta}
            onToggle={handleToggle('beta')}
          />
        </div>
        
        <div className="pt-4 border-t text-sm text-gray-600">
          <p>Active settings: {Object.values(settings).filter(Boolean).length} of {Object.keys(settings).length}</p>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'padded',
  },
};