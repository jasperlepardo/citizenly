import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ErrorModal } from '@/components/molecules/ErrorModal';

const meta = {
  title: 'Molecules/ErrorModal',
  component: ErrorModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A modal dialog for displaying error messages with optional details. Features a red warning icon, clear messaging, and detailed error information.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: { type: 'boolean' },
      description: 'Whether the modal is visible',
    },
    title: {
      control: { type: 'text' },
      description: 'Error title/heading',
    },
    message: {
      control: { type: 'text' },
      description: 'Main error message',
    },
    details: {
      control: { type: 'object' },
      description: 'Array of detailed error information',
    },
    onClose: {
      action: 'closed',
      description: 'Callback when modal is closed',
    },
  },
} satisfies Meta<typeof ErrorModal>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    isOpen: true,
    title: 'Error',
    message: 'Something went wrong. Please try again.',
    onClose: () => {},
  },
};

export const WithDetails: Story = {
  args: {
    isOpen: true,
    title: 'Validation Failed',
    message: 'The form could not be submitted due to the following errors:',
    details: [
      'First name is required',
      'Email address is not valid',
      'Phone number must be in valid format',
    ],
    onClose: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Error modal with detailed error information in a bulleted list.',
      },
    },
  },
};

// Specific Error Scenarios
export const NetworkError: Story = {
  args: {
    isOpen: true,
    title: 'Connection Failed',
    message:
      'Unable to connect to the server. Please check your internet connection and try again.',
    details: [
      'Network request timed out',
      'Server may be temporarily unavailable',
      'Check your internet connection',
    ],
    onClose: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Error modal for network-related issues.',
      },
    },
  },
};

export const ValidationError: Story = {
  args: {
    isOpen: true,
    title: 'Form Validation Error',
    message: 'Please correct the following issues before submitting:',
    details: [
      'Password must be at least 8 characters long',
      'Password must contain at least one uppercase letter',
      'Password must contain at least one number',
      'Confirm password must match the password field',
    ],
    onClose: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Error modal for form validation issues.',
      },
    },
  },
};

export const PermissionError: Story = {
  args: {
    isOpen: true,
    title: 'Access Denied',
    message: 'You do not have permission to perform this action.',
    details: [
      'Your account does not have the required privileges',
      'Contact your administrator to request access',
      'You may need to log in with a different account',
    ],
    onClose: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Error modal for permission-related issues.',
      },
    },
  },
};

export const ServerError: Story = {
  args: {
    isOpen: true,
    title: 'Server Error',
    message: 'An internal server error occurred. Our team has been notified.',
    details: [
      'Error Code: 500',
      'Request ID: req_1234567890',
      'Timestamp: 2024-01-15 10:30:45 UTC',
      'Please try again in a few minutes',
    ],
    onClose: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Error modal for server-side errors with technical details.',
      },
    },
  },
};

// Long Content
export const LongMessage: Story = {
  args: {
    isOpen: true,
    title: 'Data Processing Error',
    message:
      'There was an error processing your data submission. This could be due to various factors including data format issues, server capacity limitations, or temporary system maintenance. Please review the detailed information below and try again.',
    details: [
      'File size exceeds the maximum limit of 10MB',
      'Invalid characters detected in the filename',
      'Data format must be in CSV or Excel format',
      'Missing required columns: Name, Email, Phone',
      'Duplicate entries found in rows 15, 23, and 47',
      'Some email addresses are not in valid format',
      'Phone numbers must include country code',
    ],
    onClose: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Error modal with extensive message and details to test scrolling behavior.',
      },
    },
  },
};

// Interactive Examples
export const Interactive: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="p-8">
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Show Error Modal
        </button>

        <ErrorModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Sample Error"
          message="This is an interactive error modal that you can open and close."
          details={[
            'Click the button to open the modal',
            'Click OK or the X button to close',
            'You can interact with this example',
          ]}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive example where you can open and close the modal.',
      },
    },
  },
};

export const MultipleErrors: Story = {
  render: () => {
    const [openModal, setOpenModal] = useState<string | null>(null);

    const errors = [
      {
        id: 'network',
        title: 'Network Error',
        message: 'Failed to connect to the server.',
        details: ['Check your internet connection', 'Server may be down'],
      },
      {
        id: 'validation',
        title: 'Validation Error',
        message: 'Form contains invalid data.',
        details: ['Email is required', 'Password too short'],
      },
      {
        id: 'permission',
        title: 'Permission Denied',
        message: 'You do not have access to this resource.',
        details: ['Insufficient privileges', 'Contact administrator'],
      },
    ];

    return (
      <div className="space-y-4 p-8">
        <h3 className="text-lg font-semibold">Different Error Types</h3>
        <div className="space-y-2">
          {errors.map(error => (
            <button
              key={error.id}
              onClick={() => setOpenModal(error.id)}
              className="mr-2 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Show {error.title}
            </button>
          ))}
        </div>

        {errors.map(error => (
          <ErrorModal
            key={error.id}
            isOpen={openModal === error.id}
            onClose={() => setOpenModal(null)}
            title={error.title}
            message={error.message}
            details={error.details}
          />
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple error modals demonstrating different error scenarios.',
      },
    },
  },
};

// Closed State
export const Closed: Story = {
  args: {
    isOpen: false,
    title: 'Error',
    message: 'This modal is closed and should not be visible.',
    onClose: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal in closed state (should render nothing).',
      },
    },
  },
};
