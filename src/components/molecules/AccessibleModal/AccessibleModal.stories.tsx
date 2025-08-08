import type { Meta, StoryObj } from '@storybook/react';
import AccessibleModal from './AccessibleModal';
import { Button } from '@/components/atoms/Button';
import { useState } from 'react';

const meta = {
  title: 'Molecules/AccessibleModal',
  component: AccessibleModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Fully accessible modal with focus trap, keyboard navigation, and screen reader support. Follows WAI-ARIA modal patterns.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Modal size',
    },
    closeOnEscape: {
      control: 'boolean',
      description: 'Allow closing modal with Escape key',
    },
    closeOnBackdropClick: {
      control: 'boolean',
      description: 'Allow closing modal by clicking backdrop',
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Show X button in header',
    },
  },
} satisfies Meta<typeof AccessibleModal>;

export default meta;
type Story = StoryObj<typeof meta>;

// Template for interactive stories
interface ModalWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
  className?: string;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
}

function ModalWrapper(args: ModalWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-4">
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <AccessibleModal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}

export const Default: Story = {
  render: args => <ModalWrapper {...args} />,
  args: {
    title: 'Confirm Action',
    description: 'Are you sure you want to perform this action?',
    children: (
      <div className="space-y-4">
        <p>This action cannot be undone. Please confirm that you want to proceed.</p>
        <p className="text-sm text-gray-600">
          This modal demonstrates proper accessibility features including:
        </p>
        <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
          <li>Focus trap management</li>
          <li>Keyboard navigation (Escape to close)</li>
          <li>Screen reader announcements</li>
          <li>Proper ARIA attributes</li>
        </ul>
      </div>
    ),
    footer: (
      <>
        <Button variant="secondary-outline">Cancel</Button>
        <Button variant="danger">Delete</Button>
      </>
    ),
  },
};

export const Small: Story = {
  render: args => <ModalWrapper {...args} />,
  args: {
    title: 'Small Modal',
    size: 'sm',
    children: <p>This is a small modal with minimal content.</p>,
  },
};

export const Large: Story = {
  render: args => <ModalWrapper {...args} />,
  args: {
    title: 'Large Modal',
    size: 'lg',
    description: 'This modal contains more detailed content and forms',
    children: (
      <div className="space-y-6">
        <div>
          <h3 className="mb-2 text-lg font-medium">User Information</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <input
                type="text"
                className="w-full rounded-md border px-3 py-2"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                className="w-full rounded-md border px-3 py-2"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Message</label>
              <textarea
                className="h-24 w-full rounded-md border px-3 py-2"
                placeholder="Enter your message"
              />
            </div>
          </div>
        </div>
      </div>
    ),
    footer: (
      <>
        <Button variant="secondary-outline">Cancel</Button>
        <Button variant="primary">Save</Button>
      </>
    ),
  },
};

export const NoCloseButton: Story = {
  render: args => <ModalWrapper {...args} />,
  args: {
    title: 'Modal Without Close Button',
    description: 'This modal can only be closed using the footer buttons or Escape key',
    showCloseButton: false,
    children: <p>You must use the buttons below to close this modal.</p>,
    footer: (
      <>
        <Button variant="secondary-outline">Cancel</Button>
        <Button variant="primary">Confirm</Button>
      </>
    ),
  },
};

export const LongContent: Story = {
  render: args => <ModalWrapper {...args} />,
  args: {
    title: 'Modal with Scrollable Content',
    size: 'lg',
    children: (
      <div className="space-y-4">
        {Array.from({ length: 20 }, (_, i) => (
          <p key={i}>
            This is paragraph {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
            do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris.
          </p>
        ))}
      </div>
    ),
    footer: <Button variant="primary">Close</Button>,
  },
};

export const Form: Story = {
  render: args => <ModalWrapper {...args} />,
  args: {
    title: 'User Registration Form',
    size: 'lg',
    description: 'Fill out the form below to create your account',
    children: (
      <form className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="mb-1 block text-sm font-medium">
              First Name *
            </label>
            <input
              id="firstName"
              type="text"
              required
              className="w-full rounded-md border px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="mb-1 block text-sm font-medium">
              Last Name *
            </label>
            <input
              id="lastName"
              type="text"
              required
              className="w-full rounded-md border px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            required
            className="w-full rounded-md border px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            className="w-full rounded-md border px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">I agree to the terms and conditions</span>
          </label>
        </div>
      </form>
    ),
    footer: (
      <>
        <Button variant="secondary-outline">Cancel</Button>
        <Button variant="primary" type="submit">
          Create Account
        </Button>
      </>
    ),
  },
};
