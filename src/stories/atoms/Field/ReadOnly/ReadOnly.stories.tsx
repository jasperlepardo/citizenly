import type { Meta, StoryObj } from '@storybook/react';
import { ReadOnly } from '@/components/atoms/ReadOnly';

const meta: Meta<typeof ReadOnly> = {
  title: 'Atoms/Field/ReadOnly',
  component: ReadOnly,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'The read-only value to display',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    leftIcon: {
      control: false,
      description: 'Icon to show on the left side',
    },
    rightIcon: {
      control: false,
      description: 'Icon to show on the right side',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 'Read-only text value',
  },
};

export const WithValue: Story = {
  args: {
    value: 'Juan Dela Cruz',
  },
};

export const Empty: Story = {
  args: {
    value: '',
  },
};

export const WithLeftIcon: Story = {
  args: {
    value: 'With left icon',
    leftIcon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
};

export const WithRightIcon: Story = {
  args: {
    value: 'With right icon',
    rightIcon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
};

export const WithBothIcons: Story = {
  args: {
    value: 'With both icons',
    leftIcon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
    rightIcon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
};

export const LongText: Story = {
  args: {
    value:
      'This is a very long read-only text that might overflow and should be handled gracefully with text ellipsis',
    className: 'w-64',
  },
};
