import type { Meta, StoryObj } from '@storybook/react';
import { HelperText } from './HelperText';

const meta = {
  title: 'Atoms/Field/HelperText',
  component: HelperText,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A component for displaying helper text or error messages below form fields. Provides consistent styling and accessibility features.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    error: {
      control: { type: 'boolean' },
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md'],
    },
  },
} satisfies Meta<typeof HelperText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'This is helpful information about the field above.',
  },
};

export const ErrorMessage: Story = {
  args: {
    children: 'This field is required and cannot be empty.',
    error: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <div>
        <h3 className="mb-2 font-semibold">Extra Small (xs)</h3>
        <HelperText size="xs">
          This is extra small helper text, typically used for subtle hints.
        </HelperText>
      </div>
      
      <div>
        <h3 className="mb-2 font-semibold">Small (sm)</h3>
        <HelperText size="sm">
          This is small helper text, good for secondary information.
        </HelperText>
      </div>
      
      <div>
        <h3 className="mb-2 font-semibold">Medium (md)</h3>
        <HelperText size="md">
          This is medium helper text, more prominent for important guidance.
        </HelperText>
      </div>
    </div>
  ),
};

export const VariantComparison: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <div>
        <h3 className="mb-2 font-semibold">Normal Helper Text</h3>
        <HelperText>
          Enter your full name as it appears on official documents.
        </HelperText>
      </div>
      
      <div>
        <h3 className="mb-2 font-semibold">Error Message</h3>
        <HelperText error>
          This field is required and must be at least 3 characters long.
        </HelperText>
      </div>
    </div>
  ),
};

export const LongText: Story = {
  render: () => (
    <div className="w-96">
      <HelperText>
        This is a longer helper text example that demonstrates how the component 
        handles wrapping for more detailed explanations or guidance. It maintains 
        proper spacing and readability even with multiple lines of content.
      </HelperText>
    </div>
  ),
};

export const WithCustomId: Story = {
  args: {
    children: 'This helper text has a custom ID for accessibility linking.',
    id: 'custom-helper-text-id',
  },
};