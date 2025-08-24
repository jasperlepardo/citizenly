import type { Meta, StoryObj } from '@storybook/react';
import { Option } from '@/components/atoms/Option';

const meta: Meta<typeof Option> = {
  title: 'Atoms/Field/Select/Option',
  component: Option,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Option component for dropdown lists and select interfaces.

## Features
- **State Management**: Supports selected, focused, and disabled states
- **Rich Content**: Label with optional description text
- **Accessibility**: Full ARIA support and keyboard navigation
- **Visual Feedback**: Hover states and focus management
- **Dark Mode**: Complete dark theme support

## Usage
\`\`\`tsx
import { Option } from '@/components/atoms';

<Option
  label="Option Label"
  description="Optional description"
  selected={false}
  focused={false}
  onClick={() => handleSelect()}
/>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    selected: {
      control: 'boolean',
      description: 'Whether this option is currently selected',
    },
    focused: {
      control: 'boolean',
      description: 'Whether this option is currently focused/highlighted',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether this option is disabled',
    },
    label: {
      control: 'text',
      description: 'Main option label',
    },
    description: {
      control: 'text',
      description: 'Optional description text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Option>;

// Basic Examples
export const Default: Story = {
  args: {
    label: 'Default Option',
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Option with Description',
    description: 'This is a helpful description for the option',
  },
};

export const Selected: Story = {
  args: {
    label: 'Selected Option',
    description: 'This option is currently selected',
    selected: true,
  },
};

export const Focused: Story = {
  args: {
    label: 'Focused Option',
    description: 'This option is currently focused',
    focused: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Option',
    description: 'This option is disabled and cannot be selected',
    disabled: true,
  },
};

// State Combinations
export const SelectedAndFocused: Story = {
  args: {
    label: 'Selected & Focused Option',
    description: 'This option is both selected and focused',
    selected: true,
    focused: true,
  },
};

export const LongContent: Story = {
  args: {
    label: 'This is a very long option label that might wrap or be truncated depending on the container width',
    description: 'This is also a very long description that demonstrates how the option component handles longer text content and maintains proper spacing and alignment.',
  },
};

// Interactive Dropdown Example
export const DropdownExample: Story = {
  render: () => {
    const options = [
      { label: 'JavaScript', description: 'Dynamic programming language', value: 'js' },
      { label: 'TypeScript', description: 'Typed superset of JavaScript', value: 'ts' },
      { label: 'Python', description: 'Versatile programming language', value: 'py' },
      { label: 'Java', description: 'Object-oriented programming language', value: 'java', disabled: true },
      { label: 'C++', description: 'Systems programming language', value: 'cpp' },
    ];

    return (
      <div className="w-80">
        <h3 className="text-lg font-semibold mb-2">Programming Languages</h3>
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div role="listbox" className="py-1">
            {options.map((option, index) => (
              <Option
                key={option.value}
                label={option.label}
                description={option.description}
                selected={index === 1} // TypeScript selected
                focused={index === 2}  // Python focused
                disabled={option.disabled}
                onClick={() => console.log('Selected:', option.value)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Example showing how Option components work together in a dropdown list.',
      },
    },
  },
};

// Custom Content Example
export const CustomContent: Story = {
  render: () => (
    <div className="w-80">
      <h3 className="text-lg font-semibold mb-2">Custom Option Content</h3>
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
        <div role="listbox" className="py-1">
          <Option
            label="Custom Option"
            onClick={() => console.log('Custom clicked')}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">JS</span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">JavaScript</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Most popular web programming language
                </div>
              </div>
              <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                Popular
              </div>
            </div>
          </Option>
          
          <Option
            label="TypeScript"
            description="Adds static typing to JavaScript"
            selected={true}
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example showing custom content rendering with the children prop.',
      },
    },
  },
};

// Playground
export const Playground: Story = {
  args: {
    label: 'Playground Option',
    description: 'Customize this option to test different configurations',
    selected: false,
    focused: false,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to experiment with different Option configurations.',
      },
    },
  },
};