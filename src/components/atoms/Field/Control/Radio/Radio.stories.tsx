import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Radio, RadioGroup } from './Radio';

const meta = {
  title: 'Atoms/Field/Control/Radio',
  component: Radio,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A customizable radio button component with support for labels, descriptions, and error states. Can be used individually or within a RadioGroup.',
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
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Default radio',
    value: 'default',
    name: 'example',
  },
};

export const Checked: Story = {
  args: {
    label: 'Checked radio',
    value: 'checked',
    name: 'example',
    checked: true,
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Radio with description',
    description: 'This is a helpful description that explains the radio option.',
    value: 'with-description',
    name: 'example',
  },
};

export const Primary: Story = {
  args: {
    label: 'Primary radio',
    variant: 'primary',
    value: 'primary',
    name: 'example',
    checked: true,
  },
};

export const Error: Story = {
  args: {
    label: 'Radio with error',
    errorMessage: 'This field is required',
    value: 'error',
    name: 'example',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled radio',
    disabled: true,
    value: 'disabled',
    name: 'example',
  },
};

export const DisabledChecked: Story = {
  args: {
    label: 'Disabled checked radio',
    disabled: true,
    checked: true,
    value: 'disabled-checked',
    name: 'example',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Radio size="sm" label="Small radio" value="small" name="sizes" />
      <Radio size="md" label="Medium radio" value="medium" name="sizes" />
      <Radio size="lg" label="Large radio" value="large" name="sizes" />
    </div>
  ),
};

const RadioGroupExampleComponent = () => {
  const [value, setValue] = useState('option1');

  return (
    <RadioGroup name="example-group" value={value} onChange={setValue} orientation="vertical">
      <Radio value="option1" label="Option 1" description="This is the first option" />
      <Radio value="option2" label="Option 2" description="This is the second option" />
      <Radio value="option3" label="Option 3" description="This is the third option" />
    </RadioGroup>
  );
};

export const RadioGroupExample: Story = {
  args: {
    label: 'Radio group example',
    value: 'option1',
    name: 'example-group',
  },
  render: () => <RadioGroupExampleComponent />,
};

const RadioGroupHorizontalComponent = () => {
  const [value, setValue] = useState('small');

  return (
    <RadioGroup name="size-group" value={value} onChange={setValue} orientation="horizontal">
      <Radio value="small" label="Small" />
      <Radio value="medium" label="Medium" />
      <Radio value="large" label="Large" />
    </RadioGroup>
  );
};

export const RadioGroupHorizontal: Story = {
  args: {
    label: 'Horizontal radio group',
    value: 'small',
    name: 'size-group',
  },
  render: () => <RadioGroupHorizontalComponent />,
};

const RadioGroupWithErrorComponent = () => {
  const [value, setValue] = useState('');

  return (
    <RadioGroup
      name="error-group"
      value={value}
      onChange={setValue}
      errorMessage="Please select an option"
    >
      <Radio value="yes" label="Yes" />
      <Radio value="no" label="No" />
      <Radio value="maybe" label="Maybe" />
    </RadioGroup>
  );
};

export const RadioGroupWithError: Story = {
  args: {
    label: 'Radio group with error',
    value: '',
    name: 'error-group',
  },
  render: () => <RadioGroupWithErrorComponent />,
};

const InteractiveRadioComponent = () => {
  const [selectedValue, setSelectedValue] = useState('');
  const [variant, setVariant] = useState<'default' | 'primary' | 'error'>('default');

  const options = [
    { value: 'apple', label: 'Apple', description: 'A sweet red fruit' },
    { value: 'banana', label: 'Banana', description: 'A yellow curved fruit' },
    { value: 'cherry', label: 'Cherry', description: 'A small red stone fruit' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setVariant('default')}
          className={`rounded-sm px-3 py-1 text-sm ${variant === 'default' ? 'bg-blue-500 text-white dark:text-black' : 'bg-gray-200'}`}
        >
          Default
        </button>
        <button
          onClick={() => setVariant('primary')}
          className={`rounded-sm px-3 py-1 text-sm ${variant === 'primary' ? 'bg-blue-500 text-white dark:text-black' : 'bg-gray-200'}`}
        >
          Primary
        </button>
        <button
          onClick={() => setVariant('error')}
          className={`rounded-sm px-3 py-1 text-sm ${variant === 'error' ? 'bg-blue-500 text-white dark:text-black' : 'bg-gray-200'}`}
        >
          Error
        </button>
      </div>

      <RadioGroup name="interactive-group" value={selectedValue} onChange={setSelectedValue}>
        {options.map(option => (
          <Radio
            key={option.value}
            value={option.value}
            label={option.label}
            description={option.description}
            variant={variant}
          />
        ))}
      </RadioGroup>

      {selectedValue && (
        <p className="mt-4 rounded-sm bg-gray-100 p-3">
          Selected: {options.find(opt => opt.value === selectedValue)?.label}
        </p>
      )}
    </div>
  );
};

export const Interactive: Story = {
  args: {
    label: 'Interactive radio demo',
    value: '',
    name: 'interactive-group',
  },
  render: () => <InteractiveRadioComponent />,
};
