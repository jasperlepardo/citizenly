import type { Meta, StoryObj } from '@storybook/react';
import { Link } from './Link';

// Icons for examples
const ArrowLeftIcon = () => (
  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const PlusIcon = () => (
  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const meta: Meta<typeof Link> = {
  title: 'Atoms/Link',
  component: Link,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A versatile link component that shares the same design system as Button.
Built with accessibility in mind and supports icons, external links, and full customization.

## Features
- Multiple visual variants (same as Button + link-specific variants)
- Icon support (left, right, icon-only)
- External link handling with security attributes
- Next.js integration for internal navigation
- Full accessibility support
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'primary',
        'primary-subtle',
        'primary-faded',
        'primary-outline',
        'secondary',
        'secondary-subtle',
        'secondary-faded',
        'secondary-outline',
        'success',
        'success-subtle',
        'success-faded',
        'success-outline',
        'warning',
        'warning-subtle',
        'warning-faded',
        'warning-outline',
        'danger',
        'danger-subtle',
        'danger-faded',
        'danger-outline',
        'zinc',
        'zinc-subtle',
        'zinc-faded',
        'zinc-outline',
        'ghost',
        'link',
        'link-subtle',
      ],
      description: 'Visual variant of the link',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'regular'],
      description: 'Size of the link',
    },
    href: {
      control: 'text',
      description: 'The URL to navigate to',
    },
    external: {
      control: 'boolean',
      description: 'Whether this is an external link (opens in new tab)',
    },
    iconOnly: {
      control: 'boolean',
      description: 'Whether this is an icon-only link',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether the link should take full width',
    },
  },
  args: {
    href: '#',
    children: 'Link Text',
    variant: 'link',
    size: 'regular',
    external: false,
    iconOnly: false,
    fullWidth: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    children: 'Default Link',
  },
};

export const Traditional: Story = {
  args: {
    variant: 'link',
    children: 'Traditional Link',
  },
  parameters: {
    docs: {
      description: {
        story: 'Traditional underlined link styling.',
      },
    },
  },
};

export const ButtonStyled: Story = {
  args: {
    variant: 'primary',
    children: 'Button-styled Link',
  },
  parameters: {
    docs: {
      description: {
        story: 'Link that looks like a primary button.',
      },
    },
  },
};

// Variants
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <h3 className="text-lg font-semibold">Button-style Variants</h3>
      <div className="flex flex-wrap gap-2">
        <Link href="#" variant="primary">Primary</Link>
        <Link href="#" variant="primary-outline">Primary Outline</Link>
        <Link href="#" variant="secondary">Secondary</Link>
        <Link href="#" variant="success">Success</Link>
        <Link href="#" variant="warning">Warning</Link>
        <Link href="#" variant="danger">Danger</Link>
        <Link href="#" variant="zinc">Neutral</Link>
        <Link href="#" variant="ghost">Ghost</Link>
      </div>
      
      <h3 className="text-lg font-semibold mt-4">Link-style Variants</h3>
      <div className="flex flex-wrap gap-4">
        <Link href="#" variant="link">Traditional Link</Link>
        <Link href="#" variant="link-subtle">Subtle Link</Link>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available link variants.',
      },
    },
  },
};

// Sizes
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Link href="#" variant="primary" size="sm">Small</Link>
      <Link href="#" variant="primary" size="md">Medium</Link>
      <Link href="#" variant="primary" size="regular">Regular</Link>
      <Link href="#" variant="primary" size="lg">Large</Link>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different link sizes.',
      },
    },
  },
};

// With Icons
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Link href="#" variant="zinc-outline" size="sm" leftIcon={<ArrowLeftIcon />}>
          Back to List
        </Link>
        <Link href="#" variant="primary" rightIcon={<PlusIcon />}>
          Add New
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Link href="https://example.com" variant="link" external rightIcon={<ExternalLinkIcon />}>
          External Link
        </Link>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Links with left and right icons.',
      },
    },
  },
};

export const IconOnly: Story = {
  args: {
    iconOnly: true,
    variant: 'zinc-outline',
    children: <SettingsIcon />,
    'aria-label': 'Settings',
  },
  parameters: {
    docs: {
      description: {
        story: 'Icon-only link with proper accessibility label.',
      },
    },
  },
};

// External Links
export const ExternalLink: Story = {
  args: {
    href: 'https://example.com',
    external: true,
    variant: 'link',
    children: 'Visit External Site',
  },
  parameters: {
    docs: {
      description: {
        story: 'External link that opens in a new tab with security attributes.',
      },
    },
  },
};

// Navigation Examples
export const NavigationExamples: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <h3 className="text-lg font-semibold">Common Navigation Patterns</h3>
      
      <div className="flex flex-col gap-2">
        <Link href="/dashboard" variant="ghost">Dashboard</Link>
        <Link href="/residents" variant="ghost">Residents</Link>
        <Link href="/households" variant="ghost">Households</Link>
      </div>
      
      <div className="flex items-center gap-2 mt-4">
        <Link href="/residents" variant="zinc-outline" size="sm" leftIcon={<ArrowLeftIcon />}>
          Back to Residents
        </Link>
        <Link href="/residents/new" variant="primary" size="sm">
          Add New Resident
        </Link>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Common navigation patterns using the Link component.',
      },
    },
  },
};

// Full Width
export const FullWidth: Story = {
  args: {
    fullWidth: true,
    variant: 'primary',
    children: 'Full Width Link',
  },
  parameters: {
    docs: {
      description: {
        story: 'Link that takes the full width of its container.',
      },
    },
  },
};

// Interactive States
export const InteractiveStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <h3 className="text-lg font-semibold">Interactive States</h3>
      <div className="flex flex-col gap-2">
        <Link href="#" variant="primary">Normal State</Link>
        <Link href="#" variant="primary" className="hover:bg-blue-500">Hover State (hover me)</Link>
        <Link href="#" variant="primary" className="focus:ring-2 focus:ring-blue-600">Focus State (tab to me)</Link>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different interactive states of the link.',
      },
    },
  },
};

// Dark Mode Preview
export const DarkMode: Story = {
  render: () => (
    <div className="dark bg-zinc-900 p-4 rounded-lg">
      <div className="flex flex-col gap-4">
        <Link href="#" variant="primary">Primary Link</Link>
        <Link href="#" variant="zinc-outline">Neutral Outline</Link>
        <Link href="#" variant="link">Traditional Link</Link>
        <Link href="#" variant="success">Success Link</Link>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'How links appear in dark mode.',
      },
    },
  },
};