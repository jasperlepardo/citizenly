import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SuccessModal } from '@/components/molecules/SuccessModal';

const meta = {
  title: 'Molecules/SuccessModal',
  component: SuccessModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A modal dialog for displaying success messages. Features a green checkmark icon, clear messaging, and positive feedback for completed actions.',
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
      description: 'Success title/heading',
    },
    message: {
      control: { type: 'text' },
      description: 'Success message content',
    },
    onClose: {
      action: 'closed',
      description: 'Callback when modal is closed',
    },
  },
} satisfies Meta<typeof SuccessModal>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    isOpen: true,
    title: 'Success',
    message: 'Your action has been completed successfully.',
    onClose: () => {},
  },
};

export const FormSubmitted: Story = {
  args: {
    isOpen: true,
    title: 'Form Submitted',
    message: 'Your form has been submitted successfully. You will receive a confirmation email shortly.',
    onClose: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Success modal for form submission confirmation.',
      },
    },
  },
};

// Specific Success Scenarios
export const DataSaved: Story = {
  args: {
    isOpen: true,
    title: 'Data Saved',
    message: 'Your changes have been saved successfully.',
    onClose: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Success modal for data saving operations.',
      },
    },
  },
};

export const AccountCreated: Story = {
  args: {
    isOpen: true,
    title: 'Account Created',
    message: 'Your account has been created successfully! Welcome to our platform.',
    onClose: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Success modal for account creation.',
      },
    },
  },
};

export const FileUploaded: Story = {
  args: {
    isOpen: true,
    title: 'File Uploaded',
    message: 'Your file has been uploaded and is being processed. You will be notified when it\'s ready.',
    onClose: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Success modal for file upload completion.',
      },
    },
  },
};

export const EmailSent: Story = {
  args: {
    isOpen: true,
    title: 'Email Sent',
    message: 'Your message has been sent successfully. We will get back to you within 24 hours.',
    onClose: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Success modal for email/message sending.',
      },
    },
  },
};

export const PaymentCompleted: Story = {
  args: {
    isOpen: true,
    title: 'Payment Successful',
    message: 'Your payment has been processed successfully. A receipt has been sent to your email address.',
    onClose: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Success modal for payment completion.',
      },
    },
  },
};

export const ProfileUpdated: Story = {
  args: {
    isOpen: true,
    title: 'Profile Updated',
    message: 'Your profile information has been updated successfully.',
    onClose: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Success modal for profile updates.',
      },
    },
  },
};

// Long Message
export const LongMessage: Story = {
  args: {
    isOpen: true,
    title: 'Registration Complete',
    message: 'Congratulations! Your registration has been completed successfully. You now have access to all premium features including advanced analytics, priority support, and exclusive content. Please check your email for important account setup information and next steps to get the most out of your new account.',
    onClose: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Success modal with longer message content.',
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
          className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Show Success Modal
        </button>
        
        <SuccessModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Success!"
          message="This is an interactive success modal that you can open and close."
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

export const MultipleSuccessTypes: Story = {
  render: () => {
    const [openModal, setOpenModal] = useState<string | null>(null);

    const successTypes = [
      {
        id: 'save',
        title: 'Saved',
        message: 'Your data has been saved successfully.',
      },
      {
        id: 'send',
        title: 'Sent',
        message: 'Your message has been sent successfully.',
      },
      {
        id: 'complete',
        title: 'Complete',
        message: 'The process has been completed successfully.',
      },
      {
        id: 'upload',
        title: 'Uploaded',
        message: 'Your file has been uploaded successfully.',
      },
    ];

    return (
      <div className="space-y-4 p-8">
        <h3 className="text-lg font-semibold">Different Success Types</h3>
        <div className="space-y-2">
          {successTypes.map((success) => (
            <button
              key={success.id}
              onClick={() => setOpenModal(success.id)}
              className="mr-2 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Show {success.title}
            </button>
          ))}
        </div>

        {successTypes.map((success) => (
          <SuccessModal
            key={success.id}
            isOpen={openModal === success.id}
            onClose={() => setOpenModal(null)}
            title={success.title}
            message={success.message}
          />
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple success modals demonstrating different success scenarios.',
      },
    },
  },
};

// Auto-close Example
export const AutoClose: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    const showAutoCloseModal = () => {
      setIsOpen(true);
      // Auto-close after 3 seconds
      setTimeout(() => {
        setIsOpen(false);
      }, 3000);
    };

    return (
      <div className="p-8">
        <button
          onClick={showAutoCloseModal}
          className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Show Auto-Close Modal (3s)
        </button>
        
        <SuccessModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Auto-Close Demo"
          message="This modal will automatically close in 3 seconds, or you can close it manually."
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Success modal that automatically closes after 3 seconds.',
      },
    },
  },
};

// Closed State
export const Closed: Story = {
  args: {
    isOpen: false,
    title: 'Success',
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