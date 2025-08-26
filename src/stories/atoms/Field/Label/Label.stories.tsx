import type { Meta, StoryObj } from '@storybook/react';
import { Label } from '@/components/atoms/Label';

const meta: Meta<typeof Label> = {
  title: 'Atoms/Field/Label',
  component: Label,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A fully accessible form label component with optional required indicator and comprehensive customization options.

## Features
- **Full Accessibility**: Proper ARIA labels, screen reader support
- **Required Indicator**: Toggleable asterisk (*) or custom indicator  
- **Multiple Sizes**: Small, medium, large variants
- **Color Variants**: Default, muted, error, success states
- **Visual Hiding**: Screen reader only labels when needed
- **Help Text**: Built-in tooltip and aria-describedby support
- **Disabled State**: Proper disabled styling and behavior

## Accessibility Features
- Proper \`htmlFor\` association with form controls
- Screen reader announcements for required fields
- ARIA describedby for help text
- Visual and non-visual required indicators
- Keyboard and focus management support

## Best Practices
- Always provide \`htmlFor\` to associate with form controls
- Use appropriate size variants for your form design
- Include help text for complex fields
- Consider screen reader users with proper labeling
        `,
      },
    },
  },
  argTypes: {
    children: {
      description: 'The label text content',
      control: 'text',
    },
    htmlFor: {
      description: 'ID of the associated form control',
      control: 'text',
    },
    required: {
      description: 'Whether the field is required',
      control: 'boolean',
    },
    showRequiredIndicator: {
      description: 'Whether to show the visual required indicator',
      control: 'boolean',
    },
    size: {
      description: 'Size variant of the main label text',
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    secondarySize: {
      description: 'Size variant of the secondary text',
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    secondaryText: {
      description: 'Optional secondary text on second line',
      control: 'text',
    },
    secondaryVariant: {
      description: 'Color variant of the secondary text',
      control: { type: 'select' },
      options: ['default', 'muted', 'error', 'success'],
    },
    variant: {
      description: 'Color variant of the label',
      control: { type: 'select' },
      options: ['default', 'muted', 'error', 'success'],
    },
    disabled: {
      description: 'Whether the associated field is disabled',
      control: 'boolean',
    },
    visuallyHidden: {
      description: 'Whether the label should be visually hidden',
      control: 'boolean',
    },
    requiredIndicator: {
      description: 'Custom required indicator text',
      control: 'text',
    },
    helpText: {
      description: 'Help text for the field',
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: {
    children: 'Full Name',
    htmlFor: 'fullname',
    required: false,
  },
};

export const Required: Story = {
  args: {
    children: 'Email Address',
    htmlFor: 'email',
    required: true,
    showRequiredIndicator: true,
  },
};

export const RequiredHiddenIndicator: Story = {
  args: {
    children: 'Password',
    htmlFor: 'password',
    required: true,
    showRequiredIndicator: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Required field without visual indicator - screen readers will still announce "required".',
      },
    },
  },
};

export const CustomRequiredIndicator: Story = {
  args: {
    children: 'Phone Number',
    htmlFor: 'phone',
    required: true,
    showRequiredIndicator: true,
    requiredIndicator: '(required)',
  },
};

export const WithHelpText: Story = {
  args: {
    children: 'Social Security Number',
    htmlFor: 'ssn',
    required: true,
    helpText: 'Format: XXX-XX-XXXX',
  },
};

export const WithSecondaryText: Story = {
  args: {
    children: 'Email Address',
    secondaryText: 'We will use this to send you important updates',
    htmlFor: 'email-secondary',
    required: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Label with secondary descriptive text on a separate line.',
      },
    },
  },
};

export const SecondaryTextCustomSize: Story = {
  args: {
    children: 'Profile Photo',
    secondaryText: 'Maximum file size: 5MB. Accepted formats: JPG, PNG',
    htmlFor: 'photo',
    size: 'lg',
    secondarySize: 'sm',
    secondaryVariant: 'muted',
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom sizing and styling for secondary text.',
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Label size="xs" htmlFor="extra-small">
        Extra Small Label
      </Label>
      <Label size="sm" htmlFor="small">
        Small Label
      </Label>
      <Label size="md" htmlFor="medium">
        Medium Label (Default)
      </Label>
      <Label size="lg" htmlFor="large">
        Large Label
      </Label>
      <Label size="xl" htmlFor="extra-large">
        Extra Large Label
      </Label>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different size variants for various form layouts.',
      },
    },
  },
};

export const SizesWithSecondaryText: Story = {
  render: () => (
    <div className="space-y-6">
      <Label size="xs" htmlFor="xs-secondary" secondaryText="Extra small with auto-sized secondary">
        Extra Small Label
      </Label>
      <Label size="sm" htmlFor="sm-secondary" secondaryText="Small with auto-sized secondary text">
        Small Label
      </Label>
      <Label size="md" htmlFor="md-secondary" secondaryText="Medium with auto-sized secondary text">
        Medium Label
      </Label>
      <Label size="lg" htmlFor="lg-secondary" secondaryText="Large with auto-sized secondary text">
        Large Label
      </Label>
      <Label
        size="xl"
        htmlFor="xl-secondary"
        secondaryText="Extra large with auto-sized secondary text"
      >
        Extra Large Label
      </Label>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'All sizes with secondary text showing automatic size scaling (secondary text is one size smaller).',
      },
    },
  },
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-4">
      <Label variant="default" htmlFor="default">
        Default Label
      </Label>
      <Label variant="muted" htmlFor="muted">
        Muted Label
      </Label>
      <Label variant="error" htmlFor="error" required>
        Error Label
      </Label>
      <Label variant="success" htmlFor="success">
        Success Label
      </Label>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different color variants for various states.',
      },
    },
  },
};

export const DisabledState: Story = {
  render: () => (
    <div className="space-y-4">
      <Label disabled htmlFor="disabled1">
        Disabled Label
      </Label>
      <Label disabled required htmlFor="disabled2">
        Disabled Required Label
      </Label>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Labels for disabled form fields.',
      },
    },
  },
};

export const VisuallyHidden: Story = {
  args: {
    children: 'Search Query',
    htmlFor: 'search',
    visuallyHidden: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Label hidden visually but available to screen readers.',
      },
    },
  },
};

export const CompleteFormExample: Story = {
  render: () => (
    <div className="max-w-md space-y-6">
      <div>
        <Label
          htmlFor="example-name"
          required
          size="md"
          secondaryText="Enter your full legal name as it appears on your ID"
          helpText="Enter your full legal name"
        >
          Full Name
        </Label>
        <input
          id="example-name"
          type="text"
          className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          placeholder="John Doe"
        />
      </div>

      <div>
        <Label
          htmlFor="example-email"
          required
          variant="default"
          secondaryText="We'll use this for account notifications and password recovery"
          helpText="We'll use this for account notifications"
        >
          Email Address
        </Label>
        <input
          id="example-email"
          type="email"
          className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          placeholder="john@example.com"
        />
      </div>

      <div>
        <Label htmlFor="example-phone" variant="muted" size="sm">
          Phone Number (Optional)
        </Label>
        <input
          id="example-phone"
          type="tel"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div>
        <Label htmlFor="example-disabled" disabled required>
          Disabled Field
        </Label>
        <input
          id="example-disabled"
          type="text"
          disabled
          className="mt-1 block w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-2 shadow-sm"
          placeholder="This field is disabled"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Complete form example showing various FormLabel configurations with actual form inputs.',
      },
    },
  },
};
