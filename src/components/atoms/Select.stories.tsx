import type { Meta, StoryObj } from '@storybook/react';
import Select from './Select';

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'JSPR Design System Select Component - A styled select dropdown component with various states and options.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'error', 'disabled'],
      description: 'Visual variant of the select',
    },
    size: {
      control: 'select',
      options: ['default'],
      description: 'Size of the select',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when no option is selected',
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading state with spinner',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the select input',
    },
    errorMessage: {
      control: 'text',
      description: 'Error message to display below select',
    },
    helperText: {
      control: 'text',
      description: 'Helper text to display below select',
    },
  },
  args: {
    placeholder: 'Select an option...',
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
      { value: 'option4', label: 'Option 4 (Disabled)', disabled: true },
    ],
    value: '',
    onChange: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: {},
};

export const WithValue: Story = {
  args: {
    value: 'option1',
  },
};

export const Error: Story = {
  args: {
    errorMessage: 'Please select a valid option',
    variant: 'error',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'This select is disabled',
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    placeholder: 'Loading options...',
  },
};

export const WithHelperText: Story = {
  args: {
    helperText: 'Choose one of the available options from the dropdown',
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Default State</h3>
        <Select
          options={[
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
          ]}
          value=""
          onChange={() => {}}
          placeholder="Select an option..."
        />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">With Selection</h3>
        <Select
          options={[
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
          ]}
          value="option1"
          onChange={() => {}}
          placeholder="Select an option..."
        />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Error State</h3>
        <Select
          options={[
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
          ]}
          value=""
          onChange={() => {}}
          placeholder="Select an option..."
          errorMessage="This field is required"
        />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Disabled State</h3>
        <Select
          options={[
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
          ]}
          value=""
          onChange={() => {}}
          placeholder="This select is disabled"
          disabled={true}
        />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Loading State</h3>
        <Select options={[]} value="" onChange={() => {}} placeholder="Loading..." loading={true} />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">With Helper Text</h3>
        <Select
          options={[
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
          ]}
          value=""
          onChange={() => {}}
          placeholder="Select an option..."
          helperText="Choose the option that best describes your situation"
        />
      </div>
    </div>
  ),
};
