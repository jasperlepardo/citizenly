import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Typography, Heading1, Heading2, Heading3, BodyText, Caption } from './Typography';

const meta: Meta<typeof Typography> = {
  title: 'Atoms/Typography',
  component: Typography,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'system',
        'display',
        'body',
        'mono',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'bodyLarge',
        'bodyMedium',
        'bodySmall',
        'caption',
        'button',
        'input',
        'label',
        'code',
      ],
    },
    as: {
      control: 'select',
      options: ['p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'The quick brown fox jumps over the lazy dog',
    variant: 'bodyMedium',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <Typography variant="h1">Heading 1 - Page Title</Typography>
      <Typography variant="h2">Heading 2 - Section Title</Typography>
      <Typography variant="h3">Heading 3 - Subsection Title</Typography>
      <Typography variant="h4">Heading 4 - Card Title</Typography>
      <Typography variant="h5">Heading 5 - Small Title</Typography>
      <Typography variant="h6">Heading 6 - Micro Title</Typography>

      <Typography variant="bodyLarge">Body Large - Introduction text</Typography>
      <Typography variant="bodyMedium">Body Medium - Regular paragraph text</Typography>
      <Typography variant="bodySmall">Body Small - Secondary text</Typography>
      <Typography variant="caption">Caption - Help text and captions</Typography>

      <Typography variant="button">Button Text - Action labels</Typography>
      <Typography variant="label">Label Text - Form field labels</Typography>
      <Typography variant="code" as="code">
        Code Text - Monospace content
      </Typography>
    </div>
  ),
};

export const ConvenienceComponents: Story = {
  render: () => (
    <div className="space-y-4">
      <Heading1>Heading 1 Component</Heading1>
      <Heading2>Heading 2 Component</Heading2>
      <Heading3>Heading 3 Component</Heading3>
      <BodyText>Body text component for regular paragraphs</BodyText>
      <Caption>Caption component for help text</Caption>
    </div>
  ),
};

export const WithCustomStyling: Story = {
  render: () => (
    <div className="space-y-4">
      <Typography variant="h2" className="text-primary-600">
        Styled Heading with Primary Color
      </Typography>
      <Typography variant="bodyMedium" className="italic text-neutral-500">
        Styled body text with neutral color and italic
      </Typography>
      <Typography variant="caption" className="font-semibold text-danger-600">
        Error message styling
      </Typography>
    </div>
  ),
};

export const FontSystemExample: Story = {
  render: () => (
    <div className="space-y-6 rounded-lg bg-gray-50 p-6">
      <div>
        <h4 className="mb-2 text-lg font-semibold">Font System Classes</h4>
        <p className="mb-4 text-sm text-gray-600">
          These classes are available globally through the improved font management system:
        </p>
      </div>

      <div className="space-y-3">
        <div className="rounded border bg-white p-3 font-system">
          <strong>.font-system</strong> - System font (default for UI elements)
        </div>
        <div className="rounded border bg-white p-3 font-display">
          <strong>.font-display</strong> - Display font (headings and prominent text)
        </div>
        <div className="rounded border bg-white p-3 font-body">
          <strong>.font-body</strong> - Body font (paragraph text)
        </div>
        <div className="rounded border bg-white p-3 font-mono">
          <strong>.font-mono</strong> - Monospace font (code and technical content)
        </div>
      </div>
    </div>
  ),
};
