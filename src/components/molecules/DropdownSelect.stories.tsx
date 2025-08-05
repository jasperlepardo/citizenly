import type { Meta, StoryObj } from '@storybook/react';
import { DropdownSelect } from './DropdownSelect';

const meta: Meta<typeof DropdownSelect> = {
  title: 'Molecules/DropdownSelect',
  component: DropdownSelect,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A modern dropdown select component with search, keyboard navigation, and custom styling based on Figma design system.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'error', 'success', 'disabled', 'readonly'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    searchable: {
      control: 'boolean',
    },
    clearable: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DropdownSelect>;

const sampleOptions = [
  { value: 'option1', label: 'Option 1', description: 'First option description' },
  { value: 'option2', label: 'Option 2', description: 'Second option description' },
  { value: 'option3', label: 'Option 3' },
  {
    value: 'option4',
    label: 'Very Long Option Name That Might Overflow',
    description: 'This option has a very long name to test text overflow',
  },
  { value: 'option5', label: 'Disabled Option', disabled: true },
  { value: 'option6', label: 'Another Option' },
  { value: 'option7', label: 'Final Option', description: 'Last option in the list' },
];

export const Default: Story = {
  args: {
    placeholder: 'Select an option...',
    options: sampleOptions,
    label: 'Choose Option',
    helperText: 'Please select one of the available options',
  },
};

export const WithValue: Story = {
  args: {
    placeholder: 'Select an option...',
    options: sampleOptions,
    value: 'option2',
    label: 'Pre-selected Option',
  },
};

export const Searchable: Story = {
  args: {
    placeholder: 'Search and select...',
    options: sampleOptions,
    searchable: true,
    label: 'Searchable Dropdown',
    helperText: 'Type to search through options',
  },
};

export const Clearable: Story = {
  args: {
    placeholder: 'Select an option...',
    options: sampleOptions,
    value: 'option1',
    clearable: true,
    label: 'Clearable Selection',
    helperText: 'Click the X to clear selection',
  },
};

export const WithLeftIcon: Story = {
  args: {
    placeholder: 'Select location...',
    options: sampleOptions,
    label: 'With Icon',
    leftIcon: (
      <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z"
        />
      </svg>
    ),
  },
};

export const Loading: Story = {
  args: {
    placeholder: 'Loading...',
    options: [],
    loading: true,
    label: 'Loading State',
  },
};

export const Error: Story = {
  args: {
    placeholder: 'Select an option...',
    options: sampleOptions,
    variant: 'error',
    label: 'Error State',
    errorMessage: 'Please select a valid option',
  },
};

export const Success: Story = {
  args: {
    placeholder: 'Select an option...',
    options: sampleOptions,
    value: 'option1',
    variant: 'success',
    label: 'Success State',
    helperText: 'Great choice!',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Cannot select...',
    options: sampleOptions,
    disabled: true,
    label: 'Disabled State',
    helperText: 'This field is currently disabled',
  },
};

export const SmallSize: Story = {
  args: {
    placeholder: 'Small dropdown...',
    options: sampleOptions,
    size: 'sm',
    label: 'Small Size',
  },
};

export const LargeSize: Story = {
  args: {
    placeholder: 'Large dropdown...',
    options: sampleOptions,
    size: 'lg',
    label: 'Large Size',
  },
};

export const EmptyState: Story = {
  args: {
    placeholder: 'No options available',
    options: [],
    label: 'Empty State',
    helperText: 'No options to display',
  },
};

export const FullFeatures: Story = {
  args: {
    placeholder: 'Search and select...',
    options: sampleOptions,
    value: 'option3',
    searchable: true,
    clearable: true,
    label: 'Full Featured Dropdown',
    helperText:
      'Searchable, clearable dropdown with keyboard navigation (Tab, Arrow keys, Enter, Escape, Home, End)',
    leftIcon: (
      <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
    ),
  },
};

export const KeyboardNavigation: Story = {
  args: {
    placeholder: 'Try keyboard navigation...',
    options: [
      ...sampleOptions,
      { value: 'option8', label: 'Option 8' },
      { value: 'option9', label: 'Option 9' },
      { value: 'option10', label: 'Option 10' },
      { value: 'option11', label: 'Option 11' },
      { value: 'option12', label: 'Option 12' },
    ],
    label: 'Keyboard Navigation Demo',
    helperText: 'Use Arrow Up/Down, Tab, Enter, Space, Escape, Home, End keys',
  },
};
