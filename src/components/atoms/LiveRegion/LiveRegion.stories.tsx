import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { LiveRegion } from './LiveRegion';

const meta = {
  title: 'Atoms/LiveRegion',
  component: LiveRegion,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A live region component for accessible announcements to screen readers. Uses aria-live to announce dynamic content changes. Can be either visible or screen reader only.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: { type: 'text' },
      description: 'The message to announce to screen readers',
    },
    type: {
      control: { type: 'select' },
      options: ['polite', 'assertive'],
      description: 'Priority level for screen reader announcements',
    },
    visible: {
      control: { type: 'boolean' },
      description: 'Whether the message should be visible on screen',
    },
    clearAfter: {
      control: { type: 'number' },
      description: 'Time in milliseconds before clearing the message (0 to disable)',
    },
  },
} satisfies Meta<typeof LiveRegion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: 'This is a polite announcement',
    type: 'polite',
    visible: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Default live region that announces to screen readers but is not visible on screen.',
      },
    },
  },
};

export const Visible: Story = {
  args: {
    message: 'This message is visible on screen and announced to screen readers',
    type: 'polite',
    visible: true,
  },
};

export const Assertive: Story = {
  args: {
    message: 'This is an urgent announcement that interrupts screen readers',
    type: 'assertive',
    visible: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Assertive announcements interrupt screen reader flow for urgent messages.',
      },
    },
  },
};

const FormValidationComponent = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (value: string) => {
    if (!value) {
      setError('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(value)) {
      setError('Please enter a valid email address');
    } else {
      setError('');
    }
  };

  return (
    <div className="w-full max-w-md space-y-4">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => {
            setEmail(e.target.value);
            validateEmail(e.target.value);
          }}
          onBlur={e => validateEmail(e.target.value)}
          className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }`}
          placeholder="Enter your email"
          aria-invalid={!!error}
          aria-describedby={error ? 'email-error' : undefined}
        />

        {error && (
          <div id="email-error" className="mt-1">
            <LiveRegion message={error} type="polite" visible={true} clearAfter={0} />
          </div>
        )}
      </div>
    </div>
  );
};

export const FormValidation: Story = {
  args: {
    message: 'Form validation demo',
  },
  render: () => <FormValidationComponent />,
  parameters: {
    docs: {
      description: {
        story:
          'Example of using LiveRegion for form validation errors that are announced to screen readers.',
      },
    },
  },
};

const StatusUpdatesComponent = () => {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const simulateAction = async (action: string) => {
    setIsLoading(true);
    setStatus(`${action} in progress...`);

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsLoading(false);
    setStatus(`${action} completed successfully`);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => simulateAction('Saving')}
          disabled={isLoading}
          className="rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Document'}
        </button>

        <button
          onClick={() => simulateAction('Uploading')}
          disabled={isLoading}
          className="rounded bg-green-500 px-4 py-2 text-white disabled:opacity-50"
        >
          {isLoading ? 'Uploading...' : 'Upload File'}
        </button>

        <button
          onClick={() => simulateAction('Deleting')}
          disabled={isLoading}
          className="rounded bg-red-500 px-4 py-2 text-white disabled:opacity-50"
        >
          {isLoading ? 'Deleting...' : 'Delete Item'}
        </button>
      </div>

      <LiveRegion message={status} type="polite" visible={true} clearAfter={3000} />
    </div>
  );
};

export const StatusUpdates: Story = {
  args: {
    message: 'Status updates demo',
  },
  render: () => <StatusUpdatesComponent />,
  parameters: {
    docs: {
      description: {
        story: 'Example of using LiveRegion for status updates during async operations.',
      },
    },
  },
};

const AlertMessagesComponent = () => {
  const [alerts, setAlerts] = useState<
    Array<{ id: number; message: string; type: 'success' | 'error' | 'warning' }>
  >([]);

  const addAlert = (message: string, type: 'success' | 'error' | 'warning') => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, message, type }]);

    // Remove alert after 5 seconds
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 5000);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => addAlert('Operation completed successfully!', 'success')}
          className="rounded bg-green-500 px-4 py-2 text-white"
        >
          Success Alert
        </button>

        <button
          onClick={() => addAlert('An error occurred. Please try again.', 'error')}
          className="rounded bg-red-500 px-4 py-2 text-white"
        >
          Error Alert
        </button>

        <button
          onClick={() => addAlert('Please review your information before proceeding.', 'warning')}
          className="rounded bg-orange-500 px-4 py-2 text-white"
        >
          Warning Alert
        </button>
      </div>

      <div className="space-y-2">
        {alerts.map(alert => (
          <div key={alert.id}>
            <LiveRegion
              message={alert.message}
              type={alert.type === 'error' ? 'assertive' : 'polite'}
              visible={true}
              clearAfter={0}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export const AlertMessages: Story = {
  args: {
    message: 'Alert messages demo',
  },
  render: () => <AlertMessagesComponent />,
  parameters: {
    docs: {
      description: {
        story:
          'Example of using LiveRegion for different types of alert messages with appropriate urgency levels.',
      },
    },
  },
};

const SearchResultsComponent = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [resultMessage, setResultMessage] = useState('');

  // Mock data
  const mockData = [
    'Apple',
    'Banana',
    'Cherry',
    'Date',
    'Elderberry',
    'Fig',
    'Grape',
    'Honeydew',
    'Kiwi',
    'Lemon',
  ];

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setResultMessage('');
      return;
    }

    setIsSearching(true);
    setResultMessage('Searching...');

    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const filtered = mockData.filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()));

    setResults(filtered);
    setIsSearching(false);
    setResultMessage(
      `Found ${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${searchTerm}"`
    );
  };

  return (
    <div className="w-full max-w-md space-y-4">
      <div>
        <label htmlFor="search" className="mb-2 block text-sm font-medium text-gray-700">
          Search Fruits
        </label>
        <input
          id="search"
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            performSearch(e.target.value);
          }}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type to search..."
        />
      </div>

      <LiveRegion message={resultMessage} type="polite" visible={false} clearAfter={0} />

      {resultMessage && !isSearching && (
        <div className="text-sm text-gray-600">{resultMessage}</div>
      )}

      {results.length > 0 && (
        <ul className="divide-y rounded-md border">
          {results.map((result, index) => (
            <li key={index} className="px-3 py-2 hover:bg-gray-50">
              {result}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const SearchResults: Story = {
  args: {
    message: 'Search results demo',
  },
  render: () => <SearchResultsComponent />,
  parameters: {
    docs: {
      description: {
        story: 'Example of using LiveRegion to announce search results count to screen readers.',
      },
    },
  },
};

const MultipleRegionsComponent = () => {
  const [generalMessage, setGeneralMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setGeneralMessage('General information updated')}
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          General Update
        </button>

        <button
          onClick={() => setErrorMessage('Critical error occurred!')}
          className="rounded bg-red-500 px-4 py-2 text-white"
        >
          Trigger Error
        </button>

        <button
          onClick={() => setSuccessMessage('Task completed successfully')}
          className="rounded bg-green-500 px-4 py-2 text-white"
        >
          Success Action
        </button>
      </div>

      {/* General announcements */}
      <LiveRegion message={generalMessage} type="polite" visible={true} clearAfter={3000} />

      {/* Error announcements */}
      <LiveRegion message={errorMessage} type="assertive" visible={true} clearAfter={5000} />

      {/* Success announcements */}
      <LiveRegion message={successMessage} type="polite" visible={true} clearAfter={3000} />
    </div>
  );
};

export const MultipleRegions: Story = {
  args: {
    message: 'Multiple regions demo',
  },
  render: () => <MultipleRegionsComponent />,
  parameters: {
    docs: {
      description: {
        story:
          'Example of using multiple LiveRegions for different types of announcements with different urgency levels.',
      },
    },
  },
};
