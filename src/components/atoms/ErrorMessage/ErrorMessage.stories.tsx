import type { Meta, StoryObj } from '@storybook/react';
import { ErrorMessage } from './ErrorMessage';

const meta = {
  title: 'Atoms/ErrorMessage',
  component: ErrorMessage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'An accessible error message component for form fields. Features role="alert" and aria-live="polite" for screen reader compatibility.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    id: {
      control: { type: 'text' },
      description: 'Unique identifier for the error message, typically linked to a form field',
    },
    error: {
      control: { type: 'text' },
      description: 'Error text to display. Component returns null if empty',
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes to apply',
    },
  },
} satisfies Meta<typeof ErrorMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'error-example',
    error: 'This field is required',
  },
};

export const LongError: Story = {
  args: {
    id: 'error-long',
    error:
      'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  },
};

export const NoError: Story = {
  args: {
    id: 'error-none',
    error: '',
  },
  parameters: {
    docs: {
      description: {
        story: 'When no error is provided, the component returns null and renders nothing.',
      },
    },
  },
};

export const CustomStyling: Story = {
  args: {
    id: 'error-custom',
    error: 'Custom styled error message',
    className: 'text-orange-600 font-semibold border-l-2 border-orange-600 pl-2',
  },
};

export const FormFieldExample: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-2">
      <label htmlFor="email-field" className="block text-sm font-medium text-gray-700">
        Email Address
      </label>
      <input
        id="email-field"
        type="email"
        className="w-full rounded-md border border-red-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
        placeholder="Enter your email"
        aria-describedby="email-error"
        aria-invalid="true"
      />
      <ErrorMessage id="email-error" error="Please enter a valid email address" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Example of ErrorMessage used with a form field. Note the aria-describedby attribute linking the input to the error message.',
      },
    },
  },
};

export const MultipleErrors: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-4">
      <div className="space-y-2">
        <label htmlFor="password-field" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password-field"
          type="password"
          className="w-full rounded-md border border-red-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-describedby="password-error-1 password-error-2"
          aria-invalid="true"
        />
        <ErrorMessage id="password-error-1" error="Password must be at least 8 characters long" />
        <ErrorMessage
          id="password-error-2"
          error="Password must contain at least one special character"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Multiple error messages for a single field. Each error has a unique ID and both are referenced in aria-describedby.',
      },
    },
  },
};

export const DifferentSeverities: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-4">
      <div>
        <ErrorMessage
          id="error-critical"
          error="Critical: This action cannot be undone"
          className="rounded border border-red-200 bg-red-50 px-3 py-2 font-semibold text-red-700"
        />
      </div>

      <div>
        <ErrorMessage
          id="error-warning"
          error="Warning: This field is recommended but not required"
          className="rounded border border-orange-200 bg-orange-50 px-3 py-2 text-orange-600"
        />
      </div>

      <div>
        <ErrorMessage
          id="error-info"
          error="Info: Additional verification may be required"
          className="rounded border border-blue-200 bg-blue-50 px-3 py-2 text-gray-600"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Different visual treatments for various error severities using custom className prop.',
      },
    },
  },
};

export const InlineError: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <input
        type="text"
        className="rounded-md border border-red-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
        placeholder="Username"
        aria-describedby="username-error"
        aria-invalid="true"
      />
      <ErrorMessage
        id="username-error"
        error="Username is taken"
        className="text-sm text-red-600"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Inline error message displayed next to the input field.',
      },
    },
  },
};

export const DarkMode: Story = {
  render: () => (
    <div className="dark rounded-lg bg-gray-900 p-6">
      <div className="w-full max-w-md space-y-2">
        <label htmlFor="dark-field" className="block text-sm font-medium text-gray-300">
          Field with Dark Mode Error
        </label>
        <input
          id="dark-field"
          type="text"
          className="w-full rounded-md border border-red-500 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-describedby="dark-error"
          aria-invalid="true"
        />
        <ErrorMessage id="dark-error" error="This demonstrates error styling in dark mode" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'ErrorMessage component with dark mode styling using the built-in dark theme support.',
      },
    },
  },
};
