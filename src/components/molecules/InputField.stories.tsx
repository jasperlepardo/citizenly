import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { InputField } from './InputField';

const meta: Meta<typeof InputField> = {
  title: 'UI/InputField',
  component: InputField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A comprehensive input field component with labels, validation, icons, and various states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'filled', 'error', 'success', 'disabled', 'readonly'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    label: {
      control: 'text',
    },
    placeholder: {
      control: 'text',
    },
    helperText: {
      control: 'text',
    },
    errorMessage: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    readOnly: {
      control: 'boolean',
    },
    clearable: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive wrapper for stories that need state
const InteractiveWrapper = ({
  children,
  ...props
}: {
  children: React.ReactNode;
  [key: string]: unknown;
}) => {
  const [value, setValue] = useState(props.value || '');
  return React.cloneElement(children, {
    ...props,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
    onClear: () => setValue(''),
  });
};

export const Default: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    helperText: 'We will never share your email',
  },
  render: args => (
    <InteractiveWrapper {...args}>
      <InputField />
    </InteractiveWrapper>
  ),
};

export const WithLeftIcon: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search...',
    leftIcon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
    ),
  },
  render: args => (
    <InteractiveWrapper {...args}>
      <InputField />
    </InteractiveWrapper>
  ),
};

export const WithRightIcon: Story = {
  args: {
    label: 'Email',
    placeholder: 'your.email@example.com',
    type: 'email',
    rightIcon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
      </svg>
    ),
  },
  render: args => (
    <InteractiveWrapper {...args}>
      <InputField />
    </InteractiveWrapper>
  ),
};

export const WithAddons: Story = {
  args: {
    label: 'Website URL',
    placeholder: 'mysite',
    leftAddon: 'https://',
    rightAddon: '.com',
    helperText: 'Enter your website domain',
  },
  render: args => (
    <InteractiveWrapper {...args}>
      <InputField />
    </InteractiveWrapper>
  ),
};

export const Clearable: Story = {
  args: {
    label: 'Search Query',
    placeholder: 'Type to search...',
    clearable: true,
    value: 'Sample text',
  },
  render: args => (
    <InteractiveWrapper {...args}>
      <InputField />
    </InteractiveWrapper>
  ),
};

export const ErrorState: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter valid email',
    value: 'invalid-email',
    errorMessage: 'Please enter a valid email address',
  },
  render: args => (
    <InteractiveWrapper {...args}>
      <InputField />
    </InteractiveWrapper>
  ),
};

export const SuccessState: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter username',
    value: 'john_doe',
    variant: 'success',
    helperText: 'Username is available!',
  },
  render: args => (
    <InteractiveWrapper {...args}>
      <InputField />
    </InteractiveWrapper>
  ),
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Field',
    placeholder: 'Cannot edit this',
    value: 'Disabled value',
    disabled: true,
    helperText: 'This field is disabled',
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Read Only Field',
    value: 'This is read only',
    readOnly: true,
    helperText: 'This field cannot be modified',
  },
};

// Sizes
export const Small: Story = {
  args: {
    label: 'Small Input',
    placeholder: 'Small size',
    size: 'sm',
  },
  render: args => (
    <InteractiveWrapper {...args}>
      <InputField />
    </InteractiveWrapper>
  ),
};

export const Medium: Story = {
  args: {
    label: 'Medium Input',
    placeholder: 'Medium size (default)',
    size: 'md',
  },
  render: args => (
    <InteractiveWrapper {...args}>
      <InputField />
    </InteractiveWrapper>
  ),
};

export const Large: Story = {
  args: {
    label: 'Large Input',
    placeholder: 'Large size',
    size: 'lg',
  },
  render: args => (
    <InteractiveWrapper {...args}>
      <InputField />
    </InteractiveWrapper>
  ),
};

// All States Showcase
export const AllStates: Story = {
  render: () => (
    <div className="space-y-6 w-96">
      <h3 className="text-lg font-semibold">Input Field States</h3>

      <InputField
        label="Default State"
        placeholder="Enter text..."
        helperText="This is a helper text"
      />

      <InputField
        label="Filled State"
        value="Some entered text"
        helperText="Text has been entered"
      />

      <InputField
        label="Error State"
        value="invalid input"
        errorMessage="This field has an error"
      />

      <InputField
        label="Success State"
        value="valid input"
        variant="success"
        helperText="Input is valid!"
      />

      <InputField
        label="Disabled State"
        value="Cannot edit"
        disabled
        helperText="This field is disabled"
      />

      <InputField
        label="Read Only State"
        value="Read only text"
        readOnly
        helperText="This field is read only"
      />
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const FormExample: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <h3 className="text-lg font-semibold">Contact Form Example</h3>

      <InputField
        label="Full Name"
        placeholder="John Doe"
        helperText="Enter your first and last name"
      />

      <InputField
        label="Email Address"
        type="email"
        placeholder="john@example.com"
        rightIcon={
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
        }
      />

      <InputField
        label="Phone Number"
        type="tel"
        placeholder="+1 (555) 000-0000"
        leftAddon="+1"
        helperText="Include country code"
      />

      <InputField
        label="Website"
        type="url"
        placeholder="mysite"
        leftAddon="https://"
        rightAddon=".com"
        helperText="Your personal or business website"
      />

      <InputField
        label="Search Tags"
        placeholder="Type and clear..."
        clearable
        helperText="Use the X button to clear"
      />
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};
