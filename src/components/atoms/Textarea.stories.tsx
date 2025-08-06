import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A versatile textarea component with character counting, resize options, and various states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'filled', 'error', 'success', 'disabled', 'readonly'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    resize: {
      control: { type: 'select' },
      options: ['none', 'vertical', 'horizontal', 'both'],
    },
    label: {
      control: 'text',
    },
    placeholder: {
      control: 'text',
    },
    helperText: {
      control: 'text',
    },
    errorMessage: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    readOnly: {
      control: 'boolean',
    },
    showCount: {
      control: 'boolean',
    },
    maxLength: {
      control: 'number',
    },
    rows: {
      control: 'number',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive wrapper for stories that need state
const InteractiveWrapper = ({
  children,
  ...props
}: {
  children: React.ReactNode;
  [key: string]: unknown;
}) => {
  const [value, setValue] = useState(props.value || '');
  return React.cloneElement(children, {
    ...props,
    value,
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value),
  });
};

export const Default: Story = {
  args: {
    label: 'Message',
    placeholder: 'Enter your message here...',
    helperText: 'Please provide as much detail as possible',
    rows: 4,
  },
  render: args => (
    <InteractiveWrapper {...args}>
      <Textarea />
    </InteractiveWrapper>
  ),
};

export const WithCharacterCount: Story = {
  args: {
    label: 'Description',
    placeholder: 'Describe your project...',
    helperText: 'Keep it concise but informative',
    maxLength: 200,
    showCount: true,
    rows: 4,
  },
  render: args => (
    <InteractiveWrapper {...args}>
      <Textarea />
    </InteractiveWrapper>
  ),
};

export const ErrorState: Story = {
  args: {
    label: 'Required Field',
    placeholder: 'This field cannot be empty',
    variant: 'error',
    errorMessage: 'This field is required and must contain at least 10 characters',
    value: 'Too short',
    rows: 3,
  },
  render: args => (
    <InteractiveWrapper {...args}>
      <Textarea />
    </InteractiveWrapper>
  ),
};

export const SuccessState: Story = {
  args: {
    label: 'Feedback',
    value:
      'Thank you for the excellent service! Everything was perfect and exceeded my expectations.',
    variant: 'success',
    helperText: 'Thank you for your feedback!',
    rows: 3,
  },
  render: args => (
    <InteractiveWrapper {...args}>
      <Textarea />
    </InteractiveWrapper>
  ),
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Field',
    value: 'This textarea is disabled and cannot be edited.',
    disabled: true,
    helperText: 'This field is currently disabled',
    rows: 3,
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Terms and Conditions',
    value:
      'These are the terms and conditions that cannot be modified. By using this service, you agree to these terms...',
    readOnly: true,
    helperText: 'Please read carefully',
    rows: 4,
  },
};

// Sizes
export const Small: Story = {
  args: {
    label: 'Small Textarea',
    size: 'sm',
    placeholder: 'Enter text...',
    rows: 3,
  },
  render: args => (
    <InteractiveWrapper {...args}>
      <Textarea />
    </InteractiveWrapper>
  ),
};

export const Medium: Story = {
  args: {
    label: 'Medium Textarea',
    size: 'md',
    placeholder: 'Enter text (default size)...',
    rows: 4,
  },
  render: args => (
    <InteractiveWrapper {...args}>
      <Textarea />
    </InteractiveWrapper>
  ),
};

export const Large: Story = {
  args: {
    label: 'Large Textarea',
    size: 'lg',
    placeholder: 'Enter text...',
    rows: 5,
  },
  render: args => (
    <InteractiveWrapper {...args}>
      <Textarea />
    </InteractiveWrapper>
  ),
};

// Resize Options
export const NoResize: Story = {
  args: {
    label: 'Fixed Size',
    placeholder: 'This textarea cannot be resized',
    resize: 'none',
    rows: 4,
    helperText: 'Resize is disabled',
  },
  render: args => (
    <InteractiveWrapper {...args}>
      <Textarea />
    </InteractiveWrapper>
  ),
};

export const VerticalResize: Story = {
  args: {
    label: 'Vertical Resize Only',
    placeholder: 'You can resize this vertically',
    resize: 'vertical',
    rows: 3,
    helperText: 'Try dragging the bottom-right corner',
  },
  render: args => (
    <InteractiveWrapper {...args}>
      <Textarea />
    </InteractiveWrapper>
  ),
};

export const HorizontalResize: Story = {
  args: {
    label: 'Horizontal Resize Only',
    placeholder: 'You can resize this horizontally',
    resize: 'horizontal',
    rows: 4,
    helperText: 'Try dragging the bottom-right corner',
  },
  render: args => (
    <InteractiveWrapper {...args}>
      <Textarea />
    </InteractiveWrapper>
  ),
};

export const BothResize: Story = {
  args: {
    label: 'Free Resize',
    placeholder: 'You can resize this in any direction',
    resize: 'both',
    rows: 4,
    helperText: 'Try dragging the bottom-right corner',
  },
  render: args => (
    <InteractiveWrapper {...args}>
      <Textarea />
    </InteractiveWrapper>
  ),
};

// All States Showcase
export const AllStates: Story = {
  render: () => (
    <div className="space-y-6 w-96">
      <h3 className="text-lg font-semibold">Textarea States</h3>

      <Textarea
        label="Default State"
        placeholder="Enter your text..."
        helperText="This is a helper text"
        rows={3}
      />

      <Textarea
        label="Filled State"
        value="This textarea has content"
        helperText="Content has been entered"
        rows={3}
      />

      <Textarea
        label="Error State"
        value="Invalid content"
        variant="error"
        errorMessage="This content is not valid"
        rows={3}
      />

      <Textarea
        label="Success State"
        value="Perfect! This looks great."
        variant="success"
        helperText="Content is valid"
        rows={3}
      />

      <Textarea
        label="Disabled State"
        value="This is disabled"
        disabled
        helperText="This field is disabled"
        rows={3}
      />

      <Textarea
        label="Read Only State"
        value="This is read only content that cannot be modified"
        readOnly
        helperText="This field is read only"
        rows={3}
      />
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

const FormExampleComponent = () => {
  const [formData, setFormData] = useState({
    summary: '',
    description: '',
    notes: '',
    feedback: '',
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="space-y-6 w-full max-w-2xl">
      <h3 className="text-lg font-semibold">Project Report Form</h3>

      <Textarea
        label="Executive Summary"
        placeholder="Provide a brief overview of the project..."
        value={formData.summary}
        onChange={handleChange('summary')}
        maxLength={300}
        showCount
        rows={3}
        helperText="Keep this concise and high-level"
      />

      <Textarea
        label="Detailed Description"
        placeholder="Provide detailed information about the project, including objectives, methodology, and key findings..."
        value={formData.description}
        onChange={handleChange('description')}
        maxLength={1000}
        showCount
        rows={6}
        resize="vertical"
        helperText="Include as much detail as necessary"
      />

      <Textarea
        label="Additional Notes"
        placeholder="Any additional notes or observations..."
        value={formData.notes}
        onChange={handleChange('notes')}
        rows={4}
        size="sm"
        helperText="Optional field for extra information"
      />

      <Textarea
        label="Feedback"
        placeholder="Share your thoughts on the process or outcomes..."
        value={formData.feedback}
        onChange={handleChange('feedback')}
        maxLength={500}
        showCount
        rows={4}
        resize="both"
        helperText="Your feedback helps us improve"
      />

      <div className="pt-4 border-t text-sm text-gray-600">
        <h4 className="font-medium mb-2">Content Summary:</h4>
        <ul className="space-y-1">
          <li>Summary: {formData.summary.length} characters</li>
          <li>Description: {formData.description.length} characters</li>
          <li>Notes: {formData.notes.length} characters</li>
          <li>Feedback: {formData.feedback.length} characters</li>
        </ul>
      </div>
    </div>
  );
};

export const FormExample: Story = {
  render: FormExampleComponent,
  parameters: {
    layout: 'padded',
  },
};

const BlogEditorComponent = () => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');

  return (
    <div className="space-y-4 w-full max-w-4xl">
      <h3 className="text-lg font-semibold">Blog Post Editor</h3>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Blog post title..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full text-2xl font-bold border-none outline-none bg-transparent placeholder-gray-400"
        />

        <Textarea
          label="Content"
          placeholder="Start writing your blog post..."
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={15}
          resize="vertical"
          maxLength={5000}
          showCount
          size="lg"
          helperText="Write your blog post content here. Markdown formatting is supported."
        />

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500">
            Words: {content.split(/\s+/).filter(Boolean).length} | Characters: {content.length}
          </div>
          <div className="space-x-3">
            <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
              Save Draft
            </button>
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BlogEditor: Story = {
  render: BlogEditorComponent,
  parameters: {
    layout: 'padded',
  },
};
