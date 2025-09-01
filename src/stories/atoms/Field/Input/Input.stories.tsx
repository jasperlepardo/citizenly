import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Input } from '@/components/atoms/Input';

// Common icons for examples
const SearchIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const UserIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const EmailIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
    />
  </svg>
);

const LockIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

const CheckIcon = () => (
  <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const meta: Meta<typeof Input> = {
  title: 'Atoms/Field/Input',
  component: Input,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Enhanced Input component following Select component design patterns with comprehensive features.

## Features
- **Select-Inspired Design**: Consistent with Select component styling
- **Left & Right Icons**: Support for icons on both sides
- **Dismissible/Clear**: Clear button functionality
- **Password Toggle**: Eye icon for password visibility
- **Full Accessibility**: WCAG 2.1 AA compliant with proper ARIA attributes
- **Dark Mode**: Complete dark theme support
- **Error Handling**: Built-in error message display

## Usage
\`\`\`tsx
import { Input } from '@/components';

<Input
  type="email"
  placeholder="Enter your email"
  leftIcon={<EmailIcon />}
  dismissible={true}
  error="Please enter a valid email"
/>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      description: 'HTML input type',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    clearable: {
      control: 'boolean',
      description: 'Whether to show a clear button when input has content',
    },
    dismissible: {
      control: 'boolean',
      description: 'Alternative to clearable - whether input is dismissible',
    },
    showPasswordToggle: {
      control: 'boolean',
      description: 'Whether to show password visibility toggle for password inputs',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

// Basic Examples
export const Default: Story = {
  args: {
    placeholder: 'Enter text here...',
  },
};

export const WithError: Story = {
  args: {
    placeholder: 'Enter your email',
    error: 'Please enter a valid email address',
    type: 'email',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'This input is disabled',
    disabled: true,
    value: 'Disabled value',
  },
};

// Icon Examples
export const WithLeftIcon: Story = {
  args: {
    placeholder: 'Search...',
    leftIcon: <SearchIcon />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Input with left icon for visual context.',
      },
    },
  },
};

export const WithRightIcon: Story = {
  args: {
    placeholder: 'Enter valid data',
    value: 'Valid input',
    rightIcon: <CheckIcon />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Input with right icon showing validation status.',
      },
    },
  },
};

export const WithBothIcons: Story = {
  args: {
    placeholder: 'Search users...',
    leftIcon: <SearchIcon />,
    rightIcon: <UserIcon />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Input with both left and right icons.',
      },
    },
  },
};

// Dismissible/Clear Examples
export const Dismissible: Story = {
  render: () => {
    const [value, setValue] = useState('This text can be dismissed');

    return (
      <div className="space-y-2">
        <Input
          placeholder="Type something and see the dismiss button..."
          dismissible={true}
          value={value}
          onChange={e => setValue(e.target.value)}
          onClear={() => setValue('')}
        />
        <p className="text-sm text-gray-500">Click the × button to dismiss/clear the input</p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Input with dismissible functionality. Shows a dismiss button when there is content.',
      },
    },
  },
};

export const SearchWithClear: Story = {
  render: () => {
    const [value, setValue] = useState('Search query');

    return (
      <div className="space-y-2">
        <Input
          type="search"
          placeholder="Search..."
          leftIcon={<SearchIcon />}
          clearable={true}
          value={value}
          onChange={e => setValue(e.target.value)}
          onClear={() => setValue('')}
        />
        <p className="text-sm text-gray-500">Search input with left icon and clear functionality</p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Search input combining left icon and clear functionality.',
      },
    },
  },
};

// Password Examples
export const PasswordWithEye: Story = {
  render: () => {
    const [value, setValue] = useState('mySecretPassword');

    return (
      <div className="space-y-2">
        <Input
          type="password"
          placeholder="Enter your password"
          leftIcon={<LockIcon />}
          showPasswordToggle={true}
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <p className="text-sm text-gray-500">Password with lock icon and eye toggle</p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Password input with left lock icon and eye toggle for visibility.',
      },
    },
  },
};

export const PasswordAllFeatures: Story = {
  render: () => {
    const [value, setValue] = useState('myComplexPassword123!');

    return (
      <div className="space-y-2">
        <Input
          type="password"
          placeholder="Enter your password"
          leftIcon={<LockIcon />}
          showPasswordToggle={true}
          dismissible={true}
          value={value}
          onChange={e => setValue(e.target.value)}
          onClear={() => setValue('')}
        />
        <p className="text-sm text-gray-500">
          Password with all features: lock icon, eye toggle, and dismiss button
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Password input showcasing all features: left icon, password toggle, and dismissible.',
      },
    },
  },
};

// Form Field Examples
export const EmailWithIcon: Story = {
  render: () => {
    const [value, setValue] = useState('user@example.com');

    return (
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Enter your email"
          leftIcon={<EmailIcon />}
          rightIcon={<CheckIcon />}
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <p className="text-sm text-gray-500">
          Email input with email icon and validation checkmark
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Email input with contextual icons for better UX.',
      },
    },
  },
};

// Interactive Example
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);

      // Simple validation
      if (newValue.length > 0 && newValue.length < 3) {
        setError('Must be at least 3 characters');
      } else {
        setError('');
      }
    };

    const handleClear = () => {
      setValue('');
      setError('');
    };

    return (
      <div className="space-y-4">
        <div>
          <label htmlFor="interactive-input" className="mb-1 block text-sm font-medium">
            Interactive Input with Clear
          </label>
          <Input
            id="interactive-input"
            value={value}
            onChange={handleChange}
            onClear={handleClear}
            placeholder="Type something..."
            error={error}
            clearable={true}
          />
        </div>
        <div className="text-sm text-gray-600">
          Value: &quot;{value}&quot; (Length: {value.length})
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive example showing real-time validation, state management, and clearable functionality.',
      },
    },
  },
};

// Playground
export const Playground: Story = {
  args: {
    placeholder: 'Customize this input...',
    variant: 'default',
    type: 'text',
  },
  parameters: {
    docs: {
      description: {
        story: 'Playground to experiment with different Input configurations.',
      },
    },
  },
};
