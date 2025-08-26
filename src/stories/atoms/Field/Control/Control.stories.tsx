import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Control } from '@/components/atoms/Control';

const meta = {
  title: 'Atoms/Field/Control',
  component: Control,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A unified Control component that can render as checkbox, radio, or toggle. Includes shared TitleDescription layout for consistent label and description styling.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['checkbox', 'radio', 'toggle'],
      description: 'Type of control component to render',
    },
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
    indeterminate: {
      control: { type: 'boolean' },
      if: { arg: 'type', eq: 'checkbox' },
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
} satisfies Meta<typeof Control>;

export default meta;
type Story = StoryObj<typeof meta>;

// Checkbox Examples
export const CheckboxDefault: Story = {
  args: {
    type: 'checkbox',
    label: 'Default checkbox',
    checked: false,
  },
};

export const CheckboxChecked: Story = {
  args: {
    type: 'checkbox',
    label: 'Checked checkbox',
    checked: true,
  },
};

export const CheckboxIndeterminate: Story = {
  args: {
    type: 'checkbox',
    label: 'Indeterminate checkbox',
    indeterminate: true,
  },
};

export const CheckboxWithDescription: Story = {
  args: {
    type: 'checkbox',
    label: 'Checkbox with description',
    description: 'This is a helpful description that explains the checkbox option.',
    checked: false,
  },
};

export const CheckboxError: Story = {
  args: {
    type: 'checkbox',
    label: 'Checkbox with error',
    errorMessage: 'This field is required',
    checked: false,
  },
};

export const CheckboxDisabled: Story = {
  args: {
    type: 'checkbox',
    label: 'Disabled checkbox',
    disabled: true,
    checked: false,
  },
};

// Radio Examples
export const RadioDefault: Story = {
  args: {
    type: 'radio',
    label: 'Default radio',
    name: 'example',
    value: 'default',
  },
};

export const RadioChecked: Story = {
  args: {
    type: 'radio',
    label: 'Checked radio',
    name: 'example',
    value: 'checked',
    checked: true,
  },
};

export const RadioWithDescription: Story = {
  args: {
    type: 'radio',
    label: 'Radio with description',
    description: 'This is a helpful description that explains the radio option.',
    name: 'example',
    value: 'with-description',
  },
};

export const RadioError: Story = {
  args: {
    type: 'radio',
    label: 'Radio with error',
    errorMessage: 'This field is required',
    name: 'example',
    value: 'error',
  },
};

export const RadioDisabled: Story = {
  args: {
    type: 'radio',
    label: 'Disabled radio',
    disabled: true,
    name: 'example',
    value: 'disabled',
  },
};

// Toggle Examples
export const ToggleDefault: Story = {
  args: {
    type: 'toggle',
    label: 'Default toggle',
    checked: false,
  },
};

export const ToggleChecked: Story = {
  args: {
    type: 'toggle',
    label: 'Checked toggle',
    checked: true,
  },
};

export const ToggleWithDescription: Story = {
  args: {
    type: 'toggle',
    label: 'Toggle with description',
    description: 'This is a helpful description that explains the toggle option.',
    checked: false,
  },
};

export const ToggleError: Story = {
  args: {
    type: 'toggle',
    label: 'Toggle with error',
    errorMessage: 'This field is required',
    checked: false,
  },
};

export const ToggleDisabled: Story = {
  args: {
    type: 'toggle',
    label: 'Disabled toggle',
    disabled: true,
    checked: false,
  },
};

// Size Variations
export const SizeVariations: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Size Variations - Checkbox</h3>
        <div className="flex flex-col gap-4">
          <Control type="checkbox" size="sm" label="Small checkbox" checked={true} />
          <Control type="checkbox" size="md" label="Medium checkbox" checked={true} />
          <Control type="checkbox" size="lg" label="Large checkbox" checked={true} />
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Size Variations - Radio</h3>
        <div className="flex flex-col gap-4">
          <Control
            type="radio"
            size="sm"
            label="Small radio"
            name="size-radio"
            value="sm"
            checked={true}
          />
          <Control type="radio" size="md" label="Medium radio" name="size-radio" value="md" />
          <Control type="radio" size="lg" label="Large radio" name="size-radio" value="lg" />
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Size Variations - Toggle</h3>
        <div className="flex flex-col gap-4">
          <Control type="toggle" size="sm" label="Small toggle" checked={true} />
          <Control type="toggle" size="md" label="Medium toggle" checked={true} />
          <Control type="toggle" size="lg" label="Large toggle" checked={true} />
        </div>
      </div>
    </div>
  ),
};

// Variant Examples
export const VariantExamples: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Variants - Checkbox</h3>
        <div className="flex flex-col gap-4">
          <Control type="checkbox" variant="default" label="Default checkbox" checked={true} />
          <Control type="checkbox" variant="primary" label="Primary checkbox" checked={true} />
          <Control type="checkbox" variant="error" label="Error checkbox" checked={true} />
          <Control
            type="checkbox"
            variant="disabled"
            label="Disabled checkbox"
            checked={true}
            disabled
          />
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Variants - Radio</h3>
        <div className="flex flex-col gap-4">
          <Control
            type="radio"
            variant="default"
            label="Default radio"
            name="variant-radio"
            value="default"
            checked={true}
          />
          <Control
            type="radio"
            variant="primary"
            label="Primary radio"
            name="variant-radio"
            value="primary"
          />
          <Control
            type="radio"
            variant="error"
            label="Error radio"
            name="variant-radio"
            value="error"
          />
          <Control
            type="radio"
            variant="disabled"
            label="Disabled radio"
            name="variant-radio"
            value="disabled"
            disabled
          />
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Variants - Toggle</h3>
        <div className="flex flex-col gap-4">
          <Control type="toggle" variant="default" label="Default toggle" checked={true} />
          <Control type="toggle" variant="primary" label="Primary toggle" checked={true} />
          <Control type="toggle" variant="error" label="Error toggle" checked={true} />
          <Control
            type="toggle"
            variant="disabled"
            label="Disabled toggle"
            checked={true}
            disabled
          />
        </div>
      </div>
    </div>
  ),
};

// Interactive Examples
export const InteractiveCheckbox: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    const [indeterminate, setIndeterminate] = useState(false);

    return (
      <div className="flex flex-col gap-4">
        <Control
          type="checkbox"
          label="Interactive checkbox"
          description="Click to toggle the state"
          checked={checked}
          indeterminate={indeterminate}
          onChange={e => {
            setChecked(e.target.checked);
            setIndeterminate(false);
          }}
        />
        <div className="flex gap-2">
          <button
            onClick={() => setIndeterminate(!indeterminate)}
            className="rounded bg-blue-500 px-3 py-1 text-sm text-white dark:text-black"
          >
            Toggle Indeterminate
          </button>
          <button
            onClick={() => {
              setChecked(false);
              setIndeterminate(false);
            }}
            className="rounded bg-gray-500 px-3 py-1 text-sm text-white dark:text-black"
          >
            Reset
          </button>
        </div>
      </div>
    );
  },
};

export const InteractiveRadioGroup: Story = {
  render: () => {
    const [value, setValue] = useState('option1');

    const options = [
      { value: 'option1', label: 'Control 1', description: 'This is the first option' },
      { value: 'option2', label: 'Control 2', description: 'This is the second option' },
      { value: 'option3', label: 'Control 3', description: 'This is the third option' },
    ];

    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Interactive Radio Group</h3>
        {options.map(option => (
          <Control
            key={option.value}
            type="radio"
            name="interactive-group"
            value={option.value}
            label={option.label}
            description={option.description}
            checked={value === option.value}
            onChange={e => setValue(e.target.value)}
          />
        ))}
        <p className="text-sm text-gray-500">Selected: {value}</p>
      </div>
    );
  },
};

export const InteractiveToggle: Story = {
  render: () => {
    const [enabled, setEnabled] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Interactive Toggles</h3>

        <Control
          type="toggle"
          label="Enable feature"
          description="Turn this feature on or off"
          checked={enabled}
          onToggle={setEnabled}
        />

        <Control
          type="toggle"
          label="Notifications"
          description="Receive push notifications"
          checked={notifications}
          onToggle={setNotifications}
        />

        <Control
          type="toggle"
          label="Dark mode"
          description="Switch to dark theme"
          checked={darkMode}
          onToggle={setDarkMode}
        />

        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <h4 className="mb-2 font-medium">Current Settings:</h4>
          <pre className="text-sm">
            {JSON.stringify(
              {
                enabled,
                notifications,
                darkMode,
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>
    );
  },
};

// Comparison with individual components
export const ComponentComparison: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Unified Control Component</h3>
        <div className="flex flex-col gap-4">
          <Control
            type="checkbox"
            label="Unified Checkbox"
            description="Using Control component"
            checked={true}
          />
          <Control
            type="radio"
            label="Unified Radio"
            description="Using Control component"
            name="unified"
            value="radio"
            checked={true}
          />
          <Control
            type="toggle"
            label="Unified Toggle"
            description="Using Control component"
            checked={true}
          />
        </div>
      </div>

      <div className="border-t pt-8">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          The unified Control component provides consistent styling and behavior across all input
          types, with shared TitleDescription layout and unified prop interface.
        </p>
      </div>
    </div>
  ),
};

// Playground
export const Playground: Story = {
  args: {
    type: 'checkbox',
    label: 'Playground option',
    description: 'Customize this option to test different configurations',
    checked: false,
    disabled: false,
    variant: 'default',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to experiment with different Control configurations.',
      },
    },
  },
};
