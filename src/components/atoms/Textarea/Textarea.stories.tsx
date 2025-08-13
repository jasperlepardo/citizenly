import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Textarea } from './Textarea';

const meta = {
  title: 'Atoms/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A customizable textarea component with support for labels, helper text, error states, character counting, and resizing options.',
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
      options: ['default', 'error', 'success', 'disabled', 'readonly'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
    readOnly: {
      control: { type: 'boolean' },
    },
    resizable: {
      control: { type: 'boolean' },
    },
    showCharCount: {
      control: { type: 'boolean' },
    },
    label: {
      control: { type: 'text' },
    },
    helperText: {
      control: { type: 'text' },
    },
    errorMessage: {
      control: { type: 'text' },
    },
    placeholder: {
      control: { type: 'text' },
    },
    maxLength: {
      control: { type: 'number' },
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter your text here...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Description',
    placeholder: 'Enter a description...',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Comments',
    placeholder: 'Share your thoughts...',
    helperText: 'Please provide detailed feedback to help us improve.',
  },
};

export const WithError: Story = {
  args: {
    label: 'Message',
    placeholder: 'Enter your message...',
    errorMessage: 'This field is required and cannot be empty.',
    value: '',
  },
};

export const Success: Story = {
  args: {
    label: 'Review',
    variant: 'success',
    value: 'Great product! I would definitely recommend it to others.',
    helperText: 'Thank you for your feedback!',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled textarea',
    disabled: true,
    value: 'This textarea is disabled and cannot be edited.',
    helperText: 'This field is currently unavailable.',
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Terms and Conditions',
    readOnly: true,
    value:
      'These are the terms and conditions that you have agreed to. This content is read-only and cannot be modified.',
    helperText: 'Please review the terms above.',
  },
};

export const WithCharacterCount: Story = {
  args: {
    label: 'Tweet',
    placeholder: 'What&rsquo;s happening?',
    maxLength: 280,
    showCharCount: true,
    helperText: 'Share what&rsquo;s on your mind!',
  },
};

export const Resizable: Story = {
  args: {
    label: 'Resizable textarea',
    placeholder: 'This textarea can be resized vertically...',
    resizable: true,
    helperText: 'You can drag the bottom-right corner to resize.',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Textarea size="sm" label="Small textarea" placeholder="Small size textarea..." />
      <Textarea size="md" label="Medium textarea" placeholder="Medium size textarea..." />
      <Textarea size="lg" label="Large textarea" placeholder="Large size textarea..." />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Textarea variant="default" label="Default" value="Default textarea variant" />
      <Textarea
        variant="error"
        label="Error"
        value="Error textarea variant"
        errorMessage="Something went wrong"
      />
      <Textarea
        variant="success"
        label="Success"
        value="Success textarea variant"
        helperText="Everything looks good!"
      />
      <Textarea variant="disabled" label="Disabled" value="Disabled textarea variant" disabled />
      <Textarea variant="readonly" label="Read-only" value="Read-only textarea variant" readOnly />
    </div>
  ),
};

const InteractiveTextareaComponent = () => {
  const [value, setValue] = useState('');
  const [showError, setShowError] = useState(false);

  const maxLength = 200;
  const isNearLimit = value.length > maxLength * 0.8;
  const isOverLimit = value.length > maxLength;

  return (
    <div className="w-full max-w-md">
      <Textarea
        label="Interactive Textarea"
        value={value}
        onChange={e => {
          setValue(e.target.value);
          setShowError(e.target.value.length === 0);
        }}
        placeholder="Start typing to see character count..."
        maxLength={maxLength}
        showCharCount={true}
        errorMessage={showError ? 'This field cannot be empty' : undefined}
        helperText={
          isOverLimit
            ? `You&rsquo;ve exceeded the limit by ${value.length - maxLength} characters`
            : isNearLimit
              ? 'You&rsquo;re approaching the character limit'
              : 'Share your thoughts with us'
        }
        resizable
      />

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setValue('')}
          className="rounded bg-gray-500 px-3 py-1 text-sm text-white"
        >
          Clear
        </button>
        <button
          onClick={() =>
            setValue('This is a sample text to demonstrate the textarea functionality.')
          }
          className="rounded bg-blue-500 px-3 py-1 text-sm text-white"
        >
          Fill Sample
        </button>
      </div>
    </div>
  );
};

export const Interactive: Story = {
  args: {
    placeholder: 'Interactive demo',
  },
  render: () => <InteractiveTextareaComponent />,
};
