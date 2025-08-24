import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '@/components/atoms/Badge';

const meta: Meta<typeof Badge> = {
  title: 'Atoms/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile badge component for displaying status, counts, labels, and other short pieces of information.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'danger', 'info', 'secondary'],
      description: 'The visual style variant of the badge',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size of the badge',
    },
    shape: {
      control: 'select',
      options: ['rounded', 'pill'],
      description: 'The shape of the badge',
    },
    outlined: {
      control: 'boolean',
      description: 'Whether the badge should have a border instead of filled background',
    },
    iconPosition: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Position of the icon relative to the text',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: 'Default Badge',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="secondary">Secondary</Badge>
    </div>
  ),
};

export const Outlined: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default" outlined>Default</Badge>
      <Badge variant="success" outlined>Success</Badge>
      <Badge variant="warning" outlined>Warning</Badge>
      <Badge variant="error" outlined>Error</Badge>
      <Badge variant="info" outlined>Info</Badge>
      <Badge variant="secondary" outlined>Secondary</Badge>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
};

export const Shapes: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge shape="rounded">Rounded</Badge>
      <Badge shape="pill">Pill Shape</Badge>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Badge 
          variant="success" 
          icon={
            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          }
        >
          Verified
        </Badge>
        <Badge 
          variant="warning" 
          icon={
            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          }
        >
          Pending
        </Badge>
        <Badge 
          variant="error" 
          icon={
            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          }
        >
          Rejected
        </Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge 
          variant="info" 
          iconPosition="right"
          icon={
            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          }
        >
          Info
        </Badge>
        <Badge 
          variant="secondary" 
          iconPosition="right"
          icon={
            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          }
        >
          Download
        </Badge>
      </div>
    </div>
  ),
};

export const StatusBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="success" shape="pill">Active</Badge>
      <Badge variant="warning" shape="pill">Pending</Badge>
      <Badge variant="error" shape="pill">Inactive</Badge>
      <Badge variant="info" shape="pill">Draft</Badge>
    </div>
  ),
};

export const CountBadges: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="relative">
        <span>Notifications</span>
        <Badge variant="error" size="sm" shape="pill" className="ml-2">3</Badge>
      </div>
      <div className="relative">
        <span>Messages</span>
        <Badge variant="info" size="sm" shape="pill" className="ml-2">12</Badge>
      </div>
      <div className="relative">
        <span>Tasks</span>
        <Badge variant="warning" size="sm" shape="pill" className="ml-2">5</Badge>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  args: {
    children: 'Clickable Badge',
    variant: 'info',
    className: 'cursor-pointer hover:opacity-80 transition-opacity',
  },
};