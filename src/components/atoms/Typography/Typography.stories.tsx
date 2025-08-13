import type { Meta, StoryObj } from '@storybook/react';
import { Typography, Heading1, Heading2, Heading3, BodyText as BodyTextComponent, Caption } from './Typography';

const meta = {
  title: 'Atoms/Typography',
  component: Typography,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A flexible typography component system with predefined variants for headings, body text, and other text elements. Supports custom HTML elements and semantic markup.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'bodyLarge', 'bodyMedium', 'bodySmall', 'caption',
        'button', 'input', 'label', 'code',
        'system', 'display', 'body', 'mono'
      ],
    },
    as: {
      control: { type: 'select' },
      options: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'strong', 'em', 'code'],
    },
    children: {
      control: { type: 'text' },
    },
  },
} satisfies Meta<typeof Typography>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'This is the default typography component with bodyMedium variant.',
  },
};

export const AllHeadings: Story = {
  render: () => (
    <div className="space-y-4">
      <Typography variant="h1" as="h1">Heading 1 - Main Page Title</Typography>
      <Typography variant="h2" as="h2">Heading 2 - Section Title</Typography>
      <Typography variant="h3" as="h3">Heading 3 - Subsection Title</Typography>
      <Typography variant="h4" as="h4">Heading 4 - Card Title</Typography>
      <Typography variant="h5" as="h5">Heading 5 - Small Section</Typography>
      <Typography variant="h6" as="h6">Heading 6 - Minor Heading</Typography>
    </div>
  ),
};

export const BodyTextVariants: Story = {
  render: () => (
    <div className="space-y-4 max-w-2xl">
      <Typography variant="bodyLarge">
        Body Large - This is larger body text used for introductory paragraphs or emphasis. 
        It provides good readability for important content that needs to stand out from regular text.
      </Typography>
      
      <Typography variant="bodyMedium">
        Body Medium - This is the standard body text used throughout the application. 
        It&rsquo;s designed for optimal readability and is the most commonly used text variant for content.
      </Typography>
      
      <Typography variant="bodySmall">
        Body Small - This is smaller body text used for secondary information, 
        fine print, or when space is limited but readability is still important.
      </Typography>
      
      <Typography variant="caption">
        Caption - This is the smallest text variant, typically used for image captions, 
        metadata, timestamps, or other supplementary information.
      </Typography>
    </div>
  ),
};

export const UIElements: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <Typography variant="label" as="label" className="block mb-2">
          Label - Form Field Label
        </Typography>
        <Typography variant="input" className="block p-2 border rounded">
          Input - Text inside form inputs
        </Typography>
      </div>
      
      <div>
        <Typography variant="button" as="span" className="inline-block px-4 py-2 bg-blue-500 text-white rounded">
          Button - Button Text Style
        </Typography>
      </div>
      
      <div>
        <Typography variant="code" as="code" className="bg-gray-100 px-2 py-1 rounded">
          Code - Inline code snippets
        </Typography>
      </div>
    </div>
  ),
};

export const FontStacks: Story = {
  render: () => (
    <div className="space-y-4">
      <Typography variant="system">System - Uses system font stack for UI elements</Typography>
      <Typography variant="display">Display - Uses display font for headings and emphasis</Typography>
      <Typography variant="body">Body - Uses body font for readable content</Typography>
      <Typography variant="mono" as="code">Mono - Uses monospace font for code and technical content</Typography>
    </div>
  ),
};

export const ConvenienceComponents: Story = {
  render: () => (
    <div className="space-y-4">
      <Heading1>Convenience Component - H1</Heading1>
      <Heading2>Convenience Component - H2</Heading2>
      <Heading3>Convenience Component - H3</Heading3>
      
      <BodyTextComponent>
        Convenience Component - Body Text. This uses the BodyText component 
        which automatically applies the bodyMedium variant and paragraph element.
      </BodyTextComponent>
      
      <Caption>
        Convenience Component - Caption. This uses the Caption component 
        for supplementary text and metadata.
      </Caption>
    </div>
  ),
};

export const SemanticUsage: Story = {
  render: () => (
    <article className="max-w-3xl space-y-4">
      <Heading1>Article Title</Heading1>
      
      <Typography variant="bodyLarge" as="p" className="text-gray-600">
        This is the article introduction or summary paragraph that gives readers 
        an overview of what they&rsquo;re about to read.
      </Typography>
      
      <Heading2>Section Heading</Heading2>
      
      <BodyTextComponent>
        This is a regular paragraph with standard body text. It&rsquo;s designed for 
        optimal readability and comfortable reading experience.
      </BodyTextComponent>
      
      <BodyTextComponent>
        Here&rsquo;s another paragraph to show proper spacing and typography hierarchy. 
        Notice how the text flows naturally and maintains good readability.
      </BodyTextComponent>
      
      <Heading3>Subsection</Heading3>
      
      <BodyTextComponent>
        You can also use <Typography variant="code" as="code">inline code</Typography> within 
        paragraphs, or <Typography as="strong" className="font-semibold">strong emphasis</Typography> for 
        important information.
      </BodyTextComponent>
      
      <Caption>
        Figure 1: This would be a caption for an image or diagram, 
        providing additional context or attribution.
      </Caption>
    </article>
  ),
};

export const Responsive: Story = {
  render: () => (
    <div className="space-y-4">
      <Typography variant="h1" className="sm:text-5xl md:text-6xl">
        Responsive Heading
      </Typography>
      
      <Typography variant="bodyMedium" className="sm:text-lg md:text-xl">
        This text gets larger on bigger screens by combining the base variant 
        with responsive utility classes.
      </Typography>
    </div>
  ),
};

export const ColorVariations: Story = {
  render: () => (
    <div className="space-y-4">
      <Typography variant="h2" className="text-gray-900">
        Primary Text Color
      </Typography>
      
      <Typography variant="bodyMedium" className="text-gray-700">
        Secondary text color for regular content
      </Typography>
      
      <Typography variant="bodySmall" className="text-gray-500">
        Muted text color for less important information
      </Typography>
      
      <Typography variant="bodyMedium" className="text-blue-600">
        Blue accent color for links or highlights
      </Typography>
      
      <Typography variant="bodyMedium" className="text-red-600">
        Error color for warnings or alerts
      </Typography>
      
      <Typography variant="bodyMedium" className="text-green-600">
        Success color for confirmations
      </Typography>
    </div>
  ),
};