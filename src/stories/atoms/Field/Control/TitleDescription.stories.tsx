import type { Meta, StoryObj } from '@storybook/react';
import { TitleDescription } from '@/components/atoms/TitleDescription';

const meta = {
  title: 'Atoms/Field/Control/TitleDescription',
  component: TitleDescription,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A versatile component for displaying titles and descriptions with optional error messages. Used in form controls like checkboxes, radios, and toggles.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: { type: 'text' },
      description: 'Main title text',
    },
    description: {
      control: { type: 'text' },
      description: 'Supporting description text',
    },
    errorMessage: {
      control: { type: 'text' },
      description: 'Error message to display',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'primary', 'error', 'disabled'],
      description: 'Visual variant of the component',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the text elements',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the component is in disabled state',
    },
  },
} satisfies Meta<typeof TitleDescription>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    title: 'Form Field Title',
    description: 'This is a helpful description explaining what this field does.',
  },
};

export const TitleOnly: Story = {
  args: {
    title: 'Just a Title',
  },
  parameters: {
    docs: {
      description: {
        story: 'Component with only a title, no description.',
      },
    },
  },
};

export const DescriptionOnly: Story = {
  args: {
    description: 'Just a description without a title.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Component with only a description, no title.',
      },
    },
  },
};

// Variants
export const Primary: Story = {
  args: {
    title: 'Primary Title',
    description: 'This uses the primary variant styling.',
    variant: 'primary',
  },
};

export const WithError: Story = {
  args: {
    title: 'Field with Error',
    description: 'This field has validation issues.',
    errorMessage: 'This field is required and cannot be empty.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Component showing an error state with error message.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    title: 'Disabled Field',
    description: 'This field is currently disabled.',
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Component in disabled state with muted colors.',
      },
    },
  },
};

// Sizes
export const Small: Story = {
  args: {
    title: 'Small Size Title',
    description: 'This is a small sized component.',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    title: 'Medium Size Title',
    description: 'This is a medium sized component (default).',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    title: 'Large Size Title',
    description: 'This is a large sized component.',
    size: 'lg',
  },
};

// Complex Examples
export const LongContent: Story = {
  args: {
    title: 'Long Title That Might Wrap to Multiple Lines in Narrow Containers',
    description: 'This is a much longer description that demonstrates how the component handles extended text content. It should wrap naturally and maintain proper spacing between the title and description elements.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Component with longer content to show text wrapping behavior.',
      },
    },
  },
};

export const ErrorWithLongMessage: Story = {
  args: {
    title: 'Validation Field',
    description: 'Please enter a valid email address.',
    errorMessage: 'The email address you entered is not valid. Please check the format and ensure it includes an @ symbol and a valid domain.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Component with a longer error message to show error text wrapping.',
      },
    },
  },
};

// Usage Examples
export const CheckboxLabel: Story = {
  render: () => (
    <div className="flex items-start space-x-3">
      <input type="checkbox" className="mt-1" />
      <TitleDescription
        title="I agree to the terms and conditions"
        description="By checking this box, you agree to our terms of service and privacy policy."
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example usage with a checkbox control.',
      },
    },
  },
};

export const RadioLabel: Story = {
  render: () => (
    <div className="space-y-3">
      <div className="flex items-start space-x-3">
        <input type="radio" name="option" className="mt-1" />
        <TitleDescription
          title="Option One"
          description="This is the first option with detailed explanation."
        />
      </div>
      <div className="flex items-start space-x-3">
        <input type="radio" name="option" className="mt-1" />
        <TitleDescription
          title="Option Two"
          description="This is the second option with different details."
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example usage with radio button controls.',
      },
    },
  },
};

// All Sizes Comparison
export const SizeComparison: Story = {
  render: () => (
    <div className="space-y-6">
      <TitleDescription
        title="Small Size"
        description="This demonstrates the small size variant."
        size="sm"
      />
      <TitleDescription
        title="Medium Size"
        description="This demonstrates the medium size variant (default)."
        size="md"
      />
      <TitleDescription
        title="Large Size"
        description="This demonstrates the large size variant."
        size="lg"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of all available sizes.',
      },
    },
  },
};

// All Variants Comparison
export const VariantComparison: Story = {
  render: () => (
    <div className="space-y-6">
      <TitleDescription
        title="Default Variant"
        description="This shows the default styling."
        variant="default"
      />
      <TitleDescription
        title="Primary Variant"
        description="This shows the primary styling."
        variant="primary"
      />
      <TitleDescription
        title="Error Variant"
        description="This shows the error styling."
        errorMessage="Something went wrong."
      />
      <TitleDescription
        title="Disabled Variant"
        description="This shows the disabled styling."
        disabled={true}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of all available variants.',
      },
    },
  },
};