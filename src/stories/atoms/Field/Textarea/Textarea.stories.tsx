import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Textarea } from '@/components/atoms/Field';

const meta: Meta<typeof Textarea> = {
  title: 'Atoms/Field/Textarea',
  component: Textarea,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Enhanced Textarea component following Input component design patterns for consistency.

## Features
- **Input-Inspired Design**: Consistent with Input component styling
- **Character Counting**: Optional character count display
- **Resizable**: Optional vertical resizing
- **Full Accessibility**: WCAG 2.1 AA compliant with proper ARIA attributes
- **Dark Mode**: Complete dark theme support
- **Error Handling**: Built-in error message display

## Usage
\`\`\`tsx
import { Textarea } from '@/components/atoms/Field/Textarea/Textarea';

<Textarea
  placeholder="Enter your message..."
  rows={4}
  showCharCount={true}
  maxLength={500}
  error="Please enter a valid message"
/>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    rows: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Number of visible text lines',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the textarea is disabled',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    showCharCount: {
      control: 'boolean',
      description: 'Whether to show character count',
    },
    resizable: {
      control: 'boolean',
      description: 'Whether the textarea is vertically resizable',
    },
    maxLength: {
      control: { type: 'number', min: 0 },
      description: 'Maximum number of characters allowed',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

// Basic Examples
export const Default: Story = {
  args: {
    placeholder: 'Enter your text here...',
    rows: 3,
  },
};

export const WithError: Story = {
  args: {
    placeholder: 'Enter your message',
    error: 'This field is required and cannot be empty',
    rows: 3,
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'This textarea is disabled',
    disabled: true,
    value: 'This content cannot be edited',
    rows: 3,
  },
};

// Character Count Examples
export const WithCharacterCount: Story = {
  render: () => {
    const [value, setValue] = useState('Type something to see the character count...');

    return (
      <div className="space-y-2">
        <Textarea
          placeholder="Type your message..."
          showCharCount={true}
          value={value}
          onChange={e => setValue(e.target.value)}
          rows={4}
        />
        <p className="text-sm text-gray-500">Character count is shown below the textarea</p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Textarea with character count display.',
      },
    },
  },
};

export const WithMaxLength: Story = {
  render: () => {
    const [value, setValue] = useState('');

    return (
      <div className="space-y-2">
        <Textarea
          placeholder="Write a tweet (max 280 characters)..."
          maxLength={280}
          showCharCount={true}
          value={value}
          onChange={e => setValue(e.target.value)}
          rows={4}
        />
        <p className="text-sm text-gray-500">
          Try typing more than 280 characters to see the limit warning
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Textarea with maximum character limit and visual feedback.',
      },
    },
  },
};

// Size Examples
export const DifferentSizes: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Small (2 rows)</label>
        <Textarea placeholder="Small textarea..." rows={2} showCharCount={true} />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Medium (3 rows)</label>
        <Textarea placeholder="Medium textarea..." rows={3} showCharCount={true} />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Large (5 rows)</label>
        <Textarea placeholder="Large textarea..." rows={5} showCharCount={true} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Textarea components with different row heights.',
      },
    },
  },
};

// Resizable Example
export const Resizable: Story = {
  render: () => {
    const [value, setValue] = useState(
      'This textarea can be resized vertically. Try dragging the bottom-right corner.'
    );

    return (
      <div className="space-y-2">
        <Textarea
          placeholder="Resizable textarea..."
          resizable={true}
          value={value}
          onChange={e => setValue(e.target.value)}
          rows={4}
          showCharCount={true}
        />
        <p className="text-sm text-gray-500">
          Drag the resize handle in the bottom-right corner to adjust height
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Textarea that can be vertically resized by the user.',
      },
    },
  },
};

// Form Field Example
export const AsFieldSet: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setValue(newValue);

      // Simple validation
      if (newValue.length > 0 && newValue.length < 10) {
        setError('Message must be at least 10 characters');
      } else if (newValue.length > 200) {
        setError('Message is too long');
      } else {
        setError('');
      }
    };

    return (
      <div className="max-w-md space-y-4">
        <div>
          <label htmlFor="message-textarea" className="mb-2 block text-sm font-medium">
            Your Message <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="message-textarea"
            name="message"
            value={value}
            onChange={handleChange}
            placeholder="Tell us what you think..."
            error={error}
            maxLength={200}
            showCharCount={true}
            rows={4}
            required
          />
        </div>
        <div className="text-sm text-gray-600">
          Current value: &quot;{value}&quot; (Length: {value.length})
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Textarea used as a form field with label, validation, and real-time feedback.',
      },
    },
  },
};

// Comparison with Input Design
export const DesignConsistency: Story = {
  render: () => {
    const [textareaValue, setTextareaValue] = useState('');
    const [inputValue, setInputValue] = useState('');

    return (
      <div className="max-w-md space-y-6">
        <h3 className="text-lg font-semibold">Design Consistency Demo</h3>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Single-line Input</label>
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Type here..."
            className="font-montserrat min-h-10 w-full rounded-sm border border-0 border-gray-300 bg-white p-2 text-base text-gray-600 shadow-none ring-0 outline-0 placeholder:text-gray-500 focus:border-0 focus:border-blue-600 focus:shadow-[0px_0px_0px_4px_rgba(59,130,246,0.32)] focus:shadow-none focus:ring-0 focus:outline-0 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:placeholder:text-gray-400"
            style={{
              border: '1px solid rgb(209 213 219)',
              outline: 'none',
              boxShadow: 'none',
              appearance: 'none',
            }}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Multi-line Textarea</label>
          <Textarea
            value={textareaValue}
            onChange={e => setTextareaValue(e.target.value)}
            placeholder="Type here..."
            rows={3}
            showCharCount={true}
          />
        </div>

        <div className="text-sm text-gray-500">
          Both components share consistent styling, focus states, and behavior
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the visual consistency between Textarea and Input components.',
      },
    },
  },
};

// Interactive Example
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const [showCharCount, setShowCharCount] = useState(false);
    const [maxLength, setMaxLength] = useState<number | undefined>(undefined);
    const [rows, setRows] = useState(4);
    const [resizable, setResizable] = useState(false);
    const [error, setError] = useState('');

    const handleClear = () => {
      setValue('');
      setError('');
    };

    const handleFillSample = () => {
      setValue(
        'This is a sample text to demonstrate the textarea functionality. You can edit, resize, and see character counting in action.'
      );
      setError('');
    };

    return (
      <div className="max-w-2xl space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <h4 className="font-medium">Controls</h4>

            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showCharCount}
                  onChange={e => setShowCharCount(e.target.checked)}
                />
                <span className="text-sm">Show character count</span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={resizable}
                  onChange={e => setResizable(e.target.checked)}
                />
                <span className="text-sm">Resizable</span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="block text-sm">Rows: {rows}</label>
              <input
                type="range"
                min="2"
                max="8"
                value={rows}
                onChange={e => setRows(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm">Max length</label>
              <select
                value={maxLength || ''}
                onChange={e => setMaxLength(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full rounded border border-gray-300 p-2"
              >
                <option value="">No limit</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="500">500</option>
              </select>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleClear}
                className="mr-2 rounded bg-gray-500 px-3 py-1 text-sm text-white"
              >
                Clear
              </button>
              <button
                onClick={handleFillSample}
                className="rounded bg-blue-500 px-3 py-1 text-sm text-white"
              >
                Fill Sample
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Interactive Textarea</label>
            <Textarea
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Try different settings..."
              error={error}
              showCharCount={showCharCount}
              maxLength={maxLength}
              rows={rows}
              resizable={resizable}
            />
            <p className="text-xs text-gray-500">
              Value length: {value.length}
              {maxLength && ` / ${maxLength}`}
            </p>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to experiment with different Textarea configurations.',
      },
    },
  },
};

// Playground
export const Playground: Story = {
  args: {
    placeholder: 'Customize this textarea...',
    rows: 4,
    showCharCount: false,
    resizable: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Playground to experiment with different Textarea configurations.',
      },
    },
  },
};
