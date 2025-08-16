import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import ErrorBoundary from './ErrorBoundary';

const meta = {
  title: 'Providers/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A React error boundary component that catches JavaScript errors anywhere in the child component tree, logs those errors, and displays a fallback UI instead of crashing the entire application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: false,
      description: 'Child components to render within the error boundary',
    },
    fallback: {
      control: false,
      description: 'Optional custom fallback component to display when an error occurs',
    },
  },
} satisfies Meta<typeof ErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

// Component that throws an error
const BrokenComponent = ({ shouldError }: { shouldError: boolean }) => {
  if (shouldError) {
    throw new Error('This is a simulated error from BrokenComponent!');
  }
  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold">Component is working fine!</h2>
      <p className="mt-2 text-gray-600">No errors here.</p>
    </div>
  );
};

// Component that throws async error
const AsyncBrokenComponent = ({ shouldError }: { shouldError: boolean }) => {
  React.useEffect(() => {
    if (shouldError) {
      setTimeout(() => {
        throw new Error('This is a simulated async error!');
      }, 1000);
    }
  }, [shouldError]);
  
  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold">Async Component</h2>
      <p className="mt-2 text-gray-600">Will throw an error after 1 second if triggered.</p>
    </div>
  );
};

// Custom fallback component
const CustomErrorFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-red-50">
      <div className="max-w-md space-y-4 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 text-red-500">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-800">Custom Error Handler</h2>
          <p className="mt-2 text-gray-600">We've encountered an issue with this component.</p>
        </div>
        
        <div className="rounded bg-red-100 p-3">
          <p className="text-sm text-red-700">{error.message}</p>
        </div>
        
        <button
          onClick={resetError}
          className="w-full rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Reset Component
        </button>
      </div>
    </div>
  );
};

// Basic Examples
export const WorkingComponent: Story = {
  render: () => (
    <ErrorBoundary>
      <BrokenComponent shouldError={false} />
    </ErrorBoundary>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Component working normally without errors.',
      },
    },
  },
};

export const ComponentWithError: Story = {
  render: () => (
    <ErrorBoundary>
      <BrokenComponent shouldError={true} />
    </ErrorBoundary>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Component that throws an error, caught by ErrorBoundary.',
      },
    },
  },
};

export const CustomFallback: Story = {
  render: () => (
    <ErrorBoundary fallback={CustomErrorFallback}>
      <BrokenComponent shouldError={true} />
    </ErrorBoundary>
  ),
  parameters: {
    docs: {
      description: {
        story: 'ErrorBoundary with custom fallback component.',
      },
    },
  },
};

// Interactive Example
export const Interactive: Story = {
  render: () => {
    const [shouldError, setShouldError] = useState(false);
    const [errorKey, setErrorKey] = useState(0);

    const reset = () => {
      setShouldError(false);
      setErrorKey(prev => prev + 1);
    };

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 rounded bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-bold">Error Boundary Controls</h3>
            <div className="flex gap-4">
              <button
                onClick={() => setShouldError(true)}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Trigger Error
              </button>
              <button
                onClick={reset}
                className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Reset Component
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Current State: {shouldError ? '⚠️ Error Triggered' : '✅ Working Normally'}
            </p>
          </div>

          <ErrorBoundary key={errorKey}>
            <BrokenComponent shouldError={shouldError} />
          </ErrorBoundary>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive example where you can trigger and reset errors.',
      },
    },
  },
};

// Multiple Children
export const MultipleChildren: Story = {
  render: () => {
    const [errors, setErrors] = useState({ comp1: false, comp2: false, comp3: false });

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 rounded bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-bold">Multiple Components in ErrorBoundary</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setErrors(prev => ({ ...prev, comp1: true }))}
                className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
              >
                Break Component 1
              </button>
              <button
                onClick={() => setErrors(prev => ({ ...prev, comp2: true }))}
                className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
              >
                Break Component 2
              </button>
              <button
                onClick={() => setErrors(prev => ({ ...prev, comp3: true }))}
                className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
              >
                Break Component 3
              </button>
              <button
                onClick={() => setErrors({ comp1: false, comp2: false, comp3: false })}
                className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
              >
                Reset All
              </button>
            </div>
          </div>

          <ErrorBoundary>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded bg-white p-4 shadow">
                <h4 className="font-bold">Component 1</h4>
                <BrokenComponent shouldError={errors.comp1} />
              </div>
              <div className="rounded bg-white p-4 shadow">
                <h4 className="font-bold">Component 2</h4>
                <BrokenComponent shouldError={errors.comp2} />
              </div>
              <div className="rounded bg-white p-4 shadow">
                <h4 className="font-bold">Component 3</h4>
                <BrokenComponent shouldError={errors.comp3} />
              </div>
            </div>
          </ErrorBoundary>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'ErrorBoundary protecting multiple child components. If any child throws an error, all are replaced with the fallback UI.',
      },
    },
  },
};

// Nested Error Boundaries
export const NestedErrorBoundaries: Story = {
  render: () => {
    const [errors, setErrors] = useState({ outer: false, inner1: false, inner2: false });

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 rounded bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-bold">Nested Error Boundaries</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setErrors(prev => ({ ...prev, outer: true }))}
                className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
              >
                Break Outer
              </button>
              <button
                onClick={() => setErrors(prev => ({ ...prev, inner1: true }))}
                className="rounded bg-orange-600 px-3 py-1 text-sm text-white hover:bg-orange-700"
              >
                Break Inner 1
              </button>
              <button
                onClick={() => setErrors(prev => ({ ...prev, inner2: true }))}
                className="rounded bg-yellow-600 px-3 py-1 text-sm text-white hover:bg-yellow-700"
              >
                Break Inner 2
              </button>
              <button
                onClick={() => setErrors({ outer: false, inner1: false, inner2: false })}
                className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
              >
                Reset All
              </button>
            </div>
          </div>

          <ErrorBoundary>
            <div className="rounded border-4 border-red-200 p-8">
              <h4 className="mb-4 text-lg font-bold">Outer Boundary</h4>
              <BrokenComponent shouldError={errors.outer} />
              
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <ErrorBoundary>
                  <div className="rounded border-4 border-orange-200 p-4">
                    <h5 className="mb-2 font-bold">Inner Boundary 1</h5>
                    <BrokenComponent shouldError={errors.inner1} />
                  </div>
                </ErrorBoundary>
                
                <ErrorBoundary>
                  <div className="rounded border-4 border-yellow-200 p-4">
                    <h5 className="mb-2 font-bold">Inner Boundary 2</h5>
                    <BrokenComponent shouldError={errors.inner2} />
                  </div>
                </ErrorBoundary>
              </div>
            </div>
          </ErrorBoundary>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Nested error boundaries allow for more granular error handling. Inner boundaries catch errors first.',
      },
    },
  },
};

// Different Error Types
export const DifferentErrorTypes: Story = {
  render: () => {
    const [errorType, setErrorType] = useState<string>('none');

    const ErrorComponent = ({ type }: { type: string }) => {
      switch (type) {
        case 'reference':
          // @ts-ignore - Intentional error for demo
          return <div>{undefinedVariable}</div>;
        case 'type':
          // @ts-ignore - Intentional error for demo
          return <div>{null.property}</div>;
        case 'syntax':
          throw new SyntaxError('This is a syntax error!');
        case 'range':
          throw new RangeError('Number is out of range!');
        case 'custom':
          throw new Error('Custom application error!');
        default:
          return <div className="p-4">No error - component working fine!</div>;
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 rounded bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-bold">Different Error Types</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setErrorType('none')}
                className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
              >
                No Error
              </button>
              <button
                onClick={() => setErrorType('reference')}
                className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
              >
                Reference Error
              </button>
              <button
                onClick={() => setErrorType('type')}
                className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
              >
                Type Error
              </button>
              <button
                onClick={() => setErrorType('syntax')}
                className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
              >
                Syntax Error
              </button>
              <button
                onClick={() => setErrorType('range')}
                className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
              >
                Range Error
              </button>
              <button
                onClick={() => setErrorType('custom')}
                className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
              >
                Custom Error
              </button>
            </div>
          </div>

          <ErrorBoundary key={errorType}>
            <div className="rounded bg-white p-8 shadow">
              <ErrorComponent type={errorType} />
            </div>
          </ErrorBoundary>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'ErrorBoundary handling different types of JavaScript errors.',
      },
    },
  },
};

// Production vs Development
export const ProductionMode: Story = {
  render: () => (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="rounded bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-bold">Error Handling in Production</h3>
          <p className="text-gray-600">
            In production, error boundaries prevent the entire app from crashing and provide a user-friendly error message.
          </p>
        </div>

        <ErrorBoundary>
          <BrokenComponent shouldError={true} />
        </ErrorBoundary>

        <div className="rounded bg-blue-50 p-6">
          <h4 className="font-bold">Production Best Practices:</h4>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
            <li>Log errors to an error tracking service (e.g., Sentry)</li>
            <li>Show user-friendly error messages</li>
            <li>Provide a way to recover (reset button, homepage link)</li>
            <li>Don't expose sensitive error details</li>
            <li>Consider implementing multiple error boundaries for different app sections</li>
          </ul>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of error boundary behavior in production environment.',
      },
    },
  },
};

// Dark Mode
export const DarkMode: Story = {
  render: () => (
    <div className="dark min-h-screen bg-gray-900">
      <ErrorBoundary>
        <BrokenComponent shouldError={true} />
      </ErrorBoundary>
    </div>
  ),
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#1f2937' }],
    },
    docs: {
      description: {
        story: 'Error boundary fallback UI in dark mode.',
      },
    },
  },
};